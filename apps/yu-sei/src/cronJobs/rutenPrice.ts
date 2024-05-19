import gradient from 'gradient-string';
import { DataAccessService } from '@ygo/mongo-server';
import { createSpinner } from 'nanospinner';
import chalk from 'chalk';
import { delay, PriceCalculator } from '../utils';
import dayjs from 'dayjs';
import {
  CardsDataType,
  RutenShipListResponse,
  RutenPriceDetailResponse,
} from '@ygo/schemas';
import lodash from 'lodash';
import axios from 'axios';
import { createLogger, format, transports, Logger } from 'winston';

export type PriceInfo = {
  time: string;
  rarity: string;
  price_lowest: number | null;
  price_avg: number | null;
};

export class RutenService {
  private dataAccessService: DataAccessService;
  private priceCalculator: PriceCalculator;
  private logger: Logger;
  private startTime: Date;
  private priceTemplate = {
    time: null,
    rarity: '',
    price_lowest: 0,
    price_avg: 0,
  };

  constructor(
    dataAccessService: DataAccessService,
    priceCalculator: PriceCalculator,
    logger?: Logger
  ) {
    this.dataAccessService = dataAccessService;
    this.priceCalculator = priceCalculator;
    this.startTime = new Date();
    this.logger =
      logger ||
      createLogger({
        level: 'info',
        format: format.combine(
          format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          format.printf(info => {
            const message = `${info.timestamp} [${info.level}]: ${info.message}`;
            return info.level === 'info' ? gradient.rainbow(message) : message;
          })
        ),
        transports: [
          new transports.Console(),
          new transports.File({
            filename: `../../log/rutenCrawlerPrice/combined_${this.startTime.toDateString()}.log`,
          }),
        ],
        exceptionHandlers: [
          new transports.File({
            filename: `../../log/rutenCrawlerPrice/exceptions_${this.startTime.toDateString()}.log`,
          }),
        ],
        exitOnError: false, // 設置為 false 以防止例外退出
      });
    this.logger.info('Start Runten Service');
  }

