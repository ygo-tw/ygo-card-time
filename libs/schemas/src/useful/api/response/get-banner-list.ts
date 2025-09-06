import { FromSchema } from 'json-schema-to-ts';
import { usefulApiResponseGetBannerListSchema } from './get-banner-list.const';
import { usefulValueObjectMetaSchema } from '../../value-object';
import { usefulDatabaseBannerDataSchema } from '../../database/banner-data.const';
import { RemoveIndex } from '../../../utility.types';

type Type = FromSchema<
  typeof usefulApiResponseGetBannerListSchema,
  {
    references: [
      typeof usefulValueObjectMetaSchema,
      typeof usefulDatabaseBannerDataSchema,
    ];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type GetBannerListResponseType = RemoveIndex<Type>;
