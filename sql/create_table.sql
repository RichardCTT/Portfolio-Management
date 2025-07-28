-- Switch to or create the database
CREATE DATABASE IF NOT EXISTS portfolio_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE portfolio_management;

-- =========================================
-- 🔄 Drop existing tables (in dependency order)
-- =========================================
DROP TABLE IF EXISTS price_daily;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS asset_types;

-- =========================================
-- 📦 Table: asset_types
-- Stores asset categories and measurement units
-- =========================================
CREATE TABLE asset_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50),
    description TEXT
) ENGINE=InnoDB;

-- =========================================
-- 📦 Table: assets
-- Stores individual asset records
-- =========================================
CREATE TABLE assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    asset_type_id INT NOT NULL,
    quantity DOUBLE DEFAULT 0,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_asset_type FOREIGN KEY (asset_type_id) REFERENCES asset_types(id)
) ENGINE=InnoDB;

-- =========================================
-- 💸 Table: transactions
-- Logs asset transactions (IN/OUT) with audit trail
-- =========================================
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    transaction_type ENUM('IN', 'OUT') NOT NULL, -- IN = add, OUT = remove
    quantity DOUBLE NOT NULL,
    price DOUBLE NOT NULL,
    transaction_date DATETIME NOT NULL,
    holding DOUBLE NOT NULL, -- quantity after transaction
    description TEXT,
    CONSTRAINT fk_transaction_asset FOREIGN KEY (asset_id) REFERENCES assets(id)
) ENGINE=InnoDB;

-- =========================================
-- 📈 Table: price_daily
-- Daily closing price records for assets
-- =========================================
CREATE TABLE price_daily (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    date DATE NOT NULL, -- pricing date
    price DOUBLE NOT NULL,
    create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_price_asset FOREIGN KEY (asset_id) REFERENCES assets(id),
    UNIQUE(asset_id, date) -- prevent duplicate price records
) ENGINE=InnoDB;

-- Insert sample asset types into asset_types table
INSERT INTO asset_types (name, unit, description) VALUES
('Cash', 'USD', 'Cash holdings in base currency (USD).'),
('Stock', 'shares', 'Equity securities representing ownership in companies.'),
('Bond', 'units', 'Fixed income instruments issued by governments or corporations.'),
('Cryptocurrency', 'tokens', 'Digital currencies secured by cryptography.'),
('Foreign Currency', 'units', 'Non-USD cash holdings in foreign currencies.'),
('Futures', 'contracts', 'Standardized contracts to buy/sell assets at a future date.');

