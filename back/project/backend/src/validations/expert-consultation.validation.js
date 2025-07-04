const { body, validationResult } = require('express-validator');

/**
 * 专家咨询验证规则
 */

// 验证咨询申请提交
const validateExpertConsultation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('姓名為必填項')
    .isLength({ min: 1, max: 100 })
    .withMessage('姓名長度必須在1-100個字符之間'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('電話號碼為必填項')
    .matches(/^(\+886-?)?0?9\d{8}$/)
    .withMessage('請輸入有效的台灣手機號碼格式'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('請輸入有效的電子郵箱格式')
    .normalizeEmail(),

  body('service')
    .notEmpty()
    .withMessage('服務類型為必填項'),

  body('details')
    .trim()
    .notEmpty()
    .withMessage('問題詳情為必填項')
    .isLength({ min: 10, max: 2000 })
    .withMessage('問題詳情長度必須在10-2000個字符之間'),

  // 中间件函数处理验证结果
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入數據驗證失敗',
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

// 验证咨询更新 (管理员)
const validateConsultationUpdate = [
  body('status')
    .optional()
    .isIn(['pending', 'processing', 'completed', 'cancelled'])
    .withMessage('無效的狀態值'),

  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('管理員備註不能超過1000個字符'),

  // 中间件函数处理验证结果
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入數據驗證失敗',
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

// 验证查询参数
const validateQueryParams = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('頁碼必須是大於0的整數'),

  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每頁數量必須在1-100之間'),

  // 中间件函数处理验证结果
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '查詢參數驗證失敗',
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

module.exports = {
  validateExpertConsultation,
  validateConsultationUpdate,
  validateQueryParams
}; 