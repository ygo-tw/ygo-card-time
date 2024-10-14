import { FromSchema } from 'json-schema-to-ts';
import { usefulValueObjectCardMetaSchema } from './card-meta.const';

export type CardMetaIdType = FromSchema<
  typeof usefulValueObjectCardMetaSchema.$defs.id,
  {
    keepDefaultedPropertiesOptional: true;
  }
>;

export type CardMetaAttributeType = FromSchema<
  typeof usefulValueObjectCardMetaSchema.$defs.attribute,
  {
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
    keepDefaultedPropertiesOptional: true;
  }
>;

export type CardMetaRarityType = FromSchema<
  typeof usefulValueObjectCardMetaSchema.$defs.rarity,
  {
    keepDefaultedPropertiesOptional: true;
  }
>;

export type CardMetaStarType = FromSchema<
  typeof usefulValueObjectCardMetaSchema.$defs.star,
  {
    keepDefaultedPropertiesOptional: true;
  }
>;

export type CardMetaTypeType = FromSchema<
  typeof usefulValueObjectCardMetaSchema.$defs.type,
  {
    keepDefaultedPropertiesOptional: true;
  }
>;
