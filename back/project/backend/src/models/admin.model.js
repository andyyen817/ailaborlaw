const mongoose = require('mongoose');
// 保持 bcrypt, 如果项目中用的是它。如果用 bcryptjs, 则改为 import bcrypt from 'bcryptjs';
const bcrypt = require('bcryptjs'); 

/**
 * 管理员模型
 */
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用戶名必須'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, '電子郵件必須'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, '請提供有效的電子郵件地址']
  },
  password_hash: {
    type: String,
    required: [true, '密碼必須'],
    minlength: [8, '密碼必須至少8個字符']
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  last_login_at: Date,
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

// 虛擬屬性：密碼
adminSchema.virtual('password')
  .set(function(password) {
    this._password = password; // 臨時存儲密碼用於後續處理
    this.password_hash = password; // 將原始密碼賦值給password_hash供pre-save中間件處理
  })
  .get(function() {
    return this._password;
  });

// 索引 (移除了已在字段声明中存在的username和email索引)
adminSchema.index({ role: 1 });
adminSchema.index({ status: 1 });

// 密码哈希中间件
adminSchema.pre('save', async function(next) {
  // 只有在密码被修改时才哈希
  if (!this.isModified('password_hash')) return next();
  
  try {
    // 生成盐并哈希密码
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 验证密码方法
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// 记录登录时间方法
adminSchema.methods.recordLogin = async function() {
  this.last_login_at = new Date();
  await this.save();
  return this;
};

// 检查是否有特定权限的方法
adminSchema.methods.hasPermission = function(permission) {
  // 超级管理员拥有所有权限
  if (this.role === 'super_admin') return true;
  
  // 管理员权限列表
  const adminPermissions = [
    'view_users',
    'edit_users',
    'view_chats',
    'view_consultations',
    'assign_consultations',
    'view_statistics'
  ];
  
  return adminPermissions.includes(permission);
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
