import { BannerDataType, DataAccessEnum } from '@ygo/schemas';
import { Schema } from 'mongoose';
import { SchemaDefinitionProperty } from 'mongoose';

export type BannerDataByDateType = Omit<BannerDataType, 'date'> & {
  date: Date;
};

export const BannerMongoSchema = new Schema<BannerDataByDateType>(
  {
    title: {
      type: String,
      maxlength: 100,
    },
    date: {
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
    photo_pc: {
      required: true,
      type: String,
    },
    photo_mobile: {
      required: true,
      type: String,
    },
    url: {
      type: String,
      maxlength: 200,
    },
  },
  {
    collection: DataAccessEnum.BANNER,
    versionKey: false,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);
