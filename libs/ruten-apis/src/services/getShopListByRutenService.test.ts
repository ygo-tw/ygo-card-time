import {
  GetShopListByRutenService,
  RutenApisType,
} from './getShopListByRutenService';
import { DataAccessService } from '@ygo/mongo-server';
import { ProductRequest } from './bestPlanByRutenService';
import { Document } from 'mongoose';
import axios from 'axios';
import {
  isIllegalProductChar,
  isFanMode,
  isUnopenedPackProduct,
  containsAllKeywords,
  notContainsAnotherRarity,
} from '../utils';

jest.mock('../utils', () => ({
  isIllegalProductChar: jest.fn(),
  isFanMode: jest.fn(),
  isUnopenedPackProduct: jest.fn(),
  containsAllKeywords: jest.fn(),
  notContainsAnotherRarity: jest.fn(),
  delay: jest.fn(),
}));
jest.mock('@ygo/mongo-server');
jest.mock('axios');

interface MockCard extends Document {
  name: string;
  rarity: string[];
  number: number;
}

describe('GetShopListByRutenService', () => {
  let dataAccessService: jest.Mocked<DataAccessService>;
  let mockGetShopListByRutenService: GetShopListByRutenService;
  const shoppingList: ProductRequest[] = [
    {
      productName: 'RC04-JP001+金鑽',
      count: 1,
    },
    {
      productName: 'RC04-JP002+金鑽',
      count: 2,
    },
  ];

  beforeEach(() => {
    jest.restoreAllMocks();
    dataAccessService = {
      find: jest.fn(),
      findAndUpdate: jest.fn(),
    } as unknown as jest.Mocked<DataAccessService>;

    mockGetShopListByRutenService = new GetShopListByRutenService(
      shoppingList,
      dataAccessService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('extractShipPrices', () => {
    const deliverWay = {
      SEVEN_COD: 60,
      FAMI_COD: 80,
      FAMI: 85,
      SEVEN: 100,
      HILIFE: 70,
      HILIFE_COD: 65,
    };

    const expected = {
      SEVEN: 100,
      FAMILY: 85,
      HILIFE: 65,
    };

    const result = (mockGetShopListByRutenService as any).extractShipPrices(
      deliverWay
    );

    expect(result).toEqual(expected);
  });

  test('setDefaultFreeShip', () => {
    (mockGetShopListByRutenService as any).shopList = [
      {
        id: 'shop1',
        products: {
          product1: { price: 100, id: 'product1', qtl: 1 },
          product2: { price: 200, id: 'product2', qtl: 1 },
        },
        shipPrices: {
          standard: 50,
          express: 100,
        },
        freeShip: {},
      },
      {
        id: 'shop2',
        products: {
          product3: { price: 300, id: 'product3', qtl: 1 },
        },
        shipPrices: {
          standard: 75,
          express: 150,
        },
        freeShip: {},
      },
    ];
    const idx = 1;
    const expected = {
      standard: 99999,
    };

    const result = (mockGetShopListByRutenService as any)['setDefaultFreeShip'](
      idx
    );

    expect(result).toStrictEqual(expected);
  });

  describe('filterProdDetail', () => {
    test('should handle rarities filtering', () => {
      const prodDetailListRes = {
        status: 'success',
        data: [
          {
            id: '1',
            name: 'RC04-JP001 金鑽 A怪',
            goods_price: 100,
            num: 2,
            user: '456',
            deliver_way: { SEVEN: 100 },
          },
          {
            id: '2',
            name: 'RC04-JP001 亮面 B怪',
            goods_price: 200,
            num: 1,
            user: '789',
            deliver_way: { FAMILY: 80 },
          },
          {
            id: '3',
            name: 'RC04-JP001 黑鑽 C怪',
            goods_price: 150,
            num: 3,
            user: '123',
            deliver_way: { HOME: 50 },
          },
        ],
      };

      // Mock 需要的方法
      (containsAllKeywords as jest.Mock).mockImplementation(name =>
        name.includes('鑽')
      );
      (isIllegalProductChar as jest.Mock).mockReturnValue(true);
      (isFanMode as jest.Mock).mockReturnValue(true);
      (isUnopenedPackProduct as jest.Mock).mockReturnValue(true);
      (notContainsAnotherRarity as jest.Mock).mockImplementation(
        (name, rar) => !name.includes(rar)
      );

      (mockGetShopListByRutenService as any).shoppingListExtended = [
        {
          productName: 'RC04-JP001+金鑽',
          rarities: ['金鑽', '亮面', '黑鑽'],
        },
      ];

      const result = (mockGetShopListByRutenService as any).filterProdDetail(
        prodDetailListRes,
        'RC04-JP001+金鑽'
      );

      const expected = [
        {
          price: 100,
          qtl: 2,
          id: '1',
          shopId: '456',
          deliver_way: { SEVEN: 100 },
        },
      ];

      expect(result).toEqual(expected);
    });

    test('should filter and map product details correctly without rarities filtering', () => {
      const prodDetailListRes = {
        status: 'success',
        data: [
          {
            id: '1',
            name: 'RC04-JP001 金鑽 A怪',
            goods_price: 100,
            num: 2,
            user: '456',
            deliver_way: { SEVEN: 100 },
          },
          {
            id: '2',
            name: 'RC04-JP001 亮面 B怪',
            goods_price: 200,
            num: 1,
            user: '789',
            deliver_way: { FAMILY: 80 },
          },
          // 其他的字段可以忽略
        ],
      };

      // Mock 需要的方法
      (containsAllKeywords as jest.Mock).mockImplementation(name =>
        name.includes('金鑽')
      );
      (isIllegalProductChar as jest.Mock).mockReturnValue(true);
      (isFanMode as jest.Mock).mockReturnValue(true);
      (isUnopenedPackProduct as jest.Mock).mockReturnValue(true);
      (notContainsAnotherRarity as jest.Mock).mockImplementation(name =>
        name.includes('金鑽')
      );

      const result = (mockGetShopListByRutenService as any).filterProdDetail(
        prodDetailListRes,
        'RC04-JP001+金鑽'
      );

      const expected = [
        {
          price: 100,
          qtl: 2,
          id: '1',
          shopId: '456',
          deliver_way: { SEVEN: 100 },
        },
      ];

      expect(result).toEqual(expected);
    });

    test('should return empty array if no products match', () => {
      const prodDetailListRes = {
        status: 'success',
        data: [
          {
            id: '1',
            name: 'RC04-JP001 亮面 A怪',
            goods_price: 100,
            num: 2,
            user: '456',
            deliver_way: { SEVEN: 100 },
          },
          {
            id: '2',
            name: 'RC04-JP001 亮面 B怪',
            goods_price: 200,
            num: 1,
            user: '789',
            deliver_way: { FAMILY: 80 },
          },
        ],
      };

      // Mock 需要的方法
      (containsAllKeywords as jest.Mock).mockImplementation(name =>
        name.includes('金鑽')
      );
      (isIllegalProductChar as jest.Mock).mockReturnValue(true);
      (isFanMode as jest.Mock).mockReturnValue(true);
      (isUnopenedPackProduct as jest.Mock).mockReturnValue(true);

      const result = (mockGetShopListByRutenService as any).filterProdDetail(
        prodDetailListRes,
        'RC04-JP001+金鑽'
      );

      const expected: any[] = [];

      expect(result).toEqual(expected);
    });
  });

  describe('getShopList', () => {
    test('if getProductRequestExtended, return empty ', async () => {
      jest
        .spyOn(
          mockGetShopListByRutenService as any,
          'getProductRequestExtended'
        )
        .mockRejectedValueOnce(new Error('mock error'));

      const result = await (mockGetShopListByRutenService as any).getShopList();

      expect(result).toEqual([]);
    });

    test('should find products and update shop list', async () => {
      const mockProductRequestExtended = [
        { rarities: [], card_id: '1', card_number: '1', card_name: 'Card 1' },
      ];
      const mockProdList = [
        {
          price: 100,
          qtl: 10,
          id: '1',
          shopId: 'shop1',
          deliver_way: 'delivery',
        },
      ];
      const mockShop = {
        id: 'shop1',
        products: {},
        shipPrices: {},
        freeShip: {},
      };

      jest
        .spyOn(
          mockGetShopListByRutenService as any,
          'getProductRequestExtended'
        )
        .mockResolvedValueOnce(mockProductRequestExtended);
      jest
        .spyOn(mockGetShopListByRutenService as any, 'findProductList')
        .mockResolvedValueOnce(mockProdList);
      jest
        .spyOn(mockGetShopListByRutenService as any, 'addOrUpdateShop')
        .mockReturnValueOnce({ idx: -1, shop: mockShop });
      jest
        .spyOn(
          mockGetShopListByRutenService as any,
          'findShopHasAnotherProduct'
        )
        .mockResolvedValueOnce([mockShop]);
      jest
        .spyOn(mockGetShopListByRutenService as any, 'getShipInfo')
        .mockResolvedValueOnce({ delivery: 10 });

      const result = await mockGetShopListByRutenService.getShopList();

      expect(result).toEqual([mockShop]);
      expect((mockGetShopListByRutenService as any).shopList).toEqual([
        mockShop,
      ]);
    });

    test('should handle errors in findProductList', async () => {
      const mockProductRequestExtended = [
        { rarities: [], card_id: '1', card_number: '1', card_name: 'Card 1' },
      ];
      const mockError = new Error('mock findProductList error');

      jest
        .spyOn(
          mockGetShopListByRutenService as any,
          'getProductRequestExtended'
        )
        .mockResolvedValueOnce(mockProductRequestExtended);
      jest
        .spyOn(mockGetShopListByRutenService as any, 'findProductList')
        .mockRejectedValueOnce(mockError);

      const result = await mockGetShopListByRutenService.getShopList();

      expect(result).toEqual([]);
    });

    test('should set default free shipping on rejection', async () => {
      const mockShop = {
        id: 'shop1',
        products: {},
        shipPrices: {},
        freeShip: {},
      };
      const mockError = new Error('mock getShipInfo error');

      jest
        .spyOn(
          mockGetShopListByRutenService as any,
          'getProductRequestExtended'
        )
        .mockResolvedValueOnce([
          { rarities: [], card_id: '1', card_number: '1', card_name: 'Card 1' },
        ]);
      jest
        .spyOn(mockGetShopListByRutenService as any, 'findProductList')
        .mockResolvedValueOnce([
          {
            price: 100,
            qtl: 10,
            id: '1',
            shopId: 'shop1',
            deliver_way: 'delivery',
          },
        ]);
      jest
        .spyOn(mockGetShopListByRutenService as any, 'addOrUpdateShop')
        .mockReturnValueOnce({ idx: -1, shop: mockShop });
      jest
        .spyOn(
          mockGetShopListByRutenService as any,
          'findShopHasAnotherProduct'
        )
        .mockResolvedValueOnce([mockShop]);
      jest
        .spyOn(mockGetShopListByRutenService as any, 'getShipInfo')
        .mockRejectedValueOnce(mockError);
      jest
        .spyOn(mockGetShopListByRutenService as any, 'setDefaultFreeShip')
        .mockReturnValueOnce({ delivery: 0 });

      const result = await mockGetShopListByRutenService.getShopList();

      expect(result).toEqual([mockShop]);
      expect(mockShop.freeShip).toEqual({ delivery: 0 });
    });
  });

  describe('findShopHasAnotherProduct', () => {
    const mockValue = [
      {
        id: 'shop1',
        products: {
          product1: { price: 100, id: 'product1', qtl: 1 },
          product2: { price: 200, id: 'product2', qtl: 1 },
        },
        shipPrices: {
          standard: 50,
          express: 100,
        },
        freeShip: {},
      },
      {
        id: 'shop2',
        products: {
          product3: { price: 300, id: 'product3', qtl: 1 },
        },
        shipPrices: {
          standard: 75,
          express: 150,
        },
        freeShip: {},
      },
    ];

    test('if getShopId success , and getShopOtherProductInfo has product, return shopList with product information', async () => {
      (mockGetShopListByRutenService as any).shopList = mockValue;
      (mockGetShopListByRutenService as any).shoppingList = [
        { productName: 'product1', count: 1 },
        { productName: 'product3', count: 1 },
        { productName: 'product2', count: 1 },
      ];
      jest
        .spyOn(mockGetShopListByRutenService as any, 'getShopId')
        .mockReturnValueOnce('123')
        .mockRejectedValueOnce(new Error('mock error'));
      jest
        .spyOn(mockGetShopListByRutenService as any, 'getShopOtherProductInfo')
        .mockReturnValueOnce({
          id: 'product3',
          price: 100,
          qtl: 1,
        });
      const expected = mockValue;
      expected[0].products.product3 = {
        id: 'product3',
        price: 100,
        qtl: 1,
      };

      const result = await (
        mockGetShopListByRutenService as any
      ).findShopHasAnotherProduct([
        { name: 'shop1', id: '' },
        { name: 'shop2', id: '' },
      ]);

      expect(result).toEqual(expected);
    });

    test('if getShopId fail , return while be same with shopList', async () => {
      (mockGetShopListByRutenService as any).shopList = mockValue;
      jest
        .spyOn(mockGetShopListByRutenService as any, 'getShopId')
        .mockRejectedValueOnce(new Error('mock error'))
        .mockRejectedValueOnce(new Error('mock error'));

      const expected = mockValue;
      const result = await (
        mockGetShopListByRutenService as any
      ).findShopHasAnotherProduct([
        { name: 'shop1', id: '' },
        { name: 'shop2', id: '' },
      ]);
      expect(result).toEqual(expected);
    });

    test('if getShopId success , and getShopOtherProductInfo throw error, return shopList', async () => {
      (mockGetShopListByRutenService as any).shopList = mockValue;
      jest
        .spyOn(mockGetShopListByRutenService as any, 'getShopId')
        .mockReturnValueOnce('123')
        .mockReturnValueOnce('456');
      jest
        .spyOn(mockGetShopListByRutenService as any, 'getShopOtherProductInfo')
        .mockRejectedValueOnce(new Error('mock error'))
        .mockRejectedValueOnce(new Error('mock error'));
      const expected = mockValue;
      const result = await (
        mockGetShopListByRutenService as any
      ).findShopHasAnotherProduct([
        { name: 'shop1', id: '' },
        { name: 'shop2', id: '' },
      ]);
      expect(result).toEqual(expected);
    });
  });

  describe('getShopOtherProductInfo', () => {
    test('if axios get empty array, return empty', async () => {
      jest
        .spyOn(GetShopListByRutenService, 'getRutenApis')
        .mockReturnValueOnce('url1');

      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: {
          Rows: [],
        },
      });
      const expected = {
        id: '',
        price: 0,
        qtl: 0,
      };
      const result = await (
        mockGetShopListByRutenService as any
      ).getShopOtherProductInfo('123', 'product1');
      expect(result).toEqual(expected);
    });

    test('if axios get not empty array, return other product info', async () => {
      jest
        .spyOn(GetShopListByRutenService, 'getRutenApis')
        .mockReturnValueOnce('url1')
        .mockReturnValueOnce('url2');
      const expected = {
        id: '456',
        price: 200,
        qtl: 2,
      };
      (axios.get as jest.Mock)
        .mockResolvedValueOnce({
          data: {
            Rows: [
              {
                Id: '123',
              },
            ],
          },
        })
        .mockReturnValueOnce({
          data: {
            data: [
              {
                id: '456',
                goods_price: 200,
                num: 2,
              },
            ],
          },
        });

      const result = await (
        mockGetShopListByRutenService as any
      ).getShopOtherProductInfo('123', 'product1');
      expect(result).toEqual(expected);
    });
  });

  describe('getShopId', () => {
    test('success to get shop id', async () => {
      jest
        .spyOn(GetShopListByRutenService, 'getRutenApis')
        .mockReturnValueOnce('url1');
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: {
          data: {
            user_id: '123',
          },
        },
      });
      const expected = '123';

      const result = await (mockGetShopListByRutenService as any).getShopId(
        '456'
      );

      expect(result).toEqual(expected);
    });

    test('fail to get shop id', async () => {
      jest
        .spyOn(GetShopListByRutenService, 'getRutenApis')
        .mockReturnValueOnce('url1');
      (axios.get as jest.Mock).mockRejectedValueOnce(new Error('mock error'));
      await expect(
        (mockGetShopListByRutenService as any).getShopId('456')
      ).rejects.toThrow('Error while getting product list for 456');
    });
  });

  describe('getProductRequestExtended', () => {
    test('success to get product request extended', async () => {
      const mockValue1: MockCard[] = [
        {
          name: 'A怪',
          number: '123',
          rarity: ['金鑽', '亮面'],
        } as unknown as MockCard,
      ];
      const mockValue2: MockCard[] = [
        {
          name: 'B怪',
          number: '456',
          rarity: ['金鑽', '亮面', '凸版浮雕'],
        } as unknown as MockCard,
      ];
      dataAccessService.find
        .mockResolvedValueOnce(mockValue1)
        .mockResolvedValueOnce(mockValue2);

      const expected = [
        {
          productName: 'RC04-JP001+金鑽',
          count: 1,
          rarities: ['金鑽', '亮面'],
          card_id: 'RC04-JP001',
          card_name: 'A怪',
          card_number: '123',
        },
        {
          productName: 'RC04-JP002+金鑽',
          count: 2,
          rarities: ['金鑽', '亮面', '凸版浮雕'],
          card_id: 'RC04-JP002',
          card_name: 'B怪',
          card_number: '456',
        },
      ];

      const result = await (
        mockGetShopListByRutenService as any
      ).getProductRequestExtended();

      expect(result).toEqual(expected);
    });

    test('failed to get product request extended', async () => {
      (dataAccessService as any).find.mockReturnValueOnce([]);
      (mockGetShopListByRutenService as any).shoppingList = shoppingList;

      await expect(
        (mockGetShopListByRutenService as any).getProductRequestExtended()
      ).rejects.toThrow(`Card data not found for RC04-JP001 金鑽`);
    });
  });

  describe('getShipInfo', () => {
    test('success to get ship info (has target ship type)', async () => {
      (mockGetShopListByRutenService as any).shopList = [
        {
          id: 'shop1',
          products: {
            product1: { price: 100, id: 'product1', qtl: 1 },
            product2: { price: 200, id: 'product2', qtl: 1 },
          },
          shipPrices: {
            standard: 50,
            express: 100,
          },
          freeShip: {},
        },
        {
          id: 'shop2',
          products: {
            product3: { price: 300, id: 'product3', qtl: 1 },
          },
          shipPrices: {
            standard: 75,
            express: 150,
          },
          freeShip: {},
        },
      ];
      jest.spyOn(GetShopListByRutenService, 'getRutenApis');
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: {
          data: {
            vaild: true,
            event_name: '123',
            url: '456',
            discount_conditions: {
              SEVEN: {
                discount_id: '123',
                arrival_amount: 60,
                charge_fee: 2,
              },
              FAMILY: {
                discount_id: '123',
                arrival_amount: 2,
                charge_fee: 2,
              },
            },
          },
        },
      });
      const shop = (mockGetShopListByRutenService as any).shopList[0];
      const expected = {
        SEVEN: 60,
        FAMILY: 2,
      };

      const result = await (mockGetShopListByRutenService as any)[
        'getShipInfo'
      ](shop, 0);

      expect(result).toEqual(expected);
    });
    test('success to get ship info (not has target ship type)', async () => {
      (mockGetShopListByRutenService as any).shopList = [
        {
          id: 'shop1',
          products: {
            product1: { price: 100, id: 'product1', qtl: 1 },
            product2: { price: 200, id: 'product2', qtl: 1 },
          },
          shipPrices: {
            standard: 50,
            express: 100,
          },
          freeShip: {},
        },
        {
          id: 'shop2',
          products: {
            product3: { price: 300, id: 'product3', qtl: 1 },
          },
          shipPrices: {
            standard: 75,
            express: 150,
          },
          freeShip: {},
        },
      ];
      jest.spyOn(GetShopListByRutenService, 'getRutenApis');
      (axios.get as jest.Mock).mockResolvedValueOnce({
        data: {
          data: {
            vaild: true,
            event_name: '123',
            url: '456',
            discount_conditions: {
              standard: {
                discount_id: '123',
                arrival_amount: 60,
                charge_fee: 2,
              },
              express: {
                discount_id: '123',
                arrival_amount: 2,
                charge_fee: 2,
              },
            },
          },
        },
      });
      const shop = (mockGetShopListByRutenService as any).shopList[0];
      const expected = {
        standard: 99999,
      };

      const result = await (mockGetShopListByRutenService as any)[
        'getShipInfo'
      ](shop, 0);

      expect(result).toEqual(expected);
    });
    test('failed to get ship info', async () => {
      (mockGetShopListByRutenService as any).shopList = [
        {
          id: 'shop1',
          products: {
            product1: { price: 100, id: 'product1', qtl: 1 },
            product2: { price: 200, id: 'product2', qtl: 1 },
          },
          shipPrices: {
            standard: 50,
            express: 100,
          },
          freeShip: {},
        },
        {
          id: 'shop2',
          products: {
            product3: { price: 300, id: 'product3', qtl: 1 },
          },
          shipPrices: {
            standard: 75,
            express: 150,
          },
          freeShip: {},
        },
      ];
      jest.spyOn(GetShopListByRutenService, 'getRutenApis');
      (axios.get as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error(''))
      );
      const shop = (mockGetShopListByRutenService as any).shopList[0];
      const expected = {
        standard: 99999,
      };

      const result = await (mockGetShopListByRutenService as any)[
        'getShipInfo'
      ](shop, 0);

      expect(result).toEqual(expected);
    });
  });

  describe('findProductList', () => {
    test('success to find product list', async () => {
      const prod = {
        productName: 'RC04-JP001+金鑽',
        count: 1,
        rarities: ['金鑽', '亮面'],
        card_id: 'RC04-JP001',
        card_name: 'A怪',
        card_number: '123',
      };
      jest
        .spyOn(GetShopListByRutenService, 'getRutenApis')
        .mockReturnValueOnce('url1')
        .mockReturnValueOnce('url2');

      (axios.get as jest.Mock)
        .mockResolvedValueOnce({ data: { Rows: [{ Id: '123456' }] } })
        .mockResolvedValueOnce({ data: {} });
      const expected = [
        {
          price: 100,
          qtl: 2,
          id: '123',
          shopId: '456',
          deliver_way: { SEVEN: 100 },
        },
      ];

      jest
        .spyOn(mockGetShopListByRutenService as any, 'filterProdDetail')
        .mockReturnValueOnce(expected);

      const result = await (
        mockGetShopListByRutenService as any
      ).findProductList(prod);

      expect(result).toEqual(expected);
    });

    test('failed to find product list', async () => {
      const prod = {
        productName: 'RC04-JP001+金鑽',
        count: 1,
        rarities: ['金鑽', '亮面'],
        card_id: 'RC04-JP001',
        card_name: 'A怪',
        card_number: '123',
      };
      jest
        .spyOn(GetShopListByRutenService, 'getRutenApis')
        .mockReturnValueOnce('url1');
      const errorMessage = `Error while getting product list for ${prod.productName}`;
      (axios.get as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error(errorMessage))
      );

      await expect(
        (mockGetShopListByRutenService as any).findProductList(prod)
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('addOrUpdateShop', () => {
    const prod = {
      productName: 'RC04-JP001+金鑽',
      count: 1,
      rarities: ['金鑽', '亮面'],
      card_id: 'RC04-JP001',
      card_name: 'A怪',
      card_number: '123',
    };
    const prodDetail = {
      price: 100,
      qtl: 2,
      id: '123',
      shopId: '456',
      deliver_way: { SEVEN: 100 },
    };
    test('if idx is -1, should add a new shop', () => {
      jest
        .spyOn(mockGetShopListByRutenService as any, 'extractShipPrices')
        .mockReturnValueOnce({});

      (mockGetShopListByRutenService as any).shopList = [];

      const result = (mockGetShopListByRutenService as any).addOrUpdateShop(
        prod,
        prodDetail
      );
      const expected = {
        idx: -1,
        shop: {
          id: prodDetail.shopId,
          products: {
            [prod.productName]: {
              id: prodDetail.id,
              price: prodDetail.price,
              qtl: prodDetail.qtl,
            },
          },
          shipPrices: {},
          freeShip: {},
        },
      };
      expect(result).toEqual(expected);
    });

    test('if idx is not -1, should update an existing shop', () => {
      (mockGetShopListByRutenService as any).shopList = [
        {
          id: prodDetail.shopId,
          products: {},
          shipPrices: {},
          freeShip: {},
        },
      ];

      const result = (mockGetShopListByRutenService as any).addOrUpdateShop(
        prod,
        prodDetail
      );

      const expected = {
        idx: 0,
        shop: {
          id: prodDetail.shopId,
          products: {
            [prod.productName]: {
              id: prodDetail.id,
              price: prodDetail.price,
              qtl: prodDetail.qtl,
            },
          },
          shipPrices: {},
          freeShip: {},
        },
      };

      expect(result).toEqual(expected);
    });
  });

  describe('getRutenApis', () => {
    const baseApiUrl = 'https://rtapi.ruten.com.tw/api';
    const baseRapiUrl = 'https://rapi.ruten.com.tw/api';

    it('should return the correct URL for PROD_LIST', () => {
      const apiKeyWords = { queryString: 'laptop' };
      const result = GetShopListByRutenService.getRutenApis(
        RutenApisType.PROD_LIST,
        apiKeyWords
      );
      expect(result).toBe(
        `${baseApiUrl}/search/v3/index.php/core/prod?q=laptop&type=direct&sort=prc%2Fac&offset=1&limit=100`
      );
    });

    it('should return the correct URL for PROD_DETAIL_LIST', () => {
      const apiKeyWords = { productId: '12345' };
      const result = GetShopListByRutenService.getRutenApis(
        RutenApisType.PROD_DETAIL_LIST,
        apiKeyWords
      );
      expect(result).toBe(
        `${baseRapiUrl}/items/v2/list?gno=12345&level=simple`
      );
    });

    it('should return the correct URL for SHOP_SHIP_INFO', () => {
      const apiKeyWords = { shopId: '67890' };
      const result = GetShopListByRutenService.getRutenApis(
        RutenApisType.SHOP_SHIP_INFO,
        apiKeyWords
      );
      expect(result).toBe(
        `${baseRapiUrl}/shippingfee/v1/seller/67890/event/discount`
      );
    });

    it('should return the correct URL for SHOP_INFO', () => {
      const apiKeyWords = { shopId: '67890' };
      const result = GetShopListByRutenService.getRutenApis(
        RutenApisType.SHOP_INFO,
        apiKeyWords
      );
      expect(result).toBe(`${baseRapiUrl}/users/v1/index.php/67890/storeinfo`);
    });

    it('should return the correct URL for SHOP_PROD_LIST with limit less than 50', () => {
      const apiKeyWords = {
        shopId: '12345',
        limit: 30,
        targetProduct: 'phone',
      };
      const result = GetShopListByRutenService.getRutenApis(
        RutenApisType.SHOP_PROD_LIST,
        apiKeyWords
      );
      expect(result).toBe(
        `${baseApiUrl}/search/v3/index.php/core/seller/12345/prod?sort=prc/ac&limit=30&q=phone`
      );
    });

    it('should return the correct URL for SHOP_PROD_LIST with limit more than 50', () => {
      const apiKeyWords = {
        shopId: '12345',
        limit: 100,
        targetProduct: 'phone',
      };
      const result = GetShopListByRutenService.getRutenApis(
        RutenApisType.SHOP_PROD_LIST,
        apiKeyWords
      );
      expect(result).toBe(
        `${baseApiUrl}/search/v3/index.php/core/seller/12345/prod?sort=prc/ac&limit=50&q=phone`
      );
    });

    it('should return "error" for an unknown type', () => {
      const result = GetShopListByRutenService.getRutenApis(
        'UNKNOWN_TYPE' as any,
        {}
      );
      expect(result).toBe('error');
    });
  });
});
