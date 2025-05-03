import { FastifyPluginAsync } from 'fastify';

const root: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get('/_hc', function () {
    return {
      msg: 'ok',
    };
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

  fastify.get('/redis-stats', {
    preHandler: fastify.authenticate, // 使用你的 authenticate 中間件
    schema: {
      summary: 'Redis 統計信息',
      description: '獲取 Redis 伺服器統計信息，包括命中率',
      response: {
        200: {
          type: 'object',
          properties: {
            hit_rate: { type: 'string' },
            keyspace_hits: { type: 'string' },
            keyspace_misses: { type: 'string' },
            connected_clients: { type: 'string' },
            used_memory_human: { type: 'string' },
            // 可以添加更多你關心的屬性
          },
          additionalProperties: true,
        },
      },
    },
    handler: async (request, reply) => {
      if (!request.userInfo?.role?.includes('member')) {
        return reply.code(403).send({ error: '無權限' });
      }
      // 取得 Redis 統計信息
      const redisInfo = request.diContainer.resolve('cache').getRedisInfo();
      if (!redisInfo) {
        return reply.code(503).send({ error: 'Redis 服務不可用' });
      }

      return redisInfo;
    },
  });
};

export default root;
