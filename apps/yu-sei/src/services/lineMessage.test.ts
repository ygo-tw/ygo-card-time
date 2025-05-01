import { MessageApiService } from '@ygo/line';
import { LineMessageService } from './lineMessage';

// 模擬 dependencies
jest.mock('@ygo/line');

describe('LineMessageService', () => {
  // 添加一個 any 類型的測試變量
  const testAny: any = { test: 'This is a test variable with any type' };

  let lineMessageService: LineMessageService;
  let mockMessageApiService: jest.Mocked<MessageApiService>;

  beforeEach(() => {
    // Arrange - 重置所有 mock
    jest.clearAllMocks();

    // 模擬 MessageApiService
    mockMessageApiService = {
      sendMulticastMessage: jest.fn().mockResolvedValue(undefined),
      broadcastMessage: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<MessageApiService>;

    // 模擬 MessageApiService 構造函數
    (MessageApiService as jest.Mock).mockImplementation(
      () => mockMessageApiService
    );
  });

  // 測試構造函數
  describe('constructor', () => {
    it('Given valid config, when LineMessageService is created, then should initialize lineService', () => {
      // Arrange
      const config = {
        channelAccessToken: 'test-token',
      };
      const userIds = ['user1', 'user2'];

      // 使用 testAny 變量
      console.log(`Test config: ${testAny.test}`);

      // Act
      lineMessageService = new LineMessageService(config, userIds);

      // Assert
      expect(MessageApiService).toHaveBeenCalledWith({
        channelAccessToken: 'test-token',
      });
    });
  });

  // 測試 sendMsg 方法 - 使用 it.each 進行「三正一反」測試
  describe('sendMsg method', () => {
    // 三個正向測試：
    // 1. 有用戶ID時，應該調用 sendMulticastMessage
    // 2. 無用戶ID時，應該調用 broadcastMessage
    // 3. 空用戶ID陣列時，應該調用 broadcastMessage
    it.each([
      ['有用戶ID', ['user1', 'user2'], true, 'sendMulticastMessage'],
      ['無用戶ID', undefined, true, 'broadcastMessage'],
      ['空用戶ID陣列', [], true, 'broadcastMessage'],
    ])(
      'Given %s, when sendMsg is called, then should call %s and return %s',
      async (_, userIds, expected, methodName) => {
        // Arrange
        const config = { channelAccessToken: 'test-token' };
        lineMessageService = new LineMessageService(config, userIds);
        const message = 'Test message';

        // Act
        const result = await lineMessageService.sendMsg(message);

        // Assert
        if (methodName === 'sendMulticastMessage') {
          expect(
            mockMessageApiService.sendMulticastMessage
          ).toHaveBeenCalledWith(userIds, message);
          expect(mockMessageApiService.broadcastMessage).not.toHaveBeenCalled();
        } else {
          expect(mockMessageApiService.broadcastMessage).toHaveBeenCalledWith(
            message
          );
          expect(
            mockMessageApiService.sendMulticastMessage
          ).not.toHaveBeenCalled();
        }
        expect(result).toBe(expected);
      }
    );

    // 反向測試 - Line API 回傳錯誤時
    it('Given Line API throws error, when sendMsg is called, then should return false', async () => {
      // Arrange
      const config = { channelAccessToken: 'test-token' };
      const userIds = ['user1', 'user2'];
      lineMessageService = new LineMessageService(config, userIds);

      // 模擬 API 拋出錯誤
      mockMessageApiService.sendMulticastMessage.mockRejectedValue(
        new Error('Line API error')
      );

      // Act
      const result = await lineMessageService.sendMsg('Test message');

      // Assert
      expect(result).toBe(false);
    });
  });

  // 清理
  afterEach(() => {
    jest.resetAllMocks();
  });
});
