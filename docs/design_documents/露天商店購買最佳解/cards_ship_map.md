# 卡片購買最佳解 - 露天商店購買流程

為解決當有許多卡片(數量不一時)想要購買，但要考慮運費、各家商店庫存、及間賣場的目標價格等因素，希望能夠透過一個 `script function` 解決此問題，後續可整合至 `libs` ，以供 `後端` API 使用

## 流程規劃

1. 為了取得各賣場的 `目標卡片價格`、`卡片庫存`、`運送方法、運費及免運門檻`、`目標網址` 等內容，需透過許多多隻 API 組合達成
2. 當取得以上資訊後，透過 `GetShopsInfoByRutenService` 整合上述 API 資料，並取得有關的 `店家與卡片相關資訊`
3. 透過 `BestPlanByRutenService` 取得最佳運送方案，並且回傳詳細內容

## 步驟細節

### 所使用 API 資料

#### 露天商品列表

```
https://rtapi.ruten.com.tw/api/search/v3/index.php/core/prod?q=${搜尋字串}&type=direct&sort=prc%2Fac&offset=1&limit=100

```

- 可取得該商品最便宜的 `商品 ID`(Rows[].Id)

#### 露天商品詳細列表

```
https://rapi.ruten.com.tw/api/items/v2/list?gno=${商品 ID}&level=simple

```

- 商品 ID 可透過 ',' 取得多筆資料
- 可取得該商品的 `庫存`(data[].num)、`店家 ID`(data[].user)、 `商品金額`(data[].goods_price)
- 可透過篩取 : `幣別`(data[].currency) => `TWD` 以外排除、 `名稱`(data[].name) => 按照`金額爬蟲篩選器`邏輯排除、`庫存`(data[].num) => `庫存不足`排除

### 店家運費優惠

```

https://rapi.ruten.com.tw/api/shippingfee/v1/seller/${店家 ID}/event/discount
```

- 可取得該店家的 `運費優惠`、`免運門檻`、`運送方式`(discount_conditions[運費方式]) : 僅有 `SEVEN`、`FAMILY`、`HILIFE` 為支援的運送方式

#### 露天店家商品列表

```
https://rtapi.ruten.com.tw/api/search/v3/index.php/core/seller/${店家ID}/prod?sort=prc/ac&limit=${最多50}&q=${目標名稱}
```

- 可獲取 此店家所有`商品 ID`(Rows[].Id)
