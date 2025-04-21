import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { FastifyPluginAsync } from 'fastify';

export default fp<FastifyPluginAsync>(
  async fastify => {
    // 先註冊 swagger schema
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'Card Time',
          description: 'Api Document',
          version: '0.1.0',
        },
        servers: [
          {
            url: 'http://localhost:3000',
            description: 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            Bearer: {
              type: 'apiKey',
              name: 'Authorization',
              in: 'header',
            },
            Csrf: {
              type: 'apiKey',
              name: 'x-csrf-token',
              in: 'header',
            },
          },
        },
      },
    });

    // 然後註冊 swagger UI
    await fastify.register(swaggerUI, {
      routePrefix: '/swagger',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
      staticCSP: true,
    });
  },
  {
    name: 'swagger',
    dependencies: ['schema'],
  }
);
