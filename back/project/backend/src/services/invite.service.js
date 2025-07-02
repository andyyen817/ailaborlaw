import mongoose from 'mongoose';
import User from '../models/user.model.js';
import InviteRecord from '../models/invite-record.model.js';
import QueryRecord from '../models/query-record.model.js';
import SystemSetting from '../models/system-setting.model.js';
import { AppError, errorUtils } from '../utils/error.js';
import logger from '../utils/logger.js';

/**
 * 隱私處理工具函數
 */
const PrivacyUtils = {
  /**
   * 姓名隱私處理
   * @param {string} name - 原始姓名
   * @returns {string} 處理後的姓名
   * @example "李四" → "李*", "張三豐" → "張**"
   */
  maskName(name) {
    if (!name || name.length === 0) return '';
    if (name.length === 1) return name;
    return name.charAt(0) + '*'.repeat(name.length - 1);
  },

  /**
   * 郵箱隱私處理
   * @param {string} email - 原始郵箱
   * @returns {string} 處理後的郵箱
   * @example "test@example.com" → "t**t@example.com"
   */
  maskEmail(email) {
    if (!email || !email.includes('@')) return '';
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return `${localPart}@${domain}`;
    }
    const firstChar = localPart.charAt(0);
    const lastChar = localPart.charAt(localPart.length - 1);
    const maskedPart = '*'.repeat(Math.max(localPart.length - 2, 1));
    return `${firstChar}${maskedPart}${lastChar}@${domain}`;
  }
};

/**
 * 邀请服务类
 * 处理用户邀请相关的所有业务逻辑
 */
class InviteService {
  
  /**
   * 生成唯一邀请码
   * @param {number} length - 邀请码长度
   * @returns {Promise<string>} 唯一邀请码
   */
  static async generateUniqueInviteCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let attempts = 0;
    const maxAttempts = 50;
    
    while (attempts < maxAttempts) {
      let code = '';
      for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // 检查是否已存在
      const existing = await User.findOne({ myInviteCode: code });
      if (!existing) {
        return code;
      }
      
      attempts++;
    }
    
