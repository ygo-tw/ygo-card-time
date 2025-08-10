# Step.1: 建置階段 - 安裝所有依賴並建置
FROM node:20-alpine AS server-build

ENV CI=true

WORKDIR /build

# 建立非 root 使用者
RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot

# 複製 workspace 設定檔案
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY tsconfig.json tsconfig.json
COPY .husky .husky

# 複製應用程式和依賴的 libs
COPY apps/kai-ba apps/kai-ba
COPY libs libs

# 1. 先安裝所有依賴
# 2. 安裝缺少的類型定義
# 3. 執行建構
# 4. 移除 devDependencies
RUN yarn install --frozen-lockfile && \
    yarn add -D -W @types/lodash && \
    yarn add -W dotenv && \
    yarn workspace kai-ba build && \
    yarn install --production --frozen-lockfile

# Step.2: 執行階段 - 只複製必要的執行檔案
FROM node:20-alpine

# 建立非 root 使用者
RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot

WORKDIR /app

# 從建置階段複製必要的檔案
COPY --from=server-build /build/apps/kai-ba/dist ./dist
COPY --from=server-build /build/node_modules ./node_modules
COPY --from=server-build /build/libs ./libs

# 切換到非 root 使用者
USER nonroot

# 設定環境變數
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 啟動應用程式
CMD ["node", "./dist/server.js"]