import { FromSchema } from 'json-schema-to-ts';

import { usefulValueObjectMetaSchema } from '../value-object/meta.const';
import { usefulDatabaseCardsDataSchema } from './cards-data.const';
import { RemoveIndex } from '../../utility.types';

type Type = FromSchema<
  typeof usefulDatabaseCardsDataSchema,
  {
    references: [typeof usefulValueObjectMetaSchema];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type CardsDataType = RemoveIndex<Type>;
