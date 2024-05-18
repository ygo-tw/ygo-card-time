export class PriceCalculator {
  public calculatePrices(prices: number[]): {
    minPrice: number;
    averagePrice: number;
  } {
    if (prices.length < 4) {
      const minPrice = Math.min(...prices);
      return { minPrice, averagePrice: minPrice };
    }

    const filteredPrices = this.removeOutliersMAD(prices).sort((a, b) => a - b);

    const minPrice = Math.min(...filteredPrices);

    let averagePrice;
    if (filteredPrices.length < 3) {
      averagePrice = minPrice;
    } else {
      const oneThirdLength = Math.ceil(filteredPrices.length / 3);

      const lowestPrices = filteredPrices.slice(0, oneThirdLength);

      averagePrice = Math.floor(
        lowestPrices.reduce((sum, price) => sum + price, 0) / oneThirdLength
      );
    }

    return { minPrice, averagePrice };
  }

  private removeOutliersMAD(prices: number[]): number[] {
    const median = this.calculateMedian(prices);
    const mad = this.calculateMAD(prices, median);
    const threshold = 3 * mad;

    return prices.filter(price => Math.abs(price - median) <= threshold);
  }

  private calculateMedian(numbers: number[]): number {
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sortedNumbers.length / 2);
    return sortedNumbers.length % 2 !== 0
      ? sortedNumbers[mid]
      : (sortedNumbers[mid - 1] + sortedNumbers[mid]) / 2;
  }

  private calculateMAD(numbers: number[], median: number): number {
    const deviations = numbers.map(num => Math.abs(num - median));
    return this.calculateMedian(deviations);
  }
}
