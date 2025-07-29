import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import assetTypesRouter from './routes/asset_types.js';
import assetRouter from './routes/assets.js';
import transactionRouter from './routes/transactions.js';
import priceDailyRouter from './routes/price_daily.js';
import analysisRouter from './routes/analysis.js';

const app = express();


// Swagger UI 界面
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Swagger JSON 端点 - 提供原始的 OpenAPI JSON 规范
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

const PORT = process.env.PORT || 3000;

// 中间件配置
// CORS 配置 - 允许前端跨域访问
app.use(cors({
  origin: [
    'http://localhost:3000',    // React 默认端口
    'http://localhost:3001',    // React 备用端口
    'http://localhost:8080',    // Vue/其他框架常用端口
    'http://localhost:8081',    
    'http://localhost:5173',    // Vite 默认端口
    'http://localhost:4200',    // Angular 默认端口
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173'
  ],
  credentials: true,              // 允许携带凭据
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// JSON 解析中间件
app.use(express.json());

// 路由
app.use('/api/asset_types', assetTypesRouter);
app.use('/api/assets', assetRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/price_daily', priceDailyRouter);
app.use('/api/analysis', analysisRouter);

// 基础路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Portfolio Management API',
    status: 'Server is running',
    version: '1.0.0',
    documentation: {
      swagger_ui: `http://localhost:${PORT}/api-docs`,
      swagger_json: `http://localhost:${PORT}/api-docs.json`
    },
    endpoints: {
      assets: `http://localhost:${PORT}/api/assets`,
      asset_types: `http://localhost:${PORT}/api/asset_types`,
      transactions: `http://localhost:${PORT}/api/transactions`,
      price_daily: `http://localhost:${PORT}/api/price_daily`,
      analysis: `http://localhost:${PORT}/api/analysis`
    }
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
