import { FromSchema } from 'json-schema-to-ts';
import { RemoveIndex } from '../../../utility.types';
import { usefulApiResponseHttp4XxErrorSchema } from './http4xx-error.const';

type Type = FromSchema<
  typeof usefulApiResponseHttp4XxErrorSchema,
  {
    references: [];
    keepDefaultedPropertiesOptional: true;
  }
>;
export type UsefulApiResponseHttp4XxErrorType = RemoveIndex<Type>;
