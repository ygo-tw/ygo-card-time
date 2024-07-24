'use strict';

import Ajv2020 from 'ajv/dist/2020';
import { AnySchema, AnyValidateFunction } from 'ajv/dist/core';
import { FastifySchemaControllerOptions } from 'fastify/types/schema';
import fp from 'fastify-plugin';

import { defaultAjvOptions } from './validateCompiler';

export interface FastifyValidatorOptions {
  enable?: boolean; // 沒用到，只是為了 lint
}
interface CompilerValidationOptions {
  schema: AnySchema;
  method: string;
  url: string;
  httpPart: any;
}
interface SerializerOptions {
  schema: AnySchema;
  method: string;
  url: string;
  httpStatus: any;
  contentType: string;
}

interface ResponseValidationError extends Error {
  validation: AnyValidateFunction['errors'];
}

export default fp<FastifyValidatorOptions>(
  (fastify, _, done) => {
    fastify.log.trace('plugins/validator: start');
    let ajv: Ajv2020;
    const buildSerializer = (externalSchemas: any): any => {
      const serializerCompiler = (opts: SerializerOptions): any => {
        return (data: string) => {
          if (!ajv)
            ajv = fastify.ajvFactory(
              externalSchemas,
              {
                ...defaultAjvOptions,
              },
              fastify.log
            );
          const validate = ajv.compile(opts.schema);
          const isValid = validate(data);

          if (!isValid) {
            const error = new Error(
              'Response validation failed'
            ) as ResponseValidationError;
            error.validation = validate.errors;
            throw error;
          }

          return JSON.stringify(data);
        };
      };

      return serializerCompiler as any;
    };

    const controller: FastifySchemaControllerOptions = {
      compilersFactory: {
        buildValidator: (externalSchemas: AnySchema[]): any => {
          if (!ajv)
            ajv = fastify.ajvFactory(externalSchemas, null, fastify.log);
          const compilerValidator = (opts: CompilerValidationOptions) => {
            try {
              return ajv.compile(opts.schema);
            } catch (ex) {
              fastify.log.error(
                'plugin/validator/compile:opts.schema: %s',
                JSON.stringify(opts.schema)
              );
              throw ex;
            }
          };

          return compilerValidator as unknown as AnyValidateFunction<CompilerValidationOptions>;
        },
        /* 預設不會做 response validation */
        buildSerializer: (): any => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const serializerCompiler = (_opts: SerializerOptions): any => {
            return (data: string) => JSON.stringify(data);
          };

          return serializerCompiler as any;
        },
      },
    };
    // 預設 response validation 會被開啟，如果要關閉，請在 .env 設定 RESPONSE_VALIDATION=false
    if (process.env.RESPONSE_VALIDATION !== 'false') {
      controller.compilersFactory = controller.compilersFactory ?? {};
      controller.compilersFactory.buildSerializer = buildSerializer;
    } else {
      fastify.log.warn(
        'process.env.RESPONSE_VALIDATION: %s',
        process.env.RESPONSE_VALIDATION
      );
    }
    fastify.setSchemaController(controller);
    fastify.log.trace('plugins/validator: done');
    done();
  },
  {
    name: 'validator',
    dependencies: ['schema', 'validateCompiler'],
  }
);
