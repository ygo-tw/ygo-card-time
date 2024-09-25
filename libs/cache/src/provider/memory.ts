import NodeCache from 'node-cache';

import {
  ICacheProvider,
  ProviderCacheData,
  ProviderExpirationInfo,
} from '../type/provider.type';
import { CacheValue, safeJsonParser, safeStringify } from '../utils';

export class MemoryProvider implements ICacheProvider {
  private readonly cache: NodeCache;

  constructor(cache: NodeCache) {
    this.cache = cache;
  }

  public set<T>(
    cacheKey: string,
    value: T,
    ttlSeconds: number
  ): Promise<ProviderCacheData<T>> {
    const baseErrorMessage = 'Unable to set memory cache.';
    if (!cacheKey) {
      throw new Error(baseErrorMessage + 'Error: cachekey is missing.');
    }

    if (!value) {
      throw new Error(baseErrorMessage + 'Error: value is missing.');
    }

    if (!ttlSeconds) {
      throw new Error(baseErrorMessage + 'Error: ttlSeconds is missing.');
    }

    const data = safeStringify(value as CacheValue);

    this.cache.set(cacheKey, data, ttlSeconds);

    const expirationDate = new Date(
      Date.now() + ttlSeconds * 1000
    ).toISOString();

    return Promise.resolve({
      expirationInfo: {
        providerExpirationDate: expirationDate,
        dataExpirationDate: expirationDate,
      },
      data: value,
    });
  }

  public async get<T>(cacheKey: string): Promise<ProviderCacheData<T> | null> {
    if (!cacheKey) {
      throw new Error(
        'Unable to get memory cache. Error: cachekey is missing.'
      );
    }

    const value = this.cache.get<T>(cacheKey);
    const ttlSeconds = await this.dataTtl(cacheKey);
    if (!value || !ttlSeconds) return Promise.resolve(null);

    const expirationDate = new Date(
      Date.now() + ttlSeconds * 1000
    ).toISOString();

    return Promise.resolve({
      expirationInfo: {
        providerExpirationDate: expirationDate,
        dataExpirationDate: expirationDate,
      },
      data: safeJsonParser<T>(value),
    });
  }

  public del(cacheKey: string): Promise<void> {
    if (!cacheKey) {
      throw new Error(
        'Unable to del memory cache. Error: cachekey is missing.'
      );
    }

    this.cache.del(cacheKey);

    return Promise.resolve();
  }

  public providerTtl(cacheKey: string): Promise<number | null> {
    if (!cacheKey) {
      throw new Error(
        'Unable to get memory cache ttl. Error: cachekey is missing.'
      );
    }

    const date = Date.now();
    const expireDateInMilliseconds = this.cache.getTtl(cacheKey);

    let ttl = null;

    if (expireDateInMilliseconds && expireDateInMilliseconds !== 0) {
      ttl = (expireDateInMilliseconds - date) / 1000;
    } else if (expireDateInMilliseconds === 0) {
      ttl = -1;
    }

    return Promise.resolve(ttl);
  }

  public async dataTtl(cacheKey: string): Promise<number | null> {
    return await this.providerTtl(cacheKey);
  }

  public changeProviderTtl(
    cacheKey: string,
    ttlSeconds: number
  ): Promise<ProviderExpirationInfo['providerExpirationDate']> {
    return Promise.resolve(
      this.changeTtl(cacheKey, ttlSeconds).providerExpirationDate
    );
  }

  public changeDataTtl(
    cacheKey: string,
    ttlSeconds: number
  ): Promise<ProviderExpirationInfo> {
    return Promise.resolve(this.changeTtl(cacheKey, ttlSeconds));
  }

  /**
   * 更改 ttl
   * @param cacheKey cache key
   * @param ttlSeconds ttl seconds
   * @returns provider expiration info
   */
  private changeTtl(
    cacheKey: string,
    ttlSeconds: number
  ): ProviderExpirationInfo {
    if (!cacheKey) {
      throw new Error(
        'Unable to change memory cache ttl. Error: cachekey is missing.'
      );
    }

    if (!ttlSeconds) {
      throw new Error(
        'Unable to change memory cache ttl. Error: ttlSeconds is missing.'
      );
    }

    this.cache.ttl(cacheKey, ttlSeconds);
    const expirationDate = new Date(
      Date.now() + ttlSeconds * 1000
    ).toISOString();

    return {
      providerExpirationDate: expirationDate,
      dataExpirationDate: expirationDate,
    };
  }
}
