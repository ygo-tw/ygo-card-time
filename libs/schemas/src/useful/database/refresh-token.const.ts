/* eslint-disable */

//! auto generated from json schema
export const usefulDatabaseRefreshTokenSchema = {
  $id: 'https://card.time.com/schema/useful/database/refresh-token',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'database refresh-token schema',
  description: 'YGO Card Time database refresh-token schema',
  type: 'object',
  additionalProperties: false,
  properties: {
    _id: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/_id',
    },
    userId: { type: 'string', description: '使用者ID，對應到 Admin 的 _id' },
    token: { type: 'string', description: 'Refresh Token 字串，由亂數產生' },
    expiresAt: {
      type: 'string',
      format: 'date-time',
      description: 'Token 過期時間',
    },
    isRevoked: { type: 'boolean', description: '是否已撤銷', default: false },
    createdAt: { type: 'string', format: 'date-time', description: '建立時間' },
    deviceInfo: { type: 'string', description: '設備資訊，用於識別不同設備' },
    lastUsed: {
      type: 'string',
      format: 'date-time',
      description: '最後使用時間',
    },
  },
  required: ['userId', 'token', 'expiresAt', 'isRevoked', 'createdAt'],
} as const;
