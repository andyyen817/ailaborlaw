const logger = require('../utils/logger');

// 全局錯誤處理中間件
const errorHandler = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`);
  
  // 處理MongoDB重複鍵錯誤
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_KEY',
        message: '數據已存在',
        details: err.keyValue
      }
    });
  }

  // 處理驗證錯誤
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '數據驗證失敗',
        details: messages
      }
    });
  }

  // 處理JWT錯誤
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: '無效的認證令牌'
      }
    });
  }

  // 默認為500服務器錯誤
  return res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: '伺服器錯誤，請稍後再試'
    }
  });
};

module.exports = errorHandler; 