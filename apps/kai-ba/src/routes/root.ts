import { FastifyPluginAsync } from 'fastify';

const root: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get('/', async function (request) {
    request.log.info('hello world');
    const dal = request.diContainer.resolve('dal');
    const result = await dal.find('cards', { id: 'PAC1-JP008' });

    const cache = request.diContainer.resolve('cache');
    const cacheParams = await cache.set({
      keys: ['test'],
      value: result,
      useMemory: true,
      useRedis: true,
      memoryTTLSeconds: 100,
      redisTTLSeconds: 86400,
    });

    return { root: cacheParams };
  });

  fastify.get('/get', async function (request) {
    request.log.info('hello world');

    const cache = request.diContainer.resolve('cache');
    const cacheParams = await cache.get({
      keys: ['test'],
      source: async () => {
        return 'redis';
      },
      useMemory: true,
      useRedis: true,
      memoryTTLSeconds: 100,
      redisTTLSeconds: 86400,
    });

    return { root: cacheParams };
  });
};

export default root;
