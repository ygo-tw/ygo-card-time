import { FastifyPluginAsync } from 'fastify';

const root: FastifyPluginAsync = async (fastify): Promise<void> => {
  // 健康檢查
  fastify.get('/_hc', function () {
    return {
      msg: 'ok',
    };
  });

  // 獲取 Redis 統計信息
  fastify.get('/redis-stats', {
    preHandler: fastify.authorizeRoles(['member']),
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
          },
          additionalProperties: true,
        },
      },
    },
    handler: async (request, reply) => {
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
