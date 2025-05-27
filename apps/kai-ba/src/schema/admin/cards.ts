import { generalSchemaResponse } from '../general';

export const getCardListSchema = {
  $id: 'getCardList-admin',
  operationId: 'getCardList-admin',
  title: 'Get card list(admin)',
  description: '取得卡片列表 / Get card list(admin)',
  tags: ['card'],
  summary: '取得卡片列表',
  additionalProperties: true,
  method: 'GET',
  querystring: {
    type: 'object',
    additionalProperties: true,
    allOf: [
      {
        $ref: 'https://card.time.com/schema/useful/api/request/page-info',
      },
      {
        $ref: 'https://card.time.com/schema/useful/api/request/get-card-list',
      },
    ],
  },

  response: {
    ...generalSchemaResponse,
    200: {
      $ref: 'https://card.time.com/schema/useful/api/response/get-card-list',
    },
  },
};
