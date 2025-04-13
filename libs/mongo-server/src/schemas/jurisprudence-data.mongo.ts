import { JurisprudenceDataType, DataAccessEnum } from '@ygo/schemas';
import { Schema } from 'mongoose';

const QASchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      description: 'Title of the question answer',
    },
    tag: {
      type: String,
      required: true,
      description: 'Tag of the question tag',
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/, // 簡單的日期格式驗證 YYYY-MM-DD
      description: 'Date of the question answer',
    },
    q: {
      type: String,
      required: true,
      description: 'Question',
    },
    a: {
      type: String,
      required: true,
      description: 'Answer',
    },
    _id: { type: String, required: true, match: /^[0-9a-f]{24}$/ },
  },
  { _id: false }
);

export const JurisprudenceMongoSchema = new Schema<JurisprudenceDataType>(
  {
    number: {
      type: String,
      required: true,
      description: 'Number',
      unique: true,
    },
    name_jp_h: {
      type: String,
      required: true,
      description: 'Japanese name (honorific)',
    },
    name_jp_k: {
      type: String,
      description: 'Japanese name (katakana)',
    },
    name_en: {
      type: String,
      description: 'English name',
    },
    effect_jp: {
      type: String,
      required: true,
      description: 'Japanese card effect',
    },
    jud_link: {
      type: String,
      required: true,
      match: /^https?:\/\/[^\s$.?#].[^\s]*$/,
      description: 'Judicial link url',
    },
    info: {
      type: String,
      description: 'Additional information',
    },
    qa: {
      type: [QASchema],
      required: true,
      description: 'Question and answers',
    },
  },
  { collection: DataAccessEnum.JURISPRUDENCE }
);
