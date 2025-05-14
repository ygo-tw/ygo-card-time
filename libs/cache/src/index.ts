import { FastifyBaseLogger } from 'fastify';
import {
  CacheData,
  CacheExpirationInfo,
  CacheItem,
  CacheSettings,
  GetCacheParams,
  RedisClients,
  SetCacheParams,
} from './type/cache.type';
import { getCacheKey } from './utils';
import { MemoryProvider } from './provider/memory';
import NodeCache from 'node-cache';
import { RedisProvider } from './provider/redis';

export * from './type/cache.type';

type CacheParams<T> = {
  keys: (string | number)[];
  source: () => Promise<T>;
  enableMemory: boolean;
  enableRedis: boolean;
  memoryTTLSeconds: number;
  redisTTLSeconds: number;
  refresh: boolean;
};

export class DataCacheService {
  private static instance: DataCacheService;
  private readonly cacheSettings: CacheSettings;
  private readonly redis: RedisProvider | null;
  private readonly memory: MemoryProvider;
  private readonly isRedisEnable: boolean;
  private readonly isMemoryEnable: boolean;
  private readonly logger: FastifyBaseLogger;

  constructor(
    logger: FastifyBaseLogger,
    redisClients: RedisClients,
    cacheSettings: CacheSettings
  ) {
    this.cacheSettings = cacheSettings;
    this.logger = logger;
    this.redis = redisClients
      ? new RedisProvider(redisClients, cacheSettings.REDIS_DEFAULT_TTL_SECONDS)
      : null;
    this.memory = new MemoryProvider(new NodeCache());
    this.isRedisEnable =
      this.cacheSettings?.ENABLE_REDIS_CACHE === true || false;
    this.isMemoryEnable =
      this.cacheSettings?.ENABLE_MEMORY_CACHE === true || false;
  }

  /**
   * 取得 Instance
   * @param cacheSetting cacheSetting
   * @param logger logger
   * @param redis redis
   * @returns data cache service
   */
  public static getInstance(
    cacheSettings: CacheSettings,
    logger: FastifyBaseLogger,
    redisClients: RedisClients
  ): DataCacheService {
    if (!DataCacheService.instance) {
      DataCacheService.instance = new DataCacheService(
        logger,
        redisClients,
        cacheSettings
      );
    }

    return DataCacheService.instance;
  }

  public async set<T>(params: SetCacheParams<T>): Promise<CacheData<T>> {
    const {
      keys,
      value,
      useMemory,
      useRedis,
      memoryTTLSeconds = 10,
      redisTTLSeconds = 3600,
    } = params;

    if (!keys || keys.length === 0) {
      this.logger.error('Unable to set cache. Error: cacheKey is missing.');
      throw new Error('Unable to set cache. Error: cacheKey is missing.');
    }

    const cacheKey = getCacheKey(keys, this.cacheSettings);
    const promises = [];
    const expirationInfo: CacheExpirationInfo = {};
    const enableMemory = useMemory && this.isMemoryEnable;
    const enableRedis = !!(this.redis && useRedis && this.isRedisEnable);

    if (enableMemory) {
      promises.push(
        new Promise((resolve, reject) => {
          this.memory
            .set(cacheKey, value, memoryTTLSeconds)
            .then(data => {
              expirationInfo.memoryProviderExpirationDate =
                data.expirationInfo.providerExpirationDate;
              expirationInfo.memoryDataExpirationDate =
                data.expirationInfo.dataExpirationDate;
              resolve(data);
            })
            .catch(err => reject(err));
        })
      );
    }

    if (enableRedis) {
      promises.push(
        new Promise((resolve, reject) => {
          // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
          this.redis!.set(cacheKey, value, redisTTLSeconds)
            .then(data => {
              expirationInfo.redisProviderExpirationDate =
                data.expirationInfo.providerExpirationDate;
              expirationInfo.redisDataExpirationDate =
                data.expirationInfo.dataExpirationDate;
              resolve(data);
            })
            .then(err => reject(err));
        })
      );
    }

    const setCacheResults = await Promise.allSettled(promises);
    const failedResults = setCacheResults.filter(
      result => result.status === 'rejected'
    ) as PromiseRejectedResult[];
    if (failedResults.length > 0) {
      this.logger.error(
        `Unable to set cache. Error: ${failedResults[0].reason}`
      );
      throw new Error(`Unable to set cache. Error: ${failedResults[0].reason}`);
    }

    return {
      cacheKey,
      expirationInfo,
      enableMemory,
      enableRedis,
      data: value,
    };
  }

