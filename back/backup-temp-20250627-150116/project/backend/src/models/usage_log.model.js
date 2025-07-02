const mongoose = require('mongoose');

/**
 * 使用记录模型
 * 根据PRD数据库设计实现
 */
const usageLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action_type: {
    type: String,
    enum: ['ai_query', 'expert_consultation', 'register', 'login', 'profile_update', 'invitation_sent'],
    required: true
  },
  resource_id: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'resource_type'
  },
  resource_type: {
    type: String,
    enum: ['ChatSession', 'ExpertConsultation', 'User', null],
    default: null
  },
  details: {
    type: Object,
    default: {}
  },
  ip_address: String,
  user_agent: String,
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: false 
  }
});

// 索引
usageLogSchema.index({ user_id: 1 });
usageLogSchema.index({ action_type: 1 });
usageLogSchema.index({ created_at: 1 });
usageLogSchema.index({ 'details.query_tokens': 1 });

// 静态方法：记录AI查询使用
usageLogSchema.statics.logAIQuery = async function(userId, sessionId, queryDetails) {
  return this.create({
    user_id: userId,
    action_type: 'ai_query',
    resource_id: sessionId,
    resource_type: 'ChatSession',
    details: queryDetails
  });
};

// 静态方法：记录专家咨询
usageLogSchema.statics.logExpertConsultation = async function(userId, consultationId, details = {}) {
  return this.create({
    user_id: userId,
    action_type: 'expert_consultation',
    resource_id: consultationId,
    resource_type: 'ExpertConsultation',
    details
  });
};

// 静态方法：获取用户使用统计
usageLogSchema.statics.getUserStats = async function(userId) {
  return this.aggregate([
    { $match: { user_id: mongoose.Types.ObjectId(userId) } },
    { $group: {
        _id: '$action_type',
        count: { $sum: 1 },
        last_date: { $max: '$created_at' }
      }
    }
  ]);
};

module.exports = mongoose.model('UsageLog', usageLogSchema); 