import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

import { usefulDatabaseCalendarDataSchema as schema } from './calendar-data.const';
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
  _id: '6433b5c16fb07eed863def1f',
  title: '小小杯店加賽',
  date: '2024-10-10T00:00:00.000+00:00',
  url: 'https://www.yugioh-card.com/japan/products/dp29/',
  content: '報名至2024-10-01',
  type: 0,
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
