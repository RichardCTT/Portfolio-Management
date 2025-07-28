# Portfolio Management

一个基于Express.js的投资组合管理系统API

## 快速开始

1. 安装依赖：
```bash
npm install
```

2. 复制环境变量文件：
```bash
cp .env.example .env
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 或启动生产服务器：
```bash
npm start
```

5. 访问：http://localhost:3000

## API 端点

- `GET /` - 欢迎页面

## 项目结构

```
Portfolio-Management/
├── app.js              # 主应用文件
├── package.json        # 项目配置
├── .env.example        # 环境变量示例
├── .gitignore         # Git忽略文件
├── routes/            # 路由文件夹
├── config/            # 配置文件夹
└── public/            # 静态文件夹
```

## 开发

- 使用 `npm run dev` 启动开发模式（需要安装 nodemon）
- 使用 `npm test` 运行测试