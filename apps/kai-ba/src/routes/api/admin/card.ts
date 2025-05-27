import { FastifyPluginAsync } from 'fastify';
import { getCardListSchema } from '../../../schema/admin/cards';
import * as custom from '../../../handlers/admin/cards/custom';
import { GetCardListRequestType, GetCardListResponseType } from '@ygo/schemas';
const cards: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get<{
    Querystring: { page: number; limit: number } & GetCardListRequestType;
    Reply: GetCardListResponseType;
  }>(
    '/card::list',
    { schema: getCardListSchema, onResponse: custom.onGetCardListResponse },
    custom.getCardListHandler
  );
};

export default cards;
