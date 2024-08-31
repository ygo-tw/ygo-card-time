import { createLogger, format, transports, Logger } from 'winston';
import stripAnsi from 'strip-ansi';
import gradient from 'gradient-string';
import path from 'path';
import fs from 'fs';

const { combine, timestamp, printf } = format;

const getLogPath = (
  startTime: Date,
  name: string,
  dirname?: string
): string => {
  const logDir =
    process.env.NODE_ENV === 'production'
      ? 'root/cron_job/log'
      : '../../log' + (dirname ? `/${dirname}` : '');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  const fileName = `${name}_${startTime.toDateString()}.log`;
  return path.join(logDir, 'rutenCrawlerPrice', fileName);
};

export class CustomLogger {
  private logger: Logger;
  private startTime: Date;

  constructor(dir?: string) {
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
          filename: getLogPath(this.startTime, 'combined', dir),
          format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            this.fileFormat()
          ),
        }),
      ],
      exceptionHandlers: [
        new transports.File({
          filename: getLogPath(this.startTime, 'exception', dir),
          format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            this.fileFormat()
          ),
        }),
      ],
      exitOnError: false, // 設置為 false 以防止例外退出
    });
  }

  /**
   * 自定義控制台格式，用於輸出到控制台的日誌
   * @returns 格式化函數
   */
  private consoleFormat() {
    return printf(info => {
      const message = `${info.timestamp} [${info.level}]: ${info.message}`;
      return info.level === 'info' ? gradient.rainbow(message) : message;
    });
  }

  /**
   * 自定義文件格式，用於輸出到文件的日誌
   * @returns 格式化函數
   */
  private fileFormat() {
    return printf(info => {
      const cleanMessage = stripAnsi(
        `${info.timestamp} [${info.level}]: ${info.message}`
      );
      return cleanMessage;
    });
  }

  /**
   * 格式化日誌訊息
   * @param messages 多個訊息參數
   * @returns 格式化後的單一訊息字串
   */
  private formatMessage(...messages: string[]): string {
    return messages.join(' ');
  }

  /**
   * 記錄 info 等級的日誌
   * @param messages 多個訊息參數
   */
  public info(...messages: string[]) {
    this.logger.info(this.formatMessage(...messages));
  }

  /**
   * 記錄 error 等級的日誌
   * @param messages 多個訊息參數
   */
  public error(...messages: string[]) {
    this.logger.error(this.formatMessage(...messages));
  }

  /**
   * 記錄 warn 等級的日誌
   * @param messages 多個訊息參數
   */
  public warn(...messages: string[]) {
    this.logger.warn(this.formatMessage(...messages));
  }

  /**
   * 記錄 debug 等級的日誌
   * @param messages 多個訊息參數
   */
  public debug(...messages: string[]) {
    this.logger.debug(this.formatMessage(...messages));
  }
}
