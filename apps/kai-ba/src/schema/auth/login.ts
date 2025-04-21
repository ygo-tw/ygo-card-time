import { generalSchemaResponse } from '../general';

export const loginSchema = {
  $id: 'login',
  operationId: 'login',
  title: 'User Login',
  description: '用戶登入',
  tags: ['auth'],
  summary: '用戶登入',
  method: 'POST',
  body: {
    type: 'object',
    required: ['account', 'password'],
    properties: {
      account: {
        type: 'string',
        description: '用戶帳號',
      },
      password: {
        type: 'string',
        minLength: 6,
        description: '用戶密碼',
      },
    },
  },
  response: {
    ...generalSchemaResponse,
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            account: { type: 'string' },
            role: {
              type: 'array',
              items: { type: 'string' },
            },
            provider: { type: 'string' },
          },
        },
      },
    },
    401: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  },
};
