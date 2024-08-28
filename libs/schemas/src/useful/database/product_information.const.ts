/* eslint-disable */

//! auto generated from json schema
export const usefulDatabaseProductInformationDataSchema = {
  $id: 'https://card.time.com/schema/useful/database/product-information-data',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'database cards-data schema',
  description: 'YGO Card Time database product-information-data schema',
  type: 'object',
  unevaluatedProperties: false,
  required: [
    '_id',
    'type',
    'title',
    'publish_date',
    'content',
    'status',
    'to_top',
  ],
  properties: {
    _id: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/_id',
    },
    type: {
      title: '產品分類',
      description: '產品分類 0=補充包 1=Rush Duel 2=其他 3=預組套牌 4=禮盒',
      type: 'number',
      minimum: 0,
      maximum: 4,
    },
    product_information_type_id: {
      allOf: [
        {
          $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/_id',
        },
        {
          title: 'product_information_type 的 _id',
          description: 'product_information_type 的 _id',
        },
      ],
    },
    title: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/title',
    },
    publish_date: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/publish_date',
    },
    photo: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/photo',
    },
    content: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/content',
    },
    status: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/status',
    },
    to_top: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/to_top',
    },
    admin_id: {
      allOf: [
        {
          $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/_id',
        },
        { title: 'admin id', description: 'admin id' },
      ],
    },
    tag: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/tag',
    },
  },
} as const;
