import { DataCacheService } from '@ygo/cache';
import { DataAccessService } from '@ygo/mongo-server';
import {
  GetCardListRequestType,
  PageInfoRequestType,
  CardsDataType,
} from '@ygo/schemas';
import { FastifyBaseLogger } from 'fastify';
import { PipelineStage, QueryOptions } from 'mongoose';
import { CardRedisProviderService } from './provider/redis.service';
import { CardsHelperService } from './helper/index.service';
import { CardDalService } from './provider/dal.service';
import {
  CardInfoMap,
  SetKeyUpdateCache,
  CardCompoundKey,
} from './types/index.type';
import {
  CardCacheError,
  CardQueryError,
  CardValidationError,
} from '../error/business';

export class CardService {
  private readonly redis: CardRedisProviderService;
  private readonly helper: CardsHelperService;
  private readonly dal: CardDalService;
  private readonly updateCacheSetKeys: SetKeyUpdateCache = new Map();
  constructor(
    private readonly da: DataAccessService,
    private readonly cache: DataCacheService,
    private readonly logger: FastifyBaseLogger
  ) {
    this.logger.info('CardService initialized');
    this.redis = new CardRedisProviderService(this.cache, this.logger);
    this.helper = new CardsHelperService();
    this.dal = new CardDalService(this.da);
  }

  /**
   * 獲取卡片列表
   * @param filter 過濾條件
   * @param pageInfo 分頁信息
   * @param needEffect 是否需要效果
   * @param options 查詢選項
   * @returns 卡片列表和總數
   */
  public async getCardList(
    filter: GetCardListRequestType,
    pageInfo: PageInfoRequestType,
    needEffect: boolean = false,
    options: QueryOptions = {}
  ): Promise<{ data: CardsDataType[]; total: number }> {
    try {
      const { page, limit } = pageInfo;

      // 驗證分頁參數
      if (!page || page < 1 || !limit || limit < 1) {
        throw new CardValidationError('分頁參數無效');
      }

      const { name, atk_t, atk_l, def_t, def_l, effect, ...staticFilters } =
        filter;
      const caculateFilters = {
        ...(name ? { name } : {}),
        ...(atk_t ? { atk_t } : {}),
        ...(atk_l ? { atk_l } : {}),
        ...(def_t ? { def_t } : {}),
        ...(def_l ? { def_l } : {}),
        ...(effect ? { effect } : {}),
      };
      const staticFilterSetKeys =
        this.helper.buildStaticFilterSetKeys(staticFilters);

      let resultSize: number;
      try {
        resultSize = await this.redis.estimateResultSize(staticFilterSetKeys);
      } catch (error) {
        this.logger.error(`估算結果大小失敗: ${JSON.stringify(error)}`);
        throw new CardCacheError('estimateResultSize', JSON.stringify(error));
      }

      const cardIdList: string[] = [];

      const mustUseDbQuery = Object.keys(caculateFilters).length > 0;

      this.logger.info(`getCardList mustUseDbQuery: ${mustUseDbQuery}`);

      // 純靜態 filter 或 靜態 filter 數量小於2000 且 有動態 filter
      if (!mustUseDbQuery || resultSize < 2000) {
        cardIdList.push(
          ...(await this.redis.getCardIdsFromIntersection(staticFilterSetKeys))
        );
      }

      // 純靜態 filter
      if (!mustUseDbQuery) {
        const pagedCardIdList = this.helper.paginateCardKeyList(
          cardIdList,
          page,
          limit
        );

        const cardList = await this.redis.getCardListByCache(
          pagedCardIdList,
          needEffect
        );

        if (cardList.length > 0) {
          this.logger.info(`getCardList cardList by cache`);
          return {
            data: cardList,
            total: resultSize,
          };
        }
      }

      let pipeline: PipelineStage[] = [];

      pipeline = this.helper.buildCaculateDbFilter(
        pipeline,
        filter,
        cardIdList.length === 0
      );

      if (filter.forbidden || cardIdList.length > 0) {
        pipeline.push(
          await this.dal.buildSetAndForbiddenQueryFilter(
            cardIdList,
            filter.forbidden,
            options
          )
        );
      }

      this.logger.info(`getCardList pipeline: ${JSON.stringify(pipeline)}`);

      if (pipeline.length > 0) {
        try {
          const cardList = await this.dal.getCardListByDb(
            [
              ...pipeline,
              {
                $project: {
                  price_info: 0,
                  price_yuyu: 0,
                  __v: 0,
                  effect: needEffect ? 0 : 1,
                },
              },
              { $skip: (page - 1) * limit },
              { $limit: limit },
            ],
            options
          );

          return {
            data: cardList,
            total: resultSize || 0,
          };
        } catch (error) {
          this.logger.error(`獲取卡片列表失敗: ${JSON.stringify(error)}`);
          throw new CardQueryError('aggregate', JSON.stringify(error));
        }
      } else {
        try {
          const { data: cardList, total } = await this.dal.findCardList(
            filter,
            {
              page,
              limit,
            },
            options,
            needEffect
          );

          return {
            data: cardList,
            total: total || 0,
          };
        } catch (error) {
          this.logger.error(`獲取卡片列表失敗: ${JSON.stringify(error)}`);
          throw new CardQueryError('find', JSON.stringify(error));
        }
      }
    } catch (error) {
      // 其他未預期的錯誤
      this.logger.error(`未預期的錯誤: ${JSON.stringify(error)}`);
      throw new CardQueryError('unexpected', JSON.stringify(error));
    }
  }

