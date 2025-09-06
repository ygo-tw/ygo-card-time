import { RouteHandler } from 'fastify';
import { GetBannerListResponseType } from '@ygo/schemas';

export const getBannerListHandler: RouteHandler<{
  Reply: GetBannerListResponseType;
}> = async (request, reply) => {
  console.log(request, reply);
  throw new Error('Not implemented');
};
