import { exampleGetCardList } from '@ygo/schemas';
import { generalSchemaResponse } from '../general';

export const getCardListSchema = {
  $id: 'getCardList',
  operationId: 'getCardList',
  title: 'Get card list',
  description: '取得卡片列表 / Get card list',
  tags: ['card'],
  summary: '取得卡片列表',
  additionalProperties: true,
  method: 'POST',
  querystring: {
    $ref: 'https://card.time.com/schema/useful/api/request/page-info',
  },
  body: {
    $ref: 'https://card.time.com/schema/useful/api/request/get-card-list',
    examples: [exampleGetCardList],
  },
  response: {
    ...generalSchemaResponse,
    200: {
      $ref: 'https://card.time.com/schema/useful/api/response/get-card-list',
    },
  },
};
