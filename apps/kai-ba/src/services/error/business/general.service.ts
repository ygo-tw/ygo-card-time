import { ClientError, ServerError } from '../httpStatus.service';

export class PageOrLimitError extends ClientError {
  constructor(clientMsg?: string) {
    super(clientMsg ?? 'Page and limit are required');
  }
}

export class TransectionFailedError extends ServerError {
  constructor(clientMsg?: string) {
    super(`${clientMsg} ; Transaction failed!`);
  }
}
