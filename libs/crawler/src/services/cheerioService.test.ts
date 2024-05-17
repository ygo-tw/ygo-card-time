import axios from 'axios';
import iconv from 'iconv-lite';
import { CheerioCrawler } from './cheerioService';
import cheerio from 'cheerio';

// Mock axios and iconv-lite
jest.mock('axios');
jest.mock('iconv-lite');

describe('CheerioCrawler', () => {
  let crawler: CheerioCrawler;

  beforeEach(() => {
    crawler = new CheerioCrawler('http://example.com');
  });

  describe('constructor', () => {
    it('should initialize with the correct base URL', () => {
      expect(crawler['baseUrl']).toBe('http://example.com');
    });
  });

  describe('setBaseUrl', () => {
    it('should set a new base URL', () => {
      crawler.setBaseUrl('http://newexample.com');
      expect(crawler['baseUrl']).toBe('http://newexample.com');
    });
  });

  describe('fetchPage', () => {
    it('should fetch page content and decode it', async () => {
      const mockResponse = { data: Buffer.from('mock data') };
      const mockDecodedContent = 'decoded content';

      (axios.get as jest.Mock).mockResolvedValue(mockResponse);
      (iconv.decode as jest.Mock).mockReturnValue(mockDecodedContent);

      const result = await (crawler as any).fetchPage(
        'http://example.com/page'
      );

      expect(axios.get).toHaveBeenCalledWith('http://example.com/page', {
        responseType: 'arraybuffer',
      });
      expect(iconv.decode).toHaveBeenCalledWith(
        Buffer.from(mockResponse.data),
        'utf-8'
      );
      expect(result).toBe(mockDecodedContent);
    });

    it('should throw an error if fetching fails', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

      await expect(
        (crawler as any).fetchPage('http://example.com/page')
      ).rejects.toThrow('Error fetching page: Network Error');
    });
  });

  describe('crawl', () => {
    it('should crawl and parse the page', async () => {
      const mockHtml = '<html><body>content</body></html>';
      const mockParsedHtml = cheerio.load(mockHtml);

      jest.spyOn(crawler as any, 'fetchPage').mockResolvedValue(mockHtml);
      jest.spyOn(crawler as any, 'parseHtml').mockReturnValue(mockParsedHtml);

      const result = await crawler.crawl('/page');

      expect(crawler['fetchPage']).toHaveBeenCalledWith(
        'http://example.com/page',
        'utf-8'
      );
      expect(crawler['parseHtml']).toHaveBeenCalledWith(mockHtml);
      expect(result).toBe(mockParsedHtml);
    });
  });

  describe('private methods', () => {
    it('should get full URL', () => {
      const result = crawler['getFullUrl']('/page');
      expect(result).toBe('http://example.com/page');
    });

    it('should parse HTML', () => {
      const mockHtml = '<html><body>content</body></html>';
      const result = crawler['parseHtml'](mockHtml);
      expect(result.html()).toBe(cheerio.load(mockHtml).html());
    });
  });
});
