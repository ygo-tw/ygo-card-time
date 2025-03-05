import figlet from 'figlet';
import { loadEnv } from './app';
import { reptileRutenCardPrice } from './tasks/reptileRutenCardPrice';
import { scheduleJob } from 'node-schedule';
import { reptileJapanInfo } from './tasks/reptileJapanInfo';
import { LineBotService } from '@ygo/line';

const main = async () => {
  loadEnv();
  console.log(
    figlet.textSync('YGO CronJob!!!', {
      font: 'Ghost',
    })
  );

  // line notify
  const lineBotService = new LineBotService();

  // 台灣時間 8:00 執行 RutenCardPriceReptile
  scheduleJob('scheduleReptilePrice', '1 0 0 * * *', async () => {
    console.log('Running scheduleReptilePrice...');

    try {
      await reptileRutenCardPrice();
    } catch (error) {
      await lineBotService.sendNotify(
        `Ruten Card Price Crawler Error: ${error}`
      );
    }
    console.log('Finished scheduleReptilePrice...');
  });
  // 台灣時間每周六 16:00 執行 RutenCardPriceReptile
  scheduleJob('scheduleRetileJapanInfo', '1 0 9 * * 6', async () => {
    console.log('Running scheduleRetileJapanInfo...');

    try {
      await reptileJapanInfo();
    } catch (error) {
      await lineBotService.sendNotify(`Japan Info Crawler Error: ${error}`);
    }
    console.log('Finished scheduleRetileJapanInfo...');
  });
};

main();
