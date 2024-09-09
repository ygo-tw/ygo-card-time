import fp from 'fastify-plugin';
import { asFunction, createContainer } from 'awilix';
import { DataAccessService } from '@ygo/mongo-server';

export default fp(
  async fastify => {
    const container = createContainer();

    container.register({
      mongoUrl: asFunction(() => {
        return `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;
      }).singleton(),
      dal: asFunction(cradle => {
        return new DataAccessService(cradle.mongoUrl);
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
  }
);
