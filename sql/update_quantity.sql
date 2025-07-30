-- 使用 WHERE id > 1 来排除第一个记录
UPDATE assets 
SET quantity = 0
WHERE id > 1;

-- 设置cash为 500000
UPDATE assets 
SET quantity = 500000
WHERE id = 1;