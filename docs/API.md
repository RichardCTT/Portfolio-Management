好的，这是根据您提供的数据库表结构和要求生成的API接口设计文档（Markdown格式）。此文档包含了各模块的CRUD路由、请求参数和响应示例，方便前后端对齐开发。

---

# API 接口设计文档

## 概览

本文档定义了资产管理系统的核心API接口，包括资产类型、资产、交易记录、每日价格的管理接口，以及数据分析接口。

### 基础路径

所有API接口的基础路径为 `/api`。

例如：`GET /api/assets`

### 通用响应格式

除非另有说明，所有成功的API响应将遵循以下JSON格式：

```json
{
  "code": 200,
  "message": "Success",
  "data": {} // 具体的数据内容
}
```

失败的响应通常遵循以下格式：

```json
{
  "code": 400, // 或其他错误状态码如 404, 500
  "message": "错误描述信息",
  "data": null
}
```

---

## 1. 资产类型管理 (Asset Types) - `/asset_types`

### 1.1 获取所有资产类型

- **URL:** `/api/asset_types`
- **Method:** `GET`
- **Description:** 获取系统中所有资产类型的列表。
- **Query Parameters:**
  - `page` (integer, optional): 页码，默认为1。
  - `page_size` (integer, optional): 每页条目数，默认为10。
- **Response:**
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "items": [
        {
          "id": 1,
          "name": "贵金属",
          "unit": "kg",
          "description": "黄金、白银等"
        },
        {
          "id": 2,
          "name": "电子产品",
          "unit": "台",
          "description": "电脑、手机等"
        }
      ],
      "total": 2,
      "page": 1,
      "page_size": 10
    }
  }
  ```

### 1.2 获取单个资产类型

- **URL:** `/api/asset_types/{id}`
- **Method:** `GET`
- **Description:** 根据ID获取单个资产类型的详细信息。
- **Path Parameters:**
  - `id` (integer): 资产类型的唯一标识符。
- **Response:**
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "id": 1,
      "name": "贵金属",
      "unit": "kg",
      "description": "黄金、白银等"
    }
  }
  ```

### 1.3 创建资产类型

- **URL:** `/api/asset_types`
- **Method:** `POST`
- **Description:** 创建一个新的资产类型。
- **Request Body:**
  ```json
  {
    "name": "化工原料",
    "unit": "吨",
    "description": "石油、塑料颗粒等"
  }
  ```
- **Response:**
  ```json
  {
    "code": 201,
    "message": "Asset type created successfully",
    "data": {
      "id": 3,
      "name": "化工原料",
      "unit": "吨",
      "description": "石油、塑料颗粒等"
    }
  }
  ```

### 1.4 更新资产类型

- **URL:** `/api/asset_types/{id}`
- **Method:** `PUT`
- **Description:** 根据ID更新一个资产类型的详细信息。
- **Path Parameters:**
  - `id` (integer): 资产类型的唯一标识符。
- **Request Body:**
  ```json
  {
    "name": "稀有金属",
    "unit": "吨",
    "description": "铂金、铑等"
  }
  ```
  *注意：`unit` 字段通常不建议修改，此处为示例。*
- **Response:**
  ```json
  {
    "code": 200,
    "message": "Asset type updated successfully",
    "data": {
      "id": 3,
      "name": "稀有金属",
      "unit": "吨",
      "description": "铂金、铑等"
    }
  }
  ```

### 1.5 删除资产类型

- **URL:** `/api/asset_types/{id}`
- **Method:** `DELETE`
- **Description:** 根据ID删除一个资产类型。**注意：如果该类型下关联了资产，应禁止删除或返回错误。**
- **Path Parameters:**
  - `id` (integer): 资产类型的唯一标识符。
- **Response:**
  ```json
  {
    "code": 200,
    "message": "Asset type deleted successfully",
    "data": null
  }
  ```

---

## 2. 资产管理 (Assets) - `/assets`

### 2.1 获取所有资产

- **URL:** `/api/assets`
- **Method:** `GET`
- **Description:** 获取系统中所有资产的列表。
- **Query Parameters:**
  - `page` (integer, optional): 页码，默认为1。
  - `page_size` (integer, optional): 每页条目数，默认为10。
  - `asset_type_id` (integer, optional): 筛选特定类型的资产。
- **Response:**
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "items": [
        {
          "id": 1,
          "name": "黄金储备",
          "asset_type_id": 1,
          "quantity": 50.5,
          "code": "AU-001",
          "description": "标准金条",
          "create_date": "2023-10-27T08:00:00Z"
        }
      ],
      "total": 1,
      "page": 1,
      "page_size": 10
    }
  }
  ```

### 2.2 获取单个资产

- **URL:** `/api/assets/{id}`
- **Method:** `GET`
- **Description:** 根据ID获取单个资产的详细信息。
- **Path Parameters:**
  - `id` (integer): 资产的唯一标识符。
- **Response:**
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "id": 1,
      "name": "黄金储备",
      "asset_type_id": 1,
      "quantity": 50.5,
      "code": "AU-001",
      "description": "标准金条",
      "create_date": "2023-10-27T08:00:00Z"
    }
  }
  ```

