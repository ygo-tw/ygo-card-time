<template>
  <article class="article-card-wrapper">
    <div class="img" :style="`background-image: url(${article.photo})`"></div>

    <div class="content">
      <div class="title">{{ article.title }}</div>
      <div class="article-info">
        <div>{{ `作者：${article.admin_name}` }}</div>
        <div>
          {{ `日期：${formatDateString(article.publish_date)}` }}
        </div>
      </div>
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
  @apply bg-white overflow-hidden;
  border-radius: 10px;
  background-image: linear-gradient(to top, #ffffff 70%, black);
  & .img {
    @apply w-full bg-no-repeat bg-cover bg-center;
    height: 201.48px;
    background-color: #e1e1e1;
  }
  & .content {
    padding: 10px 15px;
    & .title {
      @apply font-bold;
      color: #333333;
      font-size: 20px;
      height: 62px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    & .article-info {
      color: #636363;
      font-size: 18px;
      margin: 10px 0 0 0;
    }
    & .tags {
      margin-top: 10px;
      & .tag {
        @apply custom-label-m bg-primary-200 px-2 py-1 rounded-[6px] mr-2 mb-1 inline-block;
      }
    }
  }
}
</style>
