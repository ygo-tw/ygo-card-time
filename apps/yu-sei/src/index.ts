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
  // 台灣時間 8:00 執行 RutenCardPriceReptile
  scheduleJob('scheduleReptilePrice', '1 0 0 * * *', async () => {
    console.log('Running scheduleReptilePrice...');

    await reptileRutenCardPrice();
    console.log('Finished scheduleReptilePrice...');
  });
  // 台灣時間每周六 16:00 執行 RutenCardPriceReptile
  scheduleJob('scheduleRetileJapanInfo', '1 0 8 * * 6', async () => {
    console.log('Running scheduleRetileJapanInfo...');

    await reptileJapanInfo();
    console.log('Finished scheduleRetileJapanInfo...');
  });
};

main();
