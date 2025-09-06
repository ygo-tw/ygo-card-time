/* eslint-disable */

//! auto generated from json schema
export const usefulApiResponseGetBannerListSchema = {
  $id: 'https://card.time.com/schema/useful/api/response/get-banner-list',
  type: 'object',
  title: '取得Banner列表',
  description: 'YGO Card Time get banner list response schema',
  unevaluatedProperties: true,
  properties: {
    list: {
      type: 'array',
      items: {
        $ref: 'https://card.time.com/schema/useful/database/banner-data',
      },
    },
  },
  required: ['list'],
} as const;
