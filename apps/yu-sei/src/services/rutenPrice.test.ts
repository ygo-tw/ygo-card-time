import { RutenService } from './rutenPrice';
import { DataAccessService } from '@ygo/mongo-server';
import { RutenPriceDetailResponse } from '@ygo/schemas';
import { PriceCalculator } from '../utils/priceCalculator';
import axios from 'axios';
import dayjs from 'dayjs';
import { createLogger } from 'winston';

jest.mock('@ygo/mongo-server');
jest.mock('axios');
jest.mock('winston', () => {
  const actualWinston = jest.requireActual('winston');

  return {
    ...actualWinston,
  };
});
jest.mock('nanospinner', () => {
  const actualNanoSpinner = jest.requireActual('nanospinner');
  return {
    ...actualNanoSpinner,
  };
});

interface MockCard {
  id: string;
  rarity: string[];
  number: number;
}

describe('RutenService', () => {
  let rutenService: RutenService;
  let mockDataAccessService: jest.Mocked<DataAccessService>;
  let mockLogger: any;

  beforeEach(() => {
    jest.resetAllMocks();
    mockDataAccessService = {
      find: jest.fn(),
      findAndUpdate: jest.fn(),
    } as unknown as jest.Mocked<DataAccessService>;
    mockLogger = createLogger({
      level: 'info',
      silent: true,
    });

    const mockCalculatePrices = jest.spyOn(PriceCalculator, 'calculatePrices');
    mockCalculatePrices.mockReturnValue({
      minPrice: 100,
      averagePrice: 125,
    });

    rutenService = new RutenService(mockDataAccessService, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRutenPrice', () => {
    it.each([
      [
        'with multiple cards having valid price information',
        [
          { id: 'CARD1', rarity: ['普通', '白鑽'], number: 1 } as MockCard,
          { id: 'CARD2', rarity: ['普通'], number: 2 } as MockCard,
        ],
        ['CARD1', 'CARD2'],
      ],
      ['with no explicitly provided cards', undefined, ['DB1', 'DB2']],
      ['with empty cards array', [], []],
    ])(
      'Given %s, when getRutenPrice is called, then should process Ruten prices correctly',
      async (_, cards, expectedSuccessIds) => {
        if (cards === undefined) {
          const dbCards = [
            { id: 'DB1', rarity: ['普通'], number: 1 } as MockCard,
            { id: 'DB2', rarity: ['普通'], number: 2 } as MockCard,
          ];
          mockDataAccessService.find.mockResolvedValue(dbCards);
        }

        (rutenService as any).preProcessing = jest
          .fn()
          .mockResolvedValue({ searchName: 'Test', rarity: ['普通', '白鑽'] });

        (rutenService as any).getPriceByRarity = jest.fn().mockResolvedValue({
          rarity: '普通',
          price_lowest: 100,
          price_avg: 125,
        });

        (rutenService as any).isPriceInfoValid = jest
          .fn()
          .mockReturnValue(false);

        const result = await rutenService.getRutenPrice(cards as any);

        if ((cards && cards.length > 0) || cards === undefined) {
          expect(mockDataAccessService.findAndUpdate).toHaveBeenCalled();
          expect(result.successIds).toEqual(expectedSuccessIds);
          expect(result.updateFailedId).toEqual([]);
          expect(result.noPriceId).toEqual([]);
        } else {
          expect(result.successIds).toEqual([]);
        }
      }
    );

    it('should handle update failures', async () => {
      const mockCards: MockCard[] = [
        { id: 'CARD1', rarity: ['普通'], number: 1 } as MockCard,
      ];
      (rutenService as any).preProcessing = jest
        .fn()
        .mockResolvedValue({ searchName: 'Test', rarity: ['普通'] });
      (rutenService as any).getPriceByRarity = jest.fn().mockResolvedValue({
        rarity: '普通',
        price_lowest: 100,
        price_avg: 125,
      });
      (rutenService as any).isPriceInfoValid = jest.fn().mockReturnValue(false);
      mockDataAccessService.findAndUpdate.mockRejectedValue(
        new Error('Update failed')
      );

      const result = await rutenService.getRutenPrice(mockCards as any);

      expect(result.updateFailedId).toEqual(['CARD1']);
      expect(result.noPriceId).toEqual([]);
    });
  });

  describe('isPriceInfoValid', () => {
    it.each([
      [
        'valid price information',
        {
          time: '2023-05-19T12:00:00Z',
          rarity: 'common',
          price_lowest: 10,
          price_avg: 20,
        },
        null,
      ],
      [
        'null prices',
        {
          time: '2023-05-19T12:00:00Z',
          rarity: 'common',
          price_lowest: null,
          price_avg: null,
        },
        ['price_lowest', 'price_avg'],
      ],
      [
        'zero prices',
        {
          time: '2023-05-19T12:00:00Z',
          rarity: 'common',
          price_lowest: 0,
          price_avg: 0,
        },
        ['price_lowest', 'price_avg'],
      ],
      [
        'mixed invalid prices',
        {
          time: '2023-05-19T12:00:00Z',
          rarity: 'common',
          price_lowest: null,
          price_avg: 0,
        },
        ['price_lowest', 'price_avg'],
      ],
    ])(
      'Given %s, when isPriceInfoValid is called, then should return correct validation result',
      (_, priceInfo, expected) => {
        const result = (rutenService as any).isPriceInfoValid(priceInfo);

        expect(result).toEqual(expected);
      }
    );
  });

  describe('getPriceByRarity', () => {
    it.each([
      [
        'product found with valid prices',
        {
          rarity: '普通卡',
          searchName: 'BlueEyes',
          searchResponse: { data: { Rows: [{ Id: '12345' }] } },
          priceResponse: {
            data: [
              {
                PriceRange: [100, 150],
                Currency: 'TWD',
                StockQty: 10,
                SoldQty: 5,
                ProdName: 'BlueEyes 普通卡',
              },
            ],
          },
          extractedPrices: [100, 150],
          expectedPriceLowest: 100,
          expectedPriceAvg: 125,
        },
      ],
      [
        'multiple products with varied prices',
        {
          rarity: '白鑽卡',
          searchName: 'DarkMagician',
          searchResponse: {
            data: { Rows: [{ Id: '12345' }, { Id: '67890' }] },
          },
          priceResponse: {
            data: [
              {
                PriceRange: [200, 200],
                Currency: 'TWD',
                StockQty: 5,
                SoldQty: 2,
                ProdName: 'DarkMagician 白鑽卡',
              },
              {
                PriceRange: [250, 250],
                Currency: 'TWD',
                StockQty: 3,
                SoldQty: 0,
                ProdName: 'DarkMagician 白鑽卡',
              },
            ],
          },
          extractedPrices: [200, 250],
          expectedPriceLowest: 100,
          expectedPriceAvg: 125,
        },
      ],
      [
        'product with discounted price',
        {
          rarity: '閃卡',
          searchName: 'RedEyes',
          searchResponse: { data: { Rows: [{ Id: '54321' }] } },
          priceResponse: {
            data: [
              {
                PriceRange: [80, 80],
                Currency: 'TWD',
                StockQty: 20,
                SoldQty: 10,
                ProdName: 'RedEyes 閃卡 特價',
              },
            ],
          },
          extractedPrices: [80],
          expectedPriceLowest: 100,
          expectedPriceAvg: 125,
        },
      ],
    ])(
      'Given %s, when getPriceByRarity is called, then should return correct price information',
      async (_, testCase) => {
        const {
          rarity,
          searchName,
          searchResponse,
          priceResponse,
          extractedPrices,
          expectedPriceLowest,
          expectedPriceAvg,
        } = testCase;

        (axios.get as jest.Mock).mockResolvedValueOnce(searchResponse);
        (axios.get as jest.Mock).mockResolvedValueOnce(priceResponse);

        jest
          .spyOn(rutenService as any, 'extractValidPrices')
          .mockReturnValue(extractedPrices);

        const result = await rutenService['getPriceByRarity'](
          rarity,
          searchName,
          1,
          'TEST-001',
          [rarity]
        );

        expect(axios.get).toHaveBeenCalledTimes(2);
        expect((rutenService as any).extractValidPrices).toHaveBeenCalled();
        expect(PriceCalculator.calculatePrices).toHaveBeenCalledWith(
          expect.arrayContaining(extractedPrices)
        );
        expect(result).toEqual({
          time: expect.any(String),
          rarity,
          price_lowest: expectedPriceLowest,
          price_avg: expectedPriceAvg,
        });
      }
    );

    it('should handle no product found', async () => {
      const rarityList = ['普通卡', '白鑽卡'];
      const rarity = '普通卡';
      const searchName = 'BlueEyes';
      const rarityLength = 1;
      const number = '001';

      const searchResponse = { data: { Rows: [] } };
      (axios.get as jest.Mock).mockResolvedValueOnce(searchResponse);

      const result = await rutenService['getPriceByRarity'](
        rarity,
        searchName,
        rarityLength,
        number,
        rarityList
      );
      expect(result).toEqual({
        ...rutenService['priceTemplate'],
        time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        rarity,
        price_lowest: null,
        price_avg: null,
      });
    });

    it('should handle errors during fetching product data', async () => {
      const rarityList = ['普通卡', '白鑽卡'];
      const rarity = '普通卡';
      const searchName = 'BlueEyes';
      const rarityLength = 1;
      const number = '001';

      const searchResponse = { data: { Rows: [{ Id: '12345' }] } };
      (axios.get as jest.Mock).mockResolvedValueOnce(searchResponse);

      (axios.get as jest.Mock).mockRejectedValueOnce(
        new Error('Network Error')
      );

      const result = await rutenService['getPriceByRarity'](
        rarity,
        searchName,
        rarityLength,
        number,
        rarityList
      );
      expect(result).toEqual({
        ...rutenService['priceTemplate'],
        time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        rarity,
        price_lowest: null,
        price_avg: null,
      });
    });
  });

  describe('preProcessing', () => {
    it.each([
      [
        'card ID without spaces',
        { id: 'PAC1-JP004', rarity: ['普卡', '銀亮'] },
        0,
        { searchName: 'PAC1-JP004', rarity: ['普卡', '銀亮'] },
      ],
      [
        'card ID with spaces',
        { id: 'PAC1 JP004', rarity: ['普卡', '銀亮'] },
        0,
        { searchName: 'PAC1+JP004', rarity: ['普卡', '銀亮'] },
      ],
      [
        'card with duplicate rarities',
        { id: 'PAC1-JP004', rarity: ['普卡', '普卡', '銀亮'] },
        0,
        { searchName: 'PAC1-JP004', rarity: ['普卡', '銀亮'] },
      ],
    ])(
      'Given %s, when preProcessing is called, then should transform card info correctly',
      async (_, cardInfo, idx, expected) => {
        const result = await (rutenService as any).preProcessing(cardInfo, idx);

        expect(result).toEqual(expected);
      }
    );

    it('Given card index is multiple of 50, when preProcessing is called, then should delay processing', async () => {
      const cardInfo = { id: 'PAC1-JP004', rarity: ['普卡', '銀亮'] };
      const idx = 50;
      const delaySpy = jest.spyOn(global, 'setTimeout');

      const result = await (rutenService as any).preProcessing(cardInfo, idx);

      expect(result).toEqual({
        searchName: 'PAC1-JP004',
        rarity: ['普卡', '銀亮'],
      });
      expect(delaySpy).toHaveBeenCalledWith(expect.any(Function), 800);
    });
  });

  describe('extractValidPrices', () => {
    it.each([
      [
        'valid TWD products with stock',
        [
          {
            ProdId: '123456',
            Currency: 'TWD',
            StockQty: 10,
            SoldQty: 2,
            ProdName: 'YuGiOh Card TEST-001 普通卡',
            PriceRange: [100, 100],
          },
          {
            ProdId: '789012',
            Currency: 'TWD',
            StockQty: 5,
            SoldQty: 1,
            ProdName: 'YuGiOh Card TEST-001 普通卡',
            PriceRange: [120, 120],
          },
        ],
        'TEST-001',
        '普通卡',
        [100, 120],
      ],
      [
        'mixed valid and invalid products',
        [
          {
            ProdId: '123456',
            Currency: 'TWD',
            StockQty: 10,
            SoldQty: 2,
            ProdName: 'YuGiOh Card TEST-001 普通卡',
            PriceRange: [100, 100],
          },
          {
            ProdId: '789012',
            Currency: 'USD',
            StockQty: 5,
            SoldQty: 1,
            ProdName: 'YuGiOh Card TEST-001 普通卡',
            PriceRange: [5, 5],
          },
          {
            ProdId: '345678',
            Currency: 'TWD',
            StockQty: 0,
            SoldQty: 10,
            ProdName: 'YuGiOh Card TEST-001 普通卡',
            PriceRange: [90, 90],
          },
        ],
        'TEST-001',
        '普通卡',
        [100],
      ],
      [
        'products with different price ranges',
        [
          {
            ProdId: '123456',
            Currency: 'TWD',
            StockQty: 10,
            SoldQty: 2,
            ProdName: 'YuGiOh Card TEST-001 普通卡',
            PriceRange: [100, 100],
          },
          {
            ProdId: '789012',
            Currency: 'TWD',
            StockQty: 5,
            SoldQty: 1,
            ProdName: 'YuGiOh Card TEST-001 普通卡',
            PriceRange: [120, 150],
          },
          {
            ProdId: '345678',
            Currency: 'TWD',
            StockQty: 8,
            SoldQty: 3,
            ProdName: 'YuGiOh Card TEST-001 普通卡',
            PriceRange: [9999, 9999],
          },
        ],
        'TEST-001',
        '普通卡',
        [100],
      ],
    ])(
      'Given %s, when extractValidPrices is called, then should filter and return valid prices',
      (_, prices, number, rarity, expected) => {
        const result = (rutenService as any).extractValidPrices(
          prices,
          number,
          rarity,
          number,
          [rarity]
        );

        expect(result).toEqual(expected);
      }
    );

    it('Given all invalid products, when extractValidPrices is called, then should return empty array', () => {
      const prices: RutenPriceDetailResponse[] = [
        {
          ProdId: '123456',
          Currency: 'USD',
          StockQty: 10,
          SoldQty: 2,
          ProdName: 'YuGiOh Card TEST-001 普通卡',
          PriceRange: [100, 100],
        },
        {
          ProdId: '789012',
          Currency: 'TWD',
          StockQty: 5,
          SoldQty: 5,
          ProdName: 'YuGiOh Card TEST-001 普通卡',
          PriceRange: [120, 120],
        },
        {
          ProdId: '345678',
          Currency: 'TWD',
          StockQty: 8,
          SoldQty: 3,
          ProdName: 'YuGiOh Card TEST-001 普通卡 同人',
          PriceRange: [90, 90],
        },
      ];

      const result = (rutenService as any).extractValidPrices(
        prices,
        'TEST-001',
        '普通卡',
        'TEST-001',
        ['普通卡']
      );

      expect(result).toEqual([]);
    });
  });
});
