/**
 * 應用程序錯誤類
 * 用於創建具有特定狀態碼和是否為操作性錯誤標記的錯誤
 */
class AppError extends Error {
  /**
   * @param {string} message - 錯誤消息
   * @param {number} statusCode - HTTP狀態碼
   * @param {string} code - 錯誤代碼
   * @param {boolean} isOperational - 是否為可預期的操作錯誤
   */
  constructor(message, statusCode = 500, code = 'SERVER_ERROR', isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 常見HTTP錯誤輔助函數
 */
const errorUtils = {
  /**
   * 創建400錯誤 - 錯誤的請求
   * @param {string} message - 錯誤消息
   * @param {string} code - 錯誤代碼
   * @returns {AppError} 應用程序錯誤實例
   */
  badRequest: (message = '請求無效', code = 'BAD_REQUEST') => {
    return new AppError(message, 400, code);
  },

  /**
   * 創建401錯誤 - 未認證
   * @param {string} message - 錯誤消息
   * @param {string} code - 錯誤代碼
   * @returns {AppError} 應用程序錯誤實例
   */
  unauthorized: (message = '未提供認證或認證無效', code = 'UNAUTHORIZED') => {
    return new AppError(message, 401, code);
  },

  /**
   * 創建403錯誤 - 禁止訪問
   * @param {string} message - 錯誤消息
   * @param {string} code - 錯誤代碼
   * @returns {AppError} 應用程序錯誤實例
   */
  forbidden: (message = '禁止訪問此資源', code = 'FORBIDDEN') => {
    return new AppError(message, 403, code);
  },

  /**
   * 創建404錯誤 - 資源不存在
   * @param {string} message - 錯誤消息
   * @param {string} code - 錯誤代碼
   * @returns {AppError} 應用程序錯誤實例
   */
  notFound: (message = '請求的資源不存在', code = 'NOT_FOUND') => {
    return new AppError(message, 404, code);
  },

  /**
   * 創建409錯誤 - 衝突
   * @param {string} message - 錯誤消息
   * @param {string} code - 錯誤代碼
   * @returns {AppError} 應用程序錯誤實例
   */
  conflict: (message = '請求衝突', code = 'CONFLICT') => {
    return new AppError(message, 409, code);
  },

  /**
   * 創建422錯誤 - 無法處理的實體
   * @param {string} message - 錯誤消息
   * @param {string} code - 錯誤代碼
   * @returns {AppError} 應用程序錯誤實例
   */
  validationError: (message = '提供的數據無效', code = 'VALIDATION_ERROR') => {
    return new AppError(message, 422, code);
  },

  /**
   * 創建429錯誤 - 請求過多
   * @param {string} message - 錯誤消息
   * @param {string} code - 錯誤代碼
   * @returns {AppError} 應用程序錯誤實例
   */
  tooManyRequests: (message = '請求頻率過高', code = 'TOO_MANY_REQUESTS') => {
    return new AppError(message, 429, code);
  },

  /**
   * 創建500錯誤 - 服務器錯誤
   * @param {string} message - 錯誤消息
   * @param {string} code - 錯誤代碼
   * @param {boolean} isOperational - 是否為操作性錯誤
   * @returns {AppError} 應用程序錯誤實例
   */
  serverError: (message = '服務器內部錯誤', code = 'SERVER_ERROR', isOperational = false) => {
    return new AppError(message, 500, code, isOperational);
  }
};

export { AppError, errorUtils }; 