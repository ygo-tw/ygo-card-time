/* eslint-disable */

//! auto generated from json schema
export const usefulApiResponseGetCardListSchema = {
  $id: 'https://card.time.com/schema/useful/api/response/get-card-list',
  type: 'object',
  description: '已成功取得資料列表',
  unevaluatedProperties: true,
  properties: {
    total: {
      type: 'integer',
      description: '總筆數',
      format: 'int32',
      examples: [10],
    },
    list: {
      type: 'array',
      description: '查詢結果清單',
      items: {
        $ref: 'https://card.time.com/schema/useful/database/cards-data',
        properties: { rarity: { type: 'array', items: { type: 'string' } } },
      },
    },
  },
  required: ['total', 'list'],
} as const;
