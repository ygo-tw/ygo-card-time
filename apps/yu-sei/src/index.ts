import { envRunner } from './app';
import figlet from 'figlet';
// import { YgoJpInfo } from './cronJobs/ygoJpInfo';
import { DataAccessService } from '@ygo/mongo-server';
// import { CheerioCrawler } from '@ygo/crawler';
import { JurisprudenceDataType } from '@ygo/schemas';

const main = async () => {
  envRunner();
  console.log(
    figlet.textSync('YGO Reptile!!!', {
      font: 'Ghost',
    })
  );

  // const cheerioCrawler = new CheerioCrawler('https://www.db.yugioh-card.com');
  const da = new DataAccessService(
    `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.rnvhhr4.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`
  );

  const result = await da.createOne<JurisprudenceDataType>('jurisprudence', {
    number: '10000004',
    name_jp_h: 'オベリスクのきょしんへい',
    name_jp_k: 'オベリスクの巨神兵',
    name_en: 'Obelisk the Tormentor',
    effect_jp:
      'このカードを通常召喚する場合、３体をリリースして召喚しなければならない。①：このカードの召喚は無効化されない。②：このカードの召喚成功時には、魔法・罠・モンスターの効果は発動できない。③：フィールドのこのカードは効果の対象にならない。④：自分フィールドのモンスター２体をリリースして発動できる。相手フィールドのモンスターを全て破壊する。この効果を発動するターン、このカードは攻撃宣言できない。⑤：このカードが特殊召喚されている場合、エンドフェイズに発動する。このカードを墓地へ送る。',
    jud_link:
      'https://www.db.yugioh-card.com/yugiohdb/faq_search.action?ope=4&cid=4998&request_locale=ja',
    info: '【『このカードを通常召喚する場合、３体をリリースして召喚しなければならない』について】■効果として扱いません。このカードの召喚の方法です。■通常召喚により、セットする（裏側守備表示でモンスターゾーンに出す）ことはできず、召喚する（表側表示でモンスターゾーンに出す）ことしかできません。【①の効果について】■起動効果・誘発効果・誘発即時効果・永続効果のいずれにも分類されない効果です。■このカードの召喚を無効にする効果はお互いに発動できません。【②の効果について】■モンスターゾーンで適用する永続効果です。【③の効果について】■モンスターゾーンで適用する永続効果です。■お互いのプレイヤーに適用される効果です。（お互いのプレイヤーは、効果を発動する際に、モンスターゾーンの表側表示のこのカードを対象に選択できません。）【④の効果について】■モンスターゾーンで発動できる起動効果です。■この効果を発動する際にコストとして、自分のモンスターゾーンのモンスター２体をリリースします。このカードをリリースするモンスターに含めることもできます。【⑤の効果について】■モンスターゾーンで発動する誘発効果です。■条件を満たしている場合に必ず発動します。■このカードが特殊召喚されている場合、エンドフェイズ毎に１度発動します。',
    qa: [],
  } as unknown as JurisprudenceDataType);

  // const ygoJpInfo = new YgoJpInfo(cheerioCrawler, da);

  // const result = await ygoJpInfo.getNewCardsJPInfo(['68638985']);
  console.log(result);
};

main();
