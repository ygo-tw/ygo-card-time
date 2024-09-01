import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import { ForbiddenCardListDataType } from '@ygo/schemas';
import { ForbiddenCardListMongoSchema } from './forbidden_card_list-data.mongo';

config({ path: resolve(__dirname, '../../../../config/.env.common') });
config({ path: resolve(__dirname, '../../../../config/.env.service') });

const ForbbidenCardListModel = mongoose.model<ForbiddenCardListDataType>(
  'ForbbidenCardList',
  ForbiddenCardListMongoSchema
);

describe('CardsMongoSchema', () => {
  jest.setTimeout(20000);
  beforeAll(async () => {
    await mongoose.connect(
      `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a valid calendar data document', async () => {
    const validData = {
      number: '07394770',
      type: 0,
    };

    const model = new ForbbidenCardListModel(validData);
    const error = model.validateSync();
    expect(error).toBeUndefined();
  });

  it('should be invalid if required fields are missing', () => {
    const invalidData = {
      // 缺少 number, type
    };

    const doc = new ForbbidenCardListModel(invalidData);
    const validationError = doc.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors).toHaveProperty('number');
    expect(validationError?.errors).toHaveProperty('type');
  });

  it('should be invalid if type out of range', () => {
    const invalidData = {
      number: '07394770',
      type: 3, // out of range
    };

    const doc = new ForbbidenCardListModel(invalidData);
    const validationError = doc.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors).toHaveProperty('type');
  });
});
