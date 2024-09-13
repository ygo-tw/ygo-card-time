import fp from 'fastify-plugin';
import { asFunction, createContainer } from 'awilix';
import { DataAccessService } from '@ygo/mongo-server';
import { RedisClients } from '../services/cacheService/type/cache.type';
import { DataCacheService } from '../services/cacheService';

export default fp(
  async fastify => {
    const container = createContainer();
    const mongodbUrl = `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;
    // cache
    const redisClients: RedisClients = {
      read: fastify.redis.read,
      write: fastify.redis.write,
    };

    container.register({
      dal: asFunction(() => {
        return new DataAccessService(mongodbUrl);
      }).singleton(),
      cache: asFunction(() => {
        return new DataCacheService(fastify.log, redisClients, {
          ENABLE_CACHE: process.env.ENABLE_CACHE === 'true',
          ENABLE_REDIS_CACHE: process.env.ENABLE_REDIS_CACHE === 'true',
          ENABLE_MEMORY_CACHE: process.env.ENABLE_MEMORY_CACHE === 'true',
          CACHE_PREFIX: process.env.KAI_BA_CACHE_PREFIX ?? 'kAI_BA',
          REDIS_DEFAULT_TTL_SECONDS:
            Number(process.env.KAI_BA_REDIS_DEFAULT_TTL_SECONDS) ?? 86400,
        });
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
