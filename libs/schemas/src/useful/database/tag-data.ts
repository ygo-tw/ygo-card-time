import { FromSchema } from 'json-schema-to-ts';
import { usefulValueObjectMetaSchema } from '../value-object/meta.const';
import { usefulDatabaseTagDataSchema } from './tag-data.const';
import { RemoveIndex } from '../../utility.types';

type Type = FromSchema<
  typeof usefulDatabaseTagDataSchema,
  {
    references: [typeof usefulValueObjectMetaSchema];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type TagDataType = RemoveIndex<Type>;
