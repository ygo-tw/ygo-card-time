import { Schema } from 'mongoose';
import { CardsDataType, YGO_OPTIONS, DataAccessEnum } from '@ygo/schemas';
export const CardsMongoSchema = new Schema<CardsDataType>(
  {
    number: { type: String, match: /^[0-9]{8}[A-Z]?$/ },
    name: { type: String, required: true, maxLength: 50 },
    atk: { type: Number, min: 0, max: 20000, default: null },
    def: { type: Number, min: 0, max: 20000, default: null },
    price_info: [
      {
        time: {
          type: String,
          match: /^\d{4}-\d{2}-\d{2}(T| )\d{2}:\d{2}:\d{2}(.\d{1,3}Z?)?$/,
        },
        price_lowest: { type: Number, required: false },
        price_avg: { type: Number, required: false },
        price: { type: Number, required: false },
        rarity: { type: String },
        _id: false,
      },
    ],
    price_yuyu: [
      {
        time: {
          type: String,
          match: /^\d{4}-\d{2}-\d{2}(T| )\d{2}:\d{2}:\d{2}(.\d{1,3}Z?)?$/,
        },
        price_lowest: { type: Number, required: false },
        price_avg: { type: Number, required: false },
        price: { type: Number, required: false },
        rarity: { type: String },
        _id: false,
      },
    ],
    id: {
      type: String,
      required: true,
      match: /^[A-Z0-9]{2,4}[- ][A-Za-z0-9]{1,15}$/,
    },
    type: {
      type: String,
      required: true,
      enum: YGO_OPTIONS.type,
    },
    star: {
      type: String,
      enum: YGO_OPTIONS.star,
    },
    attribute: {
      type: String,
      enum: YGO_OPTIONS.attribute,
    },
    rarity: [
      {
        type: String,
        enum: YGO_OPTIONS.rare,
        unique: true,
        maxItems: 10,
      },
    ],
    race: {
      type: String,
      enum: [...YGO_OPTIONS.race, ''],
    },
    product_information_type: {
      type: String,
      required: true,
      match: /^[A-Z0-9]{2,4}$/,
    },
    effect: { type: String, maxLength: 800 },
  },
  {
    collection: DataAccessEnum.CARDS,
    id: false,
    minimize: false,
    versionKey: false,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);
