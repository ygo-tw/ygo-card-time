import { AnySchema, Options } from 'ajv/dist/core';
import { FastifyBaseLogger } from 'fastify';
import { JWTPayload } from '../Interface/auth.type';

declare module 'fastify' {
  interface FastifyInstance {
    dependenciesSchemas: AnySchema[];
    ajvFactory: (
      schemas: AnySchema[],
      option: Options | null,
      log?: FastifyBaseLogger
    ) => any;
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<JWTPayload>;
  }
}