  /**
   * 更新緩存集合鍵列表
   * @param filter 過濾條件
   */
  public async updateCacheSetKey(
    filter: GetCardListRequestType
  ): Promise<void> {
    try {
      if (Object.keys(filter).length === 0) {
        return;
      }

      const staticFilterSetKeyList =
        this.helper.buildStaticFilterSetKeys(filter);

      const needUpdateSetKeyList = this.helper.getSetKeyListNeedingUpdate(
        staticFilterSetKeyList,
        this.updateCacheSetKeys
      );

      this.logger.info(
        `updateCacheSetKey needUpdateSetKeyList: ${JSON.stringify(needUpdateSetKeyList)}`
      );

      if (needUpdateSetKeyList.length > 0) {
        try {
          // 更新 cache 集合鍵列表
          const cardInfoMap =
            await this.updateCacheSetKeyList(needUpdateSetKeyList);

          // 如果 cardInfoMap 有資料，則更新 cache 集合鍵列表
          if (cardInfoMap.size > 0) {
            await this.updateCardInfoCache(cardInfoMap);
          }
        } catch (error) {
          this.logger.error(`更新緩存集合鍵失敗: ${JSON.stringify(error)}`);
          throw new CardCacheError('updateSetKey', JSON.stringify(error));
        }
      }
    } catch (error) {
      // 記錄錯誤但不拋出，因為這是在回應後的非同步操作
      this.logger.error(`更新緩存失敗: ${JSON.stringify(error)}`);
    }
  }

  /**
   * 更新卡片信息緩存
   * @param cardInfoMap 卡片資訊映射
   */
  private async updateCardInfoCache(cardInfoMap: CardInfoMap) {
    try {
      const cardIdList = Array.from(cardInfoMap.keys());

      const missingCardIdList =
        await this.redis.getMissingCardIdList(cardIdList);

      if (missingCardIdList.length > 0) {
        const missingCardInfoList =
          await this.dal.getCardInfoListByIdList(missingCardIdList);
        await this.redis.bulkSetCardInfo(missingCardInfoList);
      }
    } catch (error) {
      this.logger.error(`更新卡片信息緩存失敗: ${JSON.stringify(error)}`);
      throw new CardCacheError('updateCardInfoCache', JSON.stringify(error));
    }
  }

  /**
   * 更新緩存集合鍵列表
   * @param setKeyList 集合鍵列表
   * @returns 更新的卡片資訊映射
   */
  private async updateCacheSetKeyList(
    setKeyList: string[]
  ): Promise<CardInfoMap> {
    try {
      const now = new Date();
      const cardInfoMap: CardInfoMap = new Map();

      for (const setKey of setKeyList) {
        try {
          // 解析集合鍵
          const [prefix, featureType, featureValue] = setKey.split(':');

          if (prefix !== 'set' || !featureType || !featureValue) {
            continue;
          }

          const filter = { [featureType]: featureValue };

          const cardList =
            featureType === 'forbidden'
              ? await this.dal.getForbiddenCardList(parseInt(featureValue))
              : await this.dal.getCardInfoList(filter);

          // 儲存卡片資訊並建立鍵集合
          const cardIds: CardCompoundKey[] = [];
          cardList.forEach(card => {
            const cardId = card._id.toString();
            cardIds.push(cardId);
            cardInfoMap.set(cardId, card);
          });

          await this.redis.bulkUpdateSets([setKey], cardIds, 86400 * 7);
          this.updateCacheSetKeys.set(setKey, now);
        } catch (error) {
          this.logger.error(
            `更新集合 ${setKey} 失敗: ${JSON.stringify(error)}`
          );
        }
      }

      return cardInfoMap;
    } catch (error) {
      this.logger.error(`批量更新緩存失敗: ${JSON.stringify(error)}`);
      throw new CardCacheError('updateCacheSetKeyList', JSON.stringify(error));
    }
  }
}
