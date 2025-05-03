import { FastifyRedis } from '@fastify/redis';
import { RedisClients } from '../type/cache.type';
import {
  CacheValue,
  getRandomInt,
  safeJsonParser,
  safeStringify,
} from '../utils';
import {
  ProviderCacheData,
  ProviderExpirationInfo,
} from '../type/provider.type';

export class RedisProvider {
  private readonly readClient: FastifyRedis['read'];
  private readonly writeClient: FastifyRedis['write'];
  private readonly redisDefaultTTL: number;

  constructor(redisClients: RedisClients, redisDefaultTTL: number) {
    this.readClient = redisClients.read;
    this.writeClient = redisClients.write;
    this.redisDefaultTTL = redisDefaultTTL;
  }

  /**
   * 設定 Cache
   * @param cacheKey cacheKey
   * @param value value
   * @param ttlSeconds 過期時間
   * @returns provider cache data
   */
  public async set<T>(
    cacheKey: string,
    value: T,
    ttlSeconds: number
  ): Promise<ProviderCacheData<T>> {
    const baseErrorMessage = 'Unable to set redis cache.';
    if (!cacheKey) {
      throw new Error(baseErrorMessage + 'Error: cachekey is missing.');
    }

    if (!value) {
      throw new Error(baseErrorMessage + 'Error: value is missing.');
    }

    if (!ttlSeconds) {
      throw new Error(baseErrorMessage + 'Error: ttlSeconds is missing.');
    }

    const buffer = Math.min(1800, ttlSeconds * 0.2);
    const providerTtlSeconds = Math.max(
      ttlSeconds + buffer,
      this.redisDefaultTTL
    );
    const providerExpirationDate = new Date(
      Date.now() + providerTtlSeconds * 1000
    ).toISOString();
    const dataExpirationDate = new Date(
      Date.now() + ttlSeconds * 1000
    ).toISOString();

    const cacheData: ProviderCacheData<T> = {
      expirationInfo: {
        providerExpirationDate,
        dataExpirationDate,
      },
      data: value,
    };

    await this.writeClient.set(
      cacheKey,
      safeStringify(cacheData as CacheValue)
    );

    await this.changeProviderTtl(cacheKey, providerTtlSeconds);

    return cacheData;
  }

  /**
   * Get a cache entry by cacheKey
   * @param cacheKey The cache key to retrieve
   * @returns The cache entry as a ProviderCacheData<T> or null if not found
   * @throws Error if cacheKey is missing
   */
  public async get<T>(cacheKey: string): Promise<ProviderCacheData<T> | null> {
    if (!cacheKey) {
      throw new Error('Unable to get redis cache. Error: cachekey is missing.');
    }
    const value = await this.readClient.get(cacheKey);

    return !value ? null : safeJsonParser<ProviderCacheData<T>>(value);
  }
  /**
   * Delete a cache entry by cacheKey
   * @param cacheKey cacheKey
   * @returns a promise
   * @throws Error if cacheKey is missing
   */

  public async del(cacheKey: string): Promise<void> {
    if (!cacheKey) {
      throw new Error('Unable to del redis cache. Error: cachekey is missing.');
    }
    await this.writeClient.del(cacheKey);
  }

  public async providerTtl(cacheKey: string): Promise<number | null> {
    if (!cacheKey) {
      throw new Error(
        'Unable to get redis provider ttl. Error: cachekey is missing.'
      );
    }
    return await this.readClient.ttl(cacheKey);
  }

  /**
   * Get the TTL of a cache entry by cacheKey
   * @param cacheKey The cache key to retrieve
   * @returns The TTL of the cache entry as a number in seconds or null if not found
   * @throws Error if cacheKey is missing
   */
  public async dataTtl(cacheKey: string): Promise<number | null> {
    if (!cacheKey) {
      throw new Error(
        'Unable to get redis data ttl. Error: cachekey is missing.'
      );
    }

    const data = await this.get<unknown>(cacheKey);

    if (!data) {
      return null;
    }

    if (!data.expirationInfo.dataExpirationDate) {
      return -1;
    }

    const expirationDateInMilliSeconds = new Date(
      data.expirationInfo.dataExpirationDate
    ).getTime();

    return (expirationDateInMilliSeconds - Date.now()) / 1000;
  }

  /**
   * Change the TTL of a cache entry by cacheKey
   * @param cacheKey The cache key to update
   * @param ttlSeconds The new TTL in seconds
   * @returns The new expiration date as a string in ISO format
   * @throws Error if cacheKey or ttlSeconds is missing
   */
  public async changeProviderTtl(
    cacheKey: string,
    ttlSeconds: number
  ): Promise<ProviderExpirationInfo['providerExpirationDate']> {
    if (!cacheKey) {
      throw new Error(
        'Unable to change redis provider ttl. Error: cachekey is missing.'
      );
    }
    if (!ttlSeconds) {
      throw new Error(
        'Unable to change redis provider ttl. Error: ttlSeconds is missing.'
      );
    }

    const randomTtl =
      ttlSeconds < 30 ? ttlSeconds : ttlSeconds + getRandomInt(1, 10);

    await this.writeClient.expire(cacheKey, randomTtl);
    const expirationDate = new Date(
      Date.now() + randomTtl * 1000
    ).toISOString();

    return expirationDate;
  }

