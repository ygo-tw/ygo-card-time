import { ProductRequest, Shop } from './bestPlanByRutenService';
import { DataAccessService } from '@ygo/mongo-server';
import {
  CardsDataType,
  DataAccessEnum,
  RutenShipListResponse,
  RutenProductDetailListResponse,
  RutenStoreDetailResponse,
  ShipInfoResponse,
} from '@ygo/schemas';
import {
  isIllegalProductChar,
  isFanMode,
  isUnopenedPackProduct,
  containsAllKeywords,
  notContainsAnotherRarity,
} from '../utils';
import axios from 'axios';

export enum RutenApisType {
  PROD_LIST = 'product_list',
  PROD_DETAIL_LIST = 'product_detail_list',
  SHOP_SHIP_INFO = 'shop_ship_info',
  SHOP_PROD_LIST = 'shop_product_list',
  SHOP_INFO = 'shop_info',
}

export enum RutenShipsType {
  SEVEN = 'SEVEN',
  FAMILY = 'FAMI',
  HILIFE = 'HILIFE',
}

type SopIdList = {
  name: string;
  id: string;
};

type ProdListKeyWords = {
  queryString: string;
};

type ProdDetailListKeyWords = {
  productId: string;
};

type ShopShipInfoKeyWords = {
  shopId: string;
};

type ShopProdListKeyWords = {
  shopId: string;
  limit: number;
  targetProduct: string;
};

interface ProductRequestExtended extends ProductRequest {
  rarities: string[];
  card_id: string;
  card_number: string;
  card_name: string;
}

export type ApiKeyWordsMap = {
  [RutenApisType.PROD_LIST]: ProdListKeyWords;
  [RutenApisType.PROD_DETAIL_LIST]: ProdDetailListKeyWords;
  [RutenApisType.SHOP_SHIP_INFO]: ShopShipInfoKeyWords;
  [RutenApisType.SHOP_PROD_LIST]: ShopProdListKeyWords;
  [RutenApisType.SHOP_INFO]: ShopShipInfoKeyWords;
};

/**
 * 延遲指定時間的函數
 * @param {number} time - 延遲的時間（毫秒）
 * @returns {Promise<void>} - 延遲的 Promise
 */
const delay = async (time: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
};

/**
 * Ruten 購物清單服務類
 */
export class GetShopListByRutenService {
  private shoppingList: ProductRequest[];
  private shoppingListExtended: ProductRequestExtended[] = [];
  private dataAccessService: DataAccessService;
  private shopList: Shop[] = [];
  private errorHandler: any[] = [];

  /**
   * @constructor
   * @param {ProductRequest[]} shoppingList - 購物清單
   * @param {DataAccessService} dataAccessService - 資料存取服務
   */
  private constructor(
    shoppingList: ProductRequest[],
    dataAccessService: DataAccessService
  ) {
    this.shoppingList = shoppingList.map(x => ({
      ...x,
      count: Math.min(x.count, 3),
    }));
    this.dataAccessService = dataAccessService;
  }

  /**
   * 獲取商店列表的靜態方法
   * @param {ProductRequest[]} shoppingList - 購物清單
   * @param {DataAccessService} dataAccessService - 資料存取服務
   * @returns {Promise<Shop[]>} - 商店列表
   */
  public static async getShopList(
    shoppingList: ProductRequest[],
    dataAccessService: DataAccessService
  ): Promise<Shop[]> {
    const instance = new GetShopListByRutenService(
      shoppingList,
      dataAccessService
    );
    return await instance.findShopList();
  }

  /**
   * 查找商店列表的方法
   * @returns {Promise<Shop[]>} - 商店列表
   */
  private async findShopList(): Promise<Shop[]> {
    // 取得所有商品的版本 => 用於篩選價格使用
    try {
      await this.getProductRequestExtended();
    } catch (error) {
      this.errorHandler.push(error);
    }

    // 找出所有店家的商品列表
    for (const prod of this.shoppingListExtended) {
      try {
        const prodList = await this.findProductList(prod);
        for (const prodDetail of prodList) {
          this.addOrUpdateShop(prod, prodDetail);
        }
      } catch (error) {
        this.errorHandler.push(error);
      }
    }

    // 取得所有店家是否有其他想購買的商品
    const shopIdList = this.shopList.map(x => ({ name: x.id, id: '' }));
    await this.findShopHasAnotherProduct(shopIdList);

    // 取得所有店家的運費資訊
    await this.findShipsInfo();

    return this.shopList;
  }

