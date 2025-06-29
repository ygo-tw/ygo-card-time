<!-- 第一屏 -->
<template>
  <div ref="cardTimeRef" class="card-time-wrapper" @mousemove="onMouseMove">
    <div class="relative flex flex-col items-center">
      <canvas ref="canvas" class="canvas"></canvas>
      <div ref="titleRef" class="title-wrapper">
        <div class="gradient-text">
          <h2>遊戲王論壇</h2>
        </div>
        <div class="gradient-text">
          <h3>YGO CARD TIME</h3>
        </div>
      </div>

      <!-- Scroll Down 提示 -->
      <div class="scroll-down-hint">
        <div class="scroll-down-arrow">
          <i class="pi pi-chevron-down"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { isPhone } from '../../composables/useTools';
import { init } from '../../services/halo.js';
import { gsap } from 'gsap';

const titleRef = ref();
const cardTimeRef = ref();
const canvas = ref();
let isAutoSpotlightPlayDone = false;

onMounted(() => {
  gsap.to(cardTimeRef.value, {
    scrollTrigger: {
      markers: false,
      trigger: cardTimeRef.value,
      start: '60% top',
      end: '+=10',
      scrub: 0.5,
    },
    opacity: 1,
    zIndex: -1,
  });

  if (isPhone() === false) {
    if (canvas.value) {
      init(canvas.value);
      autoPlaySpotlight();
    }
  }
});

const autoPlaySpotlight = () => {
  const pointerRect = titleRef.value.getBoundingClientRect();
  const startDx = pointerRect.left;
  const endDx = pointerRect.right;
  const dy = (pointerRect.bottom - pointerRect.top) / 2;
  const logoGradient = `radial-gradient(circle at ${startDx}px ${dy}px, black 10%, transparent 100%)`;
  titleRef.value.style['-webkit-mask-image'] = logoGradient;
  titleRef.value.style['mask-image'] = logoGradient;
  gsap.fromTo(
    titleRef.value,
    {
      maskImage: `radial-gradient(circle at ${startDx}px ${dy}px, black 10%, transparent 100%)`,
      opacity: 1,
      duration: 0,
    },
    {
      maskImage: `radial-gradient(circle at ${endDx}px ${dy}px, black 10%, transparent 100%)`,
      opacity: 1,
      delay: 0.5,
      duration: 3,
      onComplete: () => {
        isAutoSpotlightPlayDone = true;
      },
    }
  );
};

const onMouseMove = (e: any) => {
  if (isPhone() === true || isAutoSpotlightPlayDone === false) {
    return;
  }
  const pointerRect = titleRef.value.getBoundingClientRect();

  const dx = e.pageX - pointerRect.left;
  const dy = e.pageY - pointerRect.top;

  const logoGradient = `radial-gradient(circle at ${dx}px ${dy}px, black 10%, transparent 100%)`;
  titleRef.value.style['mask-image'] = logoGradient;
};
</script>

<style lang="scss" scoped>
.card-time-wrapper {
  @apply h-[100svh] w-full overflow-hidden bg-accent-700;
  & .canvas {
    @apply absolute left-0 right-0 h-[100svh] w-full blur-xl;
  }

  & .title-wrapper {
    @apply pointer-events-none z-20 flex h-[100svh] w-full flex-col items-center bg-transparent object-contain justify-center gap-4;
  }

  & .gradient-text {
    @apply text-[9vw];
    background: linear-gradient(
      135deg,
      #ffffff 0%,
      /* 白色 */ #f8f8f9 20%,
      /* secondary-50 */ #f1f1f3 35%,
      /* secondary-100 */ #faf2e0 50%,
      /* accent-100 */ #f4e2c0 65%,
      /* accent-200 */ #eccc95 80%,
      /* accent-300 */ #ffffff 100% /* 白色 */
    );
    background-size: 200% 200%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradientShift 4s ease-in-out infinite;
    font-weight: bold;
    text-shadow: 0 0 30px rgba(196, 159, 59, 0.3);
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  & .scroll-down-hint {
    @apply absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 z-30;
    animation: floatUpDown 2s ease-in-out infinite;
  }

  & .scroll-down-arrow {
    @apply text-white opacity-60;
    i {
      @apply text-[2vw] text-accent;
    }
  }

  @keyframes floatUpDown {
    0%,
    100% {
      transform: translateX(-50%) translateY(0px);
    }
    50% {
      transform: translateX(-50%) translateY(-10px);
    }
  }
}
</style>
