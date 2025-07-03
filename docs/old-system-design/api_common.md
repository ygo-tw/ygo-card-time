### Request & Response

1. request 或 response 中的 comment 為註解，傳遞參數時不用理會
2. 有 **\*** 號為必填欄位
3. request**未加密**格式為

```json
{
  "data": {}
}
```

4. response**未加密**格式為

```json
{
  "error_code": 0,
  "data": {}
}
```

5. Request & Response 的 data 都須作**AES**加密
6. 以下 api request/response 為了方便只寫出 data 中的內容

---

## Encryption

### 規則及演算法

| Column A   | Column B           |
| ---------- | ------------------ |
| encryption | AES CBC            |
| key        | xxxxxxxx           |
| key length | 32 bytes           |
| padding    | pkcs7              |
| IV         | "0000000000000000" |

### 加密方式

將 data 欄位加密
encrypt string 為 AES(JSON string).toString()

---

### Error Code

| Code                     | Description |
| ------------------------ | ----------- |
| 成功                     | 0           |
| 請求路徑錯誤             | 10001       |
| 請求方法應為 POST        | 10002       |
| JSON decode failed       | 10003       |
| 請求參數不合法           | 10004       |
| token 過期               | 10005       |
| Base64 decode failed     | 10006       |
| 找不到對應資料           | 10007       |
| 沒有權限的操作           | 10008       |
| 已從其他地方登入         | 10009       |
| 上傳圖片失敗             | 10010       |
| JSON encode failed       | 10011       |
| 資料重複                 | 10012       |
| 找不到使用者             | 11001       |
| 密碼錯誤                 | 11002       |
| 註冊帳號重複             | 11003       |
| 帳號尚未申請後台使用權限 | 11004       |
| 帳號驗證碼錯誤或過期     | 11005       |
| 帳號或 EMAIL 驗證錯誤    | 11006       |
| 帳號或 EMAIL 待驗證      | 11007       |

---

### Rarity list

```json
[
  {
    "key": "N",
    "val": "普卡(Normal)"
  },
  {
    "key": "R",
    "val": "銀字(Rare)"
  },
  {
    "key": "SR",
    "val": "亮面(Super Rare)"
  },
  {
    "key": "UR",
    "val": "金亮(Ultra Rare)"
  },
  {
    "key": "SER",
    "val": "半鑽(Secret Rare)"
  },
  {
    "key": "UTR",
    "val": "浮雕/凸版(Ultimate Rare)"
  },
  {
    "key": "HR",
    "val": "雷射(Holographic Rare)"
  },
  {
    "key": "NPR",
    "val": "普鑽(Normal-Parallel Rare)"
  },
  {
    "key": "GR",
    "val": "黃金(Gold Rare)"
  },
  {
    "key": "GSR",
    "val": "黃金半鑽(Gold Secret Rare)"
  },
  {
    "key": "ESR",
    "val": "斜鑽(Extra Secret Rare)"
  },
  {
    "key": "CR",
    "val": "雕鑽(Collector's Rare)"
  },
  {
    "key": "M",
    "val": "千年/古文鑽(Millennium Rare)"
  },
  {
    "key": "MSR",
    "val": "千年/古文鑽 + 亮面(Millennium Super Rare)"
  },
  {
    "key": "MUR",
    "val": "千年/古文鑽 + 金亮(Millennium Ultra Rare)"
  },
  {
    "key": "MSER",
    "val": "千年/古文鑽 + 半鑽(Millennium Secret Rare)"
  },
  {
    "key": "MGR",
    "val": "千年/古文鑽 + 黃金(Millennium Gold Rare)"
  },
  {
    "key": "KC",
    "val": "KC紋"
  },
  {
    "key": "KCR",
    "val": "KC紋 + 銀字"
  },
  {
    "key": "KCUR",
    "val": "KC紋 + 金亮"
  },
  {
    "key": "20thSER",
    "val": "紅鑽(20th Secret Rare)"
  },
  {
    "key": "10000SER",
    "val": "紅鑽(10000 Secret Rare)"
  },
  {
    "key": "PGR",
    "val": "高級黃金(Premium Gold Rare)"
  },
  {
    "key": "USR",
    "val": "金碎/銀亮(Ultra-Secret Rare)"
  },
  {
    "key": "SBSER",
    "val": "藍鑽(SPECIAL BLUE Ver.)"
  },
  {
    "key": "PR",
    "val": "全鑽(Parallel Rare)"
  },
  {
    "key": "GHR",
    "val": "鬼閃(Ghost Rare)"
  },
  {
    "key": "PSER",
    "val": "白鑽(Prismatic Secret Rare)"
  },
  {
    "key": "PR",
    "val": "全鑽(Parallel Rare)"
  }
]
```

### 靜態圖檔路徑

- banner : /api/card-image/banner/${photo}.webp
- article : /api/card-image/article/${photo}.webp
- card image : /api/card-image/cards/${card_number}.webp
