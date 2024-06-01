### API Blog

| API                                 | Action                             | Date       |
| ----------------------------------- | ---------------------------------- | ---------- |
| /metaDeck/articleList               | 新增取得上位卡表文章 api           | 2021/07/11 |
| /seriesIntroduction/articleList     | 新增取得系列介紹文章 api           | 2021/07/11 |
| /usefulCardIntroduction/articleList | 新增取得泛用卡介紹文章 api         | 2021/07/11 |
| /productInformation/articleList     | 新增取得卡表資料文章 api           | 2021/07/14 |
| /rules/articleList                  | 新增取得規則相關文章 api           | 2021/07/14 |
| /seriesStory/articleList            | 新增取得卡片故事文章 api           | 2021/07/14 |
| /calendar/list                      | 新增日曆表 api                     | 2021/07/14 |
| /banner/list                        | 新增 banner 列表 api               | 2021/07/28 |
| /banner/list                        | 修改 banner 列表 api 欄位          | 2021/07/28 |
| /search                             | 新增 search api                    | 2021/08/08 |
| /cards/                             | 新增 cards 相關 api                | 2022/10/30 |
| /deck/                              | 新增 deck 相關 api                 | 2022/10/30 |
| /member/                            | 新增會員相關 api                   | 2022/10/31 |
| /productionInformationType/         | 新增 productionInformationType api | 2022/11/05 |
| /member/verify                      | 新增 驗證會員 api                  | 2023/03/21 |
| /cards_image/                       | 新增卡片圖片相關 api               | 2023/04/09 |
| /jurisprudence/                     | 新增卡片日文資訊及判例 api         | 2024/01/15 |

---

# blog-server

- url: https://xxxxxxx.com.tw/api/[path]
- method: POST

