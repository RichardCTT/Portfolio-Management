// 插入交易测试脚本
// 该脚本用于模拟买入和卖出交易操作，测试交易接口的稳定性和正确性
// 主要功能包括:
// 1. 生成交易数据(资产ID、数量、日期、描述等)
// 2. 调用买入/卖出接口执行交易
// 3. 统计交易成功和失败的情况
// 4. 提供执行过程中的详细日志信息
// 5. 日期递增模式，从25天前开始，每天递增
// 6. 排除asset_id为1的情况，范围2-80
// 7. 交易策略：前40次强制买入，后40次随机买入或卖出

import axios from 'axios';

// 配置基础URL - 请根据你的实际服务地址修改
const BASE_URL = 'http://localhost:3000/api/transactions';

// 创建axios实例
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 生成随机买入或卖出数据的函数
// 参数: currentDate - 当前日期对象，用于生成递增的日期
// 参数: isFirstHalf - 是否为前半段（强制买入）
function generateTransactionData(currentDate, transactionIndex) {
  // 资产ID逻辑：
  // 前85次：asset_id从2到86，确保每个资产至少有一次买入
  // 后75次：asset_id从2到86之间随机选择
  let asset_id;
  if (transactionIndex <= 85) {
    asset_id = transactionIndex + 1; // 2-86
  } else {
    asset_id = Math.floor(Math.random() * 85) + 2; // 2-86
  }
  
  // 交易类型逻辑：
  // 前85次：强制买入
  // 后75次：随机买入或卖出
  let transactionType;
  if (transactionIndex <= 85) {
    transactionType = 'buy';
  } else {
    const isBuy = Math.random() > 0.5;
    transactionType = isBuy ? 'buy' : 'sell';
  }
  
  // 根据交易类型生成不同的数量范围
  let quantity;
  if (transactionType === 'buy') {
    // 买入：1-5之间的随机数量
    quantity = Math.floor(Math.random() * 5) + 1;
  } else {
    // 卖出：1-2之间的随机数量（尽量小）
    quantity = Math.floor(Math.random() * 2) + 1;
  }
  quantity = parseInt(quantity); // 确保 quantity 是整数类型
  
  const date = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD格式
  
  // 生成随机描述
  const descriptions = transactionType === 'buy' ?
    ['月度投资计划购买', '市场低位补仓', '定投购买', '看好后市加仓', '分散投资配置'] :
    ['止盈卖出', '止损卖出', '资金调配', '调整仓位', '获利了结'];
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];
  
  return {
    asset_id,
    quantity,
    date,
    description,
    transactionType
  };
}

// 调用交易接口的通用函数
async function callTransactionAPI(transactionData, index) {
  try {
    const url = `/${transactionData.transactionType}`;
    const response = await api.post(url, {
      asset_id: transactionData.asset_id,
      quantity: transactionData.quantity,
      date: transactionData.date,
      description: transactionData.description
    });
    console.log(`第${index}次${transactionData.transactionType}成功:`, {
      asset_id: transactionData.asset_id,
      quantity: transactionData.quantity,
      date: transactionData.date,
      message: response.data.message
    });
    return response.data;
  } catch (error) {
    console.error(`第${index}次${transactionData.transactionType}失败:`, {
      asset_id: transactionData.asset_id,
      quantity: transactionData.quantity,
      date: transactionData.date,
      error: error.response?.data || error.message
    });
    throw error;
  }
}

// 主函数 - 执行160次交易操作（日期递增模式）
// 前85次：针对asset_id 2-86，只买入
// 后75次：针对asset_id 2-86，随机买入或卖出
// 日期逻辑：每10次交易后递增一天，让多个交易在同一天进行
async function main() {
  console.log('开始执行交易操作...');
  
  let successCount = 0;
  let failCount = 0;
  let buyCount = 0;
  let sellCount = 0;
  
  // 设置起始日期为29天前
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 29);
  
  for (let i = 1; i <=160; i++) {
    try {
      // 生成随机交易数据，传入当前日期和交易索引
      const transactionData = generateTransactionData(currentDate, i);
      
      // 调用相应接口
      await callTransactionAPI(transactionData, i);
      
      if (transactionData.transactionType === 'buy') {
        buyCount++;
      } else {
        sellCount++;
      }
      
      successCount++;
    } catch (error) {
      failCount++;
    }
    
    // 每6次交易后日期递增到下一天（让多个交易在同一天进行）
    if (i % 6 === 0) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // 添加延迟避免请求过于频繁(100ms)
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n执行完成:');
  console.log(`成功: ${successCount}次`);
  console.log(`失败: ${failCount}次`);
  console.log(`买入: ${buyCount}次`);
  console.log(`卖出: ${sellCount}次`);
}

// 执行主函数
main().catch(error => {
  console.error('执行过程中发生错误:', error);
});