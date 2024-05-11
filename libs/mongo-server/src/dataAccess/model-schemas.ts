import { ModelSchema } from '@ygo/schemas';

export const modelSchemas: ModelSchema = {
  admin: {
    type: { type: Number, required: true },
    name: { type: String, required: true },
    create_date: { type: Date, required: true },
    photo: { type: String },
    status: { type: Number, required: true },
    account: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
  },
};
