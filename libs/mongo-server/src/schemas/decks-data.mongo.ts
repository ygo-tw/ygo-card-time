import { Schema } from 'mongoose';
import { DecksDataType, DataAccessEnum } from '@ygo/schemas';
import { SchemaDefinitionProperty } from 'mongoose';

export type DecksDataByDateType = Omit<
  DecksDataType,
  'create_date' | 'last_edit_date'
> & {
  create_date: Date;
  last_edit_date: Date;
};

export const DecksMongoSchema = new Schema<DecksDataByDateType>(
  {
    admin_id: {
      type: String,
      required: true,
      maxlength: 50,
    },
    title: {
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
    last_edit_date: {
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
    main_deck: [
      {
        _id: { type: String, required: true },
        card_id: { type: String, required: true },
        card_rarity: { type: String, required: true },
      },
    ],
    extra_deck: [
      {
        _id: { type: String, required: true },
        card_id: { type: String, required: true },
        card_rarity: { type: String, required: true },
      },
    ],
    side_deck: [
      {
        _id: { type: String, required: true },
        card_id: { type: String, required: true },
        card_rarity: { type: String, required: true },
      },
    ],
  },
  {
    collection: DataAccessEnum.DECKS,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);
