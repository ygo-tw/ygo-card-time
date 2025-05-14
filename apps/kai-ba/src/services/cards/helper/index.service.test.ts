import { CardsHelperService } from './index.service';
import { SetKeyUpdateCache } from '../types/index.type';

describe('CardsHelperService', () => {
  let helperService: CardsHelperService;

  beforeEach(() => {
    helperService = new CardsHelperService();
  });

  describe('buildStaticFilterSetKeys', () => {
    it.each([
      ['單一過濾條件', { type: '效果怪獸' as const }, ['set:type:效果怪獸']],
      [
        '多個過濾條件',
        {
          type: '效果怪獸' as const,
          attribute: '闇' as const,
          star: '等級4' as const,
        },
        ['set:type:效果怪獸', 'set:attribute:闇', 'set:star:等級4'],
      ],
      [
        '過濾條件包含陣列',
        {
          rarity: ['普卡', '亮面'],
        },
        ['set:rarity:普卡,亮面'],
      ],
      ['空過濾條件', {}, []],
    ])(
      'Given %s, when buildStaticFilterSetKeys is called, then should return correct set keys',
      (_, filter, expected) => {
        // Arrange & Act
        const result = helperService.buildStaticFilterSetKeys(filter as any);

        // Assert
        expect(result).toEqual(expected);
      }
    );
  });

  describe('buildCaculateDbFilter', () => {
    it.each([
      [
        '名稱搜尋',
        [{}] as any,
        { name: '龍' },
        false,
        [
          {},
          {
            $search: {
              index: 'card_text_search',
              text: {
                query: '龍',
                path: 'name',
                fuzzy: { maxEdits: 1, prefixLength: 1 },
              },
            },
          },
        ],
      ],
      [
        '效果搜尋',
        [{}] as any,
        { effect: '破壞' },
        false,
        [
          {},
          {
            $search: {
              index: 'card_text_search',
              text: {
                query: '破壞',
                path: 'effect',
                fuzzy: { maxEdits: 1, prefixLength: 1 },
              },
            },
          },
        ],
      ],
      [
        '名稱和效果搜尋',
        [{}] as any,
        { name: '龍', effect: '破壞' },
        false,
        [
          {},
          {
            $search: {
              index: 'card_text_search',
              compound: {
                must: [
                  {
                    text: {
                      query: '龍',
                      path: 'name',
                      fuzzy: { maxEdits: 1, prefixLength: 1 },
                    },
                  },
                  {
                    text: {
                      query: '破壞',
                      path: 'effect',
                      fuzzy: { maxEdits: 1, prefixLength: 1 },
                    },
                  },
                ],
              },
              score: { boost: { value: 1.5 } },
            },
          },
        ],
      ],
      [
        '包含數值範圍',
        [{}] as any,
        { atk_l: 1000, atk_t: 2000, def_l: 500, def_t: 1500 },
        false,
        [
          {},
          {
            $match: {
              atk: { $gte: 1000, $lte: 2000 },
              def: { $gte: 500, $lte: 1500 },
            },
          },
        ],
      ],
      [
        '包含靜態過濾條件',
        [{}] as any,
        { type: '效果怪獸', attribute: '闇' },
        true, // 需要包含靜態過濾
        [{}, { $match: { type: '效果怪獸', attribute: '闇' } }],
      ],
    ])(
      'Given %s, when buildCaculateDbFilter is called, then should return correct pipeline',
      (_, pipeline, filter, isNeedStaticFilter, expected) => {
        // Arrange & Act
        const result = helperService.buildCaculateDbFilter(
          pipeline,
          filter as any,
          isNeedStaticFilter
        );

        // Assert
        expect(result).toEqual(expected);
      }
    );
  });

  describe('paginateCardKeyList', () => {
    it.each([
      [
        '基本分頁',
        ['oid_id1', 'oid_id2', 'oid_id3', 'oid_id4', 'oid_id5'],
        1,
        2,
        ['oid_id1', 'oid_id2'],
      ],
      [
        '第二頁',
        ['oid_id1', 'oid_id2', 'oid_id3', 'oid_id4', 'oid_id5'],
        2,
        2,
        ['oid_id3', 'oid_id4'],
      ],
      [
        '最後一頁不足',
        ['oid_id1', 'oid_id2', 'oid_id3', 'oid_id4', 'oid_id5'],
        3,
        2,
        ['oid_id5'],
      ],
      ['頁碼超出範圍', ['oid_id1', 'oid_id2', 'oid_id3'], 4, 2, []],
      ['空列表', [], 1, 10, []],
    ])(
      'Given %s, when paginateCardKeyList is called, then should return correct paged list',
      (_, cardIdList, page, limit, expected) => {
        // Arrange & Act
        const result = helperService.paginateCardKeyList(
          cardIdList,
          page,
          limit
        );

        // Assert
        expect(result).toEqual(expected);
      }
    );

    it('Given invalid page and limit, when paginateCardKeyList is called, then should handle safely', () => {
      // Arrange
      const cardIdList = [
        'oid_id1',
        'oid_id2',
        'oid_id3',
        'oid_id4',
        'oid_id5',
      ];
      const invalidPage = 0;
      const invalidLimit = 0;

      // Act
      const result = helperService.paginateCardKeyList(
        cardIdList,
        invalidPage,
        invalidLimit
      );

      // Assert
      expect(result).toEqual(['oid_id1']); // 強制頁碼為1，筆數為1
    });
  });

  describe('getSetKeyListNeedingUpdate', () => {
    it.each([
      [
        '全部需要更新',
        ['set:type:效果怪獸', 'set:attribute:闇'],
        new Map<string, Date>(),
        ['set:type:效果怪獸', 'set:attribute:闇'],
      ],
      [
        '部分需要更新',
        ['set:type:效果怪獸', 'set:attribute:闇'],
        new Map<string, Date>([
          ['set:type:效果怪獸', new Date()], // 今天更新的
          [
            'set:attribute:闇',
            new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 兩天前更新的
          ],
        ]),
        ['set:attribute:闇'], // 只有超過一天的需要更新
      ],
      [
        '都不需要更新',
        ['set:type:效果怪獸', 'set:attribute:闇'],
        new Map<string, Date>([
          ['set:type:效果怪獸', new Date()],
          ['set:attribute:闇', new Date()],
        ]),
        [], // 都是今天更新的，不需要更新
      ],
    ])(
      'Given %s, when getSetKeyListNeedingUpdate is called, then should return correct set keys',
      (_, staticFilterSetKeyList, updateCacheSetKeys, expected) => {
        // Arrange & Act
        const result = helperService.getSetKeyListNeedingUpdate(
          staticFilterSetKeyList,
          updateCacheSetKeys as SetKeyUpdateCache
        );

        // Assert
        expect(result).toEqual(expected);
      }
    );
  });
});
