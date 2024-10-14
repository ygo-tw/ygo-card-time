/* eslint-disable */

//! auto generated from json schema
export const usefulApiRequestGetCardListSchema = {
  $id: 'https://card.time.com/schema/useful/api/request/get-card-list',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'get-card-list_schema',
  description: 'YGO Card Time get card list request schema',
  type: 'object',
  additionalProperties: false,
  properties: {
    filter: {
      type: 'object',
      description: '過濾條件',
      properties: {
        number: {
          $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/number',
        },
        name: {
          title: '名稱',
          description: '卡片名稱',
          $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/name',
        },
        atk: {
          title: '攻擊力',
          description: '卡片攻擊力',
          $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/atkDef',
        },
        def: {
          title: '守備力',
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
          $ref: 'https://card.time.com/schema/useful/value-object/card-meta#/$defs/rarity',
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
      },
    },
  },
  required: ['filter'],
} as const;
