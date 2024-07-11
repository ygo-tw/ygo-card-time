import { loadEnv } from './envRunner';
import closeWithGrace from 'close-with-grace';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

// 讀取環境變數
loadEnv();

const app = Fastify({
  logger: getLoggerSetting(process.env.NODE_ENV ?? 'development'),
  genReqId(req) {
    const reqId =
      req.headers['x-request-id'] && req.headers['x-request-id'] !== '-'
        ? req.headers['x-request-id']
        : null;
    const traceId =
      req.headers['n1-trace-id'] ??
      req.headers['traceId'] ??
      reqId ??
      uuidv4().substring(0, 6);
    req.headers['n1-trace-id'] = traceId.toString();
    return traceId.toString();
  },
});

app.register(import('./app'));

app.addHook('onSend', (req, res, _, done) => {
  res.header('n1-trace-id', req.headers['n1-trace-id']);
  done();
});

app.addHook('onClose', (_, done) => {
  gracefullyClose();
  done();
});

app.listen(
  { port: parseInt(process.env.PORT ?? '3000'), host: '0.0.0.0' },
  (err: Error | null) => {
    if (err) {
      app.log.fatal(err);
      process.exit(1);
    }
  }
);

process.on('uncaughtException', err => {
  app.log.fatal(
    `Fatal: server crashed because of uncaughtException. reason: ${err.message}, stack: ${err.stack}`
  );
  process.exit(1);
});

process.on('uncaughtRejection', err => {
  app.log.fatal(
    `Fatal: server crashed because of uncaughtRejection. reason: ${err.message}, stack: ${err.stack}`
  );
  process.exit(1);
});

/**
 * 優雅的關閉 server
 */
function gracefullyClose(): void {
  const closeListeners = closeWithGrace(
    { delay: parseInt(process.env.FASTIFY_GRACEFULLY_CLOSE_DELAY ?? '500') },
    async function ({ err }) {
      if (err) {
        app.log.error(err);
      }
      await app.close();
    } as closeWithGrace.CloseWithGraceAsyncCallback
  );
  closeListeners.uninstall();
}

/**
 * 取得 logger 設定
 * @param nodeEnv 目前環境
 * @returns logger 設定
 */
function getLoggerSetting(nodeEnv: string): object | boolean {
  switch (nodeEnv) {
    case 'development':
      return {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
        formatters: {
          log(content: object) {
            if ('req' in content) {
              return getRequestLogFormat(content['req'] as FastifyRequest);
            }
            if ('res' in content) {
              return getResponseLogFormat(content['res'] as FastifyReply);
            }
            return content;
          },
        },
      };
    case 'production':
      return {
        level: process.env.LOG_LEVEL ?? 'info',
        timestamp: false,
        formatters: {
          level(label: string) {
            return { level: label };
          },
          log(content: object) {
            if ('req' in content) {
              return getRequestLogFormat(content['req'] as FastifyRequest);
            }
            if ('res' in content) {
              return getResponseLogFormat(content['res'] as FastifyReply);
            }
            return content;
          },
          bindings() {
            return {};
          },
        },
      };
    case 'test':
      return false;
    default:
      return false;
  }
}

/**
 * 取得 Request log 格式
 * @param req fastify request
 * @returns
 */
function getRequestLogFormat(req: FastifyRequest): object {
  const date = new Date();
  return {
    isoDate: date.toISOString(),
    date: date.toISOString().split('T')[0],
    w3cTime: date.toISOString().split('T')[1].split('.')[0],
    cIp: req.ips ? req.ips[req.ips.length - 1] : '-',
    ver: req.raw.httpVersion ?? '-',
    csMethod: req.method ?? '-',
    csUriStem: req.url.split('?')[0] ?? '/',
    csUriQuery: req.url.split('?')[1] ?? '-',
    csBytes: req.headers['content-length'] ?? req.socket.bytesRead ?? '0',
    ref: req.headers['referrer'] ?? '-',
    csUserAgent: req.headers['user-agent'] ?? '-',
    xreqId: req.headers['x-request-id'] ?? '-',
    csHost: req.hostname ?? '-',
    xffor: req.headers['x-forwarded-for'] ?? '-',
    xfproto: req.headers['x-forwarded-proto'] ?? '-',
    xfport: req.headers['x-forwarded-port'] ?? '-',
    xrealip: req.headers['x-real-ip'] ?? '-',
  };
}

/**
 * 取得 Response log 格式
 * @param res fastify reply
 * @returns
 */
function getResponseLogFormat(res: FastifyReply): object {
  const date = new Date();
  // 若 server timeout 會導致 res.getResponseTime 及 res.request 為 undefined，導致 server crash
  const timeTaken = res.getResponseTime ? res.getResponseTime() : 'unknown';
  const csMethod = res.request ? res.request.method : '-';
  const csUriStem = res.request ? res.request.url.split('?')[0] : '/';
  const csUriQuery = res.request ? res.request.url.split('?')[1] : '-';

  return {
    isoDate: date.toISOString(),
    date: date.toISOString().split('T')[0],
    w3cTime: date.toISOString().split('T')[1].split('.')[0],
    scStatus: res.statusCode ?? '-',
    scBytes: res.getHeader('content-length') ?? '0',
    timeTaken,
    csMethod,
    csUriStem,
    csUriQuery,
  };
}
