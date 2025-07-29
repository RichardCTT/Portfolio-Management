import express from 'express';
import { query, transaction } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Asset:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Asset ID
 *         name:
 *           type: string
 *           description: Asset name
 *         code:
 *           type: string
 *           description: Asset code
 *         quantity:
 *           type: number
 *           description: Asset quantity
 *         price:
 *           type: number
 *           description: Current price
 *         valueUSD:
 *           type: number
 *           description: Value in USD
 *         percentage:
 *           type: number
 *           description: Percentage of total portfolio
 *     AssetTypeSummary:
 *       type: object
 *       properties:
 *         value:
 *           type: number
 *           description: Total value in USD
 *         count:
 *           type: integer
 *           description: Number of assets
 *         totalPrice:
 *           type: number
 *           description: Total price in USD
 *         assets:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Asset'
 *         percentage:
 *           type: number
 *           description: Percentage of total portfolio
 *     AssetTotalsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             date:
 *               type: string
 *               format: date
 *               description: Analysis date
 *             totalValueUSD:
 *               type: number
 *               description: Total portfolio value in USD
 *             assetTypes:
 *               type: object
 *               properties:
 *                 cash:
 *                   $ref: '#/components/schemas/AssetTypeSummary'
 *                 stock:
 *                   $ref: '#/components/schemas/AssetTypeSummary'
 *                 bond:
 *                   $ref: '#/components/schemas/AssetTypeSummary'
 *                 cryptocurrency:
 *                   $ref: '#/components/schemas/AssetTypeSummary'
 *                 foreignCurrency:
 *                   $ref: '#/components/schemas/AssetTypeSummary'
 *                 futures:
 *                   $ref: '#/components/schemas/AssetTypeSummary'
 *             summary:
 *               type: object
 *               properties:
 *                 totalAssets:
 *                   type: integer
 *                   description: Total number of assets
 *                 totalValueUSD:
 *                   type: number
 *                   description: Total portfolio value in USD
 *     AssetTypeResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             date:
 *               type: string
 *               format: date
 *               description: Analysis date
 *             assetType:
 *               type: string
 *               description: Asset type name
 *             totalValueUSD:
 *               type: number
 *               description: Total value in USD
 *             totalPrice:
 *               type: number
 *               description: Total price in USD
 *             assets:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asset'
 *             summary:
 *               type: object
 *               properties:
 *                 totalAssets:
 *                   type: integer
 *                   description: Total number of assets
 *                 totalValueUSD:
 *                   type: number
 *                   description: Total value in USD
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           description: Error type
 *         message:
 *           type: string
 *           description: Error message
 */

