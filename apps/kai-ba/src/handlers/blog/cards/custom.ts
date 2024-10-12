import { RouteHandler } from 'fastify';
import { GetCardListRequestType, GetCardListResponseType } from '@ygo/schemas';
import { PageOrLimitError } from '../../../services/errorService/businessError';
import { CardService } from '../../../services/cardService';

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

  const cache = request.diContainer.resolve('cache');
  const cacheKey = cache.generateCacheKeyArray([
    'getCardList',
    { ...filter, page, limit },
  ]);

  const cardService = new CardService(
    request.diContainer.resolve('dal'),
    request.log
  );

  const getCardListCount = async () => {
    const result = await cardService.getCardListCount(filter);

    cache.set({
      keys: [...cacheKey, 'count'],
      value: result,
      useMemory: true,
      useRedis: true,
      memoryTTLSeconds: 5,
      redisTTLSeconds: 86400,
    });

    return result;
  };

  const cardListCount = (
    await cache.get({
      keys: [...cacheKey, 'count'],
      source: getCardListCount,
      useMemory: true,
      useRedis: true,
      memoryTTLSeconds: 5,
      redisTTLSeconds: 86400,
    })
  ).data;

  if (cardListCount === 0) {
    return reply.status(200).send({
      total: cardListCount,
      list: [],
    });
  }

  const getCardList = async () => {
    const result = await cardService.getCardList(filter, {
      page,
      limit,
    });

    cache.set({
      keys: [...cacheKey, 'result'],
      value: result,
      useMemory: true,
      useRedis: true,
      memoryTTLSeconds: 5,
      redisTTLSeconds: 86400,
    });

    return result;
  };

  const cardList = (
    await cache.get({
      keys: cacheKey,
      source: getCardList,
      useMemory: true,
      useRedis: true,
      memoryTTLSeconds: 5,
      redisTTLSeconds: 86400,
    })
  ).data;

  return reply.status(200).send({
    total: cardListCount,
    list: cardList,
  });
};
