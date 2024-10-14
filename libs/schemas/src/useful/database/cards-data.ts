import { FromSchema } from 'json-schema-to-ts';
import { Document } from 'mongoose';
import { usefulValueObjectMetaSchema } from '../value-object/meta.const';
import { usefulValueObjectCardMetaSchema } from '../value-object/card-meta.const';
import { usefulDatabaseCardsDataSchema } from './cards-data.const';
import { RemoveIndex } from '../../utility.types';

type Type = FromSchema<
  typeof usefulDatabaseCardsDataSchema,
  {
    references: [
      typeof usefulValueObjectMetaSchema,
      typeof usefulValueObjectCardMetaSchema,
    ];
    keepDefaultedPropertiesOptional: true;
  }
>;

export type CardsDataType = RemoveIndex<Type> & Document;
