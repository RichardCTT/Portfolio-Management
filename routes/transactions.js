import express from 'express';
import { query, transaction } from '../config/database.js';
import { 
  formatCurrency, 
  formatQuantity, 
  calculateTotal, 
  addCurrency, 
  subtractCurrency, 
  addQuantity, 
  subtractQuantity,
  isValidQuantity,
  hasSufficientFunds
} from '../utils/financial.js';

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



/**
 * @swagger
 * /api/transactions/sell:
 *   post:
 *     summary: 卖出资产
 *     description: 根据指定日期的价格卖出资产，自动向现金账户添加对应金额
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - asset_id
 *               - quantity
 *               - date
 *             properties:
 *               asset_id:
 *                 type: integer
 *                 description: 要卖出的资产ID
 *                 example: 2
 *               quantity:
 *                 type: number
 *                 format: float
 *                 description: 卖出数量
 *                 example: 5.0
 *               date:
 *                 type: string
 *                 format: date
 *                 description: 卖出日期（YYYY-MM-DD格式）
 *                 example: "2025-07-29"
 *               description:
 *                 type: string
 *                 description: 交易描述（可选）
 *                 example: "部分获利了结"
 *     responses:
 *       201:
 *         description: 资产卖出成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Asset sold successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       $ref: '#/components/schemas/Transaction'
 *                     total_received:
 *                       type: number
 *                       format: float
 *                       description: 总收到金额
 *                       example: 2300.0
 *                     new_cash_balance:
 *                       type: number
 *                       format: float
 *                       description: 新的现金余额
 *                       example: 497800.0
 *       400:
 *         description: 请求参数错误或持仓不足
 *       404:
 *         description: 资产未找到或当日无价格数据
 *       500:
 *         description: 服务器错误
 */
