import figlet from 'figlet';
import { loadEnv } from './app';
import { reptileRutenCardPrice } from './tasks/reptileRutenCardPrice';
import { scheduleJob } from 'node-schedule';
import { reptileJapanInfo } from './tasks/reptileJapanInfo';

const main = async () => {
  loadEnv();
  console.log(
    figlet.textSync('YGO CronJob!!!', {
      font: 'Ghost',
    })
  );
  // 每天 14:40 執行 RutenCardPriceReptile
  scheduleJob('scheduleReptilePrice', '30 14 17 * * *', async () => {
    console.log('Running scheduleReptilePrice...');

    await reptileRutenCardPrice();
  });
  // 每天 14:50 執行 RutenCardPriceReptile
  scheduleJob('scheduleRetileJapanInfo', '0 30 21 * * 6', async () => {
    console.log('Running scheduleRetileJapanInfo...');

    await reptileJapanInfo();
  });
};

main();
