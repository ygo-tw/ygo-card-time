<template>
  <article class="article-card-wrapper">
    <div class="img-wrapper">
      <div class="img" :style="`background-image: url(${article.photo})`"></div>
    </div>

    <div class="content">
      <div class="date">
        {{ formatDateString(article.publish_date) }}
      </div>
      <div class="title">{{ article.title }}</div>
      <div class="author">{{ `作者：${article.admin_name}` }}</div>
      <div class="tags">
        <span v-for="tag in article.tag" :key="tag" class="tag"
          ># {{ tag }}</span
        >
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { ArticleItem } from '~/models/articleItem';

interface Props {
  article: ArticleItem;
}
defineProps<Props>();

defineOptions({
  name: 'IndexArticleCard',
});
</script>

<style lang="scss" scoped>
.article-card-wrapper {
  @apply bg-white overflow-hidden cursor-pointer;
  border-radius: 10px;
  background-image: linear-gradient(to top, #ffffff 70%, black);

  &:hover {
    & .img-wrapper {
      & .img {
        backface-visibility: hidden;
        transform: translateZ(0) scale(1.05);
        transform-origin: center;
      }
    }
  }
  & .img-wrapper {
    @apply w-full h-[201.48px] overflow-hidden;
    & .img {
      @apply w-full h-full bg-no-repeat bg-cover bg-center duration-200;
      background-color: #e1e1e1;
      transform: translateZ(0) scale(1, 1);
    }
  }
  & .content {
    @apply p-[10px_15px] flex flex-col gap-[10px];
    & .date {
      @apply custom-body-s text-accent-700;
    }
    & .title {
      @apply custom-title-s text-primary;
      height: 62px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    & .author {
      @apply text-primary-600 custom-body-m;
    }
    & .tags {
      & .tag {
        @apply custom-label-m bg-primary-200 px-2 py-1 rounded-[6px] mr-2 mb-1 inline-block;
      }
    }
  }
}
</style>
