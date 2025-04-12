import figlet from 'figlet';
import { loadEnv } from './app';
import { reptileRutenCardPrice } from './tasks/reptileRutenCardPrice';
import { scheduleJob } from 'node-schedule';
import { reptileJapanInfo } from './tasks/reptileJapanInfo';
import { LineMessageService } from './services/lineMessage';
const main = async () => {
  loadEnv();

  console.log(
    figlet.textSync('YGO CronJob!!!', {
      font: 'Ghost',
    })
  );

  // line message
  const lineService = new LineMessageService(
    {
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN as string,
    },
    process.env.LINE_MANAGER_ID?.split(',')
  );

  // 台灣時間 8:00 執行 RutenCardPriceReptile
  scheduleJob('scheduleReptilePrice', '1 0 0 * * *', async () => {
    console.log('Running scheduleReptilePrice...');

    try {
      await reptileRutenCardPrice();
    } catch (error) {
      await lineService.sendMsg(`Ruten Card Price Crawler Error: ${error}`);
    }
    console.log('Finished scheduleReptilePrice...');
  });
  // 台灣時間每周六 16:00 執行 RutenCardPriceReptile
  scheduleJob('scheduleRetileJapanInfo', '1 0 9 * * 6', async () => {
    console.log('Running scheduleRetileJapanInfo...');

    try {
      await reptileJapanInfo();
    } catch (error) {
      await lineService.sendMsg(`Japan Info Crawler Error: ${error}`);
    }
    console.log('Finished scheduleRetileJapanInfo...');
  });
};

main();
