import { Schema } from 'mongoose';
import { ProductInformationDataType, DataAccessEnum } from '@ygo/schemas';
import { SchemaDefinitionProperty } from 'mongoose';

export type ProductInformationDataByDateType = Omit<
  ProductInformationDataType,
  'publish_date'
> & {
  publish_date: Date;
};

export const ProductInformationMongoSchema =
  new Schema<ProductInformationDataByDateType>(
    {
      type: {
        type: Number,
        required: true,
        enum: [0, 1, 2, 3, 4], // 0=補充包, 1=Rush Duel, 2=其他, 3=預組套牌, 4=禮盒
      },
      product_information_type_id: {
        type: String,
      },
      title: {
        type: String,
        required: true,
      },
      publish_date: {
        type: Date,
        required: true,
        get: (v: Date): string => v.toISOString(),
        set: (v: string): Date => {
          const date = new Date(v);
          if (isNaN(date.getTime())) {
            throw new Error('Invalid date format');
          }
          return date;
        },
      } as SchemaDefinitionProperty<Date>,
      photo: {
        required: true,
        type: String,
      },
      content: {
        type: String,
        required: true,
      },
      status: {
        type: Number,
        required: true,
        enum: [0, 1],
      },
      to_top: {
        type: Boolean,
        required: true,
      },
      admin_id: {
        type: String,
      },
      tag: {
        type: [String],
      },
    },
    {
      collection: DataAccessEnum.PRODUCT_INFORMATION,
      toJSON: { getters: true },
      toObject: { getters: true },
    }
  );
