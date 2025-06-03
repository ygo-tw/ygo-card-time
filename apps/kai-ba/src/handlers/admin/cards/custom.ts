import { onResponseHookHandler, RouteHandler } from 'fastify';
import { GetCardListRequestType, GetCardListResponseType } from '@ygo/schemas';

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
  } & GetCardListRequestType;
  Reply: GetCardListResponseType;
}> = async (request, reply) => {
  const cardService = request.diContainer.resolve('cardService');
  const { page, limit, ...filter } = request.query;
  const result = await cardService.getCardList(
    filter,
    {
      page,
      limit,
    },
    true
  );

  return reply.status(200).send({
    list: result.data,
    total: result.total,
  });
};

export const onGetCardListResponse: onResponseHookHandler = function (
  request,
  _,
  done
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { page, limit, ...filter } = request.query as {
    page: number;
    limit: number;
  } & GetCardListRequestType;
  const cardService = request.diContainer.resolve('cardService');

  process.nextTick(() => {
    cardService.updateCacheSetKey(filter).then(() => {
      request.log.info(`更新緩存結束`);
    });
  });

  done();
};
