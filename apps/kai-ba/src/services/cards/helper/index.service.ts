import { PipelineStage } from 'mongoose';
import {
  CardCompoundKey,
  CardKeyPair,
  SetKey,
  SetKeyFieldConfig,
  StaticFilterParams,
  RangeCondition,
  SetKeyUpdateCache,
} from '../types/index.type';
import { GetCardListRequestType } from '@ygo/schemas';

export class CardsHelperService {
  constructor() {}

  /**
   * 從過濾條件建立靜態過濾條件集合鍵
   * @param filter
   * @returns 集合鍵
   */
  public buildStaticFilterSetKeys(filter: StaticFilterParams): SetKey[] {
    if (Object.keys(filter).length === 0) {
      return ['set:empty:empty'];
    }
    // 定義欄位處理配置
    const fieldConfigs: SetKeyFieldConfig[] = [
      { field: 'number', prefix: 'set:number:' },
      { field: 'id', prefix: 'set:id:' },
      { field: 'type', prefix: 'set:type:' },
      { field: 'attribute', prefix: 'set:attribute:' },
      { field: 'rarity', prefix: 'set:rarity:' },
      { field: 'star', prefix: 'set:star:' },
      { field: 'race', prefix: 'set:race:' },
      {
        field: 'product_information_type',
        prefix: 'set:product_information_type:',
      },
      { field: 'forbidden', prefix: 'set:forbidden:' },
    ];

    return fieldConfigs
      .filter(config => {
        const key = config.field as keyof StaticFilterParams;
        return filter[key] !== undefined && filter[key] !== null;
      })
      .map(config => {
        const key = config.field as keyof StaticFilterParams;
        return `${config.prefix}${filter[key]}`;
      });
  }

  /**
   * 構建計算型過濾條件
   */
  public buildCaculateDbFilter(
    pipeline: PipelineStage[],
    filter: GetCardListRequestType,
    isNeedStaticFilter: boolean
  ): PipelineStage[] {
    const newPipeline = [...pipeline];
    const matchConditions: Record<string, unknown> = {};
    const { name, atk_t, atk_l, def_t, def_l, effect, ...staticFilters } =
      filter;

    // 收集所有數值範圍條件
    if (atk_l || atk_t) {
      matchConditions.atk = this.createRangeCondition(atk_l, atk_t);
    }

    if (def_l || def_t) {
      matchConditions.def = this.createRangeCondition(def_l, def_t);
    }

    if (staticFilters.forbidden) {
      delete staticFilters.forbidden;
    }

    if (isNeedStaticFilter && Object.keys(staticFilters).length > 0) {
      newPipeline.push({ $match: staticFilters as StaticFilterParams });
    }

    if (Object.keys(matchConditions).length > 0) {
      newPipeline.push({ $match: matchConditions });
    }

    // 處理文本搜尋
    if (name || effect) {
      const fuzzyConfig = {
        maxEdits: 1,
        prefixLength: 1,
      };

      const fieldQueries = [
        { field: 'name', value: name },
        { field: 'effect', value: effect },
      ]
        .filter(item => item.value)
        .map(item => ({
          text: {
            query: item.value,
            path: item.field,
            fuzzy: fuzzyConfig,
          },
        }));

      const searchStage = {
        $search: {
          index: 'card_text_search',
          ...(fieldQueries.length === 1
            ? fieldQueries[0]
            : {
                compound: {
                  must: fieldQueries,
                },
                score: { boost: { value: 1.5 } },
              }),
        },
      };

      newPipeline.push(searchStage);
    }

    return newPipeline;
  }

  /**
   * 對卡片ID列表進行分頁
   * @param cardIdList 卡片ID列表 (MongoDB ObjectId 字串)
   * @param page 頁數，從1開始
   * @param limit 每頁筆數
   * @returns 分頁後的卡片ID列表
   */
  public paginateCardKeyList(
    cardIdList: CardCompoundKey[],
    page: number = 1,
    limit: number = 20
  ): CardKeyPair[] {
    if (!cardIdList || cardIdList.length === 0) {
      return [];
    }

    // 驗證並修正頁碼和限制
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(limit, 100)); // 限制最大為100筆

    // 計算分頁
    const startIndex = (safePage - 1) * safeLimit;
    const endIndex = Math.min(startIndex + safeLimit, cardIdList.length);

    // 返回分頁後的ID列表
    return cardIdList.slice(startIndex, endIndex);
  }

  /**
   * 創建數值範圍查詢條件
   * @param lowerBound 下限值
   * @param upperBound 上限值
   * @returns MongoDB範圍條件
   */
  private createRangeCondition<T>(
    lowerBound?: T,
    upperBound?: T
  ): RangeCondition<T> {
    const condition: RangeCondition<T> = {};

    if (lowerBound !== undefined) {
      condition.$gte = lowerBound;
    }

    if (upperBound !== undefined) {
      condition.$lte = upperBound;
    }

    return condition;
  }

  /**
   * 檢查需要更新的集合鍵列表
   * @param staticFilterSetKeyList 靜態過濾條件生成的集合鍵列表
   * @returns 需要更新的集合鍵列表
   */
  public getSetKeyListNeedingUpdate(
    staticFilterSetKeyList: SetKey[],
    updateCacheSetKeys: SetKeyUpdateCache
  ): SetKey[] {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1); // 24小時前的時間戳

    return staticFilterSetKeyList.filter(setKey => {
      // 從 Map 中獲取上次更新時間
      const lastUpdate = updateCacheSetKeys.get(setKey);

      // 需要更新的條件：不在 Map 中，或者上次更新時間超過一天
      return !lastUpdate || lastUpdate < oneDayAgo;
    });
  }
}
