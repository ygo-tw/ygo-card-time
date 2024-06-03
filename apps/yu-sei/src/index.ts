import { envRunner } from './app';
import figlet from 'figlet';
import { DataAccessService } from '@ygo/mongo-server';
import fs from 'fs';
import {
  BestPlanByRutenService,
  GetShopListByRutenService,
} from '@ygo/ruten-apis';

const main = async () => {
  envRunner();
  console.log(
    figlet.textSync('YGO Reptile!!!', {
      font: 'Ghost',
    })
  );

  const dataAccessService = new DataAccessService(
    `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`
  );

  const test = [
    {
      productName: 'RC04-JP001+金鑽',
      count: 1,
    },
    {
      productName: 'RC04-JP002+金鑽',
      count: 2,
    },
  ];
  const start = new Date();
  const testList = await GetShopListByRutenService.getShopList(
    test,
    dataAccessService
  );

  fs.writeFileSync(
    'result.json',
    JSON.stringify(BestPlanByRutenService.getBestPlan(testList, test), null, 2)
  );

  console.log('Done!', new Date().getTime() - start.getTime());
};

main();
