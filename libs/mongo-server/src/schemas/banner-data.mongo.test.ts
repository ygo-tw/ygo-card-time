import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import { BannerMongoSchema, BannerDataByDateType } from './banner-data.mongo';

config({ path: resolve(__dirname, '../../../../config/.env.common') });
config({ path: resolve(__dirname, '../../../../config/.env.service') });

describe('BannerMongoSchema', () => {
  let BannerModel: mongoose.Model<BannerDataByDateType>;
  jest.setTimeout(20000);
  beforeAll(async () => {
    await mongoose.connect(
      `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`
    );
    BannerModel = mongoose.model('Banner', BannerMongoSchema);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a valid banner data document', async () => {
    const validData = {
      title: 'Banner標題',
      date: new Date(),
      photo_pc:
        'https://cardtime.tw//api/card-image/banner/4c103a3f-cf4b-4f0c-9e69-abad1b877225.webp',
      photo_mobile:
        'https://cardtime.tw//api/card-image/banner/4c103a3f-cf4b-4f0c-9e69-abad1b877225.webp',
      url: 'https://www.yugioh-card.com/japan/products/dp29/',
    };

    const model = new BannerModel(validData);
    const error = model.validateSync();
    expect(error).toBeUndefined();
  });

  it('should be invalid if required fields are missing', () => {
    const invalidData = {
      title: 'Banner標題',
      url: 'https://www.yugioh-card.com/japan/products/dp29/',
      // 缺少 date, photo_pc, photo_mobile
    };

    const doc = new BannerModel(invalidData);
    const validationError = doc.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors).toHaveProperty('date');
    expect(validationError?.errors).toHaveProperty('photo_pc');
    expect(validationError?.errors).toHaveProperty('photo_mobile');
  });

  it('should be invalid if fields exceed max length or have invalid values', () => {
    const invalidData = {
      title: 'a'.repeat(101), // Too long
      date: new Date(),
      photo_pc:
        'https://cardtime.tw//api/card-image/banner/4c103a3f-cf4b-4f0c-9e69-abad1b877225.webp',
      photo_mobile:
        'https://cardtime.tw//api/card-image/banner/4c103a3f-cf4b-4f0c-9e69-abad1b877225.webp',
      url: 'a'.repeat(201), // Too long
    };

    const doc = new BannerModel(invalidData);
    const validationError = doc.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors).toHaveProperty('title');
    expect(validationError?.errors).toHaveProperty('url');
  });
});
