import { createLogger, format, transports, Logger } from 'winston';
import stripAnsi from 'strip-ansi';
import gradient from 'gradient-string';

const { combine, timestamp, printf } = format;

export class CustomLogger {
  private logger: Logger;
  private startTime: Date;

  constructor() {
    this.startTime = new Date();

    this.logger = createLogger({
      level: 'info',
      format: timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // 基本格式
      transports: [
        new transports.Console({
          format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            this.consoleFormat()
          ),
        }),
        new transports.File({
          filename: `../../log/rutenCrawlerPrice/combined_${this.startTime.toDateString()}.log`,
          format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            this.fileFormat()
          ),
        }),
      ],
      exceptionHandlers: [
        new transports.File({
          filename: `../../log/rutenCrawlerPrice/exceptions_${this.startTime.toDateString()}.log`,
          format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            this.fileFormat()
          ),
        }),
      ],
      exitOnError: false, // 設置為 false 以防止例外退出
    });
  }

  private consoleFormat() {
    return printf(info => {
      const message = `${info.timestamp} [${info.level}]: ${info.message}`;
      return info.level === 'info' ? gradient.rainbow(message) : message;
    });
  }

  private fileFormat() {
    return printf(info => {
      const cleanMessage = stripAnsi(
        `${info.timestamp} [${info.level}]: ${info.message}`
      );
      return cleanMessage;
    });
  }

  private formatMessage(...messages: string[]): string {
    return messages.join(' ');
  }

  public info(...messages: string[]) {
    this.logger.info(this.formatMessage(...messages));
  }

  public error(...messages: string[]) {
    this.logger.error(this.formatMessage(...messages));
  }

  public warn(...messages: string[]) {
    this.logger.warn(this.formatMessage(...messages));
  }

  public debug(...messages: string[]) {
    this.logger.debug(this.formatMessage(...messages));
  }
}
