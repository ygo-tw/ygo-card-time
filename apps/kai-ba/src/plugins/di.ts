import fp from 'fastify-plugin';
import { asClass, createContainer } from 'awilix';
import { DataAccessService } from '@ygo/mongo-server';

export default fp(
  // 可以分不同情況，實踐不同的 di
  async fastify => {
    const container = createContainer();

    container.register({
      dal: asClass(DataAccessService).singleton(),
    });

    fastify.decorateRequest('diContainer', null);
    fastify.addHook('onRequest', (request, _, done) => {
      request.diContainer = container.createScope();
      done();
    });
  },
  {
    name: 'di',
  }
);
