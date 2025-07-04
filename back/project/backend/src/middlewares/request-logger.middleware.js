const logger = require('../utils/logger.js');

/**
 * 請求日誌記錄中間件
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // 記錄請求開始
  logger.info('HTTP請求開始', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // 攔截響應結束事件
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // 記錄請求結束
    logger.info('HTTP請求結束', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    originalSend.call(this, data);
  };

  next();
};

module.exports = { requestLogger }; 