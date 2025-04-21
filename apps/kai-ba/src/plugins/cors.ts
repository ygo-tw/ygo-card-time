import fp from 'fastify-plugin';
import fastifyCors from '@fastify/cors';
import { FastifyPluginAsync } from 'fastify';

export default fp<FastifyPluginAsync>(
  async fastify => {
    fastify.register(fastifyCors, {
      origin: [
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://localhost:5500',
      ],
      credentials: true,
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Set-Cookie'],
    });
  },
  {
    name: 'cors',
  }
);
