import { RutenService } from '../services/rutenPrice';
import { CustomLogger, makeMailOptionsPayload } from '../utils';
import { DataAccessService } from '@ygo/mongo-server';
import { CardsDataType } from '@ygo/schemas';
import { LineMessageService } from '../services/lineMessage';
import { YGOMailer } from '@ygo/mailer';
import dayjs from 'dayjs';

/**
 * 從 Ruten 爬取卡片價格並更新資料庫
 *
 * @param {CardsDataType[]} [cards] - 選擇性參數，卡片數據類型的數組
 *
 * @async
 * @function reptileRutenCardPrice
 */
export const reptileRutenCardPrice = async (cards?: CardsDataType[]) => {
  // line message
  const lineService = new LineMessageService(
    {
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN as string,
    },
    process.env.LINE_MANAGER_ID?.split(',') as string[]
  );
  // mailer
  const mailer = new YGOMailer();

  // mongodb serveice
  const mongoUrl = `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;
  const logger = new CustomLogger('rutenCrawlerPrice');
  const dataAccessService = new DataAccessService(mongoUrl);
  const rutenService = new RutenService(dataAccessService, logger);

  // 開始爬蟲
  let html = '';
  const now = dayjs().format('YYYY-MM-DD');
  const filename = `Ruten_Price_${new Date().toDateString()}.json`;

  const isLineMsgOk = await lineService.sendMsg(
    'Ruten Card Price Crawler Start'
  );

  let finalResult: {
    updateFailedId: string[];
    noPriceId: string[];
    successIds: string[];
  } = {
    updateFailedId: [],
    noPriceId: [],
    successIds: [],
  };

  try {
    finalResult = await rutenService.getRutenPrice(cards);

    html = `
    <p>'Updated Data Price Successful !'</p>
    <p> total updated ${finalResult.successIds.length} data(${now})</a>
  `;
  } catch (error) {
    console.log(error);
    html = `<h1>Ruten Card Price Crawler Error</h1><p>${error}</p>`;
  }

  if (!isLineMsgOk) {
    html += `<h1> Line Msg Error</h1>`;
  }

  // 爬蟲結束
  const checkNotError = {
    mail: true,
    drive: true,
  };

  try {
    const mailOptions = makeMailOptionsPayload(
      now,
      finalResult,
      html,
      filename
    );
    await mailer.sendMail(mailOptions);
  } catch (error) {
    checkNotError.mail = false;
  }

  await lineService.sendMsg(
    `Ruten Card Price Crawler End ! ${!checkNotError.mail ? '(Mail Failed)' : ''}`
  );

  logger.info('Ruten Card Price Crawler End !');
};