### 2.3 创建资产

- **URL:** `/api/assets`
- **Method:** `POST`
- **Description:** 创建一个新的资产。
- **Request Body:**
  ```json
  {
    "name": "白银储备",
    "asset_type_id": 1,
    "quantity": 100.0,
    "code": "AG-001",
    "description": "标准银条"
  }
  ```
- **Response:**
  ```json
  {
    "code": 201,
    "message": "Asset created successfully",
    "data": {
      "id": 2,
      "name": "白银储备",
      "asset_type_id": 1,
      "quantity": 100.0,
      "code": "AG-001",
      "description": "标准银条",
      "create_date": "2024-06-14T10:00:00Z"
    }
  }
  ```

### 2.4 更新资产

- **URL:** `/api/assets/{id}`
- **Method:** `PUT`
- **Description:** 根据ID更新一个资产的详细信息。
- **Path Parameters:**
  - `id` (integer): 资产的唯一标识符。
- **Request Body:**
  ```json
  {
    "name": "高纯度白银储备",
    "description": "99.99%纯度银条"
  }
  ```
  *注意：`quantity` 通常由交易记录自动更新，不建议直接修改。*
- **Response:**
  ```json
  {
    "code": 200,
    "message": "Asset updated successfully",
    "data": {
      "id": 2,
      "name": "高纯度白银储备",
      "asset_type_id": 1,
      "quantity": 100.0,
      "code": "AG-001",
      "description": "99.99%纯度银条",
      "create_date": "2024-06-14T10:00:00Z"
    }
  }
  ```

### 2.5 删除资产

- **URL:** `/api/assets/{id}`
- **Method:** `DELETE`
- **Description:** 根据ID删除一个资产。**注意：如果该资产有关联的交易记录，应禁止删除或返回错误。**
- **Path Parameters:**
  - `id` (integer): 资产的唯一标识符。
- **Response:**
  ```json
  {
    "code": 200,
    "message": "Asset deleted successfully",
    "data": null
  }
  ```

---

## 3. 交易记录管理 (Transactions) - `/transactions`

### 3.1 获取所有交易记录

- **URL:** `/api/transactions`
- **Method:** `GET`
- **Description:** 获取系统中所有交易记录的列表。
- **Query Parameters:**
  - `page` (integer, optional): 页码，默认为1。
  - `page_size` (integer, optional): 每页条目数，默认为10。
  - `asset_id` (integer, optional): 筛选特定资产的交易。
- **Response:**
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "items": [
        {
          "id": 1,
          "asset_id": 1,
          "transaction_type": "IN",
          "quantity": 20.0,
          "price": 450.0,
          "transaction_date": "2023-10-28T09:00:00Z",
          "holding": 70.5,
          "description": "月初采购"
        }
      ],
      "total": 1,
      "page": 1,
      "page_size": 10
    }
  }
  ```

### 3.2 获取单个交易记录

- **URL:** `/api/transactions/{id}`
- **Method:** `GET`
- **Description:** 根据ID获取单个交易记录的详细信息。
- **Path Parameters:**
  - `id` (integer): 交易记录的唯一标识符。
- **Response:**
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "id": 1,
      "asset_id": 1,
      "transaction_type": "IN",
      "quantity": 20.0,
      "price": 450.0,
      "transaction_date": "2023-10-28T09:00:00Z",
      "holding": 70.5,
      "description": "月初采购"
    }
  }
  ```

### 3.3 创建交易记录

- **URL:** `/api/transactions`
- **Method:** `POST`
- **Description:** 创建一个新的交易记录。此操作会自动更新对应资产的 `quantity` 和 `holding` 字段。
- **Request Body:**
  ```json
  {
    "asset_id": 1,
    "transaction_type": "OUT",
    "quantity": 5.0,
    "price": 460.0,
    "transaction_date": "2024-06-15T14:00:00Z",
    "description": "客户提货"
  }
  ```
- **Response:**
  ```json
  {
    "code": 201,
    "message": "Transaction created successfully",
    "data": {
      "id": 2,
      "asset_id": 1,
      "transaction_type": "OUT",
      "quantity": 5.0,
      "price": 460.0,
      "transaction_date": "2024-06-15T14:00:00Z",
      "holding": 65.5, // 资产后余额
      "description": "客户提货"
    }
  }
  ```

### 3.4 删除交易记录

- **URL:** `/api/transactions/{id}`
- **Method:** `DELETE`
- **Description:** 根据ID删除一个交易记录。**注意：此操作可能会影响后续交易的 `holding` 值以及资产的 `quantity`，需谨慎处理，通常建议软删除或禁止删除。**
- **Path Parameters:**
  - `id` (integer): 交易记录的唯一标识符。
- **Response:**
  ```json
  {
    "code": 200,
    "message": "Transaction deleted successfully",
    "data": null
  }
  ```

---

## 4. 每日价格管理 (Price Daily) - `/price_daily`

