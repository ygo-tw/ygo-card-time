import { envRunner } from './app';
import figlet from 'figlet';
import { YgoJpInfo } from './cronJobs/ygoJpInfo';
import { DataAccessService } from '@ygo/mongo-server';
import { CheerioCrawler } from '@ygo/crawler';

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

  const ygoJpInfo = new YgoJpInfo(cheerioCrawler, da);

  const result = await ygoJpInfo.updateCardsJPInfo(['10000000']);
  console.log(result);
};

main();
