import { FastifyPluginAsync } from 'fastify';
import { getBannerListSchema } from '../../../schema/blog/banner';
import { GetBannerListResponseType } from '@ygo/schemas';
import { getBannerListHandler } from '../../../handlers/blog/banner/custom';

const banner: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get<{
    Reply: GetBannerListResponseType;
  }>('/banner::list', { schema: getBannerListSchema }, getBannerListHandler);
};

export default banner;
