import mongoose from 'mongoose';

/**
 * 邀请记录模型
 * 记录用户之间的邀请关系和奖励状态
 */
const inviteRecordSchema = new mongoose.Schema({
  inviterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '邀请人ID不能为空'],
    index: true
  },
  
  inviteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '被邀请人ID不能为空'],
    index: true
  },
  
  inviteCode: {
    type: String,
    required: [true, '邀请码不能为空'],
    uppercase: true,
    trim: true,
    index: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired'],
    default: 'pending',
    index: true
  },
  
  bonusGiven: {
    type: Boolean,
    default: false,
    index: true
  },
  
  inviterBonus: {
    type: Number,
    default: 0,
    min: [0, '邀请人奖励不能为负']
  },
  
  inviteeBonus: {
    type: Number,
    default: 0,
    min: [0, '被邀请人奖励不能为负']
  },
  
  completedAt: {
    type: Date,
    index: true
  },
  
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt
});

// 复合索引
inviteRecordSchema.index({ inviterId: 1, inviteeId: 1 }, { unique: true }); // 确保同一对用户只能有一条记录
inviteRecordSchema.index({ inviterId: 1, status: 1 }); // 查询邀请人的特定状态记录
inviteRecordSchema.index({ status: 1, createdAt: -1 }); // 按状态和时间查询
inviteRecordSchema.index({ completedAt: -1 }); // 按完成时间排序

// 静态方法：创建邀请记录
inviteRecordSchema.statics.createInviteRecord = async function(inviterId, inviteeId, inviteCode, inviterBonus = 10, inviteeBonus = 10, session = null) {
  const recordData = {
    inviterId,
    inviteeId,
    inviteCode: inviteCode.toUpperCase(),
    status: 'completed',
    bonusGiven: true,
    inviterBonus,
    inviteeBonus,
    completedAt: new Date()
  };
  
  if (session) {
    // 在事务中创建记录，需要使用数组格式
    const results = await this.create([recordData], { session });
    return results[0];
  } else {
    // 无事务时直接创建
    return this.create(recordData);
  }
};

// 静态方法：获取邀请统计
inviteRecordSchema.statics.getInviteStats = async function(inviterId, startDate = null, endDate = null) {
  const matchCondition = { inviterId };
  
  if (startDate || endDate) {
    matchCondition.createdAt = {};
    if (startDate) matchCondition.createdAt.$gte = startDate;
    if (endDate) matchCondition.createdAt.$lte = endDate;
  }
  
  const stats = await this.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalInviterBonus: { $sum: '$inviterBonus' },
        totalInviteeBonus: { $sum: '$inviteeBonus' }
      }
    }
  ]);
  
  return stats;
};

// 静态方法：获取热门邀请者排行榜
inviteRecordSchema.statics.getTopInviters = async function(limit = 10, startDate = null, endDate = null) {
  const matchCondition = { status: 'completed' };
  
  if (startDate || endDate) {
    matchCondition.completedAt = {};
    if (startDate) matchCondition.completedAt.$gte = startDate;
    if (endDate) matchCondition.completedAt.$lte = endDate;
  }
  
  return this.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: '$inviterId',
        totalInvites: { $sum: 1 },
        totalBonus: { $sum: '$inviterBonus' },
        lastInviteDate: { $max: '$completedAt' }
      }
    },
    { $sort: { totalInvites: -1, lastInviteDate: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'inviterInfo'
      }
    },
    {
      $project: {
        inviterId: '$_id',
        totalInvites: 1,
        totalBonus: 1,
        lastInviteDate: 1,
        inviterName: { $arrayElemAt: ['$inviterInfo.name', 0] },
        inviterEmail: { $arrayElemAt: ['$inviterInfo.email', 0] }
      }
    }
  ]);
};

// 实例方法：完成邀请
inviteRecordSchema.methods.complete = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

const InviteRecord = mongoose.model('InviteRecord', inviteRecordSchema);

export default InviteRecord; 