-- Insert sample assets into assets table
INSERT INTO assets (name, asset_type_id, quantity, code, description, create_date) VALUES
('USD Cash Reserve 1', 1, 500000.00, 'CASH001', 'Main USD cash reserve', CURDATE()),
('Apple Inc.', 2, 0, 'AAPL', 'Shares of Apple Inc.', CURDATE()),
('Microsoft Corporation', 2, 0, 'MSFT', 'Shares of Microsoft Corporation', CURDATE()),
('Amazon.com, Inc.', 2, 0, 'AMZN', 'Shares of Amazon.com, Inc.', CURDATE()),
('Alphabet Inc. Class A', 2, 0, 'GOOGL', 'Shares of Alphabet Inc. Class A', CURDATE()),
('Alphabet Inc. Class C', 2, 0, 'GOOG', 'Shares of Alphabet Inc. Class C', CURDATE()),
('Tesla, Inc.', 2, 0, 'TSLA', 'Shares of Tesla, Inc.', CURDATE()),
('Meta Platforms, Inc.', 2, 0, 'META', 'Shares of Meta Platforms, Inc.', CURDATE()),
('NVIDIA Corporation', 2, 0, 'NVDA', 'Shares of NVIDIA Corporation', CURDATE()),
('Berkshire Hathaway Inc. Class B', 2, 0, 'BRK.B', 'Shares of Berkshire Hathaway Inc. Class B', CURDATE()),
('UnitedHealth Group Incorporated', 2, 0, 'UNH', 'Shares of UnitedHealth Group Incorporated', CURDATE()),
('Visa Inc.', 2, 0, 'V', 'Shares of Visa Inc.', CURDATE()),
('Johnson & Johnson', 2, 0, 'JNJ', 'Shares of Johnson & Johnson', CURDATE()),
('Procter & Gamble Company', 2, 0, 'PG', 'Shares of Procter & Gamble Company', CURDATE()),
('JPMorgan Chase & Co.', 2, 0, 'JPM', 'Shares of JPMorgan Chase & Co.', CURDATE()),
('Mastercard Incorporated', 2, 0, 'MA', 'Shares of Mastercard Incorporated', CURDATE()),
('Home Depot, Inc.', 2, 0, 'HD', 'Shares of Home Depot, Inc.', CURDATE()),
('Exxon Mobil Corporation', 2, 0, 'XOM', 'Shares of Exxon Mobil Corporation', CURDATE()),
('Chevron Corporation', 2, 0, 'CVX', 'Shares of Chevron Corporation', CURDATE()),
('Pfizer Inc.', 2, 0, 'PFE', 'Shares of Pfizer Inc.', CURDATE()),
('AbbVie Inc.', 2, 0, 'ABBV', 'Shares of AbbVie Inc.', CURDATE()),
('Coca-Cola Company', 2, 0, 'KO', 'Shares of Coca-Cola Company', CURDATE()),
('PepsiCo, Inc.', 2, 0, 'PEP', 'Shares of PepsiCo, Inc.', CURDATE()),
('Intel Corporation', 2, 0, 'INTC', 'Shares of Intel Corporation', CURDATE()),
('Walmart Inc.', 2, 0, 'WMT', 'Shares of Walmart Inc.', CURDATE()),
('Cisco Systems, Inc.', 2, 0, 'CSCO', 'Shares of Cisco Systems, Inc.', CURDATE()),
('Adobe Inc.', 2, 0, 'ADBE', 'Shares of Adobe Inc.', CURDATE()),
('Netflix, Inc.', 2, 0, 'NFLX', 'Shares of Netflix, Inc.', CURDATE()),
('Salesforce, Inc.', 2, 0, 'CRM', 'Shares of Salesforce, Inc.', CURDATE()),
('Oracle Corporation', 2, 0, 'ORCL', 'Shares of Oracle Corporation', CURDATE()),
('Qualcomm Incorporated', 2, 0, 'QCOM', 'Shares of Qualcomm Incorporated', CURDATE()),
('Texas Instruments Incorporated', 2, 0, 'TXN', 'Shares of Texas Instruments Incorporated', CURDATE()),
('Costco Wholesale Corporation', 2, 0, 'COST', 'Shares of Costco Wholesale Corporation', CURDATE()),
('Broadcom Inc.', 2, 0, 'AVGO', 'Shares of Broadcom Inc.', CURDATE()),
('Thermo Fisher Scientific Inc.', 2, 0, 'TMO', 'Shares of Thermo Fisher Scientific Inc.', CURDATE()),
('Abbott Laboratories', 2, 0, 'ABT', 'Shares of Abbott Laboratories', CURDATE()),
('Verizon Communications Inc.', 2, 0, 'VZ', 'Shares of Verizon Communications Inc.', CURDATE()),
('AT&T Inc.', 2, 0, 'T', 'Shares of AT&T Inc.', CURDATE()),
('Bristol-Myers Squibb Company', 2, 0, 'BMY', 'Shares of Bristol-Myers Squibb Company', CURDATE()),
('Goldman Sachs Group, Inc.', 2, 0, 'GS', 'Shares of Goldman Sachs Group, Inc.', CURDATE()),
('Citigroup Inc.', 2, 0, 'C', 'Shares of Citigroup Inc.', CURDATE()),
('General Electric Company', 2, 0, 'GE', 'Shares of General Electric Company', CURDATE()),
('American Express Company', 2, 0, 'AXP', 'Shares of American Express Company', CURDATE()),
('Lockheed Martin Corporation', 2, 0, 'LMT', 'Shares of Lockheed Martin Corporation', CURDATE()),
('3M Company', 2, 0, 'MMM', 'Shares of 3M Company', CURDATE()),
('Ford Motor Company', 2, 0, 'F', 'Shares of Ford Motor Company', CURDATE()),
('Boeing Company', 2, 0, 'BA', 'Shares of Boeing Company', CURDATE()),
('Starbucks Corporation', 2, 0, 'SBUX', 'Shares of Starbucks Corporation', CURDATE()),
('McDonald\'s Corporation', 2, 0, 'MCD', 'Shares of McDonald\'s Corporation', CURDATE()),
('Nike, Inc.', 2, 0, 'NKE', 'Shares of Nike, Inc.', CURDATE()),
('Target Corporation', 2, 0, 'TGT', 'Shares of Target Corporation', CURDATE()),
('US Treasury 10Y', 3, 0, 'BND001', '10-Year U.S. Treasury Bond', CURDATE()),
('US Treasury 2Y', 3, 0, 'BND002', '2-Year U.S. Treasury Bond', CURDATE()),
('Corporate Bond AAPL 2030', 3, 0, 'BND003', 'Apple Inc. Corporate Bond maturing 2030', CURDATE()),
('Corporate Bond MSFT 2032', 3, 0, 'BND004', 'Microsoft Corporate Bond maturing 2032', CURDATE()),
('Municipal Bond NY', 3, 0, 'BND005', 'New York State Municipal Bond', CURDATE()),
('Corporate Bond TSLA 2029', 3, 0, 'BND006', 'Tesla Corporate Bond maturing 2029', CURDATE()),
('US Treasury Inflation-Protected', 3, 0, 'BND007', 'TIPS - Treasury Inflation-Protected Securities', CURDATE()),
('Green Bond EU', 3, 0, 'BND008', 'EU Green Bond', CURDATE()),
('High Yield Bond XYZ', 3, 0, 'BND009', 'High-Yield Corporate Bond', CURDATE()),
('Convertible Bond ABC', 3, 0, 'BND010', 'Convertible Corporate Bond', CURDATE()),
('Bitcoin', 4, 0, 'CRYPTO001', 'The first and most popular cryptocurrency', CURDATE()),
('Ethereum', 4, 0, 'CRYPTO002', 'Decentralized platform for smart contracts', CURDATE()),
('Ripple', 4, 0, 'CRYPTO003', 'Digital payment protocol and cryptocurrency', CURDATE()),
('Litecoin', 4, 0, 'CRYPTO004', 'Peer-to-peer cryptocurrency inspired by Bitcoin', CURDATE()),
('Cardano', 4, 0, 'CRYPTO005', 'Blockchain platform for smart contracts', CURDATE()),
('Euro', 5, 0, 'FX001', 'European Union official currency', CURDATE()),
('Japanese Yen', 5, 0, 'FX002', 'Official currency of Japan', CURDATE()),
('British Pound', 5, 0, 'FX003', 'Currency of the United Kingdom', CURDATE()),
('Swiss Franc', 5, 0, 'FX004', 'Currency of Switzerland', CURDATE()),
('Canadian Dollar', 5, 0, 'FX005', 'Currency of Canada', CURDATE()),
('Australian Dollar', 5, 0, 'FX006', 'Currency of Australia', CURDATE()),
('Chinese Yuan', 5, 0, 'FX007', 'Official currency of China', CURDATE()),
('Swedish Krona', 5, 0, 'FX008', 'Currency of Sweden', CURDATE()),
('New Zealand Dollar', 5, 0, 'FX009', 'Currency of New Zealand', CURDATE()),
('South Korean Won', 5, 0, 'FX010', 'Currency of South Korea', CURDATE()),
('S&P 500 E-mini Futures', 6, 0, 'FUT001', 'Futures contract on the S&P 500 index', CURDATE()),
('Crude Oil Futures', 6, 0, 'FUT002', 'Futures contract for crude oil', CURDATE()),
('Gold Futures', 6, 0, 'FUT003', 'Futures contract for gold commodity', CURDATE()),
('Natural Gas Futures', 6, 0, 'FUT004', 'Futures contract for natural gas', CURDATE()),
('Corn Futures', 6, 0, 'FUT005', 'Futures contract for corn commodity', CURDATE()),
('Eurodollar Futures', 6, 0, 'FUT006', 'Futures contract on Eurodollar deposits', CURDATE()),
('Silver Futures', 6, 0, 'FUT007', 'Futures contract for silver commodity', CURDATE()),
('Copper Futures', 6, 0, 'FUT008', 'Futures contract for copper commodity', CURDATE()),
('Wheat Futures', 6, 0, 'FUT009', 'Futures contract for wheat commodity', CURDATE()),
('Bitcoin Futures', 6, 0, 'FUT010', 'Futures contract on Bitcoin cryptocurrency', CURDATE());

