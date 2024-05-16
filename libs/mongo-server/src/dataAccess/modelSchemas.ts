import { ModelSchema } from '@ygo/schemas';
import { CardsMongoSchema } from '../schemas';

export const modelSchemas: ModelSchema = {
  cards: {
    originSchema: CardsMongoSchema,
  },
};
