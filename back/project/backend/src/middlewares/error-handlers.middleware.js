const logger = require('../utils/logger.js');

/**
 * MongoDB錯誤處理中間件
 */
const handleMongoDBErrors = (error, req, res, next) => {
  let transformedError = error;

  // 處理MongoDB CastError (無效的ObjectId等)
  if (error.name === 'CastError') {
    const message = `無效的${error.path}: ${error.value}`;
    transformedError = {
      message,
      statusCode: 400,
      code: 'INVALID_DATA_FORMAT'
    };
  }

  // 處理MongoDB ValidationError
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(val => val.message);
    const message = `數據驗證失敗: ${errors.join(', ')}`;
    transformedError = {
      message,
      statusCode: 400,
      code: 'VALIDATION_ERROR'
    };
  }

  // 處理MongoDB重複鍵錯誤
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    const message = `${field} '${value}' 已存在`;
    transformedError = {
      message,
      statusCode: 400,
      code: 'DUPLICATE_FIELD'
    };
  }

  // 如果錯誤被轉換，設置新的錯誤對象
  if (transformedError !== error) {
    const newError = new Error(transformedError.message);
    newError.statusCode = transformedError.statusCode;
    newError.code = transformedError.code;
    req.error = newError;
    return next(newError);
  }

  next(error);
};

module.exports = { handleMongoDBErrors }; 