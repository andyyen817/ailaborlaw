const { validationResult } = require('express-validator');

/**
 * 验证中间件
 * 处理express-validator的验证结果，如果有错误则返回400状态码
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: '请求数据验证失败',
      errors: errorMessages,
      data: null
    });
  }
  
  next();
};

module.exports = validateRequest;
module.exports.validateRequest = validateRequest; 