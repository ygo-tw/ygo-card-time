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
  AnyBulkWriteOperation,
  MongooseBulkWriteOptions,
} from 'mongoose';
import { ModelNames } from '@ygo/schemas';
import { ModelRegistry } from './modelRegistry';
import { FastifyBaseLogger } from 'fastify';
// const uri = `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;
export class DataAccessService {
  private registry: ModelRegistry;
  private uri: string;
  private isInit: boolean = false;
  private logger: FastifyBaseLogger | Console;

  constructor(uri: string, logger?: FastifyBaseLogger | Console) {
    this.uri = uri;
    this.registry = ModelRegistry.getInstance();
    this.logger = logger || console;
  }

  private async init() {
    try {
      this.logger.info('Initializing MongoDB...');
      await mongoose.connect(this.uri);
      this.isInit = true;
      this.logger.info('MongoDB connected successfully.');
    } catch (err) {
      this.logger.error('MongoDB connection error:', err);
      throw err;
    }
  }

  public async ensureInitialized() {
    if (!this.isInit) {
      await this.init();
    }
  }

  /**
   * 將 MongoDB 文檔轉換為標準格式
   * @param doc MongoDB 文檔
   * @returns 轉換後的文檔
   */
  private transformDocument(doc: any): any {
    if (!doc) return doc;

    // 處理單個文檔
    if (doc._id) {
      // 將 _id 轉換為字串
      doc._id = doc._id.toString();
    }

    // 移除 __v 欄位
    if (doc.__v !== undefined) {
      delete doc.__v;
    }

    return doc;
  }

  /**
   * 轉換查詢結果（處理陣列或單一文檔）
   * @param results 查詢結果
   * @returns 轉換後的結果
   */
  private transformResults(results: any): any {
    if (!results) return results;

    // 處理陣列結果
    if (Array.isArray(results)) {
      return results.map(doc => this.transformDocument(doc));
    }

    // 處理單一文檔
    return this.transformDocument(results);
  }

  /**
   * 查找
   * @param modelName model name
   * @param filter filter
   * @param projection projection
   * @param options options
   * @returns
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
      const results = await model.find(filter, projection, options).lean();
      return this.transformResults(results) as T[];
    } catch (error) {
      this.logger.error(
        `Error finding documents in model ${modelName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * 查找單筆
   * @param modelName model name
   * @param filter filter
   * @param projection projection
   * @param options options
   * @returns
   */
  public async findOne<T>(
    modelName: ModelNames,
    filter: FilterQuery<T> = {},
    projection: ProjectionType<T> = {},
    options: QueryOptions = {}
  ): Promise<T | null> {
    await this.ensureInitialized();
    const model = this.registry.getModel(modelName);
    try {
      const result = await model.findOne(filter, projection, options).lean();
      return this.transformResults(result) as T | null;
    } catch (error) {
      this.logger.error(`Error finding document in model ${modelName}:`, error);
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
  ): Promise<T | null> {
    await this.ensureInitialized();
    const model = this.registry.getModel(modelName);
    try {
      const result = (await model
        .findOneAndUpdate(filter, update, { new: true, ...options })
        .lean()
        .exec()) as unknown as T | null;
      return result;
    } catch (error) {
      this.logger.error(
        `Error finding and updating document in model ${modelName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Performs multiple write operations with a single command.
   * @param modelName The model/collection name
   * @param operations Array of write operations to perform
   * @param options Options for the bulk write operation
   * @returns Result of the bulk write operation
   */
  public async bulkWrite(
    modelName: ModelNames,
    operations: AnyBulkWriteOperation[],
    options: MongooseBulkWriteOptions = {}
  ): Promise<mongoose.mongo.BulkWriteResult> {
    await this.ensureInitialized();
    const model = this.registry.getModel(modelName);
    try {
      const result = await model.bulkWrite(operations as any, options);
      return result;
    } catch (error) {
      this.logger.error(
        `Error performing bulk write operations in model ${modelName}:`,
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
      const results = (await model
        .aggregate(pipeline, options)
        .exec()) as any[];

      // 對查詢結果進行後處理
      return results.map(doc => {
        // 轉換 _id 為字串
        if (doc._id) doc._id = doc._id.toString();
        // 刪除 __v 欄位
        delete doc.__v;
        return doc as T;
      });
    } catch (error) {
      this.logger.error(
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
      this.logger.error(
        `Error creating document in model ${modelName}:`,
        error
      );
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
      this.logger.error(
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
      this.logger.error(
        `Error deleting document in model ${modelName}:`,
        error
      );
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

  /**
   * Update multiple documents in the specified model.
   * @param modelName Collection name
   * @param filter Filter query
   * @param update Update query
   * @param options Update options
   * @returns Number of updated documents
   */
  public async updateMany<T>(
    modelName: ModelNames,
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options: mongo.UpdateOptions = {}
  ): Promise<number> {
    await this.ensureInitialized();
    const model = this.registry.getModel(modelName);
    try {
      const result = await model.updateMany(filter, update, options);
      return result.modifiedCount;
    } catch (error) {
      this.logger.error(
        `Error updating multiple documents in model ${modelName}:`,
        error
      );
      throw error;
    }
  }
}