  public async get<T>(params: GetCacheParams<T>): Promise<CacheData<T>> {
    const {
      keys,
      source,
      useMemory,
      useRedis,
      memoryTTLSeconds = 10,
      redisTTLSeconds = 3600,
      refresh = false,
    } = params;

    if (!keys || keys.length === 0) {
      this.logger.error(
        'Unable to get data from cache. Error: cacheKey is missing.'
      );

      throw new Error(
        'Unable to get data from cache. Error: cacheKey is missing.'
      );
    }

    if (
      !this.cacheSettings?.ENABLE_CACHE ||
      (!this.isRedisEnable && !this.isMemoryEnable)
    ) {
      return {
        data: await source(),
      };
    }

    const enableMemory = useMemory && this.isMemoryEnable;
    const enableRedis = !!(this.redis && useRedis && this.isRedisEnable);

    const cacheParams: CacheParams<T> = {
      keys,
      source,
      enableMemory,
      enableRedis,
      memoryTTLSeconds,
      redisTTLSeconds,
      refresh,
    };

    if (refresh) {
      return this.refreshCache<T>(cacheParams);
    }

    return (
      (await this.getMemoryData<T>(cacheParams)) ||
      (await this.getRedisData<T>(cacheParams)) ||
      (await this.getSourceData<T>(cacheParams))
    );
  }

  public generateCacheKeyArray(keys: (string | number | object)[]): string[] {
    const cacheKeyArray: string[] = [];

    for (const key of keys) {
      cacheKeyArray.push(
        `${
          typeof key === 'object'
            ? JSON.stringify(key).replaceAll(':', '_')
            : key
        }`
      );
    }

    return cacheKeyArray;
  }

  /**
   * 刷新快取
   * @param params 快取參數
   * @returns cache data
   */
  private async refreshCache<T>(params: CacheParams<T>): Promise<CacheData<T>> {
    const { keys, enableMemory, enableRedis } = params;

    const cacheKey = getCacheKey(keys, this.cacheSettings);
    const promises = [];

    // 避免從 source 取回資料失敗造成快取長時間未更新，先將快取時間縮短
    if (enableMemory) {
      promises.push(this.memory.changeDataTtl(cacheKey, 10));
    }

    if (this.redis && enableRedis) {
      promises.push(this.redis.changeDataTtl(cacheKey, 60));
    }

    await Promise.all(promises);

    const data = await this.getSourceData<T>(params);

    return data;
  }

  /**
   * 取得 memory 資料
   * @param params 快取參數
   * @returns cache data
   */
  private async getMemoryData<T>(
    params: CacheParams<T>
  ): Promise<CacheData<T> | null> {
    const { keys, enableMemory, enableRedis, memoryTTLSeconds } = params;

    if (!enableMemory) {
      return null;
    }

    const cacheKey = getCacheKey(keys, this.cacheSettings);
    const memoryData = await this.memory.get<T>(cacheKey);
    if (!memoryData) {
      return null;
    }

    const isDataExpired =
      new Date(memoryData.expirationInfo.dataExpirationDate).getTime() <
      Date.now();
    if (isDataExpired) {
      const providerExpirationInfo = await this.memory.changeDataTtl(
        cacheKey,
        memoryTTLSeconds
      );
      memoryData.expirationInfo = providerExpirationInfo;

      // 非同步從 redis 取得新資料
      setImmediate(() => this.getRedisData<T>(params));
    }
    return {
      expirationInfo: {
        memoryProviderExpirationDate:
          memoryData.expirationInfo.providerExpirationDate,
        memoryDataExpirationDate: memoryData.expirationInfo.dataExpirationDate,
      },
      enableMemory,
      enableRedis,
      hitFromMemory: true,
      data: memoryData.data,
      cacheKey,
    };
  }

