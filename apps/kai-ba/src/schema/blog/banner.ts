import { generalSchemaResponse } from '../general';

export const getBannerListSchema = {
  $id: 'getBannerList-blog',
  operationId: 'getBannerList-blog',
  title: 'Get banner list(blog)',
  description: '取得Banner列表 / Get banner list(blog)',
  tags: ['banner'],
  summary: '取得Banner列表',
  additionalProperties: true,
  method: 'GET',
  querystring: {},
  response: {
    ...generalSchemaResponse,
    200: {
      $ref: 'https://card.time.com/schema/useful/api/response/get-banner-list',
    },
  },
};
