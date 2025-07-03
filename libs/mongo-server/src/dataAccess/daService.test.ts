import mongoose from 'mongoose';
import { DataAccessService } from './daService';
import { ModelRegistry } from './modelRegistry';
import { ModelNames } from '@ygo/schemas';

jest.mock('mongoose', () => {
  const originalMongoose = jest.requireActual('mongoose');
  return {
    ...originalMongoose,
    connect: jest.fn(),
    Schema: class MockSchema {
      // 模擬 Schema 類別
      constructor(schema: any) {
        // 不要返回 schema，要返回 this (Schema 實例)
        Object.assign(this, schema);
      }

      // 添加 index 方法
      index(_indexSpec?: any, _options?: any) {
        // 在測試環境中，我們不需要實際建立索引，只需要避免錯誤
        console.log('index', _indexSpec, _options);
        return this;
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
      findOneAndUpdate: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({}), // 默認返回空對象
        }),
      }),
      syncIndexes: jest.fn().mockResolvedValue(undefined),
      insertMany: jest.fn().mockReturnThis(),
      collection: {
        insertOne: jest
          .fn()
          .mockResolvedValue({ insertedId: new mongoose.Types.ObjectId() }),
      },
      deleteOne: jest.fn().mockReturnThis(),
      create: jest
        .fn()
        .mockResolvedValue([
          { _id: new mongoose.Types.ObjectId('1234567890abcdef12345678') },
        ]),
      lean: jest.fn().mockReturnThis(), // 添加全局 lean 方法
      updateMany: jest.fn().mockResolvedValue({
        modifiedCount: 0,
        matchedCount: 0,
        acknowledged: true,
      }),
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

  describe('findOne', () => {
    const modelName = 'Cards' as unknown as ModelNames;
    const defaultExpectedResult = { _id: 'testId', name: 'test' };

    // 共用的測試設置
    const setupFindOneTest = (mockResult: any, isInit = true) => {
      service['isInit'] = isInit;
      mockModel.findOne = jest.fn().mockReturnThis();
      mockModel.lean = jest.fn().mockResolvedValue(mockResult);
    };

    // 共用的錯誤測試設置
    const setupFindOneErrorTest = (error: Error) => {
      service['isInit'] = true;
      mockModel.findOne = jest.fn().mockReturnThis();
      mockModel.lean = jest.fn().mockRejectedValue(error);
    };

    it('should find document with default parameters', async () => {
      setupFindOneTest(defaultExpectedResult);

      const result = await service.findOne(modelName);

      expect(mockModel.findOne).toHaveBeenCalledWith({}, {}, {});
      expect(result).toEqual(defaultExpectedResult);
    });

    it('should find document with custom parameters', async () => {
      const testParams = {
        filter: { name: 'test' },
        projection: { name: 1, _id: 0 },
        options: { lean: true },
      };
      const expectedResult = { name: 'test' };

      setupFindOneTest(expectedResult);

      const result = await service.findOne(
        modelName,
        testParams.filter,
        testParams.projection,
        testParams.options
      );

      expect(mockModel.findOne).toHaveBeenCalledWith(
        testParams.filter,
        testParams.projection,
        testParams.options
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return null when no document is found', async () => {
      setupFindOneTest(null);

      const result = await service.findOne(modelName);

      expect(result).toBeNull();
    });

    it('should throw error when query fails', async () => {
      const error = new Error('Database error');
      setupFindOneErrorTest(error);

      await expect(service.findOne(modelName)).rejects.toThrow(
        'Database error'
      );
    });

    it('should ensure database is initialized before query', async () => {
      service['isInit'] = false;
      mockModel.findOne = jest.fn().mockReturnThis();
      mockModel.lean = jest.fn().mockResolvedValue(null);

      const initSpy = jest
        .spyOn(service as any, 'init')
        .mockImplementation(async () => {
          service['isInit'] = true;
          return Promise.resolve();
        });

      await service.findOne(modelName);

      expect(initSpy).toHaveBeenCalled();
    });
  });

  describe('find', () => {
    const modelName = 'fdlConfig' as unknown as ModelNames;
    const defaultExpectedResult = [
      { _id: 'testId1', name: 'test1' },
      { _id: 'testId2', name: 'test2' },
    ];

    // 共用的測試設置
    const setupFindTest = (mockResult: any[], isInit = true) => {
      service['isInit'] = isInit;
      mockModel.find = jest.fn().mockReturnThis();
      mockModel.lean = jest.fn().mockResolvedValue(mockResult);
    };

    // 共用的錯誤測試設置
    const setupFindErrorTest = (error: Error) => {
      service['isInit'] = true;
      mockModel.find = jest.fn().mockReturnThis();
      mockModel.lean = jest.fn().mockRejectedValue(error);
    };

    it('should find documents with default parameters', async () => {
      setupFindTest(defaultExpectedResult);

      const result = await service.find(modelName);

      expect(mockModel.find).toHaveBeenCalledWith({}, {}, {});
      expect(result).toEqual(defaultExpectedResult);
    });

    it('should find documents with custom parameters', async () => {
      const testParams = {
        filter: { name: 'test' },
        projection: { name: 1, _id: 0 },
        options: { lean: true },
      };
      const expectedResult = [{ name: 'test1' }, { name: 'test2' }];

      setupFindTest(expectedResult);

      const result = await service.find(
        modelName,
        testParams.filter,
        testParams.projection,
        testParams.options
      );

      expect(mockModel.find).toHaveBeenCalledWith(
        testParams.filter,
        testParams.projection,
        testParams.options
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return empty array when no documents are found', async () => {
      setupFindTest([]);

      const result = await service.find(modelName);

      expect(result).toEqual([]);
    });

    it('should throw error when query fails', async () => {
      const error = new Error('Database error');
      setupFindErrorTest(error);

      await expect(service.find(modelName)).rejects.toThrow('Database error');
    });

    it('should ensure database is initialized before query', async () => {
      service['isInit'] = false;
      mockModel.find = jest.fn().mockReturnThis();
      mockModel.lean = jest.fn().mockResolvedValue([]);

      const initSpy = jest
        .spyOn(service as any, 'init')
        .mockImplementation(async () => {
          service['isInit'] = true;
          return Promise.resolve();
        });

      await service.find(modelName);

      expect(initSpy).toHaveBeenCalled();
    });

    it('should handle complex query conditions correctly', async () => {
      const complexQuery = {
        filter: {
          name: { $regex: 'test' },
          createdAt: { $gte: new Date() },
        },
        projection: { name: 1, createdAt: 1 },
        options: {
          sort: { createdAt: -1 },
          limit: 10,
        },
      };
      const expectedResult = [
        { name: 'test1', createdAt: new Date() },
        { name: 'test2', createdAt: new Date() },
      ];

      setupFindTest(expectedResult);

      const result = await service.find(
        modelName,
        complexQuery.filter,
        complexQuery.projection,
        complexQuery.options
      );

      expect(mockModel.find).toHaveBeenCalledWith(
        complexQuery.filter,
        complexQuery.projection,
        complexQuery.options
      );
      expect(result).toEqual(expectedResult);
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
      mockModel.findOneAndUpdate().lean().exec = jest
        .fn()
        .mockResolvedValue(mockUpdatedDocument);

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

    it('should return null if no document is found', async () => {
      const modelName = 'admin';
      const filter = { name: 'test' };
      const update = { $set: { name: 'updatedName' } };
      const options = { new: true };

      mockModel.findOneAndUpdate().lean().exec = jest
        .fn()
        .mockResolvedValue(null);

      const result = await service.findAndUpdate(
        modelName,
        filter,
        update,
        options
      );
      expect(result).toBeNull();
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(filter, update, {
        ...options,
      });
    });

    it('should handle errors', async () => {
      const modelName = 'admin';
      mockModel.findOneAndUpdate().lean().exec = jest
        .fn()
        .mockRejectedValue(new Error('Update error'));

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
      expect(mockModel.create).toHaveBeenCalledWith([doc], {});
      expect(res).toEqual(
        new mongoose.Types.ObjectId('1234567890abcdef12345678')
      );
    });

    it('should handle errors', async () => {
      const modelName = 'admin';
      mockModel.create.mockRejectedValue(new Error('Create error'));

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
      await service.deleteOne(modelName, filter);
      expect(mockModel.deleteOne).toHaveBeenCalledWith(filter, {});
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

  describe('findDocumentCount', () => {
    it('should ensure the database is initialized', async () => {
      const spyInit = jest
        .spyOn(service as any, 'init')
        .mockResolvedValue(undefined);
      await service.findDocumentCount('admin', {}, {});
      expect(spyInit).toHaveBeenCalled();
    });

    it('should return the count of documents', async () => {
      const modelName = 'admin';
      const filter = { name: 'test' };
      const options = {};
      const mockCount = 5;

      mockModel.countDocuments = jest.fn().mockResolvedValue(mockCount);

      const res = await service.findDocumentCount(modelName, filter, options);
      expect(mockModel.countDocuments).toHaveBeenCalledWith(filter, options);
      expect(res).toEqual(mockCount);
    });

    it('should handle errors', async () => {
      const modelName = 'admin';
      const filter = { name: 'test' };
      const options = {};
      mockModel.countDocuments = jest
        .fn()
        .mockRejectedValue(new Error('Count error'));

      await expect(
        service.findDocumentCount(modelName, filter, options)
      ).rejects.toThrow('Count error');
    });
  });

  describe('updateMany', () => {
    const modelName = 'admin' as unknown as ModelNames;

    beforeEach(() => {
      mockModel.updateMany = jest.fn().mockResolvedValue({
        modifiedCount: 2,
        matchedCount: 2,
        acknowledged: true,
      });
    });

    it('should ensure the database is initialized', async () => {
      const spyInit = jest
        .spyOn(service as any, 'init')
        .mockResolvedValue(undefined);

      await service.updateMany(
        modelName,
        { name: 'test' },
        { $set: { status: 'updated' } }
      );

      expect(spyInit).toHaveBeenCalled();
    });

    it.each([
      [
        'basic update',
        { name: 'test' },
        { $set: { status: 'updated' } },
        {},
        2,
      ],
      [
        'update with options',
        { type: 'user' },
        { $set: { isActive: false } },
        { upsert: false },
        3,
      ],
      [
        'no matches found',
        { nonExistent: 'field' },
        { $set: { status: 'updated' } },
        {},
        0,
      ],
    ])(
      'Given %s, when updateMany called, then should return correct count',
      async (_, filter, update, options, expectedCount) => {
        // Arrange
        mockModel.updateMany.mockResolvedValue({
          modifiedCount: expectedCount,
          matchedCount: expectedCount,
          acknowledged: true,
        });

        // Act
        const result = await service.updateMany(
          modelName,
          filter,
          update,
          options
        );

        // Assert
        expect(mockModel.updateMany).toHaveBeenCalledWith(
          filter,
          update,
          options
        );
        expect(result).toBe(expectedCount);
      }
    );

    it('Given database error, when updateMany called, then should throw error', async () => {
      // Arrange
      const error = new Error('Update error');
      mockModel.updateMany.mockRejectedValue(error);

      // Act & Assert
      await expect(
        service.updateMany(
          modelName,
          { name: 'test' },
          { $set: { status: 'updated' } }
        )
      ).rejects.toThrow('Update error');

      expect(mockModel.updateMany).toHaveBeenCalledWith(
        { name: 'test' },
        { $set: { status: 'updated' } },
        {}
      );
    });

    it('Given complex update query, when updateMany called, then should handle correctly', async () => {
      // Arrange
      const complexFilter = {
        $and: [
          { status: 'active' },
          { lastLogin: { $lt: new Date('2024-01-01') } },
        ],
      };
      const complexUpdate = {
        $set: {
          status: 'inactive',
          updatedAt: new Date(),
        },
        $inc: { loginCount: 1 },
      };
      const options = {
        upsert: false,
        writeConcern: { w: 1 },
      };

      mockModel.updateMany.mockResolvedValue({
        modifiedCount: 5,
        matchedCount: 5,
        acknowledged: true,
      });

      // Act
      const result = await service.updateMany(
        modelName,
        complexFilter,
        complexUpdate,
        options
      );

      // Assert
      expect(mockModel.updateMany).toHaveBeenCalledWith(
        complexFilter,
        complexUpdate,
        options
      );
      expect(result).toBe(5);
    });
  });
});
