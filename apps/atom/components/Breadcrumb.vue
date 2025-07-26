<template>
  <nav
    class="breadcrumb-wrapper"
    :class="props.textColor"
    aria-label="麵包屑導覽"
  >
    <ol class="breadcrumb-list" aria-label="頁面導覽路徑">
      <li class="breadcrumb-item">
        <NuxtLink
          to="/"
          class="breadcrumb-link"
          aria-label="首頁"
          title="前往首頁"
        >
          <IconHome
            width="24"
            height="24"
            :fill="props.textColor || '#ebebeb'"
          />
        </NuxtLink>
      </li>

      <li v-for="item in props.items" :key="item.label" class="breadcrumb-item">
        <span>></span>
        <NuxtLink v-if="item.to" :to="item.to" class="breadcrumb-link">
          {{ item.label }}
        </NuxtLink>
        <span v-else>
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import IconHome from '~/assets/img/icon_home.svg';
import type { BreadcrumbItem } from '~/models/breadcrumb';

defineOptions({
  name: 'CommonBreadcrumb',
});

const props = defineProps<{
  items: BreadcrumbItem[];
  textColor?: string;
}>();
</script>

<style lang="scss" scoped>
.breadcrumb-wrapper {
  @apply z-10 w-full text-[#ebebeb];

  .breadcrumb-list {
    @apply flex w-full gap-1;
  }

  .breadcrumb-item {
    @apply flex list-none items-center gap-1;

    .breadcrumb-link {
      @apply flex items-center gap-1;
    }
  }
}
</style>
