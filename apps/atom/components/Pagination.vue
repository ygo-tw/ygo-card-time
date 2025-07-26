<template>
  <div class="pagination">
    <!-- 上一頁 -->
    <button
      class="pagination-btn"
      :disabled="currentPage === 1"
      @click="goToPage(currentPage - 1)"
    >
      <IconGo class="w-[10px] rotate-180" stroke="white" />
    </button>
    <!-- 頁碼 -->
    <button
      v-for="page in pageCount"
      :key="page"
      class="pagination-btn"
      :class="{ active: page === currentPage }"
      @click="goToPage(page)"
    >
      {{ page }}
    </button>
    <!-- 下一頁 -->
    <button
      class="pagination-btn"
      :disabled="currentPage === pageCount"
      @click="goToPage(currentPage + 1)"
    >
      <IconGo class="w-[10px]" stroke="white" />
    </button>
  </div>
</template>

<script setup lang="ts">
import IconGo from '~/assets/img/icon_go.svg';
import { computed } from 'vue';

defineOptions({
  name: 'CommonPagination',
});

const props = defineProps<{
  total: number;
  pageSize?: number;
  modelValue: number; // v-model:currentPage
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', page: number): void;
  (e: 'change', page: number): void;
}>();

const pageSize = computed(() => props.pageSize ?? 9);
const pageCount = computed(() =>
  Math.max(1, Math.ceil(props.total / pageSize.value))
);
const currentPage = computed(() =>
  Math.min(Math.max(props.modelValue, 1), pageCount.value)
);

function goToPage(page: number) {
  if (page < 1 || page > pageCount.value) return;
  emit('update:modelValue', page);
  emit('change', page);
}
</script>

<style lang="scss" scoped>
.pagination {
  @apply flex items-center justify-center gap-3;
}
.pagination-btn {
  @apply flex items-center justify-center rounded-full text-white h-[35px] w-[35px];
  &[disabled] {
    @apply cursor-not-allowed opacity-40;
  }
  &.active {
    @apply bg-white/20;
  }
}

@media (max-width: 768px) {
  .pagination {
    @apply gap-2;
  }
  .pagination-btn {
    @apply h-[40px] w-[40px];
  }
}
</style>
