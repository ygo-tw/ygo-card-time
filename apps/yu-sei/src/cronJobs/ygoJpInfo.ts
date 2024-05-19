import { CheerioCrawler } from '@ygo/crawler';
import { DataAccessService } from '@ygo/mongo-server';
import {
  JurisprudenceDataType,
  DataAccessEnum,
  MetaQAIemType,
} from '@ygo/schemas';
import { createLogger, format, transports, Logger } from 'winston';
import gradient from 'gradient-string';
import fs from 'fs';
import { resolve } from 'path';

export class YgoJpInfo {
  private crawler: CheerioCrawler;
  private dataAccessService: DataAccessService;
  private logger: Logger;
  private startTime: Date = new Date();

  constructor(
    crawler: CheerioCrawler,
    dataAccessService: DataAccessService,
    logger?: Logger
  ) {
    this.crawler = crawler;
    this.dataAccessService = dataAccessService;
    this.logger =
      logger ||
      createLogger({
        level: 'info',
        format: format.combine(
          format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          format.printf(info => {
            const message = `${info.timestamp} [${info.level}]: ${info.message}`;
            return info.level === 'info' ? gradient.rainbow(message) : message;
          })
        ),
        transports: [
          new transports.Console(),
          new transports.File({
            filename: `../../log/jpInfoCrawler/combined_${this.startTime.toDateString()}.log`,
          }),
        ],
        exceptionHandlers: [
          new transports.File({
            filename: `../../log/jpInfoCrawler/exceptions_${this.startTime.toDateString()}.log`,
          }),
        ],
        exitOnError: false, // 設置為 false 以防止例外退出
      });
  }

  public async updateCardsJPInfo(updateNumbers?: string[]) {
    const allJpInfo = await this.dataAccessService.find<JurisprudenceDataType>(
      DataAccessEnum.JURISPRUDENCE,
      updateNumbers && updateNumbers.length > 0
        ? { number: { $in: updateNumbers } }
        : {}
    );

    const failedJpInfo: string[] = [];
    for (const jpInfo of allJpInfo) {
      this.logger.info(`${jpInfo.number}  : start!`);
      const { qa, info, failed } = await this.getJPRulesAndInf(jpInfo);
      if (qa.length || info) {
        this.dataAccessService.findAndUpdate<JurisprudenceDataType>(
          DataAccessEnum.JURISPRUDENCE,
          { number: jpInfo.number },
          {
            $push: {
              number: {
                $each: qa,
              },
            },
            $set: {
              info,
            },
          }
        );
        this.logger.info(
          `${jpInfo.number}  : update success! ${info ?? ''} / ${qa.length}`
        );
      } else {
        if (failed) failedJpInfo.push(jpInfo.number);
        const path = resolve(
          __dirname,
          `../../../../log/jpInfoCrawler/failedInfo_${new Date().toDateString()}.json`
        );
        fs.writeFileSync(path, JSON.stringify(failedJpInfo, null, 2));
      }
    }
  }

  private async getJPRulesAndInf(jpInfo: JurisprudenceDataType) {
    const fix: { qa: MetaQAIemType[]; info: string; failed: boolean } = {
      qa: [],
      info: '',
      failed: false,
    };

    // check info
    try {
      const path = '/' + (jpInfo.jud_link + '&sort=2').split('com/')[1];
      const $ = await this.crawler.crawl(path);
      const checkInfo = jpInfo.info !== this.removeTN($('#supplement').text());
      if (checkInfo) {
        this.logger.info(`Check Info : ${checkInfo}`);
        fix.info = this.removeTN($('#supplement').text());
      }

      // check pages
      const children = $('.page_num').children();
      const lastHref =
        children.length > 5 ? children.last().attr('href') : undefined;
      const page = lastHref
        ? parseInt(lastHref.split('(')[1])
        : children.length;
      const pageLink =
        '/' + (jpInfo.jud_link + `&page=${page}`).split('com/')[1];
      this.logger.info(`Pages : ${page}; Link : ${pageLink}`);
      const result = await this.getRules(jpInfo.qa, pageLink);

      return {
        ...fix,
        qa: result.box,
        failed: result.failed,
      };
    } catch (error) {
      this.logger.error(`Error : Crawler failed!`);
      return {
        ...fix,
        failed: true,
      };
    }
  }

  private async getRules(qa: MetaQAIemType[], pageLink: string) {
    try {
      const $ = await this.crawler.crawl(pageLink);
      const box: Partial<MetaQAIemType>[] = [];
      const qaLinks: string[] = [];
      $('.t_body')
        .children('.t_row')
        .each(async (_, rule) => {
          const deck_set = $(rule).children('.inside').children('.dack_set');
          const date = $(rule).children('.inside').children('.div.date');
          const link =
            '/' +
            $(rule).children('.link_value').attr('value') +
            '&request_locale=ja';
          const newQa: Partial<MetaQAIemType> = {
            title: '',
            tag: '',
            date: '',
            q: '',
            a: '',
          };
          if (
            !qa.length ||
            (qa.length &&
              qa.find(
                q =>
                  q.title ===
                  this.removeTN(deck_set.children('.dack_name').text())
              ))
          ) {
            box.push({
              ...newQa,
              data: this.removeTN(date.text()).split('更新日:')[1],
              title: this.removeTN(deck_set.children('.dack_name').text()),
              tag: this.removeTN(deck_set.children('.text').text()),
            });
            qaLinks.push(link);
          }
        });

      this.logger.info(`QA Links : ${qaLinks}`);

      for (const [idx, link] of qaLinks.entries()) {
        const $ = await this.crawler.crawl(link);
        box[idx].q = this.removeTN($('#question_text').text());
        box[idx].a = this.removeTN($('#answer_text').text());
      }
      this.logger.info(`Crawl Rules count : ${qaLinks.length}`);

      return {
        box: box as MetaQAIemType[],
        failed: false,
      };
    } catch (error) {
      this.logger.error(`Error : getRules failed!`);

      return {
        box: [],
        failed: true,
      };
    }
  }

  private removeTN(text: string) {
    return text.replaceAll(`\n`, '').replaceAll(`\t`, '');
  }
}
