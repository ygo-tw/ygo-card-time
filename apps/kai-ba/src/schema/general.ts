export const generalSchemaResponse = {
  400: {
    $ref: 'https://card.time.com/schema/useful/api/response/http4xx-error',
    description: 'Schema validation fail.',
  },
  401: {
    $ref: 'https://card.time.com/schema/useful/api/response/http4xx-error',
    description: '未授權操作、未登入或是缺乏 API Token',
  },
  403: {
    $ref: 'https://card.time.com/schema/useful/api/response/http4xx-error',
    description: 'RBAC 未授權操作',
  },
  404: {
    $ref: 'https://card.time.com/schema/useful/api/response/http4xx-error',
    description: '指定資料不存在',
  },
  409: {
    $ref: 'https://card.time.com/schema/useful/api/response/http4xx-error',
    description: '資料已過期／已被變更過／hash 不同',
  },
  429: {
    $ref: 'https://card.time.com/schema/useful/api/response/http4xx-error',
    description: '超過 Rate Limit 限制',
  },
  500: {
    $ref: 'https://card.time.com/schema/useful/api/response/http5xx-error',
    description: '異常回應',
  },
  501: {
    $ref: 'https://card.time.com/schema/useful/api/response/http5xx-error',
    description: '此功能尚未實作',
  },
  304: { type: 'object', description: '要修改的資料未造成任何變更' },
};
