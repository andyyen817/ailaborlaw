const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

// 載入環境變量
if (fs.existsSync('.env')) {
  dotenv.config();
} else {
  // 如果.env文件不存在，使用默認值
  process.env.PORT = process.env.PORT || 5000;
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/laborlaw';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'laborlaw_secure_jwt_secret';
  process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';
}

// 導入自定義模塊
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/error.middleware');
const apiRoutes = require('./routes/api.routes');
const storeState = require('./utils/store.state');

// 創建Express應用
const app = express();

// 嘗試連接到MongoDB，但如果連接失敗也能繼續運行
connectDB().catch(error => {
  logger.error(`無法連接到MongoDB: ${error.message}`);
  logger.info('以內存模式繼續運行（僅用於API測試）');
  storeState.setUsingMemoryMode(true);
});

// 創建logs目錄（如果不存在）
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// 基本中間件
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());

// 請求日誌中間件
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// API路由
app.use('/api/v1', apiRoutes);

// 首頁路由
app.get('/', (req, res) => {
  res.json({
    message: '勞法通AI API服務',
    status: 'online',
    version: '1.0.0'
  });
});

// 404處理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '請求的資源不存在'
    }
  });
});

// 錯誤處理中間件
app.use(errorHandler);

// 啟動服務器
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`服務器在${process.env.NODE_ENV}模式下運行於端口: ${PORT}`);
});

// 處理未捕獲的異常
process.on('uncaughtException', (err) => {
  logger.error(`未捕獲的異常: ${err.message}`);
  console.log(err);
  // 不要立即退出，記錄錯誤但不停止服務器
  // process.exit(1);
});

// 處理未處理的Promise拒絕
process.on('unhandledRejection', (err) => {
  logger.error(`未處理的Promise拒絕: ${err.message}`);
  console.log(err);
  // 不要關閉服務器，只記錄錯誤
  // server.close(() => {
  //   process.exit(1);
  // });
}); 