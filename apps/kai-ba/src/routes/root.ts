import { FastifyPluginAsync } from 'fastify';

const root: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get('/', async function (request) {
    request.log.info('hello world');
    const dal = request.diContainer.resolve('dal');
    const result = await dal.find('cards', { id: 'PAC1-JP008' });

    return { root: result };
  });
};

export default root;
