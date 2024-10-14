/* eslint-disable */

//! auto generated from json schema
export const usefulDatabaseCardsDataSchema = {
  $id: 'https://card.time.com/schema/useful/database/cards-data',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'database cards-data schema',
  description: 'YGO Card Time database cards-data schema',
  type: 'object',
  unevaluatedProperties: false,
  required: [
    '_id',
    'name',
    'id',
    'type',
    'attribute',
    'rarity',
    'product_information_type',
  ],
  properties: {
    _id: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/_id',
    },
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
    price_info: {
      title: '露天價格',
      description: '露天價格資訊，by稀有度',
      type: 'array',
      items: {
        $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/price_object',
      },
    },
    price_yuyu: {
      title: '悠悠亭價格',
      description: '悠悠亭價格資訊，by稀有度',
      type: 'array',
      items: {
        $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/price_object',
      },
    },
    id: {
      $ref: 'https://card.time.com/schema/useful/value-object/card-meta#/$defs/id',
    },
    type: {
      $ref: 'https://card.time.com/schema/useful/value-object/card-meta#/$defs/type',
    },
    star: {
      $ref: 'https://card.time.com/schema/useful/value-object/card-meta#/$defs/star',
    },
    attribute: {
      $ref: 'https://card.time.com/schema/useful/value-object/card-meta#/$defs/attribute',
    },
    rarity: {
      $ref: 'https://card.time.com/schema/useful/value-object/card-meta#/$defs/rarity',
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
} as const;
