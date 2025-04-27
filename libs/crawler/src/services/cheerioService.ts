import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';

export class CheerioCrawler {
  public baseUrl: string;

  /**
   * 初始化爬蟲並設置基礎 URL
   * @param {string} baseUrl - The base URL for the crawler.
   */
  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * 設置新的基礎 URL
   * @param {string} url - The new base URL.
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * 爬取並解析指定 URL
   * @param {string} path - The path to crawl.
   * @param {string} [encoding='utf-8'] - The encoding to use for decoding the page content.
   * @returns {Promise<cheerio.Root>} - The Cheerio object representing the parsed HTML.
   */
  public async crawl(
    path: string,
    encoding: string = 'utf-8'
  ): Promise<cheerio.Root> {
    const fullUrl = this.getFullUrl(path);
    const html = await this.fetchPage(fullUrl, encoding);
    return this.parseHtml(html);
  }

  /**
   * 獲取頁面內容並進行字符編碼解析
   * @param {string} url - The URL to fetch the page from.
   * @param {string} [encoding='utf-8'] - The encoding to use for decoding the page content.
   * @returns {Promise<string>} - The decoded page content.
   * @throws {Error} - Throws an error if the page cannot be fetched.
   */
  private async fetchPage(
    url: string,
    encoding: string = 'utf-8'
  ): Promise<string> {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const decodedContent = iconv.decode(Buffer.from(response.data), encoding);
      return decodedContent;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error fetching page: ${error.message}`);
      } else {
        throw new Error('Error fetching page');
      }
    }
  }

  /**
   * 獲取完整的 URL
   * @param {string} path - The path to append to the base URL.
   * @returns {string} - The full URL.
   */
  private getFullUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  /**
   * 解析 HTML 並返回 Cheerio 物件
   * @param {string} html - The HTML content to parse.
   * @returns {cheerio.Root} - The Cheerio object representing the parsed HTML.
   */
  private parseHtml(html: string): cheerio.Root {
    return cheerio.load(html);
  }
}

export type CheerioRoot = cheerio.Root;
