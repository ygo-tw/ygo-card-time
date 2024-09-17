import NodeCache from 'node-cache';
import { MemoryProvider } from './memory'; // 导入 MemoryProvider 类

describe('MemoryProvider', () => {
  let memoryProvider: MemoryProvider;
  const cache = new NodeCache();

  beforeEach(() => {
    memoryProvider = new MemoryProvider(cache);
  });

  test('set and get cache', async () => {
    const cacheKey = 'testKey';
    const value = { data: 'testValue' };
    const ttlSeconds = 10;

    await memoryProvider.set(cacheKey, value, ttlSeconds);
    const result = await memoryProvider.get(cacheKey);

    expect(result).toBeTruthy();
    expect(result?.data).toEqual(value);
  });

  test('get non-existing cache', async () => {
    const result = await memoryProvider.get('nonExistingKey');
    expect(result).toBeNull();
  });

  test('delete cache', async () => {
    const cacheKey = 'deleteKey';
    const value = { data: 'toBeDeleted' };
    await memoryProvider.set(cacheKey, value, 10);

    await memoryProvider.del(cacheKey);
    const result = await memoryProvider.get(cacheKey);

    expect(result).toBeNull();
  });

  test('change TTL', async () => {
    const cacheKey = 'ttlKey';
    const value = { data: 'ttlValue' };
    const ttlSeconds = 10;

    await memoryProvider.set(cacheKey, value, ttlSeconds);
    await memoryProvider.changeProviderTtl(cacheKey, 20);

    const ttl = await memoryProvider.providerTtl(cacheKey);
    expect(ttl).toBe(20);
  });

  test('change data TTL', async () => {
    const cacheKey = 'dataTtlKey';
    const value = { data: 'dataTtlValue' };
    const initialTtlSeconds = 10;
    const newTtlSeconds = 30;

    await memoryProvider.set(cacheKey, value, initialTtlSeconds);
    await memoryProvider.changeDataTtl(cacheKey, newTtlSeconds);

    const ttl = await memoryProvider.providerTtl(cacheKey);
    expect(ttl).toBe(newTtlSeconds);
  });

  test('get TTL for non-existing cache', async () => {
    const ttl = await memoryProvider.providerTtl('nonExistingKey');
    expect(ttl).toBeNull();
  });

  test('set cache with missing key', async () => {
    const action = async () =>
      await memoryProvider.set('', { data: 'value' }, 10);
    expect(action).rejects.toThrow();
  });

  test('set cache with missing value', async () => {
    const action = async () => await memoryProvider.set('key', null, 10);
    await expect(action).rejects.toThrow();
  });

  test('set cache with missing TTL', async () => {
    const action = async () =>
      await memoryProvider.set('key', { data: 'value' }, 0);
    await expect(action).rejects.toThrow();
  });
});
