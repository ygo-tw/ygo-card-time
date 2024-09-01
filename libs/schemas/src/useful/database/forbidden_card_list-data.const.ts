/* eslint-disable */

//! auto generated from json schema
export const usefulDatabaseForbiddenSchema = {
  $id: 'https://card.time.com/schema/useful/database/forbidden_card_list-data',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'database forbidden_card_list-data schema',
  description: 'YGO Card Time database forbidden_card_list-data schema',
  type: 'object',
  unevaluatedProperties: false,
  required: ['_id', 'number', 'type'],
  properties: {
    _id: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/_id',
    },
    number: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/number',
    },
    type: {
      title: '禁卡分類',
      description: '禁卡分類 0=禁卡, 1=限一, 2=限二',
      type: 'number',
      minimum: 0,
      maximum: 2,
    },
  },
} as const;
