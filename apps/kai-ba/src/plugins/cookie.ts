import fp from 'fastify-plugin';
import cookie, { FastifyCookieOptions } from '@fastify/cookie';

// @fastify-cookie 官方說明 https://github.com/fastify/fastify-cookie

export default fp(
  async (fastify, opts: FastifyCookieOptions) => {
    fastify.register(cookie, {
      secret: opts.secret || 'my-secret', // 用於簽名 cookie 的密鑰
      parseOptions: opts.parseOptions || {}, // 用於解析 cookie 的選項
    });
  },
  {
    name: 'cookie-plugin',
  }
);
