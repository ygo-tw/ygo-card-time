import { RutenService } from './rutenPrice';
import { DataAccessService } from '@ygo/mongo-server';
import { RutenPriceDetailResponse } from '@ygo/schemas';
import { PriceCalculator } from '../utils/priceCalculator';
import axios from 'axios';
import dayjs from 'dayjs';

jest.mock('../utils/priceCalculator');
jest.mock('@ygo/mongo-server');
jest.mock('axios');

describe('RutenService', () => {
  let rutenService: RutenService;
  let mockPriceCalculator: jest.Mocked<PriceCalculator>;

  beforeEach(() => {
    jest.resetAllMocks();
    const mockDataAccessService = new DataAccessService(
      'mongodb://localhost:27017/ygo'
    );
    mockPriceCalculator = new PriceCalculator() as jest.Mocked<PriceCalculator>;
    mockPriceCalculator.calculatePrices.mockReturnValue({
      minPrice: 100,
      averagePrice: 125,
    });
    rutenService = new RutenService(mockDataAccessService, mockPriceCalculator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isPriceInfoValid', () => {
    test('should return null for valid price information', () => {
      const validPriceInfo = {
        time: '2023-05-19T12:00:00Z',
        rarity: 'common',
        price_lowest: 10,
        price_avg: 20,
      };

      const result = (rutenService as any).isPriceInfoValid(validPriceInfo);

      expect(result).toBeNull();
    });

    test('should return invalidKeys for null prices', () => {
      const invalidPriceInfo = {
        time: '2023-05-19T12:00:00Z',
        rarity: 'common',
        price_lowest: null,
        price_avg: null,
      };

      const result = (rutenService as any).isPriceInfoValid(invalidPriceInfo);

      expect(result).toEqual(['price_lowest', 'price_avg']);
    });

    test('should return invalidKeys for zero prices', () => {
      const invalidPriceInfo = {
        time: '2023-05-19T12:00:00Z',
        rarity: 'common',
        price_lowest: 0,
        price_avg: 0,
      };

      const result = (rutenService as any).isPriceInfoValid(invalidPriceInfo);

      expect(result).toEqual(['price_lowest', 'price_avg']);
    });

    test('should return invalidKeys for infinite prices', () => {
      const invalidPriceInfo = {
        time: '2023-05-19T12:00:00Z',
        rarity: 'common',
        price_lowest: Infinity,
        price_avg: Infinity,
      };

      const result = (rutenService as any).isPriceInfoValid(invalidPriceInfo);

      expect(result).toEqual(['price_lowest', 'price_avg']);
    });

    test('should return invalidKeys for mixed invalid prices', () => {
      const invalidPriceInfo = {
        time: '2023-05-19T12:00:00Z',
        rarity: 'common',
        price_lowest: null,
        price_avg: 0,
      };

      const result = (rutenService as any).isPriceInfoValid(invalidPriceInfo);

      expect(result).toEqual(['price_lowest', 'price_avg']);
    });
  });

  describe('getPriceByRarity', () => {
    it('should fetch price details correctly', async () => {
      const rarity = '普通卡';
      const searchName = 'BlueEyes';
      const rarityLength = 1;
      const number = '001';

      const searchResponse = { data: { Rows: [{ Id: '12345' }] } };
      (axios.get as jest.Mock).mockResolvedValueOnce(searchResponse);

      const priceResponse = {
        data: [
          {
            PriceRange: [100, 150],
            Currency: 'TWD',
            StockQty: 10,
            SoldQty: 5,
            ProdName: 'BlueEyes 普通卡',
          },
        ],
      };
      (axios.get as jest.Mock).mockResolvedValueOnce(priceResponse);

      const extractValidPricesSpy = jest
        .spyOn(rutenService as any, 'extractValidPrices')
        .mockReturnValue([100, 150]);

      const result = await rutenService['getPriceByRarity'](
        rarity,
        searchName,
        rarityLength,
        number
      );

      expect(extractValidPricesSpy).toHaveBeenCalled();
      expect(extractValidPricesSpy).toHaveBeenCalledWith(
        expect.arrayContaining(priceResponse.data),
        number,
        rarity,
        searchName
      );

      expect(mockPriceCalculator.calculatePrices).toHaveBeenCalledWith(
        expect.arrayContaining([100, 150])
      );

      expect(result).toEqual({
        ...rutenService['priceTemplate'],
        time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        rarity,
        price_lowest: 100,
        price_avg: 125,
      });
    });

    it('should handle no product found', async () => {
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
        number
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
        number
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
    it('should process card info correctly', async () => {
      const cardInfo = { id: 'PAC1-JP004', rarity: ['普卡', '銀亮'] } as any;
      const idx = 0;

      const result = await rutenService['preProcessing'](cardInfo, idx);
      expect(result).toEqual({
        searchName: 'PAC1-JP004',
        rarity: ['普卡', '銀亮'],
      });
    });

    it('should handle card id with spaces correctly', async () => {
      const cardInfo = { id: 'PAC1 JP004', rarity: ['普卡', '銀亮'] } as any;
      const idx = 0;

      const result = await rutenService['preProcessing'](cardInfo, idx);
      expect(result).toEqual({
        searchName: 'PAC1+JP004',
        rarity: ['普卡', '銀亮'],
      });
    });

    it('should delay when index is a multiple of 300', async () => {
      const cardInfo = { id: 'PAC1-JP004', rarity: ['普卡', '銀亮'] } as any;
      const idx = 300;

      const delaySpy = jest.spyOn(global, 'setTimeout');
      const result = await rutenService['preProcessing'](cardInfo, idx);
      expect(result).toEqual({
        searchName: 'PAC1-JP004',
        rarity: ['普卡', '銀亮'],
      });
      expect(delaySpy).toHaveBeenCalledWith(expect.any(Function), 800);
    });
  });

  describe('keyWordsFactory', () => {
    it('should return empty string for "普卡" when rarityLength is 1', () => {
      const result = (rutenService as any).keyWordsFactory('普卡', 1);
      expect(result).toBe('');
    });

    it('should return "+普卡" for "方鑽"', () => {
      const result = (rutenService as any).keyWordsFactory('方鑽', 2);
      expect(result).toBe('+普卡');
    });

    it('should return "+浮雕" for "凸版浮雕"', () => {
      const result = (rutenService as any).keyWordsFactory('凸版浮雕', 2);
      expect(result).toBe('+浮雕');
    });

    it('should return "+紅鑽" for "20th紅鑽"', () => {
      const result = (rutenService as any).keyWordsFactory('20th紅鑽', 2);
      expect(result).toBe('+紅鑽');
    });

    it('should return "+異圖" for "異圖+其他"', () => {
      const result = (rutenService as any).keyWordsFactory('異圖+其他', 2);
      expect(result).toBe('+異圖');
    });

    it('should return empty string for "碎鑽銀字"', () => {
      const result = (rutenService as any).keyWordsFactory('碎鑽銀字', 2);
      expect(result).toBe('');
    });

    it('should return empty string for "點鑽隱普"', () => {
      const result = (rutenService as any).keyWordsFactory('點鑽隱普', 2);
      expect(result).toBe('');
    });

    it('should return "+方鑽+其他" for "方鑽其他"', () => {
      const result = (rutenService as any).keyWordsFactory('方鑽其他', 2);
      expect(result).toBe('+方鑽+其他');
    });

    it('should return "+KC" for "金亮KC紋"', () => {
      const result = (rutenService as any).keyWordsFactory('金亮KC紋', 2);
      expect(result).toBe('+KC');
    });

    it('should return "+金鑽" for "25th金鑽"', () => {
      const result = (rutenService as any).keyWordsFactory('25th金鑽', 2);
      expect(result).toBe('+金鑽');
    });

    it('should return "+金鑽" for "金鑽"', () => {
      const result = (rutenService as any).keyWordsFactory('金鑽', 2);
      expect(result).toBe('+金鑽');
    });

    it('should return empty string for "普卡放射鑽" when rarityLength is 1', () => {
      const result = (rutenService as any).keyWordsFactory('普卡放射鑽', 1);
      expect(result).toBe('+普卡放射鑽');
    });

    it('should return "+其他" for an unhandled rarity', () => {
      const result = (rutenService as any).keyWordsFactory('其他', 2);
      expect(result).toBe('+其他');
    });

    it('should return "+粉鑽" for "粉鑽"', () => {
      const result = (rutenService as any).keyWordsFactory('粉鑽', 2);
      expect(result).toBe('+粉鑽');
    });

    it('should return "+古紋鑽" for "古紋鑽"', () => {
      const result = (rutenService as any).keyWordsFactory('古紋鑽', 2);
      expect(result).toBe('+古紋鑽');
    });

    it('should return "+字紋鑽" for "字紋鑽"', () => {
      const result = (rutenService as any).keyWordsFactory('字紋鑽', 2);
      expect(result).toBe('+字紋鑽');
    });

    it('should return "+彩鑽" for "彩鑽"', () => {
      const result = (rutenService as any).keyWordsFactory('彩鑽', 2);
      expect(result).toBe('+彩鑽');
    });

    it('should return empty string for "方鑽銀字" when replacedRar is in includes check', () => {
      const result = (rutenService as any).keyWordsFactory('方鑽銀字', 2);
      expect(result).toBe('');
    });

    it('should return empty string for "點鑽隱普" when replacedRar is in includes check', () => {
      const result = (rutenService as any).keyWordsFactory('點鑽隱普', 2);
      expect(result).toBe('');
    });
  });

  describe('extractValidPrices', () => {
    it('should filter out non-TWD currency', () => {
      const prices: RutenPriceDetailResponse[] = [
        {
          ProdId: '123456',
          Currency: 'TWD',
          StockQty: 10,
          SoldQty: 2,
          ProdName: 'YuGiOh Card Example 1',
          PriceRange: [100, 100],
        },
        {
          ProdId: '123456',
          Currency: 'USD',
          StockQty: 10,
          SoldQty: 2,
          ProdName: 'YuGiOh Card Example 2',
          PriceRange: [200, 200],
        },
      ];

      const result = (rutenService as any).extractValidPrices(
        prices,
        'Example',
        '普通卡',
        'YuGiOh Card'
      );
      expect(result).toEqual([100]);
    });

    it('should filter out products with no stock', () => {
      const prices: RutenPriceDetailResponse[] = [
        {
          ProdId: '123456',
          Currency: 'TWD',
          StockQty: 10,
          SoldQty: 2,
          ProdName: 'YuGiOh Card Example 1',
          PriceRange: [100, 100],
        },
        {
          ProdId: '123456',
          Currency: 'TWD',
          StockQty: 0,
          SoldQty: 0,
          ProdName: 'YuGiOh Card Example 2',
          PriceRange: [200, 200],
        },
      ];

      const result = (rutenService as any).extractValidPrices(
        prices,
        'Example',
        '普通卡',
        'YuGiOh Card'
      );
      expect(result).toEqual([100]);
    });

    it('should filter out fan-made products', () => {
      const prices: RutenPriceDetailResponse[] = [
        {
          ProdId: '123456',
          Currency: 'TWD',
          StockQty: 10,
          SoldQty: 2,
          ProdName: 'YuGiOh Card Example 1',
          PriceRange: [100, 100],
        },
        {
          ProdId: '123456',
          Currency: 'TWD',
          StockQty: 10,
          SoldQty: 2,
          ProdName: 'YuGiOh Card Example 同人',
          PriceRange: [200, 200],
        },
      ];

      const result = (rutenService as any).extractValidPrices(
        prices,
        'Example',
        '普通卡',
        'YuGiOh Card'
      );
      expect(result).toEqual([100]);
    });

    it('should filter out invalid price ranges', () => {
      const prices: RutenPriceDetailResponse[] = [
        {
          ProdId: '123456',
          Currency: 'TWD',
          StockQty: 10,
          SoldQty: 2,
          ProdName: 'YuGiOh Card Example 1',
          PriceRange: [9999, 9999],
        },
        {
          ProdId: '123456',
          Currency: 'TWD',
          StockQty: 10,
          SoldQty: 2,
          ProdName: 'YuGiOh Card Example 2',
          PriceRange: [50, 50],
        },
      ];

      const result = (rutenService as any).extractValidPrices(
        prices,
        'Example',
        '普通卡',
        'YuGiOh Card'
      );
      expect(result).toEqual([50]);
    });

    it('should handle complex filter conditions correctly', () => {
      const prices: RutenPriceDetailResponse[] = [
        {
          ProdId: '123456',
          Currency: 'TWD',
          StockQty: 10,
          SoldQty: 2,
          ProdName: 'YuGiOh Card Example 1',
          PriceRange: [100, 100],
        },
        {
          ProdId: '123456',
          Currency: 'TWD',
          StockQty: 10,
          SoldQty: 0,
          ProdName: 'YuGiOh Card Example 2',
          PriceRange: [200, 200],
        },
        {
          ProdId: '123456',
          Currency: 'TWD',
          StockQty: 10,
          SoldQty: 2,
          ProdName: 'YuGiOh Card 同人 Example',
          PriceRange: [300, 300],
        },
        {
          ProdId: '123456',
          Currency: 'TWD',
          StockQty: 10,
          SoldQty: 2,
          ProdName: 'YuGiOh Card Example 3',
          PriceRange: [9999, 9999],
        },
        {
          ProdId: '123456',
          Currency: 'TWD',
          StockQty: 10,
          SoldQty: 2,
          ProdName: 'YuGiOh Card Example 4',
          PriceRange: [50, 50],
        },
      ];

      const result = (rutenService as any).extractValidPrices(
        prices,
        'Example',
        '普通卡',
        'YuGiOh Card'
      );
      expect(result).toEqual([100, 200, 50]);
    });
  });
});
