import mongoose from 'mongoose';

/**
 * 聊天消息模型 - 优化版本
 * 完全符合前端API需求和ES模块规范
 * 支持AI回复的法条引用和元数据记录
 */
const messageSchema = new mongoose.Schema({
  // 唯一消息标识符 - 符合前端messageId命名
  messageId: {
    type: String,
    unique: true,
    required: true,
    index: true,
    default: () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  
  // 关联会话ID - 对应Conversation的sessionId
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  
  // 关联用户ID - 与现有User模型兼容
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // 消息角色 - 区分用户和AI消息
  role: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
    index: true
  },
  
  // 消息内容 - 支持长文本
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  
  // 元数据 - 包含AI处理信息和法条引用
  metadata: {
    // AI处理时间（毫秒）- 用于性能监控
    processingTime: {
      type: Number,
      min: 0
    },
    
    // 原始N8N响应数据 - 用于调试和审计
    n8nResponse: {
      type: mongoose.Schema.Types.Mixed
    },
    
    // 法条引用 - AI回复的重要组成部分
    references: [{
      law: {
        type: String,
        trim: true,
        maxlength: 100
      },
      article: {
        type: String,
        trim: true,
        maxlength: 50
      },
      content: {
        type: String,
        trim: true,
        maxlength: 1000
      },
      url: {
        type: String,
        trim: true,
        maxlength: 500
      }
    }],
    
    // 消息类型 - 便于分类和分析
    messageType: {
      type: String,
      enum: ['question', 'follow-up', 'clarification'],
      default: 'question'
    },
    
    // 回复质量评分（用于AI优化）
    qualityScore: {
      type: Number,
      min: 0,
      max: 1
    },
    
    // 是否包含敏感信息标记
    containsSensitiveInfo: {
      type: Boolean,
      default: false
    }
  },
  
  // 消息状态 - 跟踪发送状态
  status: {
    type: String,
    enum: ['sending', 'sent', 'failed'],
    default: 'sent',
    index: true
  },
  
  // 用户反馈 - 用于改进AI回复质量
  feedback: {
    type: String,
    enum: ['helpful', 'not_helpful'],
    default: null
  },
  
  // 反馈时间
  feedbackAt: {
    type: Date,
    default: null
  },
  
  // 编辑历史（如果支持消息编辑）
  editHistory: [{
    content: String,
    editedAt: { type: Date, default: Date.now },
    reason: String
  }],
  
  // 标记为重要（用户可以标记重要回复）
  isImportant: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // 自动添加createdAt和updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 复合索引优化 - 基于常见查询模式
messageSchema.index({ sessionId: 1, createdAt: 1 }); // 按会话时间顺序查询
messageSchema.index({ userId: 1, role: 1 }); // 用户消息统计
messageSchema.index({ role: 1, createdAt: -1 }); // AI消息分析
messageSchema.index({ 'metadata.messageType': 1 }); // 消息类型统计
messageSchema.index({ feedback: 1, createdAt: -1 }); // 反馈统计

// 实例方法：设置用户反馈
messageSchema.methods.setFeedback = async function(feedbackType) {
  if (['helpful', 'not_helpful'].includes(feedbackType)) {
    this.feedback = feedbackType;
    this.feedbackAt = new Date();
    await this.save();
  }
  return this;
};

// 实例方法：添加法条引用
messageSchema.methods.addReference = async function(reference) {
  if (this.role === 'ai' && reference) {
    this.metadata.references.push({
      law: reference.law || '',
      article: reference.article || '',
      content: reference.content || '',
      url: reference.url || ''
    });
    await this.save();
  }
  return this;
};

// 实例方法：标记为重要
messageSchema.methods.toggleImportant = async function() {
  this.isImportant = !this.isImportant;
  await this.save();
  return this;
};

// 实例方法：更新消息状态
messageSchema.methods.updateStatus = async function(status) {
  if (['sending', 'sent', 'failed'].includes(status)) {
    this.status = status;
    await this.save();
  }
  return this;
};

// 实例方法：设置AI回复元数据
messageSchema.methods.setAIMetadata = async function(aiData) {
  if (this.role === 'ai') {
    this.metadata.processingTime = aiData.processingTime;
    this.metadata.n8nResponse = aiData.rawResponse;
    this.metadata.references = aiData.references || [];
    this.metadata.qualityScore = aiData.qualityScore;
    await this.save();
  }
  return this;
};

// 静态方法：获取会话消息（分页）
messageSchema.statics.getSessionMessages = function(sessionId, options = {}) {
  const {
    page = 1,
    limit = 50,
    beforeTimestamp = null
  } = options;
  
  let query = { sessionId };
  
  if (beforeTimestamp) {
    query.createdAt = { $lt: new Date(beforeTimestamp) };
  }
  
  return this.find(query)
    .sort({ createdAt: 1 }) // 按时间正序，确保对话顺序正确
    .skip((page - 1) * limit)
    .limit(limit)
    .select('messageId role content metadata.references metadata.processingTime status feedback createdAt');
};

// 静态方法：获取用户消息统计
messageSchema.statics.getUserMessageStats = function(userId, startDate) {
  return this.aggregate([
    { 
      $match: { 
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        avgProcessingTime: { 
          $avg: { 
            $cond: [
              { $eq: ['$role', 'ai'] }, 
              '$metadata.processingTime', 
              null
            ]
          }
        }
      }
    }
  ]);
};

// 静态方法：获取反馈统计
messageSchema.statics.getFeedbackStats = function(startDate) {
  return this.aggregate([
    { 
      $match: { 
        role: 'ai',
        createdAt: { $gte: startDate },
        feedback: { $ne: null }
      }
    },
    {
      $group: {
        _id: '$feedback',
        count: { $sum: 1 }
      }
    }
  ]);
};

// 静态方法：获取最近的AI回复（用于质量监控）
messageSchema.statics.getRecentAIMessages = function(limit = 100) {
  return this.find({ 
    role: 'ai',
    status: 'sent'
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('userId', 'name email')
  .select('messageId sessionId content metadata.references metadata.processingTime feedback createdAt userId');
};

const Message = mongoose.model('Message', messageSchema);

export default Message; 