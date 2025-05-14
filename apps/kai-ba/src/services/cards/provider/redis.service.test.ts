import { CardRedisProviderService } from './redis.service';
import { DataCacheService } from '@ygo/cache';
import { FastifyBaseLogger } from 'fastify';
import { CardKeyPair } from '../types/index.type';
import { CardsDataType } from '@ygo/schemas';

// 模擬簡化的卡片資料，僅用於測試
const mockCardData = function (
  id: string,
  name: string,
  number?: string
): Partial<CardsDataType> {
  return {
    id,
    name,
    number,
    _id: `oid_${id}`,
    type: '效果怪獸',
    attribute: '闇',
    rarity: ['普卡'],
    product_information_type: 'TEST',
  };
};

// 模擬 DataCacheService
const mockGet = jest.fn();
const mockMget = jest.fn();
const mockSet = jest.fn();
const mockMset = jest.fn();
const mockSadd = jest.fn();
const mockSinter = jest.fn();
const mockScard = jest.fn();

jest.mock('@ygo/cache', () => ({
  DataCacheService: jest.fn().mockImplementation(() => ({
    get: mockGet,
    mget: mockMget,
    set: mockSet,
    mset: mockMset,
    sadd: mockSadd,
    sinter: mockSinter,
    scard: mockScard,
  })),
}));

