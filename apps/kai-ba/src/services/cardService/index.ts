import { DataAccessService } from '@ygo/mongo-server';
import {
  CardsDataType,
  DataAccessEnum,
  GetCardListRequestType,
  PageInfoRequestType,
} from '@ygo/schemas';
import { QueryOptions, mongo } from 'mongoose';
import { FastifyBaseLogger } from 'fastify';
import {
  CardListCountError,
  GetCardListError,
} from '../errorService/businessError/cardError';

export class CardService {
  private dataAccessService: DataAccessService;
  private logger: FastifyBaseLogger;

  constructor(dataAccessService: DataAccessService, logger: FastifyBaseLogger) {
    this.dataAccessService = dataAccessService;
    this.logger = logger;

    this.logger.info('CardService initialized');
  }

  /**
   * 取得卡片列表
   * @param filter 過濾條件
   * @param pageInfo 分頁資訊
   * @param options 查詢選項
   * @returns 卡片列表
   */
  public async getCardList(
    filter: GetCardListRequestType['filter'],
    pageInfo: PageInfoRequestType,
    options: QueryOptions = {}
  ): Promise<CardsDataType[]> {
    try {
      const cardList = await this.dataAccessService.find<CardsDataType>(
        DataAccessEnum.CARDS,
        filter,
        {
          price_info: 0,
          price_yuyu: 0,
          __v: 0,
        },
        {
          skip: (pageInfo.page - 1) * pageInfo.limit,
          limit: pageInfo.limit,
          ...options,
        }
      );

      return cardList.map(card => ({
        ...card,
        _id: card._id.toString(),
      })) as CardsDataType[];
    } catch (error) {
      throw new GetCardListError(JSON.stringify(filter));
    }
  }

  public async getCardListCount(
    filter: GetCardListRequestType['filter'],
    options: mongo.CountOptions = {}
  ): Promise<number> {
    const cardListCount = await this.dataAccessService.findDocumentCount(
      DataAccessEnum.CARDS,
      filter,
      options
    );

    if (cardListCount === null) {
      throw new CardListCountError(JSON.stringify(filter));
    }

    return cardListCount;
  }
}