router.post('/sell', async (req, res) => {
  try {
    const { asset_id, quantity, date, description } = req.body;
    
    // 参数验证
    if (!asset_id || !quantity || !date) {
      return res.status(400).json({
        code: 400,
        message: 'Missing required parameters: asset_id, quantity, and date are required',
        data: null
      });
    }

    if (!isValidQuantity(quantity)) {
      return res.status(400).json({
        code: 400,
        message: 'Quantity must be a positive number',
        data: null
      });
    }

    // 使用事务确保数据一致性
    const result = await transaction(async (connection) => {
      // 1. 检查要卖出的资产是否存在
      const [assets] = await connection.execute(
        'SELECT * FROM assets WHERE id = ?',
        [asset_id]
      );
      
      if (assets.length === 0) {
        throw new Error('Asset not found');
      }
      
      const asset = assets[0];

      // 2. 检查持仓是否足够
      if (asset.quantity < quantity) {
        throw new Error(`Insufficient asset quantity. Required: ${quantity}, Available: ${asset.quantity}`);
      }

      // 3. 获取指定日期的价格
      const [priceData] = await connection.execute(
        'SELECT price FROM price_daily WHERE asset_id = ? AND date = ?',
        [asset_id, date]
      );
      
      if (priceData.length === 0) {
        throw new Error(`No price data found for asset ${asset.code} on ${date}`);
      }
      
      const unitPrice = priceData[0].price;
      const totalReceived = calculateTotal(unitPrice, quantity); // 使用工具函数计算总额

      // 4. 获取现金账户信息（CASH001）
      const [cashAccounts] = await connection.execute(
        'SELECT * FROM assets WHERE code = ?',
        ['CASH001']
      );
      
      if (cashAccounts.length === 0) {
        throw new Error('Cash account not found');
      }
      
      const cashAccount = cashAccounts[0];

      // 5. 创建卖出交易记录
      const newHolding = subtractQuantity(asset.quantity, quantity); // 使用工具函数减法
      const [sellTransactionResult] = await connection.execute(
        'INSERT INTO transactions (asset_id, transaction_type, quantity, price, transaction_date, holding, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [asset_id, 'OUT', quantity, unitPrice, date, newHolding, description || `Sale of ${quantity} units of ${asset.name}`]
      );

      // 6. 更新资产持有量
      await connection.execute(
        'UPDATE assets SET quantity = ? WHERE id = ?',
        [newHolding, asset_id]
      );

      // 7. 创建现金收入交易记录
      const newCashBalance = addCurrency(cashAccount.quantity, totalReceived); // 使用工具函数加法
      const [cashTransactionResult] = await connection.execute(
        'INSERT INTO transactions (asset_id, transaction_type, quantity, price, transaction_date, holding, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [cashAccount.id, 'IN', totalReceived, 1.0, date, newCashBalance, `Cash received from selling ${quantity} units of ${asset.name}`]
      );

      // 8. 更新现金余额
      await connection.execute(
        'UPDATE assets SET quantity = ? WHERE id = ?',
        [newCashBalance, cashAccount.id]
      );

      // 9. 获取创建的卖出交易记录
      const [newTransaction] = await connection.execute(
        'SELECT * FROM transactions WHERE id = ?',
        [sellTransactionResult.insertId]
      );

      return {
        transaction: newTransaction[0],
        total_received: totalReceived,
        new_cash_balance: newCashBalance,
        asset_name: asset.name,
        unit_price: unitPrice
      };
    });

    res.status(201).json({
      code: 201,
      message: 'Asset sold successfully',
      data: result
    });

  } catch (error) {
    console.error('资产卖出失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '服务器内部错误',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/transactions/buy:
 *   post:
 *     summary: 买入资产
 *     description: 根据指定日期的价格买入资产，自动从现金账户扣除对应金额
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - asset_id
 *               - quantity
 *               - date
 *             properties:
 *               asset_id:
 *                 type: integer
 *                 description: 要购买的资产ID
 *                 example: 2
 *               quantity:
 *                 type: number
 *                 format: float
 *                 description: 购买数量
 *                 example: 10.0
 *               date:
 *                 type: string
 *                 format: date
 *                 description: 购买日期（YYYY-MM-DD格式）
 *                 example: "2025-07-29"
 *               description:
 *                 type: string
 *                 description: 交易描述（可选）
 *                 example: "月度投资计划购买"
 *     responses:
 *       201:
 *         description: 资产购买成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Asset purchased successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       $ref: '#/components/schemas/Transaction'
 *                     total_cost:
 *                       type: number
 *                       format: float
 *                       description: 总花费金额
 *                       example: 4500.0
 *                     remaining_cash:
 *                       type: number
 *                       format: float
 *                       description: 剩余现金
 *                       example: 495500.0
 *       400:
 *         description: 请求参数错误或资金不足
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Insufficient cash balance"
 *                 data:
 *                   type: object
 *                   nullable: true
 *       404:
 *         description: 资产未找到或当日无价格数据
 *       500:
 *         description: 服务器错误
 */
router.post('/buy', async (req, res) => {
  try {
    const { asset_id, quantity, date, description } = req.body;
    
    // 参数验证
    if (!asset_id || !quantity || !date) {
      return res.status(400).json({
        code: 400,
        message: 'Missing required parameters: asset_id, quantity, and date are required',
        data: null
      });
    }

    if (!isValidQuantity(quantity)) {
      return res.status(400).json({
        code: 400,
        message: 'Quantity must be a positive number',
        data: null
      });
    }

    // 使用事务确保数据一致性
    const result = await transaction(async (connection) => {
      // 1. 检查要购买的资产是否存在
      const [assets] = await connection.execute(
        'SELECT * FROM assets WHERE id = ?',
        [asset_id]
      );
      
      if (assets.length === 0) {
        throw new Error('Asset not found');
      }
      
      const asset = assets[0];

      // 2. 获取指定日期的价格
      const [priceData] = await connection.execute(
        'SELECT price FROM price_daily WHERE asset_id = ? AND date = ?',
        [asset_id, date]
      );
      
      if (priceData.length === 0) {
        throw new Error(`No price data found for asset ${asset.code} on ${date}`);
      }
      
      const unitPrice = priceData[0].price;
      const totalCost = calculateTotal(unitPrice, quantity); // 使用工具函数计算总额

      // 3. 获取现金账户信息（CASH001）
      const [cashAccounts] = await connection.execute(
        'SELECT * FROM assets WHERE code = ?',
        ['CASH001']
      );
      
      if (cashAccounts.length === 0) {
        throw new Error('Cash account not found');
      }
      
      const cashAccount = cashAccounts[0];

      // 4. 检查现金余额是否足够
      if (!hasSufficientFunds(cashAccount.quantity, totalCost)) {
        throw new Error(`Insufficient cash balance. Required: ${formatCurrency(totalCost)}, Available: ${formatCurrency(cashAccount.quantity)}`);
      }

      // 5. 创建买入交易记录
      const newHolding = addQuantity(asset.quantity, quantity); // 使用工具函数加法
      const [buyTransactionResult] = await connection.execute(
        'INSERT INTO transactions (asset_id, transaction_type, quantity, price, transaction_date, holding, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [asset_id, 'IN', quantity, unitPrice, date, newHolding, description || `Purchase of ${quantity} units of ${asset.name}`]
      );

      // 6. 更新资产持有量
      await connection.execute(
        'UPDATE assets SET quantity = ? WHERE id = ?',
        [newHolding, asset_id]
      );

      // 7. 创建现金支出交易记录
      const newCashBalance = subtractCurrency(cashAccount.quantity, totalCost); // 使用工具函数减法
      const [cashTransactionResult] = await connection.execute(
        'INSERT INTO transactions (asset_id, transaction_type, quantity, price, transaction_date, holding, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [cashAccount.id, 'OUT', totalCost, 1.0, date, newCashBalance, `Cash payment for purchasing ${quantity} units of ${asset.name}`]
      );

      // 8. 更新现金余额
      await connection.execute(
        'UPDATE assets SET quantity = ? WHERE id = ?',
        [newCashBalance, cashAccount.id]
      );

      // 9. 获取创建的买入交易记录
      const [newTransaction] = await connection.execute(
        'SELECT * FROM transactions WHERE id = ?',
        [buyTransactionResult.insertId]
      );

      return {
        transaction: newTransaction[0],
        total_cost: totalCost,
        remaining_cash: newCashBalance,
        asset_name: asset.name,
        unit_price: unitPrice
      };
    });

    res.status(201).json({
      code: 201,
      message: 'Asset purchased successfully',
      data: result
    });

  } catch (error) {
    console.error('资产购买失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '服务器内部错误',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/transactions/cash-summary:
 *   get:
 *     summary: 获取现金账户汇总信息
 *     description: 获取现金账户的总金额、当月支出、收入和净流水
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: 年份（默认为当前年份）
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: 月份（默认为当前月份）
 *     responses:
 *       200:
 *         description: 成功获取现金账户汇总信息
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
 *                     total_cash:
 *                       type: number
 *                       format: float
 *                       description: 总现金金额
 *                     monthly_expense:
 *                       type: number
 *                       format: float
 *                       description: 当月支出
 *                     monthly_income:
 *                       type: number
 *                       format: float
 *                       description: 当月收入
 *                     net_flow:
 *                       type: number
 *                       format: float
 *                       description: 净现金流（收入-支出）
 *       500:
 *         description: 服务器错误
 */
router.get('/cash-summary', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || new Date().getMonth() + 1;
    
    // 获取现金账户总金额
    const cashAssets = await query('SELECT quantity FROM assets WHERE code = ?', ['CASH001']);
    const totalCash = cashAssets.length > 0 ? cashAssets[0].quantity : 0;
    
    // 计算当月支出和收入
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // 月末日期
    
    const transactions = await query(`
      SELECT 
        SUM(CASE WHEN transaction_type = 'OUT' THEN t.quantity ELSE 0 END) as monthly_expense,
        SUM(CASE WHEN transaction_type = 'IN' THEN t.quantity ELSE 0 END) as monthly_income
      FROM transactions t
      JOIN assets a ON t.asset_id = a.id
      WHERE a.code = 'CASH001' 
      AND DATE(t.transaction_date) BETWEEN ? AND ?
    `, [startDate, endDate]);
    
    const monthlyExpense = transactions[0].monthly_expense || 0;
    const monthlyIncome = transactions[0].monthly_income || 0;
    const netFlow = monthlyIncome - monthlyExpense;
    
    res.json({
      code: 200,
      message: 'Success',
      data: {
        total_cash: totalCash,
        monthly_expense: monthlyExpense,
        monthly_income: monthlyIncome,
        net_flow: netFlow
      }
    });
  } catch (error) {
    console.error('获取现金账户汇总信息失败:', error);
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

export default router;