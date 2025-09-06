const fs = require('fs');

const target = process.argv[2];

function ntu2json(target) {
  const lines = target.split('\n');
  const result = {};
  result.effect = '';
  for (const [index, line] of lines.entries()) {
    if (index === 0) {
      const [id, other] = line.split(' ').filter(Boolean);
      result.id = id;
      result.product_information_type = id.split('-')[0];
      if (!other.includes('(')) result.rarity = '普卡';
      else {
        const rarityList = other
          .split(')')[0]
          .replace('(', '')
          .split('/')
          .map(r => {
            if (r === 'SR') return '亮面';
            if (r === 'UR') return '金亮';
            if (r === 'SER') return '半鑽';
            if (r === 'N') return '普卡';
            if (r === 'PSER') return '白鑽';
            return '@';
          });
        result.rarity = rarityList;
      }
    } else if (index === 1) {
      const [name, other] = line.split(')').filter(Boolean);
      result.name = name.replace('(', '').replace(')', '');
      const [type, star, attribute, race, atkDef] = other
        .split(' ')
        .filter(Boolean);
      const types = type.split('/');
      if (types.length === 1) result.type = types[0];
      else {
        if (types.includes('同步')) result.type = '同步怪獸';
        else if (types.includes('融合')) result.type = '融合怪獸';
        else if (types.includes('超量')) result.type = '超量怪獸';
        else if (types.includes('靈擺')) result.type = '靈擺怪獸';
        else if (types.includes('連結')) result.type = '連結怪獸';
        else
          result.type =
            types[0] +
            (types[0].includes('魔法') || types[0].includes('陷阱')
              ? ''
              : '怪獸');
      }
      if (star) {
        if (result.type === '超量怪獸') {
          result.star = '階級' + star;
        } else if (result.type === '連結怪獸') {
          result.star = 'LINK-' + star;
        } else result.star = '等級' + star;
      }
      if (attribute) result.attribute = attribute;
      if (race) result.race = race;
      if (atkDef) {
        const [atk, def] = atkDef.split('/');
        result.atk = Number(atk);
        result.def = Number(def);
      }
    } else {
      result.effect += line + '\n';
    }
  }

  return result;
}

if (!fs.existsSync('./ntu.json')) {
  fs.writeFileSync('./ntu.json', '[]');
}

const jsonFile = fs.readFileSync('./ntu.json', 'utf-8');
const jsonData = JSON.parse(jsonFile);
const result = ntu2json(target);
console.log(result);
jsonData.push(result);

fs.writeFileSync('./ntu.json', JSON.stringify(jsonData, null, 2));
