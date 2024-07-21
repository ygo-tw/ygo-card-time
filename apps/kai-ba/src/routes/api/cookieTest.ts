import { FastifyPluginAsync, FastifyInstance } from 'fastify';
import cookie, { FastifyCookieOptions } from '@fastify/cookie';

// @fastify-cookie 官方說明 https://github.com/fastify/fastify-cookie

const cookieWorkspaces: FastifyPluginAsync = async (
  fastify: FastifyInstance
): Promise<void> => {
  // 用於簽名 cookie 的密鑰
  fastify.register(cookie, {
    secret: 'my-secret', // 用於簽名 cookie 的密鑰
    parseOptions: {}, // 用於解析 cookie 的選項
  } as FastifyCookieOptions);

  // http://localhost:3000/api/set-cookie
  fastify.get('/set-cookie', (_request, reply) => {
    reply
      .setCookie('myCookie', 'cookieValue', {
        path: '/',
      })
      .send({ message: 'Cookies set' });
  });

  // http://localhost:3000/api/clear-cookie
  fastify.get('/clear-cookie', (_request, reply) => {
    reply
      .clearCookie('myCookie', { path: '/' })
      .send({ message: 'Cookies cleared' });
  });

  // http://localhost:3000/api/check-cookie
  fastify.get('/check-cookie', (request, reply) => {
    const cookieValue = request.cookies.myCookie;
    console.log(`Checked cookie value: ${cookieValue}`);
    reply.send({
      cookie: cookieValue,
    });
  });
};

export default cookieWorkspaces;
