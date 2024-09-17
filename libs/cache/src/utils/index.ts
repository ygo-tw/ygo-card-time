import { CacheSettings } from '../type/cache.type';

export type CacheValue = string | object | number;

/**
 * Return a stringified version of a value.
 * If the value is a string, it will be returned as is.
 * If the value is an object, it will be converted to a JSON string.
 * If the value is anything else, it will be converted to a string using the toString() method.
 * @param value The value to stringify.
 * @returns The stringified value.
 */
export const safeStringify = (value: CacheValue): string => {
  const valueType = typeof value;
  if (valueType === 'string') {
    return value as string;
  }
  if (valueType === 'object') {
    return JSON.stringify(value);
  }
  return value.toString();
};

/**
 * 物件字串 parse 成物件，一般字串回傳原本的值 (數字字串 json parse 後換轉型為 number)
 *
 * @param value
 */
export const safeJsonParser = <T>(value: T | string): T => {
  try {
    return typeof value === 'string' ? (JSON.parse(value) as T) : value;
  } catch (e) {
    return value as T;
  }
};

/**
 * 取得快取 Key
 * @param keys keys
 * @param cacheSetting cacheSetting
 * @param useCachePrefix 是否使用 cache prefix
 * @returns
 */
export const getCacheKey = (
  keys: (string | number)[],
  cacheSettings: CacheSettings,
  useCachePrefix = true
) => {
  const prefix = useCachePrefix ? `${cacheSettings?.CACHE_PREFIX}:` : '';
  return prefix + keys.join(':');
};

/**
 * 取得隨機整數
 * @param min 最小值
 * @param max 最大值
 * @returns
 */
export const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min)) + min;
