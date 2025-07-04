const winston = require('winston');
const path = require('path');

/**
 * Winston Logger 配置
 * 提供結構化日誌記錄功能
 */

// 日誌目錄
const logDir = path.join(__dirname, '../../logs');

// 自定義日誌格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 控制台輸出格式
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

// 創建logger實例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'ai-labor-advisor' },
  transports: [
    // 錯誤日誌文件
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      handleExceptions: true
    }),
    
    // 組合日誌文件
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  exitOnError: false
});

// 開發環境加入控制台輸出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    handleExceptions: true
  }));
}

// 添加HTTP日誌文件（用於Morgan）
logger.add(new winston.transports.File({
  filename: path.join(logDir, 'http.log'),
  level: 'info',
  maxsize: 5242880, // 5MB
  maxFiles: 5
}));

module.exports = logger;
