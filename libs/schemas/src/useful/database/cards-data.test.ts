import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

import { usefulDatabaseCardsDataSchema as schema } from './cards-data.const';
import {
  usefulValueObjectMetaSchema,
  usefulValueObjectCardMetaSchema,
} from '../value-object';

const ajv = new Ajv({
  allowUnionTypes: true,
  allErrors: false,
  verbose: true,
  allowMatchingProperties: true,
});

addFormats(ajv);

ajv.addSchema(usefulValueObjectMetaSchema);
ajv.addSchema(usefulValueObjectCardMetaSchema);
test('schema 定義正確', () => {
  const validate = ajv.compile(schema);
  expect(validate.errors).toBeNull();
});

const example = {
  _id: '6437546cac8ae56f6aaa2795',
  number: '00010000',
  name: '萬物創世龍',
  type: '特殊召喚',
  star: '等級10',
  attribute: '闇',
  rarity: ['浮雕', '紅鑽'],
  atk: null,
  def: null,
  product_information_type: 'IGAS',
  effect:
    '此卡不能通常召喚。\n解放我方場上攻擊力合計和守備力合計的總和為10000以上的怪獸才能特殊召喚。\n以此方法特殊召喚出場的此卡的攻擊力、守備力變為10000。　',
  price_info: [
    {
      time: '2024-01-01 12:50:04',
      rarity: '紅鑽',
      price_lowest: 49999,
      price_avg: 50999,
    },
    {
      time: '2024-01-02 13:13:13',
      rarity: '紅鑽',
      price_lowest: 49999,
      price_avg: 50999,
    },
  ],
  price_yuyu: [],
  id: 'IGAS-JP000',
  race: '龍族',
};

test('example 符合 schema', () => {
  const validate = ajv.compile(schema);
  const valid = validate(example);
  if (validate.errors) {
    console.log(validate.errors);
  }
  expect(validate.errors).toBeNull();
  expect(valid).toBeTruthy();
});
