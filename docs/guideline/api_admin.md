### API Admin

| API                         | Action                             | Date       |
| --------------------------- | ---------------------------------- | ---------- |
| /admin/login                | 新增登入 api                       | 2021/07/03 |
| /admin/                     | 新增登出、重設密碼 api             | 2021/07/10 |
| /seriesIntroduction/        | 新增系列介紹相關 api               | 2021/07/10 |
| /usefulCardIntroduction/    | 新增泛用卡介紹相關 api             | 2021/07/15 |
| /metaDeck/                  | 新增上位卡表相關 api               | 2021/07/15 |
| /productInformation/        | 新增卡表資料相關 api               | 2021/07/15 |
| /rules/                     | 新增規則相關 api                   | 2021/07/15 |
| /seriesStory/               | 新增卡片故事相關 api               | 2021/07/15 |
| /calendar/                  | 新增日曆表相關 api                 | 2021/07/15 |
| /productionInformationType/ | 新增 productionInformationType api | 2021/08/04 |
| /tag/                       | 新增 tag api                       | 2021/08/04 |
| /admin/                     | 新增 admin list/add/edit api       | 2021/08/04 |
| /banner/                    | 新增 banner api                    | 2021/08/14 |
| /battlePaper/               | 新增戰報 api                       | 2022/10/30 |
| /cards/                     | 新增 cards 相關 api                | 2022/10/30 |
| /packType/                  | 新增卡包類別相關 api               | 2022/10/31 |
| /permission/                | 新增權限相關 api                   | 2023/03/17 |
| /cards_image/               | 新增卡片圖片相關 api               | 2023/04/09 |

---

# admin-server

- url: https://xxxxxxx.com.tw/api/[path]
- method: POST

