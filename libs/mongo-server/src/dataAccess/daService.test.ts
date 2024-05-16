import mongoose from 'mongoose';
import { DataAccessService } from './daService';
import { ModelRegistry } from './modelRegistry';

jest.mock('mongoose', () => {
  const originalMongoose = jest.requireActual('mongoose');
  return {
    ...originalMongoose,
    connect: jest.fn(),
    Schema: class MockSchema {
      // 模擬 Schema 類別
      constructor(schema: any) {
        return schema;
      }
    },
  };
});
jest.mock('./modelRegistry');

describe('DataAccessService', () => {
  const mockUri = 'mongodb+srv://yourMongoDBUri';
  let service: DataAccessService;
  let mockModel: any;
  let originalConsoleError: (...data: any[]) => void;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    jest.clearAllMocks();
    (mongoose.connect as jest.Mock).mockResolvedValue(undefined);

    service = new DataAccessService(mockUri);
    mockModel = {
      find: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };

    (ModelRegistry.getInstance as jest.Mock).mockImplementation(() => {
      return {
        getModel: jest.fn(() => mockModel),
      };
    });
  });

  afterEach(() => {
    console.error = originalConsoleError; // 恢复 console.error
  });

  describe('init', () => {
    it('should connect to MongoDB successfully', async () => {
      await service['init']();
      expect(mongoose.connect).toHaveBeenCalledWith(mockUri);
    });

    it('should handle connection errors', async () => {
      (mongoose.connect as jest.Mock).mockRejectedValue(
        new Error('Connection error')
      );
      await expect(service['init']()).rejects.toThrow('Connection error');
    });
  });

  describe('find', () => {
    it('should ensure the database is initialized', async () => {
      const spyInit = jest
        .spyOn(service as any, 'init')
        .mockResolvedValue(undefined);
      await service.find('admin');
      expect(spyInit).toHaveBeenCalled();
    });

    it('should return an array of documents', async () => {
      const modelName = 'admin';
      const filter = { name: 'test' };
      const projection = { name: 1 };
      const options = {};

      const res = await service.find(modelName, filter, projection, options);
      expect(mockModel.find).toHaveBeenCalledWith(filter, projection, options);
      expect(res).toEqual([]);
    });
  });
});
