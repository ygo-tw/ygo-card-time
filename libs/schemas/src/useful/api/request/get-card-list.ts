import { FromSchema } from 'json-schema-to-ts';
import { usefulValueObjectMetaSchema } from '../../value-object/meta.const';
import { usefulValueObjectCardMetaSchema } from '../../value-object/card-meta.const';
import { usefulApiRequestGetCardListSchema } from './get-card-list.const';
import { RemoveIndex } from '../../../utility.types';

type Type = FromSchema<
  typeof usefulApiRequestGetCardListSchema,
  {
    references: [
      typeof usefulValueObjectMetaSchema,
      typeof usefulValueObjectCardMetaSchema,
    ];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type GetCardListRequestType = RemoveIndex<Type>;
