# Kai-ba Docker 配置

這個目錄包含了 kai-ba 服務的 Docker 建置配置。

## 檔案結構

```
docker/kai-ba/
├── Dockerfile       # Docker 映像建置檔案
├── .dockerignore    # Docker 建置忽略檔案
└── README.md        # 本檔案
```

## 本地測試

### 建置 Docker 映像

在專案根目錄執行：

```bash
docker build -t kai-ba -f docker/kai-ba/Dockerfile .
```

### 本地執行容器

建立本地環境變數檔案：

```bash
# 複製環境變數範本
cp docker/kai-ba/env.local.template .env.local

# 編輯 .env.local 填入實際的 MongoDB 連線資訊
```

執行容器：

```bash
docker run --rm -p 3000:3000 --env-file .env.local kai-ba
```

### 測試應用程式

```bash
# 測試健康檢查端點
curl http://localhost:3000/health

# 測試 API
curl http://localhost:3000/api/some-endpoint
```

## 環境變數說明

### 必要的環境變數

- `NODE_ENV`: 執行環境
- `PORT`: 應用程式監聽端口
- `ADMIN`: MongoDB 管理員帳號
- `PASSWORD`: MongoDB 密碼
- `DB`: MongoDB 資料庫名稱
- `JWT_SECRET`: JWT Token 加密金鑰
- `COOKIE_SECRET`: Cookie 簽章金鑰

### 可選的環境變數

- `LOG_LEVEL`: 日誌等級 (預設: info)
- `ENABLE_CACHE`: 是否啟用快取 (預設: true)
- `ENABLE_REDIS_CACHE`: 是否啟用 Redis 快取 (預設: true)
- `ENABLE_MEMORY_CACHE`: 是否啟用記憶體快取 (預設: true)
- `RATE_LIMIT_ENABLED`: 是否啟用速率限制 (預設: true)
- `RESPONSE_VALIDATION`: 是否啟用回應驗證 (預設: true)

## 注意事項

1. `.env.local` 檔案不應提交到版控系統
2. 本地測試時建議停用快取和速率限制以方便開發
3. 確保 MongoDB 連線資訊正確
4. Docker 容器內的應用程式會監聽容器的 3000 端口
