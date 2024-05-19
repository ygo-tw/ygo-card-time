import { envRunner } from './app';
import figlet from 'figlet';
import { DataAccessService } from '@ygo/mongo-server';

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

  const target = [
    {
      time: '2024-03-21 06:04:47',
      rarity: '金亮',
      price_lowest: 150,
      price_avg: 150,
    },
    {
      time: '2024-03-22 06:05:49',
      rarity: '金亮',
      price_lowest: 150,
      price_avg: 150,
    },
    {
      time: '2024-03-23 06:10:38',
      rarity: '金亮',
      price_lowest: 150,
      price_avg: 150,
    },
  ];

  const update = await dataAccessService.findAndUpdate(
    'cards',
    {
      id: 'QCCP-JP001',
    },
    { $push: { price_yuyu: { $each: target } } }
  );

  console.log(update);
};

main();
