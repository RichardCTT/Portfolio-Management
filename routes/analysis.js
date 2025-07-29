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
 *           example: "2025-07-29"
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
 *                 date: "2025-07-29"
 *                 totalValueUSD: 125000.50
 *                 assetTypes:
 *                   cash:
 *                     count: 3
 *                     totalPrice: 25000.00
 *                     percentage: 20.00
 *                     typeName: "Cash"
 *                     unit: "USD"
 *                     assets:
 *                       - id: 1
 *                         name: "USD Cash"
 *                         code: "USD"
 *                         quantity: 25000
 *                         price: 1.00
 *                         valueUSD: 25000.00
 *                         percentage: 100.00
 *                   stock:
 *                     count: 5
 *                     totalPrice: 75000.00
 *                     percentage: 60.00
 *                     typeName: "Stock"
 *                     unit: "shares"
 *                     assets:
 *                       - id: 2
 *                         name: "Apple Inc"
 *                         code: "AAPL"
 *                         quantity: 100
 *                         price: 150.00
 *                         valueUSD: 15000.00
 *                         percentage: 20.00
 *                   bond:
 *                     count: 2
 *                     totalPrice: 15000.00
 *                     percentage: 12.00
 *                     typeName: "Bond"
 *                     unit: "units"
 *                     assets: []
 *                   cryptocurrency:
 *                     count: 1
 *                     totalPrice: 5000.00
 *                     percentage: 4.00
 *                     typeName: "Cryptocurrency"
 *                     unit: "coins"
 *                     assets: []
 *                   foreigncurrency:
 *                     count: 1
 *                     totalPrice: 3000.00
 *                     percentage: 2.40
 *                     typeName: "Foreign Currency"
 *                     unit: "units"
 *                     assets: []
 *                   futures:
 *                     count: 1
 *                     totalPrice: 2000.50
 *                     percentage: 1.60
 *                     typeName: "Futures"
 *                     unit: "contracts"
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

        // Step 1: Get all asset types from database
        const assetTypes = await query(`
            SELECT id, name, unit, description
            FROM asset_types
            ORDER BY name
        `);
        
        // Step 2: Get all assets with their types
        const allAssets = await query(`
            SELECT a.id, a.name, a.code, a.quantity, a.asset_type_id,
                   at.name as asset_type_name
            FROM assets a
            JOIN asset_types at ON a.asset_type_id = at.id
            WHERE a.quantity > 0
        `);
        
        if (allAssets.length === 0) {
            // Initialize result with all asset types from database
            const result = {
                date: date,
                totalValueUSD: 0,
                assetTypes: {},
                summary: {
                    totalAssets: 0,
                    totalValueUSD: 0
                }
            };
            
            // Initialize each asset type with zero values
            assetTypes.forEach(type => {
                const typeKey = type.name.toLowerCase().replace(/\s+/g, '');
                result.assetTypes[typeKey] = { 
                    count: 0, 
                    totalPrice: 0, 
                    assets: [],
                    typeName: type.name,
                    unit: type.unit
                };
            });
            
            return res.json({
                success: true,
                data: result
            });
        }
        
        // Step 3: Get asset IDs for all assets
        const assetIds = allAssets.map(asset => asset.id);
        
        // Step 4: Get prices for all assets on the specified date
        const priceRows = await query(`
            SELECT pd.asset_id, pd.price, pd.date
            FROM price_daily pd
            WHERE pd.asset_id IN (${assetIds.map(() => '?').join(',')})
            AND pd.date <= ?
            ORDER BY pd.asset_id, pd.date DESC
        `, [...assetIds, date]);
        
        // Step 5: Process assets and calculate total values by type
        const result = {
            date: date,
            totalValueUSD: 0,
            assetTypes: {},
            summary: {
                totalAssets: allAssets.length,
                totalValueUSD: 0
            }
        };
        
        // Initialize all asset types from database
        assetTypes.forEach(type => {
            const typeKey = type.name.toLowerCase().replace(/\s+/g, '');
            result.assetTypes[typeKey] = { 
                count: 0, 
                totalPrice: 0, 
                assets: [],
                typeName: type.name,
                unit: type.unit
            };
        });
        
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
            
            // Categorize asset by type using the asset type name from database
            const typeKey = asset.asset_type_name.toLowerCase().replace(/\s+/g, '');
            
            if (result.assetTypes[typeKey]) {
                result.assetTypes[typeKey].count += 1;
                result.assetTypes[typeKey].totalPrice += usdValue;
                result.assetTypes[typeKey].assets.push(assetObj);
            } else {
                // If asset type not found in our initialized types, create it
                result.assetTypes[typeKey] = {
                    count: 1,
                    totalPrice: usdValue,
                    assets: [assetObj],
                    typeName: asset.asset_type_name,
                    unit: null
                };
            }
            
            result.totalValueUSD += usdValue;
        }
        
        // Round all values to 2 decimal places
        result.totalValueUSD = Math.round(result.totalValueUSD * 100) / 100;
        result.summary.totalValueUSD = result.totalValueUSD;
        
        // Round values for each asset type and calculate percentages
        Object.keys(result.assetTypes).forEach(type => {
            result.assetTypes[type].totalPrice = Math.round(result.assetTypes[type].totalPrice * 100) / 100;
            
            if (result.totalValueUSD > 0) {
                result.assetTypes[type].percentage = Math.round((result.assetTypes[type].totalPrice / result.totalValueUSD) * 10000) / 100;
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


export default router;