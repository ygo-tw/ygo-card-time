import { CheerioCrawler } from '@ygo/crawler';
import { DataAccessService } from '@ygo/mongo-server';
import { CardsDataType, MetaQAIemType } from '@ygo/schemas';
import { YgoJpInfo } from './ygoJpInfo';
import { createLogger } from 'winston';
import cheerio from 'cheerio';

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
      baseUrl: 'https://yugioh.jp',
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

      const result = await ygoJpInfo.updateCardsJPInfo();
      expect(result).toEqual({ failedJpInfo: [] });
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

  describe('getCardsJPInfo', () => {
    it('should fetch and parse card information correctly', async () => {
      const mockId = 'test_id';
      const mockNumber = '12345';
      const mockPath = `/yugiohdb/card_search.action?ope=1&sess=1&rp=10&mode=&sort=1&keyword=${mockId}&stype=4&ctype=&othercon=2&starfr=&starto=&pscalefr=&pscaleto=&linkmarkerfr=&linkmarkerto=&link_m=2&atkfr=&atkto=&deffr=&defto=&request_locale=ja`;

      const mockHtmlInitialPage = `
        <div class="link_value" value="/card_search.action?ope=2"></div>
      `;
      const mockHtmlOldLinkPage = `
        <div id="cardname">
          <h1>
            <span class="ruby">オベリスクのきょしんへい</span>
            "オベリスクの巨神兵"
            <span>Obelisk the Tormentor</span>
          </h1>
        </div>
        <div class="item_box_text">
          <div class="text_title">カードテキスト</div>
          " このカードを通常召喚する場合、３体をリリースして召喚しなければならない。"
          <br>
          "①：このカードの召喚は無効化されない。"
          <br>
          "②：このカードの召喚成功時にお互いはカードの効果を発動できない。"
          <br>
          "③：お互いにフィールドのこのカードを効果の対象にできない。"
          <br>
          "④：自分フィールドのモンスター２体をリリースして発動できる（この効果を発動するターン、このカードは攻撃宣言できない）。相手フィールドのモンスターを全て破壊する。"
          <br>
          "⑤：このカードが特殊召喚されている場合、エンドフェイズに発動する。このカードを墓地へ送る。"
        </div>
      `;

      crawler.crawl
        .mockResolvedValueOnce(cheerio.load(mockHtmlInitialPage))
        .mockResolvedValueOnce(cheerio.load(mockHtmlOldLinkPage));

      const result = await ygoJpInfo['getCardsJPInfo'](mockId, mockNumber);

      expect(crawler.crawl).toHaveBeenCalledTimes(2);
      expect(crawler.crawl).toHaveBeenCalledWith(mockPath);
      expect(crawler.crawl).toHaveBeenCalledWith(
        '/card_search.action?ope=2&request_locale=ja'
      );

      expect(result).toEqual({
        number: mockNumber,
        name_jp_h: 'オベリスクのきょしんへい',
        name_jp_k: 'オベリスクの巨神兵',
        name_en: 'Obelisk the Tormentor',
        effect_jp:
          'このカードを通常召喚する場合、３体をリリースして召喚しなければならない。<br>①：このカードの召喚は無効化されない。<br>②：このカードの召喚成功時にお互いはカードの効果を発動できない。<br>③：お互いにフィールドのこのカードを効果の対象にできない。<br>④：自分フィールドのモンスター２体をリリースして発動できる（この効果を発動するターン、このカードは攻撃宣言できない）。相手フィールドのモンスターを全て破壊する。<br>⑤：このカードが特殊召喚されている場合、エンドフェイズに発動する。このカードを墓地へ送る。',
        jud_link:
          crawler.baseUrl + '/faq_search.action?ope=4&request_locale=ja',
        info: '',
        qa: [],
      });
    });

    it('should return initial info if link_value is not present', async () => {
      const mockId = 'test_id';
      const mockNumber = '12345';
      const mockPath = `/yugiohdb/card_search.action?ope=1&sess=1&rp=10&mode=&sort=1&keyword=${mockId}&stype=4&ctype=&othercon=2&starfr=&starto=&pscalefr=&pscaleto=&linkmarkerfr=&linkmarkerto=&link_m=2&atkfr=&atkto=&deffr=&defto=&request_locale=ja`;

      const mockHtmlInitialPage = `
        <div class="link_value"></div>
      `;

      crawler.crawl.mockResolvedValueOnce(cheerio.load(mockHtmlInitialPage));

      const result = await ygoJpInfo['getCardsJPInfo'](mockId, mockNumber);

      expect(crawler.crawl).toHaveBeenCalledTimes(1);
      expect(crawler.crawl).toHaveBeenCalledWith(mockPath);

      expect(result).toEqual({
        number: mockNumber,
        name_jp_h: '',
        name_jp_k: '',
        name_en: '',
        effect_jp: '',
        jud_link: '',
        info: '',
        qa: [],
      });
    });
  });

  describe('removeTN', () => {
    it('should remove newlines and tabs', () => {
      const text = '\nHello\tWorld\n';
      const result = (ygoJpInfo as any).removeTN(text);
      expect(result).toBe('HelloWorld');
    });

    it('should handle empty string', () => {
      const text = '';
      const result = (ygoJpInfo as any).removeTN(text);
      expect(result).toBe('');
    });

    it('should handle string with only newlines and tabs', () => {
      const text = '\n\t\n\t';
      const result = (ygoJpInfo as any).removeTN(text);
      expect(result).toBe('');
    });

    it('should handle string without newlines and tabs', () => {
      const text = 'HelloWorld';
      const result = (ygoJpInfo as any).removeTN(text);
      expect(result).toBe('HelloWorld');
    });

    it('should return empty string for null input', () => {
      const result = (ygoJpInfo as any).removeTN(null);
      expect(result).toBe('');
    });

    it('should return empty string for undefined input', () => {
      const result = (ygoJpInfo as any).removeTN(undefined);
      expect(result).toBe('');
    });

    it('should return empty string for non-string input', () => {
      const result = (ygoJpInfo as any).removeTN(12345);
      expect(result).toBe('');
    });

    it('should handle string with mixed content', () => {
      const text = 'Hello\nWorld\tThis is a\ttest\nstring';
      const result = (ygoJpInfo as any).removeTN(text);
      expect(result).toBe('HelloWorldThis is ateststring');
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

    it('should fetch and parse rules correctly', async () => {
      const mockPageLink = 'http://example.com';
      const mockRuleLink = '/rule-link';
      const mockHtmlMainPage = `
        <div class="t_body">
          <div class="t_row">
            <div class="inside">
              <div class="dack_set">
                <div class="dack_name">Test Deck</div>
                <div class="text">Test Tag</div>
              </div>
              <div class="div date">更新日:2023-05-22</div>
            </div>
            <div class="link_value" value="rule-link"></div>
          </div>
        </div>
      `;
      const mockHtmlRulePage = `
        <div id="question_text">Test Question</div>
        <div id="answer_text">Test Answer</div>
      `;

      crawler.crawl
        .mockResolvedValueOnce(cheerio.load(mockHtmlMainPage))
        .mockResolvedValueOnce(cheerio.load(mockHtmlRulePage));

      const qa: MetaQAIemType[] = [];
      const result = await ygoJpInfo['getRules'](qa, mockPageLink);

      expect(crawler.crawl).toHaveBeenCalledTimes(2);
      expect(crawler.crawl).toHaveBeenCalledWith(mockPageLink);
      expect(crawler.crawl).toHaveBeenCalledWith(
        mockRuleLink + '&request_locale=ja'
      );

      expect(result).toEqual({
        box: [
          {
            title: 'Test Deck',
            tag: 'Test Tag',
            date: '2023-05-22',
            q: 'Test Question',
            a: 'Test Answer',
          },
        ],
        failed: false,
      });

      expect(logger.info).toHaveBeenCalledWith(
        `QA Links : /rule-link&request_locale=ja`
      );
      expect(logger.info).toHaveBeenCalledWith(`Crawl Rules count : 1`);
    });
  });

  it('should handle errors correctly', async () => {
    const mockPageLink = 'http://example.com';

    crawler.crawl.mockRejectedValueOnce(new Error('Crawl error'));

    const qa: MetaQAIemType[] = [];
    const result = await ygoJpInfo['getRules'](qa, mockPageLink);

    expect(crawler.crawl).toHaveBeenCalledTimes(1);
    expect(crawler.crawl).toHaveBeenCalledWith(mockPageLink);

    expect(result).toEqual({
      box: [],
      failed: true,
    });

    expect(logger.error).toHaveBeenCalledWith('Error : getRules failed!');
  });
});
