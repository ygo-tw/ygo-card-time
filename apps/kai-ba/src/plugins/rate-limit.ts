import type { RateLimitPluginOptions } from '@fastify/rate-limit';
import rateLimit from '@fastify/rate-limit';
import { FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

export default fp<RateLimitPluginOptions>(
  async fastify => {
    fastify.log.trace('plugins/rate-limit: start');
    const rateLimitEnabled = process.env.RATE_LIMIT_ENABLED !== 'false'; // default true
    if (!rateLimitEnabled) {
      fastify.log.warn('plugins/rate-limit: disabled');
      fastify.log.trace('plugins/rate-limit: done');
      return;
    }
    // if (!fastify.redis.write) {
    //   fastify.log.warn(
    //     'plugins/rate-limit: redis is not ready, limit by each server self'
    //   );
    // }

    const timeWindow = process.env.RATE_LIMIT_TIME_WINDOW_SECONDS
      ? parseInt(process.env.RATE_LIMIT_TIME_WINDOW_SECONDS) * 1000
      : 1000 * 60;

    // 可以設定 maxCoef 來調整 max 的值
    const maxCoef = process.env.RATE_LIMIT_MAX_COEF
      ? parseInt(process.env.RATE_LIMIT_MAX_COEF)
      : 10;

    const options: RateLimitPluginOptions = {
      // global : false, // default true
      max: async (_: FastifyRequest, key: string) => {
        return maxCoef * (key.startsWith('UserId') ? 60 : 120);
      },
      // ban: 2, 														// default -1
      timeWindow, // default 1000 * 60
      // hook: 'preHandler', 											// default 'onRequest'
      // cache: 10000, 												// default 5000, cache size
      // allowList: ['127.0.0.1'], 									// default []
      // redis: fastify.redis.write, // default null
      nameSpace: 'RateLimit:', // default is 'fastify-rate-limit-'
      // continueExceeding: true, 									// default false
      // skipOnError: true, 											// default false
      keyGenerator: (request: FastifyRequest) => {
        let key = 'UserId:';
        if (request.userInfo?.userId) {
          key += request.userInfo?.userId;
        } else if (request.headers['x-real-ip']) {
          key = 'RealIP:' + request.headers['x-real-ip'];
        } else if (request.headers['x-forwarded-for']) {
          key = 'FwdFor:' + request.headers['x-forwarded-for'];
        } else {
          key = 'IP:' + request.ip;
        }
        request.log.debug('plugins/rate-limit: key: %s', key);
        return key;
      },
      errorResponseBuilder: (_: FastifyRequest, context) => {
        return {
          errorCode: 'RLE001',
          message: `Only allow ${context.max} requests per ${context.after} to this service. Try again soon.`,
          data: `Too many requests @ ${Date.now()}, expiresIn: ${context.ttl}ms`, // milliseconds
        };
      },
      // enableDraftSpec: true, 					// default false. Uses IEFT draft header standard
      addHeadersOnExceeding: {
        // default show all the response headers when rate limit is not reached
        'x-ratelimit-limit': true,
        'x-ratelimit-remaining': true,
        'x-ratelimit-reset': true,
      },
      addHeaders: {
        // default show all the response headers when rate limit is reached
        'x-ratelimit-limit': true,
        'x-ratelimit-remaining': true,
        'x-ratelimit-reset': true,
        'retry-after': true,
      },
      // onExceeding：在達到請求限制之前將執行的回調。
      // onExceeding: (request, context) => {},
      // onExceeded：達到請求限制後將執行的回呼。
      // onBanReach：達到禁止限制時將執行的回呼。
    };
    await fastify.register(rateLimit, options);
    fastify.log.trace('plugins/rate-limit: done');
  },
  {
    name: 'rate-limit',
    dependencies: ['redis'],
  }
);
