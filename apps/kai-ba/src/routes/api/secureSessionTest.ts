import { FastifyPluginAsync, FastifyInstance } from 'fastify';

const sessionWorkspaces: FastifyPluginAsync = async (
  fastify: FastifyInstance
): Promise<void> => {
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
