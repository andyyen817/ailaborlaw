import { body, validationResult } from 'express-validator';
import { SPECIALTIES, REGIONS } from '../models/labor_advisor.model.js';

/**
 * 劳资顾问数据验证规则
 */

// 验证规则：创建劳资顾问
export const validateLaborAdvisor = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('顧問姓名為必填項')
    .isLength({ min: 1, max: 100 })
    .withMessage('姓名長度需在1-100個字符之間'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('電話號碼為必填項')
    .matches(/^(\+886-?)?((0\d{1,2}-?\d{6,8})|(\d{2,3}-?\d{6,8})|(09\d{8}))$/)
    .withMessage('請輸入有效的電話號碼格式'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('電子郵箱為必填項')
    .isEmail()
    .withMessage('請輸入有效的電子郵箱格式')
    .normalizeEmail(),

  body('lineId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Line ID不能超過100個字符'),

  body('region')
    .notEmpty()
    .withMessage('服務地區為必填項')
    .isIn(Object.values(REGIONS))
    .withMessage('請選擇有效的服務地區'),

  body('specialties')
    .isArray({ min: 1 })
    .withMessage('請至少選擇一個專業領域')
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new Error('專業領域必須是數組格式');
      }
      const validSpecialties = Object.values(SPECIALTIES);
      const invalidSpecialties = value.filter(s => !validSpecialties.includes(s));
      if (invalidSpecialties.length > 0) {
        throw new Error(`無效的專業領域: ${invalidSpecialties.join(', ')}`);
      }
      return true;
    }),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('備註不能超過500個字符'),

  // 验证结果处理中间件
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }));

      return res.status(400).json({
        success: false,
        message: '數據驗證失敗',
        error: {
          code: 'VALIDATION_ERROR',
          details: errorMessages
        }
      });
    }
    next();
  }
];

// 验证规则：更新劳资顾问
export const validateAdvisorUpdate = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('顧問姓名不能為空')
    .isLength({ min: 1, max: 100 })
    .withMessage('姓名長度需在1-100個字符之間'),

  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('電話號碼不能為空')
    .matches(/^(\+886-?)?((0\d{1,2}-?\d{6,8})|(\d{2,3}-?\d{6,8})|(09\d{8}))$/)
    .withMessage('請輸入有效的電話號碼格式'),

  body('email')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('電子郵箱不能為空')
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
    .notEmpty()
    .withMessage('服務地區不能為空')
    .isIn(Object.values(REGIONS))
    .withMessage('請選擇有效的服務地區'),

  body('specialties')
    .optional()
    .isArray({ min: 1 })
    .withMessage('請至少選擇一個專業領域')
    .custom((value) => {
      if (value && !Array.isArray(value)) {
        throw new Error('專業領域必須是數組格式');
      }
      if (value) {
        const validSpecialties = Object.values(SPECIALTIES);
        const invalidSpecialties = value.filter(s => !validSpecialties.includes(s));
        if (invalidSpecialties.length > 0) {
          throw new Error(`無效的專業領域: ${invalidSpecialties.join(', ')}`);
        }
      }
      return true;
    }),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('活躍狀態必須是布爾值'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('備註不能超過500個字符'),

  // 验证结果处理中间件
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }));

      return res.status(400).json({
        success: false,
        message: '數據驗證失敗',
        error: {
          code: 'VALIDATION_ERROR',
          details: errorMessages
        }
      });
    }
    next();
  }
];

// 验证规则：指派顾问
export const validateAdvisorAssignment = [
  body('advisorId')
    .notEmpty()
    .withMessage('顧問ID為必填項')
    .isString()
    .withMessage('顧問ID必須是字符串'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('指派備註不能超過500個字符'),

  // 验证结果处理中间件
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }));

      return res.status(400).json({
        success: false,
        message: '指派數據驗證失敗',
        error: {
          code: 'ASSIGNMENT_VALIDATION_ERROR',
          details: errorMessages
        }
      });
    }
    next();
  }
]; 
