const { body } = require('express-validator');

exports.validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('用戶名稱必須在2-50個字符之間'),
  body('email')
    .isEmail()
    .withMessage('請提供有效的電子郵箱地址')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('密碼必須至少8個字符')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
    .withMessage('密碼必須包含至少一個字母和一個數字'),
  body('userType')
    .optional()
    .isIn(['employee', 'employer', 'hr', 'admin'])
    .withMessage('用戶類型必須是: employee, employer, hr, admin')
];

exports.validateLogin = [
  body('email')
    .isEmail()
    .withMessage('請提供有效的電子郵箱地址')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('請提供密碼')
]; 