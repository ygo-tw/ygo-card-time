/* eslint-disable */

//! auto generated from json schema
export const usefulDatabaseDecksDataSchema = {
  $id: 'https://card.time.com/schema/useful/database/decks-data',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'database decks-data schema',
  description: 'YGO Card Time database decks-data schema',
  type: 'object',
  unevaluatedProperties: false,
  required: [
    '_id',
    'admin_id',
    'title',
    'create_date',
    'last_edit_date',
    'main_deck',
    'extra_deck',
    'side_deck',
  ],
  properties: {
    _id: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/_id',
    },
    admin_id: {
      title: '帳號',
      description: '使用者帳號',
      type: 'string',
      maxLength: 50,
    },
    title: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/title',
    },
    create_date: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/create_date',
    },
    last_edit_date: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/publish_date',
    },
    main_deck: {
      title: '主牌組',
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/deck',
    },
    extra_deck: {
      title: '額外牌組',
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/deck',
    },
    side_deck: {
      title: '備牌組',
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/deck',
    },
  },
} as const;
