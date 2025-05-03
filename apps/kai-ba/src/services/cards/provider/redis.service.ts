import { CacheItem, DataCacheService } from '@ygo/cache';
import { CardsDataType } from '@ygo/schemas';
import { FastifyBaseLogger } from 'fastify';
import { CardCompoundKey, CardKeyPair, SetKey } from '../types/index.type';

export class CardRedisProviderService {
  constructor(
    private readonly cache: DataCacheService,
    private readonly logger: FastifyBaseLogger
  ) {}

  /**
   * 根據卡片ID列表從緩存獲取卡片信息
   * @param cardIdList 卡片ID列表 (MongoDB ObjectId 字串)
   * @returns 卡片信息列表
   */
  public async getCardListByCache(
    cardIdList: CardKeyPair[],
    needEffect: boolean = false
  ): Promise<CardsDataType[]> {
    if (!cardIdList || cardIdList.length === 0) {
      return [];
    }

    // 將 _id 列表轉換為單元素陣列，以符合 mget 接口
    const keysList = cardIdList.map(id => [id]);
    const cardList = (await this.cache.mget<CardsDataType>(keysList))
      .filter(card => card?.data)
      .map(card => card!.data)
      .map(card => {
        if (!needEffect) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { effect: _, ...rest } = card;
          return rest;
        }
        return card;
      });

    return cardList;
  }

  /**
   * 執行集合交集獲取卡片ID
   * @param filterKeys 過濾集合的鍵列表
   * @returns 交集結果中的卡片ID列表
   */
  public async getCardIdsFromIntersection(
    filterKeys: SetKey[]
  ): Promise<CardCompoundKey[]> {
    if (!filterKeys || filterKeys.length === 0) {
      return [];
    }
    try {
      // 執行集合交集操作
      const cardIds = await this.cache.sinter(...filterKeys);
      return cardIds;
    } catch (error) {
      this.logger.error(`執行集合交集失敗: ${JSON.stringify(error)}`);
      return [];
    }
  }

  /**
   * 批量更新多個集合的卡片索引
   * @param setKeys 集合鍵列表
   * @param cardIdList 要添加的卡片ID列表
   * @param ttlSeconds 過期時間
   */
  public async bulkUpdateSets(
    setKeys: SetKey[],
    cardIdList: CardCompoundKey[],
    ttlSeconds = 86400
  ): Promise<void> {
    if (!setKeys.length || !cardIdList.length) {
      return;
    }

    try {
      // 對每個集合鍵，添加所有卡片ID
      const promises = setKeys.map(setKey =>
        this.cache.sadd(setKey, cardIdList, ttlSeconds)
      );

      await Promise.all(promises);
    } catch (error) {
      this.logger.error(`批量更新集合失敗: ${JSON.stringify(error)}`);
    }
  }

  /**
   * 估計集合交集的結果大小
   * @param setKeys 集合鍵列表
   * @returns 估計的結果大小上限
   */
  public async estimateResultSize(setKeys: SetKey[]): Promise<number> {
    if (setKeys.length === 0) {
      return Infinity;
    }

    const sizes = await Promise.all(setKeys.map(key => this.cache.scard(key)));

    return Math.min(...sizes);
  }

  /**
   * 獲取緩存中缺失的卡片ID列表
   * @param cardIdList 卡片ID列表
   * @returns 緩存中缺失的卡片ID列表
   */
  public async getMissingCardIdList(
    cardIdList: CardKeyPair[]
  ): Promise<CardKeyPair[]> {
    const existingCardInfos = await this.getCardListByCache(cardIdList);

    // 使用索引比較確定哪些卡片不存在
    const missingCardIdList = cardIdList.filter(
      (_, index) => !existingCardInfos[index]
    );

    return missingCardIdList;
  }

  /**
   * 批量設置卡片信息到緩存
   * @param cardInfoList 卡片信息列表
   */
  public async bulkSetCardInfo(cardInfoList: CardsDataType[]) {
    const items: CacheItem<CardsDataType>[] = cardInfoList.map(card => ({
      keys: [card._id.toString()],
      value: card,
    }));

    await this.cache.mset(items);
  }
}
