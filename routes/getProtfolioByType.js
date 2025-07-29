import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Transaction ID
 *         asset_id:
 *           type: integer
 *           description: Asset ID
 *         asset_name:
 *           type: string
 *           description: Asset name
 *         asset_code:
 *           type: string
 *           description: Asset code
 *         asset_type_name:
 *           type: string
 *           description: Asset type name
 *         transaction_type:
 *           type: string
 *           enum: [IN, OUT]
 *           description: Transaction type (IN = add, OUT = remove)
 *         quantity:
 *           type: number
 *           description: Quantity involved in transaction
 *         price:
 *           type: number
 *           description: Unit price at time of transaction
 *         transaction_date:
 *           type: string
 *           format: date-time
 *           description: Date and time of transaction
 *         holding:
 *           type: number
 *           description: Asset balance after this transaction
 *         description:
 *           type: string
 *           description: Transaction description or notes
 *     TransactionsByTypeResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             asset_type_id:
 *               type: integer
 *               description: Asset type ID
 *             asset_type_name:
 *               type: string
 *               description: Asset type name
 *             date_range:
 *               type: object
 *               properties:
 *                 start_date:
 *                   type: string
 *                   format: date
 *                   description: Start date of the filter range
 *                 end_date:
 *                   type: string
 *                   format: date
 *                   description: End date of the filter range
 *               description: Date range used for filtering (null if no date filter applied)
 *             total_transactions:
 *               type: integer
 *               description: Total number of transactions
 *             transactions:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *             summary:
 *               type: object
 *               properties:
 *                 total_in_quantity:
 *                   type: number
 *                   description: Total quantity added (IN transactions)
 *                 total_out_quantity:
 *                   type: number
 *                   description: Total quantity removed (OUT transactions)
 *                 net_quantity:
 *                   type: number
 *                   description: Net quantity (IN - OUT)
 *                 total_in_value:
 *                   type: number
 *                   description: Total value of IN transactions
 *                 total_out_value:
 *                   type: number
 *                   description: Total value of OUT transactions
 *                 net_value:
 *                   type: number
 *                   description: Net value (IN - OUT)
 */

