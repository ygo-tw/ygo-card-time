import { ModelSchema } from '@ygo/schemas';
import {
  AdminMongoSchema,
  CardsMongoSchema,
  JurisprudenceMongoSchema,
} from '../schemas';

export const modelSchemas: ModelSchema = {
  admin: {
    originSchema: AdminMongoSchema,
  },
  cards: {
    originSchema: CardsMongoSchema,
  },
  jurisprudence: {
    originSchema: JurisprudenceMongoSchema,
  },
};
