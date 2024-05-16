/* eslint-disable */

//! auto generated from json schema
export const usefulValueObjectMetaSchema = {
  $id: 'https://card.time.com/schema/useful/value-object/meta',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: '2023-06_definition_meta',
  description: '91APP 2023-06 meta defs, 系統用欄位',
  $defs: {
    _id: {
      title: '識別編號',
      description: '此筆資料的唯一識別值',
      type: 'string',
      pattern: '^[0-9a-f]{24}$',
    },
    name: {
      title: '資料名稱',
      description: '此筆資料的命名',
      type: 'string',
      maxLength: 50,
    },
    atkDef: {
      title: '攻擊守備',
      description: '怪獸攻擊守備',
      type: ['number', 'null'],
      maximum: 20000,
      minimum: 0,
    },
    number: {
      title: '密碼',
      description: '卡片密碼',
      type: 'string',
      pattern: '^[0-9]{8}$',
    },
    price_object: {
      type: 'object',
      properties: {
        time: {
          title: '取得時間',
          type: 'string',
          pattern: '^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$',
        },
        price_lowest: { title: '最低價格', type: ['number', 'null'] },
        price_avg: { title: '平均價格', type: ['number', 'null'] },
        price: { title: '價格', type: ['number', 'null'] },
        rarity: { title: '稀有度', type: 'string' },
      },
      required: ['time', 'rarity'],
    },
  },
} as const;
