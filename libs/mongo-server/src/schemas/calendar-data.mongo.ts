import { CalendarDataType, DataAccessEnum } from '@ygo/schemas';
import { Schema } from 'mongoose';
import { SchemaDefinitionProperty } from 'mongoose';

export type CalendarDataByDateType = Omit<CalendarDataType, 'date'> & {
  date: Date;
};

export const CalendarMongoSchema = new Schema<CalendarDataByDateType>(
  {
    title: {
      type: String,
      required: true,
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
    url: {
      type: String,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxLength: 6000,
    },
    type: {
      type: Number,
      required: true,
      enum: [0, 1, 2], // 0=賽事, 1=發售日期, 2=其他相關活動
    },
  },
  {
    collection: DataAccessEnum.CALENDAR,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);
