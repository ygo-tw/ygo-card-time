import { FastifyPluginAsync, FastifyInstance } from 'fastify';
import fastifySecureSession from '@fastify/secure-session';

// @fastify/secure-session 官方說明 https://github.com/fastify/fastify-secure-session
declare module '@fastify/secure-session' {
  interface SessionData {
    data: string;
  }
}

const sessionWorkspaces: FastifyPluginAsync = async (
  fastify: FastifyInstance
): Promise<void> => {
  fastify.register(fastifySecureSession, {
    cookieName: 'session',
    key: Buffer.from(
      '4fe91796c30bd989d95b62dc46c7c3ba0b6aa2df2187400586a4121c54c53b85',
      'hex'
    ),
    expiry: 60, // 60秒
    cookie: {
      path: '/',
      secure: false, // 設為 true 以使用 HTTPS
    },
  });

  // http://localhost:3000/api/set-session
  fastify.get('/set-session', (request, reply) => {
    const body = { data: 'example data' };
    request.session.set('data', body.data);
    reply.send('Session set');
  });

  // http://localhost:3000/api/get-session
  fastify.get('/get-session', (request, reply) => {
    const sessionData = request.session.get('data');
    if (!sessionData) {
      reply.code(404).send();
      return;
    }
    reply.send(sessionData);
  });

  // http://localhost:3000/api/clear-session
  fastify.get('/clear-session', (request, reply) => {
    request.session.delete();
    reply.send('Session deleted');
  });
};

export default sessionWorkspaces;
