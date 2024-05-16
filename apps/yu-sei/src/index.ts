import { envRunner } from './app';
import figlet from 'figlet';
import { DataAccessService } from '@ygo/mongo-server';
import { CardsDataType } from '@ygo/schemas';

const main = async () => {
  envRunner();
  console.log(
    figlet.textSync('YGO Reptile!!!', {
      font: 'Ghost',
    })
  );

  const dataAccessService = new DataAccessService();
  const cards = await dataAccessService.find<CardsDataType>(
    'cards',
    { name: { $regex: '黑暗' } },
    {}
  );

  console.log(cards);
};

main();
