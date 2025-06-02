import { Schema } from 'mongoose';
import { DataAccessEnum } from '@ygo/schemas';

// 創建專門給 Mongoose 使用的介面
interface RefreshTokenMongoType {
  userId: string;
  token: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  deviceInfo?: string;
  lastUsed?: Date;
}

export const RefreshTokenMongoSchema = new Schema<RefreshTokenMongoType>(
  {
    userId: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 7 * 24 * 3600 },
    },
    isRevoked: {
      type: Boolean,
      required: true,
      default: false,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    deviceInfo: {
      type: String,
      required: false,
    },
    lastUsed: {
      type: Date,
      required: false,
    },
  },
  {
    collection: DataAccessEnum.REFRESH_TOKEN,
    versionKey: false,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// 只在非測試環境下建立索引
if (process.env.NODE_ENV !== 'test') {
  RefreshTokenMongoSchema.index({ token: 1, isRevoked: 1 });
  RefreshTokenMongoSchema.index({ userId: 1 });
}
