/* eslint-disable */

//! auto generated from json schema
export const usefulDatabasePermisionDataSchema = {
  $id: 'https://card.time.com/schema/useful/database/permision-data',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'database permision-data schema',
  description: 'YGO Card Time database permision-data schema',
  type: 'object',
  unevaluatedProperties: false,
  required: ['_id', 'name', 'permission', 'type'],
  properties: {
    _id: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/_id',
    },
    name: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/name',
    },
    permission: {
      title: '權限',
      description: '權限資訊',
      type: 'array',
      items: { type: 'string', title: '可使用路徑', pattern: '^[a-z_]+$' },
    },
    type: {
      title: '類型',
      description: '權限類型',
      type: 'number',
      minimum: 0,
      maximum: 5,
    },
  },
} as const;
