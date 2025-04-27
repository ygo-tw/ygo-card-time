import { loadEnv } from './envRunner';
import gracefulShutdown from 'fastify-graceful-shutdown';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

// 讀取環境變數
loadEnv();

const app = Fastify({
  logger: getLoggerSetting(),
  genReqId(req) {
    const reqId =
      req.headers['x-request-id'] && req.headers['x-request-id'] !== '-'
        ? req.headers['x-request-id']
        : null;
    const traceId =
      req.headers['ygo-trace-id'] ??
      req.headers['traceId'] ??
      reqId ??
      uuidv4().substring(0, 6);
    req.headers['ygo-trace-id'] = traceId.toString();
    return traceId.toString();
  },
});

app.register(gracefulShutdown);
app.register(import('./app'));

app.addHook('onSend', (req, res, _, done) => {
  res.header('ygo-trace-id', req.headers['ygo-trace-id']);
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
 * 取得 logger 設定
 * @param nodeEnv 目前環境
 * @returns logger 設定
 */
function getLoggerSetting(): object | boolean {
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
  const csMethod = res.request ? res.request.method : '-';
  const csUriStem = res.request ? res.request.url.split('?')[0] : '/';
  const csUriQuery = res.request ? res.request.url.split('?')[1] : '-';

  return {
    isoDate: date.toISOString(),
    date: date.toISOString().split('T')[0],
    w3cTime: date.toISOString().split('T')[1].split('.')[0],
    scStatus: res.statusCode ?? '-',
    scBytes: res.getHeader('content-length') ?? '0',
    csMethod,
    csUriStem,
    csUriQuery,
  };
}
