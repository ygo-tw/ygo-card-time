import { DataAccessService } from '@ygo/mongo-server';
import { CardsDataType, DataAccessEnum } from '@ygo/schemas';
import { CustomLogger } from '../utils';
enum PriceType {
  PRICE_INFO = 'price_info',
  PRICE_YUYU = 'price_yuyu',
}

export class PriceInfoArchiveService {
  private readonly logger: CustomLogger | Console;

  constructor(
    private readonly dataAccessService: DataAccessService,
    logger?: CustomLogger
  ) {
    this.logger = logger ?? console;
  }

  public async archivePriceInfo() {
    await this.dataAccessService.ensureInitialized();
    await this.archivePrice(PriceType.PRICE_INFO);
  }

  private async archivePrice(priceType: PriceType) {
    // 計算90天前的日期
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const cutoffDate = ninetyDaysAgo.toISOString().split('T')[0]; // 格式: YYYY-MM-DD

    this.logger.info(`開始封存 ${priceType} 超過 ${cutoffDate} 的價格數據`);

    const batchSize = 100;
    let processedTotal = 0;
    let batchCount = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      // 每次查詢1000筆尚未處理的卡片
      const query = {
        [`${priceType}.time`]: { $lt: cutoffDate },
      };

      // 查詢當前批次
      const cardsWithOldData = await this.dataAccessService.find<CardsDataType>(
        DataAccessEnum.CARDS,
        query,
        { id: 1, number: 1, [priceType]: 1 },
        { limit: batchSize }
      );

      // 如果沒有更多數據可以處理，則跳出循環
      if (cardsWithOldData.length === 0) {
        hasMoreData = false;
        break;
      }

      batchCount++;
      this.logger.info(
        `處理第 ${batchCount} 批，含 ${cardsWithOldData.length} 張卡片`
      );

      await this.processBatch(cardsWithOldData, priceType, cutoffDate);

      processedTotal += cardsWithOldData.length;
      this.logger.info(`已完成處理 ${processedTotal} 張卡片`);
    }

    this.logger.info(`完成所有封存，總共處理 ${processedTotal} 張卡片`);
  }

  private normalizePriceData(
    priceData: {
      price_lowest?: number | null | undefined;
      price_avg?: number | null | undefined;
      price?: number | null | undefined;
      rarity: string;
      time: string;
    }[]
  ) {
    return priceData.map(p => ({
      ...p,
      price_lowest: (p.price_lowest as unknown) === '-' ? null : p.price_lowest,
      price_avg: (p.price_avg as unknown) === '-' ? null : p.price_avg,
      price: (p.price as unknown) === '-' ? null : p.price,
    }));
  }

  private async processBatch(
    cards: CardsDataType[],
    priceType: PriceType,
    cutoffDate: string
  ) {
    // 準備批量操作
    const archiveOps = [];
    const updateOps = [];

    for (const card of cards) {
      // 對每張卡片處理舊數據
      const priceData = card[priceType] || [];
      const oldPrices = this.normalizePriceData(
        priceData.filter(p => p.time < cutoffDate)
      );

      const newPrices = this.normalizePriceData(
        priceData.filter(p => p.time >= cutoffDate)
      );
      if (oldPrices.length > 0) {
        // 準備封存操作
        archiveOps.push({
          updateOne: {
            filter: {
              id: card.id,
              number: card.number,
              price_type: priceType,
            },
            update: {
              $setOnInsert: {
                id: card.id,
                number: card.number,
                price_type: priceType,
                createdAt: new Date().toISOString(),
              },
              $addToSet: {
                price_data: {
                  $each: oldPrices,
                },
              },
              $set: { lastUpdatedAt: new Date().toISOString() },
            },
            upsert: true,
          },
        });

        // 準備更新原始卡片操作
        updateOps.push({
          updateOne: {
            filter: { _id: card._id },
            update: { $set: { [priceType]: newPrices } },
          },
        });
      }
    }

    // 執行批量操作
    if (archiveOps.length > 0) {
      await this.dataAccessService.bulkWrite(
        DataAccessEnum.PRICE_ARCHIVE,
        archiveOps
      );
    }

    if (updateOps.length > 0) {
      await this.dataAccessService.bulkWrite(DataAccessEnum.CARDS, updateOps);
    }

    return { archivedCount: archiveOps.length, updatedCount: updateOps.length };
  }
}
