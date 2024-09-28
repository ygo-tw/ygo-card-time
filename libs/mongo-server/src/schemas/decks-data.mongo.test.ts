import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import { DecksMongoSchema, DecksDataByDateType } from './decks-data.mongo';

config({ path: resolve(__dirname, '../../../../config/.env.common') });
config({ path: resolve(__dirname, '../../../../config/.env.service') });

describe('MetaDeckMongoSchema', () => {
  let DecksModel: mongoose.Model<DecksDataByDateType>;
  jest.setTimeout(20000);
  beforeAll(async () => {
    await mongoose.connect(
      `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`
    );
    DecksModel = mongoose.model('MetaDeck', DecksMongoSchema);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a valid decks data document', async () => {
    const validData = {
      admin_id: 'alex123456',
      title: '想收',
      create_date: '2023-12-28T00:00:00.000+00:00',
      last_edit_date: '2024-01-11T00:00:00.000+00:00',
      main_deck: [
        {
          _id: '659f861b67107c49d73e65fd',
          card_id: '659cc3040dfe8e6bdaf89ca1',
          card_rarity: '亮面',
        },
        {
          _id: '659f861b67107c49d73e65fd',
          card_id: '659cc3040dfe8e6bdaf89ca1',
          card_rarity: '亮面',
        },
      ],
      extra_deck: [
        {
          _id: '659f861b67107c49d73e65fd',
          card_id: '659cc3040dfe8e6bdaf89ca1',
          card_rarity: '亮面',
        },
        {
          _id: '659f861b67107c49d73e65fd',
          card_id: '659cc3040dfe8e6bdaf89ca1',
          card_rarity: '亮面',
        },
      ],
      side_deck: [],
    };

    const model = new DecksModel(validData);
    const error = model.validateSync();
    expect(error).toBeUndefined();
  });

  it('should be invalid if required fields are missing', () => {
    const invalidData = {
      main_deck: [],
      extra_deck: [],
      side_deck: [],
      // 缺少 admin_id, title, create_date, last_edit_date
    };

    const doc = new DecksModel(invalidData);
    const validationError = doc.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors).toHaveProperty('admin_id');
    expect(validationError?.errors).toHaveProperty('title');
    expect(validationError?.errors).toHaveProperty('create_date');
    expect(validationError?.errors).toHaveProperty('last_edit_date');
  });

  it('should be invalid if deck is incorrect', () => {
    const invalidData = {
      admin_id: 'alex123456',
      title: '錯誤的main_deck',
      create_date: '2023-12-28T00:00:00.000+00:00',
      last_edit_date: '2024-01-11T00:00:00.000+00:00',
      main_deck: [
        {
          card_id: '659cc3040dfe8e6bdaf89ca1', // 缺少 _id
          card_rarity: '亮面',
        },
        {
          _id: '659f861b67107c49d73e65fd',
          card_rarity: '亮面', // 缺少 card_id
        },
        {
          _id: '659f861b67107c49d73e65fd',
          card_id: '659cc3040dfe8e6bdaf89ca1', // 缺少 card_rarity
        },
      ],
      extra_deck: [
        {
          card_id: '659cc3040dfe8e6bdaf89ca1', // 缺少 _id
          card_rarity: '亮面',
        },
        {
          _id: '659f861b67107c49d73e65fd',
          card_rarity: '亮面', // 缺少 card_id
        },
        {
          _id: '659f861b67107c49d73e65fd',
          card_id: '659cc3040dfe8e6bdaf89ca1', // 缺少 card_rarity
        },
      ],
      side_deck: [
        {
          card_id: '659cc3040dfe8e6bdaf89ca1', // 缺少 _id
          card_rarity: '亮面',
        },
        {
          _id: '659f861b67107c49d73e65fd',
          card_rarity: '亮面', // 缺少 card_id
        },
        {
          _id: '659f861b67107c49d73e65fd',
          card_id: '659cc3040dfe8e6bdaf89ca1', // 缺少 card_rarity
        },
      ],
    };

    const doc = new DecksModel(invalidData);
    const validationError = doc.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors['main_deck.0._id']).toBeDefined();
    expect(validationError?.errors['main_deck.1.card_id']).toBeDefined();
    expect(validationError?.errors['main_deck.2.card_rarity']).toBeDefined();
    expect(validationError?.errors['extra_deck.0._id']).toBeDefined();
    expect(validationError?.errors['extra_deck.1.card_id']).toBeDefined();
    expect(validationError?.errors['extra_deck.2.card_rarity']).toBeDefined();
    expect(validationError?.errors['side_deck.0._id']).toBeDefined();
    expect(validationError?.errors['side_deck.1.card_id']).toBeDefined();
    expect(validationError?.errors['side_deck.2.card_rarity']).toBeDefined();
  });

  it('should be invalid if title is longer than 50 characters', () => {
    const invalidData = {
      admin_id: 'alex123456',
      title: 'a'.repeat(51), // 超過 50 個字符
      create_date: '2023-12-28T00:00:00.000+00:00',
      last_edit_date: '2024-01-11T00:00:00.000+00:00',
      main_deck: [],
      extra_deck: [],
      side_deck: [],
    };

    const model = new DecksModel(invalidData);
    const validationError = model.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError?.errors).toHaveProperty('title'); // 確保錯誤來自於 tag 字段
    expect(validationError?.errors['title'].message).toBe(
      'Path `title` (`' +
        invalidData.title +
        '`) is longer than the maximum allowed length (50).'
    );
  });
});