/**
 * @swagger
 * /api/portfolio/transactions-by-type/{asset_type_id}:
 *   get:
 *     summary: Get all transactions for assets of a specific type within a date range
 *     description: |
 *       Retrieves all transaction records for assets belonging to a specific asset type
 *       within an optional date range. The endpoint joins asset_types, assets, and 
 *       transactions tables to provide comprehensive transaction data with asset and 
 *       type information.
 *     tags:
 *       - Portfolio Analysis
 *     parameters:
 *       - in: path
 *         name: asset_type_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Asset type ID to filter transactions
 *         example: 2
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-07-01"
 *         description: Start date for filtering transactions (YYYY-MM-DD format). Optional.
 *         required: false
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-07-31"
 *         description: End date for filtering transactions (YYYY-MM-DD format). Optional.
 *         required: false
 *     responses:
 *       200:
 *         description: Successfully retrieved transactions for the asset type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionsByTypeResponse'
 *             example:
 *               success: true
 *               data:
 *                 asset_type_id: 2
 *                 asset_type_name: "Stock"
 *                 date_range: {
 *                   start_date: "2025-07-01",
 *                   end_date: "2025-07-31"
 *                 }
 *                 total_transactions: 5
 *                 transactions:
 *                   - id: 1
 *                     asset_id: 2
 *                     asset_name: "Apple Inc."
 *                     asset_code: "AAPL"
 *                     asset_type_name: "Stock"
 *                     transaction_type: "IN"
 *                     quantity: 100
 *                     price: 150.00
 *                     transaction_date: "2025-07-15T10:30:00"
 *                     holding: 100
 *                     description: "Initial purchase"
 *                   - id: 2
 *                     asset_id: 3
 *                     asset_name: "Microsoft Corporation"
 *                     asset_code: "MSFT"
 *                     asset_type_name: "Stock"
 *                     transaction_type: "IN"
 *                     quantity: 50
 *                     price: 300.00
 *                     transaction_date: "2025-07-16T14:20:00"
 *                     holding: 50
 *                     description: "Stock purchase"
 *                 summary:
 *                   total_in_quantity: 150
 *                   total_out_quantity: 0
 *                   net_quantity: 150
 *                   total_in_value: 30000.00
 *                   total_out_value: 0.00
 *                   net_value: 30000.00
 *       400:
 *         description: Invalid asset type ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Asset type not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Get all transactions for assets of a specific type
router.get('/transactions-by-type/:asset_type_id', async (req, res) => {
    try {
        const { asset_type_id } = req.params;
        const { start_date, end_date } = req.query;
        
        // Validate asset_type_id
        if (!asset_type_id || isNaN(parseInt(asset_type_id)) || parseInt(asset_type_id) <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid asset type ID',
                message: 'Asset type ID must be a positive integer'
            });
        }

        // Validate date parameters
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (start_date && !dateRegex.test(start_date)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid start date format',
                message: 'Start date must be in YYYY-MM-DD format'
            });
        }
        if (end_date && !dateRegex.test(end_date)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid end date format',
                message: 'End date must be in YYYY-MM-DD format'
            });
        }
        if (start_date && end_date && start_date > end_date) {
            return res.status(400).json({
                success: false,
                error: 'Invalid date range',
                message: 'Start date cannot be later than end date'
            });
        }

        // Step 1: Verify the asset type exists
        const assetType = await query(`
            SELECT id, name, unit, description
            FROM asset_types
            WHERE id = ?
        `, [asset_type_id]);

        if (assetType.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Asset type not found',
                message: `Asset type with ID ${asset_type_id} does not exist`
            });
        }

        // Step 2: Get all assets of this type
        const assets = await query(`
            SELECT id, name, code, quantity, asset_type_id
            FROM assets
            WHERE asset_type_id = ?
        `, [asset_type_id]);

        if (assets.length === 0) {
            return res.json({
                success: true,
                data: {
                    asset_type_id: parseInt(asset_type_id),
                    asset_type_name: assetType[0].name,
                    date_range: start_date || end_date ? {
                        start_date: start_date || null,
                        end_date: end_date || null
                    } : null,
                    total_transactions: 0,
                    transactions: [],
                    summary: {
                        total_in_quantity: 0,
                        total_out_quantity: 0,
                        net_quantity: 0,
                        total_in_value: 0,
                        total_out_value: 0,
                        net_value: 0
                    }
                }
            });
        }

        // Step 3: Get asset IDs
        const assetIds = assets.map(asset => asset.id);

        // Step 4: Get all transactions for these assets with optional date filtering
        let transactionsQuery = `
            SELECT 
                t.id,
                t.asset_id,
                a.name as asset_name,
                a.code as asset_code,
                at.name as asset_type_name,
                t.transaction_type,
                t.quantity,
                t.price,
                t.transaction_date,
                t.holding,
                t.description
            FROM transactions t
            JOIN assets a ON t.asset_id = a.id
            JOIN asset_types at ON a.asset_type_id = at.id
            WHERE t.asset_id IN (${assetIds.map(() => '?').join(',')})
        `;
        
        let queryParams = [...assetIds];
        
        // Add date range conditions if provided
        if (start_date) {
            transactionsQuery += ` AND DATE(t.transaction_date) >= ?`;
            queryParams.push(start_date);
        }
        if (end_date) {
            transactionsQuery += ` AND DATE(t.transaction_date) <= ?`;
            queryParams.push(end_date);
        }
        
        transactionsQuery += ` ORDER BY t.transaction_date DESC, t.id DESC`;
        
        const transactions = await query(transactionsQuery, queryParams);

        // Step 5: Calculate summary statistics
        const summary = {
            total_in_quantity: 0,
            total_out_quantity: 0,
            net_quantity: 0,
            total_in_value: 0,
            total_out_value: 0,
            net_value: 0
        };

        transactions.forEach(transaction => {
            if (transaction.transaction_type === 'IN') {
                summary.total_in_quantity += transaction.quantity;
                summary.total_in_value += transaction.quantity * transaction.price;
            } else if (transaction.transaction_type === 'OUT') {
                summary.total_out_quantity += transaction.quantity;
                summary.total_out_value += transaction.quantity * transaction.price;
            }
        });

        summary.net_quantity = summary.total_in_quantity - summary.total_out_quantity;
        summary.net_value = summary.total_in_value - summary.total_out_value;

        // Round all monetary values to 2 decimal places
        summary.total_in_value = Math.round(summary.total_in_value * 100) / 100;
        summary.total_out_value = Math.round(summary.total_out_value * 100) / 100;
        summary.net_value = Math.round(summary.net_value * 100) / 100;

        // Round quantities to 4 decimal places for precision
        summary.total_in_quantity = Math.round(summary.total_in_quantity * 10000) / 10000;
        summary.total_out_quantity = Math.round(summary.total_out_quantity * 10000) / 10000;
        summary.net_quantity = Math.round(summary.net_quantity * 10000) / 10000;

        res.json({
            success: true,
            data: {
                asset_type_id: parseInt(asset_type_id),
                asset_type_name: assetType[0].name,
                date_range: start_date || end_date ? {
                    start_date: start_date || null,
                    end_date: end_date || null
                } : null,
                total_transactions: transactions.length,
                transactions: transactions,
                summary: summary
            }
        });

    } catch (error) {
        console.error('Error getting transactions by asset type:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

export default router;
