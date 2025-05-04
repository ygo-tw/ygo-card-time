import { usefulValueObjectEnumMetaSchema } from './enum-meta.const';

export const YGO_OPTIONS: {
  type: string[];
  star: string[];
  attribute: string[];
  race: string[];
  rare: string[];
} = {
  type: [...usefulValueObjectEnumMetaSchema.$defs.cardTypeProperty.enum],
  star: [...usefulValueObjectEnumMetaSchema.$defs.starProperty.enum],
  attribute: [...usefulValueObjectEnumMetaSchema.$defs.attributeProperty.enum],
  race: [...usefulValueObjectEnumMetaSchema.$defs.raceProperty.enum],
  rare: [...usefulValueObjectEnumMetaSchema.$defs.rarityProperty.enum],
};
