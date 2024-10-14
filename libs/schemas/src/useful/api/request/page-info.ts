import { FromSchema } from 'json-schema-to-ts';
import { usefulApiRequestPageInfoSchema } from './page-info.const';
import { RemoveIndex } from '../../../utility.types';

type Type = FromSchema<
  typeof usefulApiRequestPageInfoSchema,
  {
    references: [];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type PageInfoRequestType = RemoveIndex<Type>;
