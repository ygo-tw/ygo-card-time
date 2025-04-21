'use strict';
import Ajv2020 from 'ajv/dist/2020';
import { AnySchema, AnyValidateFunction, Options } from 'ajv/dist/core';
import ajvErrors from 'ajv-errors';
import addFormats from 'ajv-formats';
import { FastifyBaseLogger, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export interface FastifyValidateCompilerOptions {
  enableTransform?: boolean;
}

export const defaultAjvOptions: Options = {
  coerceTypes: true,
  strict: false,
  allowUnionTypes: true,
  verbose: false,
  allErrors: true,
  allowMatchingProperties: true,
};

export class ValidateCompiler {
  private ajvInstance: Ajv2020;
  private logger: FastifyBaseLogger;
  public validators: Map<string, AnyValidateFunction | undefined> = new Map();

  constructor(log: FastifyBaseLogger, schemas: AnySchema[]) {
    this.logger = log;
    this.ajvInstance = this.ajvFactory(schemas, null);
  }

  /**
   * 產生一個 ajv 實例
   * @param schemas dependencies schemas
   * @param option ajv 設定
   * @param logger fastify logger
   * @returns ajvInstance
   */
  public ajvFactory(
    schemas: AnySchema[],
    option: Options | null,
    logger?: FastifyBaseLogger
  ) {
    if (logger) this.logger = logger;
    this.logger.trace('plugins/validator/ajvFactory: start');
    const ajvInstance = new Ajv2020(option ?? { ...defaultAjvOptions });
    addFormats(ajvInstance);
    ajvErrors(ajvInstance);
    Object.keys(schemas).forEach(key => {
      const schema = (schemas as never)[key];
      try {
        ajvInstance.addSchema(schema);
      } catch (ex) {
        try {
          const jsonSchema = JSON.parse(schema);
          this.logger.error(
            'plugin/validator/ajv.addSchema.$id: %s',
            jsonSchema.$id
          );
        } catch (ex2) {
          this.logger.error(
            'plugin/validator/ajv.addSchema/trycatch:schema: %s',
            JSON.stringify(schema)
          );
        }
        throw ex;
      }
    });
    this.logger.trace('plugins/validator/ajvFactory: done');
    return ajvInstance;
  }

  /**
   * 回傳對應的 validate function
   * @param schema 檢查目標( $id)
   * @returns (validator | false)
   */
  public getValidator(schema: string) {
    if (!this.validators.has(schema)) {
      const existValidateFunction = this.ajvInstance.getSchema(schema);
      this.validators.set(schema, existValidateFunction);
    }
    return this.validators.get(schema);
  }
}

export default fp<FastifyValidateCompilerOptions>(
  (fastify: FastifyInstance, _, done) => {
    fastify.log.trace('plugins/validateCompiler: start');
    const validateCompiler = new ValidateCompiler(
      fastify.log,
      fastify.dependenciesSchemas
    );
    fastify.decorate('ajvFactory', validateCompiler.ajvFactory);
    fastify.log.trace('plugins/validateCompiler: done');
    done();
  },
  { name: 'validateCompiler', dependencies: ['schema'] }
);
