import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// 初始化 dotenv 配置
dotenv.config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio_management',
  charset: 'utf8mb4',
  timezone: '+08:00'
};

// 连接池配置
const poolConfig = {
  ...dbConfig,
  waitForConnections: true,     // 当无可用连接时是否等待
  connectionLimit: 10,          // 最大连接数
  queueLimit: 0,                // 排队等待的最大请求数，0表示无限制
  multipleStatements: false      // 禁用多语句查询（安全考虑）
};

// 创建连接池
const pool = mysql.createPool(poolConfig);

// 测试数据库连接
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
};

// 执行查询的辅助函数
const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
};

// 执行事务的辅助函数
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// 优雅关闭连接池
const closePool = async () => {
  try {
    await pool.end();
    console.log('📡 数据库连接池已关闭');
  } catch (error) {
    console.error('关闭数据库连接池时出错:', error);
  }
};

// 监听进程退出事件，确保优雅关闭
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});

export {
  pool,
  query,
  transaction,
  testConnection,
  closePool
};