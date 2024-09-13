import fp from 'fastify-plugin';
import { asFunction, createContainer } from 'awilix';
import { DataAccessService } from '@ygo/mongo-server';

export default fp(
  async fastify => {
    const container = createContainer();
    const mongodbUrl = `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;
    // cache

    container.register({
      dal: asFunction(() => {
        return new DataAccessService(mongodbUrl);
      }).singleton(),
    });

    fastify.decorateRequest('diContainer', null);
    fastify.addHook('onRequest', (request, _, done) => {
      request.diContainer = container.createScope();
      done();
    });
  },
  {
    name: 'di',
    dependencies: ['redis'],
  }
);
