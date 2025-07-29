/**
 * 资产持仓分析测试示例
 * 
 * 使用说明：
 * 1. 确保数据库中有测试数据（资产、交易记录、价格数据）
 * 2. 启动服务器
 * 3. 使用以下API进行测试
 */

// 测试用例1：获取完整的持仓分析
// GET /api/analysis/asset-holding?asset_id=1&start_date=2024-01-01&end_date=2024-01-31

// 测试用例2：获取简要持仓分析
// GET /api/analysis/asset-holding/summary?asset_id=1&start_date=2024-01-01&end_date=2024-01-31

// 示例响应数据结构：
const exampleResponse = {
  "success": true,
  "data": {
    "asset_info": {
      "id": 1,
      "name": "Apple Inc.",
      "symbol": "AAPL",
      "asset_type_name": "股票",
      "unit": "股"
    },
    "analysis_period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "days": 31
    },
    "holding_analysis": {
      "initial_holding": 100,
      "final_holding": 150,
      "total_change": 50,
      "daily_analysis": [
        {
          "date": "2024-01-01",
          "holding_start": "100.00",
          "holding_end": "100.00",
          "change": "0.00",
          "transactions": [],
          "price": "$150.00",
          "market_value": "$15,000.00",
          "has_transactions": false,
          "transactions_count": 0
        },
        {
          "date": "2024-01-02",
          "holding_start": "100.00",
          "holding_end": "150.00",
          "change": "50.00",
          "transactions": [
            {
              "id": 123,
              "type": "IN",
              "quantity": "50.00",
              "price": "$148.50",
              "total_value": "$7,425.00",
              "description": "购买股票"
            }
          ],
          "price": "$148.50",
          "market_value": "$22,275.00",
          "has_transactions": true,
          "transactions_count": 1
        }
        // ... 更多日期
      ],
      "period_summary": {
        "total_buy_transactions": 3,
        "total_sell_transactions": 1,
        "total_buy_quantity": "75.00",
        "total_sell_quantity": "25.00",
        "average_buy_price": "$149.33",
        "average_sell_price": "$152.00"
      }
    },
    "summary": {
      "initial_holding": "100.00",
      "final_holding": "150.00",
      "total_change": "50.00",
      "transactions_count": 4,
      "price_data_points": 31
    }
  }
};

// 错误情况测试：
// 1. 缺少必需参数
// GET /api/analysis/asset-holding?asset_id=1&start_date=2024-01-01
// 应返回：400 Bad Request

// 2. 无效的资产ID
// GET /api/analysis/asset-holding?asset_id=invalid&start_date=2024-01-01&end_date=2024-01-31
// 应返回：400 Bad Request

// 3. 无效的日期格式
// GET /api/analysis/asset-holding?asset_id=1&start_date=invalid-date&end_date=2024-01-31
// 应返回：400 Bad Request

// 4. 不存在的资产
// GET /api/analysis/asset-holding?asset_id=99999&start_date=2024-01-01&end_date=2024-01-31
// 应返回：400 Bad Request with "Asset not found" message

export default exampleResponse;
