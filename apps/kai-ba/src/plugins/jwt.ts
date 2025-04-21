// plugins/jwt.ts
import fp from 'fastify-plugin';
import fjwt from '@fastify/jwt';

export default fp(
  async fastify => {
    fastify.register(fjwt, {
      secret: process.env.JWT_SECRET || 'my-jwt-secret',
      sign: {
        expiresIn: '1d',
      },
      messages: {
        badRequestErrorMessage: '格式錯誤', // 400
        noAuthorizationInHeaderMessage: '缺少授權標頭', // 401
        authorizationTokenExpiredMessage: '授權已過期',
        authorizationTokenInvalid: '無效的授權',
      },
      cookie: {
        cookieName: 'sid',
        signed: true,
      },
    });
  },
  {
    name: 'jwt',
    dependencies: ['cookie'],
  }
);
