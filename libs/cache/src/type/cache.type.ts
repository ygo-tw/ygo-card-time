import { FastifyRedis } from '@fastify/redis';

export interface ICache {
  /**
   * 設定 Cache
   * @param keys keys
   * @param value value
   * @param useMemory 是否使用 memory cache
   * @param useRedis 是否使用 redis cache,
   * @param memoryTTLSeconds memory 過期時間
   * @param redisTTLSeconds redis 過期時間
   * @returns cache data
   */
  set<T>(params: SetCacheParams<T>): Promise<CacheData<T>>;

  /**
   * 取得 Cache Data
   * @param keys keys
   * @param source 資料來源
   * @param useMemory 是否使用 memory cache
   * @param useRedis 是否使用 redis cache
   * @param memoryTTLSeconds memory 過期時間
   * @param redisTTLSeconds redis 過期時間
   * @param refresh 刷新快取
   * @returns cache data
   */
  get<T>(params: GetCacheParams<T>): Promise<CacheData<T>>;

  /**
   * 直接從 Redis 取得資料
   * @param keys keys
   * @param useCachePrefix 是否使用 cache prefix，預設為 true
   * @returns cache data
   */
  getFromRedis<T>(
    keys: (string | number)[],
    useCachePrefix: boolean
  ): Promise<CacheData<T> | null>;
}

export type SetCacheParams<T> = {
  keys: (string | number)[];
  value: T;
  useMemory: boolean;
  useRedis: boolean;
  memoryTTLSeconds?: number;
  redisTTLSeconds?: number;
};

export type GetCacheParams<T> = {
  keys: (string | number)[];
  source: () => Promise<T>;
  useMemory: boolean;
  useRedis: boolean;
  memoryTTLSeconds?: number;
  redisTTLSeconds?: number;
  refresh?: boolean;
};

export type CacheSettings = {
  ENABLE_CACHE: boolean;
  ENABLE_REDIS_CACHE: boolean;
  ENABLE_MEMORY_CACHE: boolean;
  CACHE_PREFIX: string;
  REDIS_DEFAULT_TTL_SECONDS: number;
};

export type RedisClients = {
  read: FastifyRedis['read'];
  write: FastifyRedis['write'];
  publisher?: FastifyRedis['publisher'];
  subscriber?: FastifyRedis['subscriber'];
};

export type CacheExpirationInfo = {
  redisProviderExpirationDate?: string;
  redisDataExpirationDate?: string;
  memoryProviderExpirationDate?: string;
  memoryDataExpirationDate?: string;
};

export type CacheInfo = {
  expirationInfo?: CacheExpirationInfo;
  hitFromRedis?: boolean;
  hitFromMemory?: boolean;
  enableMemory?: boolean;
  enableRedis?: boolean;
  cacheKey?: string;
};

export type CacheData<T> = CacheInfo & { data: T };

export type CacheItem<T> = {
  keys: (string | number)[];
  value: T;
  ttlSeconds?: number;
};
