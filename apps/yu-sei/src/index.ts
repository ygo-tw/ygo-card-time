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
  const uri = `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;

  const dataAccessService = new DataAccessService(uri);
  const cards = await dataAccessService.find<CardsDataType>(
    'cards',
    { name: { $regex: '黑暗' } },
    {}
  );

  console.log(cards.length);
};

main();
