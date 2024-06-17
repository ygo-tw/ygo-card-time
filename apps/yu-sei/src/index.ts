import figlet from 'figlet';
import { envRunner } from './app';
import { reptileRutenCardPrice } from './tasks/reptileRutenCardPrice';
import { scheduleJob } from 'node-schedule';
import { reptileJapanInfo } from './tasks/reptileJapanInfo';

const main = async () => {
  envRunner();
  console.log(
    figlet.textSync('YGO Card Time CronJob!!!', {
      font: 'Ghost',
    })
  );

  // 每天 14:40 執行 RutenCardPriceReptile
  scheduleJob('scheduleReptilePrice', '01 40 14 * * *', async () => {
    await reptileRutenCardPrice();
  });

  // 每天 14:50 執行 RutenCardPriceReptile
  scheduleJob('scheduleRetileJapanInfo', '0 0 18 * * 6', async () => {
    await reptileJapanInfo();
  });
};

main();