describe('CardRedisProviderService', () => {
  let redisService: CardRedisProviderService;
  let cacheService: jest.Mocked<DataCacheService>;
  let logger: jest.Mocked<FastifyBaseLogger>;

  beforeEach(() => {
    jest.clearAllMocks();
    cacheService = new DataCacheService(
      {} as any,
      {} as any,
      {} as any
    ) as jest.Mocked<DataCacheService>;
    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      fatal: jest.fn(),
    } as unknown as jest.Mocked<FastifyBaseLogger>;

    redisService = new CardRedisProviderService(cacheService, logger);
  });

  describe('getCardListByCache', () => {
    it.each([
      [
        '基本卡片鍵列表',
        ['oid_TEST-001', 'oid_TEST-002'],
        [
          { data: mockCardData('TEST-001', '測試怪獸1', '1234') },
          { data: mockCardData('TEST-002', '測試怪獸2', '5678') },
        ],
        [
          mockCardData('TEST-001', '測試怪獸1', '1234'),
          mockCardData('TEST-002', '測試怪獸2', '5678'),
        ],
      ],
      [
        '部分卡片不存在',
        ['oid_TEST-001', 'oid_TEST-002'],
        [{ data: mockCardData('TEST-001', '測試怪獸1', '1234') }, null],
        [mockCardData('TEST-001', '測試怪獸1', '1234')],
      ],
      ['全部卡片不存在', ['oid_TEST-001', 'oid_TEST-002'], [null, null], []],
    ])(
      'Given %s, when getCardListByCache is called, then should return correct card list',
      async (_, cardIdList, mockResponse, expected) => {
        // Arrange
        mockMget.mockResolvedValue(mockResponse);
        const keysList = cardIdList.map(id => [id]);

        // Act
        const result = await redisService.getCardListByCache(cardIdList);

        // Assert
        expect(result).toEqual(expected);
        expect(mockMget).toHaveBeenCalledWith(keysList);
      }
    );

    it('Given empty card ID list, when getCardListByCache is called, then should return empty list', async () => {
      // Arrange
      const cardIdList: CardKeyPair[] = [];

      // Act
      const result = await redisService.getCardListByCache(cardIdList);

      // Assert
      expect(result).toEqual([]);
      expect(mockMget).not.toHaveBeenCalled();
    });
  });

  describe('getCardIdsFromIntersection', () => {
    it.each([
      [
        '基本集合鍵列表',
        ['set:type:效果怪獸', 'set:attribute:闇'],
        ['oid_id1', 'oid_id2', 'oid_id3'],
      ],
      ['單一集合鍵', ['set:race:龍族'], ['oid_id4', 'oid_id5']],
      ['空結果', ['set:type:fusion', 'set:attribute:dark'], []],
    ])(
      'Given %s, when getCardIdsFromIntersection is called, then should return correct card IDs',
      async (_, filterKeys, expected) => {
        // Arrange
        mockSinter.mockResolvedValue(expected);

        // Act
        const result =
          await redisService.getCardIdsFromIntersection(filterKeys);

        // Assert
        expect(result).toEqual(expected);
        expect(mockSinter).toHaveBeenCalledWith(...filterKeys);
      }
    );

    it('Given empty filter keys, when getCardIdsFromIntersection is called, then should return empty list', async () => {
      // Arrange
      const filterKeys: string[] = [];

      // Act
      const result = await redisService.getCardIdsFromIntersection(filterKeys);

      // Assert
      expect(result).toEqual([]);
      expect(mockSinter).not.toHaveBeenCalled();
    });

    it('Given sinter throws error, when getCardIdsFromIntersection is called, then should handle error and return empty list', async () => {
      // Arrange
      const filterKeys = ['set:type:效果怪獸', 'set:attribute:闇'];
      const error = new Error('Redis error');
      mockSinter.mockRejectedValue(error);

      // Act
      const result = await redisService.getCardIdsFromIntersection(filterKeys);

      // Assert
      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('執行集合交集失敗')
      );
    });
  });

  describe('bulkUpdateSets', () => {
    it.each([
      [
        '基本集合更新',
        ['set:type:效果怪獸', 'set:attribute:闇'],
        ['oid_id1', 'oid_id2'],
        86400,
      ],
      ['自定義TTL', ['set:race:龍族'], ['oid_id3', 'oid_id4'], 3600],
    ])(
      'Given %s, when bulkUpdateSets is called, then should update sets correctly',
      async (_, setKeys, cardIdList, ttlSeconds) => {
        // Arrange
        mockSadd.mockImplementation(() => Promise.resolve(true));

        // Act
        await redisService.bulkUpdateSets(setKeys, cardIdList, ttlSeconds);

        // Assert
        expect(mockSadd).toHaveBeenCalledTimes(setKeys.length);
        setKeys.forEach(setKey => {
          expect(mockSadd).toHaveBeenCalledWith(setKey, cardIdList, ttlSeconds);
        });
      }
    );

    it('Given empty set keys or card IDs, when bulkUpdateSets is called, then should do nothing', async () => {
      // Arrange
      const emptySetKeys: string[] = [];
      const emptyCardIds: string[] = [];
      const validSetKeys = ['set:type:效果怪獸'];
      const validCardIds = ['oid_id1'];

      // Act & Assert
      await redisService.bulkUpdateSets(emptySetKeys, validCardIds);
      await redisService.bulkUpdateSets(validSetKeys, emptyCardIds);

      expect(mockSadd).not.toHaveBeenCalled();
    });

    it('Given sadd throws error, when bulkUpdateSets is called, then should handle error', async () => {
      // Arrange
      const setKeys = ['set:type:效果怪獸'];
      const cardIdList = ['oid_id1'];
      const error = new Error('Redis error');
      mockSadd.mockRejectedValue(error);

      // Act
      await redisService.bulkUpdateSets(setKeys, cardIdList);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('批量更新集合失敗')
      );
    });
  });

  describe('estimateResultSize', () => {
    it.each([
      [
        '多個集合',
        ['set:type:效果怪獸', 'set:attribute:闇', 'set:race:龍族'],
        [100, 50, 25],
        25,
      ],
      ['單一集合', ['set:race:龍族'], [10], 10],
    ])(
      'Given %s, when estimateResultSize is called, then should return minimum size',
      async (_, setKeys, cardCounts, expected) => {
        // Arrange
        setKeys.forEach((_, index) => {
          mockScard.mockResolvedValueOnce(cardCounts[index]);
        });

        // Act
        const result = await redisService.estimateResultSize(setKeys);

        // Assert
        expect(result).toEqual(expected);
        expect(mockScard).toHaveBeenCalledTimes(setKeys.length);
        setKeys.forEach(setKey => {
          expect(mockScard).toHaveBeenCalledWith(setKey);
        });
      }
    );

    it('Given empty set keys, when estimateResultSize is called, then should return Infinity', async () => {
      // Arrange
      const setKeys: string[] = [];

      // Act
      const result = await redisService.estimateResultSize(setKeys);

      // Assert
      expect(result).toBe(Infinity);
      expect(mockScard).not.toHaveBeenCalled();
    });
  });

  describe('getMissingCardIdList', () => {
    beforeEach(() => {
      // 重置所有模擬
      jest.clearAllMocks();
    });

    it('Given some missing cards, when getMissingCardIdList is called, then should return missing card IDs', async () => {
      // Arrange
      const cardIdList = ['oid_TEST-001', 'oid_TEST-002', 'oid_TEST-003'];

      // 模擬兩張卡片存在，一張不存在
      jest
        .spyOn(redisService, 'getCardListByCache')
        .mockResolvedValue([
          mockCardData('TEST-001', '測試怪獸1', '1234'),
          mockCardData('TEST-002', '測試怪獸2', '5678'),
        ] as CardsDataType[]);

      // Act
      const result = await redisService.getMissingCardIdList(cardIdList);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual('oid_TEST-003'); // 第三個卡片被識別為缺失
      expect(redisService.getCardListByCache).toHaveBeenCalledWith(cardIdList);
    });

    it('Given all cards exist, when getMissingCardIdList is called, then should return empty list', async () => {
      // Arrange
      const cardIdList = ['oid_TEST-001', 'oid_TEST-002'];

      // 模擬所有卡片都存在
      jest
        .spyOn(redisService, 'getCardListByCache')
        .mockResolvedValue([
          mockCardData('TEST-001', '測試怪獸1', '1234'),
          mockCardData('TEST-002', '測試怪獸2', '5678'),
        ] as CardsDataType[]);

      // Act
      const result = await redisService.getMissingCardIdList(cardIdList);

      // Assert
      expect(result).toHaveLength(0);
      expect(redisService.getCardListByCache).toHaveBeenCalledWith(cardIdList);
    });

    it('Given all cards missing, when getMissingCardIdList is called, then should return all card IDs', async () => {
      // Arrange
      const cardIdList = ['oid_TEST-001', 'oid_TEST-002'];

      // 模擬所有卡片都不存在
      jest.spyOn(redisService, 'getCardListByCache').mockResolvedValue([]);

      // Act
      const result = await redisService.getMissingCardIdList(cardIdList);

      // Assert
      expect(result).toEqual(cardIdList);
      expect(redisService.getCardListByCache).toHaveBeenCalledWith(cardIdList);
    });
  });

  describe('bulkSetCardInfo', () => {
    it('Given card info list, when bulkSetCardInfo is called, then should set card info correctly', async () => {
      // Arrange
      const cardInfoList = [
        mockCardData('TEST-001', '測試怪獸1', '1234'),
        mockCardData('TEST-002', '測試怪獸2', '5678'),
      ] as CardsDataType[];

      mockMset.mockResolvedValue(true);

      // Act
      await redisService.bulkSetCardInfo(cardInfoList);

      // Assert
      expect(mockMset).toHaveBeenCalledWith(
        cardInfoList.map(card => ({
          keys: [card._id.toString()],
          value: card,
        }))
      );
    });

    it('Given mset throws error, when bulkSetCardInfo is called, then should propagate error', async () => {
      // Arrange
      const cardInfoList = [
        mockCardData('TEST-001', '測試怪獸1', '1234'),
      ] as CardsDataType[];
      const error = new Error('Redis error');
      mockMset.mockRejectedValue(error);

      // Act & Assert
      await expect(redisService.bulkSetCardInfo(cardInfoList)).rejects.toThrow(
        error
      );
    });
  });
});
