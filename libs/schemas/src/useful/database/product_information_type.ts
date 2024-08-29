import { FromSchema } from 'json-schema-to-ts';
import { Document } from 'mongoose';
import { usefulValueObjectMetaSchema } from '../value-object/meta.const';
import { usefulDatabaseProductSchema } from './product_information_type.const';
import { RemoveIndex } from '../../utility.types';

type Type = FromSchema<
  typeof usefulDatabaseProductSchema,
  {
    references: [typeof usefulValueObjectMetaSchema];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type ProductInformationTypeType = RemoveIndex<Type> & Document;
