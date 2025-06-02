import fp from 'fastify-plugin';
import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTPayload } from '../Interface/auth.type';
import {
  AuthForbiddenError,
  AuthError,
  AUTH_ERROR_MESSAGES,
} from '../services/error/business';

export default fp(
  async fastify => {
    fastify.decorate(
      'authenticate',
      async function (request: FastifyRequest, reply: FastifyReply) {
        const accessToken = request.cookies.accessToken;
        if (accessToken) {
          const isBlacklisted = await fastify.redis.exists(
            `jwt_blacklist:${accessToken}`
          );
          if (isBlacklisted) {
            throw new AuthError(AUTH_ERROR_MESSAGES.TOKEN_REVOKED);
          }
        }

        try {
          //JWT 驗證（會在 token 無效/過期/不存在時拋錯）
          const decoded = await request.jwtVerify<JWTPayload>();
          request.userInfo = decoded;
          return decoded;
        } catch (jwtError) {
          const signedRefreshToken = request.cookies.refreshToken;
          let refreshToken: string | undefined;

          if (signedRefreshToken) {
            const unsigned = request.unsignCookie(signedRefreshToken);
            refreshToken = unsigned.valid ? unsigned.value : undefined;
          }

          if (!refreshToken) {
            clearAuthCookies(
              reply,
              AUTH_ERROR_MESSAGES.AUTHENTICATION_REQUIRED
            );
          } else {
            try {
              const userInfo = await fastify.authService.refreshAccessToken(
                reply,
                refreshToken
              );
              request.userInfo = userInfo;
              return userInfo;
            } catch (refreshError) {
              clearAuthCookies(reply, AUTH_ERROR_MESSAGES.SESSION_EXPIRED);
            }
          }
        }
      }
    );

    fastify.decorate('authorizeRoles', function (roles: string[]) {
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

/**
 * 清除認證相關 cookie 並拋出錯誤
 * @param reply FastifyReply
 * @param errorMessage 錯誤訊息
 */
function clearAuthCookies(reply: FastifyReply, errorMessage: string): never {
  reply.clearCookie('accessToken');
  reply.clearCookie('refreshToken');

  throw new AuthError(errorMessage);
}
