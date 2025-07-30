import { query } from '../config/database.js';
import {
  validateDateRange,
  formatDateForMySQL,
  processDateFields
} from '../utils/dateUtils.js';
import {
  formatCurrency,
  formatQuantity,
  calculateTotal
} from '../utils/financial.js';

/**
 * 分析服务 - 资产持仓和市值分析
 */

/**
 * 获取资产在指定时间范围内的持仓变化和市值
 * @param {number} assetId - 资产ID
 * @param {string} startDate - 开始日期 (YYYY-MM-DD)
 * @param {string} endDate - 结束日期 (YYYY-MM-DD)
 * @returns {Object} 分析结果
 */
export async function getAssetHoldingAnalysis(assetId, startDate, endDate) {
  try {
    // 1. 验证输入参数
    if (!assetId || !startDate || !endDate) {
      throw new Error('Missing required parameters: assetId, startDate, endDate');
    }

    // 验证日期格式和范围
    const dateValidation = validateDateRange(startDate, endDate);
    if (!dateValidation.isValid) {
      throw new Error(`Date validation failed: ${dateValidation.errors.join('; ')}`);
    }

    // 格式化日期
    const formattedStartDate = formatDateForMySQL(startDate);
    const formattedEndDate = formatDateForMySQL(endDate);

    // 2. 获取资产基本信息
    const assetInfo = await getAssetInfo(assetId);
    if (!assetInfo) {
      throw new Error(`Asset with ID ${assetId} not found`);
    }

    // 3. 获取时间范围内的交易记录
    const transactions = await getTransactionsInRange(assetId, formattedStartDate, formattedEndDate);

    // 4. 获取时间范围内的价格数据
    const priceData = await getPriceDataInRange(assetId, formattedStartDate, formattedEndDate);

    // 5. 计算期初持仓（在开始日期之前的最后一次交易后的持仓）
    const initialHolding = await getHoldingBeforeDate(assetId, formattedStartDate);

    // 6. 分析持仓变化
    const holdingAnalysis = analyzeHoldingChanges(
      initialHolding,
      transactions,
      priceData,
      formattedStartDate,
      formattedEndDate
    );

    return {
      success: true,
      data: {
        asset_info: assetInfo,
        analysis_period: {
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          days: calculateDaysBetween(formattedStartDate, formattedEndDate) + 1
        },
        holding_analysis: holdingAnalysis,
        summary: {
          initial_holding: formatQuantity(initialHolding),
          final_holding: formatQuantity(holdingAnalysis.final_holding),
          total_change: formatQuantity(holdingAnalysis.total_change),
          transactions_count: transactions.length,
          price_data_points: priceData.length
        }
      }
    };

  } catch (error) {
    console.error('Asset holding analysis failed:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * 获取资产基本信息
 * @param {number} assetId - 资产ID
 * @returns {Object} 资产信息
 */
async function getAssetInfo(assetId) {
  const sql = `
    SELECT a.*, at.name as asset_type_name, at.unit
    FROM assets a
    JOIN asset_types at ON a.asset_type_id = at.id
    WHERE a.id = ?
  `;

  const results = await query(sql, [assetId]);
  return results.length > 0 ? results[0] : null;
}

/**
 * 获取指定时间范围内的交易记录
 * @param {number} assetId - 资产ID
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {Array} 交易记录数组
 */
async function getTransactionsInRange(assetId, startDate, endDate) {
  const sql = `
    SELECT *
    FROM transactions
    WHERE asset_id = ?
    AND DATE(transaction_date) >= DATE(?)
    AND DATE(transaction_date) <= DATE(?)
    ORDER BY transaction_date ASC, id ASC
  `;

  const results = await query(sql, [assetId, startDate, endDate]);
  return processDateFields(results, ['transaction_date']);
}

/**
 * 获取指定时间范围内的价格数据
 * @param {number} assetId - 资产ID
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {Array} 价格数据数组
 */
async function getPriceDataInRange(assetId, startDate, endDate) {
  const sql = `
    SELECT *
    FROM price_daily
    WHERE asset_id = ?
    AND DATE(date) >= DATE(?)
    AND DATE(date) <= DATE(?)
    ORDER BY date ASC
  `;

  const results = await query(sql, [assetId, startDate, endDate]);
  return processDateFields(results, ['date', 'create_date']);
}

/**
 * 获取指定日期之前的持仓量
 * @param {number} assetId - 资产ID
 * @param {string} date - 日期
 * @returns {number} 持仓量
 */
async function getHoldingBeforeDate(assetId, date) {
  const sql = `
    SELECT holding
    FROM transactions
    WHERE asset_id = ?
    AND DATE(transaction_date) < DATE(?)
    ORDER BY transaction_date DESC, id DESC
    LIMIT 1
  `;

  const results = await query(sql, [assetId, date]);
  return results.length > 0 ? results[0].holding : 0;
}

/**
 * 分析持仓变化
 * @param {number} initialHolding - 期初持仓
 * @param {Array} transactions - 交易记录
 * @param {Array} priceData - 价格数据
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {Object} 分析结果
 */
function analyzeHoldingChanges(initialHolding, transactions, priceData, startDate, endDate) {
  // 创建价格映射表，便于快速查找
  const priceMap = new Map();
  priceData.forEach(price => {
    priceMap.set(price.date, price.price);
  });

  // 分析每日持仓变化
  const dailyAnalysis = [];
  let currentHolding = initialHolding;

  // 获取日期范围内的所有日期
  const allDates = getDateRange(startDate, endDate);

  allDates.forEach(date => {
    const dayTransactions = transactions.filter(t => t.transaction_date === date);

    // 计算当日交易对持仓的影响
    let dayChange = 0;
    const dayTransactionDetails = [];

    dayTransactions.forEach(transaction => {
      const change = transaction.transaction_type === 'IN'
        ? transaction.quantity
        : -transaction.quantity;

      dayChange += change;
      currentHolding = transaction.holding; // 使用交易记录中的最终持仓

      dayTransactionDetails.push({
        id: transaction.id,
        type: transaction.transaction_type,
        quantity: formatQuantity(transaction.quantity),
        price: formatCurrency(transaction.price),
        total_value: formatCurrency(calculateTotal(transaction.price, transaction.quantity)),
        description: transaction.description
      });
    });

    // 获取当日价格
    const dayPrice = priceMap.get(date) || null;
    const marketValue = dayPrice ? calculateTotal(dayPrice, currentHolding) : null;

    dailyAnalysis.push({
      date,
      holding_start: formatQuantity(currentHolding - dayChange),
      holding_end: formatQuantity(currentHolding),
      change: formatQuantity(dayChange),
      transactions: dayTransactionDetails,
      price: dayPrice ? formatCurrency(dayPrice) : null,
      market_value: marketValue ? formatCurrency(marketValue) : null,
      has_transactions: dayTransactions.length > 0,
      transactions_count: dayTransactions.length
    });
  });

  return {
    initial_holding: initialHolding,
    final_holding: currentHolding,
    total_change: currentHolding - initialHolding,
    daily_analysis: dailyAnalysis,
    period_summary: {
      total_buy_transactions: transactions.filter(t => t.transaction_type === 'IN').length,
      total_sell_transactions: transactions.filter(t => t.transaction_type === 'OUT').length,
      total_buy_quantity: formatQuantity(
        transactions
          .filter(t => t.transaction_type === 'IN')
          .reduce((sum, t) => sum + t.quantity, 0)
      ),
      total_sell_quantity: formatQuantity(
        transactions
          .filter(t => t.transaction_type === 'OUT')
          .reduce((sum, t) => sum + t.quantity, 0)
      ),
      average_buy_price: calculateAveragePrice(transactions.filter(t => t.transaction_type === 'IN')),
      average_sell_price: calculateAveragePrice(transactions.filter(t => t.transaction_type === 'OUT'))
    }
  };
}

/**
 * 获取日期范围内的所有日期
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {Array} 日期数组
 */
function getDateRange(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate + 'T00:00:00.000Z');
  const lastDate = new Date(endDate + 'T00:00:00.000Z');

  while (currentDate <= lastDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return dates;
}

/**
 * 计算两个日期之间的天数
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {number} 天数
 */
function calculateDaysBetween(startDate, endDate) {
  const start = new Date(startDate + 'T00:00:00.000Z');
  const end = new Date(endDate + 'T00:00:00.000Z');
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

/**
 * 计算平均价格
 * @param {Array} transactions - 交易记录数组
 * @returns {number|null} 平均价格
 */
function calculateAveragePrice(transactions) {
  if (transactions.length === 0) return null;

  const totalValue = transactions.reduce((sum, t) => sum + calculateTotal(t.price, t.quantity), 0);
  const totalQuantity = transactions.reduce((sum, t) => sum + t.quantity, 0);

  return totalQuantity > 0 ? formatCurrency(totalValue / totalQuantity) : null;
}

/**
 * 获取从今天开始往前指定天数每天的现金余额
 * @param {number} days - 往前追溯的天数，默认30天
 * @returns {Promise<Object>} 现金余额分析结果
 */
export async function getDailyCashBalance(days = 30) {
  try {
    // 计算开始日期（从今天往前days天）
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const formattedEndDate = endDate.toISOString().split('T')[0];
    const formattedStartDate = startDate.toISOString().split('T')[0];

    // 获取现金账户ID（asset_type_id = 1）
    const cashAssetSql = `
      SELECT id, name, code 
      FROM assets 
      WHERE asset_type_id = 1 
      ORDER BY id ASC 
      LIMIT 1
    `;
    const cashAssets = await query(cashAssetSql);
    
    if (cashAssets.length === 0) {
      throw new Error('No cash asset found (asset_type_id = 1)');
    }
    
    const cashAsset = cashAssets[0];

    // 获取指定时间范围内的所有现金交易记录
    const transactionsSql = `
      SELECT quantity, holding, transaction_date, transaction_type, description
      FROM transactions 
      WHERE asset_id = ?
      AND DATE(transaction_date) >= DATE(?)
      AND DATE(transaction_date) <= DATE(?)
      ORDER BY transaction_date ASC, id ASC
    `;
    
    const transactions = await query(transactionsSql, [cashAsset.id, formattedStartDate, formattedEndDate]);

    // 获取开始日期之前的最后一次交易holding作为初始余额
    const initialHoldingSql = `
      SELECT holding
      FROM transactions
      WHERE asset_id = ?
      AND DATE(transaction_date) < DATE(?)
      ORDER BY transaction_date DESC, id DESC
      LIMIT 1
    `;
    
    const initialResults = await query(initialHoldingSql, [cashAsset.id, formattedStartDate]);
    const initialHolding = initialResults.length > 0 ? initialResults[0].holding : 0;

    // 生成每天的日期范围
    const dateRange = getDateRange(formattedStartDate, formattedEndDate);
    
    // 分析每日现金余额变化
    const dailyBalances = [];
    let currentHolding = initialHolding;

    dateRange.forEach(date => {
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.transaction_date).toISOString().split('T')[0];
        return transactionDate === date;
      });

      // 计算当日变化
      let dayChange = 0;
      const dayTransactionDetails = [];
      
      dayTransactions.forEach(transaction => {
        const change = transaction.transaction_type === 'IN' 
          ? transaction.quantity 
          : -transaction.quantity;
        
        dayChange += change;
        currentHolding = transaction.holding; // 使用交易记录中的最终holding
        
        dayTransactionDetails.push({
          type: transaction.transaction_type,
          quantity: formatCurrency(transaction.quantity),
          description: transaction.description,
          transaction_date: transaction.transaction_date
        });
      });

      dailyBalances.push({
        date,
        holding_start: formatCurrency(currentHolding - dayChange),
        holding_end: formatCurrency(currentHolding),
        daily_change: formatCurrency(dayChange),
        transactions: dayTransactionDetails,
        transactions_count: dayTransactions.length,
        has_transactions: dayTransactions.length > 0
      });
    });

    return {
      success: true,
      data: {
        asset_info: {
          id: cashAsset.id,
          name: cashAsset.name,
          code: cashAsset.code,
          type: 'Cash'
        },
        analysis_period: {
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          days: days,
          actual_days: dateRange.length
        },
        initial_holding: formatCurrency(initialHolding),
        final_holding: formatCurrency(currentHolding),
        total_change: formatCurrency(currentHolding - initialHolding),
        daily_balances: dailyBalances,
        summary: {
          total_in_amount: formatCurrency(
            transactions
              .filter(t => t.transaction_type === 'IN')
              .reduce((sum, t) => sum + t.quantity, 0)
          ),
          total_out_amount: formatCurrency(
            transactions
              .filter(t => t.transaction_type === 'OUT')
              .reduce((sum, t) => sum + t.quantity, 0)
          ),
          total_transactions: transactions.length,
          days_with_activity: dailyBalances.filter(d => d.has_transactions).length
        }
      }
    };

  } catch (error) {
    console.error('Error fetching daily cash balance:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

export function getMonthlyCashBalance() {
  query(`select quantity, holding, transaction_date 
    from transactions 
    where asset_id = 1
    order by transaction_date asc`)
    .then((results) => {
      return results.map(row => ({
        quantity: formatQuantity(row.quantity),
        holding: formatQuantity(row.holding),
        transaction_date: row.transaction_date
      }));
    }
    ).then(cashBalances => {
      // 处理获取到的现金余额数据
      
      cashBalances.forEach(balance => {
        console.log('Transaction Date:', balance.transaction_date);
        console.log('Quantity:', balance.quantity);
        console.log('Holding:', balance.holding);
      });
    }).catch(error => {
      console.error('Error fetching monthly cash balance:', error);
      throw new Error('Failed to fetch monthly cash balance');
    });
}

export default {
  getAssetHoldingAnalysis,
  getDailyCashBalance,
};
