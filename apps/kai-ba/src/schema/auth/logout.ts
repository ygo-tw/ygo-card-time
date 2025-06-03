import { generalSchemaResponse } from '../general';

export const logoutSchema = {
  $id: 'logout',
  operationId: 'logout',
  title: 'User Logout',
  description: '用戶登出',
  tags: ['auth'],
  summary: '用戶登出',
  method: 'POST',
  response: {
    ...generalSchemaResponse,
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
      },
    },
  },
};
