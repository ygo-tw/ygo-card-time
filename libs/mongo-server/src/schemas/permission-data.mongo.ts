import { Schema } from 'mongoose';
import { PermissionDataType, DataAccessEnum } from '@ygo/schemas';

export const PermissionMongoSchema = new Schema<PermissionDataType>(
  {
    name: {
      type: String,
      required: true,
      maxLength: 50,
    },
    permission: {
      type: [String],
      required: true,
      validate: [
        {
          validator: function (v: string[]) {
            return Array.isArray(v);
          },
          message: 'Permission must be an array.',
        },
        {
          validator: (v: string[]) => v.every(path => /^[a-z_]+$/.test(path)),
          message:
            'Permission paths must only contain lowercase letters and underscores.',
        },
      ],
    },
    type: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
  },
  { collection: DataAccessEnum.PERMISSION }
);
