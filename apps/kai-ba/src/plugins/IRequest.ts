import { DataAccessService } from '@ygo/mongo-server';
import { UserInfo } from '../Interface/auth.type';
import { ValidateCompiler } from './validateCompiler';

declare module 'fastify' {
  interface FastifyRequest {
    daService: DataAccessService;
    userInfo?: UserInfo;
    validateCompiler: ValidateCompiler;
  }
}
