import { CacheItem, DataCacheService } from '@ygo/cache';
import { CardsDataType } from '@ygo/schemas';
import { FastifyBaseLogger } from 'fastify';
import { CardCompoundKey, CardKeyPair, SetKey } from '../types/index.type';

export class CardRedisProviderService {
  constructor(
    private readonly cache: DataCacheService,
    private readonly logger: FastifyBaseLogger
  ) {}

  public async getCardListByCache(
    cardKeyList: CardKeyPair[]
  ): Promise<CardsDataType[]> {
    if (!cardKeyList || cardKeyList.length === 0) {
      return [];
    }

    const cardList = await this.cache.mget<CardsDataType>(cardKeyList);

    return cardList.filter(card => card?.data).map(card => card!.data);
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
   * @param cardKeyList 要添加的卡片鍵列表
   * @param ttlSeconds 過期時間
   */
  public async bulkUpdateSets(
    setKeys: SetKey[],
    cardKeyList: CardCompoundKey[],
    ttlSeconds = 86400
  ): Promise<void> {
    if (!setKeys.length || !cardKeyList.length) {
      return;
    }

    try {
      // 對每個集合鍵，添加所有卡片ID
      const promises = setKeys.map(setKey =>
        this.cache.sadd(setKey, cardKeyList, ttlSeconds)
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
   * 獲取缺失的卡片鍵列表
   * @param cardKeyList 卡片鍵列表
   * @returns 缺失的卡片鍵列表
   */
  public async getMissingCardKeyList(
    cardKeyList: CardKeyPair[]
  ): Promise<CardKeyPair[]> {
    const existingCardInfos = await this.getCardListByCache(cardKeyList);

    const missingCardKeyList = cardKeyList.filter(
      (_, index) => !existingCardInfos[index]
    );

    return missingCardKeyList;
  }

  public async bulkSetCardInfo(cardInfoList: CardsDataType[]) {
    const items: CacheItem<CardsDataType>[] = cardInfoList.map(card => ({
      keys: [card.id, card.number ?? '--'],
      value: card,
    }));

    await this.cache.mset(items);
  }
}
