import { DataAccessService } from '@ygo/mongo-server';
import { UserInfo } from '../Interface/auth.type';
import { ValidateCompiler } from './validateCompiler';
import { AwilixContainer } from 'awilix';

declare module 'awilix' {
  interface AwilixContainer {
    resolve<K extends keyof ContainerServices>(name: K): ContainerServices[K];
  }
}

// 後續有任何 service 請擴充於此
interface ContainerServices {
  dal: DataAccessService;
}

declare module 'fastify' {
  interface FastifyRequest {
    daService: DataAccessService;
    userInfo?: UserInfo;
    validateCompiler: ValidateCompiler;
    diContainer: AwilixContainer<ContainerServices>;
  }
}
