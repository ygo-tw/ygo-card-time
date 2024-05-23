import { CustomLogger } from './logger'; // 請依據你的實際路徑調整
import * as winston from 'winston';
import stripAnsi from 'strip-ansi';
import gradient from 'gradient-string';

jest.mock('winston', () => {
  const mLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };
  const mockFormat = {
    transform: jest.fn(),
  };
  return {
    createLogger: jest.fn(() => mLogger),
    format: {
      combine: jest.fn(),
      timestamp: jest.fn(),
      printf: jest.fn(() => mockFormat),
    },
    transports: {
      Console: jest.fn(),
      File: jest.fn(),
    },
  };
});

jest.mock('strip-ansi', () => jest.fn(message => message));
jest.mock('gradient-string', () => ({
  rainbow: jest.fn(message => message),
}));

describe('CustomLogger', () => {
  let logger: CustomLogger;
  let winstonLogger: jest.Mocked<winston.Logger>;
  let mockConsoleFormat: jest.Mock;
  let mockFileFormat: jest.Mock;

  beforeEach(() => {
    logger = new CustomLogger();
    winstonLogger = (logger as any).logger;
    mockConsoleFormat = (winston.format.printf as jest.Mock).mock.results[0]
      .value.transform;
    mockFileFormat = (winston.format.printf as jest.Mock).mock.results[1].value
      .transform;
  });

  it('should create logger with correct transports and formats', () => {
    expect(winston.createLogger).toHaveBeenCalled();

    const calls = (winston.createLogger as jest.Mock).mock.calls[0][0];
    expect(calls.level).toBe('info');
    expect(calls.transports.length).toBe(2);
    expect(calls.exceptionHandlers.length).toBe(1);
  });

  it('should format messages correctly', () => {
    const message = logger['formatMessage']('Test', 'message');
    expect(message).toBe('Test message');
  });

  it('should format console messages with gradient for info level', () => {
    const info = {
      timestamp: '2024-05-23 12:34:56',
      level: 'info',
      message: 'Test console message',
    };
    mockConsoleFormat.mockImplementation((info: any) => {
      const message = `${info.timestamp} [${info.level}]: ${info.message}`;
      return gradient.rainbow(message);
    });
    const formattedMessage = mockConsoleFormat(info);
    const expectedMessage = `${info.timestamp} [${info.level}]: ${info.message}`;
    expect(formattedMessage).toBe(expectedMessage);
    expect(gradient.rainbow).toHaveBeenCalledWith(expectedMessage);
  });

  it('should format console messages without gradient for non-info level', () => {
    const info = {
      timestamp: '2024-05-23 12:34:56',
      level: 'error',
      message: 'Test console message',
    };
    mockConsoleFormat.mockImplementation((info: any) => {
      const message = `${info.timestamp} [${info.level}]: ${info.message}`;
      return info.level === 'info' ? gradient.rainbow(message) : message;
    });
    const formattedMessage = mockConsoleFormat(info);
    const expectedMessage = `${info.timestamp} [${info.level}]: ${info.message}`;
    expect(formattedMessage).toBe(expectedMessage);
  });

  it('should format file messages correctly', () => {
    const info = {
      timestamp: '2024-05-23 12:34:56',
      level: 'info',
      message: 'Test file message',
    };
    mockFileFormat.mockImplementation((info: any) => {
      const cleanMessage = stripAnsi(
        `${info.timestamp} [${info.level}]: ${info.message}`
      );
      return cleanMessage;
    });
    const formattedMessage = mockFileFormat(info);
    const expectedMessage = `${info.timestamp} [${info.level}]: ${info.message}`;
    expect(formattedMessage).toBe(expectedMessage);
    expect(stripAnsi).toHaveBeenCalledWith(expectedMessage);
  });

  it('should log info messages', () => {
    const message = 'Info message';
    logger.info(message);
    expect(winstonLogger.info).toHaveBeenCalledWith(message);
  });

  it('should log error messages', () => {
    const message = 'Error message';
    logger.error(message);
    expect(winstonLogger.error).toHaveBeenCalledWith(message);
  });

  it('should log warn messages', () => {
    const message = 'Warn message';
    logger.warn(message);
    expect(winstonLogger.warn).toHaveBeenCalledWith(message);
  });

  it('should log debug messages', () => {
    const message = 'Debug message';
    logger.debug(message);
    expect(winstonLogger.debug).toHaveBeenCalledWith(message);
  });
});
