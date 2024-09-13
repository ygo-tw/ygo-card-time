import { FastifyBaseLogger } from 'fastify';
import Redis from 'ioredis';

import { DataCacheService } from '../index';
import { MemoryProvider } from '../provider/memory';
import { RedisProvider } from '../provider/redis';
import {
  CacheSettings,
  GetCacheParams,
  SetCacheParams,
} from '../type/cache.type';

jest.mock('../provider/memory');
jest.mock('../provider/redis');
jest.useFakeTimers();

describe('Data Cache Service', () => {
  const redisClients = {
    read: new Redis(),
    write: new Redis(),
    publisher: new Redis(),
    subscriber: new Redis(),
  };
  const logger = {} as FastifyBaseLogger;
  logger.error = jest.fn();
  logger.info = jest.fn();
  logger.warn = jest.fn();
  logger.debug = jest.fn();
  logger.trace = jest.fn();
  const cacheSettings: CacheSettings = {
    ENABLE_CACHE: true,
    ENABLE_REDIS_CACHE: true,
    ENABLE_MEMORY_CACHE: true,
    CACHE_PREFIX: 'test',
    REDIS_DEFAULT_TTL_SECONDS: 86400,
  };
  const dataCacheService = DataCacheService.getInstance(
    cacheSettings,
    logger,
    redisClients
  );
  const memoryProvider = (MemoryProvider as jest.Mock).mock.instances[0];
  const redisProvider = (RedisProvider as jest.Mock).mock.instances[0];

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    redisClients.read.disconnect();
    redisClients.write.disconnect();
    redisClients.publisher.disconnect();
    redisClients.subscriber.disconnect();
  });

  describe('Set Cache Data', () => {
    it.each([
      {
        keys: ['test', '123'],
        value: 'testtest',
        useMemory: true,
        useRedis: true,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
      } as SetCacheParams<string>,
      {
        keys: ['test', '123'],
        value: 123,
        useMemory: true,
        useRedis: true,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
      } as SetCacheParams<number>,
      {
        keys: ['test', '123'],
        value: { test: 123 },
        useMemory: true,
        useRedis: true,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
      } as SetCacheParams<object>,
    ])(
      'When params are correct and all caches are enabled, should return data',
      async params => {
        // arrange
        const data = {
          expirationInfo: {
            providerExpirationDate: '2024-01-09T03:16:30.978Z',
            dataExpirationDate: '2024-01-08T03:16:30.978Z',
          },
          data: params.value,
        };
        memoryProvider.set = jest
          .fn()
          .mockImplementation(() => Promise.resolve(data));
        redisProvider.set = jest
          .fn()
          .mockImplementation(() => Promise.resolve(data));

        // act
        const result = await dataCacheService.set<object | string | number>(
          params
        );

        // assert
        expect(result).toEqual({
          expirationInfo: {
            memoryProviderExpirationDate: '2024-01-09T03:16:30.978Z',
            memoryDataExpirationDate: '2024-01-08T03:16:30.978Z',
            redisProviderExpirationDate: '2024-01-09T03:16:30.978Z',
            redisDataExpirationDate: '2024-01-08T03:16:30.978Z',
          },
          enableMemory: params.useMemory,
          enableRedis: params.useRedis,
          data: params.value,
          cacheKey: expect.any(String),
        });
      }
    );

    it.each([
      {
        keys: ['test', '123'],
        value: 'testtest',
        useMemory: true,
        useRedis: false,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
      } as SetCacheParams<string>,
      {
        keys: ['test', '123'],
        value: 123,
        useMemory: true,
        useRedis: false,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
      } as SetCacheParams<number>,
      {
        keys: ['test', '123'],
        value: { test: 123 },
        useMemory: true,
        useRedis: false,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
      } as SetCacheParams<object>,
    ])(
      'When params are correct and only enable memory cache, should return data',
      async params => {
        // arrange
        const data = {
          expirationInfo: {
            providerExpirationDate: '2024-01-09T03:16:30.978Z',
            dataExpirationDate: '2024-01-08T03:16:30.978Z',
          },
          data: params.value,
        };
        memoryProvider.set = jest
          .fn()
          .mockImplementation(() => Promise.resolve(data));
        redisProvider.set = jest
          .fn()
          .mockImplementation(() => Promise.resolve(data));

        // act
        const result = await dataCacheService.set<object | string | number>(
          params
        );

        // assert
        expect(result).toEqual({
          expirationInfo: {
            memoryProviderExpirationDate: '2024-01-09T03:16:30.978Z',
            memoryDataExpirationDate: '2024-01-08T03:16:30.978Z',
          },
          enableMemory: params.useMemory,
          enableRedis: params.useRedis,
          data: params.value,
          cacheKey: expect.any(String),
        });
      }
    );

    it.each([
      {
        keys: ['test', '123'],
        value: 'testtest',
        useMemory: false,
        useRedis: true,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
      } as SetCacheParams<string>,
      {
        keys: ['test', '123'],
        value: 123,
        useMemory: false,
        useRedis: true,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
      } as SetCacheParams<number>,
      {
        keys: ['test', '123'],
        value: { test: 123 },
        useMemory: false,
        useRedis: true,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
      } as SetCacheParams<object>,
    ])(
      'When params are correct and only enable redis cache, should return data',
      async params => {
        // arrange
        const data = {
          expirationInfo: {
            providerExpirationDate: '2024-01-09T03:16:30.978Z',
            dataExpirationDate: '2024-01-08T03:16:30.978Z',
          },
          data: params.value,
        };
        memoryProvider.set = jest
          .fn()
          .mockImplementation(() => Promise.resolve(data));
        redisProvider.set = jest
          .fn()
          .mockImplementation(() => Promise.resolve(data));

        // act
        const result = await dataCacheService.set<object | string | number>(
          params
        );

        // assert
        expect(result).toEqual({
          expirationInfo: {
            redisProviderExpirationDate: '2024-01-09T03:16:30.978Z',
            redisDataExpirationDate: '2024-01-08T03:16:30.978Z',
          },
          enableMemory: params.useMemory,
          enableRedis: params.useRedis,
          data: params.value,
          cacheKey: expect.any(String),
        });
      }
    );

    it('When use cache, cache providers should be called once with correct parameters', async () => {
      // arrange
      const params: SetCacheParams<string> = {
        keys: ['test', '123'],
        value: 'testtest',
        useMemory: true,
        useRedis: true,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
      };
      const data = {
        expirationInfo: {
          providerExpirationDate: '2024-01-09T03:16:30.978Z',
          dataExpirationDate: '2024-01-08T03:16:30.978Z',
        },
        data: params.value,
      };
      memoryProvider.set = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));
      redisProvider.set = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));

      // act
      await dataCacheService.set<object | string | number>(params);

      // assert
      expect(memoryProvider.set).toHaveBeenCalledWith(
        expect.any(String),
        params.value,
        params.memoryTTLSeconds
      );
      expect(redisProvider.set).toHaveBeenCalledWith(
        expect.any(String),
        params.value,
        params.redisTTLSeconds
      );
    });

    it.each([
      {
        enableMemory: false,
        useMemory: true,
        enableRedis: false,
        useRedis: true,
      },
      {
        enableMemory: true,
        useMemory: false,
        enableRedis: true,
        useRedis: false,
      },
      {
        enableMemory: false,
        useMemory: false,
        enableRedis: false,
        useRedis: false,
      },
    ])(
      'When not use redis or memory cache, cache providers should not be called',
      async ({ enableMemory, useMemory, enableRedis, useRedis }) => {
        // arrange
        const params: SetCacheParams<string> = {
          keys: ['test', '123'],
          value: 'testtest',
          useMemory: useMemory,
          useRedis: useRedis,
          memoryTTLSeconds: 10,
          redisTTLSeconds: 1800,
        };
        const cacheSettings: CacheSettings = {
          ENABLE_REDIS_CACHE: enableRedis,
          ENABLE_MEMORY_CACHE: enableMemory,
          ENABLE_CACHE: true,
          CACHE_PREFIX: 'test',
          REDIS_DEFAULT_TTL_SECONDS: 86400,
        };
        const cacheService = new DataCacheService(
          logger,
          redisClients,
          cacheSettings
        );
        const memoryProvider = (MemoryProvider as jest.Mock).mock.instances[0];
        const redisProvider = (RedisProvider as jest.Mock).mock.instances[0];
        const data = {
          expirationInfo: {
            providerExpirationDate: '2024-01-09T03:16:30.978Z',
            dataExpirationDate: '2024-01-08T03:16:30.978Z',
          },
          data: params.value,
        };
        memoryProvider.set = jest
          .fn()
          .mockImplementation(() => Promise.resolve(data));
        redisProvider.set = jest
          .fn()
          .mockImplementation(() => Promise.resolve(data));

        // act
        await cacheService.set<object | string | number>(params);

        // assert
        expect(memoryProvider.set).not.toHaveBeenCalled();
        expect(redisProvider.set).not.toHaveBeenCalled();
      }
    );

    it('When setting cache failed, should throw error', () => {
      // arrange
      const params: SetCacheParams<string> = {
        keys: [],
        value: 'testtest',
        useMemory: true,
        useRedis: true,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
      };
      memoryProvider.set = jest.fn().mockImplementation(() => {
        return { status: 'rejected' };
      });
      redisProvider.set = jest.fn().mockImplementation(() => {
        return { status: 'rejected' };
      });

      // act
      const action = async () =>
        await dataCacheService.set<object | string | number>(params);

      // assert
      expect(action).rejects.toThrow();
    });

    it('When cache key is not provided, should throw error', () => {
      // arrange
      const params: SetCacheParams<string> = {
        keys: [],
        value: 'testtest',
        useMemory: true,
        useRedis: true,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
      };
      // act
      const action = async () =>
        await dataCacheService.set<object | string | number>(params);

      // assert
      expect(action).rejects.toThrow();
    });
  });

  describe('Get Cache Data', () => {
    it.each([
      {
        keys: ['test', '123'],
        source: () => Promise.resolve('abc'),
        useMemory: true,
        useRedis: true,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
        refresh: false,
      } as GetCacheParams<string>,
      {
        keys: ['test', '123'],
        source: () => Promise.resolve(123),
        useMemory: true,
        useRedis: true,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
        refresh: false,
      } as GetCacheParams<number>,
      {
        keys: ['test', '123'],
        source: () => Promise.resolve({ test: 123 }),
        useMemory: true,
        useRedis: true,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
        refresh: false,
      } as GetCacheParams<object>,
      {
        keys: ['test', '123'],
        source: () => Promise.resolve([1, 2, 3]),
        useMemory: true,
        useRedis: true,
      } as GetCacheParams<object>,
    ])('When params are correct, should not throw error', async params => {
      // arrange
      const value = await params.source();
      const data = {
        expirationInfo: {
          providerExpirationDate: '2024-01-09T03:16:30.978Z',
          dataExpirationDate: '2024-01-08T03:16:30.978Z',
        },
        data: value,
      };
      memoryProvider.set = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));
      redisProvider.set = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));

      // act
      const action = async () =>
        await dataCacheService.get<object | string | number>(params);

      // assert
      expect(action()).resolves.not.toThrow();
    });

    it.each([
      {
        keys: ['test', '123'],
        source: () => Promise.resolve(123),
        useMemory: true,
        useRedis: false,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
        refresh: false,
      } as GetCacheParams<number>,
      {
        keys: ['test', '123'],
        source: () => Promise.resolve({ test: 123 }),
        useMemory: true,
        useRedis: true,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
        refresh: false,
      } as GetCacheParams<object>,
    ])(
      'When source function is given and only use memory cache, should return memory data',
      async params => {
        // arrange
        const value = await params.source();
        const data = {
          expirationInfo: {
            providerExpirationDate: '2024-01-09T03:16:30.978Z',
            dataExpirationDate: '2024-01-08T03:16:30.978Z',
          },
          data: value,
        };
        memoryProvider.get = jest
          .fn()
          .mockImplementation(() => Promise.resolve(data));
        memoryProvider.changeDataTtl = jest
          .fn()
          .mockImplementation(() => Promise.resolve(data.expirationInfo));

        // act
        const result = await dataCacheService.get<object | string | number>(
          params
        );

        // assert
        const expected = {
          expirationInfo: {
            memoryProviderExpirationDate: '2024-01-09T03:16:30.978Z',
            memoryDataExpirationDate: '2024-01-08T03:16:30.978Z',
          },
          data: value,
          enableMemory: true,
          enableRedis: params.useRedis,
          hitFromMemory: true,
          cacheKey: expect.any(String),
        };
        expect(result).toEqual(expected);
        expect(redisProvider.get).not.toHaveBeenCalled();
        expect(memoryProvider.set).not.toHaveBeenCalled();
        expect(redisProvider.set).not.toHaveBeenCalled();
      }
    );

    it.each([
      {
        keys: ['test', '123'],
        source: () => Promise.resolve('abc'),
        useMemory: false,
        useRedis: true,
        refresh: false,
      } as GetCacheParams<string>,
      {
        keys: ['test', '123'],
        source: () => Promise.resolve({ test: 123 }),
        useMemory: false,
        useRedis: true,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
        refresh: false,
      } as GetCacheParams<object>,
    ])(
      'When source function is given and only use redis cache, should return source data',
      async params => {
        // arrange
        const value = await params.source();
        const data = {
          expirationInfo: {
            providerExpirationDate: '2024-01-09T03:16:30.978Z',
            dataExpirationDate: '2024-01-08T03:16:30.978Z',
          },
          data: value,
        };
        redisProvider.get = jest
          .fn()
          .mockImplementation(() => Promise.resolve(data));
        redisProvider.changeDataTtl = jest
          .fn()
          .mockImplementation(() => Promise.resolve(data.expirationInfo));

        // act
        const result = await dataCacheService.get<object | string | number>(
          params
        );

        // assert
        const expected = {
          expirationInfo: {
            redisProviderExpirationDate: '2024-01-09T03:16:30.978Z',
            redisDataExpirationDate: '2024-01-08T03:16:30.978Z',
          },
          data: value,
          enableMemory: false,
          enableRedis: true,
          hitFromRedis: true,
          cacheKey: expect.any(String),
        };
        expect(result).toEqual(expected);
      }
    );

    it.each([
      {
        keys: ['test', '123'],
        source: () => Promise.resolve('abc'),
        useMemory: true,
        useRedis: true,
        refresh: false,
      } as GetCacheParams<string>,
      {
        keys: ['test', '123'],
        source: () => Promise.resolve(123),
        useMemory: true,
        useRedis: true,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
        refresh: false,
      } as GetCacheParams<number>,
    ])(
      'When all cache enabled and hit from redis, should return source data',
      async params => {
        // arrange
        const value = await params.source();
        const data = {
          expirationInfo: {
            providerExpirationDate: '2024-01-09T03:16:30.978Z',
            dataExpirationDate: '2024-01-08T03:16:30.978Z',
          },
          data: value,
        };
        memoryProvider.set = jest
          .fn()
          .mockImplementation(() => Promise.resolve(data));
        memoryProvider.get = jest
          .fn()
          .mockImplementation(() => Promise.resolve(null));
        redisProvider.get = jest
          .fn()
          .mockImplementation(() => Promise.resolve(data));
        redisProvider.changeDataTtl = jest
          .fn()
          .mockImplementation(() => Promise.resolve(data.expirationInfo));

        // act
        const result = await dataCacheService.get<object | string | number>(
          params
        );

        // assert
        const expected = {
          expirationInfo: {
            memoryProviderExpirationDate: '2024-01-09T03:16:30.978Z',
            memoryDataExpirationDate: '2024-01-08T03:16:30.978Z',
            redisProviderExpirationDate: '2024-01-09T03:16:30.978Z',
            redisDataExpirationDate: '2024-01-08T03:16:30.978Z',
          },
          data: value,
          hitFromMemory: false,
          hitFromRedis: true,
          enableMemory: true,
          enableRedis: true,
          cacheKey: expect.any(String),
        };
        expect(result).toEqual(expected);
      }
    );

    it.each([
      {
        keys: ['test', '123'],
        source: () => Promise.resolve('abc'),
        useMemory: true,
        useRedis: true,
        refresh: false,
      } as GetCacheParams<string>,
      {
        keys: ['test', '123'],
        source: () => Promise.resolve(123),
        useMemory: true,
        useRedis: true,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
        refresh: false,
      } as GetCacheParams<number>,
    ])(
      'When all cache enabled and hit from source, should return source data',
      async params => {
        // arrange
        const value = await params.source();
        const data = {
          expirationInfo: {
            providerExpirationDate: '2024-01-09T03:16:30.978Z',
            dataExpirationDate: '2024-01-08T03:16:30.978Z',
          },
          data: value,
        };
        memoryProvider.set = jest
          .fn()
          .mockImplementation(() => Promise.resolve(data));
        memoryProvider.get = jest
          .fn()
          .mockImplementation(() => Promise.resolve(null));
        redisProvider.set = jest
          .fn()
          .mockImplementation(() => Promise.resolve(data));
        redisProvider.get = jest
          .fn()
          .mockImplementation(() => Promise.resolve(null));

        // act
        const result = await dataCacheService.get<object | string | number>(
          params
        );

        // assert
        const expected = {
          expirationInfo: {
            memoryProviderExpirationDate: '2024-01-09T03:16:30.978Z',
            memoryDataExpirationDate: '2024-01-08T03:16:30.978Z',
            redisProviderExpirationDate: '2024-01-09T03:16:30.978Z',
            redisDataExpirationDate: '2024-01-08T03:16:30.978Z',
          },
          data: value,
          hitFromMemory: false,
          hitFromRedis: false,
          enableMemory: true,
          enableRedis: true,
          cacheKey: expect.any(String),
        };
        expect(result).toEqual(expected);
      }
    );

    it.each([
      {
        keys: ['test', '123'],
        source: () => Promise.resolve({ test: 123 }),
        useMemory: false,
        useRedis: true,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
        refresh: false,
      } as GetCacheParams<object>,
      {
        keys: ['test', '123'],
        source: () => Promise.resolve({ test: 123 }),
        useMemory: false,
        useRedis: false,
        memoryTTLSeconds: 10,
        refresh: false,
      } as GetCacheParams<object>,
      {
        keys: ['test', '123'],
        source: () => Promise.resolve({ test: 123 }),
        useMemory: false,
        useRedis: false,
        memoryTTLSeconds: 10,
        refresh: true,
      } as GetCacheParams<object>,
    ])('When not use memory, should not call memory provider', async params => {
      // arrange
      const value = await params.source();
      const data = {
        expirationInfo: {
          providerExpirationDate: '2024-01-09T03:16:30.978Z',
          dataExpirationDate: '2024-01-08T03:16:30.978Z',
        },
        data: value,
      };
      redisProvider.set = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));
      redisProvider.get = jest
        .fn()
        .mockImplementation(() => Promise.resolve(null));

      // act
      await dataCacheService.get<object | string | number>(params);

      // assert
      expect(memoryProvider.set).not.toHaveBeenCalled();
      expect(memoryProvider.get).not.toHaveBeenCalled();
      expect(memoryProvider.changeDataTtl).not.toHaveBeenCalled();
    });

    it.each([
      {
        keys: ['test', '123'],
        source: () => Promise.resolve({ test: 123 }),
        useMemory: true,
        useRedis: false,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
        refresh: false,
      } as GetCacheParams<object>,
      {
        keys: ['test', '123'],
        source: () => Promise.resolve({ test: 123 }),
        useMemory: false,
        useRedis: false,
        memoryTTLSeconds: 10,
        refresh: false,
      } as GetCacheParams<object>,
      {
        keys: ['test', '123'],
        source: () => Promise.resolve({ test: 123 }),
        useMemory: false,
        useRedis: false,
        memoryTTLSeconds: 10,
        refresh: true,
      } as GetCacheParams<object>,
    ])('When not use redis, should not call redis provider', async params => {
      // arrange
      const value = await params.source();
      const data = {
        expirationInfo: {
          providerExpirationDate: '2024-01-09T03:16:30.978Z',
          dataExpirationDate: '2024-01-08T03:16:30.978Z',
        },
        data: value,
      };
      memoryProvider.set = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));
      memoryProvider.get = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));
      memoryProvider.changeDataTtl = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data.expirationInfo));

      // act
      await dataCacheService.get<object | string | number>(params);

      // assert
      expect(redisProvider.set).not.toHaveBeenCalled();
      expect(redisProvider.get).not.toHaveBeenCalled();
      expect(redisProvider.changeDataTtl).not.toHaveBeenCalled();
    });

    it('When refreshCache, should shorten memory and redia cache ttl', async () => {
      // arrange
      const params: GetCacheParams<object> = {
        keys: ['test', '123'],
        source: () => Promise.resolve({ test: 123 }),
        useMemory: true,
        useRedis: true,
        refresh: true,
      };

      const data = {
        expirationInfo: {
          providerExpirationDate: '2024-01-09T03:16:30.978Z',
          dataExpirationDate: '2024-01-08T03:16:30.978Z',
        },
        data: { test: 123 },
      };
      memoryProvider.set = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));
      redisProvider.set = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));

      // act
      await dataCacheService.get<object>(params);

      // assert
      expect(memoryProvider.changeDataTtl).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number)
      );
      expect(redisProvider.changeDataTtl).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number)
      );
    });

    it('When refreshCache, should set new cache', async () => {
      // arrange
      const params: GetCacheParams<object> = {
        keys: ['test', '123'],
        source: () => Promise.resolve({ test: 123 }),
        useMemory: true,
        useRedis: true,
        memoryTTLSeconds: 10,
        redisTTLSeconds: 1800,
        refresh: true,
      };

      const data = {
        expirationInfo: {
          providerExpirationDate: '2024-01-09T03:16:30.978Z',
          dataExpirationDate: '2024-01-08T03:16:30.978Z',
        },
        data: { test: 123 },
      };
      memoryProvider.set = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));
      redisProvider.set = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));

      // act
      await dataCacheService.get<object>(params);

      // assert
      expect(memoryProvider.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        params.memoryTTLSeconds
      );
      expect(redisProvider.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        params.redisTTLSeconds
      );
    });

    it('When memory cache expired, should extend cache ttl and get data from redis', async () => {
      // arrange
      const params: GetCacheParams<object> = {
        keys: ['test', '123555'],
        source: () => Promise.resolve({ test: 123 }),
        useMemory: true,
        useRedis: true,
        refresh: false,
        memoryTTLSeconds: 10,
      };
      const data = {
        expirationInfo: {
          providerExpirationDate: '2024-01-09T03:16:30.978Z',
          dataExpirationDate: '2024-01-08T03:16:30.978Z',
        },
        data: { test: 123 },
      };
      memoryProvider.get = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));
      redisProvider.get = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));
      memoryProvider.set = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));
      redisProvider.set = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));
      memoryProvider.changeDataTtl = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data.expirationInfo));
      redisProvider.changeDataTtl = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data.expirationInfo));

      // act
      await dataCacheService.get<object>(params);

      // assert
      await jest.runOnlyPendingTimersAsync();
      expect(memoryProvider.changeDataTtl).toHaveBeenCalledWith(
        expect.any(String),
        params.memoryTTLSeconds
      );
      expect(redisProvider.get).toHaveBeenCalledWith(expect.any(String));
    });

    it('When redis cache expired, should extend cache ttl and get data from source', async () => {
      // arrange
      const params: GetCacheParams<object> = {
        keys: ['test', '123'],
        source: () => Promise.resolve({ test: 123 }),
        useMemory: true,
        useRedis: true,
        refresh: false,
        redisTTLSeconds: 1800,
      };
      const sourceData = await params.source();
      const data = {
        expirationInfo: {
          providerExpirationDate: '2024-01-09T03:16:30.978Z',
          dataExpirationDate: '2024-01-08T03:16:30.978Z',
        },
        data: { test: 123 },
      };
      memoryProvider.get = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));
      redisProvider.get = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));
      memoryProvider.set = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));
      redisProvider.set = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));
      memoryProvider.changeDataTtl = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data.expirationInfo));
      redisProvider.changeDataTtl = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data.expirationInfo));

      // act
      await dataCacheService.get<object>(params);

      // assert
      await jest.runOnlyPendingTimersAsync();
      expect(redisProvider.changeDataTtl).toHaveBeenCalledWith(
        expect.any(String),
        params.redisTTLSeconds
      );
      expect(memoryProvider.set).toHaveBeenCalledWith(
        expect.any(String),
        sourceData,
        expect.any(Number)
      );
      expect(redisProvider.set).toHaveBeenCalledWith(
        expect.any(String),
        sourceData,
        expect.any(Number)
      );
    });

    it('When both memory and redis cache not exist, should get data from source and set cache', async () => {
      // arrange
      const params: GetCacheParams<object> = {
        keys: ['test', '123'],
        source: () => Promise.resolve({ test: 123 }),
        useMemory: true,
        useRedis: true,
        refresh: false,
      };
      const sourceData = await params.source();
      const data = {
        expirationInfo: {
          providerExpirationDate: '2024-01-09T03:16:30.978Z',
          dataExpirationDate: '2024-01-08T03:16:30.978Z',
        },
        data: { test: 123 },
      };
      memoryProvider.get = jest
        .fn()
        .mockImplementation(() => Promise.resolve(null));
      redisProvider.get = jest
        .fn()
        .mockImplementation(() => Promise.resolve(null));
      memoryProvider.set = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));
      redisProvider.set = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data));
      memoryProvider.changeDataTtl = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data.expirationInfo));
      redisProvider.changeDataTtl = jest
        .fn()
        .mockImplementation(() => Promise.resolve(data.expirationInfo));

      // act
      await dataCacheService.get<object>(params);

      // assert
      expect(memoryProvider.set).toHaveBeenCalledWith(
        expect.any(String),
        sourceData,
        expect.any(Number)
      );
      expect(redisProvider.set).toHaveBeenCalledWith(
        expect.any(String),
        sourceData,
        expect.any(Number)
      );
    });

    it('When cache key is not provided, should throw error', () => {
      // arrange
      const params: GetCacheParams<object> = {
        keys: [],
        source: () => Promise.resolve({ test: 123 }),
        useMemory: true,
        useRedis: true,
        refresh: false,
      };

      // act
      const action = async () => await dataCacheService.get<object>(params);

      // assert
      expect(action()).rejects.toThrow();
    });
  });
});
