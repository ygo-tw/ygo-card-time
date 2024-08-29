import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import { ProductInformationTypeMongoSchema } from './product_information_type.mongo';
import { ProductInformationTypeType } from '@ygo/schemas';

config({ path: resolve(__dirname, '../../../../config/.env.common') });
config({ path: resolve(__dirname, '../../../../config/.env.service') });

describe('ProductInformationMongoSchema', () => {
  let ProductInformationTypeModel: mongoose.Model<ProductInformationTypeType>;
  jest.setTimeout(20000);
  beforeAll(async () => {
    await mongoose.connect(
      `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`
    );
    ProductInformationTypeModel = mongoose.model(
      'ProductInformationType',
      ProductInformationTypeMongoSchema
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should be valid when all required fields are provided and correct', () => {
    const validData = {
      name: '【禮盒】(YAP1)十週年紀念包',
      packType: 'YAP1',
      mainType: 1,
      subType: '禮盒',
      status: 0,
    };

    const doc = new ProductInformationTypeModel(validData);
    const validationError = doc.validateSync();

    expect(validationError).toBeUndefined();
  });

  it('should be invalid if required fields are missing', () => {
    const invalidData = {
      name: '【禮盒】(YAP1)十週年紀念包',
      // 缺少 packType, mainType, subType, status
    };

    const doc = new ProductInformationTypeModel(invalidData);
    const validationError = doc.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors).toHaveProperty('packType');
    expect(validationError?.errors).toHaveProperty('mainType');
    expect(validationError?.errors).toHaveProperty('subType');
    expect(validationError?.errors).toHaveProperty('status');
  });

  it('should be invalid if fields exceed max length or have invalid values', () => {
    const invalidData = {
      name: 'This name is way too long and should fail the validation check',
      packType: 'YAP123', // Too long
      mainType: 10, // Out of range
      subType: 'Invalid Type', // Not in enum
      status: 0,
    };

    const doc = new ProductInformationTypeModel(invalidData);
    const validationError = doc.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors).toHaveProperty('name');
    expect(validationError?.errors).toHaveProperty('packType');
    expect(validationError?.errors).toHaveProperty('mainType');
    expect(validationError?.errors).toHaveProperty('subType');
  });

  it('should be invalid if status is not a number', () => {
    const invalidData = {
      name: '【禮盒】(YAP1)十週年紀念包',
      packType: 'YAP1',
      mainType: 1,
      subType: '禮盒',
      status: 'invalid', // status is not a number
    };

    const doc = new ProductInformationTypeModel(invalidData);
    const validationError = doc.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors).toHaveProperty('status');
  });
});
