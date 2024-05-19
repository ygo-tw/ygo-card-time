import { CheerioCrawler } from '@ygo/crawler';
import { DataAccessService } from '@ygo/mongo-server';
export class YgoJpInfo {
  private crawler: CheerioCrawler;
  private dataAccessService: DataAccessService;
  constructor(crawler: CheerioCrawler, dataAccessService: DataAccessService) {
    this.crawler = crawler;
    this.dataAccessService = dataAccessService;
  }

  public async updateCardsJPInfo() {
    // const allData = await this.dataAccessService
    const $ = await this.crawler.crawl('/');

    console.log($('#card-list').text());
  }
}
