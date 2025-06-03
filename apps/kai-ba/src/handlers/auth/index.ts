import { RouteHandler } from 'fastify';
import { LoginError } from '../../services/error/business';
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

export const logoutHandler: RouteHandler<{
  Reply: { success: boolean };
}> = async (request, reply) => {
  const authService = request.diContainer.resolve('authService');

  await authService.logout(request, reply);

  return reply.status(200).send({ success: true });
};
