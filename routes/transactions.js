import express from 'express';
import { query, transaction } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: 交易记录管理 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - asset_id
 *         - transaction_type
 *         - quantity
 *         - price
 *         - transaction_date
 *         - holding
 *       properties:
 *         id:
 *           type: integer
 *           description: 交易记录ID
 *         asset_id:
 *           type: integer
 *           description: 资产ID
 *         transaction_type:
 *           type: string
 *           enum: [IN, OUT]
 *           description: 交易类型(IN=入库, OUT=出库)
 *         quantity:
 *           type: number
 *           format: float
 *           description: 交易数量
 *         price:
 *           type: number
 *           format: float
 *           description: 交易单价
 *         transaction_date:
 *           type: string
 *           format: date-time
 *           description: 交易日期
 *         holding:
 *           type: number
 *           format: float
 *           description: 交易后资产余额
 *         description:
 *           type: string
 *           description: 描述
 *       example:
 *         id: 1
 *         asset_id: 1
 *         transaction_type: IN
 *         quantity: 20.0
 *         price: 450.0
 *         transaction_date: 2023-10-28T09:00:00Z
 *         holding: 70.5
 *         description: 月初采购
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: 获取所有交易记录
 *     tags: [Transactions]
 *     parameters:
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
 *       - in: query
 *         name: asset_id
 *         schema:
 *           type: integer
 *         description: 筛选特定资产的交易
 *     responses:
 *       200:
 *         description: 成功获取交易记录列表
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
 *                         $ref: '#/components/schemas/Transaction'
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
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.page_size) || 10));
    const assetId = req.query.asset_id;
    const offset = (page - 1) * pageSize;

    // 构建基础查询语句
    let baseSql = 'SELECT * FROM transactions WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM transactions WHERE 1=1';

    if (assetId) {
      baseSql += ` AND asset_id = ${assetId}`;
      countSql += ` AND asset_id = ${assetId}`;
    }

    // 按照交易日期顺序排列
    baseSql += ' ORDER BY transaction_date';

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
    console.error('获取交易记录列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: 获取单个交易记录详情
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 交易记录ID
 *     responses:
 *       200:
 *         description: 成功获取交易记录详情
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
 *                   $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: 交易记录未找到
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transactions = await query('SELECT * FROM transactions WHERE id = ?', [id]);
    
    if (transactions.length === 0) {
      return res.status(404).json({
        code: 404,
        message: 'Transaction not found',
        data: null
      });
    }

    res.json({
      code: 200,
      message: 'Success',
      data: transactions[0]
    });
  } catch (error) {
    console.error('获取交易记录详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: 创建交易记录
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - asset_id
 *               - transaction_type
 *               - quantity
 *               - price
 *               - transaction_date
 *             properties:
 *               asset_id:
 *                 type: integer
 *               transaction_type:
 *                 type: string
 *                 enum: [IN, OUT]
 *               quantity:
 *                 type: number
 *                 format: float
 *               price:
 *                 type: number
 *                 format: float
 *               transaction_date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *             example:
 *               asset_id: 1
 *               transaction_type: OUT
 *               quantity: 5.0
 *               price: 460.0
 *               transaction_date: 2024-06-15
 *               description: 客户提货
 *     responses:
 *       201:
 *         description: 交易记录创建成功
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
 *                   $ref: '#/components/schemas/Transaction'
 *       500:
 *         description: 服务器错误
 */
router.post('/', async (req, res) => {
  try {
    const { asset_id, transaction_type, quantity, price, transaction_date, description } = req.body;
    
    // 使用事务确保数据一致性
    const result = await transaction(async (connection) => {
      // 获取资产当前数量
      const [asset] = await connection.execute('SELECT quantity FROM assets WHERE id = ?', [asset_id]);
      
      if (asset.length === 0) {
        throw new Error('Asset not found');
      }
      
      // 计算交易后的持有量
      let holding;
      if (transaction_type === 'IN') {
        holding = asset[0].quantity + quantity;
      } else {
        holding = asset[0].quantity - quantity;
        // 确保不会出现负数
        if (holding < 0) {
          throw new Error('Insufficient asset quantity');
        }
      }
      
      // 插入交易记录
      const [transactionResult] = await connection.execute(
        'INSERT INTO transactions (asset_id, transaction_type, quantity, price, transaction_date, holding, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [asset_id, transaction_type, quantity, price, transaction_date, holding, description]
      );
      
      // 更新资产数量
      await connection.execute(
        'UPDATE assets SET quantity = ? WHERE id = ?',
        [holding, asset_id]
      );
      
      // 获取创建的交易记录
      const [newTransaction] = await connection.execute('SELECT * FROM transactions WHERE id = ?', [transactionResult.insertId]);
      
      return newTransaction[0];
    });
    
    res.status(201).json({
      code: 201,
      message: 'Transaction created successfully',
      data: result
    });
  } catch (error) {
    console.error('创建交易记录失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '服务器内部错误',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: 删除交易记录
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 交易记录ID
 *     responses:
 *       200:
 *         description: 交易记录删除成功
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
 *         description: 交易记录未找到
 *       500:
 *         description: 服务器错误
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 使用事务确保数据一致性
    await transaction(async (connection) => {
      // 检查交易记录是否存在
      const [transactions] = await connection.execute('SELECT * FROM transactions WHERE id = ?', [id]);
      if (transactions.length === 0) {
        throw new Error('Transaction not found');
      }
      
      const transactionToDelete = transactions[0];
      
      // 检查是否是最后一条交易记录，如果是，需要更新资产数量
      const [latestTransaction] = await connection.execute(
        'SELECT * FROM transactions WHERE asset_id = ? ORDER BY transaction_date DESC, id DESC LIMIT 1',
        [transactionToDelete.asset_id]
      );
      
      if (latestTransaction.length > 0 && latestTransaction[0].id === transactionToDelete.id) {
        // 如果删除的是最新的交易记录，需要更新资产数量为上一条记录的持有量
        const [prevTransactions] = await connection.execute(
          'SELECT * FROM transactions WHERE asset_id = ? AND (transaction_date < ? OR (transaction_date = ? AND id < ?)) ORDER BY transaction_date DESC, id DESC LIMIT 1',
          [transactionToDelete.asset_id, transactionToDelete.transaction_date, transactionToDelete.transaction_date, transactionToDelete.id]
        );
        
        let newQuantity = 0;
        if (prevTransactions.length > 0) {
          newQuantity = prevTransactions[0].holding;
        }
        
        // 更新资产数量
        await connection.execute(
          'UPDATE assets SET quantity = ? WHERE id = ?',
          [newQuantity, transactionToDelete.asset_id]
        );
      }
      
      // 删除交易记录
      await connection.execute('DELETE FROM transactions WHERE id = ?', [id]);
    });
    
    res.json({
      code: 200,
      message: 'Transaction deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('删除交易记录失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '服务器内部错误',
      data: null
    });
  }
});

export default router;