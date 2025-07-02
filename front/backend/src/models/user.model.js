const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '請提供用戶名稱'],
    trim: true,
    minlength: [2, '用戶名稱至少需要2個字符'],
    maxlength: [50, '用戶名稱不能超過50個字符']
  },
  email: {
    type: String,
    required: [true, '請提供電子郵箱'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      '請提供有效的電子郵箱'
    ]
  },
  password: {
    type: String,
    required: [true, '請提供密碼'],
    minlength: [8, '密碼至少需要8個字符'],
    select: false
  },
  userType: {
    type: String,
    enum: ['employee', 'employer', 'hr', 'admin'],
    default: 'employee'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  profile: {
    industry: String,
    position: String
  },
  companyName: String,
  remainingQueries: {
    type: Number,
    default: 10
  },
  totalConsultations: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 創建索引，避免重複定義
// 注意：由於在schema中已經使用了unique: true，不需要再設置索引
// userSchema.index({ email: 1 }, { unique: true });

// 保存前加密密碼
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 檢查密碼是否匹配
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 生成JWT令牌
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, userType: this.userType },
    process.env.JWT_SECRET || 'fallback_jwt_secret',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

const User = mongoose.model('User', userSchema);

module.exports = User; 