import { FastifyPluginAsync } from 'fastify';

const root: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get('/', async function (request) {
    request.log.info('hello world');
    return { root: true };
  });
};

export default root;