  /**
   * 添加或更新商店
   * @param {ProductRequestExtended} prod - 擴展的產品請求
   * @param {any} prodDetail - 產品詳細資訊
   */
  private addOrUpdateShop(prod: ProductRequestExtended, prodDetail: any) {
    const idx = this.shopList.findIndex(x => x.id === prodDetail.shopId);
    if (idx === -1) {
      this.shopList.push({
        id: prodDetail.shopId,
        products: {
          [prod.productName]: {
            id: prodDetail.id,
            price: prodDetail.price,
            qtl: prodDetail.qtl,
          },
        },
        shipPrices: this.extractShipPrices(prodDetail.deliver_way),
        freeShip: {},
      });
    } else {
      this.shopList[idx].products[prod.productName] = {
        id: prodDetail.id,
        price: prodDetail.price,
        qtl: prodDetail.qtl,
      };
    }
  }

  /**
   * 提取運費信息
   * @param {{[key: string]: number}} deliverWay - 配送方式
   * @returns {Record<string, number>} - 運費信息
   */
  private extractShipPrices(deliverWay: {
    [key: string]: number;
  }): Record<string, number> {
    const shipPrices: Record<string, number> = {};
    for (const way in deliverWay) {
      if (/(SEVEN|FAMI|HILIFE)/.test(way)) {
        const key = way.replace('_COD', '').replace('FAMI', 'FAMILY');
        shipPrices[key] = deliverWay[way] as number;
      }
    }
    return shipPrices;
  }

  /**
   * 獲取所有商店的運費信息
   * @returns {Promise<void>}
   */
  private async findShipsInfo(): Promise<void> {
    const setDefaultFreeShip = (shopIdx: number) => {
      this.shopList[shopIdx].freeShip = {
        [Object.keys(this.shopList[shopIdx].shipPrices)[0]]: 99999,
      };
    };

    const getShipInfo = async (shop: Shop, idx: number) => {
      try {
        const shopShipInfoUrl = GetShopListByRutenService.getRutenApis(
          RutenApisType.SHOP_SHIP_INFO,
          { shopId: shop.id }
        );
        const shopShipInfoRes = (await axios.get(shopShipInfoUrl))
          .data as ShipInfoResponse;
        const shopShipInfo = shopShipInfoRes.data;

        const freeShipTypes = Object.keys(shopShipInfo.discount_conditions);
        this.shopList[idx].freeShip = {};

        for (const freeShipType of freeShipTypes) {
          if (/SEVEN|FAMILY|HILIFE/.test(freeShipType)) {
            this.shopList[idx].freeShip[freeShipType] =
              shopShipInfo.discount_conditions[freeShipType].arrival_amount;
          }
        }

        if (Object.keys(this.shopList[idx].freeShip).length === 0)
          setDefaultFreeShip(idx);
      } catch (error) {
        this.errorHandler.push(`Error while getting ships info for ${shop.id}`);
        setDefaultFreeShip(idx);
      }
    };

    await Promise.allSettled(
      this.shopList.map((shop, idx) => getShipInfo(shop, idx))
    );
  }

  /**
   * 查找商店是否擁有其他產品的方法
   * @param {SopIdList[]} shopIdList - 商店 ID 列表
   * @returns {Promise<void>}
   */
  private async findShopHasAnotherProduct(
    shopIdList: SopIdList[]
  ): Promise<void> {
    for (const [idx, shop] of shopIdList.entries()) {
      await delay(150);
      // 取得店家 id
      try {
        shopIdList[idx].id = await this.getShopId(shop.name);
      } catch (error) {
        this.errorHandler.push(error);
        continue;
      }

      const shopHasProdList = Object.keys(
        this.shopList.find(x => x.id === shop.name)?.products || {}
      );
      const targetProduct = this.shoppingList
        .map(x => x.productName)
        .filter(x => !shopHasProdList.includes(x));
      if (targetProduct.length === 0) continue;

      // 取得其他商品資訊
      for (const prod of targetProduct) {
        try {
          const prodDetail = await this.getShopOtherProductInfo(
            shopIdList[idx].id,
            prod
          );
          if (prodDetail.id === '') continue;
          this.shopList[idx].products[prod] = prodDetail;
        } catch (error) {
          this.errorHandler.push(error);
        }
      }
    }
  }

