import { ProductRequest } from './bestPlanByRutenService';

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

export type ProdDetail = {
  price: number;
  qtl: number;
  id: string;
  shopId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deliver_way: any;
};

export type SopIdList = {
  name: string;
  id: string;
};

export type ProdListKeyWords = {
  queryString: string;
};

export type ProdDetailListKeyWords = {
  productId: string;
};

export type ShopShipInfoKeyWords = {
  shopId: string;
};

export type ShopProdListKeyWords = {
  shopId: string;
  limit: number;
  targetProduct: string;
};

export interface ProductRequestExtended extends ProductRequest {
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
