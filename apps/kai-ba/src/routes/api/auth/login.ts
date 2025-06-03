import { loginSchema } from '../../../schema/auth/login';
import { FastifyInstance } from 'fastify';
import { loginHandler } from '../../../handlers/auth/index';

export default async function (fastify: FastifyInstance) {
  fastify.post(
    '/login',
    {
      schema: loginSchema,
    },
    loginHandler
  );
}
