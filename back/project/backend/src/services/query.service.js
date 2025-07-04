const mongoose = require('mongoose');
const User = require('../models/user.model.js');
const QueryRecord = require('../models/query-record.model.js');
const SystemSetting = require('../models/system-setting.model.js');
const { AppError, errorUtils } = require('../utils/error.js');
const logger = require('../utils/logger.js');

/**
 * 咨询次数服务类
 * 处理用户咨询次数的所有业务逻辑，确保原子性操作
 */
class QueryService {
  
  /**
   * 扣减用户咨询次数（原子操作）
   * @param {string} userId - 用户ID
   * @param {string} reason - 扣减原因
   * @param {string} relatedResourceId - 相关资源ID
   * @param {string} relatedResourceType - 相关资源类型
   * @param {Object} metadata - 额外元数据
   * @returns {Promise<Object>} 扣减结果
   */
  static async decreaseQueryCount(userId, reason = 'AI咨询', relatedResourceId = null, relatedResourceType = null, metadata = {}) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 检查每日限制
      const dailyLimit = await SystemSetting.getValue('MAX_QUERIES_PER_DAY', 50);
      const todayCount = await this.getTodayQueryCount(userId);
      
      if (todayCount >= dailyLimit) {
        throw new AppError(`已达到每日咨询次数上限 (${dailyLimit} 次)`, 429);
      }
      
