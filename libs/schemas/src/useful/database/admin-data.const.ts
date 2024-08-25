/* eslint-disable */

//! auto generated from json schema
export const usefulDatabaseAdminDataSchema = {
  $id: 'https://card.time.com/schema/useful/database/admin-data',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'database admin-data schema',
  description: 'YGO Card Time database admin-data schema',
  type: 'object',
  unevaluatedProperties: false,
  required: [
    '_id',
    'type',
    'name',
    'create_date',
    'photo',
    'status',
    'account',
    'password',
    'email',
  ],
  properties: {
    _id: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/_id',
    },
    type: {
      title: '類型',
      description: '帳號類型',
      type: 'number',
      minimum: 0,
      maximum: 2,
    },
    name: {
      title: '資料名稱',
      description: '此筆資料的命名',
      type: 'string',
      maxLength: 50,
    },
    create_date: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/create_date',
    },
  },
} as const;
