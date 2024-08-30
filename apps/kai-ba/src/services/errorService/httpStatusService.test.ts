import {
  HttpStatusError,
  ClientError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  ServerError,
  NotImplementedError,
} from './httpStatusService';

describe('HttpStatusError', () => {
  it('should create an instance with valid status and messages', () => {
    const status = 200;
    const logMsg = 'Log message';
    const clientMsg = 'Client message';

    const error = new HttpStatusError(status, logMsg, clientMsg);

    expect(error).toBeInstanceOf(HttpStatusError);
    expect(error.status).toBe(status);
    expect(error.logMsg).toBe(logMsg);
    expect(error.clientMsg).toBe(clientMsg);
  });

  it('should initialize with a custom client message when provided', () => {
    const clientMsg = 'Custom error message';
    const error = new ClientError(clientMsg);

    expect(error.clientMsg).toBe('Custom error message / Resource not found');
    expect(error.status).toBe(400);
  });

  it('should set status to 401 and append " / Unauthorized" to clientMsg when instantiated', () => {
    const clientMsg = 'Access denied';
    const error = new UnauthorizedError(clientMsg);

    expect(error.status).toBe(401);
    expect(error.clientMsg).toBe('Access denied / Unauthorized');
  });

  it('should set status to 404 and append " / Resource not found" to clientMsg when instantiated', () => {
    const clientMsg = 'Resource not found';
    const error = new NotFoundError(clientMsg);

    expect(error.status).toBe(404);
    expect(error.clientMsg).toBe('Resource not found / Resource not found');
  });

  it('should set status to 409 and append " / Resource already exists" to clientMsg when instantiated', () => {
    const clientMsg = 'Resource already exists';
    const error = new ConflictError(clientMsg);

    expect(error.status).toBe(409);
    expect(error.clientMsg).toBe(
      'Resource already exists / Resource already exists'
    );
  });

  it('should set status to 500 and append " / Server error" to clientMsg when instantiated', () => {
    const clientMsg = 'Server error';
    const error = new ServerError(clientMsg);

    expect(error.status).toBe(500);
    expect(error.clientMsg).toBe('Server error / Server error');
  });

  it('should set status to 501 and append " / Not implemented" to clientMsg when instantiated', () => {
    const clientMsg = 'Not implemented';
    const error = new NotImplementedError(clientMsg);

    expect(error.status).toBe(501);
    expect(error.clientMsg).toBe('Not implemented / Not implemented');
  });
});
