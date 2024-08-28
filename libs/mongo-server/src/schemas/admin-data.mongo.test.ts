import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import { AdminMongoSchema, AdminnDataByDateType } from './admin-data.mongo';

config({ path: resolve(__dirname, '../../../../config/.env.common') });
config({ path: resolve(__dirname, '../../../../config/.env.service') });

describe('AdminMongoSchema', () => {
  let AdminModel: mongoose.Model<AdminnDataByDateType>;
  jest.setTimeout(20000);
  beforeAll(async () => {
    await mongoose.connect(
      `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`
    );
    AdminModel = mongoose.model('Admin', AdminMongoSchema);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // 清空數據庫中的資料
    await AdminModel.deleteMany({});
  });

  it('should create a valid admin data document', async () => {
    const validAdminData = {
      type: 1,
      name: 'John Doe',
      create_date: new Date(),
      photo: 'https://example.com/photo.jpg',
      status: 1,
      account: 'john_doe',
      password: 'Password123',
      email: 'john.doe@example.com',
    };

    const model = new AdminModel(validAdminData);
    const error = model.validateSync();
    expect(error).toBeUndefined();
  });

  it('should fail to create admin data with an out-of-range type', async () => {
    const invalidAdminData = {
      type: 3, // 超出範圍
      name: 'John Doe',
      create_date: new Date(),
      photo: 'https://example.com/photo.jpg',
      status: 1,
      account: 'john_doe',
      password: 'Password123',
      email: 'john.doe@example.com',
    };

    const model = new AdminModel(invalidAdminData);
    const error = model.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors.type).toBeDefined();
  });

  it('should fail to create admin data with a name longer than 50 characters', async () => {
    const invalidAdminData = {
      type: 1,
      name: 'a'.repeat(51), // 超過最大長度
      create_date: new Date(),
      photo: 'https://example.com/photo.jpg',
      status: 1,
      account: 'john_doe',
      password: 'Password123',
      email: 'john.doe@example.com',
    };

    const model = new AdminModel(invalidAdminData);
    const error = model.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors.name).toBeDefined();
  });

  it('should fail to create admin data with an invalid create_date', async () => {
    const invalidAdminData = {
      type: 1,
      name: 'John Doe',
      create_date: 'invalid-date', // 無效的日期格式
      photo: 'https://example.com/photo.jpg',
      status: 1,
      account: 'john_doe',
      password: 'Password123',
      email: 'john.doe@example.com',
    };

    const model = new AdminModel(invalidAdminData);
    const error = model.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors.create_date).toBeDefined();
  });

  it('should fail to create admin data with an out-of-range status', async () => {
    const invalidAdminData = {
      type: 1,
      name: 'John Doe',
      create_date: new Date(),
      photo: 'https://example.com/photo.jpg',
      status: 3, // 超出範圍
      account: 'john_doe',
      password: 'Password123',
      email: 'john.doe@example.com',
    };

    const model = new AdminModel(invalidAdminData);
    const error = model.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors.status).toBeDefined();
  });

  it('should fail to create admin data with an account longer than 50 characters', async () => {
    const invalidAdminData = {
      type: 1,
      name: 'John Doe',
      create_date: new Date(),
      photo: 'https://example.com/photo.jpg',
      status: 1,
      account: 'a'.repeat(51), // 超過最大長度
      password: 'Password123',
      email: 'john.doe@example.com',
    };

    const model = new AdminModel(invalidAdminData);
    const error = model.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors.account).toBeDefined();
  });

  it('should fail to create admin data with short password', async () => {
    const invalidAdminData = {
      type: 1,
      name: 'John Doe',
      create_date: new Date(),
      photo: 'https://example.com/photo.jpg',
      status: 1,
      account: 'john_doe',
      password: 'short',
      email: 'john.doe@example.com',
    };

    const model = new AdminModel(invalidAdminData);
    const error = model.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors.password).toBeDefined();
  });

  it('should fail to create admin data with invalid email', async () => {
    const invalidAdminData = {
      type: 1,
      name: 'John Doe',
      create_date: new Date(),
      photo: 'https://example.com/photo.jpg',
      status: 1,
      account: 'john_doe',
      password: 'Password123',
      email: 'invalid-email',
    };

    const model = new AdminModel(invalidAdminData);
    const error = model.validateSync();
    expect(error).toBeDefined();
    expect(error?.errors.email).toBeDefined();
  });
});
