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
      findOneAndUpdate: jest.fn().mockReturnThis(),
      syncIndexes: jest.fn().mockResolvedValue(undefined),
      insertMany: jest.fn().mockReturnThis(),
      collection: {
        insertOne: jest
          .fn()
          .mockResolvedValue({ insertedId: new mongoose.Types.ObjectId() }),
      },
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

  describe('ensureInitialized', () => {
    it('should initialize the database if not already initialized', async () => {
      const spyInit = jest
        .spyOn(service as any, 'init')
        .mockResolvedValue(undefined);
      await service['ensureInitialized']();
      expect(spyInit).toHaveBeenCalled();
    });

    it('should not initialize the database if already initialized', async () => {
      service['isInit'] = true;
      const spyInit = jest.spyOn(service as any, 'init');
      await service['ensureInitialized']();
      expect(spyInit).not.toHaveBeenCalled();
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

    it('should handle errors', async () => {
      const modelName = 'admin';
      mockModel.exec = jest.fn().mockRejectedValue(new Error('Find error'));

      await expect(service.find(modelName)).rejects.toThrow('Find error');
    });
  });

  describe('findAndUpdate', () => {
    it('should ensure the database is initialized', async () => {
      const spyInit = jest
        .spyOn(service as any, 'init')
        .mockResolvedValue(undefined);
      await service.findAndUpdate(
        'admin',
        { name: 'test' },
        { $set: { name: 'updatedName' } }
      );
      expect(spyInit).toHaveBeenCalled();
    });

    it('should find and update a document', async () => {
      const modelName = 'admin';
      const filter = { name: 'test' };
      const update = { $set: { name: 'updatedName' } };
      const options = { new: true };

      const mockUpdatedDocument = { name: 'updatedName' };
      mockModel.exec = jest.fn().mockResolvedValue(mockUpdatedDocument);

      const res = await service.findAndUpdate(
        modelName,
        filter,
        update,
        options
      );
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(filter, update, {
        ...options,
      });
      expect(res).toEqual(mockUpdatedDocument);
    });

    it('should throw an error if no document is found', async () => {
      const modelName = 'admin';
      const filter = { name: 'test' };
      const update = { $set: { name: 'updatedName' } };
      const options = { new: true };

      mockModel.exec = jest.fn().mockResolvedValue(null); // 模擬返回 null

      await expect(
        service.findAndUpdate(modelName, filter, update, options)
      ).rejects.toThrow(
        `No document found for filter: ${JSON.stringify(filter)}`
      ); // 檢查是否拋出錯誤
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(filter, update, {
        ...options,
      });
    });

    it('should handle errors', async () => {
      const modelName = 'admin';
      mockModel.exec = jest.fn().mockRejectedValue(new Error('Update error'));

      await expect(
        service.findAndUpdate(
          modelName,
          { name: 'test' },
          { $set: { name: 'updatedName' } }
        )
      ).rejects.toThrow('Update error');
    });
  });

  describe('createOne', () => {
    it('should ensure the database is initialized', async () => {
      const spyInit = jest
        .spyOn(service as any, 'init')
        .mockResolvedValue(undefined);
      await service.createOne('admin', {} as any);
      expect(spyInit).toHaveBeenCalled();
    });

    it('should create and return the ID of the new document', async () => {
      const modelName = 'admin';
      const doc = { name: 'test' } as any;
      const insertedId = new mongoose.Types.ObjectId();
      mockModel.collection.insertOne.mockResolvedValue({ insertedId });

      const res = await service.createOne(modelName, doc);
      expect(mockModel.collection.insertOne).toHaveBeenCalledWith(doc);
      expect(res).toEqual(insertedId);
    });

    it('should handle errors', async () => {
      const modelName = 'admin';
      mockModel.collection.insertOne.mockRejectedValue(
        new Error('Create error')
      );

      await expect(service.createOne(modelName, {} as any)).rejects.toThrow(
        'Create error'
      );
    });
  });

  describe('insertMany', () => {
    it('should ensure the database is initialized', async () => {
      const spyInit = jest
        .spyOn(service as any, 'init')
        .mockResolvedValue(undefined);
      await service.insertMany('admin', [{ name: 'test' } as any]);
      expect(spyInit).toHaveBeenCalled();
    });
  });

  describe('deleteOne', () => {
    it('should delete a document successfully', async () => {
      const modelName = 'admin';
      const filter = { name: 'test' };
      mockModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

      await service.deleteOne(modelName, filter);
      expect(mockModel.deleteOne).toHaveBeenCalledWith(filter);
    });

    it('should throw an error if no document is found', async () => {
      const modelName = 'admin';
      const filter = { name: 'test' };
      mockModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 0 });

      await expect(service.deleteOne(modelName, filter)).rejects.toThrow(
        `No document found for filter: ${JSON.stringify(filter)}`
      );
    });

    it('should handle errors', async () => {
      const modelName = 'admin';
      const filter = { name: 'test' };
      mockModel.deleteOne = jest
        .fn()
        .mockRejectedValue(new Error('Delete error'));

      await expect(service.deleteOne(modelName, filter)).rejects.toThrow(
        'Delete error'
      );
    });
  });
});
