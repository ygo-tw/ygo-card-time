import { ProductRequest } from './bestPlanByRutenService';

export class GetShopListByRutenService {
  private shoppingList: ProductRequest[];

  private constructor(shoppingList: ProductRequest[]) {
    this.shoppingList = shoppingList.map(x => ({
      ...x,
      count: Math.min(x.count, 3),
    }));
  }

  public static getShopList(shoppingList: ProductRequest[]) {
    const instance = new GetShopListByRutenService(shoppingList);
    return instance.findShopList();
  }

  private findShopList() {
    console.log(this.shoppingList);
  }
}
