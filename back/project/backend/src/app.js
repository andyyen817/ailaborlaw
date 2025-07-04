const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// 載入環境變量
dotenv.config();

// 注意：我們修改了 env.config.js 現在它是 CommonJS，所以不需要 default 導入
const envConfig = require('./config/env.config.js');

// 載入其他模組 - 都改為 CommonJS
const appConfig = require('./config/app.js');
const connectDatabase = require('./config/database.js');
const logger = require('./utils/logger.js');
const mainApiRouter = require('./routes/index.js');
const { AppError, errorUtils } = require('./utils/error.js');
const { requestLogger } = require('./middlewares/request-logger.middleware.js');
const { handleMongoDBErrors } = require('./middlewares/error-handlers.middleware.js');

const app = express();

// 中間件配置
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // 允許無 origin 的請求（如 Postman、curl）
    if (!origin) return callback(null, true);
    
    // 允許的域名列表
    const allowedOrigins = [
      'https://ailaborlawbackv1.vercel.app',
      'https://ailaborlaw.vercel.app',
      'http://localhost:3000',
      'http://localhost:7070',
      'file://', // 允許本地 HTML 文件
    ];
    
    // 檢查是否為允許的域名或以 file:// 開頭
    if (allowedOrigins.some(allowed => 
      origin === allowed || 
      origin.startsWith('file://') ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('https://localhost')
    )) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// 手動處理 OPTIONS 請求
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 請求日誌記錄
app.use(requestLogger);

// 靜態文件服務
app.use(express.static(path.join(__dirname, '../public')));

// 根路由
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎉 AI勞基法顧問後端API服務',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'MongoDB (Connected)',
    api_docs: '/api/v1/docs',
    health_check: '/api/v1/health'
  });
});

// 健康檢查端點
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// API 路由
app.use('/api/v1', mainApiRouter);

// 測試頁面路由
app.get('/test-api.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-api.html'));
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `找不到路由: ${req.method} ${req.originalUrl}`,
    error: {
      code: 'ROUTE_NOT_FOUND',
      details: `The requested endpoint ${req.originalUrl} does not exist.`
    }
  });
});

// MongoDB 錯誤處理中間件
app.use(handleMongoDBErrors);

// 全域錯誤處理
app.use((error, req, res, next) => {
  logger.error('全域錯誤處理:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // 如果錯誤是 AppError 的實例，使用其狀態碼和消息
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: {
        code: error.code || 'APPLICATION_ERROR',
        details: error.details || error.message
      }
    });
  }

  // 處理 MongoDB 相關錯誤
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: '數據驗證失敗',
      error: {
        code: 'VALIDATION_ERROR',
        details: Object.values(error.errors).map(err => err.message)
      }
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: '無效的數據格式',
      error: {
        code: 'INVALID_DATA_FORMAT',
        details: `Invalid ${error.path}: ${error.value}`
      }
    });
  }

  // 預設錯誤回應
  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || '內部服務器錯誤';

  res.status(statusCode).json({
    success: false,
    message: message,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.stack : '服務器遇到了一個錯誤，請稍後再試。'
    }
  });
});

// 資料庫連接和伺服器啟動
async function startServer() {
  try {
    // 連接資料庫
    await connectDatabase();
    
    const PORT = process.env.PORT || 7070;
    
    app.listen(PORT, () => {
      logger.info(`🚀 服務器運行在端口 ${PORT}`);
      logger.info(`🌐 API地址: http://localhost:${PORT}`);
      logger.info(`📚 API文檔: http://localhost:${PORT}/api/v1/docs`);
      logger.info(`🏥 健康檢查: http://localhost:${PORT}/api/v1/health`);
      logger.info(`🧪 測試頁面: http://localhost:${PORT}/test-api.html`);
    });

  } catch (error) {
    logger.error('❌ 服務器啟動失敗:', error);
    process.exit(1);
  }
}

// 為 Vercel 導出應用
module.exports = app;

// 如果直接運行此文件，啟動服務器
if (require.main === module) {
  startServer();
}
