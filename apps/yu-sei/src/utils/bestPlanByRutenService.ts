/**
 * 商品請求介面
 */
export interface ProductRequest {
  productName: string;
  count: number;
}

/**
 * 商品介面
 */
interface Product {
  price: number;
  id: string;
  qtl: number;
}

/**
 * 商店介面
 */
export interface Shop {
  id: string;
  products: Record<string, Product>;
  shipPrices: Record<string, number>;
  freeShip: Record<string, number>;
}

/**
 * 未找到商品介面
 */
interface NotFindProduct {
  productName: string;
  count: number;
}

/**
 * 商店商品詳情介面
 */
interface ShopProductDetail {
  productName: string;
  count: number;
  totalCost: number;
  singlePrice: number;
  id: string;
}

/**
 * 商店結果介面
 */
interface ShopResult {
  shopId: string;
  products: ShopProductDetail[];
  totalCost: number;
  freeShipping: boolean;
  recommendedShipping: { method: string; cost: number };
  freeShippingThreshold: number;
}

/**
 * 商店商品詳情記錄介面
 */
interface RecordShopDetail {
  shopId: string;
  productPrice: number;
  productQtl: number;
  isFreeShipping: boolean;
  shippingCost: number;
  freeShippingThreshold: number;
}

/**
 * 最佳購物方案介面
 */
export interface BestPlan {
  notFindProduct: NotFindProduct[];
  bestPlan: ShopResult[];
  totalSpend: number;
}

/**
 * 透過 Ruten 服務取得最佳購物方案
 */
export class BestPlanByRutenService {
  private shops: Shop[];
  private shoppingList: ProductRequest[];
  private desiredShippingMethod: string;
  private shopResults: ShopResult[] = [];

  private constructor(
    shops: Shop[],
    shoppingList: ProductRequest[],
    desiredShippingMethod: string = ''
  ) {
    this.shops = shops;
    this.shoppingList = shoppingList.map(x => ({
      ...x,
      count: Math.min(x.count, 3),
    }));
    this.desiredShippingMethod = desiredShippingMethod;
  }

  /**
   * 獲取最佳購物方案
   * @param shops 商店列表
   * @param shoppingList 購物清單
   * @param desiredShippingMethod 指定的運送方式
   * @returns 最佳購物方案
   */
  public static getBestPlan(
    shops: Shop[],
    shoppingList: ProductRequest[],
    desiredShippingMethod: string = ''
  ): BestPlan {
    const bestPlan = new BestPlanByRutenService(
      shops,
      shoppingList,
      desiredShippingMethod
    );
    return bestPlan.getShopResults();
  }

  /**
   * 取得商店結果
   * @returns 最佳購物方案
   */
  private getShopResults(): BestPlan {
    this.shopResults = this.shops.map(shop => {
      const possibleProducts = this.getAllProductsInShopsAsPossible(shop);
      return this.getShopDetailConsideringShipping(shop, possibleProducts);
    });

    const { needSpendShippingCostShop, notFindProduct } =
      this.findCheepingShopResult();

    const bestPlan = this.findBestShoppingPlan(
      needSpendShippingCostShop,
      notFindProduct
    );
    return bestPlan;
  }

