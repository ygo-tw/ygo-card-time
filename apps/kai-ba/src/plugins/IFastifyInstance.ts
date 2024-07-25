import { AnySchema, Options } from 'ajv/dist/core';

import { FastifyBaseLogger } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    dependenciesSchemas: AnySchema[];
    ajvFactory: (
      schemas: AnySchema[],
      option: Options | null,
      log?: FastifyBaseLogger
    ) => any;
  }
}
