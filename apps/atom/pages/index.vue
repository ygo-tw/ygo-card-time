<template>
  <div>
    <IndexCardTime />
    <IndexBanner />
    <StarBackground class="pb-[100px]">
      <!-- 最新消息 -->
      <IndexNews />

      <!-- 系列介紹 -->
      <IndexProduct />

      <!-- 上位卡表 -->
      <IndexMeta />
    </StarBackground>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'HomePage',
});
</script>
