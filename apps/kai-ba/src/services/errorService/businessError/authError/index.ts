import {
  NotFoundError,
  UnauthorizedError,
  ClientError,
} from '../../httpStatusService';

export class UserNotFoundError extends NotFoundError {
  constructor(account: string) {
    super(`User not found / account: ${account}`);
  }
}

export class PasswordNotValidError extends UnauthorizedError {
  constructor(account: string) {
    super(`Password not valid / account: ${account}`);
  }
}

export class LoginError extends ClientError {
  constructor(account: string) {
    super(`Login failed / account: ${account}`);
  }
}
