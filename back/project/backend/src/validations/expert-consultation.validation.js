import { body, validationResult } from 'express-validator';
import { SERVICE_TYPES, CONTACT_METHODS } from '../models/expert_consultation.model.js';
import { REGIONS } from '../models/labor_advisor.model.js';

/**
 * 专家咨询验证规则
 */

// 验证咨询申请提交
export const validateExpertConsultation = [
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

  body('lineId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Line ID不能超過100個字符'),

  body('region')
    .optional()
    .isIn(Object.values(REGIONS))
    .withMessage('無效的地區選擇'),

  body('service')
    .notEmpty()
    .withMessage('服務類型為必填項')
    .isIn(Object.values(SERVICE_TYPES))
    .withMessage('無效的服務類型'),

  body('details')
    .trim()
    .notEmpty()
    .withMessage('問題詳情為必填項')
    .isLength({ min: 10, max: 2000 })
    .withMessage('問題詳情長度必須在10-2000個字符之間'),

  body('preferredContact')
    .isArray({ min: 1 })
    .withMessage('請至少選擇一種聯繫方式')
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new Error('聯繫方式必須是數組格式');
      }
      const validMethods = Object.values(CONTACT_METHODS);
      const isValid = value.every(method => validMethods.includes(method));
      if (!isValid) {
        throw new Error('包含無效的聯繫方式');
      }
      return true;
    }),

  body('timeOfDay')
    .optional()
    .isIn(['morning', 'afternoon', 'evening'])
    .withMessage('無效的時間段'),

  body('startTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('開始時間格式無效 (應為 HH:MM)'),

  body('endTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('結束時間格式無效 (應為 HH:MM)'),

  body('simplifiedTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):(00|30)$/)
    .withMessage('簡化時間格式無效 (應為 HH:MM，分鐘只能是00或30)'),

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
export const validateConsultationUpdate = [
  body('status')
    .optional()
    .isIn(['pending', 'processing', 'completed', 'cancelled'])
    .withMessage('無效的狀態值'),

  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('管理員備註不能超過1000個字符'),

  body('forceUpdate')
    .optional()
    .isBoolean()
    .withMessage('強制更新參數必須是布爾值'),

  body('region')
    .optional()
    .isIn(Object.values(REGIONS))
    .withMessage('無效的地區選擇'),

  body('assignedAdvisorId')
    .optional()
    .isString()
    .withMessage('指派顧問ID必須是字符串'),

  body('simplifiedTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):(00|30)$/)
    .withMessage('簡化時間格式無效 (應為 HH:MM，分鐘只能是00或30)'),

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
export const validateQueryParams = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('頁碼必須是大於0的整數'),

  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每頁數量必須在1-100之間'),

  body('status')
    .optional()
    .isIn(['pending', 'processing', 'completed', 'cancelled'])
    .withMessage('無效的狀態篩選值'),

  body('serviceType')
    .optional()
    .isIn(Object.values(SERVICE_TYPES))
    .withMessage('無效的服務類型篩選值'),

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