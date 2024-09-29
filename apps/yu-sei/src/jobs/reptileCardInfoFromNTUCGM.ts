import { CheerioCrawler } from '@ygo/crawler';
import { CardsDataType } from '@ygo/schemas';
import fs from 'fs';
import inquirer from 'inquirer';

type CardListInfoByReptileType = {
  title: string;
  effect: string;
  other: string;
};

type CardsDataWithoutIdType = Omit<CardsDataType, '_id'>;

/**
 * 從NTUCGM網站爬取卡牌信息。
 *
 * @param {string} url - 網站URL。
 * @param {string} path - 爬取的路徑。
 * @param {string} setCode - 卡牌集代碼。
 * @param {string} startCardNumber - 開始卡牌號碼。
 * @param {boolean} hasStartCardNumberDuplicate - 是否有開始卡牌號碼的爬蟲標志。
 */
const reptileCardInfoFromNTUCGM = async (
  url: string,
  path: string,
  setCode: string,
  startCardNumber: string,
  hasStartCardNumberDuplicate: boolean
) => {
  const crawler = new CheerioCrawler(url);
  const $ = await crawler.crawl(path);
  const allCardsName = $('b');

  const cardListInfoByReptile = findCardListInfo(
    allCardsName,
    $,
    setCode,
    startCardNumber,
    hasStartCardNumberDuplicate
  );

  const cardsDataList = makeCardListInfoToDBFormat(
    cardListInfoByReptile,
    setCode
  );

  fs.writeFileSync(
    './src/scripts/cardsDataList.json',
    JSON.stringify(cardsDataList, null, 2)
  );
  console.log(`${setCode} Card Data List Get Successfully!`);
};

/**
 * 根據給定的參數，從網頁中提取卡牌信息。
 *
 * @param {cheerio.Cheerio} allCardsName - 包含所有卡牌名稱的Cheerio物件。
 * @param {cheerio.Root} $ - Cheerio的根元素，用于選擇器。
 * @param {string} setCode - 卡牌集代碼。
 * @param {string} startCardNumber - 開始卡牌號碼。
 * @param {boolean} hasStartCardNumberDuplicate - 是否有開始卡牌號碼的爬蟲標志。
 * @returns {CardListInfoByReptileType[]} - 提取到的卡牌信息列表。
 */
const findCardListInfo = (
  allCardsName: cheerio.Cheerio,
  $: cheerio.Root,
  setCode: string,
  startCardNumber: string,
  hasStartCardNumberDuplicate: boolean
): CardListInfoByReptileType[] => {
  let checkCardNumber = hasStartCardNumberDuplicate ? 2 : 1;
  const cardListInfoByReptile: CardListInfoByReptileType[] = [];

  allCardsName.each((_, element) => {
    const keyWord = $(element).text();
    if (!keyWord) return;
    if (keyWord.includes(startCardNumber)) checkCardNumber--;
    if (checkCardNumber) return;
    const hasSetCode = keyWord.includes(setCode);
    if (hasSetCode) {
      const cardInfo: string[] = [];
      let nextDiv = $(element).parent().next('div');

      while (nextDiv.text() !== '') {
        cardInfo.push(nextDiv.text());
        nextDiv = nextDiv.next('div');
      }

      cardListInfoByReptile.push({
        title: keyWord,
        effect: cardInfo.splice(1).join('\n'),
        other: cardInfo[0],
      });
    }
  });

  return cardListInfoByReptile;
};

/**
 * 將從NTUCGM網站爬取的卡牌信息轉換為數據庫格式。
 *
 * @param {CardListInfoByReptileType[]} cardListInfoByReptile - 從NTUCGM網站爬取的卡牌信息列表。
 * @returns {CardsDataWithoutIdType[]} - 轉換後的卡牌信息列表。
 */
const makeCardListInfoToDBFormat = (
  cardListInfoByReptile: CardListInfoByReptileType[],
  setCode: string
): CardsDataWithoutIdType[] => {
  const cardsDataList: CardsDataWithoutIdType[] = [];

  for (const cardInfo of cardListInfoByReptile) {
    const { title, effect, other } = cardInfo;
    const [id, rarity] = title.split(' ').map(value => value.trim());
    let name, otherValue, type, star, attribute, race, atkDef, atk, def;
    if (other) {
      [name, otherValue] = other.split(')');
      [type, star, attribute, race, atkDef] = otherValue
        .trim()
        .split(' ')
        .filter(Boolean)
        .map(value => value.trim());
      [atk, def] = atkDef
        ? atkDef.split('/').map(Number)
        : [undefined, undefined];
    } else {
      name = '';
      type = star = attribute = race = atkDef = atk = def = undefined;
    }

    const cardData = {
      type: type,
      name: name.replace(/\(|\)/g, ''),
      id: id,
      number: '',
      atk: atk ?? null,
      def: def ?? null,
      rarity: mappingRarity(rarity) as any[],
      product_information_type: setCode,
      effect: effect,
      star: star ?? '',
      attribute: attribute ?? type?.includes('魔法') ? '魔' : '陷',
      race: race ?? '',
    } as unknown as CardsDataWithoutIdType;

    cardsDataList.push(cardData);
  }

  return cardsDataList;
};

/**
 * 將稀有度映射為對應的卡牌類型。
 *
 * @param {string} rarity - 稀有度字符串。
 * @returns {string[]} - 對應的卡牌類型列表。
 */
const mappingRarity = (rarity: string): string[] => {
  const rarityMap: { [key: string]: string[] } = {
    // 修改此行以指定索引類型
    ' ': ['普卡'],
    R: ['銀字'],
    SR: ['亮面'],
    UR: ['金亮'],
    SER: ['半鑽'],
    ESR: ['斜鑽'],
    QCSER: ['金鑽'],
  };

  return rarityMap[rarity];
};

const askForInputs = async () => {
  const questions: any[] = [
    {
      type: 'input',
      name: 'url',
      message: '請輸入網站URL:',
    },
    {
      type: 'input',
      name: 'path',
      message: '請輸入爬取的路徑:',
    },
    {
      type: 'input',
      name: 'setCode',
      message: '請輸入卡包號碼:',
    },
    {
      type: 'input',
      name: 'startCardNumber',
      message: '請輸入開始卡牌號碼:',
    },
    {
      type: 'confirm',
      name: 'hasStartCardNumberDuplicate',
      message: '這篇文章是否有重複的開始卡號?',
      default: false,
    },
  ];

  return inquirer.prompt(questions);
};

askForInputs().then(
  ({ url, path, setCode, startCardNumber, hasStartCardNumberDuplicate }) => {
    reptileCardInfoFromNTUCGM(
      url,
      path,
      setCode,
      startCardNumber,
      hasStartCardNumberDuplicate
    );
  }
);
