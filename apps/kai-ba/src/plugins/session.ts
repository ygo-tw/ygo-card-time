import fp from 'fastify-plugin';
import fastifySecureSession from '@fastify/secure-session';
import { FastifyPluginAsync } from 'fastify';

// @fastify/secure-session 官方說明 https://github.com/fastify/fastify-secure-session

// 定義 SessionData 類型
declare module '@fastify/secure-session' {
  interface SessionData {
    data: string;
  }
}

export default fp<FastifyPluginAsync>(
  async fastify => {
    fastify.register(fastifySecureSession, {
      cookieName: 'session',
      key: Buffer.from(
        '4fe91796c30bd989d95b62dc46c7c3ba0b6aa2df2187400586a4121c54c53b85',
        'hex'
      ),
      expiry: 60, // 60秒
      cookie: {
        path: '/',
        secure: false, // 設置為 true 以使用 HTTPS
      },
    });
  },
  {
    name: 'session-plugin',
  }
);
