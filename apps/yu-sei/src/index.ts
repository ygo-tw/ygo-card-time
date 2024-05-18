import { envRunner } from './app';
import figlet from 'figlet';
import { PriceCalculator } from './utils/priceCalculator';

const main = async () => {
  envRunner();
  console.log(
    figlet.textSync('YGO Reptile!!!', {
      font: 'Ghost',
    })
  );

  const priceCalculator = new PriceCalculator();

  console.log(
    priceCalculator.calculatePrices([100, 200, 300, 400, 500, 10000])
  );
};

main();
