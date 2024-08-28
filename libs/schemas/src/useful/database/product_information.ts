import { FromSchema } from 'json-schema-to-ts';
import { Document } from 'mongoose';
import { usefulValueObjectMetaSchema } from '../value-object/meta.const';
import { usefulDatabaseProductInformationDataSchema } from './product_information.const';
import { RemoveIndex } from '../../utility.types';

type Type = FromSchema<
  typeof usefulDatabaseProductInformationDataSchema,
  {
    references: [typeof usefulValueObjectMetaSchema];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type ProductInformationDataType = RemoveIndex<Type> & Document;
