const mongoose = require('mongoose');

/**
 * 咨询次数记录模型
 * 详细记录用户咨询次数的所有变化
 */
const queryRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '用户ID不能为空'],
    index: true
  },
  
  action: {
    type: String,
    enum: ['decrease', 'increase', 'admin_adjust', 'invite_bonus', 'registration_bonus', 'system_grant'],
    required: [true, '操作类型不能为空'],
    index: true
  },
  
  amount: {
    type: Number,
    required: [true, '变化数量不能为空'],
    validate: {
      validator: function(value) {
        return value !== 0;
      },
      message: '变化数量不能为0'
    }
  },
  
  remainingAfter: {
    type: Number,
    required: [true, '操作后剩余次数不能为空'],
    min: [0, '剩余次数不能为负']
  },
  
  reason: {
    type: String,
    required: [true, '操作原因不能为空'],
    maxLength: [255, '原因描述不能超过255字符'],
    trim: true
  },
  
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // 可以是Admin或User
    default: null,
    index: true
  },
  
  operatorType: {
    type: String,
    enum: ['user', 'admin', 'system'],
    default: 'user',
    index: true
  },
  
  relatedResourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    index: true
  },
  
  relatedResourceType: {
    type: String,
    enum: ['ChatSession', 'ExpertConsultation', 'InviteRecord', null],
    default: null
  },
  
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  ipAddress: {
    type: String,
    trim: true
  },
  
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt
});

// 复合索引
queryRecordSchema.index({ userId: 1, createdAt: -1 }); // 按用户和时间查询
queryRecordSchema.index({ action: 1, createdAt: -1 }); // 按操作类型和时间查询
queryRecordSchema.index({ operatorId: 1, operatorType: 1 }); // 按操作员查询
queryRecordSchema.index({ createdAt: -1 }); // 按时间排序

// 静态方法：记录次数减少
queryRecordSchema.statics.recordDecrease = async function(userId, remainingAfter, reason = 'AI咨询', relatedResourceId = null, relatedResourceType = null, metadata = {}) {
  return this.create({
    userId,
    action: 'decrease',
    amount: -1,
    remainingAfter,
    reason,
    operatorType: 'user',
    relatedResourceId,
    relatedResourceType,
    metadata
  });
};

// 静态方法：记录次数增加
queryRecordSchema.statics.recordIncrease = async function(userId, amount, remainingAfter, reason, operatorId = null, operatorType = 'system', metadata = {}) {
  return this.create({
    userId,
    action: 'increase',
    amount: Math.abs(amount),
    remainingAfter,
    reason,
    operatorId,
    operatorType,
    metadata
  });
};

// 静态方法：记录管理员调整
queryRecordSchema.statics.recordAdminAdjust = async function(userId, amount, remainingAfter, reason, adminId, metadata = {}) {
  return this.create({
    userId,
    action: 'admin_adjust',
    amount,
    remainingAfter,
    reason,
    operatorId: adminId,
    operatorType: 'admin',
    metadata
  });
};

// 静态方法：记录邀请奖励
queryRecordSchema.statics.recordInviteBonus = async function(userId, amount, remainingAfter, inviteRecordId, session = null) {
  const recordData = {
    userId,
    action: 'invite_bonus',
    amount: Math.abs(amount),
    remainingAfter,
    reason: '邀请好友奖励',
    operatorType: 'system',
    relatedResourceId: inviteRecordId,
    relatedResourceType: 'InviteRecord'
  };
  
  if (session) {
    // 在事务中创建记录，需要使用数组格式
    const results = await this.create([recordData], { session });
    return results[0];
  } else {
    // 无事务时直接创建
    return this.create(recordData);
  }
};

// 静态方法：记录注册奖励
queryRecordSchema.statics.recordRegistrationBonus = async function(userId, amount, remainingAfter, session = null) {
  const recordData = {
    userId,
    action: 'registration_bonus',
    amount: Math.abs(amount),
    remainingAfter,
    reason: '新用户注册奖励',
    operatorType: 'system'
  };
  
  if (session) {
    // 在事务中创建记录，需要使用数组格式
    const results = await this.create([recordData], { session });
    return results[0];
  } else {
    // 无事务时直接创建
    return this.create(recordData);
  }
};

// 静态方法：获取用户使用统计
queryRecordSchema.statics.getUserQueryStats = async function(userId, startDate = null, endDate = null) {
  const matchCondition = { userId };
  
  if (startDate || endDate) {
    matchCondition.createdAt = {};
    if (startDate) matchCondition.createdAt.$gte = startDate;
    if (endDate) matchCondition.createdAt.$lte = endDate;
  }
  
  const stats = await this.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        lastOperation: { $max: '$createdAt' }
      }
    }
  ]);
  
  return stats;
};

// 静态方法：获取系统使用趋势
queryRecordSchema.statics.getSystemUsageTrends = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          action: '$action'
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.date': 1, '_id.action': 1 } }
  ]);
};

// 静态方法：获取热门用户使用排行
queryRecordSchema.statics.getTopUsers = async function(limit = 10, action = 'decrease', days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { 
      $match: { 
        action: action,
        createdAt: { $gte: startDate }
      } 
    },
    {
      $group: {
        _id: '$userId',
        totalQueries: { $sum: 1 },
        lastQueryDate: { $max: '$createdAt' }
      }
    },
    { $sort: { totalQueries: -1, lastQueryDate: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    {
      $project: {
        userId: '$_id',
        totalQueries: 1,
        lastQueryDate: 1,
        userName: { $arrayElemAt: ['$userInfo.name', 0] },
        userEmail: { $arrayElemAt: ['$userInfo.email', 0] }
      }
    }
  ]);
};

const QueryRecord = mongoose.model('QueryRecord', queryRecordSchema);

module.exports = QueryRecord; 