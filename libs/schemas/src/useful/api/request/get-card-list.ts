import { FromSchema } from 'json-schema-to-ts';
import {
  usefulValueObjectMetaSchema,
  usefulValueObjectCardMetaSchema,
  usefulValueObjectEnumMetaSchema,
} from '../../value-object';
import { usefulApiRequestGetCardListSchema } from './get-card-list.const';
import { RemoveIndex } from '../../../utility.types';
type Type = FromSchema<
  typeof usefulApiRequestGetCardListSchema,
  {
    references: [
      typeof usefulValueObjectMetaSchema,
      typeof usefulValueObjectCardMetaSchema,
      typeof usefulValueObjectEnumMetaSchema,
    ];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type GetCardListRequestType = RemoveIndex<Type>;
