<template>
  <button class="article-list-item-wrapper">
    <div class="item-left">
      <p class="flex items-center gap-2 custom-body-s">
        <span class="text-accent-500">{{ article.publish_date }}</span>
        <span class="px-2 py-1 rounded-[6px] bg-accent-500 text-white">{{
          article.admin_name
        }}</span>
      </p>
      <p class="custom-button-l text-white">{{ article.title }}</p>
    </div>
    <div class="item-right">
      <i class="pi pi-arrow-right"></i>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { ArticleItem } from '~/models/articleItem';

interface Props {
  article: ArticleItem;
}
defineProps<Props>();

defineOptions({
  name: 'IndexArticleListItem',
});
</script>

<style lang="scss" scoped>
.article-list-item-wrapper {
  @apply flex w-full items-end justify-between duration-200;
  padding: 1.05vw 1.85vw;
  border-bottom: 1px solid #a3a3a3;
  &:hover {
    border-bottom: 1px solid #f3f3f3;
    .item-right {
      transform: translateX(6px);
    }
  }
  & .item-left {
    @apply flex flex-col items-start gap-4;
  }
  & .item-right {
    @apply text-white duration-200;
  }
}
</style>
