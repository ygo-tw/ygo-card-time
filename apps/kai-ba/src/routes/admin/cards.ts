import { FastifyPluginAsync } from 'fastify';
import { getCardListSchema } from '../../schema/admin/cards';
import * as custom from '../../handlers/admin/cards/custom';

const cards: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(
    '/list',
    { schema: getCardListSchema },
    custom.getCardListHandler
  );
};

export default cards;
