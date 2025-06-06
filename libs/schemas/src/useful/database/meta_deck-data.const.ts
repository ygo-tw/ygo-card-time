/* eslint-disable */

//! auto generated from json schema
export const usefulDatabaseMetaSchema = {
  $id: 'https://card.time.com/schema/useful/database/meta_deck-data',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'database meta_deck-data schema',
  description: 'YGO Card Time database meta_deck-data schema',
  type: 'object',
  unevaluatedProperties: false,
  required: [
    '_id',
    'title',
    'publish_date',
    'photo',
    'content',
    'status',
    'to_top',
    'admin_id',
    'tag',
  ],
  properties: {
    _id: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/_id',
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
