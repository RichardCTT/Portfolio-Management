# 📦 Database Schema: Asset Management System

## 🧱 Table: `asset_types`

| Column      | Type     | Description                |
|-------------|----------|----------------------------|
| `id`        | INT      | Primary key                |
| `name`      | VARCHAR  | Asset type name            |
| `unit`      | VARCHAR  | Unit of measurement        |
| `description` | TEXT   | Asset type description     |

---

## 📦 Table: `assets`

| Column         | Type     | Description                              |
|----------------|----------|------------------------------------------|
| `id`           | INT      | Primary key                              |
| `name`         | VARCHAR  | Asset name                               |
| `asset_type_id`| INT      | Foreign key → `asset_types(id)`          |
| `quantity`     | DOUBLE   | Current quantity                         |
| `code`         | VARCHAR  | Unique asset code                        |
| `description`  | TEXT     | Description of the asset                 |
| `create_date`  | DATE     | Date when the asset was created/added    |

---

## 💸 Table: `transactions`

| Column            | Type     | Description                                 |
|-------------------|----------|---------------------------------------------|
| `id`              | INT      | Primary key                                 |
| `asset_id`        | INT      | Foreign key → `assets(id)`                  |
| `transaction_type`| ENUM     | Type of transaction (`IN`, `OUT`, `ADJUSTMENT`) |
| `quantity`        | DOUBLE   | Quantity involved in the transaction        |
| `price`           | DOUBLE   | Unit price at the time of transaction       |
| `transaction_date`| DATE     | Date of the transaction                     |
| `balance_after`   | DOUBLE   | Asset quantity balance after this transaction |
| `description`     | TEXT     | Additional notes or description             |

---

## 📈 Table: `price_history`

| Column       | Type     | Description                                |
|--------------|----------|--------------------------------------------|
| `id`         | INT      | Primary key                                |
| `asset_id`   | INT      | Foreign key → `assets(id)`                 |
| `date`       | DATE     | Date the price was recorded (NOT NULL)     |
| `close_price`| DOUBLE   | Closing price of the asset on that date    |
| `create_date`| DATE     | Date the price entry was recorded          |

---

## 🔗 Relationships

- `assets.asset_type_id` → `asset_types.id`
- `transactions.asset_id` → `assets.id`
- `price_history.asset_id` → `assets.id`

---

## 📝 Notes

- All `id` columns are auto-incrementing primary keys
- Foreign key constraints should be enforced for data integrity
- Date columns should use appropriate date/datetime formats
- Price columns use DOUBLE for precision in financial calculations
- The `balance_after` column in transactions table records the asset quantity after each transaction, providing an audit trail
- Transaction types: `IN` (purchase/add), `OUT` (sell/remove), `ADJUSTMENT` (correction/adjustment)
