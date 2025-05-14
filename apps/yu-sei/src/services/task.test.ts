import { TaskService } from './task';
import { DataAccessService } from '@ygo/mongo-server';
import { RutenService } from './rutenPrice';
import { YgoJpInfo } from './ygoJpInfo';
import { CardsDataType } from '@ygo/schemas';
import { YuyuPriceService } from './yuyu';
import { PriceInfoArchiveService } from './priceInfoArchive';
import { CustomLogger } from '../utils';

// Mock 外部依賴
jest.mock('@ygo/mongo-server');
jest.mock('./rutenPrice');
jest.mock('./ygoJpInfo');
jest.mock('@ygo/crawler');
jest.mock('./yuyu');
jest.mock('./priceInfoArchive');
jest.mock('../utils', () => ({
  CustomLogger: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    error: jest.fn(),
  })),
}));
jest.mock('../tasks/task-temp', () => ({
  task: jest.fn().mockImplementation(async (_, __, ___, taskFn) => {
    const mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };
    return await taskFn(mockLogger);
  }),
}));

describe('TaskService', () => {
  let taskService: TaskService;
  let mockDataAccessService: jest.Mocked<DataAccessService>;
  let mockRutenService: jest.Mocked<RutenService>;
  let mockYgoJpInfo: jest.Mocked<YgoJpInfo>;
  let mockYuyuPriceService: jest.Mocked<YuyuPriceService>;
  let mockPriceInfoArchiveService: jest.Mocked<PriceInfoArchiveService>;

  const mockMongoUrl = 'mongodb://mock-url';

  beforeEach(() => {
    // 重置 mocks
    jest.clearAllMocks();

    // 設置 DataAccessService mock
    mockDataAccessService = {
      aggregate: jest.fn(),
    } as unknown as jest.Mocked<DataAccessService>;

    // 設置 RutenService mock
    mockRutenService = {
      getRutenPrice: jest.fn(),
    } as unknown as jest.Mocked<RutenService>;

    // 設置 YgoJpInfo mock
    mockYgoJpInfo = {
      getNewCardsJPInfo: jest.fn(),
      updateCardsJPInfo: jest.fn(),
    } as unknown as jest.Mocked<YgoJpInfo>;

    // 設置 YuyuPriceService mock
    mockYuyuPriceService = {
      getYuyuprice: jest.fn(),
    } as unknown as jest.Mocked<YuyuPriceService>;

    // 設置 PriceInfoArchiveService mock
    mockPriceInfoArchiveService = {
      archivePriceInfo: jest.fn(),
    } as unknown as jest.Mocked<PriceInfoArchiveService>;

    // Mock constructor
    (RutenService as jest.Mock).mockImplementation(() => mockRutenService);
    (YgoJpInfo as jest.Mock).mockImplementation(() => mockYgoJpInfo);
    (DataAccessService as jest.Mock).mockImplementation(
      () => mockDataAccessService
    );
    (YuyuPriceService as jest.Mock).mockImplementation(
      () => mockYuyuPriceService
    );
    (PriceInfoArchiveService as jest.Mock).mockImplementation(
      () => mockPriceInfoArchiveService
    );

    taskService = new TaskService(mockMongoUrl);
  });

  describe('rutenPriceTask', () => {
    // 正向測試
    it.each([
      [
        'with provided cards',
        [{ id: '1', name: 'Test Card' } as CardsDataType],
        { updateFailedId: [], noPriceId: [], successIds: ['1'] },
      ],
      [
        'without provided cards',
        undefined,
        { updateFailedId: [], noPriceId: [], successIds: ['2', '3'] },
      ],
      [
        'with empty cards array',
        [],
        { updateFailedId: [], noPriceId: [], successIds: [] },
      ],
    ])(
      'Given %s, when rutenPriceTask is called, then should process Ruten prices correctly',
      async (_, cards, expectedResult) => {
        // Arrange
        mockRutenService.getRutenPrice.mockResolvedValue(expectedResult);

        // Act
        await taskService.rutenPriceTask(cards);

        // 取得傳遞給 task 的回調函數
        const taskMock = jest.requireMock('../tasks/task-temp').task;
        const taskCallback = taskMock.mock.calls[0][3];

        // 執行回調函數，觸發 rutenTask
        const mockLogger = {
          info: jest.fn(),
          error: jest.fn(),
        } as unknown as CustomLogger;
        await taskCallback(mockLogger);

        // Assert
        expect(mockRutenService.getRutenPrice).toHaveBeenCalledWith(cards);
      }
    );

    // 反向測試
    it('Given service failure, when rutenPriceTask is called, then should handle the error', async () => {
      // Arrange
      const mockError = new Error('Ruten service error');
      mockRutenService.getRutenPrice.mockRejectedValue(mockError);

      // Act
      await taskService.rutenPriceTask([]);

      // 取得傳遞給 task 的回調函數
      const taskMock = jest.requireMock('../tasks/task-temp').task;
      const taskCallback = taskMock.mock.calls[0][3];

      // 執行回調函數，觸發 rutenTask 的錯誤處理
      const mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
      } as unknown as CustomLogger;
      const result = await taskCallback(mockLogger);

      // Assert
      expect(mockRutenService.getRutenPrice).toHaveBeenCalled();
      expect(result.failTasks).toContain('getRutenPrice');
      expect(result.html).toContain('Error');
    });
  });

  describe('japanInfoTask', () => {
    // 正向測試
    it.each([
      [
        'with provided card numbers',
        ['CARD-001', 'CARD-002'],
        undefined,
        { notSearchJpInfo: [] },
        { failedJpInfo: [] },
      ],
      [
        'fetching missing cards automatically',
        undefined,
        [{ number: 'CARD-003' }, { number: 'CARD-004' }],
        { notSearchJpInfo: [] },
        { failedJpInfo: [] },
      ],
      [
        'with partial results',
        ['CARD-005'],
        undefined,
        { notSearchJpInfo: ['CARD-005'] },
        { failedJpInfo: [] },
      ],
    ])(
      'Given %s, when japanInfoTask is called, then should process Japan info correctly',
      async (_, cardNumbers, missingCards, newCardsResult, updateResult) => {
        // Arrange
        if (missingCards) {
          mockDataAccessService.aggregate.mockResolvedValue(missingCards);
        }
        mockYgoJpInfo.getNewCardsJPInfo.mockResolvedValue(newCardsResult);
        mockYgoJpInfo.updateCardsJPInfo.mockResolvedValue(updateResult);

        // Act
        await taskService.japanInfoTask(cardNumbers);

        // 取得傳遞給 task 的回調函數
        const taskMock = jest.requireMock('../tasks/task-temp').task;
        const taskCallback = taskMock.mock.calls[0][3];

        // 執行回調函數，觸發 japanTask
        const mockLogger = {
          info: jest.fn(),
          error: jest.fn(),
        } as unknown as CustomLogger;
        await taskCallback(mockLogger);

        // Assert
        if (cardNumbers) {
          expect(mockYgoJpInfo.getNewCardsJPInfo).toHaveBeenCalledWith(
            cardNumbers
          );
        } else {
          expect(mockDataAccessService.aggregate).toHaveBeenCalled();
          expect(mockYgoJpInfo.getNewCardsJPInfo).toHaveBeenCalledWith(
            missingCards.map(x => x.number)
          );
        }
        expect(mockYgoJpInfo.updateCardsJPInfo).toHaveBeenCalled();
      }
    );

    // 反向測試
    it('Given service failure, when japanInfoTask is called, then should handle the error', async () => {
      // Arrange
      const mockError = new Error('Japan info service error');
      mockYgoJpInfo.getNewCardsJPInfo.mockRejectedValue(mockError);

      // Act
      await taskService.japanInfoTask(['CARD-001']);

      // 取得傳遞給 task 的回調函數
      const taskMock = jest.requireMock('../tasks/task-temp').task;
      const taskCallback = taskMock.mock.calls[0][3];

      // 執行回調函數，觸發 japanTask 的錯誤處理
      const mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
      } as unknown as CustomLogger;
      const result = await taskCallback(mockLogger);

      // Assert
      expect(mockYgoJpInfo.getNewCardsJPInfo).toHaveBeenCalled();
      expect(result.failTasks).toContain('getNewCardsJPInfo');
      expect(result.html).toContain('Error');
    });
  });

  describe('yuyuPriceTask', () => {
    // 正向測試
    it.each([
      [
        'successful response',
        { errorCardList: [], crawledCardList: ['CARD-001', 'CARD-002'] },
      ],
      [
        'partial success',
        { errorCardList: ['CARD-003'], crawledCardList: ['CARD-004'] },
      ],
      ['empty result', { errorCardList: [], crawledCardList: [] }],
    ])(
      'Given %s, when yuyuPriceTask is called, then should process Yuyu prices correctly',
      async (_, serviceResult) => {
        // Arrange
        mockYuyuPriceService.getYuyuprice.mockResolvedValue(serviceResult);

        // Act
        await taskService.yuyuPriceTask();

        // 取得傳遞給 task 的回調函數
        const taskMock = jest.requireMock('../tasks/task-temp').task;
        const taskCallback = taskMock.mock.calls[0][3];

        // 執行回調函數，觸發 yuyuTask
        const mockLogger = {
          info: jest.fn(),
          error: jest.fn(),
        } as unknown as CustomLogger;
        const result = await taskCallback(mockLogger);

        // Assert
        expect(mockYuyuPriceService.getYuyuprice).toHaveBeenCalled();
        expect(result.finalInfo).toEqual(serviceResult);
        expect(result.html).toContain('Successful');
      }
    );

    // 反向測試
    it('Given service failure, when yuyuPriceTask is called, then should handle the error', async () => {
      // Arrange
      const mockError = new Error('Yuyu price service error');
      mockYuyuPriceService.getYuyuprice.mockRejectedValue(mockError);

      // Act
      await taskService.yuyuPriceTask();

      // 取得傳遞給 task 的回調函數
      const taskMock = jest.requireMock('../tasks/task-temp').task;
      const taskCallback = taskMock.mock.calls[0][3];

      // 執行回調函數，觸發 yuyuTask 的錯誤處理
      const mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
      } as unknown as CustomLogger;
      const result = await taskCallback(mockLogger);

      // Assert
      expect(mockYuyuPriceService.getYuyuprice).toHaveBeenCalled();
      expect(result.failTasks).toContain('getYuyuprice');
      expect(result.html).toContain('Error');
    });
  });

  describe('priceInfoArchiveTask', () => {
    // 正向測試
    it.each([
      ['successful archive', true],
      ['archive with specific data', true],
      ['large dataset archive', true],
    ])(
      'Given %s, when priceInfoArchiveTask is called, then should archive price info correctly',
      async (_, isSuccess) => {
        // Arrange
        if (isSuccess) {
          mockPriceInfoArchiveService.archivePriceInfo.mockResolvedValue(
            undefined
          );
        } else {
          mockPriceInfoArchiveService.archivePriceInfo.mockRejectedValue(
            new Error('Archive error')
          );
        }

        // Act
        await taskService.priceInfoArchiveTask();

        // 取得傳遞給 task 的回調函數
        const taskMock = jest.requireMock('../tasks/task-temp').task;
        const taskCallback = taskMock.mock.calls[0][3];

        // 執行回調函數，觸發 priceArchiveTask
        const mockLogger = {
          info: jest.fn(),
          error: jest.fn(),
        } as unknown as CustomLogger;
        const result = await taskCallback(mockLogger);

        // Assert
        expect(mockPriceInfoArchiveService.archivePriceInfo).toHaveBeenCalled();
        if (!isSuccess) {
          expect(result.failTasks).toContain('archivePriceInfo');
        } else {
          expect(result.html).toContain('Successful');
        }
      }
    );

    // 反向測試
    it('Given service failure, when priceInfoArchiveTask is called, then should handle the error', async () => {
      // Arrange
      const mockError = new Error('Archive service error');
      mockPriceInfoArchiveService.archivePriceInfo.mockRejectedValue(mockError);

      // Act
      await taskService.priceInfoArchiveTask();

      // 取得傳遞給 task 的回調函數
      const taskMock = jest.requireMock('../tasks/task-temp').task;
      const taskCallback = taskMock.mock.calls[0][3];

      // 執行回調函數，觸發 priceArchiveTask 的錯誤處理
      const mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
      } as unknown as CustomLogger;
      const result = await taskCallback(mockLogger);

      // Assert
      expect(mockPriceInfoArchiveService.archivePriceInfo).toHaveBeenCalled();
      expect(result.failTasks).toContain('archivePriceInfo');
      expect(result.html).toContain('Error');
    });
  });

  describe('findJapanInfo', () => {
    // 正向測試 (private 方法測試，但有關鍵邏輯)
    it.each([
      [
        'cards without jurisprudence',
        [{ number: 'CARD-001' }, { number: 'CARD-002' }],
        ['CARD-001', 'CARD-002'],
      ],
      ['empty result', [], []],
      [
        'single card without jurisprudence',
        [{ number: 'CARD-003' }],
        ['CARD-003'],
      ],
    ])(
      'Given %s, when findJapanInfo is called, then should return cards without jurisprudence info',
      async (_, mockCards, expected) => {
        // Arrange
        mockDataAccessService.aggregate.mockResolvedValue(mockCards);

        // Act
        const result = await (taskService as any).findJapanInfo();

        // Assert
        expect(result).toEqual(expected);
        expect(mockDataAccessService.aggregate).toHaveBeenCalled();
      }
    );
  });
});
