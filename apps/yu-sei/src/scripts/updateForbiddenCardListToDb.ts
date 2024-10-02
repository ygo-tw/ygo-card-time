import fs from 'fs';
import { ForbiddenCardListDataType, DataAccessEnum } from '@ygo/schemas';
import { DataAccessService } from '@ygo/mongo-server';
import { loadEnv } from '../app';

const updateForbiddenCardListToDb = async () => {
  console.log('updateForbiddenCardListToDb start ...');

  if (!fs.existsSync('./src/scripts/forbiddenCardList.json')) {
    console.log('forbiddenCardList.json 不存在');
    return;
  }

  loadEnv();

  const mongoUrl = `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;
  const dataAccessService = new DataAccessService(mongoUrl);

  const forbiddenCardList = JSON.parse(
    fs.readFileSync('./src/scripts/forbiddenCardList.json', 'utf8')
  ) as {
    number: string;
    type: number;
  }[];
  const issueCardList: string[] = [];
  forbiddenCardList.forEach(async card => {
    const number = card.number;
    const cardData = await dataAccessService.find<ForbiddenCardListDataType>(
      DataAccessEnum.FORBIDDEN_CARD_LIST,
      {
        number,
      }
    );
    if (!cardData) {
      issueCardList.push(number);
    } else if (card.type === 3) {
      await dataAccessService.deleteOne(DataAccessEnum.FORBIDDEN_CARD_LIST, {
        number,
      });
    } else {
      await dataAccessService.findAndUpdate(
        DataAccessEnum.FORBIDDEN_CARD_LIST,
        {
          number,
        },
        {
          type: card.type,
        }
      );
    }
  });

  console.log('Not Found Card Number:', issueCardList.join(', '));
};

updateForbiddenCardListToDb();
