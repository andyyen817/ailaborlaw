const Joi = require('joi');

// 發送驗證碼 (用於註冊驗證、密碼重置、邀請註冊)
const sendVerificationCodeSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': '請輸入有效的郵箱地址',
      'any.required': '郵箱地址為必填項'
    }),
  
  type: Joi.string()
    .valid('register', 'password_reset', 'invite_register')
    .required()
    .messages({
      'any.only': '驗證類型只能是 register、password_reset 或 invite_register',
      'any.required': '驗證類型為必填項'
    }),
  
  // 邀請註冊時需要提供邀請碼
  inviteCode: Joi.when('type', {
    is: 'invite_register',
    then: Joi.string()
      .length(8)
      .uppercase()
      .required()
      .messages({
        'string.length': '邀請碼必須是8位字符',
        'string.uppercase': '邀請碼必須是大寫字母',
        'any.required': '邀請註冊需要提供邀請碼'
      }),
    otherwise: Joi.optional()
  })
});

// 驗證郵箱驗證碼 (用於確認註冊)
const verifyEmailCodeSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': '請輸入有效的郵箱地址',
      'any.required': '郵箱地址為必填項'
    }),
  
  code: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.pattern.base': '驗證碼必須是6位數字',
      'any.required': '驗證碼為必填項'
    })
});

// 重置密碼 (使用驗證碼)
const resetPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': '請輸入有效的郵箱地址',
      'any.required': '郵箱地址為必填項'
    }),
  
  code: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.pattern.base': '驗證碼必須是6位數字',
      'any.required': '驗證碼為必填項'
    }),
  
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': '密碼長度不能少於8位',
      'string.max': '密碼長度不能超過128位',
      'string.pattern.base': '密碼必須包含至少一個小寫字母、一個大寫字母和一個數字',
      'any.required': '新密碼為必填項'
    })
});

// 邀請註冊完整流程
const inviteRegisterSchema = Joi.object({
  // 步驟1：基本信息
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.min': '姓名長度不能少於2位',
      'string.max': '姓名長度不能超過50位',
      'any.required': '姓名為必填項'
    }),
  
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': '請輸入有效的郵箱地址',
      'any.required': '郵箱地址為必填項'
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': '密碼長度不能少於8位',
      'string.max': '密碼長度不能超過128位',
      'string.pattern.base': '密碼必須包含至少一個小寫字母、一個大寫字母和一個數字',
      'any.required': '密碼為必填項'
    }),
  
  userType: Joi.string()
    .valid('hr', 'employer', 'employee')
    .default('employee')
    .messages({
      'any.only': '用戶類型只能是 hr、employer 或 employee'
    }),
  
  // 步驟2：邀請信息
  inviteCode: Joi.string()
    .length(8)
    .uppercase()
    .required()
    .messages({
      'string.length': '邀請碼必須是8位字符',
      'string.uppercase': '邀請碼必須是大寫字母',
      'any.required': '邀請碼為必填項'
    }),
  
  // 步驟3：郵箱驗證
  emailVerificationCode: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.pattern.base': '驗證碼必須是6位數字',
      'any.required': '郵箱驗證碼為必填項'
    }),
  
  // 可選：個人資料
  profile: Joi.object({
    industry: Joi.string().max(100).trim().allow(''),
    position: Joi.string().max(100).trim().allow(''),
    company: Joi.string().max(100).trim().allow(''),
    phone: Joi.string().max(20).trim().allow('')
  }).optional()
});

// 驗證函數工廠
const createValidator = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // 返回所有錯誤，不只是第一個
      stripUnknown: true // 移除未知字段
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: '輸入驗證失敗',
        error: {
          code: 'VALIDATION_ERROR',
          details: errors
        }
      });
    }

    // 將驗證後的數據附加到 req.body
    req.body = value;
    next();
  };
};

// 導出所有驗證中間件
module.exports = {
  validateSendVerificationCode: createValidator(sendVerificationCodeSchema),
  validateVerifyEmailCode: createValidator(verifyEmailCodeSchema), 
  validateResetPassword: createValidator(resetPasswordSchema),
  validateInviteRegister: createValidator(inviteRegisterSchema),
  
  // 導出原始 schema 用於測試
  schemas: {
    sendVerificationCodeSchema,
    verifyEmailCodeSchema,
    resetPasswordSchema,
    inviteRegisterSchema
  }
}; 