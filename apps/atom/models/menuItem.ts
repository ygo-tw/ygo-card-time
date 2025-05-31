/**
 * 選單項目介面定義
 */
export interface MenuItem {
  /** 選單項目名稱 */
  name: string;
  /** 路由路徑 */
  route: string;
  /** 是否只在PC顯示 */
  onlyPc?: boolean;
  /** 是否需要登入 */
  checkLogin?: boolean;
  /** 子選單項目 */
  children?: MenuItem[];
}
