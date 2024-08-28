import { ModelSchema } from '@ygo/schemas';
import {
  CardsMongoSchema,
  JurisprudenceMongoSchema,
  PermissionMongoSchema,
  ProductInformationMongoSchema,
} from '../schemas';

export const modelSchemas: ModelSchema = {
  cards: {
    originSchema: CardsMongoSchema,
  },
  jurisprudence: {
    originSchema: JurisprudenceMongoSchema,
  },
  permission: {
    originSchema: PermissionMongoSchema,
  },
  product_information: {
    originSchema: ProductInformationMongoSchema,
  },
};
