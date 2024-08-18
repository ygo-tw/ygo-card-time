import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

import { usefulDatabasePermisionDataSchema as schema } from './permission-data.const';
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
  _id: '645a014e6d9a4b14a7f611ff',
  name: '前後台用戶',
  permission: [
    'series_introduction',
    'series_introduction_add',
    'series_introduction_edit',
    'useful_card_introduction',
    'useful_card_introduction_add',
    'useful_card_introduction_edit',
    'rules',
    'rules_add',
    'rules_edit',
    'series_story',
    'series_story_add',
    'series_story_edit',
  ],
  type: 1,
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
