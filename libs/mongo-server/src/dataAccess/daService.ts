import mongoose, {
  FilterQuery,
  ProjectionType,
  QueryOptions,
  Document,
} from 'mongoose';
import { ModelNames } from '@ygo/schemas';
import { ModelRegistry } from './modelRegistry';

// const uri = `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;
export class DataAccessService {
  private registry: ModelRegistry;
  private uri: string;

  constructor(uri: string) {
    this.uri = uri;
    this.registry = ModelRegistry.getInstance();
  }

  async init() {
    await this.connectDB();
  }

  private async connectDB() {
    try {
      await mongoose.connect(this.uri);
      console.log('MongoDB connected successfully.');
    } catch (err) {
      console.error('MongoDB connection error:', err);
      throw err;
    }
  }

  public find<T extends Document>(
    modelName: ModelNames,
    filter: FilterQuery<T> = {},
    projection: ProjectionType<T> = {},
    options: QueryOptions = {}
  ) {
    const model = this.registry.getModel(modelName);
    return model.find(filter, projection, options).exec();
  }
}