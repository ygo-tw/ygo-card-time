import fp from 'fastify-plugin';
import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTPayload } from '../Interface/auth.type';
import { AuthForbiddenError } from '../services/error/business';

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

        request.userInfo = decoded;
        return decoded;
      }
    );

    fastify.decorate('authrizeRoles', function (roles: string[]) {
      return async function (request: FastifyRequest, reply: FastifyReply) {
        await fastify.authenticate(request, reply);

        const userRole = request.userInfo?.role || [];

        const hasRequiredRole = roles.some(role => userRole.includes(role));

        if (!hasRequiredRole) {
          throw new AuthForbiddenError(request.userInfo?.account ?? '');
        }
      };
    });
  },
  {
    name: 'authenticate',
    dependencies: ['jwt'],
  }
);
