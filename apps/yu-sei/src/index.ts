import { envRunner } from './app';
import figlet from 'figlet';
import fs from 'fs';
import { BestPlanByRutenService, Shop } from './utils/bestPlanByRutenService';

const main = async () => {
  envRunner();
  console.log(
    figlet.textSync('YGO Reptile!!!', {
      font: 'Ghost',
    })
  );

  const shoppingList = [
    { productName: 'apple', count: 3 },
    { productName: 'banana', count: 2 },
    { productName: 'orange', count: 1 },
    { productName: 'pear', count: 2 },
    { productName: 'grape', count: 1 },
  ];
  const shops: Shop[] = [
    {
      id: 'shop1',
      products: {
        apple: { price: 80, id: '1', qtl: 3 },
        banana: { price: 60, id: '2', qtl: 1 },
      },
      shipPrices: { seven: 60, family: 45 },
      freeShip: { seven: 200, family: 170 },
    },
    {
      id: 'shop2',
      products: {
        banana: { price: 50, id: '3', qtl: 2 },
        orange: { price: 80, id: '4', qtl: 1 },
        grape: { price: 60, id: '9', qtl: 1 },
      },
      shipPrices: { seven: 70, family: 40 },
      freeShip: { seven: 120, family: 110 },
    },
    {
      id: 'shop3',
      products: {
        apple: { price: 70, id: '5', qtl: 1 },
        banana: { price: 55, id: '8', qtl: 1 },
        orange: { price: 70, id: '6', qtl: 1 },
        pear: { price: 70, id: '7', qtl: 1 },
      },
      shipPrices: { seven: 50, family: 55 },
      freeShip: { seven: 220, family: 250 },
    },
  ];
  fs.writeFileSync(
    'result.json',
    JSON.stringify(
      BestPlanByRutenService.getBestPlan(shops, shoppingList),
      null,
      2
    )
  );
};

main();
