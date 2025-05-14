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
  };
  Body: GetCardListRequestType;
  Reply: GetCardListResponseType;
}> = async (request, reply) => {
  const cardService = request.diContainer.resolve('cardService');

  const result = await cardService.getCardList(
    request.body,
    {
      page: request.query.page,
      limit: request.query.limit,
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
  // 使用類型斷言來取得正確類型的 request.body
  const body = request.body as GetCardListRequestType;
  const cardService = request.diContainer.resolve('cardService');

  // 使用 process.nextTick 而不是 setTimeout
  process.nextTick(() => {
    cardService
      .updateCacheSetKey(body)
      .then(() => {
        request.log.info(`更新緩存成功`);
      })
      .catch(err => request.log.error(`更新緩存失敗: ${err.message}`));
  });

  done();
};