/**
 * @swagger
 * /api/analysis/asset-totals-by-type:
 *   get:
 *     summary: Get total asset values by type for a specific date
 *     description: |
 *       Retrieves the total value of all assets categorized by type (cash, stock, bond, 
 *       cryptocurrency, foreign currency, futures) for a given date. All values are 
 *       converted to USD. If no date is provided, defaults to today.
 *     tags:
 *       - Asset Analysis
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         description: Analysis date (YYYY-MM-DD format). Defaults to today if not provided.
 *         required: false
 *     responses:
 *       200:
 *         description: Successfully retrieved asset totals by type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssetTotalsResponse'
 *             example:
 *               success: true
 *               data:
 *                 date: "2024-01-15"
 *                 totalValueUSD: 125000.50
 *                 assetTypes:
 *                   cash:
 *                     value: 25000.00
 *                     count: 3
 *                     totalPrice: 25000.00
 *                     percentage: 20.00
 *                     assets:
 *                       - id: 1
 *                         name: "USD Cash"
 *                         code: "USD"
 *                         quantity: 25000
 *                         price: 1.00
 *                         valueUSD: 25000.00
 *                         percentage: 100.00
 *                   stock:
 *                     value: 75000.00
 *                     count: 5
 *                     totalPrice: 75000.00
 *                     percentage: 60.00
 *                     assets:
 *                       - id: 2
 *                         name: "Apple Inc"
 *                         code: "AAPL"
 *                         quantity: 100
 *                         price: 150.00
 *                         valueUSD: 15000.00
 *                         percentage: 20.00
 *                   bond:
 *                     value: 15000.00
 *                     count: 2
 *                     totalPrice: 15000.00
 *                     percentage: 12.00
 *                     assets: []
 *                   cryptocurrency:
 *                     value: 5000.00
 *                     count: 1
 *                     totalPrice: 5000.00
 *                     percentage: 4.00
 *                     assets: []
 *                   foreignCurrency:
 *                     value: 3000.00
 *                     count: 1
 *                     totalPrice: 3000.00
 *                     percentage: 2.40
 *                     assets: []
 *                   futures:
 *                     value: 2000.50
 *                     count: 1
 *                     totalPrice: 2000.50
 *                     percentage: 1.60
 *                     assets: []
 *                 summary:
 *                   totalAssets: 13
 *                   totalValueUSD: 125000.50
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Main endpoint: Get total asset values by type for a specific date
router.get('/asset-totals-by-type/', async (req, res) => {
    try {
        // const { date = new Date().toISOString().split('T')[0] } = req.query;
        const date = req.query.date || new Date().toISOString().split('T')[0];

        
        // Step 1: Get all assets with their types
        const allAssets = await query(`
            SELECT a.id, a.name, a.code, a.quantity, a.asset_type_id,
                   at.name as asset_type_name
            FROM assets a
            JOIN asset_types at ON a.asset_type_id = at.id
            WHERE a.quantity > 0
        `);
        
        if (allAssets.length === 0) {
            return res.json({
                success: true,
                data: {
                    date: date,
                    totalValueUSD: 0,
                    assetTypes: {
                        cash: { value: 0, count: 0, totalPrice: 0, assets: [] },
                        stock: { value: 0, count: 0, totalPrice: 0, assets: [] },
                        bond: { value: 0, count: 0, totalPrice: 0, assets: [] },
                        cryptocurrency: { value: 0, count: 0, totalPrice: 0, assets: [] },
                        foreignCurrency: { value: 0, count: 0, totalPrice: 0, assets: [] },
                        futures: { value: 0, count: 0, totalPrice: 0, assets: [] }
                    },
                    summary: {
                        totalAssets: 0,
                        totalValueUSD: 0
                    }
                }
            });
        }
        
        // Step 2: Get asset IDs for all assets
        const assetIds = allAssets.map(asset => asset.id);
        
        // Step 3: Get prices for all assets on the specified date
        const priceRows = await query(`
            SELECT pd.asset_id, pd.price, pd.date
            FROM price_daily pd
            WHERE pd.asset_id IN (${assetIds.map(() => '?').join(',')})
            AND pd.date <= ?
            ORDER BY pd.asset_id, pd.date DESC
        `, [...assetIds, date]);
        
        // Step 4: Process assets and calculate total values by type
        const result = {
            date: date,
            totalValueUSD: 0,
            assetTypes: {
                cash: { value: 0, count: 0, totalPrice: 0, assets: [] },
                stock: { value: 0, count: 0, totalPrice: 0, assets: [] },
                bond: { value: 0, count: 0, totalPrice: 0, assets: [] },
                cryptocurrency: { value: 0, count: 0, totalPrice: 0, assets: [] },
                foreignCurrency: { value: 0, count: 0, totalPrice: 0, assets: [] },
                futures: { value: 0, count: 0, totalPrice: 0, assets: [] }
            },
            summary: {
                totalAssets: allAssets.length,
                totalValueUSD: 0
            }
        };
        
        // Group prices by asset_id and get the latest price for each asset
        const priceMap = new Map();
        priceRows.forEach(row => {
            if (!priceMap.has(row.asset_id)) {
                priceMap.set(row.asset_id, row.price);
            }
        });
        
        // Calculate value for each asset and categorize by type
        for (const asset of allAssets) {
            const price = priceMap.get(asset.id) || 0;
            const usdValue = price * asset.quantity;
            
            const assetObj = {
                id: asset.id,
                name: asset.name,
                code: asset.code,
                quantity: asset.quantity,
                price: price,
                valueUSD: Math.round(usdValue * 100) / 100
            };
            
            // Categorize asset by type
            switch (asset.asset_type_name.toLowerCase()) {
                case 'cash':
                    result.assetTypes.cash.count += 1;
                    result.assetTypes.cash.totalPrice += usdValue;
                    result.assetTypes.cash.assets.push(assetObj);
                    break;
                case 'stock':
                    result.assetTypes.stock.count += 1;
                    result.assetTypes.stock.totalPrice += usdValue;
                    result.assetTypes.stock.assets.push(assetObj);
                    break;
                case 'bond':
                    result.assetTypes.bond.count += 1;
                    result.assetTypes.bond.totalPrice += usdValue;
                    result.assetTypes.bond.assets.push(assetObj);
                    break;
                case 'cryptocurrency':
                    result.assetTypes.cryptocurrency.count += 1;
                    result.assetTypes.cryptocurrency.totalPrice += usdValue;
                    result.assetTypes.cryptocurrency.assets.push(assetObj);
                    break;
                case 'foreign currency':
                    result.assetTypes.foreignCurrency.count += 1;
                    result.assetTypes.foreignCurrency.totalPrice += usdValue;
                    result.assetTypes.foreignCurrency.assets.push(assetObj);
                    break;
                case 'futures':
                    result.assetTypes.futures.count += 1;
                    result.assetTypes.futures.totalPrice += usdValue;
                    result.assetTypes.futures.assets.push(assetObj);
                    break;
            }
            
            result.totalValueUSD += usdValue;
        }
        
        // Round all values to 2 decimal places
        result.totalValueUSD = Math.round(result.totalValueUSD * 100) / 100;
        result.summary.totalValueUSD = result.totalValueUSD;
        
        // Round values for each asset type and calculate percentages
        Object.keys(result.assetTypes).forEach(type => {
            result.assetTypes[type].value = Math.round(result.assetTypes[type].value * 100) / 100;
            result.assetTypes[type].totalPrice = Math.round(result.assetTypes[type].totalPrice * 100) / 100;
            
            if (result.totalValueUSD > 0) {
                result.assetTypes[type].percentage = Math.round((result.assetTypes[type].value / result.totalValueUSD) * 10000) / 100;
            } else {
                result.assetTypes[type].percentage = 0;
            }
        });
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('Error in asset totals by type analysis:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: error.message 
        });
    }
});

/**
 * @swagger
 * /api/analysis/asset-type/{type}:
 *   get:
 *     summary: Get total value for a specific asset type
 *     description: |
 *       Retrieves the total value and details of all assets of a specific type 
 *       (cash, stock, bond, cryptocurrency, foreigncurrency, futures) for a given date. 
 *       All values are converted to USD. If no date is provided, defaults to today.
 *     tags:
 *       - Asset Analysis
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [cash, stock, bond, cryptocurrency, foreigncurrency, futures]
 *         description: Asset type to analyze
 *         example: "stock"
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         description: Analysis date (YYYY-MM-DD format). Defaults to today if not provided.
 *         required: false
 *     responses:
 *       200:
 *         description: Successfully retrieved asset type totals
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssetTypeResponse'
 *             example:
 *               success: true
 *               data:
 *                 date: "2024-01-15"
 *                 assetType: "stock"
 *                 totalValueUSD: 75000.00
 *                 totalPrice: 75000.00
 *                 assets:
 *                   - id: 2
 *                     name: "Apple Inc"
 *                     code: "AAPL"
 *                     quantity: 100
 *                     price: 150.00
 *                     valueUSD: 15000.00
 *                     percentage: 20.00
 *                   - id: 3
 *                     name: "Microsoft Corp"
 *                     code: "MSFT"
 *                     quantity: 200
 *                     price: 300.00
 *                     valueUSD: 60000.00
 *                     percentage: 80.00
 *                 summary:
 *                   totalAssets: 2
 *                   totalValueUSD: 75000.00
 *       400:
 *         description: Invalid asset type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Invalid asset type"
 *               message: "Valid types are: cash, stock, bond, cryptocurrency, foreigncurrency, futures"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Get specific asset type total value
router.get('/asset-type/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { date = new Date().toISOString().split('T')[0] } = req.query;
        
        // Validate asset type
        const validTypes = ['cash', 'stock', 'bond', 'cryptocurrency', 'foreigncurrency', 'futures'];
        const normalizedType = type.toLowerCase();
        
        if (!validTypes.includes(normalizedType)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid asset type',
                message: 'Valid types are: cash, stock, bond, cryptocurrency, foreigncurrency, futures'
            });
        }
        
        // Map URL parameter to database field
        const typeMapping = {
            'cash': 'Cash',
            'stock': 'Stock',
            'bond': 'Bond',
            'cryptocurrency': 'Cryptocurrency',
            'foreigncurrency': 'Foreign Currency',
            'futures': 'Futures'
        };
        
        const dbTypeName = typeMapping[normalizedType];
        
        // Get assets of specific type
        const assets = await query(`
            SELECT a.id, a.name, a.code, a.quantity, a.asset_type_id,
                   at.name as asset_type_name
            FROM assets a
            JOIN asset_types at ON a.asset_type_id = at.id
            WHERE at.name = ? AND a.quantity > 0
        `, [dbTypeName]);
        
        if (assets.length === 0) {
            return res.json({
                success: true,
                data: {
                    date: date,
                    assetType: normalizedType,
                    totalValueUSD: 0,
                    totalPrice: 0,
                    assets: [],
                    summary: {
                        totalAssets: 0,
                        totalValueUSD: 0
                    }
                }
            });
        }
        
        // Get asset IDs
        const assetIds = assets.map(asset => asset.id);
        
        // Get prices for assets on the specified date
        const priceRows = await query(`
            SELECT pd.asset_id, pd.price, pd.date
            FROM price_daily pd
            WHERE pd.asset_id IN (${assetIds.map(() => '?').join(',')})
            AND pd.date <= ?
            ORDER BY pd.asset_id, pd.date DESC
        `, [...assetIds, date]);
        
        // Process assets
        const result = {
            date: date,
            assetType: normalizedType,
            totalValueUSD: 0,
            totalPrice: 0,
            assets: [],
            summary: {
                totalAssets: assets.length,
                totalValueUSD: 0
            }
        };
        
        // Group prices by asset_id
        const priceMap = new Map();
        priceRows.forEach(row => {
            if (!priceMap.has(row.asset_id)) {
                priceMap.set(row.asset_id, row.price);
            }
        });
        
        // Calculate values
        for (const asset of assets) {
            const price = priceMap.get(asset.id) || 0;
            const usdValue = price * asset.quantity;
            
            const assetObj = {
                id: asset.id,
                name: asset.name,
                code: asset.code,
                quantity: asset.quantity,
                price: price,
                valueUSD: Math.round(usdValue * 100) / 100
            };
            
            result.assets.push(assetObj);
            result.totalValueUSD += usdValue;
            result.totalPrice += usdValue;
        }
        
        // Round total values
        result.totalValueUSD = Math.round(result.totalValueUSD * 100) / 100;
        result.totalPrice = Math.round(result.totalPrice * 100) / 100;
        result.summary.totalValueUSD = result.totalValueUSD;
        
        // Calculate percentages for each asset
        result.assets.forEach(asset => {
            if (result.totalValueUSD > 0) {
                asset.percentage = Math.round((asset.valueUSD / result.totalValueUSD) * 10000) / 100;
            } else {
                asset.percentage = 0;
            }
        });
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('Error getting asset type total value:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: error.message 
        });
    }
});


export default router;