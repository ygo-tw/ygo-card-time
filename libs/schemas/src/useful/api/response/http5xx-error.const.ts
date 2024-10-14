/* eslint-disable */

//! auto generated from json schema
export const usefulApiResponseHttp5XxErrorSchema = {
  $id: 'https://card.time.com/schema/useful/api/response/http5xx-error',
  type: 'object',
  description: '系統異常的回應',
  additionalProperties: false,
  properties: {
    errorCodes: { type: 'number', description: 'Error Code' },
    message: { type: 'string', description: 'Error Message' },
    data: {
      description: 'Error Custom Response Data',
      type: ['object', 'array', 'string', 'number', 'boolean'],
    },
  },
  required: ['errorCodes', 'message'],
} as const;
