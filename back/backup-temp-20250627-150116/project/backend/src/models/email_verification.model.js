import mongoose from 'mongoose';

/**
 * 郵箱驗證碼模型
 * 獨立存儲驗證碼，支持前端一步式註冊
 */
const emailVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  verificationCode: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['registration', 'password_reset', 'invite_confirmation'],
    required: true,
    default: 'registration',
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  // IP地址，用於頻率限制
  ipAddress: {
    type: String,
    trim: true
  },
  // 是否已使用
  isUsed: {
    type: Boolean,
    default: false,
    index: true
  },
  // 使用時間
  usedAt: {
    type: Date,
    default: null
  },
  // 臨時鎖定時間
  tempLockedAt: {
    type: Date,
    default: null
  }
});

// 複合索引優化查詢性能
emailVerificationSchema.index({ email: 1, type: 1 });
emailVerificationSchema.index({ email: 1, verificationCode: 1 });
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL索引，自動刪除過期記錄
emailVerificationSchema.index({ tempLockedAt: 1 }); // ⭐ 新增：臨時鎖定時間索引，優化並發查詢
emailVerificationSchema.index({ isUsed: 1, tempLockedAt: 1 }); // ⭐ 新增：複合索引，優化驗證碼查詢

/**
 * 靜態方法：檢查發送頻率限制
 * @param {string} email - 郵箱地址
 * @param {string} ipAddress - IP地址
 * @param {string} type - 驗證類型
 * @returns {Promise<Object>} 限制檢查結果
 */
emailVerificationSchema.statics.checkSendingLimits = async function(email, ipAddress, type = 'registration') {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // 檢查郵箱1分鐘內發送次數
  const emailRecentCount = await this.countDocuments({
    email,
    type,
    createdAt: { $gte: oneMinuteAgo }
  });
  
  // 檢查郵箱1小時內發送次數
  const emailHourlyCount = await this.countDocuments({
    email,
    type,
    createdAt: { $gte: oneHourAgo }
  });
  
  // 檢查郵箱24小時內發送次數
  const emailDailyCount = await this.countDocuments({
    email,
    type,
    createdAt: { $gte: oneDayAgo }
  });
  
  // 檢查IP地址1小時內發送次數
  const ipHourlyCount = await this.countDocuments({
    ipAddress,
    type,
    createdAt: { $gte: oneHourAgo }
  });
  
  // 檢查IP地址24小時內發送次數
  const ipDailyCount = await this.countDocuments({
    ipAddress,
    type,
    createdAt: { $gte: oneDayAgo }
  });
  
  // 限制規則
  const emailLimits = {
    recent: 1,   // 60秒內最多1次
    hourly: 5,   // 1小時內最多5次
    daily: 10    // 24小時內最多10次
  };
  
  const ipLimits = {
    hourly: 50,  // IP 1小時內最多50次
    daily: 100   // IP 24小時內最多100次
  };
  
  const canSend = emailRecentCount < emailLimits.recent &&
                  emailHourlyCount < emailLimits.hourly &&
                  emailDailyCount < emailLimits.daily &&
                  ipHourlyCount < ipLimits.hourly &&
                  ipDailyCount < ipLimits.daily;
  
  return {
    canSend,
    limits: {
      email: {
        recentCount: emailRecentCount,
        hourlyCount: emailHourlyCount,
        dailyCount: emailDailyCount
      },
      ip: {
        hourlyCount: ipHourlyCount,
        dailyCount: ipDailyCount
      }
    },
    nextSendTime: emailRecentCount >= emailLimits.recent 
      ? new Date(now.getTime() + 60 * 1000) 
      : now
  };
};

/**
 * 靜態方法：創建驗證碼記錄
 * @param {string} email - 郵箱地址
 * @param {string} verificationCode - 驗證碼（已加密）
 * @param {string} type - 驗證類型
 * @param {string} ipAddress - IP地址
 * @returns {Promise<Object>} 創建的記錄
 */
