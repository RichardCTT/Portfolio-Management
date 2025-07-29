import express from 'express';
import { query, transaction } from '../config/database.js';

const router = express.Router();

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