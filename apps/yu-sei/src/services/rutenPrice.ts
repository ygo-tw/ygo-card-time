import { DataAccessService } from '@ygo/mongo-server';
import { createSpinner } from 'nanospinner';
import chalk from 'chalk';
import {
  delay,
  PriceCalculator,
  CustomLogger,
  notHasPriceInfo,
} from '../utils';
import dayjs from 'dayjs';
import {
  CardsDataType,
  RutenShipListResponse,
  RutenPriceDetailResponse,
  DataAccessEnum,
} from '@ygo/schemas';
import lodash from 'lodash';
import axios from 'axios';
import {
  isIllegalProductChar,
  isFanMode,
  isUnopenedPackProduct,
  keyWordsFactory,
  containsAllKeywords,
  notContainsAnotherRarity,
} from '@ygo/ruten-apis';

export type PriceInfo = {
  time: string;
  rarity: string;
  price_lowest: number | null;
  price_avg: number | null;
};

// 對於露天相關爬蟲
export class RutenService {
  private dataAccessService: DataAccessService;
  private logger: CustomLogger;
  private startTime: Date;
  private priceTemplate = {
    time: null,
    rarity: '',
    price_lowest: 0,
    price_avg: 0,
  };

  constructor(dataAccessService: DataAccessService, logger: CustomLogger) {
    this.dataAccessService = dataAccessService;
    this.startTime = new Date();

    this.logger = logger;
    this.logger.info('Start Runten Service');
  }

  /**
   * 爬取露天拍賣卡片價格的異步方法
   *
   * @param {CardsDataType[]} [cards] - 可選的卡片資料陣列，若未提供，將從資料庫中查詢符合條件的卡片資料
   * @returns {Promise<{ updateFailedId: string[], noPriceId: string[] }>} 包含更新失敗和沒有價格資料的卡片ID陣列
   */
  public async getRutenPrice(cards?: CardsDataType[]): Promise<{
    updateFailedId: string[];
    noPriceId: string[];
    successIds: string[];
  }> {
    this.logger.info('Start Reptile Cards Information');
    const cardsInfo =
      cards ??
      (await this.dataAccessService.find<CardsDataType>(
        DataAccessEnum.CARDS,
        {
          'price_info.time': {
            $not: new RegExp(dayjs().format('YYYY-MM-DD')),
          },
          id: {
            $nin: notHasPriceInfo,
          },
          // id: 'PAC1-JP004',
        },
        { id: 1, rarity: 1, _id: 0, number: 1 },
        {}
      ));
    const noPriceId = [];
    const updateFailedId = [];
    const successIds = [];

    for (const [idx, cardInfo] of cardsInfo.entries()) {
      if (!cardInfo.id) continue;
      const { searchName, rarity } = await this.preProcessing(cardInfo, idx);
      if (rarity.find(el => el === '銀亮')) continue;
      const spinner = createSpinner();

      spinner.start({
        text: `Get Card Number : ${chalk.whiteBright.bgMagenta(cardInfo.id)}  Price Information`,
      });
      await delay(300);

      const allCardPrices: PriceInfo[] = [];

      for (const rar of rarity) {
        try {
          const priceInfo = await this.getPriceByRarity(
            rar,
            searchName,
            rarity.length,
            cardInfo.id,
            rarity
          );

          if (!this.isPriceInfoValid(priceInfo)) allCardPrices.push(priceInfo);
        } catch (error) {
          this.logger.error(`Error for ${cardInfo.id} : ${error}`);
        }
      }

      const totalSpendTime = `Total Spend ${chalk.bgGray((new Date().getTime() - this.startTime.getTime()) / 1000)} sec`;

      const progressBar = ` ${Math.floor(((idx + 1) / cardsInfo.length) * 100)}% `;

      if (!allCardPrices.length) {
        spinner
          .error({
            text: `Card Number : ${chalk.white.bgRed(
              `${cardInfo.id} no price information! Current progress [${idx + 1}/${
                cardsInfo.length
              }] ${chalk.blue(progressBar)} ${totalSpendTime} `
            )}`,
          })
          .clear();
        noPriceId.push(cardInfo.id);
      } else {
        try {
          await this.dataAccessService.findAndUpdate<CardsDataType>(
            DataAccessEnum.CARDS,
            { id: cardInfo.id, number: cardInfo.number },
            { $push: { price_info: { $each: allCardPrices } } }
          );

          successIds.push(cardInfo.id);
          const successWords = allCardPrices
            .slice(allCardPrices.length - rarity.length, allCardPrices.length)
            .map(el => `${el.rarity}-${el.price_lowest}-${el.price_avg}`)
            .join(' / ');

          spinner
            .success({
              text: `Get Card ${chalk.whiteBright.bgGreen(
                ` ${cardInfo.id}`
              )} Price Success! (${successWords}) Current progress [${idx + 1}/${
                cardsInfo.length
              }] ${chalk.blue(progressBar)} ${totalSpendTime} `,
            })
            .clear();
        } catch (error) {
          spinner
            .error({
              text: `Card Number : ${chalk.white.bgCyanBright(
                `${cardInfo.id} upload Failed!`
              )} Current progress [${idx + 1}/${cardsInfo.length}] ${chalk.blue(
                progressBar
              )} ${totalSpendTime}`,
            })
            .clear();

          updateFailedId.push(cardInfo.id);
        }
      }
    }

    return {
      updateFailedId,
      noPriceId,
      successIds,
    };
  }

