/* eslint-disable */

//! auto generated from json schema
export const usefulDatabaseTagDataSchema = {
  $id: 'https://card.time.com/schema/useful/database/tag-data',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'database tag-data schema',
  description: 'YGO Card Time database tag-data schema',
  type: 'object',
  unevaluatedProperties: false,
  required: ['_id', 'tag'],
  properties: {
    _id: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/_id',
    },
    tag: { title: '標籤', description: '標籤名稱', type: 'string' },
  },
} as const;
