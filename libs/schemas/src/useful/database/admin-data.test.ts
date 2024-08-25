import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

import { usefulDatabaseAdminDataSchema as schema } from './admin-data.const';
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
  type: 0,
  name: 'Alex W.',
  create_date: '2023-04-08T00:00:00.000+00:00',
  photo:
    'https://cardtime.tw/api/card-image/article/7dcd704b-ee9d-4c3d-9e67-16b0fc73165d.png',
  status: 0,
  account: 'alex123456',
  password: 'Ckap1234',
  email: 'alex123456@gmail.com',
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