      // 锁定用户记录，防止并发问题
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new AppError('用户不存在', 404);
      }
      
      // 检查用户状态
      if (user.status !== 'active') {
        throw new AppError('用户账户状态异常，无法使用咨询服务', 403);
      }
      
      // 检查剩余次数
      if (user.remainingQueries <= 0) {
        throw new AppError('咨询次数不足，请联系管理员或邀请好友获得更多次数', 400);
      }
      
      // 原子性更新用户记录
      const updateResult = await User.findByIdAndUpdate(
        userId,
        {
          $inc: { 
            remainingQueries: -1,
            totalConsultations: 1
          },
          lastQueryAt: new Date()
        },
        { 
          new: true,
          session,
          runValidators: true
        }
      );
      
      if (!updateResult) {
        throw new AppError('更新用户记录失败', 500);
      }
      
      // 记录操作日志
      await QueryRecord.recordDecrease(
        userId,
        updateResult.remainingQueries,
        reason,
        relatedResourceId,
        relatedResourceType,
        metadata
      );
      
      await session.commitTransaction();
      
      logger.info(`用户 ${userId} 咨询次数扣减成功，剩余 ${updateResult.remainingQueries} 次`);
      
      return {
        success: true,
        message: '咨询次数扣减成功',
        data: {
          remainingQueries: updateResult.remainingQueries,
          totalConsultations: updateResult.totalConsultations,
          lastQueryAt: updateResult.lastQueryAt
        }
      };
      
    } catch (error) {
      await session.abortTransaction();
      logger.error('扣减咨询次数时发生错误:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('扣减咨询次数时发生内部错误', 500);
    } finally {
      session.endSession();
    }
  }
  
  /**
   * 增加用户咨询次数（原子操作）
   * @param {string} userId - 用户ID
   * @param {number} amount - 增加数量
   * @param {string} reason - 增加原因
   * @param {string} operatorId - 操作员ID
   * @param {string} operatorType - 操作员类型
   * @param {Object} metadata - 额外元数据
   * @returns {Promise<Object>} 增加结果
   */
  static async increaseQueryCount(userId, amount, reason, operatorId = null, operatorType = 'system', metadata = {}) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 验证参数
      if (!amount || amount <= 0) {
        throw new AppError('增加数量必须大于0', 400);
      }
      
      if (amount > 1000) {
        throw new AppError('单次增加数量不能超过1000', 400);
      }
      
      // 锁定用户记录
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new AppError('用户不存在', 404);
      }
      
      // 原子性更新用户记录
      const updateResult = await User.findByIdAndUpdate(
        userId,
        {
          $inc: { remainingQueries: amount }
        },
        { 
          new: true,
          session,
          runValidators: true
        }
      );
      
      if (!updateResult) {
        throw new AppError('更新用户记录失败', 500);
      }
      
      // 记录操作日志
      await QueryRecord.recordIncrease(
        userId,
        amount,
        updateResult.remainingQueries,
        reason,
        operatorId,
        operatorType,
        metadata
      );
      
      await session.commitTransaction();
      
      logger.info(`用户 ${userId} 咨询次数增加成功，增加 ${amount} 次，剩余 ${updateResult.remainingQueries} 次`);
      
      return {
        success: true,
        message: '咨询次数增加成功',
        data: {
          increasedAmount: amount,
          remainingQueries: updateResult.remainingQueries,
          totalConsultations: updateResult.totalConsultations
        }
      };
      
    } catch (error) {
      await session.abortTransaction();
      logger.error('增加咨询次数时发生错误:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('增加咨询次数时发生内部错误', 500);
    } finally {
      session.endSession();
    }
  }
  
  /**
   * 管理员批量调整咨询次数
   * @param {Array} userIds - 用户ID数组
   * @param {string} operation - 操作类型 ('increase', 'decrease', 'set')
   * @param {number} amount - 操作数量
   * @param {string} reason - 操作原因
   * @param {string} adminId - 管理员ID
   * @returns {Promise<Object>} 批量操作结果
   */
  static async batchUpdateQueryCount(userIds, operation, amount, reason, adminId) {
    // 检查管理员批量操作限制
    const batchLimit = await SystemSetting.getValue('ADMIN_BATCH_OPERATION_LIMIT', 1000);
    if (userIds.length > batchLimit) {
      throw new AppError(`批量操作数量不能超过 ${batchLimit}`, 400);
    }
    
    // 验证参数
    if (!['increase', 'decrease', 'set'].includes(operation)) {
      throw new AppError('无效的操作类型', 400);
    }
    
    if (!amount || amount < 0) {
      throw new AppError('操作数量必须大于等于0', 400);
    }
    
    const results = [];
    const errors = [];
    
    // 并发处理，但控制并发数
    const concurrency = 10;
    for (let i = 0; i < userIds.length; i += concurrency) {
      const batch = userIds.slice(i, i + concurrency);
      
      const promises = batch.map(async (userId) => {
        try {
          const result = await this.adminAdjustQueryCount(userId, operation, amount, reason, adminId);
          return { userId, success: true, ...result.data };
        } catch (error) {
          logger.error(`批量操作用户 ${userId} 失败:`, error);
          return { 
            userId, 
            success: false, 
            error: error.message 
          };
        }
      });
      
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }
    
    // 统计结果
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    
    logger.info(`批量操作完成: 成功 ${successCount}, 失败 ${errorCount}`);
    
    return {
      success: true,
      message: `批量操作完成: 成功 ${successCount} 个，失败 ${errorCount} 个`,
      data: {
        totalProcessed: results.length,
        successCount,
        errorCount,
        results: results
      }
    };
  }
  
  /**
   * 管理员调整单个用户咨询次数
   * @param {string} userId - 用户ID
   * @param {string} operation - 操作类型
   * @param {number} amount - 操作数量
   * @param {string} reason - 操作原因
   * @param {string} adminId - 管理员ID
   * @returns {Promise<Object>} 调整结果
   */
  static async adminAdjustQueryCount(userId, operation, amount, reason, adminId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 锁定用户记录
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new AppError('用户不存在', 404);
      }
      
      let newRemainingQueries;
      let actualAmount;
      
      switch (operation) {
        case 'increase':
          newRemainingQueries = user.remainingQueries + amount;
          actualAmount = amount;
          break;
        case 'decrease':
          newRemainingQueries = Math.max(0, user.remainingQueries - amount);
          actualAmount = -(user.remainingQueries - newRemainingQueries);
          break;
        case 'set':
          newRemainingQueries = amount;
          actualAmount = amount - user.remainingQueries;
          break;
        default:
          throw new AppError('无效的操作类型', 400);
      }
      
      // 更新用户记录
      const updateResult = await User.findByIdAndUpdate(
        userId,
        {
          remainingQueries: newRemainingQueries
        },
        { 
          new: true,
          session,
          runValidators: true
        }
      );
      
      // 记录管理员操作
      await QueryRecord.recordAdminAdjust(
        userId,
        actualAmount,
        updateResult.remainingQueries,
        reason,
        adminId,
        { 
          operation,
          originalAmount: user.remainingQueries,
          requestedAmount: amount
        }
      );
      
      await session.commitTransaction();
      
      logger.info(`管理员 ${adminId} 调整用户 ${userId} 咨询次数: ${operation} ${amount}, 新余额: ${updateResult.remainingQueries}`);
      
      return {
        success: true,
        message: '咨询次数调整成功',
        data: {
          operation,
          amount: actualAmount,
          previousBalance: user.remainingQueries,
          newBalance: updateResult.remainingQueries
        }
      };
      
    } catch (error) {
      await session.abortTransaction();
      logger.error('管理员调整咨询次数时发生错误:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('调整咨询次数时发生内部错误', 500);
    } finally {
      session.endSession();
    }
  }
  
  /**
   * 获取用户咨询次数状态
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 用户状态信息
   */
  static async getUserQueryStatus(userId) {
    try {
      const user = await User.findById(userId, 'remainingQueries totalConsultations lastQueryAt registrationDate');
      if (!user) {
        throw new AppError('用户不存在', 404);
      }
      
      // 获取今日使用次数
      const todayCount = await this.getTodayQueryCount(userId);
      
      // 获取最近的操作记录
      const recentRecords = await QueryRecord.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('action amount remainingAfter reason createdAt');
      
      return {
        success: true,
        data: {
          remainingQueries: user.remainingQueries,
          totalConsultations: user.totalConsultations,
          lastQueryAt: user.lastQueryAt,
          todayUsageCount: todayCount,
          registrationDate: user.registrationDate,
          recentActivities: recentRecords
        }
      };
      
    } catch (error) {
      logger.error('获取用户咨询状态时发生错误:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('获取用户状态时发生内部错误', 500);
    }
  }
  
  /**
   * 获取用户咨询记录
   * @param {string} userId - 用户ID
   * @param {number} page - 页码
   * @param {number} limit - 每页数量
   * @param {string} action - 过滤操作类型
   * @returns {Promise<Object>} 咨询记录
   */
  static async getUserQueryRecords(userId, page = 1, limit = 20, action = null) {
    try {
      const query = { userId };
      if (action) {
        query.action = action;
      }
      
      const offset = (page - 1) * limit;
      
      const [records, total] = await Promise.all([
        QueryRecord.find(query)
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .populate('operatorId', 'name email')
          .select('action amount remainingAfter reason operatorType createdAt metadata'),
        QueryRecord.countDocuments(query)
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        success: true,
        data: {
          records,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      };
      
    } catch (error) {
      logger.error('获取用户咨询记录时发生错误:', error);
      throw new AppError('获取咨询记录时发生内部错误', 500);
    }
  }
  
  /**
   * 获取今日咨询次数 (基于台湾时区)
   * @param {string} userId - 用户ID
   * @returns {Promise<number>} 今日咨询次数
   */
  static async getTodayQueryCount(userId) {
    // 使用台湾时区 (UTC+8) 计算今日范围
    const timezone = 'Asia/Taipei';
    
    // 获取当前台湾时间
    const nowInTaipei = new Date().toLocaleString("en-US", {timeZone: timezone});
    const taipeiDate = new Date(nowInTaipei);
    
    // 计算台湾时区的今日开始和结束时间
    const startOfDayTaipei = new Date(taipeiDate);
    startOfDayTaipei.setHours(0, 0, 0, 0);
    
    const endOfDayTaipei = new Date(taipeiDate);
    endOfDayTaipei.setHours(23, 59, 59, 999);
    
    // 转换为UTC时间进行数据库查询 (台湾时间 - 8小时 = UTC时间)
    const utcOffset = 8 * 60 * 60 * 1000; // 8小时的毫秒数
    const startOfDayUTC = new Date(startOfDayTaipei.getTime() - utcOffset);
    const endOfDayUTC = new Date(endOfDayTaipei.getTime() - utcOffset);
    
    const count = await QueryRecord.countDocuments({
      userId,
      action: 'decrease',
      createdAt: {
        $gte: startOfDayUTC,
        $lte: endOfDayUTC
      }
    });
    
    return count;
  }
  
  /**
   * 获取系统咨询统计
   * @param {Date} startDate - 开始日期
   * @param {Date} endDate - 结束日期
   * @returns {Promise<Object>} 系统统计数据
   */
  static async getSystemQueryStats(startDate = null, endDate = null) {
    try {
      const matchCondition = {};
      
      if (startDate || endDate) {
        matchCondition.createdAt = {};
        if (startDate) matchCondition.createdAt.$gte = startDate;
        if (endDate) matchCondition.createdAt.$lte = endDate;
      }
      
      // 获取基础统计
      const baseStats = await QueryRecord.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);
      
      // 获取使用趋势
      const usageTrends = await QueryRecord.getSystemUsageTrends(30);
      
      // 获取热门用户
      const topUsers = await QueryRecord.getTopUsers(10, 'decrease', 30);
      
      return {
        success: true,
        data: {
          summary: baseStats,
          trends: usageTrends,
          topUsers
        }
      };
      
    } catch (error) {
      logger.error('获取系统咨询统计时发生错误:', error);
      throw new AppError('获取系统统计时发生内部错误', 500);
    }
  }
}

module.exports = QueryService; 