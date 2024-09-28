import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

import { usefulDatabaseDecksDataSchema as schema } from './decks-data.const';
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
  _id: '658d0eae5e96a993f012e3be',
  admin_id: 'alex123456',
  title: '想收',
  create_date: '2023-12-28T00:00:00.000+00:00',
  last_edit_date: '2024-01-11T00:00:00.000+00:00',
  main_deck: [
    {
      _id: '659f861b67107c49d73e65fd',
      card_id: '659cc3040dfe8e6bdaf89ca1',
      card_rarity: '亮面',
    },
    {
      _id: '659f861b67107c49d73e65fd',
      card_id: '659cc3040dfe8e6bdaf89ca1',
      card_rarity: '亮面',
    },
  ],
  extra_deck: [
    {
      _id: '659f861b67107c49d73e65fd',
      card_id: '659cc3040dfe8e6bdaf89ca1',
      card_rarity: '亮面',
    },
    {
      _id: '659f861b67107c49d73e65fd',
      card_id: '659cc3040dfe8e6bdaf89ca1',
      card_rarity: '亮面',
    },
  ],
  side_deck: [],
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
