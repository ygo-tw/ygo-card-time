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
