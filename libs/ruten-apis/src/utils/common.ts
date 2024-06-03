/**
 * 檢查文字是否包含非法商品字符。
 * @param {string} txt - 要檢查的文字。
 * @returns {boolean} 如果文字中不包含非法商品字符則返回 true，否則返回 false。
 */
export const isIllegalProductChar = (txt: string) =>
  !/搜(?=[0-9a-zA-Z\s.,;:!?'"(){}[\]<>-])|售出|防雷|請勿下標|福袋|卡磚|壓克力|單螺絲卡夾|全新未拆|參考|非 |非(?=[A-Za-z\s])/.test(
    txt
  );

/**
 * 檢查文字是否包含同人或 DIY 模式相關字符。
 * @param {string} txt - 要檢查的文字。
 * @returns {boolean} 如果文字中不包含同人或 DIY 模式相關字符則返回 true，否則返回 false。
 */
export const isFanMode = (txt: string) => !/同人|DIY/.test(txt);

/**
 * 檢查文字是否包含 "未拆包" 字符。
 * @param {string} txt - 要檢查的文字。
 * @returns {boolean} 如果文字中不包含 "未拆包" 字符則返回 true，否則返回 false。
 */
export const isUnopenedPackProduct = (txt: string) =>
  txt.indexOf('未拆包') === -1;

/**
 * 檢查產品名稱是否包含所有關鍵字。
 * @param {string} prodName - 產品名稱。
 * @param {string} searchName - 搜索關鍵字，使用加號（+）分隔。
 * @returns {boolean} 如果產品名稱包含所有關鍵字則返回 true，否則返回 false。
 */
export const containsAllKeywords = (prodName: string, searchName: string) => {
  const keywords = searchName.split('+').filter(el => el);
  return keywords.every(keyword => prodName.includes(keyword));
};

/**
 * 檢查產品名稱是否不包含其他稀有度字符。
 * @param {string} ProdName - 產品名稱。
 * @param {string} r - 稀有度字符。
 * @param {number} rarityLength - 稀有度字符的長度。
 * @returns {boolean} 如果產品名稱不包含其他稀有度字符則返回 true，否則返回 false。
 */
export const notContainsAnotherRarity = (
  ProdName: string,
  r: string,
  rarityLength: number
) => ProdName.indexOf(keyWordsFactory(r, rarityLength).replace('+', '')) === -1;

/**
 * 根據稀有度生成搜索關鍵字。
 * @param rarity - 卡片的稀有度。
 * @param rarityLength - 稀有度陣列的長度。
 * @returns 關鍵字字串。
 */
export const keyWordsFactory = (rarity: string, rarityLength: number) => {
  if (rarity === '普卡' && rarityLength === 1) return '';

  const exactReplacements: { [key: string]: string } = {
    方鑽: '+普卡',
    點鑽: '+普卡',
    凸版浮雕: '+浮雕',
    浮雕: '+浮雕',
    '20th紅鑽': '+紅鑽',
    紅鑽: '+紅鑽',
    '25th金鑽': '+金鑽',
    金鑽: '+金鑽',
    金亮KC紋: '+KC',
    KC紋: '+KC',
    普卡放射鑽: '+普卡放射鑽',
  };

  const indexReplacements: { [key: string]: string } = {
    字紋鑽: '+字紋鑽',
    粉鑽: '+粉鑽',
    彩鑽: '+彩鑽',
    古紋鑽: '+古紋鑽',
  };

  if (exactReplacements[rarity]) {
    return exactReplacements[rarity];
  }

  for (const key in indexReplacements) {
    if (rarity.indexOf(key) !== -1) {
      return indexReplacements[key];
    }
  }

  if (rarity.indexOf('異圖') !== -1) return rarity.replace('-', '+');

  const complexRarities = ['方鑽', '點鑽', '碎鑽'];
  for (const complexRarity of complexRarities) {
    if (rarity.indexOf(complexRarity) !== -1) {
      const replacedRar = rarity.replace(complexRarity, '');
      return ['普卡', '銀字', '隱普'].includes(replacedRar)
        ? ''
        : `+${complexRarity}+${replacedRar}`;
    }
  }

  return '+' + rarity;
};
