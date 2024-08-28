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
      title: '帳號類型',
      description: '0=管理者, 1=前後台用戶, 2=前台用戶',
      type: 'number',
      minimum: 0,
      maximum: 2,
    },
    name: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/name',
    },
    create_date: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/create_date',
    },
    photo: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/photo',
    },
    status: {
      title: '帳號目前的狀態',
      description: '0=正常, 1=停用中, 2=驗證中',
      type: 'number',
      minimum: 0,
      maximum: 2,
    },
    account: {
      title: '帳號',
      description: '使用者帳號',
      type: 'string',
      maxLength: 50,
    },
    password: {
      title: '密碼',
      description: '使用者密碼',
      type: 'string',
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,16}$',
    },
    email: {
      title: '郵箱',
      description: '使用者郵箱',
      type: 'string',
      format: 'email',
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    },
  },
} as const;
