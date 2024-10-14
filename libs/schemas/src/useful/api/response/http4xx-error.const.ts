/* eslint-disable */

//! auto generated from json schema
export const usefulApiResponseHttp4XxErrorSchema = {
  $id: 'https://card.time.com/schema/useful/api/response/http4xx-error',
  type: 'object',
  description:
    '輸入參數異常、JSON Schema validation fail 或是權限不足的異常回應',
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
