import { FromSchema } from 'json-schema-to-ts';
import { usefulValueObjectCardMetaSchema } from './card-meta.const';
import { usefulValueObjectEnumMetaSchema } from './enum-meta.const';
export type CardMetaIdType = FromSchema<
  typeof usefulValueObjectCardMetaSchema.$defs.id,
  {
    keepDefaultedPropertiesOptional: true;
  }
>;

export type CardMetaAttributeType = FromSchema<
  typeof usefulValueObjectCardMetaSchema.$defs.attribute,
  {
    references: [typeof usefulValueObjectEnumMetaSchema];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type CardMetaEffectType = FromSchema<
  typeof usefulValueObjectCardMetaSchema.$defs.effect,
  {
    keepDefaultedPropertiesOptional: true;
  }
>;

export type CardMetaProductInformationType = FromSchema<
  typeof usefulValueObjectCardMetaSchema.$defs.product_information_type,
  {
    keepDefaultedPropertiesOptional: true;
  }
>;

export type CardMetaRaceType = FromSchema<
  typeof usefulValueObjectCardMetaSchema.$defs.race,
  {
    references: [typeof usefulValueObjectEnumMetaSchema];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type CardMetaRarityType = FromSchema<
  typeof usefulValueObjectCardMetaSchema.$defs.rarity,
  {
    references: [typeof usefulValueObjectEnumMetaSchema];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type CardMetaStarType = FromSchema<
  typeof usefulValueObjectCardMetaSchema.$defs.star,
  {
    references: [typeof usefulValueObjectEnumMetaSchema];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type CardMetaTypeType = FromSchema<
  typeof usefulValueObjectCardMetaSchema.$defs.type,
  {
    references: [typeof usefulValueObjectEnumMetaSchema];
    keepDefaultedPropertiesOptional: true;
  }
>;
