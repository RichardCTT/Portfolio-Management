// 插入交易测试脚本
// 该脚本用于模拟随机的买入和卖出交易操作，测试交易接口的稳定性和正确性
// 主要功能包括:
// 1. 生成随机的交易数据(资产ID、数量、日期、描述等)
// 2. 调用买入/卖出接口执行交易
// 3. 统计交易成功和失败的情况
// 4. 提供执行过程中的详细日志信息

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
function generateTransactionData() {
  // 随机选择资产ID (修改为1-80)
  const asset_id = Math.floor(Math.random() * 80) + 1;
  
  // 随机生成数量 (修改为1-5之间)，并确保是整数类型
  let quantity = Math.floor(Math.random() * 5) + 1;
  quantity = parseInt(quantity); // 确保 quantity 是整数类型
  
  // 生成最近30天内的随机日期
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const randomDate = new Date(startDate.getTime() + Math.random() * (new Date().getTime() - startDate.getTime()));
  const date = randomDate.toISOString().split('T')[0]; // YYYY-MM-DD格式
  
  // 随机选择交易类型：买入或卖出
  const isBuy = Math.random() > 0.5;
  const transactionType = isBuy ? 'buy' : 'sell';
  
  // 生成随机描述
  const descriptions = isBuy ?
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

// 主函数 - 执行80次随机买入或卖出操作（根据实际循环次数）
async function main() {
  console.log('开始执行80次随机买入或卖出操作...');
  
  let successCount = 0;
  let failCount = 0;
  let buyCount = 0;
  let sellCount = 0;
  
  for (let i = 1; i <= 80; i++) {
    try {
      // 生成随机交易数据
      const transactionData = generateTransactionData();
      
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