import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { BaseError } from '../services/error/baseError.service';

export default fp(
  async function (fastify: FastifyInstance) {
    fastify.setErrorHandler((error: BaseError, _, reply) => {
      const errorName = error.constructor.name ?? 'UnknownError';
      const statusCode = error.status ?? 500;

      fastify.log.error(
        `${error.logMsg ?? JSON.stringify(error)} | ${errorName} |${statusCode}`
      );

      reply.status(statusCode).send({
        errorCodes: statusCode,
        message: error.clientMsg ?? JSON.stringify(error),
        data: null,
      });
    });
  },
  {
    name: 'error',
  }
);