| Path                                                                      | Description          |
| ------------------------------------------------------------------------- | -------------------- |
| [/admin/login](#adminlogin)                                               | 登入                 |
| [/admin/logout](#adminlogout)                                             | 登出                 |
| [/admin/resetPassword](#adminresetpassword)                               | 重設密碼             |
| [/admin/list](#adminlist)                                                 | 取得帳號             |
| [/admin/add](#adminadd)                                                   | 新增帳號             |
| [/admin/edit](#adminedit)                                                 | 編輯帳號             |
| [/seriesIntroduction/articleList](#seriesintroductionarticlelist)         | 取得系列介紹文章     |
| [/seriesIntroduction/addArticle](#seriesintroductionaddarticle)           | 新增系列介紹文章     |
| [/seriesIntroduction/editArticle](#seriesintroductioneditarticle)         | 編輯系列介紹文章     |
| [/usefulCardIntroduction/articleList](#usefulcardintroductionarticlelist) | 取得泛用卡介紹文章   |
| [/usefulCardIntroduction/addArticle](#usefulcardintroductionaddarticle)   | 新增泛用卡介紹文章   |
| [/usefulCardIntroduction/editArticle](#usefulcardintroductioneditarticle) | 編輯泛用卡介紹文章   |
| [/metaDeck/articleList](#metadeckarticlelist)                             | 取得上位卡表文章     |
| [/metaDeck/addArticle](#metadeckaddarticle)                               | 新增上位卡表文章     |
| [/metaDeck/editArticle](#metadeckeditarticle)                             | 編輯上位卡表文章     |
| [/productInformation/articleList](#productinformationarticlelist)         | 取得卡表資料文章     |
| [/productInformation/addArticle](#productinformationaddarticle)           | 新增卡表資料文章     |
| [/productInformation/editArticle](#productinformationeditarticle)         | 編輯卡表資料文章     |
| [/productionInformationType/list](#productioninformationtypelist)         | 取得卡表資料 subType |
| [/rules/articleList](#rulesarticlelist)                                   | 取得規則相關文章     |
| [/rules/addArticle](#rulesaddarticle)                                     | 新增規則相關文章     |
| [/rules/editArticle](#ruleseditarticle)                                   | 編輯規則相關文章     |
| [/seriesStory/articleList](#seriesstoryarticlelist)                       | 取得卡片故事文章     |
| [/seriesStory/addArticle](#seriesstoryaddarticle)                         | 新增卡片故事文章     |
| [/seriesStory/editArticle](#seriesstoryeditarticle)                       | 編輯卡片故事文章     |
| [/calendar/list](#calendarlist)                                           | 取得日曆表           |
| [/calendar/add](#calendaradd)                                             | 新增日曆             |
| [/calendar/edit](#calendaredit)                                           | 編輯日曆表           |
| [/tag/list](#taglist)                                                     | 取得 tag             |
| [/tag/add](#tagadd)                                                       | 新增 tag             |
| [/tag/edit](#tagedit)                                                     | 編輯 tag             |
| [/banner/list](#bannerlist)                                               | 取得 banner          |
| [/banner/add](#banneradd)                                                 | 新增 banner          |
| [/banner/edit](#banneredit)                                               | 編輯 banner          |
| [/battlePaper/articleList](#battlepaperarticlelist)                       | 取得戰報相關文章     |
| [/battlePaper/addArticle](#battlepaperaddarticle)                         | 新增戰報相關文章     |
| [/battlePaper/editArticle](#battlepapereditarticle)                       | 編輯戰報相關文章     |
| [/cards/list](#cardslist)                                                 | 取得卡片資料         |
| [/cards/add](#cardsadd)                                                   | 新增卡片             |
| [/cards/edit](#cardsedit)                                                 | 編輯卡片             |
| [/packType/list](#packtypelist)                                           | 取得包裝分類         |
| [/packType/add](#packtypeadd)                                             | 新增包裝分類         |
| [/packType/edit](#packtypeedit)                                           | 編輯包裝分類         |
| [/permission/list](#permissionlist)                                       | 取得權限分類         |
| [/permission/add](#permissionadd)                                         | 新增權限分類         |
| [/permission/edit](#permissionedit)                                       | 編輯權限分類         |
| [/cardsImage/list](#cardsimagelist)                                       | 取得卡片圖片         |
| [/cardsImage/add](#cardsimageadd)                                         | 新增卡片圖片         |
| [/cardsImage/edit](#cardsimageedit)                                       | 編輯卡片圖片         |

---

### Admin

#### /admin/login

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

  "_comment_date": "ex: Tue Mar 21 2023 21:30:08 GMT+0800 (台北標準時間)"
}
```

#### /admin/logout

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

#### /admin/resetPassword

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

#### /admin/list

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "page": 0,
  "limit": 0,
  "*filter": {
    "type": 0,
    "status": 0,
    "name": "string",
    "account": "string"
  },

  "_comment_type": "0=管理者, 1=前後台用戶, 2=前台用戶",
  "_comment_status": "0=正常, 1=停用中"
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
      "name": "string",
      "create_date": "string",
      "photo": "string",
      "status": 0,
      "account": "string",
      "password": "sting"
    }
  ],

  "_comment_type": "0=管理者, 1=前後台用戶, 2=前台用戶",
  "_comment_status": "0=正常, 1=停用中",
  "_comment_name": "length = 20",
  "_comment_account": "max length = 16, min length = 8",
  "_comment_password": "max length = 16, min length = 8"
}
```

#### /admin/add

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*type": 0,
  "*name": "string",
  "*email": "string",
  "*create_date": "string",
  "*account": "string",
  "*password": "sting",

  "_comment_type": "0=管理者, 1=前後台用戶, 2=前台用戶",
  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_name": "length = 20",
  "_comment_account": "length = 16",
  "_comment_password": "max length = 16, min length = 8"
}
```

response:

```json
{}
```

#### /admin/edit

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*_id": "string",
  "*type": 0,
  "*name": "string",
  "*photo": "string",
  "*status": 0,

  "_comment_type": "0=管理者, 1=前後台用戶, 2=前台用戶",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_status": "0=正常, 1=停用中"
}
```

response:

```json
{}
```

### Series Introduction

#### /seriesIntroduction/articleList

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "page": 0,
  "limit": 0,
  "*filter": {
    "type": 0,
    "status": 0,
    "begin_date": "string",
    "end_date": "string"
  },

  "_comment_type": "0=主題牌組, 1=外掛系列",
  "_comment_begin_date": "搜尋publish_date range"
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

#### /seriesIntroduction/addArticle

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*type": 0,
  "*title": "string",
  "*publish_date": "string",
  "*photo": "string",
  "*content": "string",
  "*admin_id": "string",
  "*tag": [],

  "_comment_type": "0=主題牌組, 1=外掛系列",
  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串"
}
```

response:

```json
{}
```

#### /seriesIntroduction/editArticle

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*_id": "string",
  "*type": 0,
  "*title": "string",
  "*publish_date": "string",
  "*photo": "string",
  "*content": "string",
  "*status": 0,
  "*to_top": true,
  "*admin_id": "string",
  "*tag": [],

  "_comment_type": "0=主題牌組, 1=外掛系列",
  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

response:

```json
{}
```

### Useful Card Introduction

#### /usefulCardIntroduction/articleList

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "page": 0,
  "limit": 0,
  "*filter": {
    "type": 0,
    "status": 0,
    "begin_date": "string",
    "end_date": "string"
  },

  "_comment_type": "0=單卡介紹, 1=戰術分析",
  "_comment_begin_date": "搜尋publish_date range"
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

#### /usefulCardIntroduction/addArticle

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*type": 0,
  "*title": "string",
  "*publish_date": "string",
  "*photo": "string",
  "*content": "string",
  "*admin_id": "string",
  "*tag": [],

  "_comment_type": "0=單卡介紹, 1=戰術分析",
  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串"
}
```

response:

```json
{}
```

#### /usefulCardIntroduction/editArticle

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "_id": "string",
  "*type": 0,
  "*title": "string",
  "*publish_date": "string",
  "*photo": "string",
  "*content": "string",
  "*status": 0,
  "*to_top": true,
  "*admin_id": "string",
  "*tag": [],

  "_comment_type": "0=單卡介紹, 1=戰術分析",
  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

response:

```json
{}
```

### Meta Deck

#### /metaDeck/articleList

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "page": 0,
  "limit": 0,
  "*filter": {
    "status": 0,
    "begin_date": "string",
    "end_date": "string"
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

#### /metaDeck/addArticle

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*title": "string",
  "*publish_date": "string",
  "*photo": "string",
  "*content": "string",
  "*admin_id": "string",
  "*tag": [],

  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串"
}
```

response:

```json
{}
```

#### /metaDeck/editArticle

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*_id": "string",
  "*title": "string",
  "*publish_date": "string",
  "*photo": "string",
  "*content": "string",
  "*status": 0,
  "*to_top": true,
  "*admin_id": "string",
  "*tag": [],

  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

response:

```json
{}
```

### Product Information

#### /productInformation/articleList

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "page": 0,
  "limit": 0,
  "*filter": {
    "status": 0,
    "begin_date": "string",
    "end_date": "string",
    "type": 0
  },

  "_comment_packType": "產品代號",
  "_comment_type": "產品分類 0=補充包 1=Rush Duel 2=其他 3=預組套牌 4=禮盒",
  "_comment_subtype": "產品系列名稱(PP大會包...)"
}
```

response:

```json
{
  "total": 0,
  "*list": [
    {
      "*_id": "string",
      "type": 0,
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
  "_comment_mainType": "產品分類 0=補充包 1=Rush Duel 2=其他 3=預組套牌 4=禮盒",
  "_comment_subType": "產品系列名稱(PP大會包...)",
  "_comment_name": "產品名稱"
}
```

#### /productInformation/addArticle

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*type": 0,
  "*title": "string",
  "*publish_date": "string",
  "*photo": "string",
  "*content": "string",
  "*admin_id": "string",
  "*tag": [],

  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_type": "產品分類 0=補充包 1=Rush Duel 2=其他 3=預組套牌 4=禮盒"
}
```

response:

```json
{}
```

#### /productInformation/editArticle

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*_id": "string",
  "*type": 0,
  "*title": "string",
  "*publish_date": "string",
  "*photo": "string",
  "*content": "string",
  "*status": 0,
  "*to_top": true,
  "*admin_id": "string",
  "*tag": [],

  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂",
  "_comment_type": "產品分類 0=補充包 1=Rush Duel 2=其他 3=預組套牌 4=禮盒"
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
  "*token": "string",
  "*tokenReq": "string"
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
          "productionInformation_subType": "string"
        }
      ]
    }
  ]
}
```

### Rules

#### /rules/articleList

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "page": 0,
  "limit": 0,
  "*filter": {
    "type": 0,
    "status": 0,
    "begin_date": "string",
    "end_date": "string"
  },

  "_comment_type": "0=禁限卡表, 1=判例說明"
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

#### /rules/addArticle

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*type": 0,
  "*title": "string",
  "*publish_date": "string",
  "*photo": "string",
  "*content": "string",
  "*admin_id": "string",
  "*tag": [],

  "_comment_type": "0=禁限卡表, 1=判例說明",
  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串"
}
```

response:

```json
{}
```

#### /rules/editArticle

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*_id": "string",
  "*type": 0,
  "*title": "string",
  "*publish_date": "string",
  "*photo": "string",
  "*content": "string",
  "*status": 0,
  "*to_top": true,
  "*admin_id": "string",
  "*tag": [],

  "_comment_type": "0=禁限卡表, 1=判例說明",
  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

response:

```json
{}
```

### Series Story

#### /seriesStory/articleList

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "page": 0,
  "limit": 0,
  "*filter": {
    "status": 0,
    "begin_date": "string",
    "end_date": "string"
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

#### /seriesStory/addArticle

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*title": "string",
  "*publish_date": "string",
  "*photo": "string",
  "*content": "string",
  "*admin_id": "string",
  "*tag": [],

  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串"
}
```

response:

```json
{}
```

#### /seriesStory/editArticle

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*_id": "string",
  "*title": "string",
  "*publish_date": "string",
  "*photo": "string",
  "*content": "string",
  "*status": 0,
  "*to_top": true,
  "*admin_id": "string",
  "*tag": [],

  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

response:

```json
{}
```

### Calendar

#### /calendar/list

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*filter": {
    "date": "string",
    "type": 0
  }
}
```

response:
_回傳當月列表_

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

#### /calendar/add

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*title": "string",
  "*date": "string",
  "*url": "string",
  "*content": "string",
  "*type": 0,

  "_comment_type": "0=賽事, 1=發售日期, 2=其他相關活動",
  "_comment_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_content": "副文本編輯產出的html字串"
}
```

response:

```json
{}
```

#### /calendar/edit

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*_id": "string",
  "*title": "string",
  "*date": "string",
  "*url": "string",
  "*content": "string",
  "＊type": 0,

  "_comment_type": "0=賽事, 1=發售日期, 2=其他相關活動",
  "_comment_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_content": "副文本編輯產出的html字串"
}
```

response:

```json
{}
```

### tag

#### /tag/list

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "page": 0,
  "limit": 0,
  "*filter": {
    "tag": "string"
  }
}
```

response:

```json
{
  "*list": [
    {
      "_id": "string",
      "tag": "string"
    }
  ]
}
```

response:

```json
{}
```

#### /tag/add

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*tag": "string"
}
```

response:

```json
{}
```

#### /tag/edit

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*_id": "string",
  "*tag": "string"
}
```

response:

```json
{}
```

### banner

#### /banner/list

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "page": 0,
  "limit": 0,
  "*filter": {
    "begin_date": "string",
    "end_date": "string"
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

#### /banner/add

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*title": "string",
  "*subtitle": "string",
  "*photo_pc": "string",
  "*photo_mobile": "string",
  "*url": "string"
}
```

response:

```json
{}
```

#### /banner/edit

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*_id": "string",
  "*title": "string",
  "*subtitle": "string",
  "*photo_pc": "string",
  "*photo_mobile": "string",
  "*url": "string"
}
```

response:

```json
{}
```

### Cards

#### /cards/list

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
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
  "_comment_product_information_type": "包裝分類name"
}
```

response:

```json
{
  "*total": 0,
  "*list": [
    {
      "_id": "string",
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
      "product_information_type": "string",
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

  "_comment_ _id": "自動生成的id",
  "_comment_effect": "卡片效果"
}
```

#### /cards/add

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "number": "string",
  "name": "string",
  "type": "string",
  "star": "string",
  "attribute": "string",
  "race": "string",
  "rarity": [],
  "atk": 0,
  "def": 0,
  "product_information_type": "string",
  "id": "string",
  "effect": "string",
  "price_info": [],
  "price_yuyu": []
}
```

response:

```json
{}
```

#### /cards/edit

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "_id": "string",
  "number": "string",
  "name": "string",
  "type": "string",
  "star": "string",
  "attribute": "string",
  "race": "string",
  "rarity": [],
  "atk": 0,
  "def": 0,
  "product_information_type": "string",
  "id": "string",
  "effect": "string",
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
  "*token": "string",
  "*tokenReq": "string",
  "*filter": {
    "number": "string"
  }
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

#### /cardsImage/add

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "number": "string",
  "photo": "string"
}
```

response:

```json
{}
```

#### /cardsImage/edit

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "_id": "string",
  "number": "string",
  "photo": "string"
}
```

response:

```json
{}
```

### Battle Paper

#### /battlePaper/articleList

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "page": 0,
  "limit": 0,
  "*filter": {
    "type": 0,
    "status": 0,
    "begin_date": "string",
    "end_date": "string"
  },

  "_comment_type": "0=週報"
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

  "_comment_type": "0=週報",
  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "圖片檔名，請參考common的路徑",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

#### /battlePaper/addArticle

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*type": 0,
  "*title": "string",
  "*publish_date": "string",
  "*photo": "string",
  "*content": "string",
  "*admin_id": "string",
  "*tag": [],

  "_comment_type": "0=週報",
  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串"
}
```

response:

```json
{}
```

#### /battlePaper/editArticle

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*_id": "string",
  "*type": 0,
  "*title": "string",
  "*publish_date": "string",
  "*photo": "string",
  "*content": "string",
  "*status": 0,
  "*to_top": true,
  "*admin_id": "string",
  "*tag": [],

  "_comment_type": "0=週報",
  "_comment_publish_date": "格式為YYYY-MM-DD HH:mm:ss",
  "_comment_photo": "btoa()編碼的Base64字串",
  "_comment_content": "副文本編輯產出的html字串",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_to_top": "true=置頂, false=非置頂"
}
```

response:

```json
{}
```

### Pack Type

#### /packType/list

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "page": 0,
  "limit": 0,
  "*filter": {
    "name": "strnig",
    "status": 0
  },

  "_comment_status": "0=上架中, 1=下架中"
}
```

response:

```json
{
  "*total": 0,
  "*list": [
    {
      "*_id": "string",
      "packType": "string",
      "subtype": "string",
      "maintype": 0,
      "status": 0,
      "name": "string"
    }
  ],

  "_comment_packType": "產品代號",
  "_comment_maintype": "產品分類 0=補充包 1=Rush Duel 2=其他 3=預組套牌 4=禮盒",
  "_comment_subtype": "產品系列名稱(PP大會包...)",
  "_comment_status": "0=上架中, 1=下架中",
  "_comment_name": "產品名稱"
}
```

#### /packType/add

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*packType": "string",
  "*subtype": "string",
  "*maintype": 0,
  "*name": "string"
}
```

response:

```json
{}
```

#### /packType/edit

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*_id": "string",
  "*packType": "string",
  "*subtype": "string",
  "*maintype": 0,
  "*name": "string",
  "status": 0
}
```

response:

```json
{}
```

### Permission

#### /permission/list

request:

```json
{
  "*token": "string",
  "*tokenReq": "string"
}
```

response:

```json
{
  "list": [
    {
      "*_id": "string",
      "name": "string",
      "description": "string",
      "permission": {
        "permission1": true,
        "permission2": false
      },

      "_comment_permission": "將能夠調整的權限逐一列出, permission1 permission2..."
    }
  ]
}
```

#### /permission/add

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*name": "string",
  "*permission": {
    "permission1": true,
    "permission2": false
  },

  "_comment_permission": "將能夠調整的權限逐一列出, permission1 permission2..."
}
```

response:

```json
{}
```

#### /permission/edit

request:

```json
{
  "*token": "string",
  "*tokenReq": "string",
  "*name": "string",
  "*_id": "string",
  "*permission": {
    "permission1": true,
    "permission2": false
  },

  "_comment_permission": "將能夠調整的權限逐一列出, permission1 permission2..."
}
```

response:

```json
{}
```
