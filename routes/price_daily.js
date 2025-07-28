import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * /api/price_daily:
 *   get:
 *     summary: 获取某资产的所有价格记录
 *     tags: [Price Daily]
 *     parameters:
 *       - in: query
 *         name: asset_id
 *         required: false
 *         schema:
 *           type: integer
 *         description: 资产的唯一标识符
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *         description: 每页条目数
 *     responses:
 *       200:
 *         description: 成功获取价格记录列表
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
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PriceDaily'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     page_size:
 *                       type: integer
 *       500:
 *         description: 服务器错误
 */
router.get('/', async (req, res) => {
  try {
    const assetId = req.query.asset_id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.page_size) || 10));
    const offset = (page - 1) * pageSize;

    // 构建基础查询语句
    let baseSql = 'SELECT * FROM price_daily WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM price_daily WHERE 1=1';

    // 如果提供了asset_id，则添加筛选条件
    if (assetId) {
      baseSql += ` AND asset_id = ${assetId}`;
      countSql += ` AND asset_id = ${assetId}`;
    }

    // 按日期顺序排列
    baseSql += ' ORDER BY date';

    // 使用Promise.all并行执行查询
    const [items, totalResult] = await Promise.all([
      query(`${baseSql} LIMIT ${pageSize} OFFSET ${offset}`, []),
      query(countSql, [])
    ]);

    const total = totalResult[0].total;

    res.json({
      code: 200,
      message: 'Success',
      data: {
        items,
        total,
        page,
        page_size: pageSize
      }
    });
  } catch (error) {
    console.error('获取价格记录列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/price_daily/{id}:
 *   get:
 *     summary: 获取单个价格记录详情
 *     tags: [Price Daily]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 价格记录ID
 *     responses:
 *       200:
 *         description: 成功获取价格记录详情
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
 *                   $ref: '#/components/schemas/PriceDaily'
 *       404:
 *         description: 价格记录未找到
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prices = await query('SELECT * FROM price_daily WHERE id = ?', [id]);
    
    if (prices.length === 0) {
      return res.status(404).json({
        code: 404,
        message: 'Price record not found',
        data: null
      });
    }

    res.json({
      code: 200,
      message: 'Success',
      data: prices[0]
    });
  } catch (error) {
    console.error('获取价格记录详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/price_daily:
 *   post:
 *     summary: 创建/更新价格记录
 *     tags: [Price Daily]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - asset_id
 *               - date
 *               - price
 *             properties:
 *               asset_id:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               price:
 *                 type: number
 *                 format: float
 *             example:
 *               asset_id: 1
 *               date: 2024-06-15
 *               price: 462.0
 *     responses:
 *       200:
 *         description: 价格记录更新成功
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
 *                   $ref: '#/components/schemas/PriceDaily'
 *       201:
 *         description: 价格记录创建成功
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
 *                   $ref: '#/components/schemas/PriceDaily'
 *       500:
 *         description: 服务器错误
 */
router.post('/', async (req, res) => {
  try {
    const { asset_id, date, price } = req.body;

    // 检查是否已存在该资产和日期的记录
    const existingPrices = await query(
      'SELECT * FROM price_daily WHERE asset_id = ? AND date = ?',
      [asset_id, date]
    );

    if (existingPrices.length > 0) {
      // 更新现有记录
      await query(
        'UPDATE price_daily SET price = ? WHERE id = ?',
        [price, existingPrices[0].id]
      );

      const updatedPrices = await query('SELECT * FROM price_daily WHERE id = ?', [existingPrices[0].id]);

      res.json({
        code: 200,
        message: 'Price record updated successfully',
        data: updatedPrices[0]
      });
    } else {
      // 创建新记录
      const result = await query(
        'INSERT INTO price_daily (asset_id, date, price, create_date) VALUES (?, ?, ?, NOW())',
        [asset_id, date, price]
      );

      const newPrice = await query('SELECT * FROM price_daily WHERE id = ?', [result.insertId]);

      res.status(201).json({
        code: 201,
        message: 'Price record created successfully',
        data: newPrice[0]
      });
    }
  } catch (error) {
    console.error('创建/更新价格记录失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/price_daily/{id}:
 *   delete:
 *     summary: 删除价格记录
 *     tags: [Price Daily]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 价格记录ID
 *     responses:
 *       200:
 *         description: 价格记录删除成功
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
 *                   nullable: true
 *       404:
 *         description: 价格记录未找到
 *       500:
 *         description: 服务器错误
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查价格记录是否存在
    const existingPrices = await query('SELECT * FROM price_daily WHERE id = ?', [id]);
    if (existingPrices.length === 0) {
      return res.status(404).json({
        code: 404,
        message: 'Price record not found',
        data: null
      });
    }
    
    // 删除价格记录
    await query('DELETE FROM price_daily WHERE id = ?', [id]);
    
    res.json({
      code: 200,
      message: 'Price record deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('删除价格记录失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
});

export default router;