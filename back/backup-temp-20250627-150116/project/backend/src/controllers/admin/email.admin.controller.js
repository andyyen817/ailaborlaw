import EmailLog from '../../models/email_log.model.js';
import User from '../../models/user.model.js';
import EmailService from '../../services/email.service.js';
import logger from '../../utils/logger.js';

/**
 * 管理後台郵件管理控制器
 * 處理郵件發送統計、日志查詢等管理功能
 */

/**
 * 獲取郵件發送統計
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
export const getEmailStatistics = async (req, res) => {
  try {
    const { startDate, endDate, type = 'all' } = req.query;
    
    // 設置時間範圍
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.sentAt = {};
      if (startDate) dateFilter.sentAt.$gte = new Date(startDate);
      if (endDate) dateFilter.sentAt.$lte = new Date(endDate);
    } else {
      // 默認查詢最近30天
      dateFilter.sentAt = {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      };
    }

    // 設置類型過濾
    if (type !== 'all') {
      dateFilter.type = type;
    }

    // 1. 基礎統計
    const basicStats = await EmailLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalSent: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          verifiedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] }
          }
        }
      }
    ]);

    // 2. 按類型統計
    const typeStats = await EmailLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          verifiedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] }
          }
        }
      }
    ]);

    // 3. 按日期統計（最近7天）
    const dailyStats = await EmailLog.aggregate([
      {
        $match: {
          ...dateFilter,
          sentAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$sentAt' },
            month: { $month: '$sentAt' },
            day: { $dayOfMonth: '$sentAt' }
          },
          count: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // 4. 今日統計
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayStats = await EmailLog.aggregate([
      {
        $match: {
          sentAt: { $gte: todayStart, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: null,
          todaySent: { $sum: 1 },
          todaySuccess: {
            $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
          }
        }
      }
    ]);

    // 5. 失敗原因統計
    const failureReasons = await EmailLog.aggregate([
      { 
        $match: { 
          ...dateFilter,
          status: 'failed',
          errorMessage: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$errorMessage',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 6. 平均驗證時間
    const avgVerificationTime = await EmailLog.aggregate([
      {
        $match: {
          ...dateFilter,
          status: 'verified',
          verifiedAt: { $exists: true },
          sentAt: { $exists: true }
        }
      },
      {
        $project: {
          verificationTime: {
            $subtract: ['$verifiedAt', '$sentAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$verificationTime' }
        }
      }
    ]);

    // 構建響應數據
    const stats = basicStats[0] || { totalSent: 0, successCount: 0, failedCount: 0, verifiedCount: 0 };
    const today = todayStats[0] || { todaySent: 0, todaySuccess: 0 };
    
    const responseData = {
      // 基礎統計
      totalSent: stats.totalSent,
      successCount: stats.successCount,
      failedCount: stats.failedCount,
      verifiedCount: stats.verifiedCount,
      successRate: stats.totalSent > 0 ? ((stats.successCount / stats.totalSent) * 100).toFixed(2) : 0,
      verificationRate: stats.successCount > 0 ? ((stats.verifiedCount / stats.successCount) * 100).toFixed(2) : 0,
      
      // 今日統計
      todaySent: today.todaySent,
      todaySuccess: today.todaySuccess,
      
      // 按類型統計
      typeStats: typeStats.map(item => ({
        type: item._id,
        count: item.count,
        successCount: item.successCount,
        failedCount: item.failedCount,
        verifiedCount: item.verifiedCount,
        successRate: item.count > 0 ? ((item.successCount / item.count) * 100).toFixed(2) : 0
      })),
      
      // 按日期統計
      dailyStats: dailyStats.map(item => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        count: item.count,
        successCount: item.successCount
      })),
      
      // 失敗原因
      failureReasons: failureReasons.map(item => ({
        reason: item._id,
        count: item.count
      })),
      
      // 平均驗證時間（分鐘）
      avgVerificationTime: avgVerificationTime.length > 0 
        ? Math.round(avgVerificationTime[0].avgTime / (1000 * 60)) 
        : 0
    };

    return res.status(200).json({
      success: true,
      message: '郵件統計獲取成功',
      data: responseData
    });

  } catch (error) {
    logger.error(`獲取郵件統計錯誤: ${error.message}`, { stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '伺服器在獲取郵件統計時發生錯誤',
      error: { code: 'INTERNAL_SERVER_ERROR', details: error.message }
    });
  }
};

/**
 * 獲取郵件發送日志
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
export const getEmailLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      email,
      userId,
      startDate,
      endDate
    } = req.query;

    // 構建查詢條件
    const filter = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (userId) filter.userId = userId;
    
    if (startDate || endDate) {
      filter.sentAt = {};
      if (startDate) filter.sentAt.$gte = new Date(startDate);
      if (endDate) filter.sentAt.$lte = new Date(endDate);
    }

    // 計算分頁
    const skip = (page - 1) * limit;
    
    // 查詢日志
    const logs = await EmailLog.find(filter)
      .populate('userId', 'name email userType')
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // 計算總數
    const total = await EmailLog.countDocuments(filter);
    
    // 構建響應數據
    const responseData = {
      logs: logs.map(log => ({
        id: log._id,
        user: log.userId ? {
          id: log.userId._id,
          name: log.userId.name,
          email: log.userId.email,
          userType: log.userId.userType
        } : null,
        email: log.email,
        type: log.type,
        templateId: log.templateId,
        status: log.status,
        sentAt: log.sentAt,
        verifiedAt: log.verifiedAt,
        expiresAt: log.expiresAt,
        aoksendResponse: log.aoksendResponse,
        errorMessage: log.errorMessage,
        retryCount: log.retryCount
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };

    return res.status(200).json({
      success: true,
      message: '郵件日志獲取成功',
      data: responseData
    });

  } catch (error) {
    logger.error(`獲取郵件日志錯誤: ${error.message}`, { stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '伺服器在獲取郵件日志時發生錯誤',
      error: { code: 'INTERNAL_SERVER_ERROR', details: error.message }
    });
  }
};

/**
 * 重發失敗的郵件
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
export const resendFailedEmail = async (req, res) => {
  try {
    const { logId } = req.params;
    
    // 查找郵件日志
    const emailLog = await EmailLog.findById(logId).populate('userId');
    if (!emailLog) {
      return res.status(404).json({
        success: false,
        message: '郵件日志不存在',
        error: { code: 'EMAIL_LOG_NOT_FOUND' }
      });
    }

    if (emailLog.status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: '只能重發失敗的郵件',
        error: { code: 'EMAIL_NOT_FAILED' }
      });
    }

    const user = emailLog.userId;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用戶不存在',
        error: { code: 'USER_NOT_FOUND' }
      });
    }

    // 生成新的驗證碼
    const verificationCode = EmailService.generateVerificationCode();
    let emailResult;

    // 根據類型重發郵件
    switch (emailLog.type) {
      case 'registration':
        emailResult = await EmailService.sendRegistrationEmail(
          emailLog.email,
          user.name,
          verificationCode,
          user._id
        );
        
        if (emailResult.success) {
          // 更新用戶驗證碼
          const hashedCode = await EmailService.hashVerificationCode(verificationCode);
          user.emailVerificationCode = hashedCode;
          user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
          await user.save();
        }
        break;
        
      case 'password_reset':
        emailResult = await EmailService.sendPasswordResetEmail(
          emailLog.email,
          user.name,
          verificationCode,
          user._id
        );
        
        if (emailResult.success) {
          // 更新用戶重置驗證碼
          const hashedCode = await EmailService.hashVerificationCode(verificationCode);
          user.passwordResetCode = hashedCode;
          user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
          await user.save();
        }
        break;
        
      case 'invite_confirmation':
        emailResult = await EmailService.sendInviteConfirmationEmail(
          emailLog.email,
          user.name,
          '邀請人', // 從原日志中獲取
          10,
          user._id
        );
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: '不支持的郵件類型',
          error: { code: 'UNSUPPORTED_EMAIL_TYPE' }
        });
    }

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: emailResult.message || '郵件重發失敗',
        error: { code: 'EMAIL_RESEND_FAILED' }
      });
    }

    return res.status(200).json({
      success: true,
      message: '郵件重發成功',
      data: {
        logId: emailLog._id,
        email: emailLog.email,
        type: emailLog.type,
        resentAt: new Date()
      }
    });

  } catch (error) {
    logger.error(`重發郵件錯誤: ${error.message}`, { logId: req.params.logId, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '伺服器在重發郵件時發生錯誤',
      error: { code: 'INTERNAL_SERVER_ERROR', details: error.message }
    });
  }
};

/**
 * 測試郵件服務連接
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
export const testEmailService = async (req, res) => {
  try {
    const testResult = await EmailService.testConnection();
    
    return res.status(200).json({
      success: testResult.success,
      message: testResult.message,
      data: testResult.data  // 修復：使用正確的data屬性
    });

  } catch (error) {
    logger.error(`測試郵件服務錯誤: ${error.message}`, { stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '伺服器在測試郵件服務時發生錯誤',
      error: { code: 'INTERNAL_SERVER_ERROR', details: error.message }
    });
  }
};

/**
 * 刪除過期的郵件日志
 * @param {Object} req - Express 請求對象
 * @param {Object} res - Express 響應對象
 */
export const cleanupExpiredLogs = async (req, res) => {
  try {
    const { daysOld = 60 } = req.body;
    
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    
    const result = await EmailLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    return res.status(200).json({
      success: true,
      message: `成功清理 ${result.deletedCount} 條過期郵件日志`,
      data: {
        deletedCount: result.deletedCount,
        cutoffDate
      }
    });

  } catch (error) {
    logger.error(`清理郵件日志錯誤: ${error.message}`, { stack: error.stack });
    return res.status(500).json({
      success: false,
      message: '伺服器在清理郵件日志時發生錯誤',
      error: { code: 'INTERNAL_SERVER_ERROR', details: error.message }
    });
  }
}; 