  /**
   * 獲取商店 ID
   * @param {string} shopName - 商店名稱
   * @returns {Promise<string>} - 商店 ID
   */
  private async getShopId(shopName: string): Promise<string> {
    try {
      const shopInfoApiUrl = GetShopListByRutenService.getRutenApis(
        RutenApisType.SHOP_INFO,
        { shopId: shopName }
      );

      const shopInfoRes = (
        (await axios.get(shopInfoApiUrl)).data as RutenStoreDetailResponse
      ).data;

      return shopInfoRes.user_id;
    } catch (error) {
      throw new Error(`Error while getting product list for ${shopName}`);
    }
  }

  /**
   * 獲取商店其他產品資訊
   * @param {string} shopId - 商店 ID
   * @param {string} targetProduct - 目標產品
   * @returns {Promise<{ id: string; price: number; qtl: number }>} - 產品詳細資訊
   */
  private async getShopOtherProductInfo(
    shopId: string,
    targetProduct: string
  ): Promise<{ id: string; price: number; qtl: number }> {
    try {
      const shopProdListUrl = GetShopListByRutenService.getRutenApis(
        RutenApisType.SHOP_PROD_LIST,
        {
          shopId,
          limit: 50,
          targetProduct,
        }
      );

      const prodInfoRes = (
        (await axios.get(shopProdListUrl)).data as RutenShipListResponse
      ).Rows;
      if (prodInfoRes.length === 0 || !prodInfoRes[0].Id)
        return {
          id: '',
          price: 0,
          qtl: 0,
        };

      const prod_id = prodInfoRes[0].Id;

      const prodDetailUrl = GetShopListByRutenService.getRutenApis(
        RutenApisType.PROD_DETAIL_LIST,
        { productId: prod_id }
      );
      const prodDetailRes = (
        (await axios.get(prodDetailUrl)).data as RutenProductDetailListResponse
      ).data[0];

      return {
        id: prodDetailRes.id,
        price: prodDetailRes.goods_price,
        qtl: prodDetailRes.num,
      };
    } catch (error) {
      throw new Error(
        `Error while getting other product info for ${shopId} ${targetProduct}`
      );
    }
  }

  /**
   * 查找產品列表的方法
   * @param {ProductRequestExtended} prod - 擴展的產品請求
   * @returns {Promise<{ price: number; qtl: number; id: string; shopId: string; deliver_way: any }[]>} - 產品列表
   */
  private async findProductList(prod: ProductRequestExtended): Promise<
    {
      price: number;
      qtl: number;
      id: string;
      shopId: string;
      deliver_way: any;
    }[]
  > {
    try {
      // 取得商品列表
      const prodListApiUrl = GetShopListByRutenService.getRutenApis(
        RutenApisType.PROD_LIST,
        { queryString: prod.productName }
      );
      const prodListRes = (
        (await axios.get(prodListApiUrl)).data as RutenShipListResponse
      ).Rows.map(x => x.Id);
      if (prodListRes.length === 0) return [];

      // 取得商品詳細資訊
      const prodDetailListApiUrl = GetShopListByRutenService.getRutenApis(
        RutenApisType.PROD_DETAIL_LIST,
        { productId: prodListRes.join(',') }
      );
      const prodDetailListRes = this.filterProdDetail(
        (await axios.get(prodDetailListApiUrl))
          .data as RutenProductDetailListResponse,
        prod.productName
      );

      return prodDetailListRes;
    } catch (error) {
      throw new Error(
        `Error while getting product list for ${prod.productName}`
      );
    }
  }

