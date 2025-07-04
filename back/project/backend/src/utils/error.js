/**
 * 自定義錯誤類和錯誤處理工具
 */

class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorUtils = {
  // 400 錯誤
  badRequest: (message = '請求參數錯誤', details = null) => {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  },

  // 401 錯誤
  unauthorized: (message = '未授權訪問', details = null) => {
    return new AppError(message, 401, 'UNAUTHORIZED', details);
  },

  // 403 錯誤
  forbidden: (message = '禁止訪問', details = null) => {
    return new AppError(message, 403, 'FORBIDDEN', details);
  },

  // 404 錯誤
  notFound: (message = '資源不存在', details = null) => {
    return new AppError(message, 404, 'NOT_FOUND', details);
  },

  // 409 錯誤
  conflict: (message = '資源衝突', details = null) => {
    return new AppError(message, 409, 'CONFLICT', details);
  },

  // 422 錯誤
  validationError: (message = '數據驗證失敗', details = null) => {
    return new AppError(message, 422, 'VALIDATION_ERROR', details);
  },

  // 500 錯誤
  internalServerError: (message = '內部服務器錯誤', details = null) => {
    return new AppError(message, 500, 'INTERNAL_SERVER_ERROR', details);
  }
};

module.exports = {
  AppError,
  errorUtils
}; 