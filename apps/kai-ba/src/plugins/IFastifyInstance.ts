import { AnySchema, Options } from 'ajv/dist/core';
import { FastifyBaseLogger } from 'fastify';
import { JWTPayload } from '../Interface/auth.type';
import { AuthService } from '../services/auth/auth.service';

declare module 'fastify' {
  interface FastifyInstance {
    dependenciesSchemas: AnySchema[];
    authService: AuthService;
    ajvFactory: (
      schemas: AnySchema[],
      option: Options | null,
      log?: FastifyBaseLogger
    ) => any;
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<JWTPayload>;
    authorizeRoles: (
      roles: string[]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
