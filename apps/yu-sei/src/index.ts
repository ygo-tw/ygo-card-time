import { envRunner } from './app';
import figlet from 'figlet';
import { CheerioCrawler, CheerioRoot } from '@ygo/crawler';

const main = async () => {
  envRunner();
  console.log(
    figlet.textSync('YGO Reptile!!!', {
      font: 'Ghost',
    })
  );

  const crawler = new CheerioCrawler('https://www.db.yugioh-card.com');

  const $: CheerioRoot = await crawler.crawl(
    '/yugiohdb/faq_search.action?ope=4&cid=4555&request_locale=ja',
    'utf-8'
  );

  console.log(
    $('#card_text')
      .map((_, elem) => $(elem).text().trim())
      .get()
  );
};

main();
