import { logoutSchema } from '../../../schema/auth/logout';
import { FastifyInstance } from 'fastify';
import { logoutHandler } from '../../../handlers/auth/index';

export default async function (fastify: FastifyInstance) {
  fastify.post(
    '/logout',
    {
      schema: logoutSchema,
    },
    logoutHandler
  );
}
