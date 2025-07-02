import mongoose from 'mongoose';

/**
 * 劳资顾问模型
 * 根据MVP版本前端需求设计
 */

// 专业领域枚举（与服务类型保持一致）
export const SPECIALTIES = {
  LABOR_CONTRACT: 'labor_contract',
  COMPENSATION: 'compensation', 
  TERMINATION: 'termination',
  WORKPLACE_SAFETY: 'workplace_safety',
  DISCRIMINATION: 'discrimination',
  OTHER: 'other'
};

// 地区枚举（台湾主要地区）
export const REGIONS = {
  TAIPEI: '台北市',
  NEW_TAIPEI: '新北市',
  TAOYUAN: '桃園市',
  TAICHUNG: '台中市',
  TAINAN: '台南市',
  KAOHSIUNG: '高雄市',
  HSINCHU_CITY: '新竹市',
  HSINCHU_COUNTY: '新竹縣',
  CHANGHUA: '彰化縣',
  YUNLIN: '雲林縣',
  CHIAYI_CITY: '嘉義市',
  CHIAYI_COUNTY: '嘉義縣',
  PINGTUNG: '屏東縣',
  YILAN: '宜蘭縣',
  HUALIEN: '花蓮縣',
  TAITUNG: '台東縣',
  PENGHU: '澎湖縣',
  KINMEN: '金門縣',
  LIENCHIANG: '連江縣',
  OTHER: '其他'
};

const laborAdvisorSchema = new mongoose.Schema({
  // 使用自定义ID
  id: {
    type: String,
    default: () => `advisor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    unique: true,
    required: true
  },
  
  // 基本信息
  name: {
    type: String,
    required: [true, '顧問姓名為必填項'],
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
        // 支持手机和固话格式
        const phoneRegex = /^(\+886-?)?((0\d{1,2}-?\d{6,8})|(\d{2,3}-?\d{6,8})|(09\d{8}))$/;
        return phoneRegex.test(v);
      },
      message: '請輸入有效的電話號碼格式'
    }
  },
  
  email: {
    type: String,
    required: [true, '電子郵箱為必填項'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
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
  
  // 服务地区
  region: {
    type: String,
    required: [true, '服務地區為必填項'],
    enum: {
      values: Object.values(REGIONS),
      message: '無效的服務地區'
    }
  },
  
  // 擅长专业领域
  specialties: {
    type: [String],
    required: [true, '請至少選擇一個專業領域'],
    validate: {
      validator: function(v) {
        if (!Array.isArray(v) || v.length === 0) {
          return false;
        }
        return v.every(specialty => Object.values(SPECIALTIES).includes(specialty));
      },
      message: '請選擇有效的專業領域'
    }
  },
  
  // 工作状态
  is_active: {
    type: Boolean,
    default: true
  },
  
  // 工作统计
  total_assigned: {
    type: Number,
    default: 0,
    min: 0
  },
  
  total_completed: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // 平均处理时间（小时）
  avg_completion_time: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // 工作负载状态
  workload_status: {
    type: String,
    enum: ['light', 'normal', 'heavy'],
    default: 'light'
  },
  
  // 备注信息
  notes: {
    type: String,
    maxlength: [500, '備註不能超過500個字符'],
    default: ''
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// 设置虚拟ID字段
laborAdvisorSchema.virtual('customId').get(function() {
  return this.id;
});

// 索引设置
laborAdvisorSchema.index({ id: 1 }, { unique: true, sparse: true });
laborAdvisorSchema.index({ region: 1 });
laborAdvisorSchema.index({ specialties: 1 });
laborAdvisorSchema.index({ is_active: 1 });
laborAdvisorSchema.index({ workload_status: 1 });
laborAdvisorSchema.index({ email: 1 }, { unique: true });

// 实例方法：更新工作统计
laborAdvisorSchema.methods.updateStats = async function(isCompleted = false, completionTime = null) {
  if (isCompleted) {
    this.total_completed++;
    
    // 更新平均完成时间
    if (completionTime && completionTime > 0) {
      const totalTime = this.avg_completion_time * (this.total_completed - 1) + completionTime;
      this.avg_completion_time = Math.round(totalTime / this.total_completed * 10) / 10;
    }
  } else {
    // 新分配案件
    this.total_assigned++;
  }
  
  // 更新工作负载状态
  const activeAssignments = this.total_assigned - this.total_completed;
  if (activeAssignments <= 2) {
    this.workload_status = 'light';
  } else if (activeAssignments <= 5) {
    this.workload_status = 'normal';
  } else {
    this.workload_status = 'heavy';
  }
  
  await this.save();
  return this;
};

// 实例方法：检查是否可以接受新案件
laborAdvisorSchema.methods.canAcceptNewCase = function() {
  if (!this.is_active) return false;
  
  const activeAssignments = this.total_assigned - this.total_completed;
  return activeAssignments < 8; // 最多同时处理8个案件
};

// 静态方法：按地区和专业查找顾问
laborAdvisorSchema.statics.findByRegionAndSpecialty = function(region, specialty, options = {}) {
  const {
    page = 1,
    limit = 20,
    sort = { workload_status: 1, avg_completion_time: 1 } // 优先选择负载轻且效率高的顾问
  } = options;
  
  const query = {
    is_active: true,
    region: region,
    specialties: { $in: [specialty] }
  };
  
  const skip = (page - 1) * limit;
  
  return this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// 静态方法：获取最佳可用顾问
laborAdvisorSchema.statics.findBestAvailable = async function(region, specialty) {
  const advisors = await this.find({
    is_active: true,
    region: region,
    specialties: { $in: [specialty] }
  }).sort({ 
    workload_status: 1, 
    avg_completion_time: 1,
    total_completed: -1 
  });
  
  // 返回第一个可以接受新案件的顾问
  for (const advisor of advisors) {
    if (advisor.canAcceptNewCase()) {
      return advisor;
    }
  }
  
  return null; // 没有可用顾问
};

// 静态方法：获取统计数据
laborAdvisorSchema.statics.getStatistics = async function(region = null) {
  const query = region ? { region } : {};
  
  const stats = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$is_active', true] }, 1, 0] } },
        inactive: { $sum: { $cond: [{ $eq: ['$is_active', false] }, 1, 0] } },
        light_workload: { $sum: { $cond: [{ $eq: ['$workload_status', 'light'] }, 1, 0] } },
        normal_workload: { $sum: { $cond: [{ $eq: ['$workload_status', 'normal'] }, 1, 0] } },
        heavy_workload: { $sum: { $cond: [{ $eq: ['$workload_status', 'heavy'] }, 1, 0] } },
        total_assigned: { $sum: '$total_assigned' },
        total_completed: { $sum: '$total_completed' },
        avg_completion_time: { $avg: '$avg_completion_time' }
      }
    }
  ]);
  
  // 按地区统计
  const regionStats = await this.aggregate([
    { $match: { is_active: true } },
    {
      $group: {
        _id: '$region',
        count: { $sum: 1 },
        avg_completion_time: { $avg: '$avg_completion_time' },
        total_completed: { $sum: '$total_completed' }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  return {
    overview: stats[0] || {
      total: 0,
      active: 0,
      inactive: 0,
      light_workload: 0,
      normal_workload: 0,
      heavy_workload: 0,
      total_assigned: 0,
      total_completed: 0,
      avg_completion_time: 0
    },
    byRegion: regionStats
  };
};

export default mongoose.model('LaborAdvisor', laborAdvisorSchema); 