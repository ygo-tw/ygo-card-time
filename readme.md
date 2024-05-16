# YGO Card Time

這是一個關於 YGO 卡片網站的相關專案。

## 目錄介紹

- libs : 存放一些常用的函式庫
  - `schemas`: 放置 json schema 定義、type、 json-schema-ts 等相關檔案
  - `google-apis`: google apis 的 service ，目前包含 Service : `drive`
  - `line` : line-bot 相關 Service
  - `mailer` : 寄信相關 Service
  - `mongo-server` : 存取 mongoDB 的 Service
- apps : 存放各種應用程式
  - yu-sei : 為卡片爬蟲、 cronJob 等相關工作
  - kai-ba : 為網站後端(`backend`)，使用 Node.js + Fastify 框架
  - atom : 為網站前台(`User Site`)，使用 Vite + Vue3 框架
  - jo-no-chi : 為網站後台(`Back Office`)，目前使用 Vue2 框架 => `未來可能轉換至 Vue3`
  - yu-gi : 為 API 轉接橋梁(`API Bridge`)，預計使用 Node.js + Fastify 框架
- config : 存放各種設定檔案，包含 `env`、`config.json`、`schema.json` 等

## 使用方式

### 環境設定

前置作業，請使用 `yarn` ， node 版本請使用 `>=18`

1. 請先設定好 `.env` 檔案放於 `config` 下，包含以下 :

   1. `.env.common`
   2. `.env.service`

2. 第一次啟動，請務必執行下面指令

   ```
   yarn install
   ```

3. 設定 `link patten`

   1. Unix 環境請參考下方設定

      ```
      sudo mkdir /Users
      cd /Users
      sudo ln -s /path/to/project ygo-card-time
      ```

   2. Windows 環境請參考下方設定

      ```
      cd C:\Users
      mklink /D "C:\Users\ygo-card-time" "D:\path\to\project"
      ```

   - 接著請到任一 `libs/schemas`，找到 json 檔案，並看是否能透過 `$id`，連結到其他 json 檔案。

4. 當想要全局啟動時，請於專案 root 目錄下，執行下面指令

   ```
   yarn setup
   ```

## 專案開發作者

- Erichong <<f102041332@gmail.com>>
- AlexWang <<alex1234567639@gmail.com>>
- Card Time Team <<>>
