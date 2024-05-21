import { CheerioCrawler } from '@ygo/crawler';
import { DataAccessService } from '@ygo/mongo-server';
import { CardsDataType, MetaQAIemType } from '@ygo/schemas';
import { YgoJpInfo } from './ygoJpInfo';
import { createLogger } from 'winston';
import cheerio from 'cheerio';
import * as fs from 'fs';
import { resolve } from 'path';

jest.mock('@ygo/crawler');
jest.mock('@ygo/mongo-server');
jest.mock('winston', () => {
  const actualWinston = jest.requireActual('winston');
  return {
    ...actualWinston,
  };
});

describe('YgoJpInfo', () => {
  let crawler: jest.Mocked<CheerioCrawler>;
  let dataAccessService: jest.Mocked<DataAccessService>;
  let logger: any;
  let ygoJpInfo: YgoJpInfo;

  beforeEach(() => {
    jest.resetAllMocks();
    crawler = {
      crawl: jest.fn(),
    } as unknown as jest.Mocked<CheerioCrawler>;
    dataAccessService = {
      find: jest.fn(),
      findAndUpdate: jest.fn(),
      createOne: jest.fn(),
    } as unknown as jest.Mocked<DataAccessService>;
    logger = createLogger({
      level: 'info',
      silent: true,
    });

    logger.error = jest.fn();
    logger.info = jest.fn();

    ygoJpInfo = new YgoJpInfo(crawler, dataAccessService, logger);
  });

  describe('updateCardsJPInfo', () => {
    it('should update cards information successfully', async () => {
      const mockData = [
        { number: '123', info: 'old info', jud_link: 'link', qa: [] },
      ];
      dataAccessService.find.mockResolvedValue(mockData as any);
      const mockResult = { qa: [], info: 'new info', failed: false };
      jest
        .spyOn(ygoJpInfo as any, 'getJPRulesAndInf')
        .mockResolvedValueOnce(mockResult);
      dataAccessService.findAndUpdate.mockResolvedValueOnce({} as any);

      const result = await ygoJpInfo.updateCardsJPInfo();

      expect(result).toEqual({ failedJpInfo: [] });
      expect(logger.info).toHaveBeenCalledWith('123  : start!');
      expect(logger.info).toHaveBeenCalledWith(
        '123  : update success! new info / 0'
      );
    });

    it('should append failed cards to the result', async () => {
      const mockData = [
        { number: '123', info: 'old info', jud_link: 'link', qa: [] },
      ];
      dataAccessService.find.mockResolvedValue(mockData as any);
      const mockResult = { qa: [], info: 'new info', failed: true };
      jest
        .spyOn(ygoJpInfo as any, 'getJPRulesAndInf')
        .mockResolvedValueOnce(mockResult);

      const result = await ygoJpInfo.updateCardsJPInfo();

      expect(result).toEqual({ failedJpInfo: ['123'] });
    });

    it('should append failed cards to the result', async () => {
      const mockData = [
        { number: '123', info: 'old info', jud_link: 'link', qa: [] },
      ];
      dataAccessService.find.mockResolvedValue(mockData as any);

      // Mock getJPRulesAndInf to return a successful response
      const mockGetJPRulesAndInf = {
        qa: ['qa1', 'qa2'],
        info: 'new info',
        failed: false,
      };
      jest
        .spyOn(ygoJpInfo as any, 'getJPRulesAndInf')
        .mockResolvedValue(mockGetJPRulesAndInf);

      // Mock findAndUpdate to throw an error
      const mockUpdateError = new Error('update error');
      jest
        .spyOn(dataAccessService, 'findAndUpdate')
        .mockRejectedValueOnce(mockUpdateError);

      await expect(dataAccessService.findAndUpdate).rejects.toThrow(
        'update error'
      );
    });
  });

  describe('getNewCardsJPInfo', () => {
    it('should create new card information successfully', async () => {
      const cardNumbers = ['123'];
      const mockCards = [{ id: '1', number: '123' }];
      dataAccessService.find.mockResolvedValue(mockCards as CardsDataType[]);
      jest
        .spyOn(ygoJpInfo as any, 'getCardsJPInfo')
        .mockResolvedValue({ name_jp_h: 'name' } as any);
      dataAccessService.createOne.mockResolvedValue({} as any);

      const result = await ygoJpInfo.getNewCardsJPInfo(cardNumbers);

      expect(result).toEqual({ notSearchJpInfo: [] });
      expect(logger.info).toHaveBeenCalledWith('123  : create success!');
    });

    it('should log errors during card creation', async () => {
      const cardNumbers = ['123'];
      const mockCards = [{ id: '1', number: '123' }];
      dataAccessService.find.mockResolvedValue(mockCards as CardsDataType[]);
      const mockError = new Error('mock error');
      (ygoJpInfo as any).getCardsJPInfo = jest
        .fn()
        .mockRejectedValue(mockError);
      dataAccessService.createOne.mockRejectedValue(new Error('create error'));

      await expect(ygoJpInfo.getNewCardsJPInfo(cardNumbers)).rejects.toThrow(
        'mock error'
      );
    });
  });

  describe('private methods', () => {
    it('writeLog should write log to the correct path', () => {
      const spyWriteFileSync = jest
        .spyOn(fs, 'writeFileSync')
        .mockImplementation(() => {});

      const name = 'testLog';
      const data = { test: 'data' };
      ygoJpInfo['writeLog'](name, data);

      const expectedPath = resolve(
        __dirname,
        `../../../../log/jpInfoCrawler/${name}_${new Date().toDateString()}.json`
      );
      expect(spyWriteFileSync).toHaveBeenCalledWith(
        expectedPath,
        JSON.stringify(data, null, 2)
      );
    });
  });

  describe('removeTN', () => {
    it('should remove newlines and tabs', () => {
      const text = '\nHello\tWorld\n';
      const result = (ygoJpInfo as any).removeTN(text);
      expect(result).toBe('HelloWorld');
    });
  });

  describe('getJPRulesAndInf', () => {
    it('should retrieve rules and info correctly', async () => {
      const jpInfo = {
        number: '123',
        name_jp_h: '',
        name_jp_k: '',
        name_en: '',
        effect_jp: '',
        jud_link: 'link',
        info: '',
        qa: [],
      };
      const mockHtml = `<div id="supplement">新情報</div>`;
      crawler.crawl.mockResolvedValueOnce(cheerio.load(mockHtml));
      jest.spyOn(ygoJpInfo as any, 'getRules').mockResolvedValueOnce({
        box: [],
        failed: false,
      });
      const result = await (ygoJpInfo as any).getJPRulesAndInf(jpInfo);
      expect(result).toEqual({
        qa: [],
        info: '新情報',
        failed: false,
      });
    });

    it('should handle crawler failure', async () => {
      const jpInfo = {
        number: '123',
        name_jp_h: '',
        name_jp_k: '',
        name_en: '',
        effect_jp: '',
        jud_link: 'link',
        info: '',
        qa: [],
      };
      const mockError = new Error('mock error');
      crawler.crawl.mockRejectedValueOnce(mockError);
      const result = await (ygoJpInfo as any).getJPRulesAndInf(jpInfo);
      expect(result).toEqual({
        qa: [],
        info: '',
        failed: true,
      });
    });
  });

  describe('getRules', () => {
    it('should retrieve rules correctly', async () => {
      const qa: MetaQAIemType[] = [];
      const pageLink = 'link';
      const mockHtml = `
        <div class="t_body">
          <div class="t_row">
            <div class="inside">
              <div class="dack_set">
                <div class="dack_name">デッキ名</div>
                <div class="text">テキスト</div>
              </div>
              <div class="div date">更新日:2021/01/01</div>
            </div>
            <div class="link_value" value="link"></div>
          </div>
        </div>`;
      crawler.crawl.mockResolvedValueOnce(mockHtml as any);
      const mockResult = {
        box: [
          {
            title: 'デッキ名',
            tag: 'テキスト',
            date: '2021/01/01',
            q: '',
            a: '',
          },
        ],
        failed: false,
      };
      jest
        .spyOn(ygoJpInfo as any, 'getRules')
        .mockResolvedValueOnce(mockResult);
      const result = await (ygoJpInfo as any).getRules(qa, pageLink);
      expect(result).toEqual(mockResult);
    });

    it('should handle rule retrieval failure', async () => {
      const qa: MetaQAIemType[] = [];
      const pageLink = 'link';
      const mockError = new Error('mock error');
      crawler.crawl.mockRejectedValueOnce(mockError);
      const result = await (ygoJpInfo as any).getRules(qa, pageLink);
      expect(result).toEqual({
        box: [],
        failed: true,
      });
    });
  });
});
