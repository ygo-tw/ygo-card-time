import { ModelSchema } from '@ygo/schemas';
import {
  AdminMongoSchema,
  CardsMongoSchema,
  JurisprudenceMongoSchema,
  PermissionMongoSchema,
  ProductInformationMongoSchema,
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
  permission: {
    originSchema: PermissionMongoSchema,
  },
  product_information: {
    originSchema: ProductInformationMongoSchema,
  },
};
