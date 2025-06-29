<template>
  <div class="star-background">
    <div id="stars"></div>
    <div id="stars2"></div>
    <div id="stars3"></div>
    <div class="content-layer">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

defineOptions({
  name: 'StarBackground',
});

// 生成隨機 box-shadow 字符串的函數
const generateBoxShadow = (count: number): string => {
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 2000);
    shadows.push(`${x}px ${y}px #FFF`);
  }
  return shadows.join(', ');
};

onMounted(() => {
  // 生成小星星的 box-shadow
  const smallStars = generateBoxShadow(700);
  const starsEl = document.getElementById('stars');
  if (starsEl) {
    starsEl.style.boxShadow = smallStars;
    // 為 :after 偽元素也設置相同的 box-shadow
    const style = document.createElement('style');
    style.textContent = `
      #stars:after {
        box-shadow: ${smallStars};
      }
    `;
    document.head.appendChild(style);
  }

  // 生成中等星星的 box-shadow
  const mediumStars = generateBoxShadow(200);
  const stars2El = document.getElementById('stars2');
  if (stars2El) {
    stars2El.style.boxShadow = mediumStars;
    const style2 = document.createElement('style');
    style2.textContent = `
      #stars2:after {
        box-shadow: ${mediumStars};
      }
    `;
    document.head.appendChild(style2);
  }

  // 生成大星星的 box-shadow
  const bigStars = generateBoxShadow(100);
  const stars3El = document.getElementById('stars3');
  if (stars3El) {
    stars3El.style.boxShadow = bigStars;
    const style3 = document.createElement('style');
    style3.textContent = `
      #stars3:after {
        box-shadow: ${bigStars};
      }
    `;
    document.head.appendChild(style3);
  }
});
</script>

<style scoped>
.star-background {
  position: relative;
  width: 100%;
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
  overflow: hidden;
}

#stars {
  width: 1px;
  height: 1px;
  background: transparent;
  animation: animStar 50s linear infinite;
}

#stars:after {
  content: ' ';
  position: absolute;
  top: 2000px;
  width: 1px;
  height: 1px;
  background: transparent;
}

#stars2 {
  width: 2px;
  height: 2px;
  background: transparent;
  animation: animStar 100s linear infinite;
}

#stars2:after {
  content: ' ';
  position: absolute;
  top: 2000px;
  width: 2px;
  height: 2px;
  background: transparent;
}

#stars3 {
  width: 3px;
  height: 3px;
  background: transparent;
  animation: animStar 150s linear infinite;
}

#stars3:after {
  content: ' ';
  position: absolute;
  top: 2000px;
  width: 3px;
  height: 3px;
  background: transparent;
}

@keyframes animStar {
  from {
    transform: translateY(0px);
  }
  to {
    transform: translateY(-2000px);
  }
}

/* 內容層級 */
.content-layer {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
}
</style>