  public async getRutenPrice() {
    this.logger.info('Start Reptile Cards Information');
    const cardsInfo = await this.dataAccessService.find<CardsDataType>(
      'cards',
      {
        'price_info.time': {
          $not: new RegExp(dayjs().format('YYYY-MM-DD')),
        },
        // id: "PAC1-JP004",
      },
      {},
      { id: 1, rarity: 1, _id: 0, number: 1 }
    );

    const noPriceId = [];
    const updateFailedId = [];

    for (const [idx, cardInfo] of cardsInfo.entries()) {
      if (!cardInfo.id) continue;
      const { searchName, rarity } = await this.preProcessing(cardInfo, idx);
      if (rarity.find(el => el === '銀亮')) continue;
      const spinner = createSpinner();

      spinner.start({
        text: `Get Card Number : ${chalk.whiteBright.bgMagenta(cardInfo.id)}  Price Information`,
      });

      const allCardPrices: PriceInfo[] = [];

      for (const rar of rarity) {
        await delay(100);
        const priceInfo = await this.getPriceByRarity(
          rar,
          searchName,
          rarity.length,
          cardInfo.id
        );

        if (!this.isPriceInfoValid(priceInfo)) allCardPrices.push(priceInfo);
        else this.logger.warn(`Invalid price information for ${cardInfo.id}`);
      }

      const totalSpendTime = `Total Spend ${chalk.bgGray((new Date().getTime() - this.startTime.getTime()) / 1000)} sec`;

      const progressBar = ` ${(((idx + 1) / cardsInfo.length) * 1000000) / 10000}% `;

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
      }

      try {
        await this.dataAccessService.findAndUpdate<CardsDataType>(
          'cards',
          { id: cardInfo.id },
          { $push: { price: { $each: [100, 200, 300] } } }
        );
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
    }

    return {
      updateFailedId,
      noPriceId,
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
    number: string
  ) {
    const price = {
      ...lodash.cloneDeep(this.priceTemplate),
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      rarity,
    };
    const keyWords = this.keyWordsFactory(rarity, rarityLength);

    let searchURL = `http://rtapi.ruten.com.tw/api/search/v3/index.php/core/prod?q=${searchName}${keyWords}&type=direct&sort=prc%2Fac&offset=1&limit=100`;

    const targets = (
      (await axios.get(searchURL)).data as RutenShipListResponse
    ).Rows.map(el => el.Id);

    if (!targets.length) {
      this.logger.warn(number, ': No product found');
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
      this.logger.warn(number, ': Error fetching product data:', error);
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
      searchName
    );

    if (!priceList.length) {
      this.logger.warn(number, ': No price found');
      return {
        ...price,
        price_lowest: null,
        price_avg: null,
      };
    }

    const { averagePrice, minPrice } =
      this.priceCalculator.calculatePrices(priceList);

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
    searchName: string
  ) {
    const isTWD = (prices: RutenPriceDetailResponse) =>
      prices.Currency === 'TWD';
    const hasStock = (prices: RutenPriceDetailResponse) =>
      prices.StockQty > prices.SoldQty;
    const isNotFanMade = (prices: RutenPriceDetailResponse) =>
      !/同人|DIY/.test(prices.ProdName);
    const isNotBagOrMisc = (prices: RutenPriceDetailResponse) =>
      !/搜(?=[a-zA-Z])|搜:|防雷|請勿下標|福袋|卡磚|壓克力|單螺絲卡夾|全新未拆|參考|非 |非(?=[A-Za-z\s])/.test(
        prices.ProdName
      );
    const isNotUnopenedPack = (prices: RutenPriceDetailResponse) =>
      prices.ProdName.indexOf('未拆包') === -1;
    const isFixedPrice = (prices: RutenPriceDetailResponse) =>
      prices.PriceRange[0] === prices.PriceRange[1];
    const containsAllKeywords = (prodName: string, searchName: string) => {
      const keywords = searchName.split('+').filter(el => el);
      return keywords.every(keyword => prodName.includes(keyword));
    };
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

    if (rarity.length > 1) {
      prices = prices.filter(price =>
        containsAllKeywords(price.ProdName, searchName)
      );
    }

    const priceList = prices
      .filter(isFixedPrice)
      .map(product => product.PriceRange[1])
      .filter(isValidPrice);

    return priceList;
  }

  /**
   * 根據稀有度生成搜索關鍵字。
   * @param rarity - 卡片的稀有度。
   * @param rarityLength - 稀有度陣列的長度。
   * @returns 關鍵字字串。
   */
  private keyWordsFactory(rarity: string, rarityLength: number) {
    if (rarity === '普卡' && rarityLength === 1) return '';

    const exactReplacements: { [key: string]: string } = {
      方鑽: '+普卡',
      點鑽: '+普卡',
      凸版浮雕: '+浮雕',
      浮雕: '+浮雕',
      '20th紅鑽': '+紅鑽',
      紅鑽: '+紅鑽',
      '25th金鑽': '+金鑽',
      金鑽: '+金鑽',
      金亮KC紋: '+KC',
      KC紋: '+KC',
      普卡放射鑽: '+普卡放射鑽',
    };

    const indexReplacements: { [key: string]: string } = {
      異圖: '+異圖',
      字紋鑽: '+字紋鑽',
      粉鑽: '+粉鑽',
      彩鑽: '+彩鑽',
      古紋鑽: '+古紋鑽',
    };

    if (exactReplacements[rarity]) {
      return exactReplacements[rarity];
    }

    for (const key in indexReplacements) {
      if (rarity.indexOf(key) !== -1) {
        return indexReplacements[key];
      }
    }

    const complexRarities = ['方鑽', '點鑽', '碎鑽'];
    for (const complexRarity of complexRarities) {
      if (rarity.indexOf(complexRarity) !== -1) {
        const replacedRar = rarity.replace(complexRarity, '');
        return ['普卡', '銀字', '隱普'].includes(replacedRar)
          ? ''
          : `+${complexRarity}+${replacedRar}`;
      }
    }

    return '+' + rarity;
  }

  /**
   * 對卡片資訊進行預處理以生成搜尋名稱和唯一稀有度。
   * @param cardInfo - 卡片資訊。
   * @param idx - 卡片的索引。
   * @returns 包含搜尋名稱和稀有度陣列的物件。
   */
  private async preProcessing(cardInfo: CardsDataType, idx: number) {
    if (idx && !(idx % 300)) await delay(800);
    const searchName =
      cardInfo.id.indexOf(' ') === -1
        ? cardInfo.id
        : cardInfo.id.split(' ')[0] + '+' + cardInfo.id.split(' ')[1];
    const rarity = [...new Set(cardInfo.rarity)];

    return { searchName, rarity };
  }
}
