# Data Base Template

### 帳號 (admin)

```json
{
  "_id": "string",
  "type": 0,
  "name": "string",
  "create_date": "string",
  "photo": "string",
  "status": 0,
  "account": "string",
  "password": "string",
  "email": "string",

  "_comment_type": "0=管理者, 1=前後台用戶, 2=前台用戶",
  "_comment_status": "0=正常, 1=停用中",
  "_comment_name": "length = 20",
  "_comment_account": "max length = 16, min length = 8",
  "_comment_password": "max length = 16, min length = 8"
}
```

### 文章 - 系列介紹(series_introduction)

```json
{
  "_id": "string",
  "type": 0,
  "title": "string",
  "publish_date": "string",
  "photo": "string",
  "content": "string",
  "status": 0,
  "to_top": true,
  "admin_id": "string",
  "tag": [],

  "_comment_type": "0=主題牌組, 1=外掛系列",
  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

### 文章 - 泛用卡介紹(useful_card_introduction)

```json
{
  "_id": "string",
  "type": 0,
  "title": "string",
  "publish_date": "string",
  "photo": "string",
  "content": "string",
  "status": 0,
  "to_top": true,
  "admin_id": "string",
  "tag": [],

  "_comment_type": "0=單卡介紹, 1=戰術分析",
  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

### 文章 - 上位卡表(meta_deck)

```json
{
  "_id": "string",
  "title": "string",
  "publish_date": "string",
  "photo": "string",
  "content": "string",
  "status": 0,
  "to_top": true,
  "admin_id": "string",
  "tag": [],

  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

### 文章 - 卡表資料(product_information)

```json
{
  "_id": "string",
  "type": 0,
  "product_information_type_id": "string",
  "title": "string",
  "publish_date": "string",
  "photo": "string",
  "content": "string",
  "status": 0,
  "to_top": true,
  "admin_id": "string",
  "tag": [],

  "_comment_type": "產品分類 0=補充包 1=Rush Duel 2=其他 3=預組套牌 4=禮盒",
  "_comment_product_information_type_id": "product_information_type id",
  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

### 文章 - 規則相關(rules)

```json
{
  "_id": "string",
  "type": 0,
  "title": "string",
  "publish_date": "string",
  "photo": "string",
  "content": "string",
  "status": 0,
  "to_top": true,
  "admin_id": "string",
  "tag": [],

  "_comment_type": "0=禁限卡表, 1=判例說明",
  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

### 文章 - 卡片故事(series_story)

```json
{
  "_id": "string",
  "title": "string",
  "publish_date": "string",
  "photo": "string",
  "content": "string",
  "status": 0,
  "to_top": true,
  "admin_id": "string",
  "tag": [],

  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

### 文章 - 戰報(battle_paper)

```json
{
  "_id": "string",
  "type": 0,
  "title": "string",
  "publish_date": "string",
  "photo": "string",
  "content": "string",
  "status": 0,
  "to_top": true,
  "admin_id": "string",
  "tag": [],

  "_comment_type": "0=週報",
  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

### 卡片(cards)

```json
{
  "id": "string",
  "name": "string",
  "type": "string",
  "star": "string",
  "attribute": "string",
  "rarity": [],
  "atk": "string",
  "def": "string",
  "product_information_type": "string",
  "number": "string",
  "effect": "string",
  "price_info": [
    {
      "time": "string",
      "price_lowest": 0,
      "price_avg": 0,
      "rarity": "string"
    }
  ],
  "price_yuyu": [
    {
      "time": "string",
      "rarity": "string",
      "price": 0
    }
  ],

  "_comment_id": "卡號",
  "_comment_number": "卡片密碼",
  "_comment_name": "卡名",
  "_comment_type": "種類",
  "_comment_star": "星數",
  "_comment_attribute": "屬性",
  "_comment_rarity": "稀有度、版本",
  "_comment_product_information_type_id": "包裝分類name",
  "_comment_price_info": "卡價"
}
```

### Cards Image(cards_image)

```json
{
  "number": "string",
  "photo": "string"

  "_comment_number": "卡片密碼",
  "_comment_photo": "base64格式圖檔"
}
```

### 牌組(decks)

```json
{
  "_id": "string",
  "admin_id": "string",
  "title": "string",
  "create_date": "string",
  "last_edit_date": "string",
  "main_deck": [
    {
      "card_id": 0,
      "card_rarity": "string"
    }
  ],
  "extra_deck": [],
  "side_deck": [],

  "_comment_card_id": "卡號",
  "_comment_card_rarity": "卡片罕貴度",
  "_comment_create_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_last_edit_date": "格式為YYYY-MM-DD HH:mm:ss"
}
```

### 行事曆(calendar)

```json
{
  "_id": "string",
  "title": "string",
  "date": "string",
  "url": "string",
  "*content": "string",
  "type": 0,

  "_comment_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_type": "0=賽事, 1=發售日期, 2=其他相關活動"
}
```

### 首頁輪播(banner)

```json
{
  "_id": "string",
  "title": "string",
  "subtitle": "string",
  "date": "string",
  "photo_pc": "string",
  "photo_mobile": "string",
  "url": "string"
}
```

### 產品類別表(product_information_type)

```json
{
  "_id": "string",
  "packType": "string",
  "subtype": "string",
  "maintype": 0,
  "status": 0,
  "name": "string",

  "_comment_packType": "產品代號",
  "_comment_maintype": "產品分類 0=補充包 1=Rush Duel 2=其他 3=預組套牌 4=禮盒",
  "_comment_subtype": "產品系列名稱(PP大會包...)",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_name": "產品名稱"
}
```

### 文章標籤(tag)

```json
{
  "_id": "string",
  "tag": "string"
}
```

### 權限(permit)

```json
{
  "_id": "string",
  "name": "string",
  "permission": ["string"],
  "type": 0,

  "_comment_name": "權限名稱 (管理者, 前後台用戶, 前台用戶)",
  "_comment_permission": "包含的後台路徑",
  "_comment_type": "admin type 0=管理者, 1=前後台用戶, 2=前台用戶"
}
```

### 前台 Token(frontend_token)

```json
{
  "token": "string",
  "tokenReq": "string",
  "date": "string",

  "_comment_tokenReq": "使用者帳號",
  "_comment_date": "格式為new Date()格式"
}
```

### 後台 Token(backend_token)

```json
{
  "token": "string",
  "tokenReq": "string",
  "date": "string",

  "_comment_tokenReq": "使用者帳號",
  "_comment_date": "格式為new Date()格式"
}
```
