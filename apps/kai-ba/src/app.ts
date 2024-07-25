import { join } from 'path';
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify';
import fastifyCompress from '@fastify/compress';
import { loadEnv } from './envRunner';

import { fastifyStatic, FastifyStaticOptions } from '@fastify/static';

// 讀取環境變數
loadEnv();

const fastifyStaticOptions: FastifyStaticOptions = {
  cacheControl: true,
  etag: true,
  lastModified: true,
  // maxAge: '3000000',
  prefix: '/',
  root: join(__dirname, 'public'),
  index: false,
};

export interface AppOptions
  extends FastifyServerOptions,
    Partial<AutoloadPluginOptions> {}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  fastify.register(fastifyStatic, fastifyStaticOptions);

  await fastify.register(fastifyCompress, { global: true });

  fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  });

  fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts,
  });
};

export default app;
export { app, options };
