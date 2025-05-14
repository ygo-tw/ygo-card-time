import {
  NotFoundError,
  UnauthorizedError,
  ClientError,
  ForbiddenError,
} from '../../httpStatus.service';

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

export class AuthForbiddenError extends ForbiddenError {
  constructor(account: string) {
    super(`Auth forbidden / account: ${account}`);
  }
}
