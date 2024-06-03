import {
  keyWordsFactory,
  isIllegalProductChar,
  isFanMode,
  isUnopenedPackProduct,
  containsAllKeywords,
  notContainsAnotherRarity,
} from './common';

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
});