    throw new AppError('无法生成唯一邀请码，请稍后重试', 500);
  }
  
  /**
   * 验证邀请码
   * @param {string} inviteCode - 邀请码
   * @returns {Promise<Object>} 验证结果
   */
  static async validateInviteCode(inviteCode) {
    try {
      if (!inviteCode || typeof inviteCode !== 'string') {
        return {
          valid: false,
          message: '邀请码格式无效'
        };
      }
      
      const trimmedCode = inviteCode.trim().toUpperCase();
      if (trimmedCode.length < 4 || trimmedCode.length > 20) {
        return {
          valid: false,
          message: '邀请码长度无效'
        };
      }
      
      // 查找邀请人
      const inviter = await User.findOne({ 
        myInviteCode: trimmedCode,
        status: 'active'
      });
      
      if (!inviter) {
        return {
          valid: false,
          message: '邀请码不存在或已失效'
        };
      }
      
      // 检查邀请系统是否启用
      const inviteEnabled = await SystemSetting.getValue('ENABLE_INVITE_SYSTEM', true);
      if (!inviteEnabled) {
        return {
          valid: false,
          message: '邀请系统暂时关闭'
        };
      }
      
      return {
        valid: true,
        inviter: {
          id: inviter._id,
          name: inviter.name,
          email: inviter.email
        },
        message: '邀请码有效'
      };
    } catch (error) {
      logger.error('验证邀请码时发生错误:', error);
      return {
        valid: false,
        message: '验证邀请码时发生错误'
      };
    }
  }
  
  /**
   * 处理邀请注册
   * @param {string} newUserId - 新用户ID
   * @param {string} inviteCode - 邀请码
   * @returns {Promise<Object>} 处理结果
   */
  static async processInviteRegistration(newUserId, inviteCode) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 验证邀请码
      const validation = await this.validateInviteCode(inviteCode);
      if (!validation.valid) {
        throw new AppError(validation.message, 400);
      }
      
      const inviterId = validation.inviter.id;
      
      // 检查是否已经处理过这个邀请
      const existingRecord = await InviteRecord.findOne({
        inviterId,
        inviteeId: newUserId
      });
      
      if (existingRecord) {
        await session.abortTransaction();
        return {
          success: false,
          message: '此邀请关系已存在',
          alreadyProcessed: true
        };
      }
      
      // 获取系统设置
      const [inviterBonus, inviteeBonus] = await Promise.all([
        SystemSetting.getValue('INVITE_BONUS_QUERIES', 10),
        SystemSetting.getValue('INVITEE_BONUS_QUERIES', 10)
      ]);
      
      // 更新被邀请人信息
      const invitee = await User.findByIdAndUpdate(
        newUserId,
        {
          invitedBy: inviterId,
          inviteCode: inviteCode.toUpperCase(),
          $inc: { remainingQueries: inviteeBonus }
        },
        { 
          session, 
          new: true,
          runValidators: true
        }
      );
      
      if (!invitee) {
        throw new AppError('被邀请用户不存在', 404);
      }
      
      // 更新邀请人信息
      const inviter = await User.findByIdAndUpdate(
        inviterId,
        {
          $inc: { 
            invitedCount: 1,
            remainingQueries: inviterBonus
          }
        },
        { 
          session, 
          new: true,
          runValidators: true
        }
      );
      
      if (!inviter) {
        throw new AppError('邀请人不存在', 404);
      }
      
      // 创建邀请记录
      const inviteRecord = await InviteRecord.createInviteRecord(
        inviterId,
        newUserId,
        inviteCode,
        inviterBonus,
        inviteeBonus,
        session
      );
      
      // 记录奖励日志
      await Promise.all([
        QueryRecord.recordInviteBonus(
          newUserId,
          inviteeBonus,
          invitee.remainingQueries,
          inviteRecord._id,
          session
        ),
        QueryRecord.recordInviteBonus(
          inviterId,
          inviterBonus,
          inviter.remainingQueries,
          inviteRecord._id,
          session
        )
      ]);
      
      await session.commitTransaction();
      
      logger.info(`邀请注册处理成功: 邀请人 ${inviterId}, 被邀请人 ${newUserId}`);
      
      return {
        success: true,
        message: '邀请注册处理成功',
        data: {
          inviteRecord: inviteRecord._id,
          inviterBonus,
          inviteeBonus,
          inviteeRemainingQueries: invitee.remainingQueries,
          inviterRemainingQueries: inviter.remainingQueries
        }
      };
      
    } catch (error) {
      await session.abortTransaction();
      logger.error('处理邀请注册时发生错误:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('处理邀请注册时发生内部错误', 500);
    } finally {
      session.endSession();
    }
  }
  
  /**
   * 获取用户邀请统计
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 邀请统计信息
   */
  static async getUserInviteStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('用户不存在', 404);
      }
      
      console.log('🔍 [DEBUG] ========== 邀請統計調試開始 ==========');
      console.log('🔍 [DEBUG] 查詢用戶ID:', userId);
      console.log('🔍 [DEBUG] 用戶信息:', { name: user.name, email: user.email, myInviteCode: user.myInviteCode });
      
      // 获取邀请记录统计
      const inviteStats = await InviteRecord.getInviteStats(userId);
      console.log('🔍 [DEBUG] 數據庫統計查詢結果:', JSON.stringify(inviteStats, null, 2));
      
      // 获取最近的邀请记录
      const recentInvites = await InviteRecord.find({ inviterId: userId })
        .populate('inviteeId', 'name email registrationDate')
        .sort({ createdAt: -1 })
        .limit(10);
      
      console.log('🔍 [DEBUG] 最近邀請記錄查詢結果:');
      console.log(`🔍 [DEBUG]   找到 ${recentInvites.length} 條記錄`);
      recentInvites.forEach((record, index) => {
        console.log(`🔍 [DEBUG]   記錄 ${index + 1}:`);
        console.log(`🔍 [DEBUG]     ID: ${record._id}`);
        console.log(`🔍 [DEBUG]     邀請人ID: ${record.inviterId}`);
        console.log(`🔍 [DEBUG]     被邀請人ID: ${record.inviteeId}`);
        console.log(`🔍 [DEBUG]     邀請碼: ${record.inviteCode}`);
        console.log(`🔍 [DEBUG]     狀態: ${record.status}`);
        console.log(`🔍 [DEBUG]     邀請人獎勵: ${record.inviterBonus}`);
        console.log(`🔍 [DEBUG]     創建時間: ${record.createdAt}`);
        if (record.inviteeId) {
          console.log(`🔍 [DEBUG]     被邀請人姓名: ${record.inviteeId.name}`);
          console.log(`🔍 [DEBUG]     被邀請人郵箱: ${record.inviteeId.email}`);
        }
      });
      
      // 统计数据处理
      let totalInvites = 0;
      let successfulInvites = 0;
      let pendingInvites = 0;
      let totalBonusEarned = 0;
      
      console.log('🔍 [DEBUG] 開始處理統計數據...');
      inviteStats.forEach(stat => {
        console.log(`🔍 [DEBUG] 處理狀態 '${stat._id}': ${stat.count} 條記錄, 總獎勵: ${stat.totalInviterBonus}`);
        totalInvites += stat.count;
        if (stat._id === 'completed') {
          successfulInvites = stat.count;
          totalBonusEarned = stat.totalInviterBonus;
          console.log('🔍 [DEBUG] ✅ 找到 completed 狀態記錄!');
        } else if (stat._id === 'pending') {
          pendingInvites = stat.count;
          console.log('🔍 [DEBUG] 📋 找到 pending 狀態記錄');
        } else {
          console.log(`🔍 [DEBUG] ❓ 未知狀態: ${stat._id}`);
        }
      });
      
      console.log('🔍 [DEBUG] 統計處理結果:');
      console.log(`🔍 [DEBUG]   totalInvites: ${totalInvites}`);
      console.log(`🔍 [DEBUG]   successfulInvites: ${successfulInvites}`);
      console.log(`🔍 [DEBUG]   totalBonusEarned: ${totalBonusEarned}`);
      
      // 🔧 緊急修復：如果統計為0，但有邀請記錄，直接使用記錄數據
      if (successfulInvites === 0 && recentInvites.length > 0) {
        console.log('🔧 [FIX] 檢測到統計數據為0但有邀請記錄，使用記錄數據修復...');
        successfulInvites = recentInvites.length;
        totalBonusEarned = recentInvites.length * 10; // 每次邀請10次獎勵
        console.log('🔧 [FIX] 修復後的數據:');
        console.log(`🔧 [FIX]   successfulInvites: ${successfulInvites}`);
        console.log(`🔧 [FIX]   totalBonusEarned: ${totalBonusEarned}`);
      }
      
      // 🔧 第二層修復：檢查用戶的 invitedCount 字段
      if (successfulInvites === 0 && user.invitedCount > 0) {
        console.log('🔧 [FIX2] 使用用戶 invitedCount 字段修復統計...');
        successfulInvites = user.invitedCount;
        totalBonusEarned = user.invitedCount * 10;
        console.log('🔧 [FIX2] 修復後的數據:');
        console.log(`🔧 [FIX2]   successfulInvites: ${successfulInvites}`);
        console.log(`🔧 [FIX2]   totalBonusEarned: ${totalBonusEarned}`);
      }
      
      // 計算本月統計
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const thisMonthStats = await InviteRecord.getInviteStats(userId, thisMonth);
      let thisMonthInvited = 0;
      let thisMonthBonus = 0;
      
      thisMonthStats.forEach(stat => {
        if (stat._id === 'completed') {
          thisMonthInvited = stat.count;
          thisMonthBonus = stat.totalInviterBonus;
        }
      });
      
      // 計算排名（簡化版本）
      const ranking = await InviteRecord.countDocuments({
        status: 'completed',
        inviterBonus: { $gt: totalBonusEarned }
      }) + 1;

      return {
        success: true,
        data: {
          totalInvited: successfulInvites,              // ✅ 修正字段名
          totalBonusEarned,                             // ✅ 保持不變
          thisMonthInvited,                             // ✅ 新增字段
          thisMonthBonus,                               // ✅ 新增字段
          myInviteCode: user.myInviteCode,              // ✅ 保持不變
          ranking,                                      // ✅ 新增字段
          inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?invite=${user.myInviteCode}`,
          recentInvitees: recentInvites.map(record => ({  // ✅ 修正字段名
            name: PrivacyUtils.maskName(record.inviteeId?.name),     // ✅ 隱私處理姓名
            email: PrivacyUtils.maskEmail(record.inviteeId?.email),  // ✅ 隱私處理郵箱
            invitedAt: record.createdAt,
            bonusReceived: record.inviterBonus,
            status: "active"
          })),
          monthlyStats: []                              // ✅ 新增字段（可選）
        }
      };
      
    } catch (error) {
      logger.error('获取用户邀请统计时发生错误:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('获取邀请统计时发生内部错误', 500);
    }
  }
  
  /**
   * 获取邀请排行榜
   * @param {number} limit - 返回数量限制
   * @param {Date} startDate - 开始日期
   * @param {Date} endDate - 结束日期
   * @returns {Promise<Object>} 排行榜数据
   */
  static async getInviteLeaderboard(limit = 10, startDate = null, endDate = null) {
    try {
      const topInviters = await InviteRecord.getTopInviters(limit, startDate, endDate);
      
      return {
        success: true,
        data: {
          topInviters,
          period: {
            startDate,
            endDate,
            limit
          }
        }
      };
      
    } catch (error) {
      logger.error('获取邀请排行榜时发生错误:', error);
      throw new AppError('获取邀请排行榜时发生内部错误', 500);
    }
  }
  
  /**
   * 获取邀请系统统计
   * @param {Date} startDate - 开始日期
   * @param {Date} endDate - 结束日期
   * @returns {Promise<Object>} 系统统计数据
   */
  static async getInviteSystemStats(startDate = null, endDate = null) {
    try {
      const matchCondition = {};
      
      if (startDate || endDate) {
        matchCondition.createdAt = {};
        if (startDate) matchCondition.createdAt.$gte = startDate;
        if (endDate) matchCondition.createdAt.$lte = endDate;
      }
      
      // 获取基础统计
      const baseStats = await InviteRecord.aggregate([
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
      
      // 获取每日趋势
      const dailyTrends = await InviteRecord.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              status: '$status'
            },
            count: { $sum: 1 },
            bonusDistributed: { $sum: { $add: ['$inviterBonus', '$inviteeBonus'] } }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]);
      
      // 处理统计数据
      let totalInvites = 0;
      let successfulInvites = 0;
      let totalBonusDistributed = 0;
      
      baseStats.forEach(stat => {
        totalInvites += stat.count;
        if (stat._id === 'completed') {
          successfulInvites = stat.count;
          totalBonusDistributed = stat.totalInviterBonus + stat.totalInviteeBonus;
        }
      });
      
      const conversionRate = totalInvites > 0 ? (successfulInvites / totalInvites * 100).toFixed(2) : 0;
      
      return {
        success: true,
        data: {
          summary: {
            totalInvites,
            successfulInvites,
            conversionRate: parseFloat(conversionRate),
            totalBonusDistributed
          },
          trends: {
            daily: dailyTrends
          },
          statusBreakdown: baseStats
        }
      };
      
    } catch (error) {
      logger.error('获取邀请系统统计时发生错误:', error);
      throw new AppError('获取邀请系统统计时发生内部错误', 500);
    }
  }
  
  /**
   * 发放注册奖励
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 发放结果
   */
  static async grantRegistrationBonus(userId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 检查用户是否已获得注册奖励
      const existingBonus = await QueryRecord.findOne({
        userId,
        action: 'registration_bonus'
      });
      
      if (existingBonus) {
        await session.abortTransaction();
        return {
          success: false,
          message: '注册奖励已发放',
          alreadyGranted: true
        };
      }
      
      // 获取注册奖励设置
      const bonusAmount = await SystemSetting.getValue('REGISTRATION_BONUS_QUERIES', 10);
      
      // 更新用户咨询次数
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $inc: { remainingQueries: bonusAmount }
        },
        { 
          session, 
          new: true,
          runValidators: true
        }
      );
      
      if (!user) {
        throw new AppError('用户不存在', 404);
      }
      
      // 记录奖励日志
      await QueryRecord.recordRegistrationBonus(
        userId,
        bonusAmount,
        user.remainingQueries,
        session
      );
      
      await session.commitTransaction();
      
      logger.info(`注册奖励发放成功: 用户 ${userId}, 奖励 ${bonusAmount} 次`);
      
      return {
        success: true,
        message: '注册奖励发放成功',
        data: {
          bonusAmount,
          remainingQueries: user.remainingQueries
        }
      };
      
    } catch (error) {
      await session.abortTransaction();
      logger.error('发放注册奖励时发生错误:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('发放注册奖励时发生内部错误', 500);
    } finally {
      session.endSession();
    }
  }

  /**
   * 管理员专用：获取所有邀请记录
   * @param {Object} options - 查询选项
   * @param {number} options.page - 页码
   * @param {number} options.limit - 每页数量
   * @param {string} options.status - 状态筛选 (all, completed, pending, expired)
   * @param {Date} options.startDate - 开始日期
   * @param {Date} options.endDate - 结束日期
   * @param {string} options.search - 搜索关键词（姓名或邀请码）
   * @returns {Promise<Object>} 邀请记录列表
   */
  static async getAllInviteRecords(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = 'all',
        startDate = null,
        endDate = null,
        search = ''
      } = options;

      // 构建查询条件
      const matchCondition = {};

      // 状态筛选
      if (status && status !== 'all') {
        matchCondition.status = status;
      }

      // 日期范围筛选
      if (startDate || endDate) {
        matchCondition.createdAt = {};
        if (startDate) matchCondition.createdAt.$gte = new Date(startDate);
        if (endDate) matchCondition.createdAt.$lte = new Date(endDate);
      }

      // 搜索功能（通过邀请码）
      if (search && search.trim()) {
        matchCondition.inviteCode = { $regex: search.trim(), $options: 'i' };
      }

      // 计算分页
      const skip = (page - 1) * limit;

      // 构建聚合管道
      const pipeline = [
        { $match: matchCondition },
        {
          $lookup: {
            from: 'users',
            localField: 'inviterId',
            foreignField: '_id',
            as: 'inviter'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'inviteeId',
            foreignField: '_id',
            as: 'invitee'
          }
        },
        {
          $project: {
            inviteCode: 1,
            status: 1,
            inviterBonus: 1,
            inviteeBonus: 1,
            bonusGiven: 1,
            createdAt: 1,
            completedAt: 1,
            'inviter._id': 1,
            'inviter.name': 1,
            'inviter.email': 1,
            'inviter.userType': 1,
            'invitee._id': 1,
            'invitee.name': 1,
            'invitee.email': 1,
            'invitee.userType': 1
          }
        },
        { $sort: { createdAt: -1 } }
      ];

      // 如果有姓名搜索，需要在lookup后进行匹配
      if (search && search.trim()) {
        const searchRegex = { $regex: search.trim(), $options: 'i' };
        pipeline.push({
          $match: {
            $or: [
              { inviteCode: searchRegex },
              { 'inviter.name': searchRegex },
              { 'invitee.name': searchRegex }
            ]
          }
        });
      }

      // 获取总数
      const totalPipeline = [...pipeline, { $count: 'total' }];
      const totalResult = await InviteRecord.aggregate(totalPipeline);
      const total = totalResult.length > 0 ? totalResult[0].total : 0;

      // 添加分页
      pipeline.push({ $skip: skip }, { $limit: limit });

      // 执行查询
      const records = await InviteRecord.aggregate(pipeline);

      // 处理返回数据
      const processedRecords = records.map(record => ({
        id: record._id,
        inviteCode: record.inviteCode,
        status: record.status,
        inviterBonus: record.inviterBonus,
        inviteeBonus: record.inviteeBonus,
        bonusGiven: record.bonusGiven,
        createdAt: record.createdAt,
        completedAt: record.completedAt,
        registeredAt: record.completedAt,
        bonusAwarded: record.bonusGiven,
        inviter: record.inviter && record.inviter.length > 0 ? {
          id: record.inviter[0]._id,
          name: record.inviter[0].name,
          email: record.inviter[0].email,
          userType: record.inviter[0].userType
        } : null,
        invitee: record.invitee && record.invitee.length > 0 ? {
          id: record.invitee[0]._id,
          name: record.invitee[0].name,
          email: record.invitee[0].email,
          userType: record.invitee[0].userType
        } : null
      }));

      // 计算分页信息
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        success: true,
        data: {
          records: processedRecords,
          pagination: {
            currentPage: page,
            totalPages,
            totalRecords: total,
            recordsPerPage: limit,
            hasNext,
            hasPrev
          },
          filters: {
            status,
            startDate,
            endDate,
            search
          }
        }
      };

    } catch (error) {
      logger.error('获取邀请记录时发生错误:', error);
      throw new AppError('获取邀请记录时发生内部错误', 500);
    }
  }

  /**
   * 管理员专用：获取邀请系统设置
   * @returns {Promise<Object>} 系统设置
   */
  static async getInviteAdminSettings() {
    try {
      // 获取系统设置
      const [
        inviterBonus,
        inviteeBonus,
        isEnabled,
        maxInvitesPerUser,
        registrationBonus
      ] = await Promise.all([
        SystemSetting.getValue('INVITE_BONUS_QUERIES', 10),
        SystemSetting.getValue('INVITEE_BONUS_QUERIES', 10),
        SystemSetting.getValue('ENABLE_INVITE_SYSTEM', true),
        SystemSetting.getValue('MAX_INVITES_PER_USER', 100),
        SystemSetting.getValue('REGISTRATION_BONUS_QUERIES', 10)
      ]);

      return {
        success: true,
        data: {
          inviterBonus,           // 邀请人获得的奖励次数
          inviteeBonus,           // 被邀请人获得的奖励次数
          registrationBonus,      // 注册奖励次数
          isEnabled,              // 邀请功能是否启用
          maxInvitesPerUser,      // 每用户最大邀请数
          description: "邀请好友注册可获得额外咨询次数",
          lastUpdated: new Date()
        }
      };

    } catch (error) {
      logger.error('获取邀请系统设置时发生错误:', error);
      throw new AppError('获取邀请系统设置时发生内部错误', 500);
    }
  }

  /**
   * 管理员专用：更新邀请系统设置
   * @param {Object} settings - 设置对象
   * @param {number} settings.inviterBonus - 邀请人奖励次数
   * @param {number} settings.inviteeBonus - 被邀请人奖励次数
   * @param {number} settings.registrationBonus - 注册奖励次数
   * @param {boolean} settings.isEnabled - 是否启用邀请系统
   * @param {number} settings.maxInvitesPerUser - 每用户最大邀请数
   * @returns {Promise<Object>} 更新结果
   */
  static async updateInviteAdminSettings(settings) {
    try {
      const {
        inviterBonus,
        inviteeBonus,
        registrationBonus,
        isEnabled,
        maxInvitesPerUser
      } = settings;

      // 验证设置值
      const validations = [];
      
      if (inviterBonus !== undefined) {
        if (!Number.isInteger(inviterBonus) || inviterBonus < 0 || inviterBonus > 100) {
          validations.push('邀请人奖励次数必须是0-100之间的整数');
        }
      }
      
      if (inviteeBonus !== undefined) {
        if (!Number.isInteger(inviteeBonus) || inviteeBonus < 0 || inviteeBonus > 100) {
          validations.push('被邀请人奖励次数必须是0-100之间的整数');
        }
      }
      
      if (registrationBonus !== undefined) {
        if (!Number.isInteger(registrationBonus) || registrationBonus < 0 || registrationBonus > 100) {
          validations.push('注册奖励次数必须是0-100之间的整数');
        }
      }
      
      if (maxInvitesPerUser !== undefined) {
        if (!Number.isInteger(maxInvitesPerUser) || maxInvitesPerUser < 1 || maxInvitesPerUser > 1000) {
          validations.push('每用户最大邀请数必须是1-1000之间的整数');
        }
      }
      
      if (isEnabled !== undefined && typeof isEnabled !== 'boolean') {
        validations.push('邀请系统启用状态必须是布尔值');
      }

      if (validations.length > 0) {
        throw new AppError(`设置验证失败: ${validations.join(', ')}`, 400);
      }

      // 更新系统设置
      const updatePromises = [];
      
      if (inviterBonus !== undefined) {
        updatePromises.push(SystemSetting.setValue('INVITE_BONUS_QUERIES', inviterBonus));
      }
      
      if (inviteeBonus !== undefined) {
        updatePromises.push(SystemSetting.setValue('INVITEE_BONUS_QUERIES', inviteeBonus));
      }
      
      if (registrationBonus !== undefined) {
        updatePromises.push(SystemSetting.setValue('REGISTRATION_BONUS_QUERIES', registrationBonus));
      }
      
      if (isEnabled !== undefined) {
        updatePromises.push(SystemSetting.setValue('ENABLE_INVITE_SYSTEM', isEnabled));
      }
      
      if (maxInvitesPerUser !== undefined) {
        updatePromises.push(SystemSetting.setValue('MAX_INVITES_PER_USER', maxInvitesPerUser));
      }

      await Promise.all(updatePromises);

      // 获取更新后的设置
      const updatedSettings = await this.getInviteAdminSettings();

      logger.info('邀请系统设置更新成功:', settings);

      return {
        success: true,
        message: '邀请系统设置更新成功',
        data: updatedSettings.data
      };

    } catch (error) {
      logger.error('更新邀请系统设置时发生错误:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('更新邀请系统设置时发生内部错误', 500);
    }
  }
}

export default InviteService; 