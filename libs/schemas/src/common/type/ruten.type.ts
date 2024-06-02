export type RutenShipDetail = {
  Id?: string;
  Priority?: number;
  Discount?: number;
  SellerEventType?: string | null;
  RPoint?: string | null;
  More?: string | null;
  FreeShipping?: number;
  ShippingDiscount?: number;
  StockStatus?: number;
  BrandStore?: number;
  SellerDiscount?: number;
  GoodStorePlus?: number;
  '3cAlliance'?: number;
  TimeDelivery24h?: number;
  TimeDelivery3days?: number;
  PreOrderStartTime?: number;
};

export type RutenShipListResponse = {
  TotalRows: number;
  Rows: RutenShipDetail[];
  LimitedTotalRows: number;
};

export type RutenPriceDetailResponse = {
  ProdId: string;
  ProdName: string;
  SellerId?: string;
  CateId?: string;
  Currency: string;
  SourceInfo?: string | null;
  PriceRange: [number, number];
  Image?: string;
  StockQty: number;
  SoldQty: number;
  SaleType?: 'buy' | 'auction';
  Payment?: string;
  ShippingCost?: number;
  TitleStyle?: number;
  PostTime?: string;
  CloseTime?: string;
  BidInfo?: string | null;
  BidRecord?: number;
  BuyerLimit?: number;
  Video?: string | null;
  StockStatus?: number;
  PreOrderShipDate?: string | null;
  SpecActive?: 'N' | 'R';
  DeliverWay?: string;
  FastShip?: string | null;
};

// Product Detail
interface Image {
  filename: string;
  url: string[];
  m_url: string[];
}

interface PriceRange {
  min: number;
  max: number;
  ori_min: number;
  ori_max: number;
}

interface SellerScore {
  TotalCompletionRate: number;
  TotalOrderNum: number;
  '24hCompletionRate': number;
  '24hOrderNum': number;
  '3daysCompletionRate': number;
  '3daysOrderNum': number;
  '7daysCompletionRate': number;
  '7daysOrderNum': number;
  '14daysCompletionRate': number;
  '14daysOrderNum': number;
  '21daysCompletionRate': number;
  '21daysOrderNum': number;
  Exceed21daysCompletionRate: number;
  Exceed21daysOrderNum: number;
}

interface DeliverWay {
  SEVEN_COD?: number;
  SEVEN?: number;
  FAMI_COD?: number;
  FAMI?: number;
  HILIFE_COD?: number;
  HILIFE?: number;
  [key: string]: number | undefined;
}

interface RutenProductDetailList {
  id: string;
  class: string;
  name: string;
  num: number;
  images: Image;
  currency: string;
  goods_price: number;
  goods_ori_price: number;
  goods_price_range: PriceRange;
  watch_num: number;
  sold_num: number;
  buyer_limit_num: number;
  stock_status: number;
  fast_ship: number;
  free_shipping: number;
  youtube_link: string;
  video_link: string;
  ncc_check_code: string;
  bsmi_code: string;
  goods_no: string;
  available: boolean;
  post_time: number;
  spec_type: string;
  deliver_way: DeliverWay;
  mode: string;
  ship: string;
  platform: string;
  ctrl_rowid: string;
  user: string;
  user_credit: number;
  pay_way: string[];
  title_style: string;
  selling_g_now_price: number;
  item_remaining_time: number;
  translation_type: string | null;
  translated_name: string | null;
  min_estimated_delivery_date: string | null;
  max_estimated_delivery_date: string | null;
  update_time: string;
  is_brand_seller: boolean;
  is_r_pcstore: boolean;
  is_pcstore: boolean;
  is_goods_from_oversea: boolean;
  is_goods_sale: boolean;
  sale_start_time: number;
  sale_end_time: number;
  seller_score: SellerScore;
  is_sale_start_time_editable: boolean;
}

export type RutenProductDetailListResponse = {
  status: string;
  data: RutenProductDetailList[];
};

interface StoreInfo {
  store_name: string;
  board_intro: string;
  store_bg_img: string;
  board_img: string;
  board_is_new: boolean;
  board_is_active: boolean;
  credit_rate: string;
  star_cnt: number;
  im_response_time_hours: number;
  items_cnt: number;
  credit_cnt: string;
  foreign_credit: number;
  deliver_days: string;
  phone_certify: boolean;
  user_status: number;
  email_certify: boolean;
  pp_certify: boolean;
  pp_crd_certify: boolean;
  pi_level: string;
  corp_status: boolean;
  oversea_user: boolean;
  safepc: boolean;
  user_img: string;
  store_suspend_info: null | string;
  platform: string;
  last_activity_time: number;
  user_id: string;
  store_penalty_limit: boolean;
  seller_score: SellerScore;
  is_brand_seller: boolean;
  is_pcstore: boolean;
  is_user_agree: boolean;
  groups: string;
  follow_cnt: number;
  is_cstore_member: boolean;
  pp_kyc: boolean;
  user_kyc: boolean;
  kyc_lock_time: number;
  is_lock_kyc: boolean;
  is_alert_kyc: boolean;
  is_lock_natural_resend: boolean;
  is_alert_natural_resend: boolean;
}

export type RutenStoreDetailResponse = {
  status: string;
  data: StoreInfo;
};

interface DiscountCondition {
  discount_id: string;
  arrival_amount: number;
  charge_fee: number;
}

interface DiscountConditions {
  [key: string]: DiscountCondition;
}

interface ShipData {
  vaild: boolean;
  event_name: string;
  url: string;
  discount_conditions: DiscountConditions;
}

export type ShipInfoResponse = {
  status: string;
  data: ShipData;
};
