import {
  NotFoundError,
  ClientError,
  ServerError,
} from '../../httpStatus.service';

export class CardNotFoundError extends NotFoundError {
  constructor(cardId: string) {
    super(`找不到卡片 ${cardId} Card not found: ${cardId}`);
  }
}

export class CardValidationError extends ClientError {
  constructor(message: string) {
    super(`卡片資料驗證失敗: ${message} Card validation error: ${message}`);
  }
}

export class CardCacheError extends ServerError {
  constructor(operation: string, details: string) {
    super(
      `卡片快取操作失敗: ${operation} Card cache operation failed: ${operation}, details: ${details}`
    );
  }
}

export class CardQueryError extends ServerError {
  constructor(queryType: string, details: string) {
    super(
      `卡片查詢失敗: ${queryType} Card query failed: ${queryType}, details: ${details}`
    );
  }
}
