<template>
  <div>
    <StarBackground>
      <PageHeader
        :breadcrumb-items="[{ label: '系列介紹' }, { label: '補充包' }]"
        title="補充包"
      />

      <!-- 搜尋輸入匡 -->
      <div class="search-input">
        <div class="relative inline-block">
          <input
            v-model="searchRequest.keyword"
            type="text"
            placeholder="搜尋關鍵字"
            @keyup.enter="searchArticle"
          />
          <IconSearch
            class="cursor-pointer absolute right-1 top-1/2 -translate-y-1/2 fill-main-white stroke-main-white"
            @click="searchArticle"
          />
        </div>
      </div>

      <!-- 搜尋結果 -->
      <div class="search-result">
        <IndexArticleCard
          v-for="article in list"
          :key="article._id"
          :article="article"
        />
      </div>

      <Pagination
        v-model="searchRequest.page"
        class="py-10"
        :total="totalCount"
        :page-size="9"
        @change="searchArticle"
      />
    </StarBackground>
  </div>
</template>

<script setup lang="ts">
import IconSearch from '~/assets/img/icon_search.svg';
import { ref } from 'vue';
import type { ArticleItem } from '~/models/articleItem';

defineOptions({
  name: 'ProductInformationPack',
});

const searchRequest = ref({
  page: 1,
  pageSize: 9,
  keyword: '',
});
const totalCount = ref<number>(10);
const searchArticle = () => {
  console.log(searchRequest.value);
};
const list = ref<ArticleItem[]>([
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
  {
    _id: '4',
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
    _id: '5',
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
  {
    _id: '6',
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
    _id: '7',
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
]);
</script>

<style lang="scss" scoped>
.search-input {
  @apply max-w-[1200px] mx-auto pt-10 text-right px-2;

  input {
    @apply text-main-white placeholder:text-[#999999] bg-transparent border-b border-secondary-300 py-1 pl-1 pr-8 text-[1.125rem];
  }
}
.search-result {
  @apply mx-auto grid w-[1200px] grid-cols-3 gap-x-[21px] gap-y-[32px] py-8;
}

@media (max-width: 1200px) {
  .search-result {
    @apply w-[800px] grid-cols-2;
  }
}

@media (max-width: 900px) {
  .search-result {
    @apply w-[80vw] grid-cols-2;
  }
}

@media (max-width: 768px) {
  .search-result {
    @apply w-[89.33vw] grid-cols-1 gap-y-[28px] py-8;
  }
}
</style>
