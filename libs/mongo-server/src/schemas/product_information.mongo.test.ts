import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import {
  ProductInformationMongoSchema,
  ProductInformationDataByDateType,
} from './product_information.mongo';

config({ path: resolve(__dirname, '../../../../config/.env.common') });
config({ path: resolve(__dirname, '../../../../config/.env.service') });

describe('ProductInformationMongoSchema', () => {
  let ProductInformationModel: mongoose.Model<ProductInformationDataByDateType>;
  jest.setTimeout(20000);
  beforeAll(async () => {
    await mongoose.connect(
      `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`
    );
    ProductInformationModel = mongoose.model(
      'ProductInformation',
      ProductInformationMongoSchema
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should throw an error when required fields are missing', async () => {
    const productInfo = new ProductInformationModel({
      // 缺少必要的字段
      type: 0,
      title: 'Test Product',
      status: 1,
      to_top: true,
    });

    await expect(productInfo.save()).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });

  it('should throw an error when publish_date is invalid', async () => {
    const productInfo = new ProductInformationModel({
      type: 0,
      product_information_type_id: '12345',
      title: 'Test Product',
      publish_date: 'invalid-date',
      photo: 'test-photo-url',
      content: 'Test content',
      status: 1,
      to_top: true,
      admin_id: 'admin123',
      tag: ['tag1', 'tag2'],
    });

    await expect(productInfo.save()).rejects.toThrow('Cast to Date failed');
  });

  it('should set and get publish_date correctly', async () => {
    const productInfo = new ProductInformationModel({
      type: 0,
      product_information_type_id: '12345',
      title: 'Test Product',
      publish_date: '2023-08-27T00:00:00.000Z',
      photo: 'test-photo-url',
      content: 'Test content',
      status: 1,
      to_top: true,
      admin_id: 'admin123',
      tag: ['tag1', 'tag2'],
    });

    const validationError = productInfo.validateSync();
    expect(validationError).toBeUndefined();

    expect(productInfo.publish_date).toEqual('2023-08-27T00:00:00.000Z');
  });
});
