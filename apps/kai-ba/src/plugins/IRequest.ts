import { DataAccessService } from '@ygo/mongo-server';
import { UserInfo } from '../Interface/auth.type';
import { AwilixContainer } from 'awilix';
import { DataCacheService } from '@ygo/cache';
import { CardService } from '../services/cardService';
import { AuthService } from '../services/authService';
declare module 'awilix' {
  interface AwilixContainer {
    resolve<K extends keyof ContainerServices>(name: K): ContainerServices[K];
  }
}

// 後續有任何 service 請擴充於此
interface ContainerServices {
  dal: DataAccessService;
  cache: DataCacheService;
  cardService: CardService;
  authService: AuthService;
}

declare module 'fastify' {
  interface FastifyRequest {
    userInfo?: UserInfo;
    diContainer: AwilixContainer<ContainerServices>;
  }
}
