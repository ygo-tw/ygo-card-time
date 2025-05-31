import { defineNuxtConfig } from 'nuxt/config';
import { resolve } from 'path';
import Aura from '@primeuix/themes/aura';

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  // 開發服務器配置 - 支援手機訪問
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },

  // Head 配置 - 全域 meta 標籤和 SEO 設定
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: '卡壇 Card Time',
      meta: [
        // 基本 meta
        {
          name: 'description',
          content:
            'Card Time(卡壇)是一個以TCG卡牌-遊戲王為主的交流網站，主要以文章分享的形式呈現，並提供線上組牌及估價等功能供使用者運用。',
        },
        {
          name: 'keywords',
          content:
            '遊戲王,TCG,抄牌網,Card Time,卡壇,線上組牌,YGO,YU-GI-OH,游戏王',
        },
        { name: 'image', content: 'https://cardtime.tw/og.jpg' },

        // 主題色彩
        { name: 'theme-color', content: '#ffffff' },
        { name: 'msapplication-TileColor', content: '#da532c' },

        // Open Graph
        { property: 'og:title', content: '卡壇 Card Time' },
        {
          property: 'og:description',
          content:
            'Card Time(卡壇)是一個以TCG卡牌-遊戲王為主的交流網站，主要以文章分享的形式呈現，並提供線上組牌及估價等功能供使用者運用。',
        },
        { property: 'og:url', content: 'https://cardtime.tw/' },
        { property: 'og:image', content: 'https://cardtime.tw/og.jpg' },
        { property: 'og:image:height', content: '315' },
      ],
      link: [
        // Favicon
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16x16.png',
        },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#5bbad5' },
      ],
    },
  },

  alias: {
    '@': resolve(__dirname, './assets/css'),
  },
  modules: [
    [
      '@primevue/nuxt-module',
      {
        options: {
          theme: {
            preset: Aura,
          },
        },
      },
    ],
  ],
  css: [
    '~/assets/css/base.css',
    '~/assets/css/index.css',
    'primeicons/primeicons.css',
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
});
