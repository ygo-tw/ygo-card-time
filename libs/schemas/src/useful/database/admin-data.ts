import { FromSchema } from 'json-schema-to-ts';
import { usefulValueObjectMetaSchema } from '../value-object/meta.const';
import { usefulDatabaseAdminDataSchema } from './admin-data.const';
import { RemoveIndex } from '../../utility.types';

type Type = FromSchema<
  typeof usefulDatabaseAdminDataSchema,
  {
    references: [typeof usefulValueObjectMetaSchema];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type AdminDataType = RemoveIndex<Type>;
