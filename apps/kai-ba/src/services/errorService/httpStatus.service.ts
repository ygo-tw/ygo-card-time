// errors/HttpStatusError.ts
import { BaseError } from './baseError.service';

export class HttpStatusError extends BaseError {
  constructor(status: number, logMsg: string = '', clientMsg: string = '') {
    super(status, logMsg, clientMsg);
  }
}

export class ClientError extends HttpStatusError {
  constructor(clientMsg: string) {
    super(400, '', `${clientMsg} / Resource not found`);
  }
}

export class UnauthorizedError extends HttpStatusError {
  constructor(clientMsg: string) {
    super(401, '', `${clientMsg} / Unauthorized`);
  }
}

export class NotFoundError extends HttpStatusError {
  constructor(clientMsg: string) {
    super(404, '', `${clientMsg} / Resource not found`);
  }
}

export class ConflictError extends HttpStatusError {
  constructor(clientMsg: string) {
    super(409, '', `${clientMsg} / Resource already exists`);
  }
}

export class ServerError extends HttpStatusError {
  constructor(clientMsg: string) {
    super(500, '', `${clientMsg} / Server error`);
  }
}

export class NotImplementedError extends HttpStatusError {
  constructor(clientMsg: string) {
    super(501, '', `${clientMsg} / Not implemented`);
  }
}