emailVerificationSchema.statics.createVerification = async function(email, verificationCode, type = 'registration', ipAddress = null) {
  // 先刪除同一郵箱同一類型的舊記錄
  await this.deleteMany({
    email,
    type
  });
  
  // 創建新記錄
  const verification = new this({
    email,
    verificationCode,
    type,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15分鐘過期
    ipAddress
  });
  
  await verification.save();
  return verification;
};

/**
 * 靜態方法：驗證驗證碼 (⭐ 修復版本 - 延遲標記策略)
 * @param {string} email - 郵箱地址
 * @param {string} inputCode - 用戶輸入的驗證碼
 * @param {string} type - 驗證類型
 * @param {boolean} markAsUsed - 是否立即標記為已使用 (默認false，延遲標記)
 * @returns {Promise<Object>} 驗證結果
 */
emailVerificationSchema.statics.verifyCode = async function(email, inputCode, type = 'registration', markAsUsed = false) {
  const bcrypt = await import('bcryptjs');
  
  // 查找有效的驗證記錄
  const verification = await this.findOne({
    email,
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
  
  if (!verification) {
    return {
      valid: false,
      code: 'VERIFICATION_CODE_NOT_FOUND',
      message: '驗證碼不存在或已過期',
      verification: null
    };
  }
  
  // 檢查是否在臨時鎖定期內（防止並發重複使用）
  const now = new Date();
  const lockWindow = 5 * 60 * 1000; // 5分鐘鎖定窗口
  if (verification.tempLockedAt && (now - verification.tempLockedAt) < lockWindow) {
    return {
      valid: false,
      code: 'VERIFICATION_CODE_TEMPORARILY_LOCKED',
      message: '驗證碼正在處理中，請稍後再試',
      verification: null
    };
  }
  
  // 驗證碼比較
  const isValid = await bcrypt.default.compare(inputCode, verification.verificationCode);
  
  if (!isValid) {
    return {
      valid: false,
      code: 'INVALID_VERIFICATION_CODE',
      message: '驗證碼錯誤',
      verification: null
    };
  }
  
  // ⭐ 關鍵修改：根據markAsUsed參數決定是否立即標記
  if (markAsUsed) {
    // 立即標記為已使用（向後兼容）
    verification.isUsed = true;
    verification.usedAt = new Date();
    await verification.save();
  } else {
    // 延遲標記策略：設置臨時鎖定，防止並發問題
    verification.tempLockedAt = new Date();
    await verification.save();
  }
  
  return {
    valid: true,
    verification,
    message: '驗證碼驗證成功'
  };
};

/**
 * 靜態方法：標記驗證碼為已使用 (新增方法)
 * @param {string} verificationId - 驗證記錄ID
 * @param {Object} session - MongoDB session (可選)
 * @returns {Promise<boolean>} 標記結果
 */
emailVerificationSchema.statics.markCodeAsUsed = async function(verificationId, session = null) {
  try {
    const options = session ? { session } : {};
    const result = await this.findByIdAndUpdate(
      verificationId,
      {
        isUsed: true,
        usedAt: new Date(),
        tempLockedAt: null // 清除臨時鎖定
      },
      options
    );
    return !!result;
  } catch (error) {
    console.error('標記驗證碼為已使用失敗:', error);
    return false;
  }
};

/**
 * 靜態方法：釋放驗證碼臨時鎖定 (新增方法)
 * @param {string} verificationId - 驗證記錄ID
 * @param {Object} session - MongoDB session (可選)
 * @returns {Promise<boolean>} 釋放結果
 */
emailVerificationSchema.statics.releaseTempLock = async function(verificationId, session = null) {
  try {
    const options = session ? { session } : {};
    const result = await this.findByIdAndUpdate(
      verificationId,
      {
        tempLockedAt: null
      },
      options
    );
    return !!result;
  } catch (error) {
    console.error('釋放驗證碼臨時鎖定失敗:', error);
    return false;
  }
};

const EmailVerification = mongoose.model('EmailVerification', emailVerificationSchema);

export default EmailVerification; 