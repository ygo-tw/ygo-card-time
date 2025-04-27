import { DataAccessService } from '@ygo/mongo-server';
import { CustomLogger } from '../utils';
import { CheerioCrawler } from '@ygo/crawler';
import { CardsDataType, DataAccessEnum } from '@ygo/schemas';

export type BoxInfoType = {
  price: number;
  rarity: string;
  time: string;
};
export type BoxInfoMapType = Map<string, Array<BoxInfoType>>;

export class YuyuPriceService {
  private crawler: CheerioCrawler;
  private nowPageCardList: CardsDataType[] = [];
  private readonly qcacQCSERuleList: Record<
    string,
    { tagList: string[]; counter: number }
  > = {
    'QCAC-JP001': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP002': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP004': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP005': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP010': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP012': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP014': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP015': {
      tagList: [''],
      counter: 0,
    },
    'QCAC-JP016': {
      tagList: [''],
      counter: 0,
    },
    'QCAC-JP017': {
      tagList: [''],
      counter: 0,
    },
    'QCAC-JP018': {
      tagList: ['-A', '-B', '-E', '-G', '-C', '-I', '-J'],
      counter: 0,
    },
    'QCAC-JP019': {
      tagList: ['-D', '-A'],
      counter: 0,
    },
    'QCAC-JP021': {
      tagList: ['-A', '-H', '-B', '-G', '-K'],
      counter: 0,
    },
    'QCAC-JP024': {
      tagList: [''],
      counter: 0,
    },
    'QCAC-JP025': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP029': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP030': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP031': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP032': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP033': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP034': {
      tagList: ['-A', '-B'],
      counter: 0,
    },
    'QCAC-JP040': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP050': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP051': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP069': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP071': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP073': {
      tagList: ['-A'],
      counter: 0,
    },
    'QCAC-JP074': {
      tagList: ['-A'],
      counter: 0,
    },
  };
  private readonly qcacSERuleList: Record<
    string,
    { tagList: string[]; counter: number }
  > = {
    'QCAC-JP018': {
      tagList: ['-A', '-B', '-E', '-G', '-C', '-I'],
      counter: 0,
    },
    'QCAC-JP019': {
      tagList: ['', '-D'],
      counter: 0,
    },
    'QCAC-JP021': {
      tagList: ['-A', '-H', '-B', '-G'],
      counter: 0,
    },
    'QCAC-JP022': {
      tagList: ['-A', '-I', '-D', '-E'],
      counter: 0,
    },
    'QCAC-JP024': {
      tagList: ['-A', ''],
      counter: 0,
    },
    'QCAC-JP034': {
      tagList: ['-A', '-B', '-C'],
      counter: 0,
    },
    'QCAC-JP035': {
      tagList: ['-A', '-B', '-C'],
      counter: 0,
    },
  };
  private readonly qcacUrRuleList: string[] = [
    'QCAC-JP018',
    'QCAC-JP021',
    'QCAC-JP022',
  ];

  // 多種異圖卡片名稱清單
  private readonly multiSpecialImageCardList: string[] = [
    'ブラック・マジシャン',
    'ブラック・マジシャン・ガール',
    '青眼の白龍',
    'オッドアイズ・ペンデュラム・ドラゴン',
    'No.39 希望皇ホープ',
    '結束と絆の魔導師',
    'ハーピィの羽根帚',
    '融合',
    '閃刀姫-レイ',
    '増援',
    'デーモンの召喚',
  ];

  private nowSpecialImageCardInfo: {
    cardName: string;
    counter: number;
  } = {
    cardName: '',
    counter: 0,
  };

  private errorCardList: string[] = [];
  private crawledCardList: string[] = [];

  constructor(
    private readonly dataAccessService: DataAccessService,
    private readonly logger: CustomLogger
  ) {
    this.crawler = new CheerioCrawler('https://yuyu-tei.jp/');
    this.logger.info('Start Yuyu Price Service');
  }

  public async getYuyuprice() {
    await this.dataAccessService.ensureInitialized();
    try {
      const links = await this.getAllLinks();
      for (const link of links) {
        // 跳過 TK 系列
        if (link.includes('tk0')) {
          this.logger.info(`=========== 跳過 ${link} ===========`);
          continue;
        }
        this.logger.info(`=========== 開始爬取 ${link} ===========`);
        const packageType = link.split('/').pop()?.toUpperCase();
        if (packageType)
          this.nowPageCardList =
            await this.dataAccessService.find<CardsDataType>(
              DataAccessEnum.CARDS,
              {
                product_information_type: packageType,
              },
              {
                projection: {
                  id: 1,
                  number: 1,
                },
              }
            );
        const boxInfo = await this.getBoxAllCardsInfo(link);
        await this.syncBoxInfoToDb(boxInfo);
        await this.delay(15000);
      }
      this.logger.info(`=========== 爬取完成 ===========`);
    } catch (error) {
      console.error('爬蟲錯誤:', error);
    }

    return {
      errorCardList: this.errorCardList,
      crawledCardList: this.crawledCardList,
    };
  }

  /**
   * 同步卡盒資訊到資料庫
   * @param boxInfo 卡盒資訊Map
   */
  private async syncBoxInfoToDb(boxInfo: BoxInfoMapType) {
    const today = new Date().toISOString().split('T')[0];

    for (const [cardId, cardInfoList] of boxInfo.entries()) {
      // 測試用
      // if (cardId !== 'LEDE-JP000-A') continue;
      try {
        const cardIdArray = cardId.split('-');
        const id = cardIdArray[0] + '-' + cardIdArray[1];
        const cardNumberTag = cardIdArray[2];
        const filter = {
          id: { $regex: id },
          ...(cardNumberTag && { number: { $regex: /[A-Z]/ } }),
          $or: [
            { price_yuyu: { $exists: false } },
            { 'price_yuyu.time': { $not: new RegExp(today) } },
          ],
        };
        const result =
          await this.dataAccessService.findAndUpdate<CardsDataType>(
            DataAccessEnum.CARDS,
            filter,
            {
              $push: {
                price_yuyu: {
                  $each: cardInfoList,
                },
              },
            },
            { upsert: false }
          );

        if (result?.id) {
          this.logger.info(`成功更新卡片 ${cardId} 的價格資訊`);
        } else {
          const card = await this.dataAccessService.findOne<CardsDataType>(
            DataAccessEnum.CARDS,
            { id: { $regex: id } },
            { projection: { id: 1 } }
          );
          if (card) {
            this.logger.warn(`卡片 ${cardId} 已有今日數據`);
          } else {
            this.logger.warn(`沒有此卡片 ${cardId} 的資料`);
            this.crawledCardList.push(cardId);
          }
        }
      } catch (error) {
        this.logger.error(
          `更新卡片 ${cardId} 價格資訊失敗: ${JSON.stringify(error)}`
        );
        this.errorCardList.push(cardId);
      }
    }
  }

  /**
   * 取得所有卡片連結
   * @returns 卡片連結陣列
   */
  private async getAllLinks(): Promise<string[]> {
    const $ = await this.crawler.crawl('top/ygo');
    return $('[id*="side-sell-ygo-s-"]')
      .map((_, element) => $(element).attr('href'))
      .get()
      .filter((href): href is string => !!href);
  }

  /**
   * 取得所有卡盒個版本的資料
   * @param link 卡片連結
   * @returns 卡盒資料Map
   */
  private async getBoxAllCardsInfo(link: string): Promise<BoxInfoMapType> {
    const path = link.split('jp/')[1];
    const $ = await this.crawler.crawl(path);
    const boxInfo = new Map<string, Array<BoxInfoType>>();

    $('.cards-list').each(async (_, rarity) => {
      const rarityName = this.rarityMappingToTw(
        this.findText($(rarity), 'h4, h3, .rarity-title').split(' ')[0]
      );
      const cardList = $(rarity).find('.card-product');
      if (cardList.length === 0) return;

      for (const card of Array.from(cardList)) {
        const cardData = this.findCardPrice($(card), rarityName);
        if (!cardData) continue;
        const { cardId, cardInfo } = cardData;
        if (cardId === '') continue;
        if (!boxInfo.has(cardId)) {
          boxInfo.set(cardId, []);
        }
        boxInfo.get(cardId)!.push(cardInfo);
      }
    });

    return boxInfo;
  }

  /**
   * 取得卡片價格
   * @param $ cheerio.Root
   * @param card 卡片元素
   * @param rarityName 稀有度名稱
   * @returns 卡片資訊
   */
  private findCardPrice(
    card: cheerio.Cheerio,
    rarityName: string
  ): { cardId: string; cardInfo: BoxInfoType } | null {
    const notFindCardKeyWordList = ['復刻版', 'ロゴ無し'];
    const cardName = this.findText(card, 'h4.text-primary.fw-bold');
    if (notFindCardKeyWordList.some(keyword => cardName.includes(keyword))) {
      return null;
    }
    let cardId = this.findText(
      card,
      '.card-id, span.border, [class*="card-id"]'
    );

    cardId = this.specialRule(cardName, cardId, rarityName);

    const priceText = this.findText(
      card,
      '.price, strong.text-end, [class*="price"]'
    );
    const priceNumber = parseInt(priceText.replace(/[^0-9]/g, ''), 10);

    const cardInfo = {
      price: priceNumber,
      rarity: rarityName,
      time: new Date().toISOString(),
    };

    return {
      cardId,
      cardInfo,
    };
  }

  /**
   * 特殊規則
   * @param cardName 卡片名稱
   * @param cardId 卡片ID
   * @param rarityName 稀有度名稱
   * @returns 處理後的卡片ID
   */
  private specialRule(
    cardName: string,
    cardId: string,
    rarityName: string
  ): string {
    const specialImage = 'イラスト違い版';

    // 統一處理 QCAC QCSE 和 QCAC SE 特殊規則
    if (
      cardId.includes('QCAC') &&
      (rarityName === 'QCSE' || rarityName === 'SE')
    ) {
      return this.handleQCACSpecialCase(
        cardId,
        cardName,
        rarityName,
        specialImage
      );
    }
    // QCAC UR 特殊規則
    else if (cardId.includes('QCAC') && rarityName === 'UR') {
      return this.qcacUrRuleList.includes(cardId) ? `${cardId}-A` : cardId;
    } else if (
      !cardName.includes(specialImage) &&
      !this.multiSpecialImageCardList.includes(cardName)
    ) {
      // 非異圖卡，直接返回
      return cardId;
    } else {
      // 其餘異圖卡處理
      if (!this.multiSpecialImageCardList.includes(cardName)) {
        return `${cardId}-A`; // 不在多種異圖清單中，直接返回標準異圖格式
      }

      const matchedCard = this.nowPageCardList.filter(
        card => card.id === cardId && card.number && /[A-Z]/i.test(card.number)
      );

      if (matchedCard.length > 1) {
        this.nowSpecialImageCardInfo.cardName = cardName;
        const newId = `${cardId}-${matchedCard[this.nowSpecialImageCardInfo.counter]?.number?.slice(-1) || 'A'}`;
        this.nowSpecialImageCardInfo.counter++;
        // 若計數器達到卡片數量，重置計數器並清空卡片名稱
        if (this.nowSpecialImageCardInfo.counter === matchedCard.length) {
          this.nowSpecialImageCardInfo.counter = 0;
          this.nowSpecialImageCardInfo.cardName = '';
        }
        return newId;
      } else
        // 若找到符合條件的卡片，使用其編號末尾字母；否則使用預設A
        return `${cardId}-${matchedCard[0]?.number?.slice(-1) || ''}`;
    }
  }

  /**
   * 統一處理 QCAC QCSE 和 QCAC SE 特殊規則
   * @param cardId 卡片ID
   * @param cardName 卡片名稱
   * @param rarityName 稀有度名稱
   * @param specialImage 特殊規則
   * @returns 處理後的卡片ID
   */
  private handleQCACSpecialCase(
    cardId: string,
    cardName: string,
    rarityName: string,
    specialImage: string
  ): string {
    // 決定要使用哪個規則列表
    const ruleList =
      rarityName === 'QCSE' ? this.qcacQCSERuleList : this.qcacSERuleList;

    // 檢查卡片ID是否在規則列表中
    if (Object.keys(ruleList).includes(cardId)) {
      const { tagList, counter } = ruleList[cardId];
      // 遞增計數器
      if (rarityName === 'QCSE') {
        this.qcacQCSERuleList[cardId].counter++;
      } else {
        this.qcacSERuleList[cardId].counter++;
      }
      return `${cardId}${tagList[counter]}`;
    } else {
      // 不在規則列表中的處理
      return cardName.includes(specialImage) ? `${cardId}-A` : cardId;
    }
  }

  /**
   * 將稀有度名稱映射為中文
   * @param rarity 稀有度名稱
   * @returns 中文稀有度名稱
   */
  private rarityMappingToTw(rarity: string) {
    // 後續實現機制
    return rarity;
  }

  /**
   * 延遲
   * @param ms 延遲時間
   * @returns 延遲後的Promise
   */
  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 從元素中獲取文本，執行查找、擷取文本和修剪操作
   * @param $ Cheerio 實例
   * @param element 元素
   * @param selector CSS選擇器
   * @returns 處理後的文本
   */
  private findText($: cheerio.Cheerio, selector: string): string {
    return $.find(selector).text().trim();
  }
}
