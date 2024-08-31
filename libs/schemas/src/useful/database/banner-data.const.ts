/* eslint-disable */

//! auto generated from json schema
export const usefulDatabaseBannerDataSchema = {
  $id: 'https://card.time.com/schema/useful/database/banner-data',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'database bannr-data schema',
  description: 'YGO Card Time database banner-data schema',
  type: 'object',
  unevaluatedProperties: false,
  required: ['_id', 'date', 'photo_pc', 'photo_mobile'],
  properties: {
    _id: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/_id',
    },
    title: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/title',
    },
    date: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/create_date',
    },
    photo_pc: {
      title: '圖片',
      description: '桌機版Banner',
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/photo',
    },
    photo_mobile: {
      title: '圖片',
      description: '手機版Banner',
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/photo',
    },
    url: { title: '網址', description: 'Banner外連網址', maxLength: 200 },
  },
} as const;
