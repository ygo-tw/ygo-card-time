import mongoose, {
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  ObjectId,
  PipelineStage,
  mongo,
  InsertManyOptions,
  AggregateOptions,
  CreateOptions,
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
  public async find<T>(
    modelName: ModelNames,
    filter: FilterQuery<T> = {},
    projection: ProjectionType<T> = {},
    options: QueryOptions = {}
  ): Promise<T[]> {
    await this.ensureInitialized();
    const model = this.registry.getModel(modelName);
    try {
      const result = await model
        .find(filter, projection, options)
        .lean()
        .exec();
      return result as unknown as T[];
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
  public async findAndUpdate<T>(
    modelName: ModelNames,
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options: QueryOptions = {}
  ): Promise<T> {
    await this.ensureInitialized();
    const model = this.registry.getModel(modelName);
    try {
      const result = (await model
        .findOneAndUpdate(filter, update, { new: true, ...options })
        .exec()) as unknown as T | null;
      if (!result) {
        throw new Error(
          `No document found for filter: ${JSON.stringify(filter)}`
        );
      }
      return result;
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
    pipeline: PipelineStage[],
    options: AggregateOptions = {}
  ): Promise<T[]> {
    await this.ensureInitialized();
    const model = this.registry.getModel(modelName);
    try {
      return model.aggregate(pipeline, options).exec() as Promise<T[]>;
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
  public async createOne<T>(
    modelName: ModelNames,
    doc: T,
    options: CreateOptions = {}
  ): Promise<ObjectId> {
    await this.ensureInitialized();
    const model = this.registry.getModel(modelName);
    await model.syncIndexes();
    try {
      const result = await model.create([doc], options);
      return result[0]?._id as unknown as ObjectId;
    } catch (error) {
      console.error(`Error creating document in model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Insert multiple documents into the specified model.
   * @param modelName Collection name
   * @param docs Documents to insert
   * @param options Insert options
   * @returns Inserted documents
   */
  public async insertMany<T>(
    modelName: ModelNames,
    docs: T[],
    options: InsertManyOptions = {}
  ): Promise<T[]> {
    await this.ensureInitialized();
    const model = this.registry.getModel(modelName);
    await model.syncIndexes();
    try {
      const result = await model.insertMany(docs, options);
      return result as unknown as T[];
    } catch (error) {
      console.error(
        `Error inserting multiple documents in model ${modelName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete a document from the specified model.
   * @param modelName Collection name
   * @param filter Filter query
   * @param options Delete options
   * @returns Deleted document
   * @throws {Error} - Throws an error if deletion fails.
   */
  public async deleteOne<T>(
    modelName: ModelNames,
    filter: FilterQuery<T>,
    options: mongo.DeleteOptions = {}
  ): Promise<void> {
    await this.ensureInitialized();
    const model = this.registry.getModel(modelName);
    try {
      const result = await model.deleteOne(filter, options);
      if (result.deletedCount === 0) {
        throw new Error(
          `No document found for filter: ${JSON.stringify(filter)}`
        );
      }
    } catch (error) {
      console.error(`Error deleting document in model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Find the count of documents in the specified model.
   * @param modelName Collection name
   * @param filter Filter query
   * @param options Count options
   * @returns Count of documents
   */
  public async findDocumentCount<T>(
    modelName: ModelNames,
    filter: FilterQuery<T>,
    options: mongo.CountOptions
  ): Promise<number | null> {
    try {
      await this.ensureInitialized();
      const model = this.registry.getModel(modelName);
      return model.countDocuments(filter, options);
    } catch (error) {
      return null;
    }
  }

  /**
   * Run a transaction with the provided operations.
   * @param operations An array of functions that perform operations within the transaction.
   * @returns The result of the transaction.
   */
  public async runTransaction<T>(
    operations: Array<(session: mongoose.ClientSession) => Promise<T>>
  ): Promise<T[]> {
    await this.ensureInitialized();
    const session = await mongoose.startSession();
    const results: T[] = [];

    try {
      session.startTransaction();
      for (const operation of operations) {
        const result = await operation(session);
        results.push(result);
      }
      await session.commitTransaction();
      return results;
    } catch (error) {
      await session.abortTransaction();
      throw new Error('Transaction aborted due to error');
    } finally {
      session.endSession();
    }
  }
}
