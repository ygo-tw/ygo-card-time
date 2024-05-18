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

export type PriceInfo = {
  time: string;
  rarity: string;
  price_lowest: number | null;
  price_avg: number | null;
};

export class RutenService {
  private dataAccessService: DataAccessService;
  private priceCalculator: PriceCalculator;
  private startTime: Date;
  private priceTemplate = {
    time: null,
    rarity: '',
    price_lowest: 0,
    price_avg: 0,
  };

  constructor(
    dataAccessService: DataAccessService,
    priceCalculator: PriceCalculator
  ) {
    console.log(gradient.rainbow('Start Runten Service'));
    this.dataAccessService = dataAccessService;
    this.priceCalculator = priceCalculator;
    this.startTime = new Date();
    console.log(this.startTime);
  }

  public async getRutenPrice() {
    console.log(gradient.rainbow('Start Reptile Cards Information'));
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
        else console.warn(`Invalid price information for ${cardInfo.id}`);
      }
    }
  }

  /**
   * Checks if the price information contains any anomalies.
   * Anomalies include price_lowest or price_avg being null, 0, or Infinite.
   * @param priceInfo - The price information object to check.
   * @returns True if the price information is valid, otherwise false.
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
   * Fetches price information for a given rarity and search name.
   * @param rarity - The rarity of the card.
   * @param searchName - The search name for the card.
   * @param rarityLength - The length of the rarity array.
   * @param cardId - The ID of the card.
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
      console.warn(number, ': No product found');
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
      console.warn(number, ': Error fetching product data:', error);
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
      console.warn(number, ': No price found');
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
   * Filters the given list of prices based on various criteria such as currency, stock availability,
   * product name keywords, and price validity. Returns a list of valid prices.
   * @param prices - An array of RutenPriceDetailResponse objects containing price details.
   * @param number - The card number to be checked in the product name.
   * @param rarity - The rarity of the card.
   * @param searchName - The search name for the card.
   * @returns An array of valid prices.
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

    console.log(priceList);

    return priceList;
  }

  /**
   * Generates keywords for the search based on rarity.
   * @param rarity - The rarity of the card.
   * @param rarityLength - The length of the rarity array.
   * @returns A keyword string.
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

    // 默认处理
    return '+' + rarity;
  }

  /**
   * Pre-processes card information to generate search names and unique rarities.
   * @param cardInfo - The card information.
   * @param idx - The index of the card.
   * @returns An object containing the search name and rarity array.
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