  /**
   * 找到最佳購物方案
   * @param needSpendShippingCostShop 需要花費運費的商店
   * @param notFindProduct 未找到的商品
   * @returns 最佳購物方案
   */
  private findBestShoppingPlan(
    needSpendShippingCostShop: string[],
    notFindProduct: NotFindProduct[]
  ): BestPlan {
    const processedProducts = new Set<string>();

    for (const shopId of needSpendShippingCostShop) {
      const needToCheckProducts = this.shopResults.find(
        x => x.shopId === shopId
      ) as ShopResult;

      for (const product of needToCheckProducts.products) {
        const productName = product.productName;

        if (processedProducts.has(productName)) {
          continue; // Skip already processed products
        }

        const filterShop = this.shops.filter(x => x.products[productName]);
        const record = filterShop.map(shop => {
          const productInfo = shop.products[productName];
          const compareShop = this.shopResults.find(x => x.shopId === shop.id);

          return {
            shopId: shop.id,
            productPrice: productInfo.price,
            productQtl: productInfo.qtl,
            isFreeShipping: compareShop?.freeShipping || false,
            shippingCost: compareShop?.recommendedShipping.cost || 0,
            freeShippingThreshold: compareShop?.freeShippingThreshold || 0,
          };
        });

        const cheapestShop = this.findCheapestCombination(
          record,
          this.shoppingList.find(x => x.productName === productName)
            ?.count as number
        );
        this.updateShopResults(productName, cheapestShop);
        processedProducts.add(productName); // Mark product as processed
      }
    }

    this.updateTotalCosts();

    return {
      notFindProduct,
      bestPlan: this.shopResults,
      totalSpend: this.shopResults.reduce((acc, cur) => acc + cur.totalCost, 0),
    };
  }

  /**
   * 更新商店結果中的商品資訊
   * @param productName 商品名稱
   * @param cheapestShop 最便宜的商店
   * @param productCount 商品數量
   */
  private updateShopResults(
    productName: string,
    cheapestShop: { [key: string]: number }
  ): void {
    for (const [idx, shopResult] of this.shopResults.entries()) {
      // 避免重複添加相同產品
      const existingProductIndex = shopResult.products.findIndex(
        p => p.productName === productName
      );

      if (!cheapestShop[shopResult.shopId]) {
        if (existingProductIndex !== -1) {
          this.shopResults[idx].products.splice(existingProductIndex, 1);
        }
      } else {
        const productInfo = this.shops.find(x => x.id === shopResult.shopId)
          ?.products[productName] as Product;

        const productCount = cheapestShop[shopResult.shopId];
        const totalCost = productInfo.price * productCount;

        if (existingProductIndex !== -1) {
          // 更新現有產品
          this.shopResults[idx].products[existingProductIndex] = {
            productName,
            count: productCount,
            singlePrice: productInfo.price,
            totalCost,
            id: productInfo.id,
          };
        } else {
          // 添加新產品
          this.shopResults[idx].products.push({
            productName,
            count: productCount,
            singlePrice: productInfo.price,
            totalCost,
            id: productInfo.id,
          });
        }
      }
    }
  }

  /**
   * 更新商店結果中的總成本
   */
  private updateTotalCosts(): void {
    for (const [idx, shopResult] of this.shopResults.entries()) {
      if (shopResult.products.length) {
        const productsTotalCost = shopResult.products.reduce(
          (acc, cur) => acc + cur.totalCost,
          0
        );
        this.shopResults[idx].freeShipping =
          productsTotalCost >= this.shopResults[idx].freeShippingThreshold;
        const shippingCost = shopResult.freeShipping
          ? 0
          : shopResult.recommendedShipping.cost;
        this.shopResults[idx].totalCost = productsTotalCost + shippingCost;
      }
    }
    // 移除沒有產品的商店結果
    this.shopResults = this.shopResults.filter(x => x.products.length);
  }

  /**
   * 計算成本
   * @param shop 商店詳情
   * @param quantity 商品數量
   * @returns 總成本
   */
  private calculateCost(shop: RecordShopDetail, quantity: number): number {
    const totalProductPrice = shop.productPrice * quantity;
    const shippingCost =
      shop.isFreeShipping || totalProductPrice >= shop.freeShippingThreshold
        ? 0
        : shop.shippingCost;
    return totalProductPrice + shippingCost;
  }

