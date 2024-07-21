import { FastifyPluginAsync, FastifyInstance } from 'fastify';
import fastifyAuth from '@fastify/auth';
import { verifyToken } from './../../handlers/auth';

const authWorkspaces: FastifyPluginAsync = async (
  fastify: FastifyInstance
): Promise<void> => {
  // curl -X GET http://localhost:3000/api/authTest/protected -H "Authorization: secret"
  fastify.register(fastifyAuth).after(() => {
    fastify.route({
      method: 'GET',
      url: '/authTest/protected',
      preHandler: fastify.auth([verifyToken]),
      handler: async () => {
        return { message: 'protected' };
      },
    });
  });
};

export default authWorkspaces;
