import { FromSchema } from 'json-schema-to-ts';
import { Document } from 'mongoose';
import { usefulValueObjectMetaSchema } from '../value-object/meta.const';
import { usefulDatabaseBannerDataSchema } from './banner-data.const';
import { RemoveIndex } from '../../utility.types';

type Type = FromSchema<
  typeof usefulDatabaseBannerDataSchema,
  {
    references: [typeof usefulValueObjectMetaSchema];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type BannerDataType = RemoveIndex<Type> & Document;
