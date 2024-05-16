import { ModelNames, ModelSchema } from '@ygo/schemas';
import mongoose, { Document, Model } from 'mongoose';
import { modelSchemas } from './modelSchemas';

export class ModelRegistry {
  private static instance: ModelRegistry;
  private models: { [key: string]: Model<Document> } = {};
  private schemaDef: ModelSchema = modelSchemas;

  private constructor() {}

  public static getInstance(): ModelRegistry {
    if (!ModelRegistry.instance) {
      ModelRegistry.instance = new ModelRegistry();
    }
    return ModelRegistry.instance;
  }

  /**
   * @param modelName: collection name in MongoDB
   * @returns: Model<modelName>
   */
  public getModel(modelName: ModelNames): Model<Document> {
    if (!this.models[modelName]) {
      const schema = this.schemaDef[modelName]?.originSchema;
      this.models[modelName] = mongoose.model<Document>(
        modelName,
        schema,
        modelName
      );
    }
    return this.models[modelName];
  }
}
