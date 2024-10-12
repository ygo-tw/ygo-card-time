'use strict';

import * as allSchemas from '@ygo/schemas';
import { AnySchema } from 'ajv';
import fp from 'fastify-plugin';
import * as lodash from 'lodash';

export interface FastifySchemaOptions {
  enableTransform?: boolean;
}

export default fp<FastifySchemaOptions>(
  (fastify, _, done) => {
    const dependenciesSchemas: AnySchema[] = [];
    fastify.log.trace('plugins/schema: start');
    const schemas = allSchemas.pluginUse;
    for (const item in schemas) {
      const key = item as keyof typeof schemas;
      try {
        if (Array.isArray(schemas[key])) {
          if (!('$id' in schemas[key])) continue;
        }
        if (key.includes('example')) continue;
        fastify.addSchema(lodash.cloneDeep(schemas[key]));
        dependenciesSchemas.push(lodash.cloneDeep(schemas[key]) as AnySchema);
      } catch (ex) {
        fastify.log.error('plugin/schema/addNeoSchema: %s', key);
        throw ex;
      }
    }
    fastify.decorate('dependenciesSchemas', dependenciesSchemas);
    fastify.log.trace('plugins/schema: done');
    done();
  },
  {
    name: 'schema',
  }
);
