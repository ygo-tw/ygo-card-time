import mongoose, {
  FilterQuery,
  ProjectionType,
  QueryOptions,
  Document,
  UpdateQuery,
  ObjectId,
  PipelineStage,
} from 'mongoose';
import { ModelNames } from '@ygo/schemas';
import { ModelRegistry } from './modelRegistry';

// const uri = `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;
export class DataAccessService {
  private registry: ModelRegistry;
  private uri: string;
  private isInit: boolean = false;

  constructor(uri: string) {
    this.uri = uri;
    this.registry = ModelRegistry.getInstance();
  }

  private async init() {
    try {
      console.log('Initializing MongoDB...');
      await mongoose.connect(this.uri);
      this.isInit = true;
      console.log('MongoDB connected successfully.');
    } catch (err) {
      console.error('MongoDB connection error:', err);
      throw err;
    }
  }

  private async ensureInitialized() {
    if (!this.isInit) {
      await this.init();
    }
  }

  /**
   * Insert a document into the specified model.
   * @param modelName collection name
   * @param filter filter query
   * @param projection projection query
   * @param options query options
   * @returns query result
   */
  public async find<T extends Document>(
    modelName: ModelNames,
    filter: FilterQuery<T> = {},
    projection: ProjectionType<T> = {},
    options: QueryOptions = {}
  ): Promise<T[]> {
    await this.ensureInitialized();
    const model = this.registry.getModel(modelName);
    try {
      return model.find(filter, projection, options).exec() as Promise<T[]>;
    } catch (error) {
      console.error(`Error finding documents in model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Find a document by filter and update it.
   * @param modelName collection name
   * @param filter filter query
   * @param update update query
   * @param options query options
   * @returns updated document
   */
  public async findAndUpdate<T extends Document>(
    modelName: ModelNames,
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options: QueryOptions = {}
  ): Promise<T | null> {
    await this.ensureInitialized();
    const model = this.registry.getModel(modelName);
    try {
      return model
        .findOneAndUpdate(filter, update, { new: true, ...options })
        .exec() as Promise<T | null>;
    } catch (error) {
      console.error(
        `Error finding and updating document in model ${modelName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Aggregates documents from a specified model.
   *
   * @template T - The type of the document.
   * @param {ModelNames} modelName - The name of the model to aggregate.
   * @param {PipelineStage[]} pipeline - The aggregation pipeline.
   * @returns {Promise<T[]>} - A promise that resolves to an array of aggregated documents.
   * @throws {Error} - Throws an error if aggregation fails.
   */
  public async aggregate<T>(
    modelName: ModelNames,
    pipeline: PipelineStage[]
  ): Promise<T[]> {
    await this.ensureInitialized();
    const model = this.registry.getModel(modelName);
    try {
      return model.aggregate(pipeline).exec() as Promise<T[]>;
    } catch (error) {
      console.error(
        `Error aggregating documents in model ${modelName}:`,
        error
      );
      throw new Error(`Aggregation failed for model ${modelName}`);
    }
  }

  /**
   * Create a new document in the specified model.
   * @param modelName Collection name
   * @param doc Document to create
   * @returns Created document
   */
  public async createOne<T extends Document>(
    modelName: ModelNames,
    doc: T
  ): Promise<ObjectId> {
    await this.ensureInitialized();
    const model = this.registry.getModel(modelName);
    await model.syncIndexes();
    try {
      const result = await model.collection.insertOne(doc);
      return result.insertedId as unknown as ObjectId;
    } catch (error) {
      console.error(`Error creating document in model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Insert multiple documents into the specified model.
   * @param modelName Collection name
   * @param docs Documents to insert
   * @returns Inserted documents
   */
  public async insertMany<T extends Document>(
    modelName: ModelNames,
    docs: T[]
  ): Promise<T[]> {
    await this.ensureInitialized();
    const model = this.registry.getModel(modelName);
    await model.syncIndexes();
    try {
      const result = await model.insertMany(docs);
      return result as unknown as T[];
    } catch (error) {
      console.error(
        `Error inserting multiple documents in model ${modelName}:`,
        error
      );
      throw error;
    }
  }
}
