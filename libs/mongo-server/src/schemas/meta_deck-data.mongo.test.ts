import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import {
  MetaDeckMongoSchema,
  MetaDeckDataByDateType,
} from './meta_deck-data.mongo';

config({ path: resolve(__dirname, '../../../../config/.env.common') });
config({ path: resolve(__dirname, '../../../../config/.env.service') });

describe('MetaDeckMongoSchema', () => {
  let MetaDeckModel: mongoose.Model<MetaDeckDataByDateType>;
  jest.setTimeout(20000);
  beforeAll(async () => {
    await mongoose.connect(
      `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`
    );
    MetaDeckModel = mongoose.model('MetaDeck', MetaDeckMongoSchema);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a valid banner data document', async () => {
    const validData = {
      title: '1/19 - 1/25 (2024) 上位抄牌區',
      publish_date: new Date(),
      photo: 'a8f9a63c-9ce0-4e3c-b123-68d3dc37c03a.png',
      content:
        '<p><span style="font-size: 20px; color: #000080;">本週上位卡表</span></p>',
      status: 0,
      to_top: true,
      admin_id: '643c11dc6d9a4b14a77a5d95',
      tag: [
        {
          _id: '6433cb84393872bd1b6ee643',
          tag: '主流',
        },
      ],
    };

    const model = new MetaDeckModel(validData);
    const error = model.validateSync();
    expect(error).toBeUndefined();
  });

  it('should be invalid if required fields are missing', () => {
    const invalidData = {
      tag: [
        {
          _id: '6433cb84393872bd1b6ee643',
          tag: '主流',
        },
      ],
      // 缺少 title, publish_date, photo, content, status, to_top, admin_id
    };

    const doc = new MetaDeckModel(invalidData);
    const validationError = doc.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors).toHaveProperty('title');
    expect(validationError?.errors).toHaveProperty('publish_date');
    expect(validationError?.errors).toHaveProperty('photo');
    expect(validationError?.errors).toHaveProperty('content');
    expect(validationError?.errors).toHaveProperty('status');
    expect(validationError?.errors).toHaveProperty('to_top');
    expect(validationError?.errors).toHaveProperty('admin_id');
  });

  it('錯誤的meta_deck格式', () => {
    const invalidData = {
      title: '1/19 - 1/25 (2024) 上位抄牌區',
      publish_date: 'invalid date', // invalid
      photo: 'a8f9a63c-9ce0-4e3c-b123-68d3dc37c03a.png',
      content:
        '<p><span style="font-size: 20px; color: #000080;">本週上位卡表</span></p>',
      status: 3, // out of range
      to_top: true,
      admin_id: '643c11dc6d9a4b14a77a5d95',
      tag: [],
    };

    const doc = new MetaDeckModel(invalidData);
    const validationError = doc.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors).toHaveProperty('status');
    expect(validationError?.errors).toHaveProperty('publish_date');
  });
});
