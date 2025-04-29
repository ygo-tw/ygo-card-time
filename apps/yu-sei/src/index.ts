import figlet from 'figlet';
import { loadEnv } from './app';
import { scheduleJob } from 'node-schedule';
import { LineMessageService } from './services/lineMessage';
import dayjs from 'dayjs';
import { TaskService } from './services/task';

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
      channelAccessToken: process.env.LIME_MESSAGE_TOKEN as string,
    },
    process.env.LINE_MANAGER_ID?.split(',')
  );

  const mongoUrl = `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;
  const taskService = new TaskService(mongoUrl);

  await lineService.sendMsg(
    `[Manager Msg] ${dayjs().format('YYYY-MM-DD')} : 爬蟲重新啟動`
  );

  // 台灣時間 8:00 執行 RutenCardPriceReptile
  scheduleJob('scheduleReptilePrice', '1 0 0 * * *', async () => {
    console.log('Running scheduleReptilePrice...');

    try {
      await taskService.rutenPriceTask();
    } catch (error) {
      await lineService.sendMsg(`Ruten Card Price Crawler Error: ${error}`);
    }
    console.log('Finished scheduleReptilePrice...');
  });
  // 台灣時間每周六 16:00 執行 RutenCardPriceReptile
  scheduleJob('scheduleRetileJapanInfo', '1 0 9 * * 6', async () => {
    console.log('Running scheduleRetileJapanInfo...');

    try {
      await taskService.japanInfoTask();
    } catch (error) {
      await lineService.sendMsg(`Japan Info Crawler Error: ${error}`);
    }
    console.log('Finished scheduleRetileJapanInfo...');
  });

  // 台灣時間每天 4:00 執行 YuyuPriceTask
  scheduleJob('scheduleYuyuPrice', '1 0 18 * * *', async () => {
    console.log('Running scheduleYuyuPrice...');

    try {
      await taskService.yuyuPriceTask();
    } catch (error) {
      await lineService.sendMsg(`Yuyu Price Crawler Error: ${error}`);
    }
  });

  // 台灣時間週日 16:00 執行 PriceInfoArchiveTask
  scheduleJob('schedulePriceInfoArchive', '1 0 9 * * 0', async () => {
    console.log('Running schedulePriceInfoArchive...');

    try {
      await taskService.priceInfoArchiveTask();
    } catch (error) {
      await lineService.sendMsg(`Price Info Archive Error: ${error}`);
    }
  });
};

main();
