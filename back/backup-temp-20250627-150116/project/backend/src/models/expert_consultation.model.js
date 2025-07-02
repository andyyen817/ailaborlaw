import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * 专家咨询模型
 * 根据任务组5前端需求文档设计
 */

// 服务类型枚举
export const SERVICE_TYPES = {
  LABOR_CONTRACT: 'labor_contract',
  COMPENSATION: 'compensation', 
  TERMINATION: 'termination',
  WORKPLACE_SAFETY: 'workplace_safety',
  DISCRIMINATION: 'discrimination',
  OTHER: 'other'
};

// 状态类型枚举
export const STATUS_TYPES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// 联系方式枚举
export const CONTACT_METHODS = {
  PHONE: 'phone',
  EMAIL: 'email',
  LINE: 'line'
};

// 时间段枚举
export const TIME_PERIODS = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening'
};

const expertConsultationSchema = new mongoose.Schema({
  // 使用自定义ID而不是MongoDB的ObjectId
  id: {
    type: String,
    default: () => `consultation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    unique: true,
    required: true
  },
  
  // 用户ID (可以是guest用户)
  user_id: {
    type: String,
    required: true,
    default: 'guest'
  },
  
  // 申请人基本信息
  name: {
    type: String,
    required: [true, '姓名為必填項'],
    trim: true,
    minlength: [1, '姓名不能為空'],
    maxlength: [100, '姓名不能超過100個字符']
  },
  
  phone: {
    type: String,
    required: [true, '電話號碼為必填項'],
    trim: true,
    validate: {
      validator: function(v) {
        // 台湾手机号码格式验证：09xxxxxxxx 或 +886-9xxxxxxxx
        const phoneRegex = /^(\+886-?)?0?9\d{8}$/;
        return phoneRegex.test(v);
      },
      message: '請輸入有效的台灣手機號碼格式'
    }
  },
  
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // 可选字段
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(v);
      },
      message: '請輸入有效的電子郵箱格式'
    }
  },
  
  line_id: {
    type: String,
    trim: true,
    maxlength: [100, 'Line ID不能超過100個字符']
  },
  
  // 服务类型
  service_type: {
    type: String,
    required: [true, '服務類型為必填項'],
    enum: {
      values: Object.values(SERVICE_TYPES),
      message: '無效的服務類型'
    }
  },
  
  // 问题详情
  details: {
    type: String,
    required: [true, '問題詳情為必填項'],
    minlength: [10, '問題詳情至少需要10個字符'],
    maxlength: [2000, '問題詳情不能超過2000個字符'],
    trim: true
  },
  
  // 偏好联系方式 (数组)
  preferred_contact: {
    type: [String],
    required: [true, '請至少選擇一種聯繫方式'],
    validate: {
      validator: function(v) {
        if (!Array.isArray(v) || v.length === 0) {
          return false;
        }
        return v.every(contact => Object.values(CONTACT_METHODS).includes(contact));
      },
      message: '請選擇有效的聯繫方式'
    }
  },
  
  // 咨询时间偏好
  consultation_time: {
    type: String,
    maxlength: [100, '諮詢時間偏好不能超過100個字符']
  },
  
  // 处理状态
  status: {
    type: String,
    enum: {
      values: Object.values(STATUS_TYPES),
      message: '無效的處理狀態'
    },
    default: STATUS_TYPES.PENDING
  },
  
  // 管理员备注
  admin_notes: {
    type: String,
    maxlength: [1000, '管理員備註不能超過1000個字符'],
    default: ''
  },
  
  // 处理人员ID
  processed_by: {
    type: String,
    default: null
  },
  
  // 处理时间
  processed_at: {
    type: Date,
    default: null
  },
  
  // === MVP版本新增字段 ===
  
  // 地区字段
  region: {
    type: String,
    trim: true,
    maxlength: [50, '地區名稱不能超過50個字符']
  },
  
  // 指派的劳资顾问ID
  assigned_advisor_id: {
    type: String,
    default: null
  },
  
  // 完成时间
  completed_at: {
    type: Date,
    default: null
  },
  
  // 响应时间（分钟）- 从pending到processing的时间
  response_time: {
    type: Number,
    min: 0,
    default: null
  },
  
  // 完成时间（小时）- 从processing到completed的时间
  completion_time: {
    type: Number,
    min: 0,
    default: null
  },
  
  // 简化的时间格式 "HH:MM"
  simplified_time: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // 可选字段
        // 验证HH:MM格式，分钟只能是00或30
        const timeRegex = /^([01]\d|2[0-3]):(00|30)$/;
        return timeRegex.test(v);
      },
      message: '時間格式必須為HH:MM，且分鐘只能是00或30'
    }
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// 设置虚拟ID字段
expertConsultationSchema.virtual('customId').get(function() {
  return this.id;
});

// 索引设置
expertConsultationSchema.index({ id: 1 }, { unique: true, sparse: true });
expertConsultationSchema.index({ user_id: 1 });
expertConsultationSchema.index({ status: 1 });
expertConsultationSchema.index({ service_type: 1 });
expertConsultationSchema.index({ created_at: 1 });
expertConsultationSchema.index({ phone: 1 });
expertConsultationSchema.index({ name: 1 });

// MVP版本新增索引
expertConsultationSchema.index({ region: 1 });
expertConsultationSchema.index({ assigned_advisor_id: 1 });
expertConsultationSchema.index({ completed_at: 1 });
expertConsultationSchema.index({ response_time: 1 });
expertConsultationSchema.index({ completion_time: 1 });

// 实例方法：更新状态
expertConsultationSchema.methods.updateStatus = async function(newStatus, adminId = null, notes = '', forceUpdate = false) {
  // 验证状态流转规则（除非强制更新）
  if (!forceUpdate) {
    const validTransitions = {
      [STATUS_TYPES.PENDING]: [STATUS_TYPES.PROCESSING, STATUS_TYPES.CANCELLED],
      [STATUS_TYPES.PROCESSING]: [STATUS_TYPES.COMPLETED, STATUS_TYPES.CANCELLED],
      [STATUS_TYPES.COMPLETED]: [], // 完成状态不能转换
      [STATUS_TYPES.CANCELLED]: []  // 取消状态不能转换
    };
    
    if (!validTransitions[this.status].includes(newStatus)) {
      throw new Error(`無法將狀態從 ${this.status} 轉換為 ${newStatus}`);
    }
  }
  
  // 记录旧状态用于日志
  const oldStatus = this.status;
  const now = new Date();
  this.status = newStatus;
  
  if (adminId) {
    this.processed_by = adminId;
    
    // 如果是第一次处理，设置处理时间并计算响应时间
    if (!this.processed_at) {
      this.processed_at = now;
      
      // 计算响应时间（从创建到开始处理的分钟数）
      if (this.created_at) {
        this.response_time = Math.round((now - this.created_at) / (1000 * 60));
      }
    }
  }
  
  if (notes) {
    // 如果是强制更新，在备注中说明
    const notePrefix = forceUpdate ? '[強制更新] ' : '';
    this.admin_notes = notePrefix + notes;
  }
  
  // 设置完成时间并计算完成时长
  if (newStatus === STATUS_TYPES.COMPLETED && !this.completed_at) {
    this.completed_at = now;
    
    // 计算完成时间（从开始处理到完成的小时数）
    if (this.processed_at) {
      this.completion_time = Math.round((now - this.processed_at) / (1000 * 60 * 60) * 10) / 10; // 保留一位小数
    }
  }
  
  await this.save();
  return this;
};

// 实例方法：取消咨询
expertConsultationSchema.methods.cancel = async function(reason = '') {
  if (this.status !== STATUS_TYPES.PENDING && this.status !== STATUS_TYPES.PROCESSING) {
    throw new Error('只能取消待處理或處理中的諮詢請求');
  }
  
  this.status = STATUS_TYPES.CANCELLED;
  if (reason) {
    this.admin_notes = this.admin_notes ? `${this.admin_notes}\n取消原因: ${reason}` : `取消原因: ${reason}`;
  }
  
  await this.save();
  return this;
};

// 静态方法：按用户查询
expertConsultationSchema.statics.findByUser = function(userId, options = {}) {
  const {
    page = 1,
    limit = 10,
    status = null,
    sort = { created_at: -1 }
  } = options;
  
  const query = { user_id: userId };
  if (status) {
    query.status = status;
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// 静态方法：按状态查询
expertConsultationSchema.statics.findByStatus = function(status, options = {}) {
  const {
    page = 1,
    limit = 10,
    sort = { created_at: -1 }
  } = options;
  
  const skip = (page - 1) * limit;
  
  return this.find({ status })
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// 静态方法：管理员查询
expertConsultationSchema.statics.adminFind = function(filters = {}, options = {}) {
  const {
    page = 1,
    limit = 10,
    sort = { created_at: -1 }
  } = options;
  
  const query = {};
  
  // 状态筛选
  if (filters.status) {
    query.status = filters.status;
  }
  
  // 服务类型筛选  
  if (filters.service_type) {
    query.service_type = filters.service_type;
  }
  
  // 搜索关键词（姓名或电话）
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { phone: { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  // 日期范围筛选
  if (filters.startDate || filters.endDate) {
    query.created_at = {};
    if (filters.startDate) {
      query.created_at.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.created_at.$lte = new Date(filters.endDate);
    }
  }
  
  // 地区筛选
  if (filters.region) {
    query.region = filters.region;
  }
  
  // 指派顾问筛选
  if (filters.advisorId) {
    query.assigned_advisor_id = filters.advisorId;
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// 静态方法：获取统计数据
expertConsultationSchema.statics.getStatistics = async function(filters = {}) {
  const query = {};
  
  // 日期范围筛选
  if (filters.startDate || filters.endDate) {
    query.created_at = {};
    if (filters.startDate) {
      query.created_at.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.created_at.$lte = new Date(filters.endDate);
    }
  }
  
  // 总体统计
  const overview = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', STATUS_TYPES.PENDING] }, 1, 0] } },
        processing: { $sum: { $cond: [{ $eq: ['$status', STATUS_TYPES.PROCESSING] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', STATUS_TYPES.COMPLETED] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', STATUS_TYPES.CANCELLED] }, 1, 0] } }
      }
    }
  ]);
  
  // 按服务类型统计
  const serviceTypeStats = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$service_type',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        service_type: '$_id',
        count: 1,
        _id: 0
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  // 每日统计
  const dailyStats = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          year: { $year: '$created_at' },
          month: { $month: '$created_at' },
          day: { $dayOfMonth: '$created_at' }
        },
        count: { $sum: 1 },
        byStatus: {
          $push: {
            status: '$status',
            count: 1
          }
        }
      }
    },
    {
      $project: {
        date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: '$_id.day'
              }
            }
          }
        },
        count: 1,
        byStatus: 1,
        _id: 0
      }
    },
    { $sort: { date: 1 } }
  ]);
  
  return {
    overview: overview[0] || {
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0
    },
    serviceTypeStats,
    dailyStats
  };
};

export default mongoose.model('ExpertConsultation', expertConsultationSchema); 