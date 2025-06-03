import { Schema } from 'mongoose';
import { TagDataType, DataAccessEnum } from '@ygo/schemas';

export const TagMongoSchema = new Schema<TagDataType>(
  {
    tag: { type: String, required: true, maxLength: 50 },
  },
  {
    collection: DataAccessEnum.TAG,
    versionKey: false,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);
