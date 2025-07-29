import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import assetTypesRouter from './routes/asset_types.js';
import assetRouter from './routes/assets.js';
import transactionRouter from './routes/transactions.js';
import priceDailyRouter from './routes/price_daily.js';
import analysisRouter from './routes/analysis.js';
import portfolioRouter from './routes/getProtfolioByType.js';

const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());

// 路由
app.use('/api/asset_types', assetTypesRouter);
app.use('/api/assets', assetRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/price_daily', priceDailyRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/portfolio', portfolioRouter);

// 基础路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Portfolio Management API',
    status: 'Server is running',
    version: '1.0.0',
    swagger_docs: `http://localhost:${PORT}/api-docs`
  });
});

// 挂载路由，确保资产类型路由在/api/asset_types路径下
app.use('/api/asset_types', assetTypesRouter);

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});

export default app;
