-- =========================================
-- 📈 Update Price Daily with Realistic Price Movements
-- 更新价格数据，实现真实的微小价格变动
-- 生成2025年7月和8月的完整价格数据
-- =========================================

-- 临时禁用安全更新模式（仅在此脚本中）
SET SQL_SAFE_UPDATES = 0;

-- 首先清空现有的价格数据
DELETE FROM price_daily WHERE 1=1;

-- 为每种资产类型设置基准价格
-- 现金类资产：固定为1.0
UPDATE assets SET quantity = 500000.00 WHERE code = 'CASH001';

-- 为每种资产类型生成基准价格
-- 股票：$50-$300范围
-- 债券：$95-$105范围（接近面值）
-- 加密货币：根据实际市场情况
-- 外汇：基于实际汇率
-- 期货：基于标的资产

-- 插入基准价格（2025-07-01）
INSERT INTO price_daily (asset_id, date, price)
SELECT 
    id,
    '2025-07-01',
    CASE
        -- 现金
        WHEN code = 'CASH001' THEN 1.0
        
        -- 股票基准价格
        WHEN asset_type_id = 2 THEN
            CASE code
                WHEN 'AAPL' THEN 180.00
                WHEN 'MSFT' THEN 420.00
                WHEN 'AMZN' THEN 140.00
                WHEN 'GOOGL' THEN 160.00
                WHEN 'GOOG' THEN 155.00
                WHEN 'TSLA' THEN 250.00
                WHEN 'META' THEN 350.00
                WHEN 'NVDA' THEN 800.00
                WHEN 'BRK.B' THEN 380.00
                WHEN 'UNH' THEN 520.00
                WHEN 'V' THEN 280.00
                WHEN 'JNJ' THEN 160.00
                WHEN 'PG' THEN 150.00
                WHEN 'JPM' THEN 180.00
                WHEN 'MA' THEN 400.00
                WHEN 'HD' THEN 320.00
                WHEN 'XOM' THEN 110.00
                WHEN 'CVX' THEN 150.00
                WHEN 'PFE' THEN 30.00
                WHEN 'ABBV' THEN 160.00
                WHEN 'KO' THEN 60.00
                WHEN 'PEP' THEN 170.00
                WHEN 'INTC' THEN 35.00
                WHEN 'WMT' THEN 65.00
                WHEN 'CSCO' THEN 50.00
                WHEN 'ADBE' THEN 500.00
                WHEN 'NFLX' THEN 600.00
                WHEN 'CRM' THEN 220.00
                WHEN 'ORCL' THEN 120.00
                WHEN 'QCOM' THEN 140.00
                WHEN 'TXN' THEN 160.00
                WHEN 'COST' THEN 800.00
                WHEN 'AVGO' THEN 1200.00
                WHEN 'TMO' THEN 550.00
                WHEN 'ABT' THEN 110.00
                WHEN 'VZ' THEN 40.00
                WHEN 'T' THEN 15.00
                WHEN 'BMY' THEN 45.00
                WHEN 'GS' THEN 380.00
                WHEN 'C' THEN 60.00
                WHEN 'GE' THEN 120.00
                WHEN 'AXP' THEN 200.00
                WHEN 'LMT' THEN 450.00
                WHEN 'MMM' THEN 90.00
                WHEN 'F' THEN 12.00
                WHEN 'BA' THEN 200.00
                WHEN 'SBUX' THEN 90.00
                WHEN 'MCD' THEN 280.00
                WHEN 'NKE' THEN 100.00
                WHEN 'TGT' THEN 140.00
                ELSE 100.00 -- 默认价格
            END
        
        -- 债券基准价格（接近面值100）
        WHEN asset_type_id = 3 THEN
            CASE code
                WHEN 'BND001' THEN 98.50  -- 10年期国债
                WHEN 'BND002' THEN 99.20  -- 2年期国债
                WHEN 'BND003' THEN 102.50 -- 公司债
                WHEN 'BND004' THEN 101.80 -- 公司债
                WHEN 'BND005' THEN 100.50 -- 市政债
                WHEN 'BND006' THEN 103.20 -- 公司债
                WHEN 'BND007' THEN 104.50 -- TIPS
                WHEN 'BND008' THEN 101.00 -- 绿色债券
                WHEN 'BND009' THEN 95.50  -- 高收益债
                WHEN 'BND010' THEN 105.00 -- 可转债
                ELSE 100.00
            END
        
        -- 加密货币基准价格
        WHEN asset_type_id = 4 THEN
            CASE code
                WHEN 'CRYPTO001' THEN 45000.00 -- Bitcoin
                WHEN 'CRYPTO002' THEN 2500.00  -- Ethereum
                WHEN 'CRYPTO003' THEN 0.50     -- Ripple
                WHEN 'CRYPTO004' THEN 80.00    -- Litecoin
                WHEN 'CRYPTO005' THEN 0.45     -- Cardano
                ELSE 1.00
            END
        
        -- 外汇基准价格（对美元汇率）
        WHEN asset_type_id = 5 THEN
            CASE code
                WHEN 'FX001' THEN 1.08    -- EUR/USD
                WHEN 'FX002' THEN 160.00  -- JPY/USD
                WHEN 'FX003' THEN 1.30    -- GBP/USD
                WHEN 'FX004' THEN 0.95    -- CHF/USD
                WHEN 'FX005' THEN 1.35    -- CAD/USD
                WHEN 'FX006' THEN 1.65    -- AUD/USD
                WHEN 'FX007' THEN 7.25    -- CNY/USD
                WHEN 'FX008' THEN 10.50   -- SEK/USD
                WHEN 'FX009' THEN 1.60    -- NZD/USD
                WHEN 'FX010' THEN 1300.00 -- KRW/USD
                ELSE 1.00
            END
        
        -- 期货基准价格
        WHEN asset_type_id = 6 THEN
            CASE code
                WHEN 'FUT001' THEN 5200.00 -- S&P 500 E-mini
                WHEN 'FUT002' THEN 75.00   -- 原油
                WHEN 'FUT003' THEN 2200.00 -- 黄金
                WHEN 'FUT004' THEN 3.20    -- 天然气
                WHEN 'FUT005' THEN 4.50    -- 玉米
                WHEN 'FUT006' THEN 95.50   -- 欧洲美元
                WHEN 'FUT007' THEN 25.00   -- 白银
                WHEN 'FUT008' THEN 4.20    -- 铜
                WHEN 'FUT009' THEN 6.80    -- 小麦
                WHEN 'FUT010' THEN 45000.00 -- 比特币期货
                ELSE 100.00
            END
        
        ELSE 100.00
    END
