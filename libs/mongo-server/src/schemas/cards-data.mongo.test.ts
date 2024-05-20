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
    expect(err.errors.name).toBeDefined();
    expect(err.errors.id).toBeDefined();
    expect(err.errors.type).toBeDefined();
    expect(err.errors.product_information_type).toBeDefined();
  });

  it('should be invalid if name is too long', () => {
    const card = new CardsModel({ name: 'a'.repeat(51) });

    const err: MongooseError.ValidationError =
      card.validateSync() as MongooseError.ValidationError;
    expect(err.errors.name).toBeDefined();
  });

  it('should save a card with correct data', async () => {
    const card = new CardsModel({
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

  it('should be invalid if number format is incorrect', () => {
    const card = new CardsModel({ number: '1234' });

    const err: MongooseError.ValidationError =
      card.validateSync() as MongooseError.ValidationError;
    expect(err.errors.number).toBeDefined();
  });

  it('should be invalid if atk is out of range', () => {
    const card = new CardsModel({ atk: 30000 });

    const err: MongooseError.ValidationError =
      card.validateSync() as MongooseError.ValidationError;
    expect(err.errors.atk).toBeDefined();
  });

  it('should be invalid if def is out of range', () => {
    const card = new CardsModel({ def: -10 });

    const err: MongooseError.ValidationError =
      card.validateSync() as MongooseError.ValidationError;
    expect(err.errors.def).toBeDefined();
  });

  it('should be invalid if price_info time format is incorrect', () => {
    const card = new CardsModel({
      price_info: [{ time: 'invalid-date' }],
    });

    const err: MongooseError.ValidationError =
      card.validateSync() as MongooseError.ValidationError;
    expect(err.errors['price_info.0.time']).toBeDefined();
  });

  it('should be invalid if price_yuyu time format is incorrect', () => {
    const card = new CardsModel({
      price_yuyu: [{ time: 'invalid-date' }],
    });

    const err: MongooseError.ValidationError =
      card.validateSync() as MongooseError.ValidationError;
    expect(err.errors['price_yuyu.0.time']).toBeDefined();
  });

  it('should be invalid if id format is incorrect', () => {
    const card = new CardsModel({ id: 'invalid-id' });

    const err: MongooseError.ValidationError =
      card.validateSync() as MongooseError.ValidationError;
    expect(err.errors.id).toBeDefined();
  });

  it('should be invalid if star is incorrect', () => {
    const card = new CardsModel({ star: 'invalid-star' });

    const err: MongooseError.ValidationError =
      card.validateSync() as MongooseError.ValidationError;
    expect(err.errors.star).toBeDefined();
  });

  it('should be invalid if attribute is incorrect', () => {
    const card = new CardsModel({ attribute: 'invalid-attribute' });

    const err: MongooseError.ValidationError =
      card.validateSync() as MongooseError.ValidationError;
    expect(err.errors.attribute).toBeDefined();
  });

  it('should be invalid if rarity is incorrect', () => {
    const card = new CardsModel({ rarity: ['invalid-rarity'] });

    const err: MongooseError.ValidationError =
      card.validateSync() as MongooseError.ValidationError;
    expect(err.errors['rarity.0']).toBeDefined();
  });

  it('should be invalid if race is incorrect', () => {
    const card = new CardsModel({ race: 'invalid-race' });

    const err: MongooseError.ValidationError =
      card.validateSync() as MongooseError.ValidationError;
    expect(err.errors.race).toBeDefined();
  });

  it('should be invalid if product_information_type format is incorrect', () => {
    const card = new CardsModel({ product_information_type: 'invalid' });

    const err: MongooseError.ValidationError =
      card.validateSync() as MongooseError.ValidationError;
    expect(err.errors.product_information_type).toBeDefined();
  });

  it('should be invalid if effect is too long', () => {
    const card = new CardsModel({ effect: 'a'.repeat(801) });

    const err: MongooseError.ValidationError =
      card.validateSync() as MongooseError.ValidationError;
    expect(err.errors.effect).toBeDefined();
  });
});
