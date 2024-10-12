import { ServerError } from '../../httpStatusService';

export class CardListCountError extends ServerError {
  constructor(filter: string) {
    super(`Card list count is error / filter: ${filter}`);
  }
}

export class GetCardListError extends ServerError {
  constructor(filter: string) {
    super(`Get card list is error / filter: ${filter}`);
  }
}
