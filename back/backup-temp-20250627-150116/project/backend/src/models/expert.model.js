const mongoose = require('mongoose');

/**
 * 专家模型
 * 根据PRD数据库设计实现
 */
const expertSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  expertise_areas: [{
    type: String,
    trim: true
  }],
  years_of_experience: {
    type: Number,
    min: 0
  },
  bio: {
    type: String
  },
  avatar_url: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  total_consultations: {
    type: Number,
    default: 0
  },
  average_rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
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
expertSchema.index({ specialization: 1 });
expertSchema.index({ expertise_areas: 1 });
expertSchema.index({ status: 1 });
expertSchema.index({ average_rating: -1 });

// 更新评分的方法
expertSchema.methods.updateRating = async function(newRating) {
  // 计算新的平均评分
  const totalRatingValue = this.average_rating * this.total_consultations;
  this.total_consultations++;
  this.average_rating = (totalRatingValue + newRating) / this.total_consultations;
  
  await this.save();
  return this;
};

module.exports = mongoose.model('Expert', expertSchema); 