import { FromSchema } from 'json-schema-to-ts';

import { RemoveIndex } from '../../../utility.types';
import { usefulApiResponseHttp5XxErrorSchema } from './http5xx-error.const';

type Type = FromSchema<
  typeof usefulApiResponseHttp5XxErrorSchema,
  {
    references: [];
    keepDefaultedPropertiesOptional: true;
  }
>;
export type UsefulApiResponseHttp5XxErrorType = RemoveIndex<Type>;