  /**
   * 檢查價格資訊是否包含任何異常。
   * 異常包括 price_lowest 或 price_avg 為 null、0 或無限。
   * @param priceInfo - 要檢查的價格資訊物件。
   * @returns 如果價格資訊有效，則返回 true，否則返回 false。
   */
  private isPriceInfoValid(priceInfo: PriceInfo) {
    const { price_lowest, price_avg } = priceInfo;

    const isInvalidPrice = (price: number | null) =>
      price === null || price === 0 || !Number.isFinite(price);

    const invalidKeys: string[] = [];

    if (isInvalidPrice(price_lowest)) {
      invalidKeys.push('price_lowest');
    }

    if (isInvalidPrice(price_avg)) {
      invalidKeys.push('price_avg');
    }

    return invalidKeys.length > 0 ? invalidKeys : null;
  }

  /**
   * 根據稀有度和搜尋名稱獲取價格資訊。
   * @param rarity - 卡片的稀有度。
   * @param searchName - 卡片的搜尋名稱。
   * @param rarityLength - 稀有度陣列的長度。
   * @param cardId - 卡片的ID。
   * @returns PriceInfo object containing the lowest and average price.
   */
  private async getPriceByRarity(
    rarity: string,
    searchName: string,
    rarityLength: number,
    number: string,
    rarityList: string[]
  ) {
    const price = {
      ...lodash.cloneDeep(this.priceTemplate),
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      rarity,
    };
    const keyWords = keyWordsFactory(rarity, rarityLength);

    let searchURL = `http://rtapi.ruten.com.tw/api/search/v3/index.php/core/prod?q=${searchName}${keyWords}&type=direct&sort=prc%2Fac&offset=1&limit=100`;

    const targets = (
      (await axios.get(searchURL)).data as RutenShipListResponse
    ).Rows.map(el => el.Id);

    if (!targets.length) {
      // this.logger.warn(number, ': No product found');
      return {
        ...price,
        price_lowest: null,
        price_avg: null,
      };
    }

    searchURL = `http://rtapi.ruten.com.tw/api/prod/v2/index.php/prod?id=${targets.join(
      ','
    )}`;

    let prices: RutenPriceDetailResponse[] = [];
    try {
      prices = (await axios.get(searchURL)).data;
    } catch (error) {
      this.logger.warn(
        number,
        ': Error fetching product data:',
        error as unknown as string
      );
      return {
        ...price,
        price_lowest: null,
        price_avg: null,
      };
    }

    const priceList = this.extractValidPrices(
      prices,
      number,
      rarity,
      searchName,
      rarityList
    );

    if (!priceList.length) {
      // this.logger.warn(number, ': No price found');
      return {
        ...price,
        price_lowest: null,
        price_avg: null,
      };
    }

    const { averagePrice, minPrice } =
      PriceCalculator.calculatePrices(priceList);

    return {
      ...price,
      price_lowest: minPrice,
      price_avg: averagePrice,
    };
  }

  /**
   * 根據各種標準過濾價格清單，例如貨幣、庫存可用性、產品名稱關鍵字和價格有效性。
   * 返回有效價格列表。
   * @param prices - 包含價格詳情的 RutenPriceDetailResponse 物件陣列。
   * @param number - 要在產品名稱中檢查的卡片編號。
   * @param rarity - 卡片的稀有度。
   * @param searchName - 卡片的搜尋名稱。
   * @returns 有效價格的陣列。
   */
  private extractValidPrices(
    prices: RutenPriceDetailResponse[],
    number: string,
    rarity: string,
    searchName: string,
    rarityList: string[]
  ) {
    const isTWD = (prices: RutenPriceDetailResponse) =>
      prices.Currency === 'TWD';
    const hasStock = (prices: RutenPriceDetailResponse) =>
      prices.StockQty > prices.SoldQty;
    const isNotFanMade = (prices: RutenPriceDetailResponse) =>
      isFanMode(prices.ProdName);
    const isNotBagOrMisc = (prices: RutenPriceDetailResponse) =>
      isIllegalProductChar(prices.ProdName);
    const isNotUnopenedPack = (prices: RutenPriceDetailResponse) =>
      isUnopenedPackProduct(prices.ProdName);
    const isFixedPrice = (prices: RutenPriceDetailResponse) =>
      prices.PriceRange[0] === prices.PriceRange[1];

    const isValidPrice = (price: number) =>
      Number.isInteger(price) &&
      price < 100000 &&
      price !== 9999 &&
      price !== 99999;

    prices = prices
      .filter(isTWD)
      .filter(hasStock)
      .filter(isNotFanMade)
      .filter(isNotBagOrMisc)
      .filter(isNotUnopenedPack)
      .filter(product =>
        number.indexOf(' ') === -1
          ? product.ProdName.indexOf(number) !== -1
          : true
      );
    prices = prices.filter(price =>
      containsAllKeywords(price.ProdName, searchName)
    );

    if (rarityList.length > 1) {
      rarityList
        .filter(r => r !== rarity)
        .reduce(
          (filteredPrices, r) =>
            filteredPrices.filter(price =>
              notContainsAnotherRarity(price.ProdName, r, rarityList.length)
            ),
          prices
        );
    }

    const priceList = prices
      .filter(isFixedPrice)
      .map(product => product.PriceRange[1])
      .filter(isValidPrice);

    return priceList;
  }

  /**
   * 對卡片資訊進行預處理以生成搜尋名稱和唯一稀有度。
   * @param cardInfo - 卡片資訊。
   * @param idx - 卡片的索引。
   * @returns 包含搜尋名稱和稀有度陣列的物件。
   */
  private async preProcessing(cardInfo: CardsDataType, idx: number) {
    if (idx && !(idx % 50)) await delay(800);
    const searchName =
      cardInfo.id.indexOf(' ') === -1
        ? cardInfo.id
        : cardInfo.id.split(' ')[0] + '+' + cardInfo.id.split(' ')[1];
    const rarity = [...new Set(cardInfo.rarity)];

    return { searchName, rarity };
  }
}