### 4.1 获取某资产的所有价格记录

- **URL:** `/api/price_daily`
- **Method:** `GET`
- **Description:** 获取特定资产的所有历史价格记录。
- **Query Parameters:**
  - `asset_id` (integer, required): 资产的唯一标识符。
  - `page` (integer, optional): 页码，默认为1。
  - `page_size` (integer, optional): 每页条目数，默认为10。
- **Response:**
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "items": [
        {
          "id": 1,
          "asset_id": 1,
          "date": "2024-06-13",
          "price": 455.0,
          "create_date": "2024-06-13T20:00:00Z"
        },
        {
          "id": 2,
          "asset_id": 1,
          "date": "2024-06-14",
          "price": 458.0,
          "create_date": "2024-06-14T20:00:00Z"
        }
      ],
      "total": 2,
      "page": 1,
      "page_size": 10
    }
  }
  ```

### 4.2 获取单个价格记录

- **URL:** `/api/price_daily/{id}`
- **Method:** `GET`
- **Description:** 根据ID获取单个价格记录的详细信息。
- **Path Parameters:**
  - `id` (integer): 价格记录的唯一标识符。
- **Response:**
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "id": 1,
      "asset_id": 1,
      "date": "2024-06-13",
      "price": 455.0,
      "create_date": "2024-06-13T20:00:00Z"
    }
  }
  ```

### 4.3 创建/更新价格记录

- **URL:** `/api/price_daily`
- **Method:** `POST`
- **Description:** 为特定资产和日期创建或更新价格记录。如果指定日期的记录已存在，则更新；否则创建新记录。
- **Request Body:**
  ```json
  {
    "asset_id": 1,
    "date": "2024-06-15",
    "price": 462.0
  }
  ```
- **Response (创建):**
  ```json
  {
    "code": 201,
    "message": "Price record created successfully",
    "data": {
      "id": 3,
      "asset_id": 1,
      "date": "2024-06-15",
      "price": 462.0,
      "create_date": "2024-06-15T15:00:00Z"
    }
  }
  ```
- **Response (更新):**
  ```json
  {
    "code": 200,
    "message": "Price record updated successfully",
    "data": {
      "id": 3,
      "asset_id": 1,
      "date": "2024-06-15",
      "price": 462.0,
      "create_date": "2024-06-15T15:00:00Z" // create_date 通常不变
    }
  }
  ```

### 4.4 删除价格记录

- **URL:** `/api/price_daily/{id}`
- **Method:** `DELETE`
- **Description:** 根据ID删除一个价格记录。
- **Path Parameters:**
  - `id` (integer): 价格记录的唯一标识符。
- **Response:**
  ```json
  {
    "code": 200,
    "message": "Price record deleted successfully",
    "data": null
  }
  ```

---

## 5. 数据分析 (Analyze) - `/analyze`

### 5.1 获取资产价值汇总

- **URL:** `/api/analyze/asset_value_summary`
- **Method:** `GET`
- **Description:** 计算并返回当前所有资产的总价值（基于最新价格）。
- **Response:**
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "total_value": 123456.78, // 所有资产总价值
      "details": [
        {
          "asset_id": 1,
          "asset_name": "黄金储备",
          "quantity": 65.5,
          "latest_price": 462.0,
          "value": 30261.0
        },
        {
          "asset_id": 2,
          "asset_name": "高纯度白银储备",
          "quantity": 100.0,
          "latest_price": 5.5,
          "value": 550.0
        }
      ]
    }
  }
  ```

### 5.2 获取资产类型价值分布

- **URL:** `/api/analyze/asset_type_value_distribution`
- **Method:** `GET`
- **Description:** 按资产类型分组，计算并返回各类资产的总价值。
- **Response:**
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": [
      {
        "asset_type_id": 1,
        "asset_type_name": "贵金属",
        "total_value": 30811.0
      },
      {
        "asset_type_id": 2,
        "asset_type_name": "电子产品",
        "total_value": 92645.78
      }
    ]
  }
  ```

### 5.3 获取资产历史价值趋势

- **URL:** `/api/analyze/asset_value_trend`
- **Method:** `GET`
- **Description:** 获取特定资产在一段时间内的价值变化趋势。
- **Query Parameters:**
  - `asset_id` (integer, required): 资产的唯一标识符。
  - `start_date` (string, required, format: YYYY-MM-DD): 查询开始日期。
  - `end_date` (string, required, format: YYYY-MM-DD): 查询结束日期。
- **Response:**
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": {
      "asset_id": 1,
      "asset_name": "黄金储备",
      "trend_data": [
        {
          "date": "2024-06-13",
          "price": 455.0,
          "quantity": 70.5, // 假设当日持有量
          "value": 32077.5
        },
        {
          "date": "2024-06-14",
          "price": 458.0,
          "quantity": 70.5,
          "value": 32289.0
        },
        {
          "date": "2024-06-15",
          "price": 462.0,
          "quantity": 65.5,
          "value": 30261.0
        }
      ]
    }
  }
  ```

---