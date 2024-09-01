import { Schema } from 'mongoose';
import { MetaDeckDataType, DataAccessEnum } from '@ygo/schemas';
import { SchemaDefinitionProperty } from 'mongoose';

export type MetaDeckDataByDateType = Omit<MetaDeckDataType, 'publish_date'> & {
  publish_date: Date;
};

export const MetaDeckMongoSchema = new Schema<MetaDeckDataByDateType>(
  {
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
      type: String,
      required: true,
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
      required: true,
    },
    tag: {
      type: [String],
      required: true,
    },
  },
  {
    collection: DataAccessEnum.META_DECK,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);
