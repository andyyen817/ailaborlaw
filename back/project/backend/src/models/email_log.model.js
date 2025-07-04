const mongoose = require('mongoose');

// EmailLog 模型 - 記錄所有郵件發送日志
const emailLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  type: {
    type: String,
    enum: ['registration', 'password_reset', 'invite_confirmation'],
    required: true,
    index: true
  },
  templateId: {
    type: String,
    required: true
  },
  verificationCode: {
    type: String,
    default: null
  },
  sentAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'verified'],
    default: 'pending',
    index: true
  },
  aoksendResponse: {
    code: {
      type: Number,
      default: null
    },
    message: {
      type: String,
      default: null
    }
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  // 記錄郵件發送的詳細信息
  emailData: {
    subject: String,
    templateData: mongoose.Schema.Types.Mixed
  },
  // 錯誤信息記錄
  errorMessage: {
    type: String,
    default: null
  },
  // 重試次數
  retryCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // 自動添加 createdAt 和 updatedAt 字段
});

// 複合索引優化查詢性能
emailLogSchema.index({ userId: 1, type: 1 }); // 用戶+類型查詢
emailLogSchema.index({ userId: 1, sentAt: -1 }); // 用戶最近郵件
emailLogSchema.index({ status: 1, sentAt: -1 }); // 狀態+時間查詢
emailLogSchema.index({ type: 1, sentAt: -1 }); // 類型+時間統計
emailLogSchema.index({ expiresAt: 1 }); // TTL索引，自動清理過期記錄

// TTL索引：60天後自動刪除日志記錄（可選）
emailLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 }); // 60天

// 靜態方法：查詢用戶最近的驗證記錄
emailLogSchema.statics.getLatestVerificationLog = async function(userId, type) {
  return this.findOne({
    userId,
    type,
    status: { $in: ['sent', 'pending'] }
  }).sort({ sentAt: -1 });
};

// 靜態方法：統計郵件發送數據
emailLogSchema.statics.getEmailStats = async function(startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        sentAt: {
          $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 默認30天
          $lte: endDate || new Date()
        }
      }
    },
    {
      $group: {
        _id: {
          type: '$type',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        statusStats: {
          $push: {
            status: '$_id.status',
            count: '$count'
          }
        },
        total: { $sum: '$count' }
      }
    }
  ]);
  
  return stats;
};

// 靜態方法：檢查用戶發送頻率限制
emailLogSchema.statics.checkSendingLimits = async function(userId, type) {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // 檢查1分鐘內發送次數
  const recentCount = await this.countDocuments({
    userId,
    type,
    sentAt: { $gte: oneMinuteAgo }
  });
  
  // 檢查1小時內發送次數
  const hourlyCount = await this.countDocuments({
    userId,
    type,
    sentAt: { $gte: oneHourAgo }
  });
  
  // 檢查24小時內發送次數
  const dailyCount = await this.countDocuments({
    userId,
    type,
    sentAt: { $gte: oneDayAgo }
  });
  
  return {
    canSend: recentCount === 0 && hourlyCount < 5 && dailyCount < 20,
    recentCount,
    hourlyCount,
    dailyCount,
    nextSendTime: recentCount > 0 ? new Date(now.getTime() + 60 * 1000) : now
  };
};

// 實例方法：標記為已驗證
emailLogSchema.methods.markAsVerified = async function() {
  this.status = 'verified';
  this.verifiedAt = new Date();
  await this.save();
  return this;
};

// 實例方法：標記為發送失敗
emailLogSchema.methods.markAsFailed = async function(errorMessage) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  await this.save();
  return this;
};

// 實例方法：標記為發送成功
emailLogSchema.methods.markAsSent = async function(aoksendResponse) {
  this.status = 'sent';
  this.aoksendResponse = aoksendResponse;
  await this.save();
  return this;
};

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

module.exports = EmailLog; 