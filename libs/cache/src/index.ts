import { FastifyBaseLogger } from 'fastify';
import {
  CacheData,
  CacheExpirationInfo,
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
}
