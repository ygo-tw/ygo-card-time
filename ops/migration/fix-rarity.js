const cards = db.getSiblingDB('ygo').getCollection('cards');

const total = cards.countDocuments({ rarity: '凸版浮雕' });

console.log('總數量', total);

const result = cards.aggregate([
  {
    $match: {
      rarity: '凸版浮雕',
    },
  },
  {
    $set: {
      rarity: {
        $map: {
          input: '$rarity',
          as: 'item',
          in: {
            $cond: {
              if: { $eq: ['$$item', '凸版浮雕'] },
              then: '浮雕',
              else: '$$item',
            },
          },
        },
      },
    },
  },
  {
    $merge: {
      into: 'cards',
      whenMatched: 'merge',
      whenNotMatched: 'discard',
    },
  },
]);

console.log('更新成功', result.length);
