import { onResponseHookHandler, RouteHandler } from 'fastify';
import { GetCardListRequestType, GetCardListResponseType } from '@ygo/schemas';

export const getCardListHandler: RouteHandler<{
  Querystring: {
    page: number;
    limit: number;
  } & GetCardListRequestType;
  Reply: GetCardListResponseType;
}> = async (request, reply) => {
  const cardService = request.diContainer.resolve('cardService');
  const { page, limit, ...filter } = request.query;
  const result = await cardService.getCardList(filter, {
    page,
    limit,
  });

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

  // 使用 process.nextTick 而不是 setTimeout
  process.nextTick(() => {
    cardService
      .updateCacheSetKey(filter)
      .then(() => {
        request.log.info(`更新緩存成功`);
      })
      .catch(err => request.log.error(`更新緩存失敗: ${err.message}`));
  });

  done();
};