  /**
   * 找到最便宜的組合
   * @param shops 商店詳情
   * @param totalQuantity 總數量
   * @returns 最便宜的組合
   */
  private findCheapestCombination(
    shops: RecordShopDetail[],
    totalQuantity: number
  ): { [key: string]: number } {
    const combinations: {
      shops: { [key: string]: number };
      totalCost: number;
    }[] = [];

    const addCombination = (shopQuantities: { [key: string]: number }) => {
      let totalCost = 0;
      for (const shopId in shopQuantities) {
        const shop = shops.find(s => s.shopId === shopId);
        if (shop) {
          totalCost += this.calculateCost(shop, shopQuantities[shopId]);
        }
      }
      combinations.push({ shops: shopQuantities, totalCost });
    };

    const findCombinations = (
      currentShops: number[],
      currentQuantities: number[],
      remainingQuantity: number
    ) => {
      if (remainingQuantity === 0) {
        const shopQuantities: { [key: string]: number } = {};
        for (let i = 0; i < currentShops.length; i++) {
          shopQuantities[shops[currentShops[i]].shopId] =
            (shopQuantities[shops[currentShops[i]].shopId] || 0) +
            currentQuantities[i];
        }
        addCombination(shopQuantities);
        return;
      }

      for (let i = 0; i < shops.length; i++) {
        currentShops.push(i);
        currentQuantities.push(1);
        findCombinations(
          currentShops,
          currentQuantities,
          remainingQuantity - 1
        );
        currentShops.pop();
        currentQuantities.pop();
      }
    };

    findCombinations([], [], totalQuantity);

    combinations.sort((a, b) => a.totalCost - b.totalCost);
    for (const shop of shops) {
      const errorIdx = combinations.findIndex(
        x => x.shops[shop.shopId] > shop.productQtl
      );
      if (errorIdx !== -1) combinations.splice(errorIdx, 1);
    }

    return { ...combinations[0].shops };
  }

  /**
   * 獲取所有商店中符合的商品
   * @param shop 商店
   * @returns 商店結果
   */
  private getAllProductsInShopsAsPossible(shop: Shop): ShopResult {
    const result: ShopResult = {
      shopId: shop.id,
      products: [],
      totalCost: 0,
      freeShipping: false,
      recommendedShipping: { method: '', cost: 0 },
      freeShippingThreshold: 0,
    };

    this.shoppingList.forEach(item => {
      const product = shop.products[item.productName];
      if (product) {
        const count = Math.min(item.count, product.qtl);
        const cost = product.price * count;
        result.products.push({
          productName: item.productName,
          count,
          totalCost: cost,
          singlePrice: product.price,
          id: product.id,
        });
        result.totalCost += cost;
      }
    });

    return result;
  }

  /**
   * 根據運費考量取得商店詳情
   * @param shop 商店
   * @param result 商店結果
   * @returns 更新後的商店結果
   */
  private getShopDetailConsideringShipping(
    shop: Shop,
    result: ShopResult
  ): ShopResult {
    let bestShippingMethod = '';
    let bestShippingCost = Infinity;
    let freeShippingThreshold = Infinity;

    if (
      this.desiredShippingMethod &&
      shop.shipPrices[this.desiredShippingMethod] !== undefined
    ) {
      bestShippingMethod = this.desiredShippingMethod;
      bestShippingCost = shop.shipPrices[this.desiredShippingMethod];
      freeShippingThreshold = shop.freeShip[this.desiredShippingMethod];
      result.freeShipping = result.totalCost >= freeShippingThreshold;
    } else {
      for (const [method, price] of Object.entries(shop.shipPrices)) {
        const threshold = shop.freeShip[method];
        if (result.totalCost >= threshold) {
          result.freeShipping = true;
          bestShippingMethod = method;
          bestShippingCost = price;
          freeShippingThreshold = threshold;
          break;
        } else if (price < bestShippingCost) {
          bestShippingCost = price;
          bestShippingMethod = method;
          freeShippingThreshold = threshold;
        }
      }
    }

    result.recommendedShipping = {
      method: bestShippingMethod,
      cost: bestShippingCost,
    };
    result.totalCost += result.freeShipping ? 0 : bestShippingCost;
    result.freeShippingThreshold = freeShippingThreshold;

    return result;
  }

  /**
   * 找到最便宜的商店結果
   * @returns 需要花費運費的商店和未找到的商品
   */
  private findCheepingShopResult() {
    const { notFindProduct, difficulty } = this.findSaveAndNotFindProducts();
    const { needSpendShippingCostShop } =
      this.findNeedSpendShippingCostShop(difficulty);

    return { notFindProduct, needSpendShippingCostShop };
  }