FROM assets;

-- 生成后续日期的价格变动
-- 使用递归CTE生成日期序列（MySQL 8.0+）
-- 对于MySQL 5.7，使用临时表方法

-- 创建临时日期表
CREATE TEMPORARY TABLE date_sequence (
    date_val DATE,
    day_num INT
);

-- 插入2025年7月和8月的所有日期
INSERT INTO date_sequence (date_val, day_num)
SELECT 
    DATE_ADD('2025-07-01', INTERVAL (numbers.n - 1) DAY) as date_val,
    numbers.n as day_num
FROM (
    SELECT 1 as n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
    SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
    SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
    SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
    SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION
    SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30 UNION
    SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35 UNION
    SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40 UNION
    SELECT 41 UNION SELECT 42 UNION SELECT 43 UNION SELECT 44 UNION SELECT 45 UNION
    SELECT 46 UNION SELECT 47 UNION SELECT 48 UNION SELECT 49 UNION SELECT 50 UNION
    SELECT 51 UNION SELECT 52 UNION SELECT 53 UNION SELECT 54 UNION SELECT 55 UNION
    SELECT 56 UNION SELECT 57 UNION SELECT 58 UNION SELECT 59 UNION SELECT 60 UNION
    SELECT 61 UNION SELECT 62
) numbers
WHERE DATE_ADD('2025-07-01', INTERVAL (numbers.n - 1) DAY) <= '2025-08-31';

