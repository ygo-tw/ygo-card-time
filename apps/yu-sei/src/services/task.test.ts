import { TaskService } from './task';
import { DataAccessService } from '@ygo/mongo-server';
import { RutenService } from './rutenPrice';
import { YgoJpInfo } from './ygoJpInfo';
import { CardsDataType } from '@ygo/schemas';

// Mock 外部依賴
jest.mock('@ygo/mongo-server');
jest.mock('./rutenPrice');
jest.mock('./ygoJpInfo');
jest.mock('@ygo/crawler');
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

  const mockMongoUrl = 'mongodb://mock-url';

  beforeEach(() => {
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

    // Mock constructor
    (RutenService as jest.Mock).mockImplementation(() => mockRutenService);
    (YgoJpInfo as jest.Mock).mockImplementation(() => mockYgoJpInfo);
    (DataAccessService as jest.Mock).mockImplementation(
      () => mockDataAccessService
    );

    taskService = new TaskService(mockMongoUrl);
  });

  describe('rutenPriceTask', () => {
    it('should successfully execute ruten price task', async () => {
      const mockCards: CardsDataType[] = [
        { id: '1', name: 'Test Card' } as CardsDataType,
      ];

      const mockResult = {
        updateFailedId: [],
        noPriceId: [],
        successIds: ['1'],
      };

      mockRutenService.getRutenPrice.mockResolvedValue(mockResult);

      await taskService.rutenPriceTask(mockCards);

      expect(mockRutenService.getRutenPrice).toHaveBeenCalledWith(mockCards);
    });

    it('should handle errors in ruten price task', async () => {
      const mockError = new Error('Ruten service error');
      mockRutenService.getRutenPrice.mockRejectedValue(mockError);

      const result = await taskService.rutenPriceTask([]);

      expect(result).toBeUndefined();
    });
  });

  describe('japanInfoTask', () => {
    it('should successfully execute japan info task', async () => {
      const mockCardNumbers = ['CARD-001', 'CARD-002'];

      mockYgoJpInfo.getNewCardsJPInfo.mockResolvedValue({
        notSearchJpInfo: [],
      });
      mockYgoJpInfo.updateCardsJPInfo.mockResolvedValue({ failedJpInfo: [] });

      await taskService.japanInfoTask(mockCardNumbers);

      expect(mockYgoJpInfo.getNewCardsJPInfo).toHaveBeenCalledWith(
        mockCardNumbers
      );
      expect(mockYgoJpInfo.updateCardsJPInfo).toHaveBeenCalled();
    });

    it('should fetch missing card info when no card numbers provided', async () => {
      const mockMissingCards = [{ number: 'CARD-003' }, { number: 'CARD-004' }];

      mockDataAccessService.aggregate.mockResolvedValue(mockMissingCards);
      mockYgoJpInfo.getNewCardsJPInfo.mockResolvedValue({
        notSearchJpInfo: [],
      });
      mockYgoJpInfo.updateCardsJPInfo.mockResolvedValue({ failedJpInfo: [] });

      await taskService.japanInfoTask();

      expect(mockDataAccessService.aggregate).toHaveBeenCalled();
      expect(mockYgoJpInfo.getNewCardsJPInfo).toHaveBeenCalledWith(
        mockMissingCards.map(x => x.number)
      );
    });

    it('should handle errors in japan info task', async () => {
      const mockError = new Error('Japan info service error');
      mockYgoJpInfo.getNewCardsJPInfo.mockRejectedValue(mockError);

      const result = await taskService.japanInfoTask(['CARD-001']);

      expect(result).toBeUndefined();
    });
  });

  describe('findJapanInfo', () => {
    it('should return cards without jurisprudence info', async () => {
      const mockCardsWithoutInfo = [
        { number: 'CARD-001' },
        { number: 'CARD-002' },
      ];

      mockDataAccessService.aggregate.mockResolvedValue(mockCardsWithoutInfo);

      const result = await (taskService as any).findJapanInfo();

      expect(result).toEqual(['CARD-001', 'CARD-002']);
      expect(mockDataAccessService.aggregate).toHaveBeenCalled();
    });
  });
});
