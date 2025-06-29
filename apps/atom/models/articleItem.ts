/**
 * 文章項目介面定義
 */
export interface ArticleItem {
  _id?: string;
  type?: number;
  title: string;
  publish_date: string;
  photo: string;
  content: string;
  status: number;
  to_top: boolean;
  admin_name: string;
  admin_id: string;
  tag: string[];
}
