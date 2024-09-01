import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

import { usefulDatabaseMetaSchema as schema } from './meta_deck-data.const';
import { usefulValueObjectMetaSchema } from '../value-object';

const ajv = new Ajv({
  allowUnionTypes: true,
  allErrors: false,
  verbose: true,
  allowMatchingProperties: true,
});

addFormats(ajv);

ajv.addSchema(usefulValueObjectMetaSchema);

test('schema 定義正確', () => {
  const validate = ajv.compile(schema);
  expect(validate.errors).toBeNull();
});

const example = {
  _id: '65a5f8384d8e71a1da9268e3',
  title: '1/19 - 1/25 (2024) 上位抄牌區',
  publish_date: '2024-01-16T11:01:03.000Z',
  photo: 'a8f9a63c-9ce0-4e3c-b123-68d3dc37c03a.png',
  content:
    '<p><span style="font-size: 20px; color: #000080;">本週上位卡表</span></p>',
  status: 0,
  to_top: true,
  admin_id: '643c11dc6d9a4b14a77a5d95',
  tag: [
    {
      _id: '6433cb84393872bd1b6ee643',
      tag: '主流',
    },
  ],
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
