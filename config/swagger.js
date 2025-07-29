import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio Management API',
      version: '1.0.0',
      description: 'A comprehensive API for managing investment portfolios, tracking assets, and analyzing portfolio performance. Supports multiple asset types including cash, stocks, bonds, cryptocurrencies, foreign currencies, and futures.',
      contact: {
        name: 'API Support',
        email: 'support@portfoliomanagement.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.portfoliomanagement.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Asset Analysis',
        description: 'Endpoints for analyzing portfolio assets and performance'
      },
      {
        name: 'Assets',
        description: 'Endpoints for managing individual assets'
      },
      {
        name: 'Asset Types',
        description: 'Endpoints for managing asset type categories'
      },
      {
        name: 'Transactions',
        description: 'Endpoints for managing investment transactions'
      },
      {
        name: 'Price Data',
        description: 'Endpoints for managing daily price data'
      }
    ]
  },
  apis: ['./routes/*.js', './app.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
