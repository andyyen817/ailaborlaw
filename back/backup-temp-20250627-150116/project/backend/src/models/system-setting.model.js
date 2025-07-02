import mongoose from 'mongoose';

/**
 * 系统设置模型
 * 管理系统的各种动态配置参数
 */
const systemSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    unique: true,
    required: [true, '设置键名不能为空'],
    trim: true,
    uppercase: true,
    index: true
  },
  
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, '设置值不能为空']
  },
  
  description: {
    type: String,
    trim: true,
    maxLength: [500, '描述不能超过500字符']
  },
  
  category: {
    type: String,
    enum: ['invite', 'query', 'system', 'ui', 'notification'],
    default: 'system',
    index: true
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  version: {
    type: Number,
    default: 1,
    min: [1, '版本号不能小于1']
  },
  
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt
});

// 复合索引
systemSettingSchema.index({ category: 1, isActive: 1 }); // 按类别和状态查询
systemSettingSchema.index({ updatedBy: 1, updatedAt: -1 }); // 按更新人和时间查询

// 静态方法：获取设置值
systemSettingSchema.statics.getValue = async function(key, defaultValue = null) {
  const setting = await this.findOne({ 
    key: key.toUpperCase(), 
    isActive: true 
  });
  
  return setting ? setting.value : defaultValue;
};

// 静态方法：设置值
systemSettingSchema.statics.setValue = async function(key, value, updatedBy = null, description = null) {
  const upperKey = key.toUpperCase();
  
  const result = await this.findOneAndUpdate(
    { key: upperKey },
    {
      value,
      updatedBy,
      description: description || undefined,
      $inc: { version: 1 },
      updatedAt: new Date()
    },
    {
      upsert: true,
      new: true,
      runValidators: true
    }
  );
  
  return result;
};

// 静态方法：获取分类设置
systemSettingSchema.statics.getByCategory = async function(category, activeOnly = true) {
  const query = { category };
  if (activeOnly) {
    query.isActive = true;
  }
  
  return this.find(query).sort({ key: 1 });
};

// 静态方法：批量设置
systemSettingSchema.statics.setBatch = async function(settings, updatedBy = null) {
  const operations = settings.map(({ key, value, description, category }) => ({
    updateOne: {
      filter: { key: key.toUpperCase() },
      update: {
        $set: {
          value,
          updatedBy,
          description: description || undefined,
          category: category || 'system',
          updatedAt: new Date()
        },
        $inc: { version: 1 }
      },
      upsert: true
    }
  }));
  
  return this.bulkWrite(operations);
};

// 静态方法：初始化默认设置
systemSettingSchema.statics.initializeDefaults = async function() {
  const defaultSettings = [
    {
      key: 'INVITE_DEFAULT_FREE_QUERIES',
      value: 10,
      description: '新用户默认免费咨询次数',
      category: 'invite'
    },
    {
      key: 'INVITE_BONUS_QUERIES',
      value: 10,
      description: '邀请人奖励咨询次数',
      category: 'invite'
    },
    {
      key: 'INVITEE_BONUS_QUERIES',
      value: 10,
      description: '被邀请人奖励咨询次数',
      category: 'invite'
    },
    {
      key: 'MAX_INVITES_PER_DAY',
      value: 20,
      description: '每日最大邀请次数',
      category: 'invite'
    },
    {
      key: 'REGISTRATION_BONUS_QUERIES',
      value: 10,
      description: '注册奖励咨询次数',
      category: 'query'
    },
    {
      key: 'MAX_QUERIES_PER_DAY',
      value: 50,
      description: '每日最大咨询次数',
      category: 'query'
    },
    {
      key: 'ADMIN_BATCH_OPERATION_LIMIT',
      value: 1000,
      description: '管理员批量操作最大数量',
      category: 'system'
    },
    {
      key: 'INVITE_CODE_LENGTH',
      value: 8,
      description: '邀请码长度',
      category: 'invite'
    },
    {
      key: 'INVITE_CODE_EXPIRE_DAYS',
      value: 365,
      description: '邀请码过期天数',
      category: 'invite'
    },
    {
      key: 'ENABLE_INVITE_SYSTEM',
      value: true,
      description: '是否启用邀请系统',
      category: 'invite'
    }
  ];
  
  // 检查是否已初始化
  const existingCount = await this.countDocuments();
  if (existingCount > 0) {
    return { message: '默认设置已存在', count: existingCount };
  }
  
  // 批量插入
  const result = await this.insertMany(defaultSettings.map(setting => ({
    ...setting,
    key: setting.key.toUpperCase(),
    createdAt: new Date(),
    updatedAt: new Date()
  })));
  
  return { message: '默认设置初始化成功', count: result.length };
};

// 静态方法：获取邀请系统设置
systemSettingSchema.statics.getInviteSettings = async function() {
  const settings = await this.find({ 
    category: 'invite', 
    isActive: true 
  }).sort({ key: 1 });
  
  const result = {};
  settings.forEach(setting => {
    // 将 INVITE_DEFAULT_FREE_QUERIES 转换为 defaultFreeQueries
    const camelKey = setting.key
      .toLowerCase()
      .replace(/^invite_/, '')
      .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = setting.value;
  });
  
  return result;
};

// 静态方法：更新邀请系统设置
systemSettingSchema.statics.updateInviteSettings = async function(settings, updatedBy = null) {
  const updates = [];
  
  // 将 camelCase 转换为 UPPER_SNAKE_CASE
  const keyMap = {
    defaultFreeQueries: 'INVITE_DEFAULT_FREE_QUERIES',
    bonusQueries: 'INVITE_BONUS_QUERIES', 
    inviteeBonusQueries: 'INVITEE_BONUS_QUERIES',
    maxInvitesPerDay: 'MAX_INVITES_PER_DAY',
    inviteCodeLength: 'INVITE_CODE_LENGTH',
    inviteCodeExpireDays: 'INVITE_CODE_EXPIRE_DAYS',
    enableInviteSystem: 'ENABLE_INVITE_SYSTEM'
  };
  
  for (const [camelKey, value] of Object.entries(settings)) {
    const dbKey = keyMap[camelKey];
    if (dbKey) {
      updates.push({
        key: dbKey,
        value,
        category: 'invite'
      });
    }
  }
  
  if (updates.length > 0) {
    return this.setBatch(updates, updatedBy);
  }
  
  return null;
};

// 实例方法：验证设置值
systemSettingSchema.methods.validateValue = function() {
  // 根据不同的设置类型进行验证
  switch (this.key) {
    case 'INVITE_DEFAULT_FREE_QUERIES':
    case 'INVITE_BONUS_QUERIES':
    case 'INVITEE_BONUS_QUERIES':
    case 'REGISTRATION_BONUS_QUERIES':
      return typeof this.value === 'number' && this.value >= 0;
    
    case 'MAX_INVITES_PER_DAY':
    case 'MAX_QUERIES_PER_DAY':
    case 'ADMIN_BATCH_OPERATION_LIMIT':
      return typeof this.value === 'number' && this.value > 0;
    
    case 'INVITE_CODE_LENGTH':
      return typeof this.value === 'number' && this.value >= 4 && this.value <= 20;
    
    case 'ENABLE_INVITE_SYSTEM':
      return typeof this.value === 'boolean';
    
    default:
      return true; // 未知设置类型，默认通过验证
  }
};

// 验证中间件
systemSettingSchema.pre('save', function(next) {
  if (!this.validateValue()) {
    return next(new Error(`设置值 ${this.value} 对于键 ${this.key} 无效`));
  }
  next();
});

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);

export default SystemSetting; 