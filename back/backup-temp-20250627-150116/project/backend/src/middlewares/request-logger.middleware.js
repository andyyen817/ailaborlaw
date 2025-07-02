import logger from '../utils/logger.js';

/**
 * 請求日誌中間件
 * 記錄每個請求的詳細信息，包括路徑、方法、參數和響應時間
 */
export const requestLogger = (req, res, next) => {
  // 記錄請求開始時間
  req.startTime = Date.now();
  
  // 當響應完成時記錄請求詳情
  res.on('finish', () => {
    const responseTime = Date.now() - req.startTime;
    
    // 獲取IP地址
    const ip = req.headers['x-forwarded-for'] || 
               req.connection.remoteAddress ||
               req.socket.remoteAddress;
    
    // 格式化請求參數 (去除敏感信息)
    const sanitizedQuery = { ...req.query };
    const sanitizedBody = { ...req.body };
    
    // 從請求參數中移除敏感信息
    ['password', 'passwordConfirm', 'token', 'refreshToken', 'authorization'].forEach(field => {
      if (sanitizedQuery[field]) sanitizedQuery[field] = '[REDACTED]';
      if (sanitizedBody[field]) sanitizedBody[field] = '[REDACTED]';
    });
    
    // 構建日誌消息
    const logInfo = {
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip,
      userAgent: req.headers['user-agent'],
      userId: req.user ? req.user._id : 'unauthenticated',
      params: req.params,
      query: sanitizedQuery
    };
    
    // 根據狀態碼選擇日誌級別
    if (res.statusCode >= 500) {
      logger.error(`請求失敗: ${req.method} ${req.originalUrl || req.url}`, logInfo);
    } else if (res.statusCode >= 400) {
      logger.warn(`請求警告: ${req.method} ${req.originalUrl || req.url}`, logInfo);
    } else {
      logger.info(`請求成功: ${req.method} ${req.originalUrl || req.url}`, logInfo);
    }
  });
  
  next();
}; 