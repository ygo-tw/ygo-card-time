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

// 通用的認證錯誤類別
export class AuthError extends UnauthorizedError {
  constructor(message: string) {
    super(message);
  }
}

// 預定義的錯誤訊息常數
export const AUTH_ERROR_MESSAGES = {
  TOKEN_REVOKED: 'Token 已被撤銷，請重新登入',
  REFRESH_TOKEN_INVALID: 'Refresh token 無效或已過期',
  AUTHENTICATION_REQUIRED: '請重新登入',
  SESSION_EXPIRED: '登入已過期，請重新登入',
} as const;
