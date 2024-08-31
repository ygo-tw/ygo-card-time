import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

import { usefulDatabaseBannerDataSchema as schema } from './banner-data.const';
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
  _id: '643c11dc6d9a4b14a77a5d95',
  title: 'Banner標題',
  date: '2023-04-08T00:00:00.000+00:00',
  photo_pc:
    'https://cardtime.tw//api/card-image/banner/4c103a3f-cf4b-4f0c-9e69-abad1b877225.webp',
  photo_mobile:
    'https://cardtime.tw//api/card-image/banner/4c103a3f-cf4b-4f0c-9e69-abad1b877225.webp',
  url: 'https://www.yugioh-card.com/japan/products/dp29/',
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
