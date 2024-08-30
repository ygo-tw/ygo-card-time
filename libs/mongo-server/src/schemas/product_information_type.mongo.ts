import { Schema } from 'mongoose';
import { ProductInformationTypeType, DataAccessEnum } from '@ygo/schemas';

export const ProductInformationTypeMongoSchema =
  new Schema<ProductInformationTypeType>(
    {
      name: {
        type: String,
        required: true,
        maxlength: 30,
        trim: true,
      },
      packType: {
        type: String,
        required: true,
        maxlength: 4,
      },
      mainType: {
        type: Number,
        required: true,
        min: 0,
        max: 4,
      },
      subType: {
        type: String,
        required: true,
        enum: ['Rush Duel', '補充包', '預組套牌', '禮盒', '其他'],
      },
      status: {
        type: Number,
        required: true,
      },
    },
    {
      collection: DataAccessEnum.PRODUCT_INFORMATION,
    }
  );
