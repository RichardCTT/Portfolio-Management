import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());

// 基础路由
/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome endpoint
 *     description: Returns a welcome message and server status.
 *     responses:
 *       200:
 *         description: Successful response
 */

app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Portfolio Management API',
    status: 'Server is running',
    version: '1.0.0',
    swagger_docs: `http://localhost:${PORT}/api-docs`
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});

export default app;
