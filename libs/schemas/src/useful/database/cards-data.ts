import { FromSchema } from 'json-schema-to-ts';
import {
  usefulValueObjectMetaSchema,
  usefulValueObjectCardMetaSchema,
  usefulValueObjectEnumMetaSchema,
} from '../value-object';
import { usefulDatabaseCardsDataSchema } from './cards-data.const';
import { RemoveIndex } from '../../utility.types';

type Type = FromSchema<
  typeof usefulDatabaseCardsDataSchema,
  {
    references: [
      typeof usefulValueObjectMetaSchema,
      typeof usefulValueObjectCardMetaSchema,
      typeof usefulValueObjectEnumMetaSchema,
    ];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type CardsDataType = RemoveIndex<Type>;
