import { body, validationResult } from 'express-validator';

/**
 * 用戶註冊數據驗證規則
 */
export const validateRegistration = [
  // 驗證用戶名/暱稱
  body('name')
    .notEmpty().withMessage('用戶名稱不能為空')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('用戶名稱長度應在2-50個字符之間'),
  
  // 驗證電子郵箱
  body('email')
    .notEmpty().withMessage('電子郵箱不能為空')
    .trim()
    .isEmail().withMessage('請提供有效的電子郵箱地址')
    .normalizeEmail(),
  
  // 驗證密碼
  body('password')
    .notEmpty().withMessage('密碼不能為空')
    .isLength({ min: 8 }).withMessage('密碼長度不能少於8位')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/).withMessage('密碼必須至少8位，包含字母和數字'),
  
  // 驗證用戶類型
  body('userType')
    .optional()
    .isIn(['admin', 'hr', 'employer', 'employee']).withMessage('無效的用戶類型'),
  
  // 驗證行業 (直接字段)
  body('industry')
    .optional()
    .trim(),
  
  // 驗證職位/職業 (直接字段)
  body('position')
    .optional()
    .trim(),
  
  // 驗證職位/職業 (舊字段，向後兼容)
  body('occupation')
    .optional()
    .trim(),
  
  // 驗證邀請碼
  body('inviteCode')
    .optional()
    .trim(),
  
  // 驗證公司名稱
  body('companyName')
    .optional()
    .trim(),
  
  // 驗證個人資料對象中的行業
  body('profile.industry')
    .optional()
    .trim(),
  
  // 驗證個人資料對象中的職位
  body('profile.position')
    .optional()
    .trim()
];

/**
 * 用戶登入數據驗證規則
 */
export const validateLogin = [
  // 驗證電子郵箱
  body('email')
    .notEmpty().withMessage('電子郵箱不能為空')
    .trim()
    .isEmail().withMessage('請提供有效的電子郵箱地址')
    .normalizeEmail(),
  
  // 驗證密碼
  body('password')
    .notEmpty().withMessage('密碼不能為空')
];

/**
 * 處理驗證錯誤的中間件
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '輸入數據驗證失敗',
      error: {
        code: 'VALIDATION_ERROR',
        details: errors.array()
      }
    });
  }
  next();
}; 