-- =========================================
-- 📈 Insert Mock Daily Prices for July 2025 (Compatible Version)
-- =========================================
-- This script generates mock prices for all assets from 2025-07-01 to 2025-07-31.
-- Compatible with MySQL 5.7+ and avoids complex CTE issues.
-- =========================================

-- Create a temporary list of dates for July 2025
CREATE TEMPORARY TABLE temp_dates (date DATE);
INSERT INTO temp_dates (date) VALUES
('2025-07-01'), ('2025-07-02'), ('2025-07-03'), ('2025-07-04'), ('2025-07-05'), ('2025-07-06'), ('2025-07-07'),
('2025-07-08'), ('2025-07-09'), ('2025-07-10'), ('2025-07-11'), ('2025-07-12'), ('2025-07-13'), ('2025-07-14'),
('2025-07-15'), ('2025-07-16'), ('2025-07-17'), ('2025-07-18'), ('2025-07-19'), ('2025-07-20'), ('2025-07-21'),
('2025-07-22'), ('2025-07-23'), ('2025-07-24'), ('2025-07-25'), ('2025-07-26'), ('2025-07-27'), ('2025-07-28'),
('2025-07-29'), ('2025-07-30'), ('2025-07-31');

-- Insert mock prices for all assets on all dates
INSERT INTO price_daily (asset_id, date, price)
SELECT
    a.id AS asset_id,
    d.date,
    CASE
        -- Cash: 1 unit = 1 USD
        WHEN a.code = 'CASH001' THEN 1.0
        
        -- Stocks: Simulate prices between $50 and $300
        WHEN a.asset_type_id = 2 THEN ROUND(50 + (RAND() * 250), 2)
        
        -- Bonds: Simulate prices close to 100 (par value), e.g., 95-105
        WHEN a.asset_type_id = 3 THEN ROUND(95 + (RAND() * 10), 2)
        
        -- Cryptocurrencies: Highly volatile, simulate wide ranges
        WHEN a.asset_type_id = 4 THEN 
            CASE a.code
                WHEN 'CRYPTO001' THEN ROUND(40000 + (RAND() * 20000), 2) -- BTC: $40k - $60k
                WHEN 'CRYPTO002' THEN ROUND(2000 + (RAND() * 1000), 2)  -- ETH: $2k - $3k
                ELSE ROUND(0.1 + (RAND() * 5), 2) -- Other cryptos: $0.1 - $5.1
            END
        
        -- Foreign Currencies: Simulate FX rates
        WHEN a.asset_type_id = 5 THEN
            CASE a.code
                WHEN 'FX001' THEN ROUND(1.05 + (RAND() * 0.1), 4) -- EUR/USD: 1.05 - 1.15
                WHEN 'FX002' THEN ROUND(150 + (RAND() * 20), 2)   -- JPY/USD: ¥150 - ¥170
                WHEN 'FX003' THEN ROUND(1.25 + (RAND() * 0.15), 4) -- GBP/USD: 1.25 - 1.40
                WHEN 'FX004' THEN ROUND(0.9 + (RAND() * 0.1), 4)  -- CHF/USD: 0.90 - 1.00
                WHEN 'FX005' THEN ROUND(1.3 + (RAND() * 0.2), 4)  -- CAD/USD: 1.30 - 1.50
                WHEN 'FX006' THEN ROUND(1.5 + (RAND() * 0.3), 4)  -- AUD/USD: 1.50 - 1.80
                WHEN 'FX007' THEN ROUND(7.2 + (RAND() * 0.5), 4)  -- CNY/USD: ¥7.2 - ¥7.7
                ELSE ROUND(1.0 + (RAND() * 2.0), 4) -- Default for other FX
            END
        
        -- Futures: Simulate based on underlying (very rough)
        WHEN a.asset_type_id = 6 THEN
            CASE a.code
                WHEN 'FUT001' THEN ROUND(5000 + (RAND() * 1000), 2) -- S&P 500 E-mini
                WHEN 'FUT002' THEN ROUND(70 + (RAND() * 30), 2)    -- Crude Oil
                WHEN 'FUT003' THEN ROUND(2000 + (RAND() * 500), 2) -- Gold
                WHEN 'FUT004' THEN ROUND(2.5 + (RAND() * 1.5), 2)  -- Natural Gas
                WHEN 'FUT010' THEN ROUND(40000 + (RAND() * 20000), 2) -- Bitcoin Futures
                ELSE ROUND(500 + (RAND() * 500), 2) -- Default for other futures
            END
        
        -- Fallback for any unforeseen asset type
        ELSE ROUND(10 + (RAND() * 100), 2)
    END AS mock_price
FROM assets a
CROSS JOIN temp_dates d
ORDER BY a.id, d.date;

-- Clean up: Drop the temporary table
DROP TEMPORARY TABLE temp_dates;