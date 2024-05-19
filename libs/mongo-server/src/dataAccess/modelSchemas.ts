import { ModelSchema } from '@ygo/schemas';
import { CardsMongoSchema, JurisprudenceMongoSchema } from '../schemas';

export const modelSchemas: ModelSchema = {
  cards: {
    originSchema: CardsMongoSchema,
  },
  jurisprudence: {
    originSchema: JurisprudenceMongoSchema,
  },
};
