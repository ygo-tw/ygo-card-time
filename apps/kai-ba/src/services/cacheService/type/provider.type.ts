export type ProviderCacheData<T> = {
  expirationInfo: ProviderExpirationInfo;
  data: T;
};

export type ProviderExpirationInfo = {
  providerExpirationDate: string;
  dataExpirationDate: string;
};

export interface ICacheProvider {
  /**
   * 設定 Cache
   * @param cacheKey cacheKey
   * @param value value
   * @param ttlSeconds 過期時間
   * @returns provider cache data
   */
  set<T>(
    cacheKey: string,
    value: T,
    ttlSeconds: number
  ): Promise<ProviderCacheData<T>>;

  /**
   * 取得 Cache Data
   * @param cacheKey cacheKey
   * @returns provider cache data
   */
  get<T>(cacheKey: string): Promise<ProviderCacheData<T> | null>;

  /**
   * 清除快取
   * @param cacheKey cacheKey
   */
  del(cacheKey: string): Promise<void>;

  /**
   *
   * 取得 provider ttl (實際在 provider 上的 ttl)
   *
   * 如果 key 不存在，回傳 null
   *
   * 如果 key 沒有 ttl，回傳 -1
   *
   * @param cacheKey cacheKey
   * @returns provider ttl
   */
  providerTtl(cacheKey: string): Promise<number | null>;

  /**
   *
   * 取得 data ttl (紀錄在 data 內的 ttl)
   *
   * 如果 key 已經過期，回傳負數秒數
   *
   * 如果 key 不存在，回傳 null
   *
   * 如果 key 沒有 ttl，回傳 -1
   *
   * @param cacheKey cacheKey
   * @returns data ttl
   */
  dataTtl(cacheKey: string): Promise<number | null>;

  /**
   * 更改 provider ttl
   * @param cacheKey cacheKey
   * @param ttlSeconds ttlSeconds
   * @returns provider expiration date
   */
  changeProviderTtl(
    cacheKey: string,
    ttlSeconds: number
  ): Promise<ProviderExpirationInfo['providerExpirationDate']>;

  /**
   * 更改 data ttl
   * @param cacheKey cacheKey
   * @param ttlSeconds ttlSeconds
   * @returns provider expiration info
   */
  changeDataTtl(
    cacheKey: string,
    ttlSeconds: number
  ): Promise<ProviderExpirationInfo>;
}
