import fp from 'fastify-plugin';
import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTPayload } from '../Interface/auth.type';

export default fp(
  async fastify => {
    fastify.decorate(
      'authenticate',
      async function (request: FastifyRequest, reply: FastifyReply) {
        const decoded = await request.jwtVerify<JWTPayload>();

        // 檢查是否需要更新 token（距離過期少於 6 小時）
        const expiresIn = decoded.exp! - Math.floor(Date.now() / 1000);
        const SIX_HOURS_IN_SECONDS = 6 * 60 * 60;

        if (expiresIn < SIX_HOURS_IN_SECONDS) {
          const token = await reply.jwtSign({
            ...decoded,
          });

          reply.setCookie('sid', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
          });
        }

        request.user = decoded;
        return decoded;
      }
    );
  },
  {
    name: 'authenticate',
    dependencies: ['jwt'],
  }
);
