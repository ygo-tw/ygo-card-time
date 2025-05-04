import { FromSchema } from 'json-schema-to-ts';
import {
  usefulValueObjectMetaSchema,
  usefulValueObjectCardMetaSchema,
  usefulValueObjectEnumMetaSchema,
} from '../../value-object';
import { usefulDatabaseCardsDataSchema } from '../../database/cards-data.const';
import { usefulApiResponseGetCardListSchema } from './get-card-list.const';
import { RemoveIndex } from '../../../utility.types';

type Type = FromSchema<
  typeof usefulApiResponseGetCardListSchema,
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

export type GetCardListResponseType = RemoveIndex<Type>;
