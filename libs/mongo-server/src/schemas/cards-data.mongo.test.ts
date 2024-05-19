import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose, { Error as MongooseError } from 'mongoose';
import { CardsDataType } from '@ygo/schemas';
import { CardsMongoSchema } from './cards-data.mongo';

config({ path: resolve(__dirname, '../../../../config/.env.common') });
config({ path: resolve(__dirname, '../../../../config/.env.service') });

const CardsModel = mongoose.model<CardsDataType>('Card', CardsMongoSchema);

describe('CardsMongoSchema', () => {
  beforeAll(async () => {
    await mongoose.connect(
      `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should be invalid if required fields are missing', () => {
    const card = new CardsModel();

    const err: MongooseError.ValidationError =
      card.validateSync() as MongooseError.ValidationError;
    expect(err.errors._id).toBeDefined();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.id).toBeDefined();
    expect(err.errors.type).toBeDefined();
    expect(err.errors.product_information_type).toBeDefined();
  });

  it('should be invalid if _id format is incorrect', () => {
    const card = new CardsModel({ _id: '12345' });

    const err: MongooseError.ValidationError =
      card.validateSync() as MongooseError.ValidationError;
    expect(err.errors._id).toBeDefined();
  });

  it('should be invalid if name is too long', () => {
    const card = new CardsModel({ name: 'a'.repeat(51) });

    const err: MongooseError.ValidationError =
      card.validateSync() as MongooseError.ValidationError;
    expect(err.errors.name).toBeDefined();
  });

  it('should save a card with correct data', async () => {
    const card = new CardsModel({
      _id: '60b8d295f1d2a2c2e4b6d1c5',
      name: 'Blue-Eyes White Dragon',
      id: 'LOB-001',
      type: '通常怪獸',
      product_information_type: 'TST1',
    });

    jest
      .spyOn(card, 'save')
      .mockImplementationOnce(() => Promise.resolve(card));

    await expect(card.save()).resolves.toBeDefined();
  });
});