  /**
   * Change the TTL of a cache entry by cacheKey
   * @param cacheKey The cache key to update
   * @param ttlSeconds The new TTL in seconds
   * @returns The new expiration info
   * @throws Error if cacheKey or ttlSeconds is missing
   */
  public async changeDataTtl(
    cacheKey: string,
    ttlSeconds: number
  ): Promise<ProviderExpirationInfo> {
    if (!cacheKey) {
      throw new Error(
        'Unable to change redis data ttl. Error: cachekey is missing.'
      );
    }
    if (!ttlSeconds) {
      throw new Error(
        'Unable to change redis data ttl. Error: ttlSeconds is missing.'
      );
    }

    const data = await this.get<unknown>(cacheKey);
    if (!data) {
      return {} as ProviderExpirationInfo;
    }

    const randomTtl =
      ttlSeconds < 30 ? ttlSeconds : ttlSeconds + getRandomInt(1, 10);

    const setCacheResult = await this.set<unknown>(
      cacheKey,
      data.data,
      randomTtl
    );

    return setCacheResult.expirationInfo;
  }

  /**
   * 執行集合交集運算
   * @param keys 要進行交集的集合鍵列表
   * @returns 交集結果的成員數組
   */
  public async sinter(...keys: string[]): Promise<string[]> {
    if (!keys || keys.length === 0) {
      throw new Error('Unable to perform SINTER. Error: keys are missing.');
    }

    try {
      return await this.readClient.sinter(keys);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Unable to perform SINTER. Error: ${error.message}`);
      }
      throw new Error('Unable to perform SINTER. Error: unknown error');
    }
  }

  /**
   * 添加成員到集合
   * @param key 集合鍵
   * @param members 要添加的成員
   * @returns 添加的成員數量
   */
  public async sadd(key: string, ...members: string[]): Promise<number> {
    if (!key) {
      throw new Error('Unable to perform SADD. Error: key is missing.');
    }
    if (!members || members.length === 0) {
      throw new Error('Unable to perform SADD. Error: members are missing.');
    }

    try {
      return await this.writeClient.sadd(key, members);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Unable to perform SADD. Error: ${error.message}`);
      }
      throw new Error('Unable to perform SADD. Error: unknown error');
    }
  }

  /**
   * 從集合中移除成員
   * @param key 集合鍵
   * @param members 要移除的成員
   * @returns 移除的成員數量
   */
  public async srem(key: string, ...members: string[]): Promise<number> {
    if (!key) {
      throw new Error('Unable to perform SREM. Error: key is missing.');
    }
    if (!members || members.length === 0) {
      throw new Error('Unable to perform SREM. Error: members are missing.');
    }

    try {
      return await this.writeClient.srem(key, members);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Unable to perform SREM. Error: ${error.message}`);
      }
      throw new Error('Unable to perform SREM. Error: unknown error');
    }
  }

  /**
   * 獲取集合成員數量
   * @param key 集合鍵
   * @returns 集合成員數量
   */
  public async scard(key: string): Promise<number> {
    if (!key) {
      throw new Error('Unable to perform SCARD. Error: key is missing.');
    }

    try {
      return await this.readClient.scard(key);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Unable to perform SCARD. Error: ${error.message}`);
      }
      throw new Error('Unable to perform SCARD. Error: unknown error');
    }
  }

  /**
   * 批次獲取多個鍵的值
   * @param keys 要獲取的鍵列表
   * @returns 對應值的列表，順序與鍵列表一致
   */
  public async mget<T>(
    keys: string[]
  ): Promise<Array<ProviderCacheData<T> | null>> {
    if (!keys || keys.length === 0) {
      throw new Error('Unable to perform MGET. Error: keys are missing.');
    }

    try {
      const values = await this.readClient.mget(keys);
      return values.map(value =>
        !value ? null : safeJsonParser<ProviderCacheData<T>>(value)
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Unable to perform MGET. Error: ${error.message}`);
      }
      throw new Error('Unable to perform MGET. Error: unknown error');
    }
  }

  /**
   * 使用 pipeline 批次設置多個鍵值對
   * @param items 鍵值對數組 [{key, value, ttlSeconds}]
   * @returns 操作結果
   */
  public async pipelineSet<T>(
    items: Array<{
      key: string;
      value: T;
      ttlSeconds: number;
    }>
  ): Promise<boolean> {
    if (!items || items.length === 0) {
      throw new Error(
        'Unable to perform pipeline SET. Error: items are missing.'
      );
    }

    try {
      const pipeline = this.writeClient.pipeline();

      for (const item of items) {
        const { key, value, ttlSeconds } = item;

        if (!key || !value || !ttlSeconds) {
          continue;
        }

        const buffer = Math.min(1800, ttlSeconds * 0.2);
        const providerTtlSeconds = Math.max(
          ttlSeconds + buffer,
          this.redisDefaultTTL
        );

        const providerExpirationDate = new Date(
          Date.now() + providerTtlSeconds * 1000
        ).toISOString();

        const dataExpirationDate = new Date(
          Date.now() + ttlSeconds * 1000
        ).toISOString();

        const cacheData = {
          expirationInfo: {
            providerExpirationDate,
            dataExpirationDate,
          },
          data: value,
        };

        pipeline.set(key, safeStringify(cacheData as CacheValue));
        pipeline.expire(key, providerTtlSeconds);
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Unable to perform pipeline SET. Error: ${error.message}`
        );
      }
      throw new Error('Unable to perform pipeline SET. Error: unknown error');
    }
  }
}
