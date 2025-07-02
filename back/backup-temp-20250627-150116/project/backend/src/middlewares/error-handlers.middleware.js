import { errorUtils } from '../utils/error.js';
import logger from '../utils/logger.js';

/**
 * 包裝異步控制器函數，捕獲任何錯誤並傳遞給全局錯誤處理中間件
 * @param {Function} fn - 要包裝的異步控制器函數
 * @returns {Function} - 包裝後的控制器函數
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 處理數據驗證錯誤的中間件
 */
export const handleValidationErrors = (req, res, next) => {
  // 處理 express-validator 的驗證錯誤
  const errors = req.validationErrors?.();
  
  if (errors && errors.length > 0) {
    // 格式化驗證錯誤信息
    const messages = errors.map(err => `${err.param}: ${err.msg}`).join('; ');
    
    // 創建驗證錯誤並傳遞給全局錯誤處理中間件
    return next(errorUtils.validationError(`數據驗證失敗: ${messages}`, 'VALIDATION_ERROR'));
  }
  
  next();
};

/**
 * 處理常見的MongoDB錯誤
 */
export const handleMongoDBErrors = (err, req, res, next) => {
  // 處理MongoDB重複鍵錯誤（例如唯一索引衝突）
  if (err.name === 'MongoServerError' && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    logger.warn(`MongoDB重複鍵錯誤: ${field}=${value}`, {
      field, 
      value,
      collection: err.collection || 'unknown',
      operation: req.method,
      path: req.path
    });
    
    return next(
      errorUtils.conflict(
        `${field} 值 "${value}" 已存在，請使用另一個值`,
        'DUPLICATE_KEY_ERROR'
      )
    );
  }
  
  // 處理MongoDB驗證錯誤
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message).join('; ');
    
    logger.warn(`MongoDB驗證錯誤: ${messages}`, {
      validationErrors: Object.keys(err.errors),
      operation: req.method,
      path: req.path
    });
    
    return next(
      errorUtils.validationError(
        `數據驗證錯誤: ${messages}`,
        'MONGO_VALIDATION_ERROR'
      )
    );
  }
  
  // 處理MongoDB轉換錯誤
  if (err.name === 'CastError') {
    logger.warn(`MongoDB類型轉換錯誤: ${err.message}`, {
      path: err.path,
      value: err.value,
      operation: req.method,
      url: req.path
    });
    
    return next(
      errorUtils.badRequest(
        `無效的 ${err.path}: ${err.value}`,
        'INVALID_ID_ERROR'
      )
    );
  }
  
  // 如果不是特定的MongoDB錯誤，繼續傳遞給下一個錯誤處理中間件
  next(err);
};

// 導出其他可能的錯誤處理中間件
export const errorHandlers = {
  catchAsync,
  handleValidationErrors,
  handleMongoDBErrors
}; 