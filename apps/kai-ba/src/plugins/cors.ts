import fp from 'fastify-plugin';
import fastifyCors from '@fastify/cors';
import { FastifyPluginAsync } from 'fastify';

export default fp<FastifyPluginAsync>(
  async fastify => {
    fastify.register(fastifyCors, {
      origin: true,
      methods: ['GET', 'PUT', 'POST', 'DELETE'],
    });
  },
  {
    name: 'cors',
  }
);
