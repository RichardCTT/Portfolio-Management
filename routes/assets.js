import express from 'express';
import { query, transaction } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Assets
 *   description: 资产管理 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Asset:
 *       type: object
 *       required:
 *         - name
 *         - asset_type_id
 *         - quantity
 *         - code
 *       properties:
 *         id:
 *           type: integer
 *           description: 资产ID
 *         name:
 *           type: string
 *           description: 资产名称
 *         asset_type_id:
 *           type: integer
 *           description: 资产类型ID
 *         quantity:
 *           type: number
 *           format: float
 *           description: 数量
 *         code:
 *           type: string
 *           description: 资产编码
 *         description:
 *           type: string
 *           description: 描述
 *         create_date:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *       example:
 *         id: 1
 *         name: 黄金储备
 *         asset_type_id: 1
 *         quantity: 50.5
 *         code: AU-001
 *         description: 标准金条
 *         create_date: 2023-10-27T08:00:00Z
 */

/**
 * @swagger
 * /api/assets:
 *   get:
 *     summary: 获取所有资产
 *     tags: [Assets]
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
 *         name: asset_type_id
 *         schema:
 *           type: integer
 *         description: 筛选特定类型的资产
 *     responses:
 *       200:
 *         description: 成功获取资产列表
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
 *                         $ref: '#/components/schemas/Asset'
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
    const assetTypeId = req.query.asset_type_id;
    const offset = (page - 1) * pageSize;

    // 构建基础查询语句
    let baseSql = 'SELECT * FROM assets WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as total FROM assets WHERE 1=1';
    const params = [];

    if (assetTypeId) {
      baseSql += ` AND asset_type_id = ${assetTypeId}`;
      countSql += ` AND asset_type_id = ${assetTypeId}`;
    }

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
    console.error('获取资产列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     summary: 获取单个资产详情
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 资产ID
 *     responses:
 *       200:
 *         description: 成功获取资产详情
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
 *                   $ref: '#/components/schemas/Asset'
 *       404:
 *         description: 资产未找到
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const assets = await query('SELECT * FROM assets WHERE id = ?', [id]);
    
    if (assets.length === 0) {
      return res.status(404).json({
        code: 404,
        message: 'Asset not found',
        data: null
      });
    }

    res.json({
      code: 200,
      message: 'Success',
      data: assets[0]
    });
  } catch (error) {
    console.error('获取资产详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/assets:
 *   post:
 *     summary: 创建资产
 *     tags: [Assets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - asset_type_id
 *               - quantity
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *               asset_type_id:
 *                 type: integer
 *               quantity:
 *                 type: number
 *                 format: float
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *             example:
 *               name: 白银储备
 *               asset_type_id: 1
 *               quantity: 100.0
 *               code: AG-001
 *               description: 标准银条
 *     responses:
 *       201:
 *         description: 资产创建成功
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
 *                   $ref: '#/components/schemas/Asset'
 *       500:
 *         description: 服务器错误
 */
router.post('/', async (req, res) => {
  try {
    const { name, asset_type_id, quantity, code, description } = req.body;
    
    const result = await query(
      'INSERT INTO assets (name, asset_type_id, quantity, code, description, create_date) VALUES (?, ?, ?, ?, ?, NOW())',
      [name, asset_type_id, quantity, code, description]
    );
    
    const newAsset = await query('SELECT * FROM assets WHERE id = ?', [result.insertId]);
    
    res.status(201).json({
      code: 201,
      message: 'Asset created successfully',
      data: newAsset[0]
    });
  } catch (error) {
    console.error('创建资产失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/assets/{id}:
 *   put:
 *     summary: 更新资产信息
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 资产ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *             example:
 *               name: 高纯度白银储备
 *               code: AG-002
 *               description: 99.99%纯度银条
 *     responses:
 *       200:
 *         description: 资产更新成功
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
 *                   $ref: '#/components/schemas/Asset'
 *       404:
 *         description: 资产未找到
 *       500:
 *         description: 服务器错误
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;
    
    // 检查资产是否存在
    const existingAssets = await query('SELECT * FROM assets WHERE id = ?', [id]);
    if (existingAssets.length === 0) {
      return res.status(404).json({
        code: 404,
        message: 'Asset not found',
        data: null
      });
    }
    
    // 更新资产信息
    await query(
      'UPDATE assets SET name = ?, code = ?, description = ? WHERE id = ?',
      [name, code, description, id]
    );
    
    const updatedAssets = await query('SELECT * FROM assets WHERE id = ?', [id]);
    
    res.json({
      code: 200,
      message: 'Asset updated successfully',
      data: updatedAssets[0]
    });
  } catch (error) {
    console.error('更新资产失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/assets/{id}:
 *   delete:
 *     summary: 删除资产
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 资产ID
 *     responses:
 *       200:
 *         description: 资产删除成功
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
 *         description: 资产未找到
 *       500:
 *         description: 服务器错误
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查资产是否存在
    const existingAssets = await query('SELECT * FROM assets WHERE id = ?', [id]);
    if (existingAssets.length === 0) {
      return res.status(404).json({
        code: 404,
        message: 'Asset not found',
        data: null
      });
    }
    
    // 检查是否有相关的交易记录
    const transactions = await query('SELECT * FROM transactions WHERE asset_id = ?', [id]);
    if (transactions.length > 0) {
      return res.status(400).json({
        code: 400,
        message: 'Cannot delete asset with associated transactions',
        data: null
      });
    }
    
    // 删除资产
    await query('DELETE FROM assets WHERE id = ?', [id]);
    
    res.json({
      code: 200,
      message: 'Asset deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('删除资产失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
});

export default router;