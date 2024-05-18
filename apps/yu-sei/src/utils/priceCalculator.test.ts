import { PriceCalculator } from './priceCalculator';

describe('PriceCalculator', () => {
  let priceCalculator: PriceCalculator;

  beforeEach(() => {
    priceCalculator = new PriceCalculator();
  });

  it('should return the min and average price as the same value when prices length is less than 4', () => {
    const prices = [100, 200, 300];
    const result = priceCalculator.calculatePrices(prices);
    expect(result).toEqual({ minPrice: 100, averagePrice: 100 });
  });

  it('should return correct min and average prices without outliers', () => {
    const prices = [100, 200, 300, 400, 500, 600];
    const result = priceCalculator.calculatePrices(prices);
    expect(result).toEqual({ minPrice: 100, averagePrice: 150 });
  });

  it('should return correct min and average prices with outliers', () => {
    const prices = [100, 200, 300, 400, 500, 10000];
    const result = priceCalculator.calculatePrices(prices);
    expect(result).toEqual({ minPrice: 100, averagePrice: 150 });
  });

  it('should handle case with exactly 4 prices correctly', () => {
    const prices = [100, 200, 300, 400];
    const result = priceCalculator.calculatePrices(prices);
    expect(result).toEqual({ minPrice: 100, averagePrice: 150 });
  });

  it('should handle case with less than 3 filtered prices', () => {
    const prices = [100, 200, 10000, 20000];
    const result = priceCalculator.calculatePrices(prices);
    expect(result).toEqual({ minPrice: 100, averagePrice: 100 });
  });

  it('should handle prices with all values being the same', () => {
    const prices = [300, 300, 300, 300];
    const result = priceCalculator.calculatePrices(prices);
    expect(result).toEqual({ minPrice: 300, averagePrice: 300 });
  });

  it('should return the only value for single price input', () => {
    const prices = [300];
    const result = priceCalculator.calculatePrices(prices);
    expect(result).toEqual({ minPrice: 300, averagePrice: 300 });
  });

  it('should correctly calculate median and MAD in helper functions', () => {
    const prices = [100, 200, 300, 400, 500];
    const median = priceCalculator['calculateMedian'](prices);
    const mad = priceCalculator['calculateMAD'](prices, median);
    expect(median).toBe(300);
    expect(mad).toBe(100);
  });
});
