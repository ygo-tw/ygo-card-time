import {
  BestPlanByRutenService,
  BestPlan,
  ProductRequest,
  Shop,
} from './bestPlanByRutenService';

describe('BestPlanByRutenService', () => {
  const mockShops: Shop[] = [
    {
      id: 'shop1',
      products: {
        productA: { price: 100, id: 'pA1', qtl: 2 },
        productB: { price: 200, id: 'pB1', qtl: 1 },
      },
      shipPrices: { standard: 50 },
      freeShip: { standard: 300 },
    },
    {
      id: 'shop2',
      products: {
        productA: { price: 110, id: 'pA2', qtl: 3 },
        productC: { price: 150, id: 'pC1', qtl: 2 },
      },
      shipPrices: { standard: 40 },
      freeShip: { standard: 200 },
    },
  ];

  const mockShoppingList: ProductRequest[] = [
    { productName: 'productA', count: 2 },
    { productName: 'productB', count: 1 },
    { productName: 'productC', count: 1 },
  ];

  it('should return the best plan with the given shops and shopping list', () => {
    const bestPlan: BestPlan = BestPlanByRutenService.getBestPlan(
      mockShops,
      mockShoppingList,
      'standard'
    );

    expect(bestPlan.totalSpend).toBeGreaterThan(0);
    expect(bestPlan.bestPlan.length).toBeGreaterThan(0);
    expect(bestPlan.notFindProduct.length).toBe(0);

    // Check specific shop results
    const shop1Result = bestPlan.bestPlan.find(shop => shop.shopId === 'shop1');
    const shop2Result = bestPlan.bestPlan.find(shop => shop.shopId === 'shop2');

    expect(shop1Result).toBeDefined();
    expect(shop2Result).toBeDefined();
    expect(shop1Result?.totalCost).toBe(400);
    expect(shop2Result?.totalCost).toBe(190);
  });

  it('should handle not finding products', () => {
    const mockShoppingListWithMissingProduct: ProductRequest[] = [
      { productName: 'productA', count: 2 },
      { productName: 'productD', count: 1 },
    ];

    const bestPlan: BestPlan = BestPlanByRutenService.getBestPlan(
      mockShops,
      mockShoppingListWithMissingProduct,
      'standard'
    );

    expect(bestPlan.notFindProduct.length).toBe(1);
    expect(bestPlan.notFindProduct[0].productName).toBe('productD');
  });

  it('should consider shipping costs correctly', () => {
    const bestPlan: BestPlan = BestPlanByRutenService.getBestPlan(
      mockShops,
      mockShoppingList,
      'standard'
    );

    expect(bestPlan.totalSpend).toBe(590);
    const shop1Result = bestPlan.bestPlan.find(shop => shop.shopId === 'shop1');
    const shop2Result = bestPlan.bestPlan.find(shop => shop.shopId === 'shop2');

    expect(shop1Result?.recommendedShipping.cost).toBe(50);
    expect(shop2Result?.recommendedShipping.cost).toBe(40);
  });

  it('should not duplicate products in results', () => {
    const bestPlan: BestPlan = BestPlanByRutenService.getBestPlan(
      mockShops,
      mockShoppingList,
      'standard'
    );

    const shop2Result = bestPlan.bestPlan.find(shop => shop.shopId === 'shop2');

    expect(shop2Result?.products.length).toBe(1); // Ensure no duplicate products
    expect(shop2Result?.products[0].count).toBe(1); // Ensure correct count
  });
});
