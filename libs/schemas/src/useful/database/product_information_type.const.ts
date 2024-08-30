/* eslint-disable */

//! auto generated from json schema
export const usefulDatabaseProductSchema = {
  $id: 'https://card.time.com/schema/useful/database/product_information_type',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'database product_information_type schema',
  description: 'YGO Card Time database product_information_type schema',
  type: 'object',
  unevaluatedProperties: false,
  required: ['_id', 'name', 'packType', 'mainType', 'subType', 'status'],
  properties: {
    _id: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/_id',
    },
    name: {
      title: '名稱',
      description: '產品名稱',
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/name',
      maxLength: 30,
    },
    packType: { type: 'string', maxLength: 4 },
    mainType: { type: 'number', minimum: 0, maximum: 4 },
    subType: {
      type: 'string',
      enum: ['Rush Duel', '補充包', '預組套牌', '禮盒', '其他'],
    },
    status: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/status',
    },
  },
} as const;
