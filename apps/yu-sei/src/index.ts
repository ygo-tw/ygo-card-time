import { envRunner } from './app';
import figlet from 'figlet';
import { DataAccessService } from '@ygo/mongo-server';
// import { PriceCalculator } from './utils';
// import { RutenService } from './cronJobs/rutenPrice';
import { CheerioCrawler } from '@ygo/crawler';
import { YgoJpInfo } from './cronJobs/ygoJpInfo';
import { CustomLogger } from './utils';

const main = async () => {
  envRunner();
  console.log(
    figlet.textSync('YGO Reptile!!!', {
      font: 'Ghost',
    })
  );

  const cheerioCrawler = new CheerioCrawler('https://www.db.yugioh-card.com');
  const da = new DataAccessService(
    `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`
  );
  const logger = new CustomLogger();
  // const priceCalculator = new PriceCalculator();
  // const returnService = new RutenService(da, priceCalculator);

  // await returnService.getRutenPrice();

  const ygoJpInfo = new YgoJpInfo(cheerioCrawler, da, logger);

  await ygoJpInfo.updateCardsJPInfo(['10004783']);
};

main();
