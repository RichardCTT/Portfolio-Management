# 资产持仓分析功能

## 功能概述

资产持仓分析功能允许用户查询指定资产在特定时间范围内的持仓变化和对应的市值变化。该功能提供详细的每日分析和期间汇总信息。

## API 接口

### 1. 完整持仓分析

**接口:** `GET /api/analysis/asset-holding`

**参数:**
- `asset_id` (必需): 资产ID，整数
- `start_date` (必需): 开始日期，格式 YYYY-MM-DD
- `end_date` (必需): 结束日期，格式 YYYY-MM-DD

**功能特点:**
- 获取完整的每日持仓变化分析
- 包含每日交易明细
- 提供市值计算（基于当日价格）
- 计算期间汇总统计

### 2. 简要持仓分析

**接口:** `GET /api/analysis/asset-holding/summary`

**参数:** 同上

**功能特点:**
- 获取期间汇总信息
- 不包含每日详细分析
- 响应数据量更小，适合快速查询

## 返回数据结构

### 资产信息 (asset_info)
```json
{
  "id": 1,
  "name": "Apple Inc.",
  "symbol": "AAPL",
  "asset_type_name": "股票",
  "unit": "股"
}
```

### 分析期间 (analysis_period)
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "days": 31
}
```

### 持仓分析 (holding_analysis)

#### 基本信息
- `initial_holding`: 期初持仓量
- `final_holding`: 期末持仓量
- `total_change`: 总变化量

#### 每日分析 (daily_analysis) - 仅完整分析包含
每日记录包含：
- `date`: 日期
- `holding_start`: 日开始持仓
- `holding_end`: 日结束持仓
- `change`: 当日变化量
- `transactions`: 当日交易明细
- `price`: 当日价格
- `market_value`: 当日市值
- `has_transactions`: 是否有交易
- `transactions_count`: 交易数量

#### 期间汇总 (period_summary)
- `total_buy_transactions`: 买入交易次数
- `total_sell_transactions`: 卖出交易次数
- `total_buy_quantity`: 总买入数量
- `total_sell_quantity`: 总卖出数量
- `average_buy_price`: 平均买入价格
- `average_sell_price`: 平均卖出价格

### 汇总信息 (summary)
- `initial_holding`: 期初持仓（格式化）
- `final_holding`: 期末持仓（格式化）
- `total_change`: 总变化量（格式化）
- `transactions_count`: 交易总数
- `price_data_points`: 价格数据点数

## 使用示例

### cURL 示例
```bash
# 获取完整分析
curl "http://localhost:3000/api/analysis/asset-holding?asset_id=1&start_date=2024-01-01&end_date=2024-01-31"

# 获取简要分析
curl "http://localhost:3000/api/analysis/asset-holding/summary?asset_id=1&start_date=2024-01-01&end_date=2024-01-31"
```

### JavaScript 示例
```javascript
// 使用 fetch API
const response = await fetch('/api/analysis/asset-holding?asset_id=1&start_date=2024-01-01&end_date=2024-01-31');
const data = await response.json();

if (data.success) {
  console.log('持仓分析结果:', data.data);
} else {
  console.error('分析失败:', data.error);
}
```

## 错误处理

### 常见错误码
- `400 Bad Request`: 参数错误或资产不存在
- `500 Internal Server Error`: 服务器内部错误

### 错误响应格式
```json
{
  "success": false,
  "error": "错误描述",
  "data": null
}
```

## 数据精度说明

- **金额**: 保留2位小数，使用财务精度处理
- **数量**: 动态精度，根据资产类型调整
- **百分比**: 保留2位小数

## 时区处理

- 所有日期处理使用UTC时区
- 数据库查询使用DATE()函数确保日期准确性
- 支持跨时区的数据一致性

## 性能优化

- 使用索引优化的SQL查询
- 支持大数据量的分页处理
- 缓存常用查询结果（可选）

## 依赖关系

### 核心依赖
- `analysisService.js`: 核心分析逻辑
- `dateUtils.js`: 日期处理工具
- `financial.js`: 财务计算工具
- `database.js`: 数据库连接

### 数据库表依赖
- `assets`: 资产基本信息
- `asset_types`: 资产类型信息
- `transactions`: 交易记录
- `price_daily`: 每日价格数据

## 扩展功能

该分析服务可以扩展支持：
- 多资产组合分析
- 收益率计算
- 风险指标分析
- 趋势分析
- 对比分析

## 注意事项

1. **数据完整性**: 确保交易记录和价格数据的完整性
2. **日期范围**: 建议查询范围不超过1年，避免性能问题
3. **权限控制**: 生产环境需要添加用户权限验证
4. **监控**: 建议添加查询性能监控和异常告警
