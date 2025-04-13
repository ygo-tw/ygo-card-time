import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import { JurisprudenceDataType } from '@ygo/schemas';
import { JurisprudenceMongoSchema } from './jurisprudence-data.mongo';

config({ path: resolve(__dirname, '../../../../config/.env.common') });
config({ path: resolve(__dirname, '../../../../config/.env.service') });

const JurisprudenceModel = mongoose.model<JurisprudenceDataType>(
  'Jurisprudence',
  JurisprudenceMongoSchema
);

describe('JurisprudenceMongoSchema', () => {
  jest.setTimeout(20000);
  beforeAll(async () => {
    await mongoose.connect(
      `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should be valid if all required fields are present and correct', async () => {
    const validData = {
      number: '12345',
      name_jp_h: '名誉の名前',
      name_jp_k: 'ナメエ',
      name_en: 'Name',
      effect_jp: 'カード効果',
      jud_link: 'https://example.com',
      info: 'Additional info',
      qa: [
        {
          _id: '60b8d295f1d2a2c2e4b6d1c5',
          title: '質問のタイトル',
          tag: 'タグ',
          date: '2023-01-01',
          q: '質問内容',
          a: '回答内容',
        },
      ],
    };

    const model = new JurisprudenceModel(validData);
    const error = model.validateSync();
    expect(error).toBeUndefined();
  });

  it('should be invalid if date format is incorrect', async () => {
    const invalidData = {
      number: '12345',
      name_jp_h: '名誉の名前',
      name_jp_k: 'ナメエ',
      name_en: 'Name',
      effect_jp: 'カード効果',
      jud_link: 'https://example.com',
      info: 'Additional info',
      qa: [
        {
          _id: '60b8d295f1d2a2c2e4b6d1c5',
          title: '質問のタイトル',
          tag: 'タグ',
          date: '01-01-2023',
          q: '質問内容',
          a: '回答内容',
        },
      ],
    };

    const model = new JurisprudenceModel(invalidData);
    const error = model.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors['qa.0.date']).toBeDefined();
  });

  it('should be invalid if jud_link format is incorrect', async () => {
    const invalidData = {
      number: '12345',
      name_jp_h: '名誉の名前',
      name_jp_k: 'ナメエ',
      name_en: 'Name',
      effect_jp: 'カード効果',
      jud_link: 'invalid-url', // incorrect format
      info: 'Additional info',
      qa: [
        {
          _id: '60b8d295f1d2a2c2e4b6d1c5',
          title: '質問のタイトル',
          tag: 'タグ',
          date: '2023-01-01',
          q: '質問内容',
          a: '回答内容',
        },
      ],
    };

    const model = new JurisprudenceModel(invalidData);
    const error = model.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors['jud_link']).toBeDefined();
  });
});
