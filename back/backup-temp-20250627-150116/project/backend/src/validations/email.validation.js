import Joi from 'joi';

// 郵件驗證相關的驗證規則
export const emailValidation = {
  // 發送郵箱驗證碼請求驗證
  sendEmailVerification: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': '請輸入有效的郵箱地址',
        'any.required': '郵箱地址不能為空'
      }),
    type: Joi.string()
      .valid('registration', 'password_reset')
      .default('registration')
      .messages({
        'any.only': '郵件類型必須是 registration 或 password_reset'
      }),
    language: Joi.string()
      .valid('zh-TW', 'zh-CN', 'en')
      .default('zh-TW')
      .messages({
        'any.only': '語言必須是 zh-TW, zh-CN 或 en'
      })
  }),

  // 驗證郵箱驗證碼請求驗證
  verifyEmail: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': '請輸入有效的郵箱地址',
        'any.required': '郵箱地址不能為空'
      }),
    verificationCode: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        'string.pattern.base': '驗證碼必須是6位數字',
        'any.required': '驗證碼不能為空'
      }),
    type: Joi.string()
      .valid('registration', 'password_reset')
      .default('registration')
      .messages({
        'any.only': '驗證類型必須是 registration 或 password_reset'
      })
  }),

  // 重新發送驗證郵件請求驗證
  resendVerification: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': '請輸入有效的郵箱地址',
        'any.required': '郵箱地址不能為空'
      }),
    type: Joi.string()
      .valid('registration', 'password_reset')
      .default('registration')
      .messages({
        'any.only': '郵件類型必須是 registration 或 password_reset'
      })
  }),

  // 忘記密碼請求驗證
  forgotPassword: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': '請輸入有效的郵箱地址',
        'any.required': '郵箱地址不能為空'
      })
  }),

  // 重置密碼請求驗證
  resetPassword: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': '請輸入有效的郵箱地址',
        'any.required': '郵箱地址不能為空'
      }),
    verificationCode: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        'string.pattern.base': '驗證碼必須是6位數字',
        'any.required': '驗證碼不能為空'
      }),
    newPassword: Joi.string()
      .min(8)
      .max(100)
      .pattern(/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/)
      .required()
      .messages({
        'string.min': '密碼長度不能少於8位',
        'string.max': '密碼長度不能超過100位',
        'string.pattern.base': '密碼必須至少8位，包含字母和數字',
        'any.required': '新密碼不能為空'
      })
  }),

  // 邀請註冊驗證請求驗證
  verifyInviteRegistration: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': '請輸入有效的郵箱地址',
        'any.required': '郵箱地址不能為空'
      }),
    verificationCode: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        'string.pattern.base': '驗證碼必須是6位數字',
        'any.required': '驗證碼不能為空'
      }),
    inviteCode: Joi.string()
      .pattern(/^[A-Z0-9]{8}$/)
      .required()
      .messages({
        'string.pattern.base': '邀請碼必須是8位大寫字母和數字',
        'any.required': '邀請碼不能為空'
      })
  }),

  // 檢查郵箱驗證狀態查詢驗證
  checkEmailStatus: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': '請輸入有效的郵箱地址',
        'any.required': '郵箱地址不能為空'
      })
  }),

  // 管理員郵件統計查詢驗證
  adminEmailStats: Joi.object({
    startDate: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': '開始日期格式不正確，請使用 ISO 8601 格式'
      }),
    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .optional()
      .messages({
        'date.format': '結束日期格式不正確，請使用 ISO 8601 格式',
        'date.min': '結束日期不能早於開始日期'
      }),
    type: Joi.string()
      .valid('registration', 'password_reset', 'invite_confirmation', 'all')
      .default('all')
      .messages({
        'any.only': '郵件類型必須是 registration, password_reset, invite_confirmation 或 all'
      })
  }),

  // 管理員郵件日志查詢驗證
  adminEmailLogs: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': '頁碼必須是數字',
        'number.integer': '頁碼必須是整數',
        'number.min': '頁碼不能小於1'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .messages({
        'number.base': '每頁數量必須是數字',
        'number.integer': '每頁數量必須是整數',
        'number.min': '每頁數量不能小於1',
        'number.max': '每頁數量不能大於100'
      }),
    type: Joi.string()
      .valid('registration', 'password_reset', 'invite_confirmation')
      .optional()
      .messages({
        'any.only': '郵件類型必須是 registration, password_reset 或 invite_confirmation'
      }),
    status: Joi.string()
      .valid('pending', 'sent', 'failed', 'verified')
      .optional()
      .messages({
        'any.only': '狀態必須是 pending, sent, failed 或 verified'
      }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .optional()
      .messages({
        'string.email': '請輸入有效的郵箱地址'
      }),
    userId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': '用戶ID格式不正確'
      }),
    startDate: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': '開始日期格式不正確，請使用 ISO 8601 格式'
      }),
    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .optional()
      .messages({
        'date.format': '結束日期格式不正確，請使用 ISO 8601 格式',
        'date.min': '結束日期不能早於開始日期'
      })
  }),

  // ⭐ 一步式驗證並註冊請求驗證
  verifyAndRegister: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': '請輸入有效的郵箱地址',
        'any.required': '郵箱地址不能為空'
      }),
    verificationCode: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        'string.pattern.base': '驗證碼必須是6位數字',
        'any.required': '驗證碼不能為空'
      }),
    userData: Joi.object({
      name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': '姓名至少需要2個字符',
          'string.max': '姓名不能超過50個字符',
          'any.required': '姓名不能為空'
        }),
      password: Joi.string()
        .min(8)
        .max(100)
        .pattern(/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/)
        .required()
        .messages({
          'string.min': '密碼長度不能少於8位',
          'string.max': '密碼長度不能超過100位',
          'string.pattern.base': '密碼必須至少8位，包含字母和數字',
          'any.required': '密碼不能為空'
        }),
      industry: Joi.string()
        .trim()
        .max(100)
        .optional()
        .allow('')
        .messages({
          'string.max': '行業名稱不能超過100個字符'
        }),
      position: Joi.string()
        .trim()
        .max(100)
        .optional()
        .allow('')
        .messages({
          'string.max': '職位名稱不能超過100個字符'
        }),
      inviteCode: Joi.string()
        .pattern(/^[A-Z0-9]{8}$/)
        .optional()
        .allow('')
        .messages({
          'string.pattern.base': '邀請碼必須是8位大寫字母和數字'
        })
    }).required()
      .messages({
        'any.required': '用戶數據不能為空'
      })
  })
};

// 驗證中間件生成器
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // 不在第一個錯誤時停止
      allowUnknown: true, // 允許未知字段
      stripUnknown: true // 移除未知字段
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: '請求參數驗證失敗',
        errors: errorMessages
      });
    }

    // 將驗證後的數據替換到 req.body
    req.body = value;
    next();
  };
};

// 查詢參數驗證中間件生成器
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: '查詢參數驗證失敗',
        errors: errorMessages
      });
    }

    req.query = value;
    next();
  };
}; 