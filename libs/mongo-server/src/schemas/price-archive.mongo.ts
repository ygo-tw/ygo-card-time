import { Schema } from 'mongoose';
import { DataAccessEnum } from '@ygo/schemas';
export const PriceArchiveSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      match: /^[A-Z0-9]{2,4}[- ][A-Za-z0-9]{1,15}$/,
    },
    number: { type: String, match: /^[0-9]{8}[A-Z]?$/ },
    price_type: {
      type: String,
      required: true,
      enum: ['price_info', 'price_yuyu'],
    },
    price_data: [
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
    createdAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  {
    collection: DataAccessEnum.PRICE_ARCHIVE,
    id: false,
    minimize: false,
    timestamps: false,
  }
);
