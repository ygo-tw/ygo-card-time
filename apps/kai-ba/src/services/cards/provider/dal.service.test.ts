import { CardDalService } from './dal.service';
import { DataAccessService } from '@ygo/mongo-server';
import { DataAccessEnum } from '@ygo/schemas';
import { AggregateOptions, PipelineStage } from 'mongoose';
import { CardKeyPair } from '../types/index.type';

// 模擬 DataAccessService
const mockFind = jest.fn();
const mockFindDocumentCount = jest.fn();
const mockAggregate = jest.fn();

jest.mock('@ygo/mongo-server', () => ({
  DataAccessService: jest.fn().mockImplementation(() => ({
    find: mockFind,
    findDocumentCount: mockFindDocumentCount,
    aggregate: mockAggregate,
  })),
}));

describe('CardDalService', () => {
  let dalService: CardDalService;
  let dataAccessService: jest.Mocked<DataAccessService>;

  beforeEach(() => {
    jest.clearAllMocks();
    dataAccessService = new DataAccessService(
      {} as any
    ) as jest.Mocked<DataAccessService>;
    dalService = new CardDalService(dataAccessService);
  });

  describe('getCardListByDb', () => {
    it.each([
      [
        '基本聚合管道',
        [
          { $match: { type: '效果怪獸' } } as PipelineStage,
          { $limit: 10 } as PipelineStage,
        ],
        {},
        [{ id: 'TEST-001', name: '測試怪獸' }],
      ],
      [
        '帶選項的聚合管道',
        [{ $match: { race: '龍族' } } as PipelineStage],
        { allowDiskUse: true },
        [
          { id: 'TEST-002', name: '青眼白龍' },
          { id: 'TEST-003', name: '真紅眼黑龍' },
        ],
      ],
      [
        '複雜的聚合管道',
        [
          { $match: { attribute: '闇' } } as PipelineStage,
          { $sort: { name: 1 } } as PipelineStage,
          { $skip: 5 } as PipelineStage,
          { $limit: 5 } as PipelineStage,
        ],
        { maxTimeMS: 1000 },
        [{ id: 'TEST-004', name: '黑魔導' }],
      ],
    ])(
      'Given %s, when getCardListByDb is called, then should return correct card list',
      async (_, pipeline, options, expected) => {
        // Arrange
        mockAggregate.mockResolvedValue(expected);

        // Act
        const result = await dalService.getCardListByDb(pipeline, options);

        // Assert
        expect(result).toEqual(expected);
        expect(mockAggregate).toHaveBeenCalledWith(
          DataAccessEnum.CARDS,
          pipeline,
          options as AggregateOptions
        );
      }
    );

    it('Given aggregate throws error, when getCardListByDb is called, then should propagate error', async () => {
      // Arrange
      const pipeline: PipelineStage[] = [{ $match: {} } as PipelineStage];
      const error = new Error('Database error');
      mockAggregate.mockRejectedValue(error);

      // Act & Assert
      await expect(dalService.getCardListByDb(pipeline)).rejects.toThrow(error);
    });
  });

  describe('findCardList', () => {
    it.each([
      [
        '基本過濾條件',
        { type: '效果怪獸' },
        { page: 1, limit: 10 },
        {},
        [{ id: 'TEST-001', name: '測試怪獸' }],
        5,
      ],
      [
        '分頁查詢 - 第二頁',
        { race: '龍族' },
        { page: 2, limit: 2 },
        { sort: { name: 1 } },
        [{ id: 'TEST-003', name: '真紅眼黑龍' }],
        3,
      ],
      ['無結果查詢', { id: 'NONEXISTENT' }, { page: 1, limit: 10 }, {}, [], 0],
    ])(
      'Given %s, when findCardList is called, then should return correct card list and total',
      async (_, filter, pagination, options, expectedData, expectedTotal) => {
        // Arrange
        mockFind.mockResolvedValue(expectedData);
        mockFindDocumentCount.mockResolvedValue(expectedTotal);

        // Act
        const result = await dalService.findCardList(
          filter,
          pagination,
          options
        );

        // Assert
        expect(result).toEqual({
          data: expectedData,
          total: expectedTotal,
        });
        expect(mockFind).toHaveBeenCalledWith(
          DataAccessEnum.CARDS,
          filter,
          { price_info: 0, price_yuyu: 0, __v: 0, effect: 0 },
          {
            skip: (pagination.page - 1) * pagination.limit,
            limit: pagination.limit,
            ...options,
          }
        );
        expect(mockFindDocumentCount).toHaveBeenCalledWith(
          DataAccessEnum.CARDS,
          filter,
          {}
        );
      }
    );

    it('Given find throws error, when findCardList is called, then should propagate error', async () => {
      // Arrange
      const filter = { type: '效果怪獸' };
      const pagination = { page: 1, limit: 10 };
      const error = new Error('Database error');
      mockFind.mockRejectedValue(error);

      // Act & Assert
      await expect(dalService.findCardList(filter, pagination)).rejects.toThrow(
        error
      );
    });
  });

  describe('buildSetAndForbiddenQueryFilter', () => {
    it.each([
      [
        '僅卡片鍵列表過濾',
        ['TEST-001:1234', 'TEST-002:5678'],
        undefined,
        {},
        [{ number: '1234' }, { number: '5678' }],
        {
          $match: {
            $or: [
              { id: 'TEST-001', number: { $regex: '^1234$', $options: 'i' } },
              { id: 'TEST-002', number: { $regex: '^5678$', $options: 'i' } },
            ],
          },
        },
      ],
      [
        '包含特殊符號 -- 的卡片鍵',
        ['TEST-003:--'],
        undefined,
        {},
        [],
        {
          $match: {
            $or: [{ id: 'TEST-003' }],
          },
        },
      ],
      [
        '僅禁限卡類型過濾',
        undefined,
        1,
        {},
        [{ number: '1234' }, { number: '5678' }],
        {
          $match: {
            $or: [
              { number: { $regex: '^1234', $options: 'i' } },
              { number: { $regex: '^5678', $options: 'i' } },
            ],
          },
        },
      ],
      [
        '卡片鍵列表和禁限卡類型組合過濾',
        ['TEST-001:1234'],
        1,
        {},
        [{ number: '5678' }],
        {
          $match: {
            $and: [
              {
                $or: [
                  {
                    id: 'TEST-001',
                    number: { $regex: '^1234$', $options: 'i' },
                  },
                ],
              },
              {
                $or: [{ number: { $regex: '^5678', $options: 'i' } }],
              },
            ],
          },
        },
      ],
    ])(
      'Given %s, when buildSetAndForbiddenQueryFilter is called, then should return correct filter',
      async (
        _,
        cardKeyList,
        forbiddenType,
        options,
        mockForbiddenCards,
        expected
      ) => {
        // Arrange
        mockFind.mockResolvedValue(mockForbiddenCards);

        // Act
        const result = await dalService.buildSetAndForbiddenQueryFilter(
          cardKeyList,
          forbiddenType,
          options
        );

        // Assert
        expect(result).toEqual(expected);
        if (forbiddenType) {
          expect(mockFind).toHaveBeenCalledWith(
            DataAccessEnum.FORBIDDEN_CARD_LIST,
            { type: forbiddenType },
            { number: 1, _id: 0 },
            options
          );
        }
      }
    );

    it('Given no cardKeyList and no forbiddenType, when buildSetAndForbiddenQueryFilter is called, then should return empty filter', async () => {
      // Arrange

      // Act
      const result = await dalService.buildSetAndForbiddenQueryFilter();

      // Assert
      expect(result).toEqual({ $match: {} });
      expect(mockFind).not.toHaveBeenCalled();
    });
  });

  describe('getCardInfoList', () => {
    it.each([
      [
        '基本過濾條件',
        { type: '效果怪獸' },
        {},
        [{ id: 'TEST-001', name: '測試怪獸' }],
      ],
      [
        '帶選項的查詢',
        { race: '龍族' },
        { sort: { name: 1 } },
        [
          { id: 'TEST-002', name: '青眼白龍' },
          { id: 'TEST-003', name: '真紅眼黑龍' },
        ],
      ],
      ['空結果查詢', { id: 'NONEXISTENT' }, {}, []],
    ])(
      'Given %s, when getCardInfoList is called, then should return correct card list',
      async (_, filter, options, expected) => {
        // Arrange
        mockFind.mockResolvedValue(expected);

        // Act
        const result = await dalService.getCardInfoList(filter, options);

        // Assert
        expect(result).toEqual(expected);
        expect(mockFind).toHaveBeenCalledWith(
          DataAccessEnum.CARDS,
          filter,
          { price_info: 0, price_yuyu: 0 },
          options
        );
      }
    );

    it('Given find throws error, when getCardInfoList is called, then should propagate error', async () => {
      // Arrange
      const filter = { type: '效果怪獸' };
      const error = new Error('Database error');
      mockFind.mockRejectedValue(error);

      // Act & Assert
      await expect(dalService.getCardInfoList(filter)).rejects.toThrow(error);
    });
  });

  describe('getCardInfoListByCardKeyList', () => {
    it.each([
      [
        '基本卡片鍵列表',
        [
          ['TEST-001', '1234'] as CardKeyPair,
          ['TEST-002', '5678'] as CardKeyPair,
        ],
        [
          { id: 'TEST-001', name: '測試怪獸1' },
          { id: 'TEST-002', name: '測試怪獸2' },
        ],
      ],
      [
        '包含特殊符號 -- 的卡片鍵',
        [
          ['TEST-003', '--'] as CardKeyPair,
          ['TEST-004', '9012'] as CardKeyPair,
        ],
        [
          { id: 'TEST-003', name: '特殊卡片' },
          { id: 'TEST-004', name: '測試怪獸4' },
        ],
      ],
      ['空卡片鍵列表', [] as CardKeyPair[], []],
    ])(
      'Given %s, when getCardInfoListByCardKeyList is called, then should return correct card list',
      async (_, cardKeyList, expected) => {
        // Arrange
        mockFind.mockResolvedValue(expected);

        // Act
        const result =
          await dalService.getCardInfoListByCardKeyList(cardKeyList);

        // Assert
        expect(result).toEqual(expected);

        if (cardKeyList.length > 0) {
          const expectedOrConditions = cardKeyList.map(([id, number]) => ({
            id,
            number: number !== '--' ? number : undefined,
          }));

          expect(mockFind).toHaveBeenCalledWith(
            DataAccessEnum.CARDS,
            {
              $or: expect.arrayContaining(
                expectedOrConditions.map(pair =>
                  expect.objectContaining({
                    id: pair.id,
                    ...(pair.number ? { number: pair.number } : {}),
                  })
                )
              ),
            },
            { price_info: 0, price_yuyu: 0, __v: 0 }
          );
        }
      }
    );

    it('Given find throws error, when getCardInfoListByCardKeyList is called, then should propagate error', async () => {
      // Arrange
      const cardKeyList = [['TEST-001', '1234']] as CardKeyPair[];
      const error = new Error('Database error');
      mockFind.mockRejectedValue(error);

      // Act & Assert
      await expect(
        dalService.getCardInfoListByCardKeyList(cardKeyList)
      ).rejects.toThrow(error);
    });
  });
});
