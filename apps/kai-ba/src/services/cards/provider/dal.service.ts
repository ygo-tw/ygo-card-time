import { DataAccessService } from '@ygo/mongo-server';
import {
  DataAccessEnum,
  ForbiddenCardListDataType,
  CardsDataType,
} from '@ygo/schemas';
import { PipelineStage, QueryOptions, AggregateOptions } from 'mongoose';
import { CardKeyPair } from '../types/index.type';

export class CardDalService {
  constructor(private readonly dal: DataAccessService) {}

  public async getCardListByDb(
    pipeline: PipelineStage[],
    options: QueryOptions = {}
  ): Promise<CardsDataType[]> {
    return await this.dal.aggregate<CardsDataType>(
      DataAccessEnum.CARDS,
      pipeline,
      options as AggregateOptions
    );
  }

  public async findCardList(
    filter: Record<string, any>,
    pagination: { page: number; limit: number },
    options: QueryOptions = {}
  ): Promise<{ data: CardsDataType[]; total: number }> {
    const cardList = await this.dal.find<CardsDataType>(
      DataAccessEnum.CARDS,
      filter,
      { price_info: 0, price_yuyu: 0, __v: 0, effect: 0 },
      {
        skip: (pagination.page - 1) * pagination.limit,
        limit: pagination.limit,
        ...options,
      }
    );
    const total = await this.dal.findDocumentCount<CardsDataType>(
      DataAccessEnum.CARDS,
      filter,
      {}
    );

    return {
      data: cardList,
      total: total || 0,
    };
  }

  /**
   * 構建集合和禁限卡查詢過濾器
   * @param cardKeyList 卡片key列表
   * @param forbiddenType 禁限卡類型
   * @returns 過濾器
   */
  public async buildSetAndForbiddenQueryFilter(
    cardKeyList?: string[],
    forbiddenType?: number,
    options: QueryOptions = {}
  ): Promise<PipelineStage> {
    const conditions = [];
    console.log(`cardKeyList: ${JSON.stringify(cardKeyList)}`);
    if (cardKeyList && cardKeyList.length > 0) {
      conditions.push({
        $or: cardKeyList.map(key => {
          const [id, number] = key.split(':');
          return {
            id,
            ...(number !== '--'
              ? {
                  number: {
                    $regex: `^${number}$`,
                    $options: 'i',
                  },
                }
              : {}),
          };
        }),
      });
    }

    if (forbiddenType) {
      const forbiddenCards = await this.dal.find<ForbiddenCardListDataType>(
        DataAccessEnum.FORBIDDEN_CARD_LIST,
        { type: forbiddenType },
        { number: 1, _id: 0 },
        options
      );
      if (forbiddenCards.length > 0) {
        conditions.push({
          $or: forbiddenCards.map(card => ({
            number: { $regex: `^${card.number}`, $options: 'i' },
          })),
        });
      }
    }

    return {
      $match:
        conditions.length > 1 ? { $and: conditions } : conditions[0] || {},
    };
  }

  public async getCardInfoList(
    filter: Record<string, any>,
    options: QueryOptions = {}
  ): Promise<CardsDataType[]> {
    return await this.dal.find<CardsDataType>(
      DataAccessEnum.CARDS,
      filter,
      { price_info: 0, price_yuyu: 0 },
      options
    );
  }

  /**
   * 根據卡片鍵列表獲取卡片資訊列表
   * @param cardKeyList 卡片鍵列表
   * @returns 卡片資訊列表
   */
  public async getCardInfoListByCardKeyList(
    cardKeyList: CardKeyPair[]
  ): Promise<CardsDataType[]> {
    const pairs = cardKeyList.map(key => {
      const [id, number] = key;
      return { id, ...(number !== '--' ? { number } : {}) };
    });

    return await this.dal.find<CardsDataType>(
      DataAccessEnum.CARDS,
      {
        $or: pairs.map(pair => ({
          id: pair.id,
          number: pair.number,
        })),
      },
      { price_info: 0, price_yuyu: 0, __v: 0 }
    );
  }
}
