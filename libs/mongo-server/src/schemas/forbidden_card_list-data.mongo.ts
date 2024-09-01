import { Schema } from 'mongoose';
import { ForbiddenCardListDataType, DataAccessEnum } from '@ygo/schemas';

export const ForbiddenCardListMongoSchema =
  new Schema<ForbiddenCardListDataType>(
    {
      number: { type: String, required: true, match: /^[0-9]{8}[A-Z]?$/ },
      type: {
        type: Number,
        required: true,
        enum: [0, 1, 2], // 0=禁卡, 1=限一 2=限二
      },
    },
    {
      collection: DataAccessEnum.CALENDAR,
      toJSON: { getters: true },
      toObject: { getters: true },
    }
  );
