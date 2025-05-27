import { FromSchema } from 'json-schema-to-ts';
import {
  usefulValueObjectMetaSchema,
  usefulValueObjectCardMetaSchema,
  usefulValueObjectEnumMetaSchema,
} from '../../value-object';
import { usefulDatabaseCardsDataSchema } from '../../database/cards-data.const';
import { usefulApiRequestCreateCardSchema } from './create-card.const';
import { RemoveIndex } from '../../../utility.types';

type Type = FromSchema<
  typeof usefulApiRequestCreateCardSchema,
  {
    references: [
      typeof usefulValueObjectMetaSchema,
      typeof usefulDatabaseCardsDataSchema,
      typeof usefulValueObjectCardMetaSchema,
      typeof usefulValueObjectEnumMetaSchema,
    ];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type CreateCardRequestType = RemoveIndex<Type>;
