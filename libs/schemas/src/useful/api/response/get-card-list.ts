import { FromSchema } from 'json-schema-to-ts';
import { usefulValueObjectMetaSchema } from '../../value-object/meta.const';
import { usefulValueObjectCardMetaSchema } from '../../value-object/card-meta.const';
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
    ];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type GetCardListResponseType = RemoveIndex<Type>;
