import fp from 'fastify-plugin';
import fastifyAuth from '@fastify/auth';
import { FastifyPluginAsync } from 'fastify';

// @fastify-auth 官方說明 https://github.com/fastify/fastify-auth

export default fp<FastifyPluginAsync>(
  async fastify => {
    fastify.register(fastifyAuth);
  },
  {
    name: 'auth-plugin',
  }
);
