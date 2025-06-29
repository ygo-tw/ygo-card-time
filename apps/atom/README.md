# YGO CARD TIME 前台

本專案使用 Nuxt3 + TypeScript 開發

## 目錄

- [YGO CARD TIME 前台](#ygo-card-time-前台)
  - [目錄](#目錄)
  - [使用工具](#使用工具)
  - [專案架構](#專案架構)

## 使用工具

- Node.js 執行環境 - [20.12.2](https://nodejs.org/zh-tw)
- 套件管理 - [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)
- 版本控制 - [Git](https://git-scm.com)

## 專案架構

```bash
├── assets/                       # 靜態資源
│   ├── css/                      # CSS 樣式檔案
│   ├── font/                     # 字體檔案
│   └── img/                      # 圖片資源
├── components/                   # Vue 組件
│   ├── Index/                    # 首頁相關組件
│   │   ├── ArticleCard.vue       # 文章卡片組件
│   │   ├── ArticleListItem.vue   # 文章列表項目組件
│   │   ├── Banner.vue            # 橫幅組件
│   │   ├── CardTime.vue          # 卡片時間組件
│   │   └── Title.vue             # 標題組件
│   ├── Footer.vue                # 頁尾組件
│   ├── Header.vue                # 頁首組件
│   └── StarBackground.vue        # 星星背景組件
├── composables/                  # Vue 組合式函數
│   └── useTools.ts               # 工具函數
├── models/                       # TypeScript 型別定義
│   ├── articleItem.ts            # 文章項目型別
│   ├── bannerItem.ts             # 橫幅項目型別
│   ├── cardItem.ts               # 卡片項目型別
│   └── menuItem.ts               # 選單項目型別
├── pages/                        # 頁面組件
│   ├── example.vue               # 範例頁面
│   └── index.vue                 # 首頁
├── public/                       # 公開靜態資源
├── server/                       # 服務端相關檔案
├── services/                     # API 服務層
│   ├── api.ts                    # API 基礎設定
│   ├── cardService.ts            # 卡片服務
│   └── halo.js                   # 流體動畫服務
├── utils/                        # 工具函數
├── app.vue                       # 根組件
├── nuxt.config.ts                 # Nuxt 設定檔
├── package.json                  # 專案描述與指令
├── tailwind.config.js             # Tailwind CSS 設定
├── tsconfig.json                  # TypeScript 設定
├── yarn.lock                     # Yarn 鎖定檔
└── README.md                     # 專案說明文件
```
