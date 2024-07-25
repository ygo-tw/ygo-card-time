import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import SwaggerUI from '@fastify/swagger-ui';
import { FastifyPluginAsync } from 'fastify';

export default fp<FastifyPluginAsync>(
  async fastify => {
    fastify.register(swagger, {
      swagger: {
        info: {
          title: 'Card Time',
          description: 'Api Document',
          version: '0.1.0',
        },
        externalDocs: {
          url: 'https://github.com/delvedor/fastify-example',
          description: 'Find more info here',
        },
        host: 'localhost:3000', // and your deployed url
        schemes: ['http', 'https'],
        consumes: ['application/json'],
        produces: ['application/json', 'text/html'],
        securityDefinitions: {
          Bearer: {
            type: 'apiKey',
            name: 'Bearer',
            in: 'header',
          },
          Csrf: {
            type: 'apiKey',
            name: 'x-csrf-token',
            in: 'header',
          },
        },
      },
    });

    await fastify.register(SwaggerUI, {
      routePrefix: '/documentation',
    });
  },
  {
    name: 'swagger-plugin',
  }
);
