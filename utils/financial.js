/**
 * 金融计算工具类
 * 处理浮点数精度问题，确保金融计算的准确性
 */

/**
 * 格式化货币金额，保留两位小数
 * @param {number} amount - 金额
 * @returns {number} 格式化后的金额
 */
export function formatCurrency(amount) {
  return parseFloat(Number(amount).toFixed(2));
}

/**
 * 格式化资产数量，保留六位小数
 * @param {number} quantity - 数量
 * @returns {number} 格式化后的数量
 */
export function formatQuantity(quantity) {
  return parseFloat(Number(quantity).toFixed(6));
}

/**
 * 格式化价格，保留四位小数
 * @param {number} price - 价格
 * @returns {number} 格式化后的价格
 */
export function formatPrice(price) {
  return parseFloat(Number(price).toFixed(4));
}

/**
 * 计算交易总额，确保精度
 * @param {number} price - 单价
 * @param {number} quantity - 数量
 * @returns {number} 总额（保留两位小数）
 */
export function calculateTotal(price, quantity) {
  const total = Number(price) * Number(quantity);
  return formatCurrency(total);
}

/**
 * 安全的货币加法
 * @param {number} a - 加数
 * @param {number} b - 被加数
 * @returns {number} 结果（保留两位小数）
 */
export function addCurrency(a, b) {
  const result = Number(a) + Number(b);
  return formatCurrency(result);
}

/**
 * 安全的货币减法
 * @param {number} a - 被减数
 * @param {number} b - 减数
 * @returns {number} 结果（保留两位小数）
 */
export function subtractCurrency(a, b) {
  const result = Number(a) - Number(b);
  return formatCurrency(result);
}

/**
 * 安全的数量加法
 * @param {number} a - 加数
 * @param {number} b - 被加数
 * @returns {number} 结果（保留六位小数）
 */
export function addQuantity(a, b) {
  const result = Number(a) + Number(b);
  return formatQuantity(result);
}

/**
 * 安全的数量减法
 * @param {number} a - 被减数
 * @param {number} b - 减数
 * @returns {number} 结果（保留六位小数）
 */
export function subtractQuantity(a, b) {
  const result = Number(a) - Number(b);
  return formatQuantity(result);
}

/**
 * 验证货币金额是否有效
 * @param {number} amount - 金额
 * @returns {boolean} 是否有效
 */
export function isValidCurrency(amount) {
  return !isNaN(amount) && isFinite(amount) && amount >= 0;
}

/**
 * 验证数量是否有效
 * @param {number} quantity - 数量
 * @returns {boolean} 是否有效
 */
export function isValidQuantity(quantity) {
  return !isNaN(quantity) && isFinite(quantity) && quantity > 0;
}

/**
 * 比较两个货币金额是否相等（考虑精度）
 * @param {number} a - 金额A
 * @param {number} b - 金额B
 * @returns {boolean} 是否相等
 */
export function currencyEquals(a, b) {
  return Math.abs(formatCurrency(a) - formatCurrency(b)) < 0.01;
}

/**
 * 检查现金余额是否足够
 * @param {number} available - 可用余额
 * @param {number} required - 需要金额
 * @returns {boolean} 是否足够
 */
export function hasSufficientFunds(available, required) {
  return formatCurrency(available) >= formatCurrency(required);
}

/**
 * 格式化百分比
 * @param {number} value - 数值
 * @param {number} decimals - 小数位数，默认2位
 * @returns {number} 格式化后的百分比
 */
export function formatPercentage(value, decimals = 2) {
  return parseFloat(Number(value).toFixed(decimals));
}

export default {
  formatCurrency,
  formatQuantity,
  formatPrice,
  calculateTotal,
  addCurrency,
  subtractCurrency,
  addQuantity,
  subtractQuantity,
  isValidCurrency,
  isValidQuantity,
  currencyEquals,
  hasSufficientFunds,
  formatPercentage
};
