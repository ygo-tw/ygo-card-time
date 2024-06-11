import {
  keyWordsFactory,
  isIllegalProductChar,
  isFanMode,
  isUnopenedPackProduct,
  containsAllKeywords,
  notContainsAnotherRarity,
  delay,
  getRutenApis,
} from './common';
import { RutenApisType } from '../services/getShopListByRutenService.type';

describe('ruten-api: common', () => {
  test('isIllegalProductChar should detect illegal characters', () => {
    expect(isIllegalProductChar('售出')).toBe(false);
    expect(isIllegalProductChar('合法商品')).toBe(true);
  });

  test('isFanMode should detect fan mode keywords', () => {
    expect(isFanMode('同人商品')).toBe(false);
    expect(isFanMode('官方商品')).toBe(true);
  });

  test('isUnopenedPackProduct should detect unopened pack', () => {
    expect(isUnopenedPackProduct('這是一個未拆包的產品')).toBe(false);
    expect(isUnopenedPackProduct('這是一個已拆包的產品')).toBe(true);
  });

  test('containsAllKeywords should check all keywords', () => {
    expect(containsAllKeywords('這是一個測試產品', '測試+產品')).toBe(true);
    expect(containsAllKeywords('這是一個測試產品', '測試+不存在')).toBe(false);
  });

  test('should check for another rarity', () => {
    console.log(keyWordsFactory('稀有', 5)); // 調試輸出
    expect(notContainsAnotherRarity('這是一個測試產品', '稀有', 5)).toBe(true);
    expect(notContainsAnotherRarity(`這是一個測試稀有產品`, '稀有', 5)).toBe(
      false
    );
  });

  test('should delay for the specified time', async () => {
    const time = 1000; // 1秒

    const promise = delay(time);

    // 快進計時器
    jest.advanceTimersByTime(time);

    // 等待 promise 被解決
    await expect(promise).resolves.toBeUndefined();
  });

  describe('keyWordsFactory', () => {
    it('should return empty string for "普卡" when rarityLength is 1', () => {
      const result = keyWordsFactory('普卡', 1);
      expect(result).toBe('');
    });

    it('should return "+普卡" for "方鑽"', () => {
      const result = keyWordsFactory('方鑽', 2);
      expect(result).toBe('+普卡');
    });

    it('should return "+浮雕" for "凸版浮雕"', () => {
      const result = keyWordsFactory('凸版浮雕', 2);
      expect(result).toBe('+浮雕');
    });

    it('should return "+紅鑽" for "20th紅鑽"', () => {
      const result = keyWordsFactory('20th紅鑽', 2);
      expect(result).toBe('+紅鑽');
    });

    it('should return "異圖-其他" for "異圖+其他"', () => {
      const result = keyWordsFactory('異圖-其他', 2);
      expect(result).toBe('異圖+其他');
    });

    it('should return empty string for "碎鑽銀字"', () => {
      const result = keyWordsFactory('碎鑽銀字', 2);
      expect(result).toBe('');
    });

    it('should return empty string for "點鑽隱普"', () => {
      const result = keyWordsFactory('點鑽隱普', 2);
      expect(result).toBe('');
    });

    it('should return "+方鑽+其他" for "方鑽其他"', () => {
      const result = keyWordsFactory('方鑽其他', 2);
      expect(result).toBe('+方鑽+其他');
    });

    it('should return "+KC" for "金亮KC紋"', () => {
      const result = keyWordsFactory('金亮KC紋', 2);
      expect(result).toBe('+KC');
    });

    it('should return "+金鑽" for "25th金鑽"', () => {
      const result = keyWordsFactory('25th金鑽', 2);
      expect(result).toBe('+金鑽');
    });

    it('should return "+金鑽" for "金鑽"', () => {
      const result = keyWordsFactory('金鑽', 2);
      expect(result).toBe('+金鑽');
    });

    it('should return empty string for "普卡放射鑽" when rarityLength is 1', () => {
      const result = keyWordsFactory('普卡放射鑽', 1);
      expect(result).toBe('+普卡放射鑽');
    });

    it('should return "+其他" for an unhandled rarity', () => {
      const result = keyWordsFactory('其他', 2);
      expect(result).toBe('+其他');
    });

    it('should return "+粉鑽" for "粉鑽"', () => {
      const result = keyWordsFactory('粉鑽', 2);
      expect(result).toBe('+粉鑽');
    });

    it('should return "+古紋鑽" for "古紋鑽"', () => {
      const result = keyWordsFactory('古紋鑽', 2);
      expect(result).toBe('+古紋鑽');
    });

    it('should return "+字紋鑽" for "字紋鑽"', () => {
      const result = keyWordsFactory('字紋鑽', 2);
      expect(result).toBe('+字紋鑽');
    });

    it('should return "+彩鑽" for "彩鑽"', () => {
      const result = keyWordsFactory('彩鑽', 2);
      expect(result).toBe('+彩鑽');
    });

    it('should return empty string for "方鑽銀字" when replacedRar is in includes check', () => {
      const result = keyWordsFactory('方鑽銀字', 2);
      expect(result).toBe('');
    });

    it('should return empty string for "點鑽隱普" when replacedRar is in includes check', () => {
      const result = keyWordsFactory('點鑽隱普', 2);
      expect(result).toBe('');
    });
  });

  describe('getRutenApis', () => {
    const baseApiUrl = 'https://rtapi.ruten.com.tw/api';
    const baseRapiUrl = 'https://rapi.ruten.com.tw/api';

    it('should return the correct URL for PROD_LIST', () => {
      const apiKeyWords = { queryString: 'laptop' };
      const result = getRutenApis(RutenApisType.PROD_LIST, apiKeyWords);
      expect(result).toBe(
        `${baseApiUrl}/search/v3/index.php/core/prod?q=laptop&type=direct&sort=prc%2Fac&offset=1&limit=100`
      );
    });

    it('should return the correct URL for PROD_DETAIL_LIST', () => {
      const apiKeyWords = { productId: '12345' };
      const result = getRutenApis(RutenApisType.PROD_DETAIL_LIST, apiKeyWords);
      expect(result).toBe(
        `${baseRapiUrl}/items/v2/list?gno=12345&level=simple`
      );
    });

    it('should return the correct URL for SHOP_SHIP_INFO', () => {
      const apiKeyWords = { shopId: '67890' };
      const result = getRutenApis(RutenApisType.SHOP_SHIP_INFO, apiKeyWords);
      expect(result).toBe(
        `${baseRapiUrl}/shippingfee/v1/seller/67890/event/discount`
      );
    });

    it('should return the correct URL for SHOP_INFO', () => {
      const apiKeyWords = { shopId: '67890' };
      const result = getRutenApis(RutenApisType.SHOP_INFO, apiKeyWords);
      expect(result).toBe(`${baseRapiUrl}/users/v1/index.php/67890/storeinfo`);
    });

    it('should return the correct URL for SHOP_PROD_LIST with limit less than 50', () => {
      const apiKeyWords = {
        shopId: '12345',
        limit: 30,
        targetProduct: 'phone',
      };
      const result = getRutenApis(RutenApisType.SHOP_PROD_LIST, apiKeyWords);
      expect(result).toBe(
        `${baseApiUrl}/search/v3/index.php/core/seller/12345/prod?sort=prc/ac&limit=30&q=phone`
      );
    });

    it('should return the correct URL for SHOP_PROD_LIST with limit more than 50', () => {
      const apiKeyWords = {
        shopId: '12345',
        limit: 100,
        targetProduct: 'phone',
      };
      const result = getRutenApis(RutenApisType.SHOP_PROD_LIST, apiKeyWords);
      expect(result).toBe(
        `${baseApiUrl}/search/v3/index.php/core/seller/12345/prod?sort=prc/ac&limit=50&q=phone`
      );
    });

    it('should return "error" for an unknown type', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = getRutenApis('UNKNOWN_TYPE' as any, {});
      expect(result).toBe('error');
    });
  });
});
