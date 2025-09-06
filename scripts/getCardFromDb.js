const mongoose = require('mongoose');
const fs = require('fs');

const connectionString =
  'mongodb+srv://a9293340:574597@cluster0.rnvhhr4.mongodb.net/ygo';

// 簡單的 Card Schema
const cardSchema = new mongoose.Schema(
  {},
  {
    collection: 'cards',
    strict: false, // 允許任何欄位結構
  }
);

const Card = mongoose.model('Card', cardSchema);

/**
 * 根據 ID 查找卡片
 * @param {string} cardId - 卡片 ID
 * @returns {Promise<Object|null>}
 */
async function findCardById(cardId) {
  try {
    await mongoose.connect(connectionString);
    console.log('✅ 連接成功');

    // 嘗試多種可能的 ID 欄位，並排除 price_info 和 price_yuyu 欄位
    const card = await Card.findOne({
      $or: [{ number: cardId }],
    }).select('-price_info -price_yuyu -__v');

    if (card) {
      console.log('🎯 找到卡片:', card.name || card.id || '未知卡片');

      // 轉換為純 JavaScript 物件
      const cardObj = card.toObject();
      cardObj.id = process.argv[3];
      delete cardObj._id;
      cardObj.product_information_type = process.argv[3].split('-')[0];

      return cardObj;
    } else {
      console.log('❌ 找不到 ID:', cardId);
      return null;
    }
  } catch (error) {
    console.error('❌ 查詢失敗:', error.message);
    return null;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 連接已關閉');
  }
}

// 主要執行函數
async function main() {
  // 從命令列參數取得 ID，或使用預設值
  const cardId = process.argv[2] || '89631139';

  console.log(`🔍 搜尋卡片 ID: ${cardId}`);
  const result = await findCardById(cardId);

  if (result) {
    console.log('📋 卡片資料:', JSON.stringify(result, null, 2));
    const jsonFile = fs.readFileSync('./ntu.json', 'utf-8');
    const jsonData = JSON.parse(jsonFile);
    jsonData.push(result);
    fs.writeFileSync('./ntu.json', JSON.stringify(jsonData, null, 2));
  }
}

// 如果直接執行此檔案
if (require.main === module) {
  main();
}

module.exports = { findCardById };
