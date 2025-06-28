/**
 * 文章項目介面定義
 */
export interface ArticleItem {
  _id?: string;
  title: string;
  subtitle?: string;
  date: string;
  photo_pc: string;
  photo_mobile: string;
  url?: string;
}
