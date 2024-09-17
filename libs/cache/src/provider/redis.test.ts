import { FastifyRedis } from '@fastify/redis';
import { RedisProvider } from './redis';
import { RedisClients } from '../type/cache.type';

describe('RedisProvider', () => {
  let redisProvider: RedisProvider;
  let mockReadClient: FastifyRedis['read'];
  let mockWriteClient: FastifyRedis['write'];

  beforeEach(() => {
    mockReadClient = {
      get: jest.fn(),
      ttl: jest.fn(),
      del: jest.fn(),
      expire: jest.fn(),
    } as unknown as FastifyRedis['read'];

    mockWriteClient = {
      set: jest.fn(),
      del: jest.fn(),
      expire: jest.fn(),
    } as unknown as FastifyRedis['write'];

    const redisClients: RedisClients = {
      read: mockReadClient,
      write: mockWriteClient,
    };

    redisProvider = new RedisProvider(redisClients, 3600);
  });

  it('should set cache correctly', async () => {
    const cacheKey = 'testKey';
    const value = { data: 'testData' };
    const ttlSeconds = 60;

    await redisProvider.set(cacheKey, value, ttlSeconds);

    expect(mockWriteClient.set).toHaveBeenCalled();
  });

  it('should get cache correctly', async () => {
    const cacheKey = 'testKey';
    const mockValue = JSON.stringify({ data: 'testData' });

    mockReadClient.get = jest.fn().mockResolvedValue(mockValue);

    const result = await redisProvider.get(cacheKey);

    expect(result).toEqual({ data: 'testData' });
  });

  it('should delete cache correctly', async () => {
    const cacheKey = 'testKey';

    await redisProvider.del(cacheKey);

    expect(mockWriteClient.del).toHaveBeenCalledWith(cacheKey);
  });

  it('should return TTL correctly', async () => {
    const cacheKey = 'testKey';
    mockReadClient.ttl = jest.fn().mockResolvedValue(120);

    const ttl = await redisProvider.providerTtl(cacheKey);

    expect(ttl).toBe(120);
  });

  it('should change provider TTL correctly', async () => {
    const cacheKey = 'testKey';
    const ttlSeconds = 60;

    await redisProvider.changeProviderTtl(cacheKey, ttlSeconds);

    expect(mockWriteClient.expire).toHaveBeenCalledWith(
      cacheKey,
      expect.any(Number)
    );
  });

  it('should change data TTL correctly', async () => {
    const cacheKey = 'testKey';
    const ttlSeconds = 60;
    const mockData = { data: 'testData' };

    mockReadClient.get = jest.fn().mockResolvedValue(mockData);

    await redisProvider.changeDataTtl(cacheKey, ttlSeconds);

    expect(mockWriteClient.set).toHaveBeenCalled();
  });
});
