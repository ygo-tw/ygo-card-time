import { LineBotService } from './line-bot';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LineBotService', () => {
  let service: LineBotService;
  let originalConsoleError: (...data: any[]) => void;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();

    jest.clearAllMocks();
    service = new LineBotService();
  });

  afterEach(() => {
    console.error = originalConsoleError; // 恢复 console.error
  });

  describe('sendNotify', () => {
    it('should return true when message is sent successfully', async () => {
      const message = 'Hello, LINE!';
      mockedAxios.post.mockResolvedValue({});

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
      mockedAxios.post.mockRejectedValue(new Error(errorMessage));

      await expect(service.sendNotify(message)).rejects.toThrow(errorMessage);
    });

    it('should allow custom content types', async () => {
      const message = 'Hello, LINE!';
      const contentType = 'application/json';
      mockedAxios.post.mockResolvedValue({});

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
