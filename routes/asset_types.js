import express from 'express';
import { query, transaction } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Asset Types
 *   description: 资产类型管理 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AssetType:
 *       type: object
 *       required:
 *         - name
 *         - unit
 *       properties:
 *         id:
 *           type: integer
 *           description: 资产类型ID
 *         name:
 *           type: string
 *           description: 资产类型名称
 *         unit:
 *           type: string
 *           description: 计量单位
 *         description:
 *           type: string
 *           description: 描述
 *       example:
 *         id: 1
 *         name: 贵金属
 *         unit: kg
 *         description: 黄金、白银等
 */

/**
 * @swagger
 * /api/asset_types:
 *   get:
 *     summary: 获取所有资产类型
 *     tags: [Asset Types]
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
 *     responses:
 *       200:
 *         description: 成功获取资产类型列表
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
 *                         $ref: '#/components/schemas/AssetType'
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
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.page_size) || 10;
    const offset = (page - 1) * pageSize;

    const [items, totalResult] = await Promise.all([
      query(`SELECT id, name, unit, description FROM asset_types LIMIT ${pageSize} OFFSET ${offset}`, []),
      query('SELECT COUNT(*) as total FROM asset_types')
    ]);

    res.json({
      code: 200,
      message: 'Success',
      data: {
        items,
        total: totalResult[0].total,
        page,
        page_size: pageSize
      }
    });
  } catch (error) {
    console.error('获取资产类型列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/asset_types/{id}:
 *   get:
 *     summary: 获取单个资产类型
 *     tags: [Asset Types]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 资产类型ID
 *     responses:
 *       200:
 *         description: 成功获取资产类型
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
 *                   $ref: '#/components/schemas/AssetType'
 *       404:
 *         description: 资产类型未找到
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT id, name, unit, description FROM asset_types WHERE id = ?', [id]);

    if (result.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '资产类型未找到',
        data: null
      });
    }

    res.json({
      code: 200,
      message: 'Success',
      data: result[0]
    });
  } catch (error) {
    console.error('获取资产类型错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/asset_types:
 *   post:
 *     summary: 创建资产类型
 *     tags: [Asset Types]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - unit
 *             properties:
 *               name:
 *                 type: string
 *               unit:
 *                 type: string
 *               description:
 *                 type: string
 *             example:
 *               name: 化工原料
 *               unit: 吨
 *               description: 石油、塑料颗粒等
 *     responses:
 *       201:
 *         description: 资产类型创建成功
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
 *                   $ref: '#/components/schemas/AssetType'
 *       500:
 *         description: 服务器错误
 */
router.post('/', async (req, res) => {
  try {
    const { name, unit, description } = req.body;

    const result = await query(
      'INSERT INTO asset_types (name, unit, description) VALUES (?, ?, ?)',
      [name, unit, description]
    );

    const newAssetType = {
      id: result.insertId,
      name,
      unit,
      description
    };

    res.status(201).json({
      code: 201,
      message: 'Asset type created successfully',
      data: newAssetType
    });
  } catch (error) {
    console.error('创建资产类型错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/asset_types/{id}:
 *   put:
 *     summary: 更新资产类型
 *     tags: [Asset Types]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 资产类型ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               unit:
 *                 type: string
 *               description:
 *                 type: string
 *             example:
 *               name: 稀有金属
 *               unit: 吨
 *               description: 铂金、铑等
 *     responses:
 *       200:
 *         description: 资产类型更新成功
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
 *                   $ref: '#/components/schemas/AssetType'
 *       404:
 *         description: 资产类型未找到
 *       500:
 *         description: 服务器错误
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, description } = req.body;

    // 检查资产类型是否存在
    const existing = await query('SELECT id FROM asset_types WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '资产类型未找到',
        data: null
      });
    }

    await query(
      'UPDATE asset_types SET name = ?, unit = ?, description = ? WHERE id = ?',
      [name, unit, description, id]
    );

    const updatedAssetType = {
      id: parseInt(id),
      name,
      unit,
      description
    };

    res.json({
      code: 200,
      message: 'Asset type updated successfully',
      data: updatedAssetType
    });
  } catch (error) {
    console.error('更新资产类型错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

/**
 * @swagger
 * /api/asset_types/{id}:
 *   delete:
 *     summary: 删除资产类型
 *     tags: [Asset Types]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 资产类型ID
 *     responses:
 *       200:
 *         description: 资产类型删除成功
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
 *         description: 资产类型未找到
 *       409:
 *         description: 资产类型关联了资产，无法删除
 *       500:
 *         description: 服务器错误
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查资产类型是否存在
    const existing = await query('SELECT id FROM asset_types WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '资产类型未找到',
        data: null
      });
    }

    // 检查是否有资产关联到该类型
    const assets = await query('SELECT id FROM assets WHERE asset_type_id = ?', [id]);
    if (assets.length > 0) {
      return res.status(409).json({
        code: 409,
        message: '该资产类型下有关联资产，无法删除',
        data: null
      });
    }

    await query('DELETE FROM asset_types WHERE id = ?', [id]);

    res.json({
      code: 200,
      message: 'Asset type deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('删除资产类型错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

export default router;