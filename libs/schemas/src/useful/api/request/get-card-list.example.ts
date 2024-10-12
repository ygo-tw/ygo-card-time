import { GetCardListRequestType } from './get-card-list';

export const exampleGetCardList: GetCardListRequestType = {
  filter: {
    number: '123',
    name: '卡片名稱示例',
    atk: null,
    def: null,
    id: 'DUNE-JP000',
    type: '二重怪獸',
    attribute: '光',
    rarity: ['普鑽'],
    star: '等級10',
    race: '惡魔族',
    product_information_type: 'DUNE',
    effect: '效果示例',
  },
};
