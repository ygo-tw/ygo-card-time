import { CardsDataType, GetCardListRequestType } from '@ygo/schemas';

/**
 * 卡片複合鍵 (ID:Number 格式)
 */
export type CardCompoundKey = string;

/**
 * 卡片複合鍵拆分為陣列 [ID, Number]
 */
export type CardKeyPair = [string, string];

/**
 * 集合鍵格式
 */
export type SetKey = string;

/**
 * 卡片資訊映射
 */
export type CardInfoMap = Map<CardCompoundKey, CardsDataType>;

/**
 * Redis 集合更新快取記錄
 */
export type SetKeyUpdateCache = Map<SetKey, Date>;

/**
 * 靜態過濾參數
 */
export type StaticFilterParams = Omit<
  GetCardListRequestType,
  'name' | 'atk_t' | 'atk_l' | 'def_t' | 'def_l' | 'effect'
>;

/**
 * 計算型過濾參數
 */
export interface CalculateFilterParams {
  name?: string;
  atk_t?: number | null;
  atk_l?: number | null;
  def_t?: number | null;
  def_l?: number | null;
  effect?: string;
}

/**
 * 卡片集合配置
 */
export interface SetKeyFieldConfig {
  field: string;
  prefix: string;
}

/**
 * 數值範圍條件
 */
export type RangeCondition<T> = Record<string, T>;

/**
 * Redis操作結果
 */
export interface RedisOperationResult {
  success: boolean;
  error?: any;
}
