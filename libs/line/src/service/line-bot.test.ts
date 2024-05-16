import { LineBotService } from './line-bot';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LineBotService', () => {
  let service: LineBotService;

  beforeEach(() => {
    // 清理模拟并重新设置
    jest.clearAllMocks();
    service = new LineBotService();
  });

  describe('sendNotify', () => {
    it('should return true when message is sent successfully', async () => {
      const message = 'Hello, LINE!';
      mockedAxios.post.mockResolvedValue({}); // 模拟 axios.post 成功返回

      const result = await service.sendNotify(message);
      expect(result).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://notify-api.line.me/api/notify',
        `message=${message}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.LINENOTIFY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    });

    it('should throw an error when sending message fails', async () => {
      const message = 'Hello, LINE!';
      const errorMessage = 'Failed to send line notify';
      mockedAxios.post.mockRejectedValue(new Error(errorMessage)); // 模拟 axios.post 失败

      await expect(service.sendNotify(message)).rejects.toThrow(errorMessage);
    });

    it('should allow custom content types', async () => {
      const message = 'Hello, LINE!';
      const contentType = 'application/json';
      mockedAxios.post.mockResolvedValue({}); // 模拟 axios.post 成功返回

      const result = await service.sendNotify(message, contentType);
      expect(result).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://notify-api.line.me/api/notify',
        `message=${message}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.LINENOTIFY}`,
            'Content-Type': contentType,
          },
        }
      );
    });
  });
});
