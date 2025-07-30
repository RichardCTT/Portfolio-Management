/**
 * 测试每日现金余额功能
 * Test for daily cash balance functionality
 */

import { getDailyCashBalance } from '../service/analysisService.js';

/**
 * 测试获取每日现金余额
 */
async function testGetDailyCashBalance() {
  console.log('🧪 Testing getDailyCashBalance...');
  
  try {
    // 测试默认30天
    console.log('\n📊 Testing default 30 days...');
    const result30 = await getDailyCashBalance();
    
    if (result30.success) {
      console.log('✅ 30-day test passed');
      console.log(`📅 Period: ${result30.data.analysis_period.start_date} to ${result30.data.analysis_period.end_date}`);
      console.log(`💰 Initial: ${result30.data.initial_holding}`);
      console.log(`💰 Final: ${result30.data.final_holding}`);
      console.log(`📈 Change: ${result30.data.total_change}`);
      console.log(`📋 Total transactions: ${result30.data.summary.total_transactions}`);
      console.log(`🎯 Days with activity: ${result30.data.summary.days_with_activity}`);
      
      // 显示最近几天的数据示例
      console.log('\n📋 Sample daily data (last 3 days):');
      const recentDays = result30.data.daily_balances.slice(-3);
      recentDays.forEach(day => {
        console.log(`  ${day.date}: ${day.holding_end} (${day.transactions_count} transactions)`);
      });
    } else {
      console.error('❌ 30-day test failed:', result30.error);
    }
    
    // 测试7天
    console.log('\n📊 Testing 7 days...');
    const result7 = await getDailyCashBalance(7);
    
    if (result7.success) {
      console.log('✅ 7-day test passed');
      console.log(`📅 Period: ${result7.data.analysis_period.start_date} to ${result7.data.analysis_period.end_date}`);
      console.log(`💰 Initial: ${result7.data.initial_holding}`);
      console.log(`💰 Final: ${result7.data.final_holding}`);
      console.log(`📈 Change: ${result7.data.total_change}`);
      
      // 显示所有7天的数据
      console.log('\n📋 All 7 days data:');
      result7.data.daily_balances.forEach(day => {
        const status = day.has_transactions ? '📈' : '➖';
        console.log(`  ${status} ${day.date}: ${day.holding_end} (change: ${day.daily_change})`);
      });
    } else {
      console.error('❌ 7-day test failed:', result7.error);
    }
    
    // 测试1天（今天）
    console.log('\n📊 Testing 1 day (today only)...');
    const result1 = await getDailyCashBalance(1);
    
    if (result1.success) {
      console.log('✅ 1-day test passed');
      const today = result1.data.daily_balances[0];
      console.log(`📅 Today (${today.date}):`);
      console.log(`  💰 Start: ${today.holding_start}`);
      console.log(`  💰 End: ${today.holding_end}`);
      console.log(`  📈 Change: ${today.daily_change}`);
      console.log(`  📋 Transactions: ${today.transactions_count}`);
      
      if (today.has_transactions) {
        console.log('  📝 Today\'s transactions:');
        today.transactions.forEach((tx, index) => {
          console.log(`    ${index + 1}. ${tx.type}: ${tx.quantity} - ${tx.description}`);
        });
      } else {
        console.log('  ℹ️  No transactions today');
      }
    } else {
      console.error('❌ 1-day test failed:', result1.error);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error.message);
  }
}

/**
 * 测试边界情况
 */
async function testEdgeCases() {
  console.log('\n🧪 Testing edge cases...');
  
  try {
    // 测试0天（应该失败）
    console.log('Testing 0 days (should handle gracefully)...');
    const result0 = await getDailyCashBalance(0);
    
    if (!result0.success) {
      console.log('✅ Zero days handled correctly:', result0.error);
    } else {
      console.log('⚠️  Zero days test unexpected result');
    }
    
    // 测试大数值
    console.log('Testing 90 days...');
    const result90 = await getDailyCashBalance(90);
    
    if (result90.success) {
      console.log('✅ 90-day test passed');
      console.log(`📅 Period: ${result90.data.analysis_period.start_date} to ${result90.data.analysis_period.end_date}`);
      console.log(`📋 Total days: ${result90.data.analysis_period.actual_days}`);
      console.log(`🎯 Days with activity: ${result90.data.summary.days_with_activity}`);
    } else {
      console.log('❌ 90-day test failed:', result90.error);
    }
    
  } catch (error) {
    console.error('💥 Edge case test error:', error.message);
  }
}

/**
 * 验证数据格式
 */
function validateDataFormat(result) {
  console.log('\n🧪 Validating data format...');
  
  if (!result.success) {
    console.log('❌ Result is not successful');
    return false;
  }
  
  const { data } = result;
  
  // 检查必需字段
  const requiredFields = [
    'asset_info',
    'analysis_period', 
    'initial_holding',
    'final_holding',
    'total_change',
    'daily_balances',
    'summary'
  ];
  
  const missingFields = requiredFields.filter(field => !(field in data));
  
  if (missingFields.length > 0) {
    console.log('❌ Missing required fields:', missingFields);
    return false;
  }
  
  // 检查daily_balances格式
  if (!Array.isArray(data.daily_balances)) {
    console.log('❌ daily_balances is not an array');
    return false;
  }
  
  // 检查第一个daily_balance的格式
  if (data.daily_balances.length > 0) {
    const firstDay = data.daily_balances[0];
    const requiredDayFields = [
      'date',
      'holding_start',
      'holding_end', 
      'daily_change',
      'transactions',
      'transactions_count',
      'has_transactions'
    ];
    
    const missingDayFields = requiredDayFields.filter(field => !(field in firstDay));
    
    if (missingDayFields.length > 0) {
      console.log('❌ Missing daily balance fields:', missingDayFields);
      return false;
    }
  }
  
  console.log('✅ Data format validation passed');
  return true;
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Running Daily Cash Balance Tests...\n');
  
  testGetDailyCashBalance()
    .then(() => testEdgeCases())
    .then(() => console.log('\n✅ All tests completed!'))
    .catch(error => console.error('\n💥 Test suite failed:', error));
}

export { testGetDailyCashBalance, testEdgeCases, validateDataFormat };