  /**
   * 找到需要花費運費的商店
   * @param difficulty 未找到的商品
   * @returns 需要花費運費的商店
   */
  private findNeedSpendShippingCostShop(difficulty: NotFindProduct[]): {
    needSpendShippingCostShop: string[];
  } {
    difficulty.forEach(difficultyProduct => {
      const filterHasProductShops = this.shopResults
        .filter(p =>
          p.products.some(x => x.productName === difficultyProduct.productName)
        )
        .map(p => ({
          shopId: p.shopId,
          singlePrice:
            p.products.find(
              x => x.productName === difficultyProduct.productName
            )?.singlePrice || 0,
          count:
            p.products.find(
              x => x.productName === difficultyProduct.productName
            )?.count || 0,
          totalCost:
            p.products.find(
              x => x.productName === difficultyProduct.productName
            )?.totalCost || 0,
        }))
        .sort((a, b) => a.singlePrice - b.singlePrice);

      let hasNeedCount = difficultyProduct.count;
      const isCheckingShops: string[] = [];

      for (const hasProductShop of filterHasProductShops) {
        const idx = this.shopResults.findIndex(
          p => p.shopId === hasProductShop.shopId
        );
        const productIndex = this.shopResults[idx].products.findIndex(
          p => p.productName === difficultyProduct.productName
        );
        const minCount = Math.min(hasNeedCount, hasProductShop.count);

        this.shopResults[idx].products[productIndex].count = minCount;
        this.shopResults[idx].products[productIndex].totalCost =
          hasProductShop.singlePrice * minCount;
        hasNeedCount -= minCount;
        isCheckingShops.push(hasProductShop.shopId);
        if (hasNeedCount <= 0) {
          const notCheckShop = filterHasProductShops
            .filter(x => !isCheckingShops.includes(x.shopId))
            .map(x => x.shopId);
          notCheckShop.forEach(shopId => {
            const idx = this.shopResults.findIndex(p => p.shopId === shopId);
            this.shopResults[idx].products = this.shopResults[
              idx
            ].products.filter(
              p => p.productName !== difficultyProduct.productName
            );
          });
          break;
        }
      }
    });

    const needSpendShippingCostShop: string[] = [];
    this.shopResults.forEach((shopResult, idx) => {
      if (!shopResult.products.length) {
        this.shopResults[idx].totalCost = 0;
        return;
      }
      this.shopResults[idx].totalCost = shopResult.products.reduce(
        (acc, cur) => acc + cur.totalCost,
        0
      );
      if (
        this.shopResults[idx].totalCost <
        this.shopResults[idx].freeShippingThreshold
      ) {
        this.shopResults[idx].totalCost +=
          this.shopResults[idx].recommendedShipping.cost;
        this.shopResults[idx].freeShipping = false;
        needSpendShippingCostShop.push(this.shopResults[idx].shopId);
      } else {
        this.shopResults[idx].freeShipping = true;
      }
    });

    return { needSpendShippingCostShop };
  }

  /**
   * 找到可節省和未找到的商品
   * @returns 未找到和可節省的商品
   */
  private findSaveAndNotFindProducts() {
    const notFindProduct: NotFindProduct[] = [];
    const difficulty: NotFindProduct[] = [];
    const saveProduct: string[] = [];

    this.shoppingList.forEach(product => {
      let count = product.count;
      this.shopResults.forEach(shopResult => {
        const hasProduct = shopResult.products.find(
          p => p.productName === product.productName
        );
        if (hasProduct) count -= hasProduct.count;
      });
      if (count > 0)
        notFindProduct.push({ productName: product.productName, count });
      else if (count < 0)
        difficulty.push({
          productName: product.productName,
          count: product.count,
        });
      else saveProduct.push(product.productName);
    });

    return { notFindProduct, difficulty, saveProduct };
  }
}
