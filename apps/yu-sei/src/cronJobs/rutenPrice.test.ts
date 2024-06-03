import { RutenService } from './rutenPrice';
import { DataAccessService } from '@ygo/mongo-server';
import { RutenPriceDetailResponse } from '@ygo/schemas';
import { PriceCalculator } from '../utils/priceCalculator';
import axios from 'axios';
import dayjs from 'dayjs';
import { createLogger } from 'winston';
import { Document } from 'mongoose';

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

interface MockCard extends Document {
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
    it('should get card prices and update the database', async () => {
      const mockCards: MockCard[] = [
        { id: 'CARD1', rarity: ['普通', '白鑽'], number: 1 } as MockCard,
        { id: 'CARD2', rarity: ['普通'], number: 2 } as MockCard,
      ];
      mockDataAccessService.find.mockResolvedValue(mockCards);
      (rutenService as any).preProcessing = jest
        .fn()
        .mockResolvedValue({ searchName: 'Test', rarity: ['普通', '白鑽'] });
      (rutenService as any).getPriceByRarity = jest.fn().mockResolvedValue({
        rarity: '普通',
        price_lowest: 100,
        price_avg: 125,
      });
      (rutenService as any).isPriceInfoValid = jest.fn().mockReturnValue(false);

      const result = await rutenService.getRutenPrice();

      expect((rutenService as any).preProcessing).toHaveBeenCalledTimes(
        mockCards.length
      );
      expect((rutenService as any).getPriceByRarity).toHaveBeenCalledTimes(4);
      expect((rutenService as any).isPriceInfoValid).toHaveBeenCalledTimes(4);
      expect(mockDataAccessService.findAndUpdate).toHaveBeenCalledTimes(
        mockCards.length
      );

      expect(result.updateFailedId).toEqual([]);
      expect(result.noPriceId).toEqual([]);
    });

    it('should handle cards with no price information', async () => {
      const mockCards: MockCard[] = [
        { id: 'CARD1', rarity: ['普通'], number: 1 } as MockCard,
      ];
      mockDataAccessService.find.mockResolvedValue(mockCards);
      (rutenService as any).preProcessing = jest
        .fn()
        .mockResolvedValue({ searchName: 'Test', rarity: ['普通'] });
      (rutenService as any).getPriceByRarity = jest
        .fn()
        .mockResolvedValue(null); // Simulate no price information
      (rutenService as any).isPriceInfoValid = jest.fn().mockReturnValue(true);

      const result = await rutenService.getRutenPrice();

      expect(result.noPriceId).toEqual(['CARD1']);
      expect(result.updateFailedId).toEqual([]);
    });

    it('should handle update failures', async () => {
      const mockCards: MockCard[] = [
        { id: 'CARD1', rarity: ['普通'], number: 1 } as MockCard,
      ];
      mockDataAccessService.find.mockResolvedValue(mockCards);
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

      const result = await rutenService.getRutenPrice();

      expect(result.updateFailedId).toEqual(['CARD1']);
      expect(result.noPriceId).toEqual([]);
    });
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
      const rarityList = ['普通卡', '白鑽卡'];
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
        number,
        rarityList
      );

      expect(extractValidPricesSpy).toHaveBeenCalled();

      expect(PriceCalculator.calculatePrices).toHaveBeenCalledWith(
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
        'YuGiOh Card',
        ['普通卡', '銀亮']
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
        'YuGiOh Card',
        ['普通卡', '銀亮']
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
        'YuGiOh Card',
        ['普通卡', '銀亮']
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
        'YuGiOh Card',
        ['普通卡', '銀亮']
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
        'YuGiOh Card',
        ['普通卡', '銀亮']
      );
      expect(result).toEqual([100, 200, 50]);
    });
  });
});