-- 为每个资产生成价格序列
INSERT INTO price_daily (asset_id, date, price)
SELECT 
    a.id,
    d.date_val,
    CASE
        -- 现金：始终为1.0
        WHEN a.code = 'CASH001' THEN 1.0
        
        -- 股票：基于前一日价格，每日变动±5%
        WHEN a.asset_type_id = 2 THEN
            ROUND(
                (SELECT COALESCE(
                    (SELECT price FROM price_daily pd2 
                     WHERE pd2.asset_id = a.id 
                     AND pd2.date = DATE_SUB(d.date_val, INTERVAL 1 DAY)
                     LIMIT 1), 
                    -- 如果没有前一天的价格，使用基准价格
                    CASE a.code
                        WHEN 'AAPL' THEN 180.00 WHEN 'MSFT' THEN 420.00 WHEN 'AMZN' THEN 140.00
                        WHEN 'GOOGL' THEN 160.00 WHEN 'GOOG' THEN 155.00 WHEN 'TSLA' THEN 250.00
                        WHEN 'META' THEN 350.00 WHEN 'NVDA' THEN 800.00 WHEN 'BRK.B' THEN 380.00
                        WHEN 'UNH' THEN 520.00 WHEN 'V' THEN 280.00 WHEN 'JNJ' THEN 160.00
                        WHEN 'PG' THEN 150.00 WHEN 'JPM' THEN 180.00 WHEN 'MA' THEN 400.00
                        WHEN 'HD' THEN 320.00 WHEN 'XOM' THEN 110.00 WHEN 'CVX' THEN 150.00
                        WHEN 'PFE' THEN 30.00 WHEN 'ABBV' THEN 160.00 WHEN 'KO' THEN 60.00
                        WHEN 'PEP' THEN 170.00 WHEN 'INTC' THEN 35.00 WHEN 'WMT' THEN 65.00
                        WHEN 'CSCO' THEN 50.00 WHEN 'ADBE' THEN 500.00 WHEN 'NFLX' THEN 600.00
                        WHEN 'CRM' THEN 220.00 WHEN 'ORCL' THEN 120.00 WHEN 'QCOM' THEN 140.00
                        WHEN 'TXN' THEN 160.00 WHEN 'COST' THEN 800.00 WHEN 'AVGO' THEN 1200.00
                        WHEN 'TMO' THEN 550.00 WHEN 'ABT' THEN 110.00 WHEN 'VZ' THEN 40.00
                        WHEN 'T' THEN 15.00 WHEN 'BMY' THEN 45.00 WHEN 'GS' THEN 380.00
                        WHEN 'C' THEN 60.00 WHEN 'GE' THEN 120.00 WHEN 'AXP' THEN 200.00
                        WHEN 'LMT' THEN 450.00 WHEN 'MMM' THEN 90.00 WHEN 'F' THEN 12.00
                        WHEN 'BA' THEN 200.00 WHEN 'SBUX' THEN 90.00 WHEN 'MCD' THEN 280.00
                        WHEN 'NKE' THEN 100.00 WHEN 'TGT' THEN 140.00 ELSE 100.00
                    END
                )) * (1 + (RAND() * 0.1 - 0.05)), 2)
        
        -- 债券：基于前一日价格，每日变动±1%（债券波动较小）
        WHEN a.asset_type_id = 3 THEN
            ROUND(
                (SELECT COALESCE(
                    (SELECT price FROM price_daily pd2 
                     WHERE pd2.asset_id = a.id 
                     AND pd2.date = DATE_SUB(d.date_val, INTERVAL 1 DAY)
                     LIMIT 1), 
                    100.00
                )) * (1 + (RAND() * 0.02 - 0.01)), 2)
        
        -- 加密货币：基于前一日价格，每日变动±10%（高波动）
        WHEN a.asset_type_id = 4 THEN
            ROUND(
                (SELECT COALESCE(
                    (SELECT price FROM price_daily pd2 
                     WHERE pd2.asset_id = a.id 
                     AND pd2.date = DATE_SUB(d.date_val, INTERVAL 1 DAY)
                     LIMIT 1), 
                    CASE a.code
                        WHEN 'CRYPTO001' THEN 45000.00 WHEN 'CRYPTO002' THEN 2500.00
                        WHEN 'CRYPTO003' THEN 0.50 WHEN 'CRYPTO004' THEN 80.00
                        WHEN 'CRYPTO005' THEN 0.45 ELSE 1.00
                    END
                )) * (1 + (RAND() * 0.2 - 0.1)), 2)
        
        -- 外汇：基于前一日价格，每日变动±2%
        WHEN a.asset_type_id = 5 THEN
            ROUND(
                (SELECT COALESCE(
                    (SELECT price FROM price_daily pd2 
                     WHERE pd2.asset_id = a.id 
                     AND pd2.date = DATE_SUB(d.date_val, INTERVAL 1 DAY)
                     LIMIT 1), 
                    CASE a.code
                        WHEN 'FX001' THEN 1.08 WHEN 'FX002' THEN 160.00 WHEN 'FX003' THEN 1.30
                        WHEN 'FX004' THEN 0.95 WHEN 'FX005' THEN 1.35 WHEN 'FX006' THEN 1.65
                        WHEN 'FX007' THEN 7.25 WHEN 'FX008' THEN 10.50 WHEN 'FX009' THEN 1.60
                        WHEN 'FX010' THEN 1300.00 ELSE 1.00
                    END
                )) * (1 + (RAND() * 0.04 - 0.02)), 4)
        
        -- 期货：基于前一日价格，每日变动±3%
        WHEN a.asset_type_id = 6 THEN
            ROUND(
                (SELECT COALESCE(
                    (SELECT price FROM price_daily pd2 
                     WHERE pd2.asset_id = a.id 
                     AND pd2.date = DATE_SUB(d.date_val, INTERVAL 1 DAY)
                     LIMIT 1), 
                    CASE a.code
                        WHEN 'FUT001' THEN 5200.00 WHEN 'FUT002' THEN 75.00 WHEN 'FUT003' THEN 2200.00
                        WHEN 'FUT004' THEN 3.20 WHEN 'FUT005' THEN 4.50 WHEN 'FUT006' THEN 95.50
                        WHEN 'FUT007' THEN 25.00 WHEN 'FUT008' THEN 4.20 WHEN 'FUT009' THEN 6.80
                        WHEN 'FUT010' THEN 45000.00 ELSE 100.00
                    END
                )) * (1 + (RAND() * 0.06 - 0.03)), 2)
        
        ELSE 100.00
    END
FROM assets a
CROSS JOIN date_sequence d
WHERE d.date_val > '2025-07-01'  -- 跳过第一天（已经插入）
ORDER BY a.id, d.date_val;

-- 清理临时表
DROP TEMPORARY TABLE date_sequence;

-- 验证数据完整性
SELECT 
    'Price data summary' as info,
    COUNT(*) as total_records,
    COUNT(DISTINCT asset_id) as unique_assets,
    COUNT(DISTINCT date) as unique_dates,
    MIN(date) as start_date,
    MAX(date) as end_date
FROM price_daily;

-- 显示每种资产类型的价格范围示例
SELECT 
    at.name as asset_type,
    COUNT(DISTINCT a.id) as asset_count,
    ROUND(MIN(pd.price), 2) as min_price,
    ROUND(MAX(pd.price), 2) as max_price,
    ROUND(AVG(pd.price), 2) as avg_price
FROM price_daily pd
JOIN assets a ON pd.asset_id = a.id
JOIN asset_types at ON a.asset_type_id = at.id
GROUP BY at.id, at.name
ORDER BY at.id;

-- 重新启用安全更新模式
SET SQL_SAFE_UPDATES = 1; 