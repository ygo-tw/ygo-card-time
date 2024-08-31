import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import {
  CalendarMongoSchema,
  CalendarDataByDateType,
} from './calendar-data.mongo';

config({ path: resolve(__dirname, '../../../../config/.env.common') });
config({ path: resolve(__dirname, '../../../../config/.env.service') });

describe('CalendarMongoSchema', () => {
  let CalendarModel: mongoose.Model<CalendarDataByDateType>;
  jest.setTimeout(20000);
  beforeAll(async () => {
    await mongoose.connect(
      `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`
    );
    CalendarModel = mongoose.model('Calendar', CalendarMongoSchema);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a valid calendar data document', async () => {
    const validData = {
      title: '小小杯店加賽',
      date: new Date(),
      url: 'https://www.yugioh-card.com/japan/products/dp29/',
      content: '報名至2024-10-01',
      type: 0,
    };

    const model = new CalendarModel(validData);
    const error = model.validateSync();
    expect(error).toBeUndefined();
  });

  it('should be invalid if required fields are missing', () => {
    const invalidData = {
      url: 'https://www.yugioh-card.com/japan/products/dp29/',
      // 缺少 title, date, content, type
    };

    const doc = new CalendarModel(invalidData);
    const validationError = doc.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors).toHaveProperty('title');
    expect(validationError?.errors).toHaveProperty('date');
    expect(validationError?.errors).toHaveProperty('content');
    expect(validationError?.errors).toHaveProperty('type');
  });

  it('行事曆輸入格式錯誤', () => {
    const invalidData = {
      title: 'a'.repeat(101), // Too long
      date: new Date(),
      url: 'a'.repeat(201), // Too long
      content: 'a'.repeat(6001), // Too long
      type: 3, // 非 0~2 的數字
    };

    const doc = new CalendarModel(invalidData);
    const validationError = doc.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors).toHaveProperty('title');
    expect(validationError?.errors).toHaveProperty('url');
    expect(validationError?.errors).toHaveProperty('content');
    expect(validationError?.errors).toHaveProperty('type');
  });
});
