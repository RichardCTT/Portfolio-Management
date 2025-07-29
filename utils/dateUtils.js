/**
 * 日期处理工具函数
 * 解决JavaScript和MySQL之间的时区问题
 */

/**
 * 将日期字符串转换为MySQL DATE格式（YYYY-MM-DD）
 * @param {string|Date} date - 输入日期
 * @returns {string} YYYY-MM-DD格式的日期字符串
 */
export function formatDateForMySQL(date) {
  if (!date) return null;
  
  // 如果已经是YYYY-MM-DD格式的字符串，直接返回
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // 转换为Date对象
  const dateObj = new Date(date);
  
  // 检查日期是否有效
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date format');
  }
  
  // 返回YYYY-MM-DD格式
  return dateObj.toISOString().split('T')[0];
}

/**
 * 将MySQL返回的日期转换为YYYY-MM-DD格式字符串
 * @param {Date|string} dbDate - 数据库返回的日期
 * @returns {string} YYYY-MM-DD格式的日期字符串
 */
export function formatDateFromMySQL(dbDate) {
  if (!dbDate) return null;
  
  // 如果已经是字符串格式
  if (typeof dbDate === 'string') {
    // 如果是YYYY-MM-DD格式，直接返回
    if (/^\d{4}-\d{2}-\d{2}$/.test(dbDate)) {
      return dbDate;
    }
    // 如果是ISO格式，提取日期部分
    if (dbDate.includes('T')) {
      return dbDate.split('T')[0];
    }
  }
  
  // 如果是Date对象
  if (dbDate instanceof Date) {
    return dbDate.toISOString().split('T')[0];
  }
  
  return dbDate;
}

/**
 * 验证日期字符串格式是否为YYYY-MM-DD
 * @param {string} dateStr - 日期字符串
 * @returns {boolean} 是否为有效格式
 */
export function isValidDateFormat(dateStr) {
  if (typeof dateStr !== 'string') return false;
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;
  
  // 验证日期是否真实存在
  const date = new Date(dateStr + 'T00:00:00.000Z');
  return !isNaN(date.getTime()) && date.toISOString().startsWith(dateStr);
}

/**
 * 比较两个日期（只比较日期部分，忽略时间）
 * @param {string|Date} date1 - 第一个日期
 * @param {string|Date} date2 - 第二个日期
 * @returns {number} -1: date1 < date2, 0: date1 = date2, 1: date1 > date2
 */
export function compareDates(date1, date2) {
  const d1 = formatDateForMySQL(date1);
  const d2 = formatDateForMySQL(date2);
  
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
}

/**
 * 获取当前日期的YYYY-MM-DD格式字符串
 * @returns {string} 当前日期
 */
export function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * 日期范围验证
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {object} 验证结果
 */
export function validateDateRange(startDate, endDate) {
  const errors = [];
  
  if (!isValidDateFormat(startDate)) {
    errors.push('开始日期格式无效，请使用 YYYY-MM-DD 格式');
  }
  
  if (!isValidDateFormat(endDate)) {
    errors.push('结束日期格式无效，请使用 YYYY-MM-DD 格式');
  }
  
  if (errors.length === 0 && compareDates(startDate, endDate) > 0) {
    errors.push('开始日期不能晚于结束日期');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 处理数据库查询结果中的日期字段
 * @param {Array} results - 数据库查询结果
 * @param {Array} dateFields - 需要处理的日期字段名数组
 * @returns {Array} 处理后的结果
 */
export function processDateFields(results, dateFields = ['date', 'create_date']) {
  if (!Array.isArray(results)) return results;
  
  return results.map(item => {
    const processedItem = { ...item };
    
    dateFields.forEach(field => {
      if (processedItem[field]) {
        processedItem[field] = formatDateFromMySQL(processedItem[field]);
      }
    });
    
    return processedItem;
  });
}

export default {
  formatDateForMySQL,
  formatDateFromMySQL,
  isValidDateFormat,
  compareDates,
  getCurrentDate,
  validateDateRange,
  processDateFields
};
