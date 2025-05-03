import { DataAccessService } from '@ygo/mongo-server';
import {
  DataAccessEnum,
  ForbiddenCardListDataType,
  CardsDataType,
} from '@ygo/schemas';
import { PipelineStage, QueryOptions, AggregateOptions } from 'mongoose';

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
    options: QueryOptions = {},
    needEffect: boolean = false
  ): Promise<{ data: CardsDataType[]; total: number }> {
    const cardList = await this.dal.find<CardsDataType>(
      DataAccessEnum.CARDS,
      filter,
      { price_info: 0, price_yuyu: 0, __v: 0, effect: needEffect ? 0 : 1 },
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
   * @param cardIdList 卡片ID列表
   * @param forbiddenType 禁限卡類型
   * @returns 過濾器
   */
  public async buildSetAndForbiddenQueryFilter(
    cardIdList?: string[],
    forbiddenType?: number,
    options: QueryOptions = {}
  ): Promise<PipelineStage> {
    const conditions = [];
    if (cardIdList && cardIdList.length > 0) {
      conditions.push({
        $or: [{ _id: { $in: cardIdList } }],
      });
    }

    if (forbiddenType) {
      const forbiddenCards = await this.getForbidden(forbiddenType, options);
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

  /**
   * 根據過濾條件獲取卡片資訊列表
   * @param filter 過濾條件
   * @param options 查詢選項
   * @returns 卡片資訊列表
   */
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
   * 根據 _id 列表獲取卡片信息列表
   * @param idList 卡片 _id 列表
   * @returns 卡片信息列表
   */
  public async getCardInfoListByIdList(
    idList: string[]
  ): Promise<CardsDataType[]> {
    if (!idList.length) return [];

    return await this.dal.find<CardsDataType>(
      DataAccessEnum.CARDS,
      {
        _id: { $in: idList },
      },
      { price_info: 0, price_yuyu: 0, __v: 0 }
    );
  }

  /**
   * 根據禁限卡類型獲取卡片ID列表
   * @param forbiddenType 禁限卡類型
   * @param options 查詢選項
   * @returns 卡片ID列表
   */
  public async getForbiddenCardList(
    forbiddenType: number,
    options: QueryOptions = {}
  ): Promise<CardsDataType[]> {
    const pipeline: PipelineStage[] = [
      // 先查詢禁限卡
      {
        $match: { type: forbiddenType },
      },
      // 查找禁限卡列表
      {
        $lookup: {
          from: DataAccessEnum.CARDS,
          let: { forbiddenNumber: '$number' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $regexMatch: {
                    input: '$number',
                    regex: { $concat: ['^', '$$forbiddenNumber'] },
                    options: 'i',
                  },
                },
              },
            },
            {
              $project: { _id: 1 },
            },
          ],
          as: 'cards',
        },
      },
      // 展開卡片列表
      { $unwind: '$cards' },
      // 只保留卡片ID
      { $replaceRoot: { newRoot: '$cards' } },
    ];

    return await this.dal.aggregate<CardsDataType>(
      DataAccessEnum.FORBIDDEN_CARD_LIST,
      pipeline,
      options as AggregateOptions
    );
  }

  /**
   * 根據過濾條件獲取禁限卡列表
   * @param forbiddenType 禁限卡類型
   * @param options 查詢選項
   * @returns 禁限卡列表
   */
  private async getForbidden(
    forbiddenType: number,
    options: QueryOptions = {}
  ): Promise<ForbiddenCardListDataType[]> {
    return await this.dal.find<ForbiddenCardListDataType>(
      DataAccessEnum.FORBIDDEN_CARD_LIST,
      { type: forbiddenType },
      { number: 1, _id: 0 },
      options
    );
  }
}
