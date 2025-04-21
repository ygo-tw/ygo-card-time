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

  // 在 root.ts 中添加一個新路由
  fastify.get(
    '/check-auth',
    {
      preHandler: fastify.authenticate, // 使用你的 authenticate 中間件
    },
    async function (request, reply) {
      try {
        // 如果能夠走到這裡，表示 JWT 驗證通過
        // 返回用戶信息
        return {
          authenticated: true,
          user: request.user,
        };
      } catch (error) {
        reply.status(401).send({
          authenticated: false,
          error: 'Token 無效或未提供',
        });
      }
    }
  );

  // 再添加一個不需要認證的路由，用於檢查請求頭和 cookies
  fastify.get('/debug-request', async function (request) {
    return {
      cookies: request.cookies, // 查看所有 cookies
      headers: request.headers, // 查看所有請求頭
      hasAuthHeader: !!request.headers.authorization, // 檢查 Authorization 頭
      jwt: request.headers.authorization
        ? request.headers.authorization.replace('Bearer ', '')
        : 'No JWT found in Authorization header',
    };
  });
};

export default root;
