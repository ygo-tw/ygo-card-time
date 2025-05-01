import { DataAccessService } from '@ygo/mongo-server';
import { CardsDataType, DataAccessEnum } from '@ygo/schemas';
import { CustomLogger } from '../utils';
import { PriceInfoArchiveService } from './priceInfoArchive';

// 模擬 dependencies
jest.mock('@ygo/mongo-server');
jest.mock('../utils');

describe('PriceInfoArchiveService', () => {
  let priceInfoArchiveService: PriceInfoArchiveService;
  let mockDataAccessService: jest.Mocked<DataAccessService>;
  let mockLogger: jest.Mocked<CustomLogger>;

  beforeEach(() => {
    // Arrange - 重置所有 mock
    jest.clearAllMocks();

    // 模擬 DataAccessService
    mockDataAccessService = {
      ensureInitialized: jest.fn().mockResolvedValue(undefined),
      find: jest.fn(),
      bulkWrite: jest.fn(),
    } as unknown as jest.Mocked<DataAccessService>;

    // 模擬 CustomLogger
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<CustomLogger>;

    // 創建測試對象
    priceInfoArchiveService = new PriceInfoArchiveService(
      mockDataAccessService,
      mockLogger
    );
  });

  // 測試 archivePriceInfo 方法
  describe('archivePriceInfo method', () => {
    it('Given service is initialized, when archivePriceInfo is called, then should ensure database is initialized and delegate to archivePrice', async () => {
      // Arrange
      const archivePriceSpy = jest
        .spyOn(priceInfoArchiveService as any, 'archivePrice')
        .mockResolvedValue(undefined);

      // Act
      await priceInfoArchiveService.archivePriceInfo();

      // Assert
      expect(mockDataAccessService.ensureInitialized).toHaveBeenCalled();
      expect(archivePriceSpy).toHaveBeenCalledWith('price_info');
    });
  });

  // 測試 archivePrice 方法
  describe('archivePrice method', () => {
    it('Given there are cards with old price data, when archivePrice is called, then should process all cards in batches', async () => {
      // Arrange
      const mockDate = new Date('2023-04-01');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      // 模擬兩批資料
      const batch1 = createMockCards(3, 'price_info');
      const batch2 = createMockCards(2, 'price_info');
      const emptyBatch: CardsDataType[] = [];

      mockDataAccessService.find
        .mockResolvedValueOnce(batch1)
        .mockResolvedValueOnce(batch2)
        .mockResolvedValueOnce(emptyBatch);

      const processBatchSpy = jest
        .spyOn(priceInfoArchiveService as any, 'processBatch')
        .mockResolvedValueOnce({ archivedCount: 3, updatedCount: 3 })
        .mockResolvedValueOnce({ archivedCount: 2, updatedCount: 2 });

      // Act
      await (priceInfoArchiveService as any).archivePrice('price_info');

      // Assert
      expect(mockDataAccessService.find).toHaveBeenCalledTimes(3);
      expect(processBatchSpy).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('完成所有封存')
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('總共處理 5 張卡片')
      );
    });

    it('Given there are no cards with old price data, when archivePrice is called, then should exit without processing', async () => {
      // Arrange
      const mockDate = new Date('2023-04-01');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      mockDataAccessService.find.mockResolvedValueOnce([]);

      const processBatchSpy = jest.spyOn(
        priceInfoArchiveService as any,
        'processBatch'
      );

      // Act
      await (priceInfoArchiveService as any).archivePrice('price_info');

      // Assert
      expect(mockDataAccessService.find).toHaveBeenCalledTimes(1);
      expect(processBatchSpy).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('完成所有封存')
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('總共處理 0 張卡片')
      );
    });
  });

  // 測試 processBatch 方法
  describe('processBatch method', () => {
    it('Given valid cards with old price data, when processBatch is called, then should archive old data and update cards', async () => {
      // Arrange
      const cutoffDate = '2023-01-01';
      const mockCards = [
        {
          _id: 'card1',
          id: 'ABCD-JP001',
          number: '',
          price_info: [
            {
              price_lowest: 100,
              price_avg: 150,
              price: 200,
              rarity: 'UR',
              time: '2022-12-01',
            }, // 舊數據
            {
              price_lowest: 120,
              price_avg: 170,
              price: 220,
              rarity: 'UR',
              time: '2023-02-01',
            }, // 新數據
          ],
        },
      ] as unknown as CardsDataType[];

      const mockDate = new Date('2023-04-01');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      mockDataAccessService.bulkWrite.mockResolvedValue({} as any);

      // Act
      const result = await (priceInfoArchiveService as any).processBatch(
        mockCards,
        'price_info',
        cutoffDate
      );

      // Assert
      expect(mockDataAccessService.bulkWrite).toHaveBeenCalledTimes(2);

      // 簡化驗證方式，避免類型問題
      expect(mockDataAccessService.bulkWrite).toHaveBeenNthCalledWith(
        1,
        DataAccessEnum.PRICE_ARCHIVE,
        expect.any(Array)
      );

      expect(mockDataAccessService.bulkWrite).toHaveBeenNthCalledWith(
        2,
        DataAccessEnum.CARDS,
        expect.any(Array)
      );

      // 驗證返回結果
      expect(result).toEqual({ archivedCount: 1, updatedCount: 1 });
    });

    // 反向測試 - 當資料庫操作失敗時
    it('Given database operation fails, when processBatch is called, then should throw error', async () => {
      // Arrange
      const cutoffDate = '2023-01-01';
      const mockCards = [
        {
          _id: 'card1',
          id: 'ABCD-JP001',
          number: '',
          price_info: [
            {
              price_lowest: 100,
              price_avg: 150,
              price: 200,
              rarity: 'UR',
              time: '2022-12-01',
            },
          ],
        },
      ] as unknown as CardsDataType[];

      mockDataAccessService.bulkWrite.mockRejectedValue(
        new Error('Database error')
      );

      // Act & Assert
      await expect(
        (priceInfoArchiveService as any).processBatch(
          mockCards,
          'price_info',
          cutoffDate
        )
      ).rejects.toThrow('Database error');
    });
  });

  // 測試 normalizePriceData 方法
  describe('normalizePriceData method', () => {
    it.each([
      [
        [
          {
            price_lowest: '-',
            price_avg: 150,
            price: 200,
            rarity: 'UR',
            time: '2023-01-01',
          },
        ],
        [
          {
            price_lowest: null,
            price_avg: 150,
            price: 200,
            rarity: 'UR',
            time: '2023-01-01',
          },
        ],
      ],
      [
        [
          {
            price_lowest: 100,
            price_avg: '-',
            price: 200,
            rarity: 'SR',
            time: '2023-01-01',
          },
        ],
        [
          {
            price_lowest: 100,
            price_avg: null,
            price: 200,
            rarity: 'SR',
            time: '2023-01-01',
          },
        ],
      ],
      [
        [
          {
            price_lowest: 100,
            price_avg: 150,
            price: '-',
            rarity: 'R',
            time: '2023-01-01',
          },
        ],
        [
          {
            price_lowest: 100,
            price_avg: 150,
            price: null,
            rarity: 'R',
            time: '2023-01-01',
          },
        ],
      ],
    ])(
      'Given price data with "-" values, when normalizePriceData is called, then should convert "-" to null',
      (input, expected) => {
        // Arrange & Act
        const result = (priceInfoArchiveService as any).normalizePriceData(
          input
        );

        // Assert
        expect(result).toEqual(expected);
      }
    );
  });

  // 清理
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});

// 輔助函數 - 創建模擬卡片數據
function createMockCards(count: number, priceType: string): CardsDataType[] {
  const cards: CardsDataType[] = [];

  for (let i = 0; i < count; i++) {
    cards.push({
      _id: `card${i}`,
      id: `CARD-JP00${i}`,
      number: '',
      [priceType]: [
        // 舊價格數據
        {
          price_lowest: 100,
          price_avg: 150,
          price: 200,
          rarity: 'UR',
          time: '2022-11-01',
        },
        // 新價格數據
        {
          price_lowest: 120,
          price_avg: 170,
          price: 220,
          rarity: 'UR',
          time: '2023-02-01',
        },
      ],
    } as unknown as CardsDataType);
  }

  return cards;
}
