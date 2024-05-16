import { ModelRegistry } from './model-registry';
import mongoose from 'mongoose';

// Mock modelSchemas
jest.mock('./model-schemas', () => ({
  modelSchemas: {
    admin: { originSchema: { name: String, age: Number } },
    banner: { originSchema: { name: String, price: Number } },
    cards: { originSchema: { name: String, age: Number } },
    decks: { originSchema: { name: String, price: Number } },
  },
}));

describe('ModelRegistry', () => {
  afterAll(() => {
    mongoose.connection.close();
  });

  it('should ensure ModelRegistry is a singleton', () => {
    const instance1 = ModelRegistry.getInstance();
    const instance2 = ModelRegistry.getInstance();
    expect(instance1).toBe(instance2);
  });

  describe('Test getModel', () => {
    let registry: ModelRegistry;

    beforeEach(() => {
      // 清理 ModelRegistry 的實例來保證測試的獨立性
      (ModelRegistry as any).instance = null;
      registry = ModelRegistry.getInstance();
      (registry as any).models = {};
    });

    afterEach(() => {
      // 清理所有的模擬
      jest.clearAllMocks();
    });

    it('should create a new mongoose model if it does not exist in the cache', () => {
      const modelSpy = jest.spyOn(mongoose, 'model');

      const userModel = registry.getModel('admin');

      expect(modelSpy).toHaveBeenCalledWith(
        'admin',
        expect.any(Object),
        'admin'
      );
      expect(userModel).toBeInstanceOf(Function);
    });

    it('should return the same model instance for subsequent calls', () => {
      const userModel1 = registry.getModel('banner');
      const userModel2 = registry.getModel('banner');

      expect(userModel1).toBe(userModel2);
    });

    it('should correctly create different models for different names', () => {
      const userModel = registry.getModel('cards');
      const productModel = registry.getModel('decks');

      expect(userModel).not.toBe(productModel);
      expect(registry.getModel('cards')).toBe(userModel);
      expect(registry.getModel('decks')).toBe(productModel);
    });
  });
});
