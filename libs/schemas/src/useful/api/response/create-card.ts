import { FromSchema } from 'json-schema-to-ts';
import { usefulApiResponseCreateCardSchema } from './create-card.const';
import { RemoveIndex } from '../../../utility.types';

type Type = FromSchema<
  typeof usefulApiResponseCreateCardSchema,
  {
    keepDefaultedPropertiesOptional: true;
  }
>;

export type CreateCardResponseType = RemoveIndex<Type>;
