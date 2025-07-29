import express from 'express';
import { query } from '../config/database.js';
import { 
  validateDateRange, 
  formatDateForMySQL, 
  processDateFields 
} from '../utils/dateUtils.js';

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

    // 🔧 处理返回结果中的日期字段
    const processedItems = processDateFields(items, ['date', 'create_date']);

    res.json({
      code: 200,
      message: 'Success',
      data: {
        items: processedItems,
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

    // 🔧 处理返回结果中的日期字段
    const processedPrice = processDateFields([prices[0]], ['date', 'create_date'])[0];

    res.json({
      code: 200,
      message: 'Success',
      data: processedPrice
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
 * /api/price_daily/range:
 *   post:
 *     summary: 获取特定资产在时间范围内的价格数据
 *     tags: [Price Daily]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - asset_id
 *               - start_date
 *               - end_date
 *             properties:
 *               asset_id:
 *                 type: integer
 *                 description: 资产的唯一标识符
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: 开始日期 (YYYY-MM-DD格式)
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: 结束日期 (YYYY-MM-DD格式)
 *             example:
 *               asset_id: 1
 *               start_date: "2024-01-01"
 *               end_date: "2024-01-31"
 *     responses:
 *       200:
 *         description: 成功获取价格数据列表
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
 *                     $ref: '#/components/schemas/PriceDaily'
 *       400:
 *         description: 参数错误
 *       500:
 *         description: 服务器错误
 */
router.post('/range', async (req, res) => {
  try {
    const { asset_id, start_date, end_date } = req.body;

    // 验证必需参数
    if (!asset_id || !start_date || !end_date) {
      return res.status(400).json({
        code: 400,
        message: '缺少必需参数: asset_id, start_date, end_date',
        data: null
      });
    }

    // 🔧 使用日期工具函数验证日期范围
    const dateValidation = validateDateRange(start_date, end_date);
    if (!dateValidation.isValid) {
      return res.status(400).json({
        code: 400,
        message: dateValidation.errors.join('; '),
        data: null
      });
    }

    // 🔧 格式化日期，确保正确的MySQL格式
    const formattedStartDate = formatDateForMySQL(start_date);
    const formattedEndDate = formatDateForMySQL(end_date);

    // 🔧 使用DATE()函数确保只比较日期部分，避免时区问题
    const sql = `
      SELECT 
        id,
        asset_id,
        date,
        price,
        create_date
      FROM price_daily 
      WHERE asset_id = ? 
      AND DATE(date) >= DATE(?) 
      AND DATE(date) <= DATE(?) 
      ORDER BY date ASC
    `;

    const prices = await query(sql, [asset_id, formattedStartDate, formattedEndDate]);

    // 🔧 处理返回结果中的日期字段
    const processedPrices = processDateFields(prices, ['date', 'create_date']);

    res.json({
      code: 200,
      message: 'Success',
      data: processedPrices
    });

  } catch (error) {
    console.error('获取价格范围数据失败:', error);
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

/**
 * @swagger
 * /api/price_daily/debug-timezone:
 *   post:
 *     summary: 调试时区问题 - 检查日期处理
 *     tags: [Price Daily]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - asset_id
 *               - test_date
 *             properties:
 *               asset_id:
 *                 type: integer
 *               test_date:
 *                 type: string
 *                 format: date
 *             example:
 *               asset_id: 1
 *               test_date: "2024-01-15"
 *     responses:
 *       200:
 *         description: 调试信息
 */
router.post('/debug-timezone', async (req, res) => {
  try {
    const { asset_id, test_date } = req.body;

    // 获取原始数据
    const rawSql = 'SELECT id, asset_id, date, price, create_date FROM price_daily WHERE asset_id = ? ORDER BY date';
    const rawData = await query(rawSql, [asset_id]);

    // 获取指定日期数据
    const specificSql = 'SELECT * FROM price_daily WHERE asset_id = ? AND date = ?';
    const specificData = await query(specificSql, [asset_id, test_date]);

    // 获取使用DATE()函数的数据
    const dateFuncSql = 'SELECT *, DATE(date) as date_only FROM price_daily WHERE asset_id = ? AND DATE(date) = DATE(?)';
    const dateFuncData = await query(dateFuncSql, [asset_id, test_date]);

    res.json({
      code: 200,
      message: 'Debug information',
      data: {
        input: {
          asset_id,
          test_date,
          test_date_type: typeof test_date
        },
        system_info: {
          server_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          server_time: new Date().toISOString(),
          server_local_time: new Date().toString(),
          nodejs_version: process.version
        },
        database_results: {
          all_records: rawData.map(record => ({
            ...record,
            date_raw: record.date,
            date_iso: record.date instanceof Date ? record.date.toISOString() : record.date,
            date_local: record.date instanceof Date ? record.date.toString() : record.date,
            date_yyyy_mm_dd: record.date instanceof Date ? record.date.toISOString().split('T')[0] : record.date
          })),
          specific_date_query: specificData,
          date_function_query: dateFuncData
        },
        sql_queries: {
          raw_query: rawSql,
          specific_query: specificSql,
          date_func_query: dateFuncSql
        }
      }
    });

  } catch (error) {
    console.error('调试时区失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message,
      data: null
    });
  }
});

export default router;