| Path                                                                      | Description            |
| ------------------------------------------------------------------------- | ---------------------- |
| [/member/login](#memberlogin)                                             | 登入                   |
| [/member/logout](#memberlogout)                                           | 登出                   |
| [/member/resetPassword](#memberresetpassword)                             | 重設密碼               |
| [/member/add](#memberadd)                                                 | 會員註冊               |
| [/member/edit](#memberedit)                                               | 編輯會員帳號           |
| [/member/verify](#memberverify)                                           | 驗證會員帳號           |
| [/metaDeck/articleList](#metadeckarticlelist)                             | 取得上位卡表文章       |
| [/seriesIntroduction/articleList](#seriesintroductionarticlelist)         | 取得系列介紹文章       |
| [/usefulCardIntroduction/articleList](#usefulcardintroductionarticlelist) | 取得泛用卡介紹文章     |
| [/productInformation/articleList](#productinformationarticlelist)         | 取得卡表資料文章       |
| [/rules/articleList](#rulesarticlelist)                                   | 取得規則相關文章       |
| [/seriesStory/articleList](#seriesstoryarticlelist)                       | 取得卡片故事文章       |
| [/calendar/list](#calendarlist)                                           | 取得日曆表             |
| [/banner/list](#bannerlist)                                               | 取得 banner 列表       |
| [/search](#search)                                                        | Search 文章            |
| [/cards/list](#cardslist)                                                 | 取得卡片資料           |
| [/cards/edit](#cardsedit)                                                 | 修改卡片資料           |
| [/deck/deckList](#deckdecklist)                                           | 取得卡表列表           |
| [/deck/add](#deckadd)                                                     | 新增卡表               |
| [/deck/edit](#deckedit)                                                   | 編輯卡表               |
| [/deck/delete](#deckdelete)                                               | 刪除卡表               |
| [/productionInformationType/list](#productioninformationtypelist)         | 取得 subtype           |
| [/reptile/yuyuPrice](#reptileyuyuPrice)                                   | 爬蟲悠悠亭價格         |
| [/cardsImage/cardsList](#cardsimagelist)                                  | 取得卡片圖片           |
| [/jurisprudence/list](#jurisprudencelist)                                 | 取得卡片日文資訊及判例 |

---

### Member

#### /member/login

request:

```json
{
  "*account": "string",
  "*password": "string"
}
```

response:

```json
{
  "token": "string",
  "date": "string",

  "_comment_date": "ex: Tue Mar 21 2023 21:30:08 GMT+0800 (台北標準時間)",
  "＊進入網頁先check token有沒有過期 有過期就發登出api 沒過期就顯示為登入"
}
```

#### /member/logout

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",

  "_comment_tokenReq": "使用者帳號"
}
```

response:

```json
{}
```

#### /member/resetPassword

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*old_password": "string",
  "*new_password": "string"
}
```

response:

```json
{}
```

#### /member/add

request:

```json
{
  "*name": "string",
  "*email": "string",
  "*create_date": "string",
  "*account": "string",
  "*password": "sting",

  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_name": "length = 20",
  "_comment_account": "length = 16",
  "_comment_password": "max length = 16, min length = 8"
}
```

response:

```json
{
  "verify_code": "string"
}
```

#### /member/edit

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*_id": "string",
  "*name": "string",
  "*photo": "string",
  "*email": "string",

  "_comment_photo": "btoa()編碼的Base64字串"
}
```

response:

```json
{}
```

#### /member/verify

request:

```json
{
  "verify_code": "string",

  "_comment_verify_code": "驗證碼 encode({tokenReq: string,email?:string,date: YYYY-MM-DD})"
}
```

response:

```json
{
  "password?": "string",

  "_comment_password": "若為忘記密碼時使用"
}
```

#### /member/reSend

request:

```json
{
  "*email": "string",
  "*account": "string",

  "_comment_account": "length = 16"
}
```

response:

```json
{
  "*email": "string",
  "*account": "string"
}
```

### Meta Deck

#### /metaDeck/articleList

request:

```json
{
  "*token": "frontend",
  "page": 0,
  "limit": 0,
  "*filter": {
    "_id": "string"
  }
}
```

response:

```json
{
  "total": 0,
  "*list": [
    {
      "_id": "string",
      "title": "string",
      "publish_date": "string",
      "photo": "string",
      "content": "string",
      "status": 0,
      "to_top": true,
      "*admin_name": "string",
      "*admin_id": "string",
      "*tag": []
    }
  ],

  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "圖片檔名，請參考common的路徑",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

### Series Introduction

#### /seriesIntroduction/articleList

request:

```json
{
  "*token": "frontend",
  "page": 0,
  "limit": 0,
  "*filter": {
    "_id": "string"
  },

  "_comment_type": "0=主題牌組, 1=外掛系列"
}
```

response:

```json
{
  "total": 0,
  "*list": [
    {
      "_id": "string",
      "type": 0,
      "title": "string",
      "publish_date": "string",
      "photo": "string",
      "content": "string",
      "status": 0,
      "to_top": true,
      "*admin_name": "string",
      "*admin_id": "string",
      "tag": []
    }
  ],

  "_comment_type": "0=主題牌組, 1=外掛系列",
  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "圖片檔名，請參考common的路徑",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

### Useful Card Introduction

#### /usefulCardIntroduction/articleList

request:

```json
{
  "*token": "frontend",
  "page": 0,
  "limit": 0,
  "*filter": {
    "_id": "string"
  },

  "_comment_type": "0=單卡介紹, 1=戰術分析"
}
```

response:

```json
{
  "total": 0,
  "*list": [
    {
      "_id": "string",
      "type": 0,
      "title": "string",
      "publish_date": "string",
      "photo": "string",
      "content": "string",
      "status": 0,
      "to_top": true,
      "*admin_name": "string",
      "*admin_id": "string",
      "*tag": []
    }
  ],

  "_comment_type": "0=單卡介紹, 1=戰術分析",
  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "圖片檔名，請參考common的路徑",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

### Product Information

#### /productInformation/articleList

request:

```json
{
  "*token": "frontend",
  "page": 0,
  "limit": 0,
  "*filter": {
    "_id": "string"
  }
}
```

response:

```json
{
  "total": 0,
  "*list": [
    {
      "*_id": "string",
      "packType": "string",
      "subType": "string",
      "mainType": 0,
      "name": "string",
      "title": "string",
      "publish_date": "string",
      "photo": "string",
      "content": "string",
      "status": 0,
      "to_top": true,
      "*admin_name": "string",
      "*admin_id": "string",
      "*tag": []
    }
  ],

  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "圖片檔名，請參考common的路徑",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂",
  "_comment_packType": "產品代號",
  "_comment_mainType": "產品分類 0=補充包 1=Rush Duel 2=活動贈品 3=預組套牌",
  "_comment_subType": "產品系列名稱(PP大會包...)",
  "_comment_name": "產品名稱"
}
```

### Rules

#### /rules/articleList

request:

```json
{
  "*token": "frontend",
  "page": 0,
  "limit": 0,
  "*filter": {
    "_id": "string"
  },

  "_comment_type": "0=判例, 1=禁卡表"
}
```

response:

```json
{
  "total": 0,
  "*list": [
    {
      "_id": "string",
      "type": 0,
      "title": "string",
      "publish_date": "string",
      "photo": "string",
      "content": "string",
      "status": 0,
      "to_top": true,
      "*admin_name": "string",
      "*admin_id": "string",
      "*tag": []
    }
  ],

  "_comment_type": "0=禁限卡表, 1=判例說明",
  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "圖片檔名，請參考common的路徑",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

### Series Story

#### /seriesStory/articleList

request:

```json
{
  "*token": "frontend",
  "page": 0,
  "limit": 0,
  "*filter": {
    "_id": "string"
  }
}
```

response:

```json
{
  "total": 0,
  "*list": [
    {
      "*_id": "string",
      "title": "string",
      "publish_date": "string",
      "photo": "string",
      "content": "string",
      "status": 0,
      "to_top": true,
      "*admin_name": "string",
      "*admin_id": "string",
      "*tag": []
    }
  ],

  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "圖片檔名，請參考common的路徑",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

### Calendar

#### /calendar/list

request:

```json
{
  "*token": "frontend",
  "*filter": {
    "date": "string",
    "type": 0
  }
}
```

response:

```json
{
  "*list": [
    {
      "_id": "string",
      "title": "string",
      "date": "string",
      "url": "string",
      "content": "string",
      "type": 0
    }
  ],

  "_comment_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_type": "0=賽事, 1=發售日期, 2=其他相關活動"
}
```

### Banner

#### /banner/list

request:

```json
{
  "*token": "frontend"
}
```

response:

```json
{
  "*list": [
    {
      "_id": "string",
      "title": "string",
      "subtitle": "string",
      "date": "string",
      "photo_pc": "string",
      "photo_mobile": "string",
      "url": "string"
    }
  ],

  "_comment_date": "最後更新日期、格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "圖片檔名，請參考common的路徑",
  "_comment_url": "連結"
}
```

### Search

#### /search

request:

```json
{
	"*token": "frontend",
	"title": "string",
	"*article_type": 0,
	"article_subtype": 0,
	"limit": 0,
	"page": 0,
	"*status" : 0,
	"to_top": true

	"_comment_title": "搜尋標題的文字",
	"_comment_article_type": "0=上位卡表(metaDeck), 1=系列介紹(seriesIntroduction), 2=泛用卡介紹(usefulCardIntroduction), 3=規則相關(rules), 4=卡片故事(seriesStory)",
	"_comment_subtype": "article_type各自的子類型"
}
```

### Cards

#### /cards/list

request:

```json
{
  "*token": "frontend",
  "page": 0,
  "limit": 0,
  "*filter": {
    "id": "string",
    "number": "string",
    "name": "string",
    "type": "string",
    "star": "string",
    "attribute": "string",
    "race": "string",
    "rarity": "string",
    "atk_t": 0,
    "atk_l": 0,
    "def_t": 0,
    "def_l": 0,
    "product_information_type": "string"
  },

  "_comment_id": "卡號",
  "_comment_number": "卡片密碼",
  "_comment_name": "卡名",
  "_comment_type": "種類",
  "_comment_star": "星數",
  "_comment_attribute": "屬性",
  "_comment_race": "種族",
  "_comment_rarity": "稀有度、版本",
  "_comment_product_information_type": "包裝分類name",
  "_comment_id": "卡片密碼"
}
```

response:

```json
{
  "*total": 0,
  "*list": [
    {
      "id": "string",
      "number": "string",
      "name": "string",
      "type": "string",
      "star": "string",
      "attribute": "string",
      "race": "string",
      "rarity": [],
      "atk": 0,
      "def": 0,
      "packType": "string",
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
      ]
    }
  ],

  "_comment_effect": "卡片效果"
}
```

#### /cards/edit

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "number": "string",
  "name": "string",
  "type": "string",
  "star": "string",
  "race": "string",
  "attribute": "string",
  "rarity": [],
  "atk": 0,
  "def": 0,
  "product_information_type": "string",
  "id": 0,
  "effect": "string",
  "time": "string",
  "price_info": [],
  "price_yuyu": []
}
```

response:

```json
{}
```

### Cards Image

#### /cardsImage/list

request:

```json
{
  "*token": "frontend"
}
```

response:

```json
{
  "list": [
    {
      "number": "string",
      "photo": "string",

      "_comment_number": "卡片密碼"
    }
  ]
}
```

### Jurisprudence

#### /jurisprudence/list

request:

```json
{
  "*token": "frontend",
  "number": "string"
}
```

response:

```json
{
  "list": [
    {
      "number": "string",
      "name_jp_h": "string",
      "name_jp_k": "string",
      "name_en": "string",
      "effect_jp": "string",
      "jud_link": "string",
      "info": "string",
      "qa": [
        {
          "title": "string",
          "tag": "string",
          "date": "string",
          "q": "string",
          "a": "string"
        }
      ],

      "_comment_number": "卡片密碼"
    }
  ]
}
```

### Deck

#### /deck/deckList

request:

```json
{
  "*token": "frontend",
  "page": 0,
  "limit": 0,
  "*filter": {
    "_id": "string",
    "admin_id": "string",
    "title": "string",
    "begin_date": "string",
    "end_date": "string"
  },

  "_comment_number": "卡號",
  "_comment_title": "牌組名稱",
  "_comment_begin_date": "格式為YYYY-MM-DD ",
  "_comment_end_date": "格式為YYYY-MM-DD "
}
```

response:

```json
{
  "total": 0,
  "*list": [
    {
      "_id": "string",
      "*admin_id": "string",
      "title": "string",
      "create_date": "string",
      "last_edit_date": "string",
      "main_deck": [
        {
          "id": "string",
          "number": "string",
          "name": "string",
          "type": "string",
          "star": "string",
          "attribute": "string",
          "rarity": "string",
          "atk": 0,
          "def": 0,
          "packType": "string",
          "effect": "string",
          "photo": "string",
          "price_yuyu": [
            {
              "time": "string",
              "price_lowest": 0,
              "price_avg": 0,
              "rarity": "string"
            }
          ],
          "price_info": [
            {
              "time": "string",
              "price_lowest": 0,
              "price_avg": 0,
              "rarity": "string"
            }
          ]
        }
      ],
      "extra_deck": [],
      "side_deck": []
    }
  ],

  "_comment_id": "卡號",
  "_comment_number": "卡片密碼",
  "_comment_create_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_last_edit_date": "格式為YYYY-MM-DD HH:mm:ss"
}
```

#### /deck/add

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*title": "string",
  "*create_date": "string",
  "*last_edit_date": "string",
  "*admin_id": "string",
  "*main_deck": [
    {
      "card_id": "string",
      "card_rarity": "string"
    }
  ],
  "*extra_deck": [
    {
      "card_id": "string",
      "card_rarity": "string"
    }
  ],
  "*side_deck": [
    {
      "card_id": "string",
      "card_rarity": "string"
    }
  ]
}
```

response:

```json
{}
```

#### /deck/edit

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "_id": "string",
  "title": "string",
  "create_date": "string",
  "last_edit_date": "string",
  "*admin_id": "string",
  "main_deck": [
    {
      "card_id": "string",
      "card_rarity": "string"
    }
  ],
  "extra_deck": [
    {
      "card_id": "string",
      "card_rarity": "string"
    }
  ],
  "side_deck": [
    {
      "card_id": "string",
      "card_rarity": "string"
    }
  ]
}
```

response:

```json
{}
```

#### /deck/delete

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "_id": "string"
}
```

response:

```json
{}
```

### productionInformationType

#### /productionInformationType/list

request:

```json
{
  "*token": "frontend"
}
```

response:

```json
{
  "*list": [
    {
      "mainType": 0,
      "subtypeList": [
        {
          "productionInformation_subtype": "string"
        }
      ]
    }
  ]
}
```

### reptile

#### /reptile/yuyuPrice

request:

```json
{
  "*token": "frontend",
  "name": "string",
  "rarity": "string",

  "_comment_name": "卡號",
  "_comment_rarity": "卡片罕貴度"
}
```

response:

```json
{
  "price": 0,
  "time": "string",
  "rarity": "string"
}
```
