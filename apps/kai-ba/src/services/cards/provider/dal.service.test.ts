import { CardDalService } from './dal.service';
import { DataAccessService } from '@ygo/mongo-server';
import { DataAccessEnum } from '@ygo/schemas';
import { PipelineStage } from 'mongoose';

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
    it('Given pipeline and options, when getCardListByDb is called, then should call dal.aggregate with correct params', async () => {
      // Arrange
      const pipeline: PipelineStage[] = [{ $match: { type: '效果怪獸' } }];
      const options = { allowDiskUse: true };
      const mockCardList = [
        { id: 'id1', name: '卡片1', _id: 'oid_id1' },
        { id: 'id2', name: '卡片2', _id: 'oid_id2' },
      ];
      mockAggregate.mockResolvedValue(mockCardList);

      // Act
      const result = await dalService.getCardListByDb(pipeline, options);

      // Assert
      expect(result).toEqual(mockCardList);
      expect(mockAggregate).toHaveBeenCalledWith(
        DataAccessEnum.CARDS,
        pipeline,
        options
      );
    });
  });

  describe('findCardList', () => {
    it('Given filter, pagination and options, when findCardList is called, then should return card list and total', async () => {
      // Arrange
      const filter = { type: '效果怪獸' };
      const pagination = { page: 2, limit: 10 };
      const options = { sort: { name: 1 } };

      const mockCardList = [
        { id: 'id1', name: '卡片1', _id: 'oid_id1' },
        { id: 'id2', name: '卡片2', _id: 'oid_id2' },
      ];
      const mockTotal = 25;

      mockFind.mockResolvedValue(mockCardList);
      mockFindDocumentCount.mockResolvedValue(mockTotal);

      // Act
      const result = await dalService.findCardList(filter, pagination, options);

      // Assert
      expect(result).toEqual({
        data: mockCardList,
        total: mockTotal,
      });

      // 驗證 find 調用
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

      // 驗證 findDocumentCount 調用
      expect(mockFindDocumentCount).toHaveBeenCalledWith(
        DataAccessEnum.CARDS,
        filter,
        {}
      );
    });
  });

  describe('buildSetAndForbiddenQueryFilter', () => {
    it.each([
      [
        '僅卡片ID列表過濾',
        ['oid_id1', 'oid_id2'],
        undefined,
        {},
        [],
        {
          $match: {
            $or: [{ _id: { $in: ['oid_id1', 'oid_id2'] } }],
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
        '卡片ID列表和禁限卡類型組合過濾',
        ['oid_id1'],
        1,
        {},
        [{ number: '5678' }],
        {
          $match: {
            $and: [
              {
                $or: [{ _id: { $in: ['oid_id1'] } }],
              },
              {
                $or: [{ number: { $regex: '^5678', $options: 'i' } }],
              },
            ],
          },
        },
      ],
      [
        '無過濾條件',
        undefined,
        undefined,
        {},
        [],
        {
          $match: {},
        },
      ],
    ])(
      'Given %s, when buildSetAndForbiddenQueryFilter is called, then should return correct filter',
      async (
        _,
        cardIdList,
        forbiddenType,
        options,
        mockForbiddenCards,
        expected
      ) => {
        // Arrange
        mockFind.mockResolvedValue(mockForbiddenCards);

        // Act
        const result = await dalService.buildSetAndForbiddenQueryFilter(
          cardIdList,
          forbiddenType,
          options
        );

        // Assert
        expect(result).toEqual(expected);

        // 驗證 find 調用
        if (forbiddenType) {
          expect(mockFind).toHaveBeenCalledWith(
            DataAccessEnum.FORBIDDEN_CARD_LIST,
            { type: forbiddenType },
            { number: 1, _id: 0 },
            options
          );
        } else {
          expect(mockFind).not.toHaveBeenCalled();
        }
      }
    );
  });

  describe('getCardInfoList', () => {
    it('Given filter and options, when getCardInfoList is called, then should call dal.find with correct params', async () => {
      // Arrange
      const filter = { type: '效果怪獸' };
      const options = { sort: { name: 1 } };
      const mockCardList = [
        { id: 'id1', name: '卡片1', _id: 'oid_id1' },
        { id: 'id2', name: '卡片2', _id: 'oid_id2' },
      ];
      mockFind.mockResolvedValue(mockCardList);

      // Act
      const result = await dalService.getCardInfoList(filter, options);

      // Assert
      expect(result).toEqual(mockCardList);
      expect(mockFind).toHaveBeenCalledWith(
        DataAccessEnum.CARDS,
        filter,
        { price_info: 0, price_yuyu: 0 },
        options
      );
    });
  });

  describe('getCardInfoListByIdList', () => {
    it('Given id list, when getCardInfoListByIdList is called, then should call dal.find with correct params', async () => {
      // Arrange
      const idList = ['oid_id1', 'oid_id2'];
      const mockCardList = [
        { id: 'id1', name: '卡片1', _id: 'oid_id1' },
        { id: 'id2', name: '卡片2', _id: 'oid_id2' },
      ];
      mockFind.mockResolvedValue(mockCardList);

      // Act
      const result = await dalService.getCardInfoListByIdList(idList);

      // Assert
      expect(result).toEqual(mockCardList);
      expect(mockFind).toHaveBeenCalledWith(
        DataAccessEnum.CARDS,
        { _id: { $in: idList } },
        { price_info: 0, price_yuyu: 0, __v: 0 }
      );
    });

    it('Given empty id list, when getCardInfoListByIdList is called, then should return empty array', async () => {
      // Arrange
      const idList: string[] = [];

      // Act
      const result = await dalService.getCardInfoListByIdList(idList);

      // Assert
      expect(result).toEqual([]);
      expect(mockFind).not.toHaveBeenCalled();
    });
  });
});
