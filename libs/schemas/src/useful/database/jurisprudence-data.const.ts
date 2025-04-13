/* eslint-disable */

//! auto generated from json schema
export const usefulDatabaseJurisprudenceDataSchema = {
  $id: 'https://card.time.com/schema/useful/database/jurisprudence-data',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'database jurisprudence-data schema',
  description: 'YGO Card Time database jurisprudence-data schema',
  type: 'object',
  unevaluatedProperties: false,
  properties: {
    _id: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/_id',
    },
    number: {
      $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/number',
    },
    name_jp_h: { type: 'string', description: 'Japanese name (honorific)' },
    name_jp_k: { type: 'string', description: 'Japanese name (katakana)' },
    name_en: { type: 'string', description: 'English name' },
    effect_jp: { type: 'string', description: 'Japanese card effect' },
    jud_link: {
      type: 'string',
      format: 'uri',
      description: 'Judicial link url',
    },
    info: { type: 'string', description: 'Additional information' },
    qa: {
      type: 'array',
      items: {
        $ref: 'https://card.time.com/schema/useful/value-object/meta#/$defs/qaItem',
      },
    },
  },
  required: ['_id', 'number', 'name_jp_h', 'effect_jp', 'jud_link', 'qa'],
} as const;
