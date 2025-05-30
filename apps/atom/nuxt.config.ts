import { defineNuxtConfig } from 'nuxt/config';
import { resolve } from 'path';
import Aura from '@primeuix/themes/aura';

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
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
  css: ['~/assets/css/base.css', '~/assets/css/index.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
});
