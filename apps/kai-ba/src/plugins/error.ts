import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { BaseError } from '../services/errorService/baseErrorService';

export default fp(
  async function (fastify: FastifyInstance) {
    fastify.setErrorHandler((error: BaseError, _, reply) => {
      const errorName = error.constructor.name ?? 'UnknownError';
      const statusCode = error.status ?? 500;

      fastify.log.error(
        `${error.logMsg ?? 'An unexpected error occurred'} | ${errorName} |${statusCode}`
      );

      reply.status(statusCode).send({
        error: error.clientMsg || 'An unexpected error occurred',
      });
    });
  },
  {
    name: 'error',
  }
);
