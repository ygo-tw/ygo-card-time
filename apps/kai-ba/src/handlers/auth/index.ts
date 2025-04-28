import { RouteHandler } from 'fastify';
import { LoginError } from '../../services/errorService/businessError/authError';
import { UserInfo } from '../../Interface/auth.type';
export const loginHandler: RouteHandler<{
  Body: { account: string; password: string };
  Reply: { message: string; user: UserInfo };
}> = async (request, reply) => {
  const { account, password } = request.body;

  const authService = request.diContainer.resolve('authService');

  const userInfo = await authService.login(reply, { account, password });

  if (!userInfo) {
    throw new LoginError(account);
  }

  return reply.status(200).send({ message: 'success', user: userInfo });
};
