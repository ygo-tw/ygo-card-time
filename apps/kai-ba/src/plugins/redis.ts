import fastifyRedis, { FastifyRedisPluginOptions } from '@fastify/redis';
import fp from 'fastify-plugin';

export default fp<FastifyRedisPluginOptions>(
  async fastify => {
    fastify.log.trace('plugins/redis: start');

    if (process.env.ENABLE_REDIS === 'false') {
      fastify.log.warn('plugins/redis: disabled (ENABLE_REDIS === false)');
      fastify.log.trace('plugins/redis: done');
      return;
    }
    const readConnectionString = process.env.REDIS_CONNECTION_STRING_READ;
    const writeConnectionString = process.env.REDIS_CONNECTION_STRING_WRITE;
    if (!readConnectionString || !writeConnectionString) {
      fastify.log.warn(`plugins/redis: disabled (no connstr)`);
      fastify.log.trace('plugins/redis: done');
      return;
    }

    fastify
      .register(fastifyRedis, getOptions(readConnectionString, 'read'))
      .register(fastifyRedis, getOptions(writeConnectionString, 'write'));

    fastify.log.trace('plugins/redis: done');
  },
  {
    name: 'redis',
  }
);

function getOptions(
  conn: string,
  namespace: string
): FastifyRedisPluginOptions {
  const url =
    conn.startsWith('redis://') || conn.startsWith('rediss://')
      ? conn
      : `redis://${conn}`;

  return {
    url,
    namespace,
    retryStrategy(times) {
      // reconnect after 0.04, 0.16, ~ 2 seconds
      const delayMS = Math.min(Math.pow(times / 5, 2), 2) * 1000;
      return delayMS;
    },
  };
}
