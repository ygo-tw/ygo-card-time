import { FastifyPluginAsync } from 'fastify';
import { getCardListSchema } from '../../schema/blog/cards';
import * as custom from '../../handlers/blog/cards/custom';
import { GetCardListRequestType, GetCardListResponseType } from '@ygo/schemas';
const cards: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{
    Querystring: { page: number; limit: number };
    Body: GetCardListRequestType;
    Reply: GetCardListResponseType;
  }>(
    '/card/list',
    { schema: getCardListSchema, onResponse: custom.onGetCardListResponse },
    custom.getCardListHandler
  );
};

export default cards;
