/* eslint-disable */

//! auto generated from json schema
export const usefulApiRequestGetCardListSchema = {
  $id: 'https://card.time.com/schema/useful/api/request/get-card-list',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'get-card-list_schema',
  description: 'YGO Card Time get card list request schema',
  type: 'object',
  additionalProperties: true,
  properties: {
    number: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/number',
    },
    name: {
      title: '名稱',
      description: '卡片名稱',
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/name',
    },
    atk_t: {
      title: '攻擊力上限',
      description: '卡片攻擊力',
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/atkDef',
    },
    atk_l: {
      title: '攻擊力下限',
      description: '卡片攻擊力',
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/atkDef',
    },
    def_t: {
      title: '守備力上限',
      description: '卡片守備力',
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/atkDef',
    },
    def_l: {
      title: '守備力下限',
      description: '卡片守備力',
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/atkDef',
    },
    id: {
      $ref: 'https://card.time.com/schema/useful/value-object/card-meta#/$defs/id',
    },
    type: {
      $ref: 'https://card.time.com/schema/useful/value-object/card-meta#/$defs/type',
    },
    attribute: {
      $ref: 'https://card.time.com/schema/useful/value-object/card-meta#/$defs/attribute',
    },
    rarity: {
      title: '稀有度',
      description: '卡片稀有度',
      $ref: 'https://card.time.com/schema/useful/value-object/enum-meta#/$defs/rarityProperty',
    },
    star: {
      $ref: 'https://card.time.com/schema/useful/value-object/card-meta#/$defs/star',
    },
    race: {
      $ref: 'https://card.time.com/schema/useful/value-object/card-meta#/$defs/race',
    },
    product_information_type: {
      $ref: 'https://card.time.com/schema/useful/value-object/card-meta#/$defs/product_information_type',
    },
    effect: {
      $ref: 'https://card.time.com/schema/useful/value-object/card-meta#/$defs/effect',
    },
    forbidden: { title: '禁卡', type: 'number', enum: [0, 1, 2] },
  },
  required: [],
} as const;
