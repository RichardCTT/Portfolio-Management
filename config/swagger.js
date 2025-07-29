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
    ]
  },
  apis: ['./routes/*.js', './app.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;