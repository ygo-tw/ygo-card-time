import { ModelSchema, CardsMongoSchema } from '@ygo/schemas';

export const modelSchemas: ModelSchema = {
  cards: {
    originSchema: CardsMongoSchema,
  },
};
