import { FromSchema } from 'json-schema-to-ts';
import { usefulValueObjectMetaSchema } from '../value-object/meta.const';
import { usefulDatabaseRefreshTokenSchema } from './refresh-token.const';
import { RemoveIndex } from '../../utility.types';

type Type = FromSchema<
  typeof usefulDatabaseRefreshTokenSchema,
  {
    references: [typeof usefulValueObjectMetaSchema];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type RefreshTokenDataType = RemoveIndex<Type>;
