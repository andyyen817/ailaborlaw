const mongoose = require('mongoose');

/**
 * 用户资料模型
 * 根据PRD数据库设计实现
 */
const userProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  user_type: {
    type: String,
    enum: ['hr', 'employer', 'employee'],
    default: 'employee'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// 索引
userProfileSchema.index({ user_id: 1 });
userProfileSchema.index({ user_type: 1 });
userProfileSchema.index({ industry: 1 });

module.exports = mongoose.model('UserProfile', userProfileSchema); 