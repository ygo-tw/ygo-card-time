/**
 * Banner項目介面定義
 */
export interface BannerItem {
  _id?: string;
  title: string;
  subtitle?: string;
  date: string;
  photo_pc: string;
  photo_mobile: string;
  url?: string;
}
