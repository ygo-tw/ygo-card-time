import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import { TagDataType } from '@ygo/schemas';
import { TagMongoSchema } from './tag-data.mongo';

config({ path: resolve(__dirname, '../../../../config/.env.common') });
config({ path: resolve(__dirname, '../../../../config/.env.service') });

const TagModel = mongoose.model<TagDataType>('Tag', TagMongoSchema);

describe('TagMongoSchema', () => {
  jest.setTimeout(20000);
  beforeAll(async () => {
    await mongoose.connect(
      `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a valid tag data document', async () => {
    const validData = {
      tag: '主流',
    };

    const model = new TagModel(validData);
    const error = model.validateSync();
    expect(error).toBeUndefined();
  });

  it('should be invalid if required fields are missing', () => {
    const invalidData = {
      // 缺少 tag
    };

    const doc = new TagModel(invalidData);
    const validationError = doc.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors).toHaveProperty('tag');
  });

  it('should fail to create admin data with a name longer than 50 characters', async () => {
    const invalidAdminData = {
      tag: 'a'.repeat(51), // 超過最大長度
    };

    const model = new TagModel(invalidAdminData);
    const error = model.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors).toHaveProperty('tag'); // 確保錯誤來自於 tag 字段
    expect(error?.errors['tag'].message).toBe('Tag is too long');
  });
});
