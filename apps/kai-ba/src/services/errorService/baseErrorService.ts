import { FastifyError } from 'fastify';

export class BaseError extends Error implements FastifyError {
  public status: number;
  public logMsg: string;
  public clientMsg: string;
  public code: string;
  public name: string;
  public validation?: any;

  constructor(
    status: number,
    logMsg: string,
    clientMsg: string,
    code: string = 'INTERNAL_ERROR'
  ) {
    super(clientMsg);
    this.status = status;
    this.logMsg = logMsg;
    this.clientMsg = clientMsg;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
