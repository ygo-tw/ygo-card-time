import { RouteHandler } from 'fastify';
import { GetCardListRequestType, GetCardListResponseType } from '@ygo/schemas';
import { PageOrLimitError } from '../../../services/errorService/businessError';

/**
 * @description 取得卡片列表
 * @param {number} page - 頁碼
 * @param {number} limit - 每頁筆數
 * @param {GetCardListRequestType} filter - 過濾條件
 * @returns {GetCardListResponseType} 卡片列表
 */
export const getCardListHandler: RouteHandler<{
  Querystring: {
    page: number;
    limit: number;
  };
  Body: GetCardListRequestType;
  Reply: GetCardListResponseType;
}> = async (request, reply) => {
  const { page, limit } = request.query;
  const { filter } = request.body;

  if (!page || !limit) {
    throw new PageOrLimitError();
  }

  const cardService = request.diContainer.resolve('cardService');

  const cardListCount = await cardService.getCardListCount(filter);
  if (cardListCount === 0) {
    return reply.status(200).send({
      total: cardListCount,
      list: [],
    });
  }

  const cardList = await cardService.getCardList(filter, {
    page,
    limit,
  });

  return reply.status(200).send({
    total: cardListCount,
    list: cardList,
  });
};
