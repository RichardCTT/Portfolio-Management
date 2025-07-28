# Portfolio Management

A portfolio management system API built with Express.js

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

4. Or start production server:
```bash
npm start
```

5. Visit: http://localhost:3000

## API Endpoints

- `GET /` - Welcome page

## Project Structure

```
Portfolio-Management/
├── app.js              # Main application file
├── package.json        # Project configuration
├── .env.example        # Environment variables example
├── .gitignore         # Git ignore file
├── routes/            # Routes folder
├── config/            # Configuration folder
└── public/            # Static files folder
```

## Development

- Use `npm run dev` to start development mode (requires nodemon)
- Use `npm test` to run tests

## 📦 Database Schema: Asset Management System

### 🧱 Table: `asset_types`

```markdown
| Column      | Type     | Description                |
|-------------|----------|----------------------------|
| `id`        | INT      | Primary key                |
| `name`      | VARCHAR  | Asset type name            |
| `unit`      | VARCHAR  | Unit of measurement        |
| `description` | TEXT   | Asset type description     |
```

---

### 📦 Table: `assets`

```markdown
| Column         | Type     | Description                              |
|----------------|----------|------------------------------------------|
| `id`           | INT      | Primary key                              |
| `name`         | VARCHAR  | Asset name                               |
| `asset_type_id`| INT      | Foreign key → `asset_types(id)`          |
| `quantity`     | INT      | Current quantity                         |
| `code`         | VARCHAR  | Unique asset code                        |
| `description`  | TEXT     | Description of the asset                 |
| `create_date`  | DATE     | Date when the asset was created/added    |
```

---

### 💸 Table: `transactions`

```markdown
| Column            | Type     | Description                                 |
|-------------------|----------|---------------------------------------------|
| `id`              | INT      | Primary key                                 |
| `asset_id`        | INT      | Foreign key → `assets(id)`                  |
| `transaction_type`| ENUM     | Type of transaction (`IN`, `OUT`, `ADJUSTMENT`) |
| `quantity`        | INT      | Quantity involved in the transaction        |
| `price`           | DOUBLE   | Unit price at the time of transaction       |
| `transaction_date`| DATE     | Date of the transaction                     |
| `description`     | TEXT     | Additional notes or description             |
```

---

### 📈 Table: `price_history`

```markdown
| Column       | Type     | Description                                |
|--------------|----------|--------------------------------------------|
| `id`         | INT      | Primary key                                |
| `asset_id`   | INT      | Foreign key → `assets(id)`                 |
| `date`       | DATE     | Date the price was recorded (NOT NULL)     |
| `close_price`| DOUBLE   | Closing price of the asset on that date    |
| `create_date`| DATE     | Date the price entry was recorded          |
```

---

### 🔗 Relationships

```markdown
- `assets.asset_type_id` → `asset_types.id`
- `transactions.asset_id` → `assets.id`
- `price_history.asset_id` → `assets.id`
```
