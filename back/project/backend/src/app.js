import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path'; // path可能在ESM中需要不同处理，但這是必要的
import { fileURLToPath } from 'url'; // 如果需要 __dirname 或 __filename

// 加载环境变量 - dotenv.config() 应该尽可能早地执行
dotenv.config();

// 加載環境變量配置
import setupEnvironment from './config/env.config.js';
setupEnvironment(); // 設置必要的環境變量

// 导入配置
// 假设 appConfig, connectDatabase, logger 都已转换为 ES 模块
import appConfig from './config/app.js'; // 假设 app.js 是 ES 模块
import connectDatabase from './config/database.js';
import logger from './utils/logger.js';
import mainApiRouter from './routes/index.js'; // 假设 routes/index.js 是主 API 路由器
import { AppError, errorUtils } from './utils/error.js';
import { requestLogger } from './middlewares/request-logger.middleware.js';
import { handleMongoDBErrors } from './middlewares/error-handlers.middleware.js';

// 创建Express应用
const app = express();

// ES Module equivalents for __dirname (if needed, e.g., for serving static files)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// 连接数据库
connectDatabase();

// 安全和基礎中間件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:']
    }
  }
})); // 配置安全HTTP头允許內聯腳本和樣式用於測試頁面

// 設置CORS允許跨域請求
const corsOptions = {
  origin: [
    'https://iztxzvmtxzzc.sealosgzg.site',  // ⭐ 新增：生產環境前端域名
    'https://wmdelchfajsi.sealosgzg.site',  // 保留：備用前端域名
    'http://localhost:3032',                // 保留：本地開發環境
    'http://localhost:3001',                // ⭐ 新增：前端开发端口（修复CORS问题）
    'http://localhost:3000',                // 保留：備用本地端口
    'http://127.0.0.1:3032',               // 新增：本地IP訪問
    'http://127.0.0.1:3001',               // ⭐ 新增：前端开发端口IP版本
    'http://127.0.0.1:3000',               // 新增：備用本地IP
    'http://userai-laborlaw.ns-2rlrcc3k.svc.cluster.local:3000',
    'http://localhost:3029',
    'http://localhost:3003',
    'https://ailabordevbox.ns-2rlrcc3k.sealos.run',
    'https://wrrfvodsaofk.sealosgzg.site'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',                        // ⭐ JWT令牌認證
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'Cache-Control', 
    'Pragma', 
    'Expires'
  ],
  exposedHeaders: [
    'Content-Disposition',                  // 文件下載需要
    'X-Total-Count',                       // 分頁總數
    'X-Page-Count'                         // 分頁頁數
  ],
  maxAge: 86400,                           // 預檢請求緩存24小時
  optionsSuccessStatus: 200                // 某些瀏覽器（IE11, 各種SmartTVs）在204上會出錯
};
app.use(cors(corsOptions)); // 使用自定義CORS設置
app.use(express.json()); // 解析JSON请求體
app.use(express.urlencoded({ extended: true })); // 解析URL编码请求體

// 請求日誌中間件（自定義）
app.use(requestLogger);

// 日志记录 (morgan) - HTTP 請求日誌
if (process.env.NODE_ENV === 'development') { // 直接使用 process.env
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()) // morgan stream
    }
  }));
}

// 靜態文件服務 - 提供測試API頁面
app.use(express.static(rootDir));

// API路由 - 将从 routes/index.js 导入并使用
app.use('/api', mainApiRouter); // 使用导入的路由器

// 基础路由
app.get('/', (req, res) => {
  res.json({
    message: '歡迎使用 AI勞基法顧問 API',
    version: '1.0.0',
    status: 'running'
  });
});

// API測試頁面路由
app.get('/test-api', (req, res) => {
  res.sendFile(path.join(rootDir, 'test-api.html'));
});

// 404 错误处理中间件 (如果之前的路由都未匹配)
app.use((req, res, next) => {
  // 使用新的 AppError 和 errorUtils
  next(errorUtils.notFound(`找不到路徑: ${req.originalUrl}`));
});

// MongoDB錯誤處理中間件
app.use(handleMongoDBErrors);

// 全局错误处理中间件 (必须在所有路由和中间件之后定义)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // 判斷錯誤類型並設置狀態碼和消息
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'UNKNOWN_ERROR');
  const isOperational = err.isOperational !== undefined ? err.isOperational : statusCode < 500;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // 記錄錯誤到日誌系統
  if (statusCode >= 500) {
    logger.error(`服務器錯誤: ${err.message}`, { 
      stack: err.stack, 
      path: req.path, 
      method: req.method,
      code: errorCode,
      userId: req.user ? req.user.id : 'unauthenticated'
    });
  } else {
    logger.warn(`請求錯誤: ${err.message}`, {
      path: req.path,
      method: req.method,
      code: errorCode,
      status: statusCode,
      userId: req.user ? req.user.id : 'unauthenticated'
    });
  }
  
  // 返回適當的錯誤響應
  res.status(statusCode).json({
    success: false,
    message: isOperational ? err.message : (isProduction ? '服務器發生未知錯誤' : err.message),
    error: {
      code: errorCode,
      details: isProduction && !isOperational ? undefined : err.stack // 不在生產環境暴露堆疊給非業務錯誤
    }
  });
});

// 启动服务器
const PORT = process.env.PORT || 7070;
app.listen(PORT, () => {
  logger.info(`服務器在端口 ${PORT} 上運行，環境：${process.env.NODE_ENV}`);
  logger.info(`内网地址: http://ailabordevbox.ns-2rlrcc3k.svc.cluster.local:${PORT}`);
  logger.info(`公网地址: https://wrrfvodsaofk.sealosgzg.site`);
});

export default app; // 如果需要导出 app 实例 (例如用于测试)
