import { CheerioCrawler } from '@ygo/crawler';
import { DataAccessService } from '@ygo/mongo-server';
import {
  JurisprudenceDataType,
  CardsDataType,
  DataAccessEnum,
  MetaQAIemType,
} from '@ygo/schemas';
import { CustomLogger, delay } from '../utils';
import fs from 'fs';
import path from 'path';

type AccumulatorType = {
  [key: string]: {
    number: string;
    ids: string[];
  };
};

const getLogPath = (name: string): string => {
  const basePath =
    process.env.NODE_ENV === 'production'
      ? './log/jpInfoCrawler'
      : '../../../../log/jpInfoCrawler';
  const logDir = path.resolve(__dirname, basePath);
  const fileName = `${name}_${new Date().toDateString()}.json`;
  return path.join(logDir, fileName);
};

export class YgoJpInfo {
  private crawler: CheerioCrawler;
  private dataAccessService: DataAccessService;
  private logger: CustomLogger;

  constructor(
    crawler: CheerioCrawler,
    dataAccessService: DataAccessService,
    logger: CustomLogger
  ) {
    this.crawler = crawler;
    this.dataAccessService = dataAccessService;

    this.logger = logger;
  }

  public async updateCardsJPInfo(updateNumbers?: string[]) {
    const allJpInfo = await this.dataAccessService.find<JurisprudenceDataType>(
      DataAccessEnum.JURISPRUDENCE,
      updateNumbers && updateNumbers.length > 0
        ? { number: { $in: updateNumbers } }
        : {}
    );

    const failedJpInfo: string[] = [];
    let count = 0;
    for (const jpInfo of allJpInfo) {
      await delay(500);
      count++;
      const present = Math.floor((count / allJpInfo.length) * 100);
      this.logger.info(`${jpInfo.number}  : start!`);

      const { qa, info, failed } = await this.getJPRulesAndInf(jpInfo);
      if (!failed) {
        try {
          const jpInfoDoc = new Set(jpInfo.qa.map(q => q.title));
          const filteredQa = qa.filter(q => !jpInfoDoc.has(q.title));
          if (filteredQa.length)
            await this.dataAccessService.findAndUpdate<JurisprudenceDataType>(
              DataAccessEnum.JURISPRUDENCE,
              { number: jpInfo.number },
              {
                $push: {
                  qa: {
                    $each: filteredQa,
                  },
                },
                $set: {
                  info,
                },
              }
            );
          this.logger.info(
            `${jpInfo.number}  : update success!(${present}%) total : ${filteredQa.length} new Info : ${info !== '' ? info : 'none'}`
          );
        } catch (error) {
          this.logger.error(
            `Error : updateCardsJPInfo failed!(${present}%) cards ${jpInfo.number} update failed!`
          );
        }
      } else {
        failedJpInfo.push(jpInfo.number);
        this.logger.warn(`${jpInfo.number}  : update failed!(${present}%)`);
      }
    }
    this.writeLog('failedJpInfo', failedJpInfo);

    return { failedJpInfo };
  }

  public async getNewCardsJPInfo(cardNumbers: string[]) {
    const noJpInfo: string[] = [];
    let filterCards;

    try {
      const cards = await this.dataAccessService.find<CardsDataType>(
        DataAccessEnum.CARDS,
        { number: { $in: cardNumbers } },
        { id: 1, number: 1, _id: 0 },
        {}
      );

      filterCards = cards.reduce((accumulator: AccumulatorType, card) => {
        if (card.number) {
          if (accumulator[card.number]) {
            accumulator[card.number].ids.push(card.id);
          } else {
            accumulator[card.number] = { number: card.number, ids: [card.id] };
          }
        }
        return accumulator;
      }, {});
    } catch (error) {
      this.logger.error(`Error : getNewCardsJPInfo failed! find cards failed!`);
      return { notSearchJpInfo: noJpInfo };
    }
    let count = 0;
    for (const card in filterCards) {
      let info;
      for (const id of filterCards[card].ids) {
        info = await this.getCardsJPInfo(id, filterCards[card].number);
        if (info?.name_jp_h) break;
      }
      count++;
      const present = Math.floor(
        (count / Object.keys(filterCards).length) * 100
      );
      try {
        if (info?.name_jp_h) {
          this.dataAccessService.createOne<JurisprudenceDataType>(
            DataAccessEnum.JURISPRUDENCE,
            info as JurisprudenceDataType
          );
          this.logger.info(`${card}  : create success!, ${present}%`);
        } else {
          this.logger.info(`${card}  : no info!, ${present}%`);
          noJpInfo.push(card);
        }
      } catch (error) {
        this.logger.error(
          `Error : getNewCardsJPInfo failed! cards ${card} create failed!`
        );
      }
    }
    this.writeLog('noJpInfo', noJpInfo);

    return { notSearchJpInfo: noJpInfo };
  }

  private writeLog(name: string, data: object) {
    const path = getLogPath(name);
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  }

  private async getCardsJPInfo(id: string, number: string) {
    const path = `/yugiohdb/card_search.action?ope=1&sess=1&rp=10&mode=&sort=1&keyword=${id}&stype=4&ctype=&othercon=2&starfr=&starto=&pscalefr=&pscaleto=&linkmarkerfr=&linkmarkerto=&link_m=2&atkfr=&atkto=&deffr=&defto=&request_locale=ja`;
    let $ = await this.crawler.crawl(path);
    let info: Partial<JurisprudenceDataType> = {
      number,
      name_jp_h: '',
      name_jp_k: '',
      name_en: '',
      effect_jp: '',
      jud_link: '',
      info: '',
      qa: [] as MetaQAIemType[],
    };

    if (!$('.link_value').attr('value')) return info;

    const oldLink = `${$('.link_value').attr('value')}&request_locale=ja`;

    $ = await this.crawler.crawl(oldLink);
    const card_name = $('#cardname')
      .text()
      .split(/\s{2,}|"|\n/)
      .filter(t => t && t !== '==');

    info = {
      ...info,
      name_jp_h: this.removeTN(card_name[0]),
      name_jp_k: this.removeTN(card_name[1]),
      name_en: this.removeTN(card_name[2]),
      effect_jp: $('.item_box_text')
        .html()
        ?.replace(/\n\s*/g, '')
        .replace(/"\s*([^"]+?)\s*"/g, '$1')
        .split('</div>')[1],
      jud_link:
        this.crawler.baseUrl +
        oldLink.replace('card_search.action?ope=2', 'faq_search.action?ope=4'),
    };

    return info;
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
      // this.logger.info(`Pages : ${page}; Link : ${pageLink}`);
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
              date: this.removeTN(date.text()).split('更新日:')[1],
              title: this.removeTN(deck_set.children('.dack_name').text()),
              tag: this.removeTN(deck_set.children('.text').text()),
            });
            qaLinks.push(link);
          }
        });

      // this.logger.info(`QA Links : ${qaLinks}`);

      for (const [idx, link] of qaLinks.entries()) {
        const $ = await this.crawler.crawl(link);
        box[idx].q = this.removeTN($('#question_text').text());
        box[idx].a = this.removeTN($('#answer_text').text());
      }
      // this.logger.info(`Crawl Rules count : ${qaLinks.length}`);

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

  private removeTN(text: any): string {
    if (typeof text !== 'string') {
      return '';
    }
    return text.replace(/[\n\t]/g, '');
  }
}
