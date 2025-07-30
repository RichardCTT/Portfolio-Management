/**
 * 测试精确到秒的交易时间戳功能
 * Test for precise transaction timestamp functionality
 */

// 示例测试数据
const testData = {
  // 测试买入交易
  buyTransaction: {
    asset_id: 2, // 假设是股票资产
    quantity: 10.5,
    date: new Date().toISOString(), // 精确到秒的时间戳
    description: "测试买入交易 - 精确时间戳"
  },
  
  // 测试卖出交易
  sellTransaction: {
    asset_id: 2,
    quantity: 5.0,
    date: new Date(Date.now() + 5000).toISOString(), // 5秒后的时间戳
    description: "测试卖出交易 - 精确时间戳"
  },
  
  // 测试不同格式的时间
  timeFormats: [
    new Date().toISOString(), // 标准ISO格式
    new Date().toISOString().slice(0, 19) + 'Z', // 去掉毫秒
    new Date().toLocaleString('sv-SE'), // YYYY-MM-DD HH:mm:ss格式
  ]
};

/**
 * 测试时间戳格式化函数
 */
function testTimestampFormatting() {
  console.log('🧪 Testing timestamp formatting...');
  
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
  
  console.log('Original Date:', now);
  console.log('Formatted Timestamp:', timestamp);
  console.log('Expected Format: YYYY-MM-DD HH:mm:ss');
  
  // 验证格式是否正确
  const formatRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  const isValidFormat = formatRegex.test(timestamp);
  
  console.log('✅ Format validation:', isValidFormat ? 'PASSED' : 'FAILED');
  
  return {
    originalDate: now,
    timestamp,
    isValidFormat
  };
}

/**
 * 测试日期提取函数
 */
function testDateExtraction() {
  console.log('🧪 Testing date extraction...');
  
  const testDateTime = new Date('2025-07-29T14:30:15.123Z');
  const dateOnly = testDateTime.toISOString().split('T')[0];
  
  console.log('Full DateTime:', testDateTime.toISOString());
  console.log('Date Only:', dateOnly);
  console.log('Expected: 2025-07-29');
  
  const isCorrect = dateOnly === '2025-07-29';
  console.log('✅ Date extraction:', isCorrect ? 'PASSED' : 'FAILED');
  
  return {
    fullDateTime: testDateTime.toISOString(),
    dateOnly,
    isCorrect
  };
}

/**
 * 生成测试用的交易数据
 */
function generateTestTransactionData() {
  const baseTime = new Date();
  
  return {
    // 当前时间的交易
    currentTime: {
      asset_id: 2,
      quantity: 10.0,
      date: baseTime.toISOString(),
      description: "当前时间交易测试"
    },
    
    // 指定精确时间的交易
    specificTime: {
      asset_id: 2,
      quantity: 5.0,
      date: new Date('2025-07-29T09:30:00.000Z').toISOString(),
      description: "指定时间交易测试"
    },
    
    // 不指定时间的交易（应该使用当前时间）
    noTime: {
      asset_id: 2,
      quantity: 3.0,
      description: "无指定时间交易测试"
    },
    
    // 各种时间格式测试
    differentFormats: [
      '2025-07-29T14:30:15Z',
      '2025-07-29T14:30:15.000Z',
      '2025-07-29 14:30:15',
      new Date().toISOString()
    ]
  };
}

/**
 * 模拟API请求测试
 */
async function simulateAPITest() {
  console.log('🧪 Simulating API request tests...');
  
  const testCases = generateTestTransactionData();
  
  // 测试买入API调用格式
  console.log('📋 Buy Transaction Test Data:');
  console.log(JSON.stringify(testCases.currentTime, null, 2));
  
  // 测试卖出API调用格式
  console.log('📋 Sell Transaction Test Data:');
  console.log(JSON.stringify(testCases.specificTime, null, 2));
  
  // 测试无时间参数的情况
  console.log('📋 No Time Parameter Test Data:');
  console.log(JSON.stringify(testCases.noTime, null, 2));
  
  return testCases;
}

/**
 * 验证时间戳存储格式
 */
function validateTimestampStorage() {
  console.log('🧪 Validating timestamp storage format...');
  
  // 模拟不同输入格式
  const inputs = [
    '2025-07-29T14:30:15Z',
    '2025-07-29T14:30:15.123Z',
    '2025-07-29 14:30:15',
    new Date().toISOString()
  ];
  
  inputs.forEach((input, index) => {
    const date = new Date(input);
    const timestamp = date.toISOString().slice(0, 19).replace('T', ' ');
    
    console.log(`Test ${index + 1}:`);
    console.log(`  Input: ${input}`);
    console.log(`  Stored: ${timestamp}`);
    console.log(`  Valid: ${!isNaN(date.getTime())}`);
    console.log('---');
  });
}

// 运行所有测试
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Running Transaction Timestamp Tests...\n');
  
  testTimestampFormatting();
  console.log('');
  
  testDateExtraction();
  console.log('');
  
  simulateAPITest();
  console.log('');
  
  validateTimestampStorage();
  
  console.log('✅ All tests completed!');
}

export {
  testTimestampFormatting,
  testDateExtraction,
  generateTestTransactionData,
  simulateAPITest,
  validateTimestampStorage
};
