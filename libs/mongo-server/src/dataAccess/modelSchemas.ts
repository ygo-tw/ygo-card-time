import { ModelSchema } from '@ygo/schemas';
import {
  AdminMongoSchema,
  BannerMongoSchema,
  CalendarMongoSchema,
  CardsMongoSchema,
  ForbiddenCardListMongoSchema,
  JurisprudenceMongoSchema,
  MetaDeckMongoSchema,
  PermissionMongoSchema,
  ProductInformationMongoSchema,
  ProductInformationTypeMongoSchema,
  PriceArchiveSchema,
} from '../schemas';

export const modelSchemas: ModelSchema = {
  admin: {
    originSchema: AdminMongoSchema,
  },
  banner: {
    originSchema: BannerMongoSchema,
  },
  calendar: {
    originSchema: CalendarMongoSchema,
  },
  cards: {
    originSchema: CardsMongoSchema,
  },
  forbidden_card_list: {
    originSchema: ForbiddenCardListMongoSchema,
  },
  jurisprudence: {
    originSchema: JurisprudenceMongoSchema,
  },
  meta_deck: {
    originSchema: MetaDeckMongoSchema,
  },
  permission: {
    originSchema: PermissionMongoSchema,
  },
  product_information: {
    originSchema: ProductInformationMongoSchema,
  },
  product_information_type: {
    originSchema: ProductInformationTypeMongoSchema,
  },
  price_archive: {
    originSchema: PriceArchiveSchema,
  },
};
