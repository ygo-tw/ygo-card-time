import { DataAccessService } from '@ygo/mongo-server';
import { task } from '../tasks/task-temp';
import { RutenService } from './rutenPrice';
import dayjs from 'dayjs';
import { CustomLogger } from '../utils';
import { CardsDataType, DataAccessEnum } from '@ygo/schemas';
import { CheerioCrawler } from '@ygo/crawler';
import { YgoJpInfo } from './ygoJpInfo';

type FinalRutenInfoType = {
  updateFailedId: string[];
  noPriceId: string[];
  successIds: string[];
};

type FinalJapanInfoType = {
  getNewCardsResult: { notSearchJpInfo: string[] };
  updateJPInfoResult: { failedJpInfo: string[] };
};

export class TaskService {
  private daService: DataAccessService;

  constructor(mongoUrl: string) {
    this.daService = new DataAccessService(mongoUrl);
  }

  /**
   * 爬取Ruten卡價
   * @param cards 欲爬取的卡牌
   */
  public async rutenPriceTask(cards?: CardsDataType[]) {
    await task(
      'Ruten Card Price Crawler',
      'rutenCrawlerPrice',
      `Ruten_Price_${new Date().toDateString()}.json`,
      async (logger: CustomLogger) => this.rutenTask(logger, cards)
    );
  }

  public async japanInfoTask(cardNumbers?: string[]) {
    await task(
      'Japan Info Crawler',
      'jpInfoCrawler',
      `JP_Info_${new Date().toDateString()}.json`,
      async (logger: CustomLogger) => this.japanTask(logger, cardNumbers)
    );
  }

  private async japanTask(logger: CustomLogger, cardNumbers?: string[]) {
    const crawler = new CheerioCrawler('https://www.db.yugioh-card.com/');
    const ygoJpInfo = new YgoJpInfo(crawler, this.daService, logger);

    const finalInfo: FinalJapanInfoType = {
      getNewCardsResult: {
        notSearchJpInfo: [],
      },
      updateJPInfoResult: {
        failedJpInfo: [],
      },
    };
    const failTasks: string[] = [];
    let html = '';

    const lostCardsInfo = cardNumbers ?? (await this.findJapanInfo());

    try {
      finalInfo.getNewCardsResult =
        await ygoJpInfo.getNewCardsJPInfo(lostCardsInfo);
      html = `
        <p>'Updated Data New Cards Jp Info Successful !'</p>
      `;
    } catch (error) {
      failTasks.push('getNewCardsJPInfo');
      html += `<h1> New Cards Jp Info Error</h1><p>${error}</p><p>${__dirname + __filename}</p>`;
    }

    try {
      finalInfo.updateJPInfoResult = await ygoJpInfo.updateCardsJPInfo();
      html += `<p>'Updated Data QA Info Successful !'</p>`;
    } catch (error) {
      failTasks.push('updateCardsJPInfo');
      html += `<h1> QA Info Error</h1><p>${error}</p><p>${__dirname + __filename}</p>`;
    }

    return { html, finalInfo, failTasks };
  }

  /**
   * 查找沒有日本資料的卡牌
   * @returns 沒有日本資料的卡牌編號
   */
  private async findJapanInfo(): Promise<string[]> {
    const cardsWithoutInfo = await this.daService.aggregate<{ number: string }>(
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
    );

    return cardsWithoutInfo.map(x => x.number);
  }

  /**
   * 爬取Ruten卡價任務
   * @param logger 日志器
   * @param cards 欲爬取的卡牌
   */
  private async rutenTask(logger: CustomLogger, cards?: CardsDataType[]) {
    const rutenService = new RutenService(this.daService, logger);
    const now = dayjs().format('YYYY-MM-DD');
    let html = '';

    let finalInfo: FinalRutenInfoType = {
      updateFailedId: [],
      noPriceId: [],
      successIds: [],
    };

    const failTasks: string[] = [];

    try {
      finalInfo = await rutenService.getRutenPrice(cards);

      html = `
      <p>'Updated Data Price Successful !'</p>
      <p> total updated ${finalInfo.successIds.length} data(${now})</a>
    `;
    } catch (error) {
      failTasks.push('getRutenPrice');
      html = `<h1>Ruten Card Price Crawler Error</h1><p>${error}</p>`;
    }

    return { html, finalInfo, failTasks };
  }
}
