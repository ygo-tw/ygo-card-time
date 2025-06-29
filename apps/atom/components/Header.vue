<template>
  <header
    class="header-wrapper"
    :class="{ 'header-wrapper-scroll': isScrolledDown }"
  >
    <button @click="showDrawer">
      <i class="pi pi-bars text-[1.5rem]"></i>
    </button>

    <NuxtLink to="/" aria-label="回到首頁">
      <img src="/assets/img/logo.png" alt="網站Logo" class="w-[150px]" />
    </NuxtLink>

    <button class="border-[2px] border-white rounded-full w-[30px] h-[30px]">
      <i class="pi pi-user text-[1.5rem]"></i>
    </button>
  </header>

  <Drawer v-model:visible="isShowDrawer" header="目錄">
    <div class="space-y-2">
      <template v-for="item in menuList" :key="item.route">
        <!-- 有子選單的項目 -->
        <div v-if="item.children">
          <!-- 父選單項目 - 可點擊展開/收合 -->
          <button
            class="w-full flex items-center justify-between p-2 custom-button-m text-primary hover:bg-gray-100 rounded transition-colors"
            @click="toggleExpanded(item.route)"
          >
            <span>{{ item.name }}</span>
            <i
              :class="[
                'pi pi-chevron-down transition-transform duration-300',
                { 'rotate-180': expandedMenus[item.route] },
              ]"
            ></i>
          </button>

          <!-- 子選單 - 根據展開狀態顯示 -->
          <div
            v-show="expandedMenus[item.route]"
            class="ml-4 space-y-1 overflow-hidden transition-all duration-200"
          >
            <NuxtLink
              v-for="child in item.children"
              :key="child.route"
              :to="child.route"
              class="block p-2 custom-body-s hover:bg-gray-100 rounded transition-colors"
              @click="isShowDrawer = false"
            >
              {{ child.name }}
            </NuxtLink>
          </div>
        </div>

        <!-- 沒有子選單的項目 -->
        <NuxtLink
          v-else
          :to="item.route"
          class="block p-2 hover:bg-gray-100 rounded transition-colors custom-button-m"
          @click="isShowDrawer = false"
        >
          {{ item.name }}
        </NuxtLink>
      </template>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import type { MenuItem } from '~/models/menuItem';

defineOptions({
  name: 'CommonHeader',
});

// 選單資料定義
const menuList: MenuItem[] = [
  {
    name: '首頁',
    route: '/',
  },
  {
    name: '卡片查詢 ',
    route: '/cards',
  },
  {
    name: '上位卡表 ',
    route: '/meta_deck',
  },
  {
    name: '卡表介紹',
    route: '/product_information',
    children: [
      {
        name: '補充包',
        route: '/product_information/pack',
      },
      {
        name: '預組',
        route: '/product_information/deck',
      },
      {
        name: '禮盒',
        route: '/product_information/box',
      },
      {
        name: '其他',
        route: '/product_information/other',
      },
    ],
  },
  {
    name: '規則相關',
    route: '/rules',
    children: [
      {
        name: '判例',
        route: '/rules/judgment',
      },
      {
        name: '禁卡表',
        route: '/rules/ban_list',
      },
    ],
  },
  {
    name: '牌組',
    route: '/deck',
    children: [
      {
        name: '牌組列表',
        route: '/deck/list',
      },
      {
        name: '新增牌組',
        route: '/deck/add',
        onlyPc: true,
        checkLogin: true,
      },
      {
        name: '我的牌組',
        route: '/deck/my_deck',
        checkLogin: true,
      },
    ],
  },
  {
    name: '日曆',
    route: '/calendar',
  },
];

// Drawer 狀態管理
const isShowDrawer = ref(false);
const showDrawer = () => {
  isShowDrawer.value = true;
};

// 展開狀態管理
const expandedMenus = ref<Record<string, boolean>>({});

const toggleExpanded = (route: string) => {
  expandedMenus.value[route] = !expandedMenus.value[route];
};

// 初始化展開狀態（預設全部收合）
const initializeExpandedMenus = () => {
  const expanded: Record<string, boolean> = {};
  menuList.forEach(item => {
    if (item.children) {
      expanded[item.route] = false; // 預設收合
    }
  });
  expandedMenus.value = expanded;
};

// 開啟Drawer時初始化展開狀態
watch(isShowDrawer, newValue => {
  if (newValue) {
    initializeExpandedMenus();
  }
});

// header 背景樣式隨滾動改變
const isScrolledDown = ref(false);
const handleScroll = () => {
  isScrolledDown.value = window.scrollY > 0;
};
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="scss" scoped>
.header-wrapper-scroll {
  @apply bg-primary/50;
  -webkit-backdrop-filter: blur(1.56vw);
  backdrop-filter: blur(1.56vw);
}
.header-wrapper {
  @apply flex justify-between items-center fixed top-0 left-0 w-full z-40 h-[60px] text-white px-[20px] duration-300;
}
</style>
