import { DataAccessService } from '@ygo/mongo-server';
import { UserInfo } from '../Interface/auth.type';
import { ValidateCompiler } from './validateCompiler';
import { AwilixContainer } from 'awilix';
import { DataCacheService } from '@ygo/cache';

declare module 'awilix' {
  interface AwilixContainer {
    resolve<K extends keyof ContainerServices>(name: K): ContainerServices[K];
  }
}

// 後續有任何 service 請擴充於此
interface ContainerServices {
  dal: DataAccessService;
  cache: DataCacheService;
}

declare module 'fastify' {
  interface FastifyRequest {
    userInfo?: UserInfo;
    validateCompiler: ValidateCompiler;
    diContainer: AwilixContainer<ContainerServices>;
  }
}
