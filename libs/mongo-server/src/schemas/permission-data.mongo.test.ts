import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import { PermissionDataType } from '@ygo/schemas';
import { PermissionMongoSchema } from './permission-data.mongo';

config({ path: resolve(__dirname, '../../../../config/.env.common') });
config({ path: resolve(__dirname, '../../../../config/.env.service') });

const PermissionModel = mongoose.model<PermissionDataType>(
  'Permission',
  PermissionMongoSchema
);

describe('PermissionMongoSchema', () => {
  jest.setTimeout(20000);
  beforeAll(async () => {
    await mongoose.connect(
      `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should fail when required fields are missing', async () => {
    const permission = new PermissionModel({});

    try {
      await permission.validate();
    } catch (error) {
      const validationError = error as mongoose.Error.ValidationError;
      expect(validationError.errors.name).toBeDefined();
      expect(validationError.errors.type).toBeDefined();
    }
  });

  it('should fail when permission is missing', async () => {
    const permission = new PermissionModel({
      name: 'Valid Name',
      type: 3,
    });

    try {
      await permission.validate();
    } catch (error) {
      const validationError = error as mongoose.Error.ValidationError;
      expect(validationError.errors.permission).toBeDefined();
      expect(validationError.errors.permission.message).toBe(
        'Path `permission` is required.'
      );
    }
  });

  it('should pass when permission is an empty array', async () => {
    const permission = new PermissionModel({
      name: 'Valid Name',
      permission: [], // 空陣列應該通過驗證
      type: 3,
    });

    await expect(permission.validate()).resolves.not.toThrow();
  });

  it('should fail when "name" exceeds maxLength', async () => {
    const permission = new PermissionModel({
      name: 'a'.repeat(51),
      permission: ['valid_path'],
      type: 1,
    });

    try {
      await permission.validate();
    } catch (error) {
      const validationError = error as mongoose.Error.ValidationError;
      expect(validationError.errors.name).toBeDefined();
      expect(validationError.errors.name.kind).toBe('maxlength');
    }
  });

  it('should fail when "permission" contains invalid paths', async () => {
    const permission = new PermissionModel({
      name: 'Valid Name',
      permission: ['InvalidPath'],
      type: 2,
    });

    try {
      await permission.validate();
    } catch (error) {
      const validationError = error as mongoose.Error.ValidationError;
      expect(validationError.errors.permission).toBeDefined();
      expect(validationError.errors.permission.message).toBe(
        'Permission paths must only contain lowercase letters and underscores.'
      );
    }
  });

  it('should fail when "type" is out of range', async () => {
    const permission = new PermissionModel({
      name: 'Valid Name',
      permission: ['valid_path'],
      type: 6, // Out of range
    });

    try {
      await permission.validate();
    } catch (error) {
      const validationError = error as mongoose.Error.ValidationError;
      expect(validationError.errors.type).toBeDefined();
      expect(validationError.errors.type.kind).toBe('max');
    }
  });

  it('should pass when all fields are valid', async () => {
    const permission = new PermissionModel({
      name: 'Valid Name',
      permission: ['valid_path'],
      type: 3,
    });

    await expect(permission.validate()).resolves.not.toThrow();
  });
});
