# 📦 Database Schema: Asset Management System

---

## 🧱 Table: `asset_types`

| Column        | Type     | Description                    |
|---------------|----------|--------------------------------|
| `id`          | INT      | Primary key (auto-increment)   |
| `name`        | VARCHAR  | Asset type name                |
| `unit`        | VARCHAR  | Unit of measurement (e.g. kg)  |
| `description` | TEXT     | Description of the asset type  |

---

## 📦 Table: `assets`

| Column          | Type     | Description                                      |
|-----------------|----------|--------------------------------------------------|
| `id`            | INT      | Primary key (auto-increment)                     |
| `name`          | VARCHAR  | Asset name                                       |
| `asset_type_id` | INT      | Foreign key → `asset_types(id)`                 |
| `quantity`      | DOUBLE   | Current total quantity available                 |
| `code`          | VARCHAR  | Unique asset code                                |
| `description`   | TEXT     | Description of the asset                         |
| `create_date`   | DATETIME | Date and time the asset was created/added        |

---

## 💸 Table: `transactions`

| Column             | Type      | Description                                           |
|--------------------|-----------|-------------------------------------------------------|
| `id`               | INT       | Primary key (auto-increment)                         |
| `asset_id`         | INT       | Foreign key → `assets(id)`                           |
| `transaction_type` | ENUM      | Transaction type: `IN` (add), `OUT` (remove)         |
| `quantity`         | DOUBLE    | Quantity involved in the transaction                 |
| `price`            | DOUBLE    | Unit price at time of transaction                    |
| `transaction_date` | DATETIME  | Date and time of the transaction                     |
| `holding`          | DOUBLE    | Asset balance after this transaction                 |
| `description`      | TEXT      | Notes or reason for the transaction (optional)       |

---

## 📈 Table: `price_daily`

| Column        | Type     | Description                                      |
|---------------|----------|--------------------------------------------------|
| `id`          | INT      | Primary key (auto-increment)                     |
| `asset_id`    | INT      | Foreign key → `assets(id)`                       |
| `date`        | DATE     | Date the price was recorded (NOT NULL)           |
| `price`       | DOUBLE   | Closing price of the asset on that date          |
| `create_date` | DATETIME | Date and time the price entry was recorded       |

---

## 🔗 Relationships

- `assets.asset_type_id` → `asset_types.id`
- `transactions.asset_id` → `assets.id`
- `price_daily.asset_id` → `assets.id`

---

## 📝 Notes

- All `id` columns are auto-incrementing primary keys.
- All foreign key constraints should be enforced for data integrity.
- `transactions.transaction_type` only supports two values: `IN`, `OUT`.
- `holding` in `transactions` records the balance after the transaction for traceability.
- All time-related fields should use `DATETIME` unless only the date is relevant.
- Price fields use `DOUBLE` to preserve financial precision.
