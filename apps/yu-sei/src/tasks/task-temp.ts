import { CustomLogger, makeMailOptionsPayload } from '../utils';
import { LineMessageService } from '../services/lineMessage';
import { YGOMailer } from '@ygo/mailer';
import dayjs from 'dayjs';

export const task = async (
  taskName: string,
  filename: string,
  fileDir: string,
  task: (
    logger: CustomLogger
  ) => Promise<{ html: string; finalInfo: object | []; failTasks: string[] }>
) => {
  // line message
  const lineService = new LineMessageService(
    {
      channelAccessToken: process.env.LIME_MESSAGE_TOKEN as string,
    },
    process.env.LINE_MANAGER_ID?.split(',') as string[]
  );

  // mailer
  const mailer = new YGOMailer();

  const logger = new CustomLogger(filename);

  const failTasks: string[] = [];

  let html = '';
  const now = dayjs().format('YYYY-MM-DD');

  const isLineMsgOk = await lineService.sendMsg(`${taskName} Start`);

  const {
    html: taskHtml,
    finalInfo,
    failTasks: taskFailTasks,
  } = await task(logger);

  html += taskHtml;
  failTasks.push(...taskFailTasks);

  if (!isLineMsgOk) {
    failTasks.push('lineMsg');
    html += `<h1> Line Msg Error</h1>`;
  }

  if (failTasks.length > 0) {
    html += `<h1> Fail Tasks</h1><p>${failTasks.join(', ')}</p>`;
  }

  // 爬蟲結束
  const checkNotError = {
    mail: true,
    drive: true,
  };

  try {
    const mailOptions = makeMailOptionsPayload(now, finalInfo, html, fileDir);
    await mailer.sendMail(mailOptions);
  } catch (error) {
    checkNotError.mail = false;
  }

  await lineService.sendMsg(
    `${taskName} End ! ${!checkNotError.mail ? '(Mail Failed)' : ''}`
  );

  logger.info(`${taskName} End !`);
};
