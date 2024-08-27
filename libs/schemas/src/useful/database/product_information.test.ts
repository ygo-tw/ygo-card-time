import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

import { usefulDatabaseProductInformationDataSchema as schema } from './product_information.const';
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
  _id: '643c15426d9a4b14a77ddf0d',
  type: 0,
  title: '200復刻包 side Unity (QCCU) 全卡表',
  publish_date: '2024-01-16T11:01:03.000Z',
  photo: 'f356a511-c735-4102-9b60-acaed55401b7.jpeg',
  content:
    '<div>QUARTER CENTURY CHRONICLE side:UNITY</div>\n<div>\n<div class="p">\n<div>發售日期：2024/2/23</div>\n</div>\n</div>\n<div>&nbsp;</div>\n<div><img class="wscnph" src="https://cardtime.tw/api/card-image/article/643c15426d9a4b14a77ddf0d-2a0b1148-3e13-45fd-aa11-226d2625737a.png" /></div>\n<div>&nbsp;</div>\n<div>\n<div class="p">\n<div>1包4張，1盒15包</div>\n<div>種類：</div>\n<div>全200種</div>\n<div>QCSER 1種</div>\n<div>UR 80種</div>\n<div>SR 119種</div>\n<div>UR卡和SR卡有SER版本和QCSER版本，全卡其中60種有UTR版本</div>\n<div>價格：385日圓（含稅）</div>\n<div>&nbsp;</div>\n<div>說明：</div>\n<div>-能夠回顧「遊戲王OCG」25週年歷史的特別卡包登場。</div>\n<div>-收錄歷代角色使用的卡片及各時代活躍於決鬥場面的主題及卡片。</div>\n</div>\n<div>&nbsp;</div>\n<div>完整卡表:</div>\n<div><span style="color: #0000ff;"><a href="https://cardtime.tw/cards?id=QCCU" target="_blank" rel="noopener">https://cardtime.tw/cards?id=QCCU</a></span></div>\n</div>',
  status: 0,
  to_top: true,
  admin_id: '643c11dc6d9a4b14a77a5d95',
  tag: [
    {
      _id: '6433cb84393872bd1b6ee643',
      tag: '泛用卡',
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
