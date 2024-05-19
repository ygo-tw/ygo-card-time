import { FromSchema } from 'json-schema-to-ts';
import { Document } from 'mongoose';
import { usefulValueObjectMetaSchema } from '../value-object/meta.const';
import { usefulDatabaseJurisprudenceDataSchema } from './jurisprudence-data.const';
import { RemoveIndex } from '../../utility.types';

type Type = FromSchema<
  typeof usefulDatabaseJurisprudenceDataSchema,
  {
    references: [typeof usefulValueObjectMetaSchema];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type JurisprudenceDataType = RemoveIndex<Type> & Document;
