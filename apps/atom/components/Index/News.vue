<template>
  <div class="index-news-wrapper">
    <IndexTitle title="最新消息" />

    <div class="news-section">
      <ArticleListItem
        v-for="article in mockArticles"
        :key="article._id"
        :article="article"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ArticleItem } from '~/models/articleItem';

defineOptions({
  name: 'IndexNews',
});

// 假資料
const mockArticles: ArticleItem[] = [
  {
    _id: '1',
    title: '遊戲王新卡包「幻影騎士團」即將發售！',
    publish_date: '2024-01-15',
    photo: 'https://picsum.photos/400/200?random=1',
    content: '全新的幻影騎士團系列卡片即將登場，帶來全新的戰術可能性...',
    status: 1,
    to_top: true,
    admin_name: '遊戲王小編',
    admin_id: 'admin001',
    tag: ['新卡包', '幻影騎士團', '發售情報'],
  },
  {
    _id: '2',
    title: '2024年1月禁卡表更新公告',
    publish_date: '2024-01-10',
    photo: 'https://picsum.photos/400/200?random=2',
    content: '官方公布了最新的禁卡表更新，多張卡片被限制或禁止使用...',
    status: 1,
    to_top: false,
    admin_name: '規則管理員',
    admin_id: 'admin002',
    tag: ['禁卡表', '規則更新', '官方公告'],
  },
  {
    _id: '3',
    title: '新手入門：如何組建第一副牌組',
    publish_date: '2024-01-05',
    photo: 'https://picsum.photos/400/200?random=3',
    content: '對於剛接觸遊戲王的新手玩家，本文將詳細介紹如何組建第一副牌組...',
    status: 1,
    to_top: false,
    admin_name: '教學專員',
    admin_id: 'admin003',
    tag: ['新手教學', '牌組構築', '入門指南'],
  },
];
</script>

<style lang="scss" scoped>
.index-news-wrapper {
  @apply py-[5vw] px-[10vw];

  .news-section {
    @apply flex flex-col gap-8;
  }
}
</style>
