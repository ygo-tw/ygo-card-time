<template>
  <div class="page-header">
    <img class="bg-1" src="~/assets/img/bg/p-header-1.png" alt="背景裝飾" />
    <img class="bg-2" src="~/assets/img/bg/p-header-2.png" alt="背景裝飾" />
    <img class="bg-3" src="~/assets/img/bg/p-header-3.png" alt="背景裝飾" />

    <Breadcrumb :items="props.breadcrumbItems" />
    <h1 class="custom-title-l text-white">{{ props.title }}</h1>
  </div>
</template>

<script setup lang="ts">
import Breadcrumb from '~/components/Breadcrumb.vue';
import type { BreadcrumbItem } from '~/models/breadcrumb';

const props = defineProps<{
  breadcrumbItems: BreadcrumbItem[];
  id: string;
  title: string;
}>();
</script>

<style lang="scss" scoped>
@keyframes breathing {
  0% {
    box-shadow: 0px 4px 4px 0px rgba(77, 127, 104, 0.3);
  }
  50% {
    box-shadow: 0px 8px 16px 0px rgba(77, 127, 104, 0.6);
  }
  100% {
    box-shadow: 0px 4px 4px 0px rgba(77, 127, 104, 0.3);
  }
}

.page-header {
  @apply relative flex h-[160px] w-full flex-col gap-6 px-[calc(50vw-600px)] pt-[30px] mt-[60px] overflow-hidden;
  box-shadow: 0px 4px 4px 0px #4d7f683f;
  animation: breathing 3s ease-in-out infinite;

  .bg-1 {
    @apply absolute bottom-0 left-0 w-[150px];
  }

  .bg-2 {
    @apply absolute right-[120px] top-0 w-[274px];
  }

  .bg-3 {
    @apply absolute right-0 top-0 w-[239px];
  }
}

@media (max-width: 1200px) {
  .page-header {
    @apply px-[calc(50vw-400px)];
  }
}

@media (max-width: 900px) {
  .page-header {
    @apply px-[10vw];
  }
}

@media (max-width: 768px) {
  .page-header {
    @apply h-[110px] gap-4 pt-[20px] px-[5.33vw];

    .bg-1 {
      @apply absolute bottom-0 left-0 w-[100px];
    }

    .bg-2 {
      @apply absolute right-[20px] top-0 w-[140px];
    }

    .bg-3 {
      @apply absolute right-[-100px] top-[-25px] w-[200px];
    }

    .page-title {
      @apply ml-[3.4vw];
    }
  }
}
</style>
