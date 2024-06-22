import { YgoJpInfo } from '../services/ygoJpInfo';
import { CustomLogger, makeMailOptionsPayload } from '../utils';
import { DataAccessService } from '@ygo/mongo-server';
import { CheerioCrawler } from '@ygo/crawler';
import { DataAccessEnum } from '@ygo/schemas';
import { LineBotService } from '@ygo/line';
import { YGOMailer } from '@ygo/mailer';
import dayjs from 'dayjs';

export const reptileJapanInfo = async (cardNumbers?: string[]) => {
  // line notify
  const lineBotService = new LineBotService();

  // mailer
  const mailer = new YGOMailer();
  //  ygoJpInfo
  const mongoUrl = `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;
  const logger = new CustomLogger('jpInfoCrawler');
  const dataAccessService = new DataAccessService(mongoUrl);
  const crawler = new CheerioCrawler('https://www.db.yugioh-card.com/');
  const ygoJpInfo = new YgoJpInfo(crawler, dataAccessService, logger);

  const findalInfo: {
    getNewCardsResult: { notSearchJpInfo: string[] };
    updateJPInfoResult: { failedJpInfo: string[] };
  } = {
    getNewCardsResult: {
      notSearchJpInfo: [],
    },
    updateJPInfoResult: {
      failedJpInfo: [],
    },
  };
  const failTasks: string[] = [];

  let html = '';
  const now = dayjs().format('YYYY-MM-DD');
  const filename = `JP_Info_${new Date().toDateString()}.json`;

  await lineBotService.sendNotify('Japan Info Crawler Start');

  let lostCardsInfo = cardNumbers;
  // 沒有欲針對的目標 則比較資料庫缺失數據重爬
  if (!lostCardsInfo) {
    lostCardsInfo = (
      await dataAccessService.aggregate<{ number: string }>(
        DataAccessEnum.CARDS,
        [
          {
            $lookup: {
              from: DataAccessEnum.JURISPRUDENCE,
              localField: 'number',
              foreignField: 'number',
              as: 'bMatches',
            },
          },
          {
            $match: {
              bMatches: { $eq: [] },
            },
          },
          {
            $project: {
              number: 1,
            },
          },
        ]
      )
    ).map(x => x.number);
  }

  try {
    findalInfo.getNewCardsResult =
      await ygoJpInfo.getNewCardsJPInfo(lostCardsInfo);
    html = `
      <p>'Updated Data New Cards Jp Info Successful !'</p>
    `;
  } catch (error) {
    failTasks.push('getNewCardsJPInfo');
    html += `<h1> New Cards Jp Info Error</h1><p>${error}</p>`;
  }

  try {
    findalInfo.updateJPInfoResult = await ygoJpInfo.updateCardsJPInfo();
    html += `<p>'Updated Data QA Info Successful !'</p>`;
  } catch (error) {
    failTasks.push('updateCardsJPInfo');
    html += `<h1> QA Info Error</h1><p>${error}</p>`;
  }

  // 爬蟲結束
  const checkNotError = {
    mail: true,
    drive: true,
  };

  try {
    const mailOptions = makeMailOptionsPayload(now, findalInfo, html, filename);
    await mailer.sendMail(mailOptions);
  } catch (error) {
    checkNotError.mail = false;
  }

  await lineBotService.sendNotify(
    `Japan Info Crawler End ! ${!checkNotError.mail ? '(Mail Failed)' : ''}`
  );

  logger.info('Japan Info Crawler End !');
};