  /**
   * 過濾產品詳細資訊
   * @param {RutenProductDetailListResponse} prodDetailListRes - 產品詳細資訊回應
   * @param {string} productName - 產品名稱
   * @returns {{ price: number; qtl: number; id: string; shopId: string; deliver_way: any }[]} - 過濾後的產品列表
   */
  private filterProdDetail(
    prodDetailListRes: RutenProductDetailListResponse,
    productName: string
  ): {
    price: number;
    qtl: number;
    id: string;
    shopId: string;
    deliver_way: any;
  }[] {
    const rarities = this.shoppingListExtended.find(
      x => x.productName === productName
    )?.rarities as string[];
    const nowRarity = productName.split('+')[1];

    let list = prodDetailListRes.data;
    list = list
      .filter(x => containsAllKeywords(x.name, productName))
      .filter(x => isIllegalProductChar(x.name))
      .filter(x => isFanMode(x.name))
      .filter(x => isUnopenedPackProduct(x.name));

    if (rarities && nowRarity && rarities.length > 0) {
      rarities
        .filter(x => x !== nowRarity)
        .reduce(
          (prodList, r) =>
            prodList.filter(price =>
              notContainsAnotherRarity(price.name, r, rarities.length)
            ),
          list
        );
    }

    return list
      .map(x => ({
        price: x.goods_price,
        qtl: x.num,
        id: x.id,
        shopId: x.user,
        deliver_way: x.deliver_way,
      }))
      .slice(0, 10);
  }

  /**
   * 獲取擴展的產品請求
   * @returns {Promise<void>}
   */
  private async getProductRequestExtended(): Promise<void> {
    this.shoppingListExtended = this.shoppingList.map(x => ({
      ...x,
      rarities: [],
      card_id: x.productName.split('+')[0],
      card_name: '',
      card_number: '',
    }));
    for (const [p, prod] of this.shoppingListExtended.entries()) {
      const rarity = prod.productName.split('+')[1];
      const cardData = (
        await this.dataAccessService.find<CardsDataType>(
          DataAccessEnum.CARDS,
          {
            id: prod.card_id,
            rarity: {
              $elemMatch: { $regex: rarity, $options: 'i' },
            },
          },
          { rarity: 1, name: 1, number: 1, _id: 0 }
        )
      )[0];

      if (!cardData)
        throw new Error(`Card data not found for ${prod.card_id} ${rarity}`);

      this.shoppingListExtended[p] = {
        ...this.shoppingListExtended[p],
        card_name: cardData.name,
        card_number: cardData.number as string,
        rarities: cardData.rarity,
      };
    }
  }

  /**
   * 獲取 Ruten API 的 URL
   * @param {RutenApisType} type - API 類型
   * @param {ApiKeyWordsMap[RutenApisType]} apiKeyWords - API 關鍵字
   * @returns {string} - API 的 URL
   */
  public static getRutenApis<T extends RutenApisType>(
    type: T,
    apiKeyWords: ApiKeyWordsMap[T]
  ): string {
    const baseApiUrl = 'https://rtapi.ruten.com.tw/api';
    const baseRapiUrl = 'https://rapi.ruten.com.tw/api';

    switch (type) {
      case RutenApisType.PROD_LIST:
        return `${baseApiUrl}/search/v3/index.php/core/prod?q=${(apiKeyWords as ProdListKeyWords).queryString}&type=direct&sort=prc%2Fac&offset=1&limit=100`;
      case RutenApisType.PROD_DETAIL_LIST:
        return `${baseRapiUrl}/items/v2/list?gno=${(apiKeyWords as ProdDetailListKeyWords).productId}&level=simple`;
      case RutenApisType.SHOP_SHIP_INFO:
        return `${baseRapiUrl}/shippingfee/v1/seller/${(apiKeyWords as ShopShipInfoKeyWords).shopId}/event/discount`;
      case RutenApisType.SHOP_INFO:
        return `${baseRapiUrl}/users/v1/index.php/${(apiKeyWords as ShopShipInfoKeyWords).shopId}/storeinfo`;
      case RutenApisType.SHOP_PROD_LIST: {
        const limit = Math.min((apiKeyWords as ShopProdListKeyWords).limit, 50);
        return `${baseApiUrl}/search/v3/index.php/core/seller/${(apiKeyWords as ShopProdListKeyWords).shopId}/prod?sort=prc/ac&limit=${limit}&q=${(apiKeyWords as ShopProdListKeyWords).targetProduct}`;
      }
      default:
        return 'error';
    }
  }
}
