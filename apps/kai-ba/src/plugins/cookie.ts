import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';

// @fastify-cookie 官方說明 https://github.com/fastify/fastify-cookie

export default fp(
  async fastify => {
    fastify.register(cookie, {
      secret: process.env.COOKIE_SECRET || 'my-cookie-secret',
      parseOptions: {
        // 默認的 cookie 安全選項
        secure: process.env.NODE_ENV === 'production', // 生產環境強制 HTTPS
        httpOnly: true, // 防止 JavaScript 訪問
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // 防止 CSRF
        path: '/', // cookie 可訪問的路徑
      },
    });
  },
  {
    name: 'cookie',
  }
);
