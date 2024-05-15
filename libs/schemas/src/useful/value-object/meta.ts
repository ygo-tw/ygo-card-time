import { FromSchema } from 'json-schema-to-ts';
import { usefulValueObjectMetaSchema } from './meta.const';

export type MetaIdType = FromSchema<
  typeof usefulValueObjectMetaSchema.$defs._id,
  {
    keepDefaultedPropertiesOptional: true;
  }
>;

export type MetaNameType = FromSchema<
  typeof usefulValueObjectMetaSchema.$defs.name,
  {
    keepDefaultedPropertiesOptional: true;
  }
>;

export type MetaAtkDefType = FromSchema<
  typeof usefulValueObjectMetaSchema.$defs.atkDef,
  {
    keepDefaultedPropertiesOptional: true;
  }
>;

export type MetaPriceObjectType = FromSchema<
  typeof usefulValueObjectMetaSchema.$defs.price_object,
  {
    keepDefaultedPropertiesOptional: true;
  }
>;
