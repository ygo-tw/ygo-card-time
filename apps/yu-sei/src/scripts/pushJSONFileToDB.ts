import fs from 'fs';
import { CardsDataType } from '@ygo/schemas';
import { DataAccessService } from '@ygo/mongo-server';
import { loadEnv } from '../app';

const pushJSONFileToDB = async () => {
  console.log('pushJSONFileToDB start ...');

  loadEnv();
  if (!fs.existsSync('./src/scripts/cardsDataList.json')) {
    console.log('cardsDataList.json 不存在');
    return;
  }

  const mongoUrl = `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;
  const dataAccessService = new DataAccessService(mongoUrl);

  const cardsDataList = JSON.parse(
    fs.readFileSync('./src/scripts/cardsDataList.json', 'utf8')
  ) as CardsDataType[];

  const result = await dataAccessService.insertMany<CardsDataType>(
    'cards',
    cardsDataList
  );

  console.log(
    `Insert Successfully! total: ${result.length}, Cards Number are: ${result.map(cards => cards.number).join(', ')}`
  );
};

pushJSONFileToDB();
