import fp from 'fastify-plugin';
import { asFunction, createContainer } from 'awilix';
import { DataAccessService } from '@ygo/mongo-server';
import { DataCacheService, RedisClients } from '@ygo/cache';
import { CardService } from '../services/cardService';
import { AuthService } from '../services/authService';

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
      cardService: asFunction(cradle => {
        return new CardService(cradle.dal, fastify.log);
      }).singleton(),
      authService: asFunction(cradle => {
        return new AuthService(cradle.dal, fastify.log);
      }).singleton(),
    });

    fastify.decorateRequest('diContainer', {
      getter: () => container.createScope(),
    });
  },
  { name: 'di', dependencies: ['redis'] }
);
