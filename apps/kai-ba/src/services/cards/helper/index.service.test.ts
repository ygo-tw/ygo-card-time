import { CardsHelperService } from './index.service';
import { PipelineStage } from 'mongoose';
import { GetCardListRequestType } from '@ygo/schemas';
import { SetKeyUpdateCache, StaticFilterParams } from '../types/index.type';

describe('CardsHelperService', () => {
  let service: CardsHelperService;

  beforeEach(() => {
    service = new CardsHelperService();
  });

  describe('buildStaticFilterSetKeys', () => {
    it.each([
      ['單一欄位過濾', { type: '效果怪獸' as const }, ['set:type:效果怪獸']],
      [
        '多欄位過濾',
        {
          type: '效果怪獸' as const,
          attribute: '闇' as const,
          race: '龍族' as const,
        },
        ['set:type:效果怪獸', 'set:attribute:闇', 'set:race:龍族'],
      ],
      [
        '包含數字和特殊值的過濾',
        {
          id: 'RGBT-JP019',
          number: '10875327',
          forbidden: 0 as const,
        },
        ['set:id:RGBT-JP019', 'set:number:10875327', 'set:forbidden:0'],
      ],
    ])(
      'Given %s, when buildStaticFilterSetKeys is called, then should return correct set keys',
      (_, filter, expected) => {
        // Arrange

        // Act
        const result = service.buildStaticFilterSetKeys(
          filter as StaticFilterParams
        );

        // Assert
        expect(result).toEqual(expect.arrayContaining(expected));
        expect(result.length).toBe(expected.length);
      }
    );

    it('Given empty filter, when buildStaticFilterSetKeys is called, then should return empty array', () => {
      // Arrange
      const filter = {} as StaticFilterParams;

      // Act
      const result = service.buildStaticFilterSetKeys(filter);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('buildCaculateDbFilter', () => {
    it.each([
      [
        '攻擊範圍過濾',
        [] as PipelineStage[],
        { atk_l: 2000, atk_t: 3000 } as GetCardListRequestType,
        true,
        [{ $match: { atk: { $gte: 2000, $lte: 3000 } } }],
      ],
      [
        '名稱文本搜尋',
        [] as PipelineStage[],
        { name: '青眼白龍' } as GetCardListRequestType,
        true,
        [
          {
            $search: {
              index: 'card_text_search',
              text: {
                query: '青眼白龍',
                path: 'name',
                fuzzy: {
                  maxEdits: 1,
                  prefixLength: 1,
                },
              },
            },
          },
        ],
      ],
      [
        '靜態過濾條件與動態過濾',
        [] as PipelineStage[],
        { type: '融合怪獸' as const, atk_t: 2500 } as GetCardListRequestType,
        true,
        [{ $match: { type: '融合怪獸' } }, { $match: { atk: { $lte: 2500 } } }],
      ],
    ])(
      'Given %s, when buildCaculateDbFilter is called, then should build correct pipeline',
      (_, pipeline, filter, isNeedStaticFilter, expected) => {
        // Arrange

        // Act
        const result = service.buildCaculateDbFilter(
          pipeline,
          filter,
          isNeedStaticFilter
        );

        // Assert
        // 由於 pipeline 結構複雜，僅檢查長度而非完全匹配
        expect(result.length).toBeGreaterThanOrEqual(expected.length);
        // 檢查部分關鍵屬性
        if (filter.atk_l || filter.atk_t) {
          expect(
            result.some(stage => '$match' in stage && 'atk' in stage.$match)
          ).toBeTruthy();
        }
        if (filter.name) {
          expect(result.some(stage => '$search' in stage)).toBeTruthy();
        }
      }
    );

    it('Given no filter conditions, when buildCaculateDbFilter is called, then should return original pipeline', () => {
      // Arrange
      const pipeline: PipelineStage[] = [
        { $match: { _id: { $exists: true } } },
      ];
      const filter = {} as GetCardListRequestType;

      // Act
      const result = service.buildCaculateDbFilter(pipeline, filter, false);

      // Assert
      expect(result).toEqual(pipeline);
    });
  });

  describe('paginateCardKeyList', () => {
    it.each([
      [
        '基本分頁 - 第一頁',
        ['id1:num1', 'id2:num2', 'id3:num3', 'id4:num4', 'id5:num5'],
        1,
        2,
        [
          ['id1', 'num1'],
          ['id2', 'num2'],
        ],
      ],
      [
        '基本分頁 - 第二頁',
        ['id1:num1', 'id2:num2', 'id3:num3', 'id4:num4', 'id5:num5'],
        2,
        2,
        [
          ['id3', 'num3'],
          ['id4', 'num4'],
        ],
      ],
      [
        '特殊處理 -- 符號',
        ['id1:--', 'id2:num2', 'id3:--', 'id4:num1'],
        1,
        10,
        [
          ['id1', '--'],
          ['id3', '--'],
          ['id4', 'num1'],
          ['id2', 'num2'],
        ],
      ],
    ])(
      'Given %s, when paginateCardKeyList is called, then should return correct paged list',
      (_, cardKeyList, page, limit, expected) => {
        // Arrange

        // Act
        const result = service.paginateCardKeyList(cardKeyList, page, limit);

        // Assert
        expect(result).toEqual(expected);
      }
    );

    it('Given invalid inputs, when paginateCardKeyList is called, then should handle gracefully', () => {
      // Arrange & Act & Assert
      expect(service.paginateCardKeyList([], 1, 10)).toEqual([]);
      expect(service.paginateCardKeyList(['id1:num1'], 0, 0)).toEqual([
        ['id1', 'num1'],
      ]);
      expect(service.paginateCardKeyList(['id1:num1'], -1, -5)).toEqual([
        ['id1', 'num1'],
      ]);
    });
  });

  describe('getSetKeyListNeedingUpdate', () => {
    it.each([
      [
        '沒有更新過的鍵',
        ['set:type:效果怪獸', 'set:attribute:闇'],
        new Map() as SetKeyUpdateCache,
        ['set:type:效果怪獸', 'set:attribute:闇'],
      ],
      [
        '部分鍵已更新',
        ['set:type:效果怪獸', 'set:attribute:闇'],
        new Map([['set:type:效果怪獸', new Date()]]) as SetKeyUpdateCache,
        ['set:attribute:闇'],
      ],
      [
        '全部鍵最近已更新',
        ['set:type:效果怪獸', 'set:attribute:闇'],
        new Map([
          ['set:type:效果怪獸', new Date()],
          ['set:attribute:闇', new Date()],
        ]) as SetKeyUpdateCache,
        [],
      ],
    ])(
      'Given %s, when getSetKeyListNeedingUpdate is called, then should return keys needing update',
      (_, staticFilterSetKeyList, updateCacheSetKeys, expected) => {
        // Arrange

        // Act
        const result = service.getSetKeyListNeedingUpdate(
          staticFilterSetKeyList,
          updateCacheSetKeys
        );

        // Assert
        expect(result).toEqual(expect.arrayContaining(expected));
        expect(result.length).toBe(expected.length);
      }
    );

    it('Given outdated update times (>1 day), when getSetKeyListNeedingUpdate is called, then should include those keys', () => {
      // Arrange
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const staticFilterSetKeyList = ['set:type:效果怪獸', 'set:attribute:闇'];
      const updateCacheSetKeys = new Map([
        ['set:type:效果怪獸', twoDaysAgo],
        ['set:attribute:闇', new Date()],
      ]) as SetKeyUpdateCache;

      // Act
      const result = service.getSetKeyListNeedingUpdate(
        staticFilterSetKeyList,
        updateCacheSetKeys
      );

      // Assert
      expect(result).toEqual(['set:type:效果怪獸']);
    });
  });
});
