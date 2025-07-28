# Portfolio Management

A portfolio management system API built with Express.js

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

4. Or start production server:
```bash
npm start
```

5. Visit: http://localhost:3000

## API Endpoints

- `GET /` - Welcome page

## Project Structure

```
Portfolio-Management/
├── app.js              # Main application file
├── package.json        # Project configuration
├── .env.example        # Environment variables example
├── .gitignore         # Git ignore file
├── routes/            # Routes folder
├── config/            # Configuration folder
└── public/            # Static files folder
```

## Development

- Use `npm run dev` to start development mode (requires nodemon)
- Use `npm test` to run tests