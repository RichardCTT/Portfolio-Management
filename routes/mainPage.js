import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: MainPage
 *   description: 主页数据 API
 */

/**
 * @swagger
 * /api/main_page/summary:
 *   get:
 *     summary: 获取资产汇总信息(总资产、总盈亏、当日盈亏)
 *     tags: [MainPage]
 *     responses:
 *       200:
 *         description: 成功获取资产汇总信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_asset_value:
 *                       type: number
 *                       format: float
 *                       description: 总资产价值
 *                     total_profit_loss:
 *                       type: number
 *                       format: float
 *                       description: 总盈亏
 *                     today_profit_loss:
 *                       type: number
 *                       format: float
 *                       description: 当日盈亏
 *                     total_profit_loss_percentage:
 *                       type: number
 *                       format: float
 *                       description: 总盈亏百分比
 *                     today_profit_loss_percentage:
 *                       type: number
 *                       format: float
 *                       description: 当日盈亏百分比
 *             example:
 *               code: 200
 *               message: Success
 *               data:
 *                 total_asset_value: 1250000.5
 *                 total_profit_loss: 150000.25
 *                 today_profit_loss: 25000.75
 *                 total_profit_loss_percentage: 13.65
 *                 today_profit_loss_percentage: 2.05
 *       500:
 *         description: 服务器错误
 */
router.get('/summary', async (req, res) => {
  try {
    // 获取总资产价值和总盈亏
    const summaryResult = await query(`
      SELECT 
        SUM(a.quantity * COALESCE(today.price, 0)) as total_asset_value,
        SUM(a.quantity * COALESCE(today.price, 0)) - 
        COALESCE(SUM(
          CASE 
            WHEN a.quantity > 0 THEN avg_price.avg_buy_price * a.quantity
            ELSE 0
          END
        ), 0) as total_profit_loss
      FROM assets a
      LEFT JOIN price_daily today ON a.id = today.asset_id 
        AND today.date = (SELECT MAX(date) FROM price_daily WHERE asset_id = a.id)
      LEFT JOIN (
        SELECT 
          asset_id,
          SUM(quantity * price) / SUM(quantity) as avg_buy_price
        FROM transactions 
        WHERE transaction_type = 'IN'
        GROUP BY asset_id
      ) avg_price ON a.id = avg_price.asset_id
    `, []);

    // 获取昨天的资产总值用于计算当日盈亏
    const yesterdayValueResult = await query(`
      SELECT 
        SUM(a.quantity * COALESCE(yesterday.price, 0)) as yesterday_asset_value
      FROM assets a
      LEFT JOIN price_daily yesterday ON a.id = yesterday.asset_id 
        AND yesterday.date = (
          SELECT MAX(date) FROM price_daily WHERE asset_id = a.id AND date < (SELECT MAX(date) FROM price_daily)
        )
    `, []);

    // 获取今天的资产总值用于计算当日盈亏
    const todayValueResult = await query(`
      SELECT 
        SUM(a.quantity * COALESCE(today.price, 0)) as today_asset_value
      FROM assets a
      LEFT JOIN price_daily today ON a.id = today.asset_id 
        AND today.date = (SELECT MAX(date) FROM price_daily WHERE asset_id = a.id)
    `, []);

    const data = summaryResult[0];
    const yesterdayData = yesterdayValueResult[0];
    const todayData = todayValueResult[0];

    // 计算总盈亏百分比
    const totalProfitLossPercentage = data.total_asset_value && data.total_profit_loss ?
      parseFloat(((data.total_profit_loss / (data.total_asset_value - data.total_profit_loss)) * 100).toFixed(2)) : 0;

    // 计算当日盈亏和当日盈亏百分比
    const todayProfitLoss = todayData.today_asset_value && yesterdayData.yesterday_asset_value ?
      parseFloat((todayData.today_asset_value - yesterdayData.yesterday_asset_value).toFixed(2)) : 0;
      
    const todayProfitLossPercentage = yesterdayData.yesterday_asset_value && todayProfitLoss ?
      parseFloat(((todayProfitLoss / yesterdayData.yesterday_asset_value) * 100).toFixed(2)) : 0;

    res.json({
      code: 200,
      message: 'Success',
      data: {
        total_asset_value: data.total_asset_value || 0,
        total_profit_loss: data.total_profit_loss || 0,
        today_profit_loss: todayProfitLoss,
        total_profit_loss_percentage: totalProfitLossPercentage,
        today_profit_loss_percentage: todayProfitLossPercentage
      }
    });
  } catch (error) {
    console.error('获取资产汇总信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/main_page/totalAssetsHistory:
 *   get:
 *     summary: 获取近10天的总资产变化数据
 *     tags: [MainPage]
 *     responses:
 *       200:
 *         description: 成功获取历史资产数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: 日期
 *                       total_asset_value:
 *                         type: number
 *                         format: float
 *                         description: 当日总资产价值
 *             example:
 *               code: 200
 *               message: Success
 *               data:
 *                 - date: "2025-07-22"
 *                   total_asset_value: 1200000.00
 *                 - date: "2025-07-23"
 *                   total_asset_value: 1215000.50
 *                 - date: "2025-07-24"
 *                   total_asset_value: 1230000.75
 *       500:
 *         description: 服务器错误
 */
router.get('/totalAssetsHistory', async (req, res) => {
  try {
    // 获取最近10天的资产总值数据
    const historyResult = await query(`
      SELECT 
        dates.date,
        COALESCE(SUM(a.quantity * prices.price), 0) as total_asset_value
      FROM (
        SELECT DISTINCT date 
        FROM price_daily 
        WHERE date >= (SELECT DATE_SUB(MAX(date), INTERVAL 9 DAY) FROM price_daily)
        ORDER BY date DESC 
        LIMIT 10
      ) dates
      CROSS JOIN assets a
      LEFT JOIN price_daily prices ON a.id = prices.asset_id AND dates.date = prices.date
      GROUP BY dates.date
      ORDER BY dates.date
    `, []);

    res.json({
      code: 200,
      message: 'Success',
      data: historyResult
    });
  } catch (error) {
    console.error('获取历史资产数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
});

export default router;