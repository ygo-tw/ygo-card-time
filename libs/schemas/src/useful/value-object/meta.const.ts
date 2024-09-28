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
      pattern: '^[0-9]{8}[A-Z]?$',
    },
    create_date: {
      title: '時間',
      description: '建立時間',
      type: 'string',
      format: 'date-time',
    },
    photo: { title: '圖片', description: '此筆資料的圖片', type: 'string' },
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
    qaItem: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the question answer' },
        tag: { type: 'string', description: 'Tag of the question tag' },
        date: {
          type: 'string',
          format: 'date',
          description: 'Date of the question answer',
        },
        q: { type: 'string', description: 'Question' },
        a: { type: 'string', description: 'Answer' },
        _id: {
          title: '識別編號',
          description: '此筆資料的唯一識別值',
          type: 'string',
          pattern: '^[0-9a-f]{24}$',
        },
      },
      required: ['title', 'tag', 'date', 'q', 'a'],
    },
    title: { type: 'string', description: '標題', maxLength: 100 },
    publish_date: {
      type: 'string',
      format: 'date-time',
      description: '發布日期',
    },
    content: { type: 'string', description: '內容', maxLength: 6000 },
    status: {
      type: 'number',
      description: '狀態 0=上架中, 1=下架中',
      maximum: 1,
      minimum: 0,
    },
    to_top: {
      type: 'boolean',
      description: '是否置頂 true=置頂, false=不置頂',
    },
    tag: {
      type: 'array',
      description: '標籤',
      items: {
        type: 'object',
        description: '標籤內容',
        properties: {
          _id: { $ref: '#/$defs/_id' },
          tag: { type: 'string', description: '標籤' },
        },
      },
    },
    deck: {
      type: 'array',
      description: '牌組列表',
      items: {
        type: 'object',
        description: '牌組內容',
        properties: {
          _id: { $ref: '#/$defs/_id' },
          card_id: { type: 'string', description: '卡片ID' },
          card_rarity: { type: 'string', description: '卡片稀有度' },
        },
      },
    },
  },
} as const;