  /**
   * 取得 redis 資料
   * @param params 快取參數
   * @returns cache data
   */
  private async getRedisData<T>(
    params: CacheParams<T>
  ): Promise<CacheData<T> | null> {
    const {
      keys,
      enableMemory,
      enableRedis,
      memoryTTLSeconds,
      redisTTLSeconds,
    } = params;

    if (!this.redis || !enableRedis) {
      return null;
    }

    const cacheKey = getCacheKey(keys, this.cacheSettings);
    const redisData = await this.redis.get<T>(cacheKey);

    if (!redisData) {
      return null;
    }

    const expirationInfo: CacheExpirationInfo = {
      redisProviderExpirationDate:
        redisData.expirationInfo.providerExpirationDate,
      redisDataExpirationDate: redisData.expirationInfo.dataExpirationDate,
    };

    if (enableMemory) {
      const memoryData = await this.memory.set(
        cacheKey,
        redisData.data,
        memoryTTLSeconds
      );
      expirationInfo.memoryProviderExpirationDate =
        memoryData.expirationInfo.providerExpirationDate;
      expirationInfo.memoryDataExpirationDate =
        memoryData.expirationInfo.dataExpirationDate;
    }

    const isDataExpired =
      new Date(redisData.expirationInfo.dataExpirationDate).getTime() <
      Date.now();
    if (isDataExpired) {
      const redisExpirationInfo = await this.redis.changeDataTtl(
        cacheKey,
        redisTTLSeconds
      );
      expirationInfo.redisProviderExpirationDate =
        redisExpirationInfo.providerExpirationDate;
      expirationInfo.redisDataExpirationDate =
        redisExpirationInfo.dataExpirationDate;
      // 非同步從 source 取得新資料
      setImmediate(() => this.getSourceData<T>(params));
    }

    const result: CacheData<T> = {
      expirationInfo,
      enableMemory,
      enableRedis,
      hitFromRedis: true,
      data: redisData.data,
      cacheKey,
    };
    if (enableMemory) result.hitFromMemory = false;

    return result;
  }

  /**
   * 取得 source 資料
   * @param params 快取參數
   * @returns Cache Data
   */
  private async getSourceData<T>(
    params: CacheParams<T>
  ): Promise<CacheData<T>> {
    const {
      keys,
      source,
      enableMemory,
      enableRedis,
      memoryTTLSeconds,
      redisTTLSeconds,
      refresh,
    } = params;

    const data = await source();
    const setCacheResult = await this.set({
      keys: keys,
      value: data,
      useMemory: enableMemory,
      useRedis: enableRedis,
      memoryTTLSeconds: memoryTTLSeconds,
      redisTTLSeconds: redisTTLSeconds,
    });

    const result: CacheData<T> = {
      expirationInfo: setCacheResult.expirationInfo,
      enableMemory: setCacheResult.enableMemory,
      enableRedis: setCacheResult.enableRedis,
      data,
      cacheKey: getCacheKey(keys, this.cacheSettings),
    };
    if (enableMemory && !refresh) result.hitFromMemory = false;
    if (enableRedis && !refresh) result.hitFromRedis = false;

    return result;
  }

  /**
   * 執行集合交集運算
   * @param keys 要進行交集的集合鍵列表
   * @returns 交集結果的成員數組
   */
  public async sinter(...keys: string[]): Promise<string[]> {
    if (!this.redis || !this.isRedisEnable) {
      return [];
    }

    try {
      return await this.redis.sinter(...keys);
    } catch (error) {
      this.logger.error(`SINTER operation failed: ${JSON.stringify(error)}`);
      return [];
    }
  }

