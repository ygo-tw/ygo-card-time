<template>
  <div class="banner-carousel relative">
    <Carousel
      ref="carouselRef"
      :value="bannerList"
      :page="currentSlide"
      :num-visible="1"
      :num-scroll="1"
      :show-indicators="false"
      :show-navigators="false"
      circular
      class="custom-carousel"
    >
      <template #item="{ data }">
        <div>
          <!-- PC 圖片 - 7:3 長寬比 -->
          <img
            :src="data.photo_pc"
            :alt="data.title"
            class="w-full aspect-[7/3] object-cover pc"
          />

          <!-- Mobile 圖片 - 4:3 長寬比 -->
          <img
            :src="data.photo_mobile"
            :alt="data.title"
            class="w-full aspect-[4/3] object-cover mobile"
          />
        </div>
      </template>
    </Carousel>

    <!-- 左側遮罩方塊 -->
    <transition name="left">
      <div
        v-show="!isTransitioning"
        class="absolute left-0 top-0 w-full md:w-[30vw] h-full bg-accent-400 opacity-50 z-15"
      ></div>
    </transition>

    <!-- 文字方塊 -->
    <div
      class="absolute inset-0 z-20 flex flex-col items-center justify-center"
    >
      <div
        class="absolute left-0 md:left-[40px] text-center md:text-left text-white p-4"
      >
        <transition name="textFade">
          <h2
            v-if="!isTransitioning"
            class="text-3xl md:text-6xl tracking-[8px] font-medium mb-4 md:mb-6"
          >
            {{ bannerList[currentSlide]?.title }}
          </h2>
        </transition>

        <transition name="textFade">
          <p
            v-if="!isTransitioning && bannerList[currentSlide]?.subtitle"
            class="custom-title-m"
          >
            {{ bannerList[currentSlide]?.subtitle }}
          </p>
        </transition>

        <!-- 外部連結 -->
        <transition name="fade">
          <Button
            v-if="!isTransitioning && bannerList[currentSlide]?.url"
            class="custom-button-m px-4 py-2 mt-6 md:mt-10 text-white"
            @click="goUrl(bannerList[currentSlide]?.url || '')"
          >
            立即前往
            <i class="pi pi-arrow-right ml-1"></i>
          </Button>
        </transition>
      </div>
    </div>

    <div
      class="absolute bottom-0 left-0 right-0 z-20 flex justify-center items-center p-3 md:p-4 space-x-4"
    >
      <!-- 上一張按鈕 -->
      <button class="btn-prev" aria-label="上一張" @click="prevSlide">
        <i class="pi pi-chevron-left"></i>
      </button>

      <!-- 指示器 -->
      <div class="flex space-x-2">
        <button
          v-for="(item, index) in bannerList"
          :key="index"
          :class="[
            'w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300',
            currentSlide === index
              ? 'bg-white'
              : 'bg-white bg-opacity-50 hover:bg-opacity-80',
          ]"
          :aria-label="`跳到第 ${index + 1} 張`"
          @click="goToSlide(index)"
        />
      </div>

      <!-- 下一張按鈕 -->
      <button class="btn-next" aria-label="下一張" @click="nextSlide">
        <i class="pi pi-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { BannerItem } from '~/models/bannerItem';

defineOptions({
  name: 'BannerCarousel',
});

const bannerList = ref<BannerItem[]>([
  {
    title: '遊戲王最新情報',
    subtitle: '新卡包「幻影怒濤」即將登場',
    date: '2025-01-15',
    photo_pc: 'https://picsum.photos/id/1/700/300',
    photo_mobile: 'https://picsum.photos/400/300',
    url: 'https://picsum.photos/',
  },
  {
    title: '限制卡表更新',
    subtitle: '2025年1月新制限制卡表公開',
    date: '2025-01-10',
    photo_pc: 'https://picsum.photos/id/200/700/300',
    photo_mobile: 'https://picsum.photos/id/2/400/300',
    url: 'https://v3.tailwindcss.com/docs/installation',
  },
  {
    title: '線上大賽開始',
    subtitle: '卡壇盃遊戲王大賽報名中',
    date: '2025-01-05',
    photo_pc: 'https://picsum.photos/id/100/700/300',
    photo_mobile: 'https://picsum.photos/id/3/400/300',
    url: '',
  },
]);

const carouselRef = ref();
const currentSlide = ref(0);
const isTransitioning = ref(false);

// 監聽 currentSlide 變化，實現切換效果
watch(currentSlide, () => {
  isTransitioning.value = true;
  // 等待輪播動畫完成後顯示元素
  setTimeout(() => {
    isTransitioning.value = false;
  }, 500); // 調整時間以匹配輪播動畫時長
});

const prevSlide = () => {
  currentSlide.value =
    currentSlide.value === 0
      ? bannerList.value.length - 1
      : currentSlide.value - 1;
};
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % bannerList.value.length;
};
const goToSlide = (index: number) => {
  currentSlide.value = index;
};

const goUrl = (url: string) => {
  window.open(url, '_blank');
};
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.textFade-enter-from,
.textFade-leave-to {
  transform: translateY(30%);
  opacity: 0;
}
.textFade-enter-active,
.textFade-leave-active {
  transition: all 0.2s;
}
.textFade-enter-to,
.textFade-leave-from {
  opacity: 1;
}

.left-enter-from,
.left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
.left-enter-active,
.left-leave-active {
  transition: all 0.5s;
}
.left-enter-to,
.left-leave-from {
  opacity: 0.5;
}

.btn-prev,
.btn-next {
  @apply flex items-center justify-center w-[36px] h-[36px] bg-primary hover:bg-opacity-80 text-white rounded-full transition-all duration-100;
  i {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .btn-prev,
  .btn-next {
    @apply w-[28px] h-[28px] hover:bg-primary;
    i {
      font-size: 12px;
    }
  }
}
</style>
