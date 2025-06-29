<template>
  <div class="footer-wrapper">
    Copyright © 卡壇 Card Time. All rights reserved.
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'FooterComponent',
});
</script>

<style lang="scss" scoped>
.footer-wrapper {
  @apply custom-body-s w-full text-center text-white py-3 bg-primary;
}
</style>
