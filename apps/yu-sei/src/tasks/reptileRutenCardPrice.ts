import { RutenService } from '../services/rutenPrice';
import { CustomLogger } from '../utils/logger';
import { DataAccessService } from '@ygo/mongo-server';
import { DataAccessEnum, CardsDataType } from '@ygo/schemas';

export const reptileRutenCardPrice = async () => {
  const mongoUrl = `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;
  const logger = new CustomLogger();
  const dataAccessService = new DataAccessService(mongoUrl);
  const testCard = await dataAccessService.find<CardsDataType>(
    DataAccessEnum.CARDS,
    {
      id: 'PAC1-JP004',
    }
  );
  const rutenService = new RutenService(dataAccessService, logger);
  const { updateFailedId, noPriceId, successIds } =
    await rutenService.getRutenPrice(testCard);
  console.log(updateFailedId, noPriceId, successIds);
};
