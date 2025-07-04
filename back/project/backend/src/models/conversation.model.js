const mongoose = require('mongoose');

/**
 * 聊天会话模型 - 优化版本
 * 完全符合前端API需求和ES模块规范
 * 集成现有认证和次数管理系统
 */
const conversationSchema = new mongoose.Schema({
  // 唯一会话标识符 - 符合前端sessionId命名
  sessionId: {
    type: String,
    unique: true,
    required: true,
    index: true,
    default: () => `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  
  // 关联用户ID - 与现有User模型兼容
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // 会话标题 - 支持自动生成和用户自定义
  title: {
    type: String,
    trim: true,
    default: '新的劳法咨询',
    maxlength: 100
  },
  
  // 会话状态 - 支持完整的生命周期管理
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active',
    index: true
  },
  
  // 消息数量统计 - 性能优化，避免每次count查询
  messageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // 最后消息时间 - 用于排序和会话管理
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // 会话持续时间（秒）- 用于统计分析
  duration: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // 元数据 - 扩展性考虑，包含统计和分析数据
  metadata: {
    // 用户消息数量
    totalUserMessages: {
      type: Number,
      default: 0,
      min: 0
    },
    // AI消息数量
    totalAIMessages: {
      type: Number,
      default: 0,
      min: 0
    },
    // 第一个问题 - 用于自动生成标题
    firstQuestion: {
      type: String,
      maxlength: 500
    },
    // 问题分类标签 - 用于统计分析
    categories: [{
      type: String,
      trim: true,
      maxlength: 50
    }],
    // 最后活动时间
    lastActivity: {
      type: Date,
      default: Date.now
    },
    // 会话开始时间（精确时间戳）
    sessionStartTime: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true, // 自动添加createdAt和updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 复合索引优化 - 基于常见查询模式
conversationSchema.index({ userId: 1, createdAt: -1 }); // 用户会话列表
conversationSchema.index({ status: 1, lastMessageAt: -1 }); // 状态和活跃度排序
conversationSchema.index({ 'metadata.categories': 1 }); // 分类统计
conversationSchema.index({ sessionId: 1, userId: 1 }); // 唯一性和权限检查

// 实例方法：更新会话标题
conversationSchema.methods.updateTitle = async function(newTitle) {
  this.title = newTitle.trim();
  this.metadata.lastActivity = new Date();
  await this.save();
  return this;
};

// 实例方法：添加分类标签
conversationSchema.methods.addCategory = async function(category) {
  if (category && !this.metadata.categories.includes(category)) {
    this.metadata.categories.push(category);
    await this.save();
  }
  return this;
};

// 实例方法：更新消息统计
conversationSchema.methods.incrementMessageCount = async function(role) {
  const updateData = {
    messageCount: this.messageCount + 1,
    lastMessageAt: new Date(),
    'metadata.lastActivity': new Date()
  };
  
  if (role === 'user') {
    updateData['metadata.totalUserMessages'] = this.metadata.totalUserMessages + 1;
  } else if (role === 'ai') {
    updateData['metadata.totalAIMessages'] = this.metadata.totalAIMessages + 1;
  }
  
  await this.updateOne({ $set: updateData });
  return this;
};

// 实例方法：完成会话
conversationSchema.methods.completeSession = async function() {
  const now = new Date();
  const duration = Math.floor((now - this.metadata.sessionStartTime) / 1000);
  
  this.status = 'completed';
  this.duration = duration;
  this.metadata.lastActivity = now;
  
  await this.save();
  return this;
};

// 实例方法：设置第一个问题（用于自动生成标题）
conversationSchema.methods.setFirstQuestion = async function(question) {
  if (!this.metadata.firstQuestion && question) {
    this.metadata.firstQuestion = question;
    
    // 自动生成简洁的标题
    const autoTitle = question.substring(0, 30) + (question.length > 30 ? '...' : '');
    this.title = autoTitle;
    
    await this.save();
  }
  return this;
};

// 静态方法：获取用户活跃会话
conversationSchema.statics.getActiveUserSessions = function(userId, limit = 20) {
  return this.find({ 
    userId, 
    status: 'active' 
  })
  .sort({ lastMessageAt: -1 })
  .limit(limit)
  .select('sessionId title messageCount lastMessageAt createdAt');
};

// 静态方法：获取会话统计
conversationSchema.statics.getSessionStats = function(startDate) {
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        activeSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        avgDuration: { $avg: '$duration' },
        avgMessagesPerSession: { $avg: '$messageCount' }
      }
    }
  ]);
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation; 