<template>
  <div class="title-wrapper">
    <!-- 背景光暈 -->
    <div class="backgroundGroup">
      <div class="background1"></div>
      <div class="background2"></div>
    </div>

    <h4>{{ title }}</h4>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
}

defineProps<Props>();

defineOptions({
  name: 'IndexTitle',
});
</script>

<style lang="scss" scoped>
.title-wrapper {
  @apply relative flex flex-col items-center justify-center;
}

.backgroundGroup {
  @apply pointer-events-none absolute left-0 right-0 top-0 flex h-[200px] items-center justify-center;
  transform: translateY(-50%);

  .background1 {
    @apply absolute bg-accent/90;
    @apply h-[30%] w-[50%];
    @apply bottom-[10%] right-[10%];
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.4;
    animation-name: breathingLight;
    animation-duration: 1s;
    animation-iteration-count: infinite;
    animation-fill-mode: both;
    animation-direction: alternate;
  }
  .background2 {
    @apply absolute bg-primary-300;
    @apply h-[30%] w-[40%];
    @apply bottom-[0%] left-[15%];
    filter: blur(100px);
    opacity: 0.4;
    animation-name: breathingLight;
    animation-duration: 1.7s;
    animation-iteration-count: infinite;
    animation-fill-mode: both;
    animation-direction: alternate;
  }

  @keyframes breathingLight {
    from {
      opacity: 0.4;
    }
    to {
      opacity: 1;
    }
  }
}

h4 {
  @apply text-main-white custom-title-l py-[20px];
}
</style>
