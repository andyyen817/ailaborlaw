import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // 文档中使用 bcryptjs

// 生成邀請碼工具函數
function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 定义 Profile Schema (嵌入式)
const userProfileSchema = new mongoose.Schema({
  industry: { type: String, trim: true }, // 行业
  position: { type: String, trim: true }, // 职位/职业
  company: { type: String, trim: true }, // 新增，公司名稱
  phone: { type: String, trim: true } // 新增，手機號碼
}, { _id: false }); // profile 作为内嵌文档, _id: false 表示不为子文档生成_id

const userSchema = new mongoose.Schema({
  name: { // 昵称 (来自文档)
    type: String,
    required: [true, '用户昵称不能为空'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, '电子邮箱不能为空'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, '请输入有效的电子邮箱地址'],
  },
  password: { // 存储哈希后的密码 (来自文档)
    type: String,
    required: [true, '密码不能为空'],
    minlength: [8, '密码长度不能少于8位'],
  },
  userType: { // (来自文档)
    type: String,
    enum: ['admin', 'hr', 'employer', 'employee'],
    required: [true, '用户类型不能为空'],
    default: 'employee',
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'disabled', 'deleted'],
    required: [true, '账户状态不能为空'],
    default: 'pending', // 新用戶需要郵箱驗證後才能激活
  },
  registrationDate: { // (来自文档)
    type: Date,
    default: Date.now,
  },
  lastLogin: { // (来自文档)
    type: Date,
  },
  remainingQueries: { // 剩余咨询次数 (来自文档)
    type: Number,
    default: 10, // 新用户默认10次，管理员可修改
    min: [0, '剩余次数不能为负'],
  },
  totalConsultations: { // 累计咨询次数 (来自文档)
    type: Number,
    default: 0,
  },
  profile: userProfileSchema, // 嵌入式用户资料 (来自文档)
  
  // 邀請系統相關字段
  myInviteCode: { // 自己的邀請碼（用於邀請別人）
    type: String,
    unique: true,
    sparse: true, // 允許null值，但如果有值必須唯一
    trim: true,
    uppercase: true
  },
  
  inviteCode: { // 用戶註冊時使用的邀請碼（被誰邀請）
    type: String,
    trim: true,
    uppercase: true
  },
  
  invitedBy: { // 邀請人ID
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  invitedCount: { // 邀請成功的人數
    type: Number,
    default: 0,
    min: [0, '邀請數量不能為負']
  },
  
  // 最後查詢時間
  lastQueryAt: {
    type: Date
  },
  
  // 記錄刪除時間
  deletedAt: {
    type: Date
  },

  // 添加：密碼更改時間，用於JWT安全驗證
  passwordChangedAt: {
    type: Date
  },

  // 郵箱驗證相關字段
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationCode: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  emailVerificationSentAt: {
    type: Date,
    default: null
  },
  emailVerificationSentCount: {
    type: Number,
    default: 0
  },
  passwordResetCode: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  lastEmailSentAt: {
    type: Date,
    default: null
  },
}, {
  timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
});

// 数据库索引建议 (来自文档)
// 移除重复索引 - email字段已经通过unique:true设置了索引，不需要再使用schema.index()
// userSchema.index({ email: 1 }); // 删除此行以避免重复索引警告
userSchema.index({ status: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ registrationDate: -1 }); // -1 表示降序索引，通常日期查询会用到
userSchema.index({ inviteCode: 1 }); // 被邀請碼索引，方便查詢
userSchema.index({ myInviteCode: 1 }); // 自己的邀請碼索引
userSchema.index({ invitedBy: 1 }); // 邀請人索引
userSchema.index({ invitedCount: -1 }); // 邀請數量索引，用於排行榜

// 郵箱驗證相關索引
userSchema.index({ emailVerificationCode: 1 }); // 郵箱驗證碼索引
userSchema.index({ passwordResetCode: 1 }); // 密碼重置驗證碼索引
userSchema.index({ emailVerified: 1 }); // 郵箱驗證狀態索引

// 密码哈希中间件 (Mongoose pre-save hook - 来自文档)
userSchema.pre('save', async function (next) {
  try {
    // 只有在密码被修改(或新创建)时才哈希
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      
      // 更新密碼更改時間
      this.passwordChangedAt = new Date();
    }
    
    // 為新用戶生成邀請碼
    if (this.isNew && !this.myInviteCode) {
      let code;
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        code = generateInviteCode();
        attempts++;
        
        // 檢查是否重複
        const existing = await this.constructor.findOne({ myInviteCode: code });
        if (!existing) {
          this.myInviteCode = code;
          break;
        }
      } while (attempts < maxAttempts);
      
      if (attempts >= maxAttempts) {
        throw new Error('無法生成唯一邀請碼，請重試');
      }
    }
    
    return next();
  } catch (error) {
    // 将错误传递给 Mongoose
    const err = error instanceof Error ? error : new Error(String(error));
    return next(err);
  }
});

// 实例方法：比较密码 (来自文档)
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 实例方法：减少剩余咨询次数 (基于现有逻辑，适配文档字段)
userSchema.methods.decreaseRemainingQueries = async function() {
  if (this.remainingQueries > 0) {
    this.remainingQueries--;
    this.totalConsultations++; // 对应文档的 totalConsultations
    await this.save();
    return true;
  }
  return false;
};

// 实例方法：增加剩余咨询次数 (基于现有逻辑，适配文档字段)
userSchema.methods.increaseRemainingQueries = async function(amount) {
  if (typeof amount === 'number' && amount > 0) {
    this.remainingQueries += amount;
    await this.save();
  }
  return this.remainingQueries;
};

// 实例方法：获取邀请统计
userSchema.methods.getInviteStats = async function() {
  return {
    myInviteCode: this.myInviteCode,
    invitedCount: this.invitedCount,
    invitedBy: this.invitedBy,
    totalBonusEarned: this.invitedCount * 10 // 假设每邀请一人奖励10次
  };
};

// 静态方法：通过邀请码查找用户
userSchema.statics.findByInviteCode = async function(inviteCode) {
  return this.findOne({ myInviteCode: inviteCode.toUpperCase() });
};

const User = mongoose.model('User', userSchema);

export default User;
