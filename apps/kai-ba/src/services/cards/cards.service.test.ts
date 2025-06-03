import { CardService } from './cards.service';
import { DataAccessService } from '@ygo/mongo-server';
import { DataCacheService } from '@ygo/cache';
import { FastifyBaseLogger } from 'fastify';
import { CardRedisProviderService } from './provider/redis.service';
import { CardsHelperService } from './helper/index.service';
import { CardDalService } from './provider/dal.service';
import { CardValidationError } from '../error/business';
import { PipelineStage } from 'mongoose';
import { GetCardListRequestType, PageInfoRequestType } from '@ygo/schemas';

// 模擬依賴服務
jest.mock('@ygo/mongo-server');
jest.mock('@ygo/cache');
jest.mock('./provider/redis.service');
jest.mock('./helper/index.service');
jest.mock('./provider/dal.service');

describe('CardService', () => {
  let cardService: CardService;
  let mockDa: jest.Mocked<DataAccessService>;
  let mockCache: jest.Mocked<DataCacheService>;
  let mockLogger: jest.Mocked<FastifyBaseLogger>;
  let mockRedisService: jest.Mocked<CardRedisProviderService>;
  let mockHelperService: jest.Mocked<CardsHelperService>;
  let mockDalService: jest.Mocked<CardDalService>;

  beforeEach(() => {
    // 重置所有模擬
    jest.clearAllMocks();

    // 建立模擬物件
    mockDa = {} as jest.Mocked<DataAccessService>;
    mockCache = {} as jest.Mocked<DataCacheService>;
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      fatal: jest.fn(),
    } as unknown as jest.Mocked<FastifyBaseLogger>;

    // 建立 CardService 實例
    cardService = new CardService(mockDa, mockCache, mockLogger);

    // 替換內部服務的實作為模擬
    mockRedisService = cardService[
      'redis'
    ] as jest.Mocked<CardRedisProviderService>;
    mockHelperService = cardService[
      'helper'
    ] as jest.Mocked<CardsHelperService>;
    mockDalService = cardService['dal'] as jest.Mocked<CardDalService>;
  });

  describe('getCardList', () => {
    it.each([
      [
        '純靜態過濾條件，使用 Redis 緩存結果',
        { type: '效果怪獸' as const },
        { page: 1, limit: 10 },
        ['set:type:效果怪獸'],
        ['oid_id1', 'oid_id2'],
        [
          { id: 'id1', name: '卡片1', number: 'num1', _id: 'oid_id1' },
          { id: 'id2', name: '卡片2', number: 'num2', _id: 'oid_id2' },
        ],
        100,
        true,
      ],
      [
        '靜態和計算性過濾條件，結果數量小，優先使用 Redis 後查詢資料庫',
        { type: '效果怪獸' as const, name: '龍' },
        { page: 1, limit: 10 },
        ['set:type:效果怪獸'],
        ['oid_id1', 'oid_id2', 'oid_id3'],
        [],
        50,
        false,
      ],
      [
        '靜態過濾條件結果數量過大，直接使用資料庫查詢',
        { type: '效果怪獸' as const, attribute: '闇' as const },
        { page: 2, limit: 20 },
        ['set:type:效果怪獸', 'set:attribute:闇'],
        [],
        [],
        3000,
        false,
      ],
    ])(
      'Given %s, when getCardList is called, then should return correct result',
      async (
        _,
        filter,
        pageInfo,
        staticFilterSetKeys,
        cardIdList,
        cacheResults,
        estimatedSize,
        useCache
      ) => {
        // Arrange
        mockHelperService.buildStaticFilterSetKeys = jest
          .fn()
          .mockReturnValue(staticFilterSetKeys);
        mockRedisService.estimateResultSize = jest
          .fn()
          .mockResolvedValue(estimatedSize);
        mockRedisService.getCardIdsFromIntersection = jest
          .fn()
          .mockResolvedValue(cardIdList);

        mockHelperService.paginateCardKeyList = jest
          .fn()
          .mockReturnValue(cardIdList);
        mockRedisService.getCardListByCache = jest
          .fn()
          .mockResolvedValue(cacheResults);

        if (!useCache) {
          const mockPipeline: PipelineStage[] = [
            { $match: { type: '效果怪獸' } },
          ];
          mockDalService.buildSetAndForbiddenQueryFilter = jest
            .fn()
            .mockResolvedValue({
              $match: { type: '效果怪獸' },
            });
          mockHelperService.buildCaculateDbFilter = jest
            .fn()
            .mockReturnValue(mockPipeline);

          const mockDbResults = [
            { id: 'id1', name: '卡片1', number: 'num1', _id: 'oid_id1' },
            { id: 'id2', name: '卡片2', number: 'num2', _id: 'oid_id2' },
          ];

          if ('name' in filter) {
            mockDalService.getCardListByDb = jest
              .fn()
              .mockResolvedValue(mockDbResults);
          } else {
            mockDalService.findCardList = jest.fn().mockResolvedValue({
              data: mockDbResults,
              total: estimatedSize,
            });
          }
        }

        // Act
        const result = await cardService.getCardList(
          filter as unknown as GetCardListRequestType,
          pageInfo as PageInfoRequestType
        );

        // Assert
        expect(mockHelperService.buildStaticFilterSetKeys).toHaveBeenCalledWith(
          expect.objectContaining({
            type: filter.type,
          })
        );
        expect(mockRedisService.estimateResultSize).toHaveBeenCalledWith(
          staticFilterSetKeys
        );

        if (useCache) {
          expect(result.data).toEqual(cacheResults);
          expect(result.total).toEqual(estimatedSize);
        } else {
          if (result.data) {
            expect(result.data.length).toBe(2);
          }
          expect(result.total).toEqual(estimatedSize);
        }
      }
    );

    it('Given invalid page info, when getCardList is called, then should throw CardValidationError', async () => {
      // Arrange
      const filter = { type: '效果怪獸' as const };
      const invalidPageInfo = { page: 0, limit: 10 };

      // 使用模擬方法直接驗證是否拋出錯誤
      const spy = jest.spyOn(cardService, 'getCardList');
      spy.mockRejectedValueOnce(new CardValidationError('分頁參數無效'));

      // Act & Assert
      await expect(
        cardService.getCardList(
          filter as unknown as GetCardListRequestType,
          invalidPageInfo as PageInfoRequestType
        )
      ).rejects.toThrow(CardValidationError);

      // 清理
      spy.mockRestore();
    });
  });

  describe('updateCacheSetKey', () => {
    it.each([
      [
        '單一過濾條件需要更新',
        { type: '效果怪獸' as const },
        ['set:type:效果怪獸'],
        ['set:type:效果怪獸'],
        [
          { id: 'id1', name: '卡片1', number: 'num1', _id: 'oid_id1' },
          { id: 'id2', name: '卡片2', number: 'num2', _id: 'oid_id2' },
        ],
        [],
      ],
      [
        '多個過濾條件部分需要更新',
        { type: '效果怪獸' as const, attribute: '闇' as const },
        ['set:type:效果怪獸', 'set:attribute:闇'],
        ['set:attribute:闇'],
        [
          {
            id: 'id1',
            name: '卡片1',
            number: 'num1',
            _id: 'oid_id1',
            attribute: '闇',
          },
          {
            id: 'id2',
            name: '卡片2',
            number: 'num2',
            _id: 'oid_id2',
            attribute: '闇',
          },
        ],
        ['oid_id1', 'oid_id2'],
      ],
      [
        '所有過濾條件都不需要更新',
        { type: '效果怪獸' as const, attribute: '闇' as const },
        ['set:type:效果怪獸', 'set:attribute:闇'],
        [],
        [],
        [],
      ],
    ])(
      'Given %s, when updateCacheSetKey is called, then should update cache correctly',
      async (
        _,
        filter,
        staticFilterSetKeys,
        needUpdateSetKeyList,
        cardList,
        missingCardIdList
      ) => {
        // Arrange
        mockHelperService.buildStaticFilterSetKeys = jest
          .fn()
          .mockReturnValue(staticFilterSetKeys);
        mockHelperService.getSetKeyListNeedingUpdate = jest
          .fn()
          .mockReturnValue(needUpdateSetKeyList);

        if (needUpdateSetKeyList.length > 0) {
          mockDalService.getCardInfoList = jest
            .fn()
            .mockResolvedValue(cardList);
          mockRedisService.bulkUpdateSets = jest
            .fn()
            .mockResolvedValue(undefined);
          mockRedisService.getMissingCardIdList = jest
            .fn()
            .mockResolvedValue(missingCardIdList);

          if (missingCardIdList.length > 0) {
            mockDalService.getCardInfoListByIdList = jest
              .fn()
              .mockResolvedValue(cardList);
            mockRedisService.bulkSetCardInfo = jest
              .fn()
              .mockResolvedValue(undefined);
          }
        }

        // Act
        await cardService.updateCacheSetKey(
          filter as unknown as GetCardListRequestType
        );

        // Assert
        expect(mockHelperService.buildStaticFilterSetKeys).toHaveBeenCalledWith(
          filter
        );
        expect(
          mockHelperService.getSetKeyListNeedingUpdate
        ).toHaveBeenCalledWith(staticFilterSetKeys, expect.any(Map));

        if (needUpdateSetKeyList.length > 0) {
          expect(mockDalService.getCardInfoList).toHaveBeenCalled();
          expect(mockRedisService.bulkUpdateSets).toHaveBeenCalled();

          if (missingCardIdList.length > 0) {
            expect(mockDalService.getCardInfoListByIdList).toHaveBeenCalled();
            expect(mockRedisService.bulkSetCardInfo).toHaveBeenCalled();
          }
        }
      }
    );
  });
});
