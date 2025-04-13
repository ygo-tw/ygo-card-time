import { FromSchema } from 'json-schema-to-ts';
import { usefulValueObjectMetaSchema } from '../value-object/meta.const';
import { usefulDatabaseDecksDataSchema } from './decks-data.const';
import { RemoveIndex } from '../../utility.types';

type Type = FromSchema<
  typeof usefulDatabaseDecksDataSchema,
  {
    references: [typeof usefulValueObjectMetaSchema];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type DecksDataType = RemoveIndex<Type>;
