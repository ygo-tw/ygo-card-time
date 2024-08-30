import { Schema } from 'mongoose';
import { AdminDataType, DataAccessEnum } from '@ygo/schemas';
import { SchemaDefinitionProperty } from 'mongoose';

export type AdminnDataByDateType = Omit<AdminDataType, 'create_date'> & {
  create_date: Date;
};

export const AdminMongoSchema = new Schema<AdminnDataByDateType>(
  {
    type: {
      type: Number,
      required: true,
      min: 0,
      max: 2,
    },
    name: {
      type: String,
      required: true,
      maxlength: 50,
    },
    create_date: {
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
    },
    status: {
      type: Number,
      required: true,
      min: 0,
      max: 2,
    },
    account: {
      type: String,
      required: true,
      maxlength: 50,
    },
    password: {
      type: String,
      required: true,
      match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,16}$/,
    },
    email: {
      type: String,
      required: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
  },
  {
    collection: DataAccessEnum.ADMIN,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);
