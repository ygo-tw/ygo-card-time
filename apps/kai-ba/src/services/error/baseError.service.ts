import { FastifyError } from 'fastify';

export class BaseError extends Error implements FastifyError {
  public name: string = this.constructor.name;

  constructor(
    public status: number = 500,
    public logMsg: string = '',
    public clientMsg: string = '',
    public code: string = 'INTERNAL_ERROR',
    public validation?: any
  ) {
    super(clientMsg);
    Error.captureStackTrace(this, this.constructor);
  }
}
