import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 確保日誌目錄存在
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, '../../logs');

// 如果日誌目錄不存在則創建
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 自定義日誌等級
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 根據環境選擇日誌等級
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// 定義日誌顏色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// 添加顏色到日誌等級
winston.addColors(colors);

// 自定義日誌格式
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}${
      Object.keys(info).filter(key => !['timestamp', 'level', 'message', 'stack', 'service'].includes(key)).length > 0
        ? '\n' + JSON.stringify(Object.entries(info)
            .filter(([key]) => !['timestamp', 'level', 'message', 'stack', 'service'].includes(key))
            .reduce((obj, [key, val]) => ({...obj, [key]: val}), {}), null, 2)
        : ''
    }`
  )
);

// 文件日誌格式 (JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * 配置日誌系統
 */
const logger = winston.createLogger({
  level: level(),
  levels,
  format: fileFormat,
  defaultMeta: { service: 'ai-labor-advisor' },
  transports: [
    // 寫入所有 error 級別日誌到文件
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 為 HTTP 請求寫入專門的日誌文件
    new winston.transports.File({
      filename: path.join(logsDir, 'http.log'),
      level: 'http',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 寫入所有日誌到文件
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// 在非生產環境添加控制台輸出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// 添加HTTP日誌輔助方法
logger.http = (message, meta) => {
  return logger.log('http', message, meta);
};

export default logger;