  /**
   * 添加成員到集合
   * @param key 集合鍵
   * @param members 要添加的成員
   * @param ttlSeconds 集合過期時間（秒）
   * @returns 添加的成員數量
   */
  public async sadd(
    key: string,
    members: string[],
    ttlSeconds = this.cacheSettings.REDIS_DEFAULT_TTL_SECONDS
  ): Promise<number> {
    if (!this.redis || !this.isRedisEnable) {
      return 0;
    }

    try {
      const result = await this.redis.sadd(key, ...members);
      await this.redis.changeProviderTtl(key, ttlSeconds);
      return result;
    } catch (error) {
      this.logger.error(`SADD operation failed: ${JSON.stringify(error)}`);
      return 0;
    }
  }

  /**
   * 從集合中移除成員
   * @param key 集合鍵
   * @param members 要移除的成員
   * @returns 移除的成員數量
   */
  public async srem(key: string, members: string[]): Promise<number> {
    if (!this.redis || !this.isRedisEnable) {
      return 0;
    }

    try {
      return await this.redis.srem(key, ...members);
    } catch (error) {
      this.logger.error(`SREM operation failed: ${JSON.stringify(error)}`);
      return 0;
    }
  }

  /**
   * 獲取集合的成員數量
   * @param key 集合鍵
   * @returns 集合中的成員數量
   */
  public async scard(key: string): Promise<number> {
    if (!this.redis || !this.isRedisEnable) {
      return 0;
    }

    try {
      return await this.redis.scard(key);
    } catch (error) {
      this.logger.error(`SCARD operation failed: ${JSON.stringify(error)}`);
      return 0;
    }
  }

  /**
   * 批次獲取多個鍵的值
   * @param keysList 多組鍵數組列表
   * @param source 當鍵不存在時的資料來源函數
   * @returns 對應值的列表
   */
  public async mget<T>(
    keysList: Array<string[]>
  ): Promise<Array<CacheData<T> | null>> {
    if (!this.redis || !this.isRedisEnable) {
      return [];
    }

    try {
      // 將多組鍵轉換為Redis鍵
      const redisKeys = keysList.map(keys =>
        getCacheKey(keys, this.cacheSettings)
      );

      const results = await this.redis.mget<T>(redisKeys);

      // 如果所有值都未命中且有提供資料來源
      if (results.every(r => r === null)) {
        return [];
      }

      return results.map(result =>
        result
          ? {
              expirationInfo: {
                redisProviderExpirationDate:
                  result.expirationInfo.providerExpirationDate,
                redisDataExpirationDate:
                  result.expirationInfo.dataExpirationDate,
              },
              enableRedis: true,
              hitFromRedis: true,
              data: result.data,
            }
          : null
      );
    } catch (error) {
      this.logger.error(`MGET operation failed: ${JSON.stringify(error)}`);
      return [];
    }
  }

  /**
   * 批次設置多個鍵值對
   * @param items 要設置的項目列表
   * @returns 操作是否成功
   */
  public async mset<T>(items: Array<CacheItem<T>>): Promise<boolean> {
    if (!this.redis || !this.isRedisEnable) {
      return false;
    }

    try {
      const redisItems = items.map(item => ({
        key: getCacheKey(item.keys, this.cacheSettings),
        value: item.value,
        ttlSeconds:
          item.ttlSeconds || this.cacheSettings.REDIS_DEFAULT_TTL_SECONDS,
      }));

      return await this.redis.pipelineSet(redisItems);
    } catch (error) {
      this.logger.error(`MSET operation failed: ${JSON.stringify(error)}`);
      return false;
    }
  }

  /**
   * 獲取 Redis 伺服器信息和統計數據
   * @returns Redis 伺服器信息，包含命中率統計
   */
  public async getRedisInfo(): Promise<Record<string, any> | null> {
    if (!this.redis || !this.isRedisEnable) {
      return null;
    }

    try {
      return await this.redis.getInfo();
    } catch (error) {
      this.logger.error(`Get Redis info failed: ${JSON.stringify(error)}`);
      return null;
    }
  }
}
