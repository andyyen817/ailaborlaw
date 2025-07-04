const Conversation = require('../../models/conversation.model.js');
const Message = require('../../models/message.model.js');
const User = require('../../models/user.model.js');
const n8nService = require('../../services/n8n.service.js');
const logger = require('../../utils/logger.js');
const XLSX = require('xlsx');

/**
 * 管理后台聊天控制器
 * 实现会话监控、统计分析和数据导出功能
 * 仅限管理员权限访问
 */

/**
 * 获取所有用户会话 (管理员权限)
 * GET /api/v1/chat/admin/sessions
 */
export const getAllSessions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = '',
      userId = '',
      search = '',
      startDate = '',
      endDate = ''
    } = req.query;

    // 参数验证和安全限制
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // 限制最大查詢數量為100
    const skip = (pageNum - 1) * limitNum;

    logger.info(`管理员获取所有会话`, { 
      adminId: req.admin._id, 
      page: pageNum, 
      limit: limitNum, 
      status, 
      userId, 
      search 
    });

    // 构建查询条件
    const query = {};
    
    // 状态筛选
    if (status && ['active', 'completed', 'abandoned'].includes(status)) {
      query.status = status;
    }
    
    // 用户筛选
    if (userId) {
      query.userId = userId;
    }
    
    // 标题搜索
    if (search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }
    
    // 日期范围筛选
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateTime;
      }
    }

    // 执行查询 - 改进安全性
    const [sessions, totalCount] = await Promise.all([
      Conversation.find(query)
        .populate({
          path: 'userId',
          select: 'name email profile.position',
          options: { strictPopulate: false } // 允許populate失敗而不拋出錯誤
        })
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('sessionId title status messageCount lastMessageAt createdAt duration metadata'),
      Conversation.countDocuments(query)
    ]);

    // 格式化响应数据 - 添加安全檢查
    const formattedSessions = sessions.map(session => {
      // 安全檢查：處理userId可能為null的情況
      const user = session.userId || {};
      
      return {
        sessionId: session.sessionId,
        userId: user._id || null,
        userName: user.name || '未知用户',
        userEmail: user.email || '',
        userPosition: user.profile?.position || '',
        title: session.title,
        messageCount: session.messageCount,
        status: session.status,
        duration: session.duration,
        categories: session.metadata?.categories || [],
        createdAt: session.createdAt,
        lastMessageAt: session.lastMessageAt
      };
    });

    // 计算统计数据
    const stats = await calculateSessionStats(query);

    res.json({
      success: true,
      data: {
        sessions: formattedSessions,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalSessions: totalCount,
          hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
          hasPrevPage: pageNum > 1
        },
        stats
      }
    });

    logger.info(`管理员获取会话成功`, { 
      adminId: req.admin._id, 
      sessionCount: sessions.length, 
      totalCount 
    });

  } catch (error) {
    // 改進錯誤處理和日誌記錄
    logger.error(`管理员获取会话失败 - 完整错误信息`, { 
      adminId: req.admin?._id || 'unknown', 
      query: req.query,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'ADMIN_CHAT_001',
        message: '获取会话列表失败',
        details: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
      }
    });
  }
};

/**
 * 获取聊天统计数据 (管理员权限)
 * GET /api/v1/chat/admin/stats
 */
export const getChatStats = async (req, res) => {
  try {
    const {
      startDate = '',
      endDate = '',
      groupBy = 'day' // day, week, month
    } = req.query;

    logger.info(`管理员获取聊天统计`, { 
      adminId: req.admin._id, 
      startDate, 
      endDate, 
      groupBy 
    });

    // 设置默认日期范围（最近30天）
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const queryStartDate = startDate ? new Date(startDate) : defaultStartDate;
    const queryEndDate = endDate ? new Date(endDate) : defaultEndDate;
    queryEndDate.setHours(23, 59, 59, 999);

    // 1. 总体概览统计
    const [
      totalSessions,
      totalMessages,
      totalUsers,
      avgSessionDuration,
      recentAIMessages
    ] = await Promise.all([
      Conversation.countDocuments({
        createdAt: { $gte: queryStartDate, $lte: queryEndDate }
      }),
      Message.countDocuments({
        createdAt: { $gte: queryStartDate, $lte: queryEndDate }
      }),
      Conversation.distinct('userId', {
        createdAt: { $gte: queryStartDate, $lte: queryEndDate }
      }).then(users => users.length),
      Conversation.aggregate([
        { $match: { createdAt: { $gte: queryStartDate, $lte: queryEndDate } } },
        { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
      ]),
      Message.find({
        role: 'ai',
        createdAt: { $gte: queryStartDate, $lte: queryEndDate }
      })
      .select('metadata.processingTime')
      .limit(1000)
    ]);

    // 计算平均响应时间
    const avgResponseTime = recentAIMessages.length > 0
      ? recentAIMessages.reduce((sum, msg) => sum + (msg.metadata?.processingTime || 0), 0) / recentAIMessages.length / 1000
      : 0;

    // 2. 每日统计数据
    const dailyStats = await getDailyStats(queryStartDate, queryEndDate, groupBy);

    // 3. 反馈统计
    const feedbackStats = await Message.aggregate([
      {
        $match: {
          role: 'ai',
          createdAt: { $gte: queryStartDate, $lte: queryEndDate },
          feedback: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$feedback',
          count: { $sum: 1 }
        }
      }
    ]);

    const helpfulCount = feedbackStats.find(f => f._id === 'helpful')?.count || 0;
    const notHelpfulCount = feedbackStats.find(f => f._id === 'not_helpful')?.count || 0;
    const totalFeedback = helpfulCount + notHelpfulCount;
    const satisfaction = totalFeedback > 0 ? (helpfulCount / totalFeedback * 100) : 0;

    // 4. 热门分类统计
    const topCategories = await Conversation.aggregate([
      {
        $match: {
          createdAt: { $gte: queryStartDate, $lte: queryEndDate },
          'metadata.categories': { $exists: true, $ne: [] }
        }
      },
      { $unwind: '$metadata.categories' },
      {
        $group: {
          _id: '$metadata.categories',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          category: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // 5. N8N服务状态
    const n8nStats = n8nService.getStats();

    res.json({
      success: true,
      data: {
        overview: {
          totalSessions,
          totalMessages,
          totalUsers,
          avgSessionDuration: Math.round(avgSessionDuration[0]?.avgDuration || 0),
          avgResponseTime: Math.round(avgResponseTime * 100) / 100
        },
        dailyStats,
        feedbackStats: {
          helpful: helpfulCount,
          not_helpful: notHelpfulCount,
          satisfaction: Math.round(satisfaction * 100) / 100
        },
        topCategories,
        n8nService: n8nStats,
        dateRange: {
          startDate: queryStartDate.toISOString(),
          endDate: queryEndDate.toISOString()
        }
      }
    });

    logger.info(`管理员获取统计成功`, { 
      adminId: req.admin._id,
      totalSessions,
      totalMessages 
    });

  } catch (error) {
    logger.error(`管理员获取统计失败: ${error.message}`, { 
      adminId: req.admin?._id, 
      error: error.stack 
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'ADMIN_CHAT_002',
        message: '获取统计数据失败',
        details: error.message
      }
    });
  }
};

/**
 * 导出聊天记录 (管理员权限)
 * POST /api/v1/chat/admin/export
 */
export const exportChatRecords = async (req, res) => {
  try {
    const {
      startDate = '',
      endDate = '',
      format = 'excel',
      includeUserInfo = true,
      sessionIds = []
    } = req.body;

    logger.info(`管理员导出聊天记录`, { 
      adminId: req.admin._id, 
      startDate, 
      endDate, 
      format, 
      sessionIds: sessionIds.length 
    });

    // 构建查询条件
    const query = {};
    
    if (sessionIds.length > 0) {
      query.sessionId = { $in: sessionIds };
    } else {
      // 如果没有指定会话ID，使用日期范围
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          const endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
          query.createdAt.$lte = endDateTime;
        }
      }
    }

    // 获取会话和消息数据
    const sessions = await Conversation.find(query)
      .populate('userId', 'name email profile.position profile.phone')
      .sort({ createdAt: -1 })
      .limit(1000); // 限制导出数量

    if (sessions.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ADMIN_CHAT_003',
          message: '没有找到符合条件的数据'
        }
      });
    }

    // 获取所有相关消息
    const sessionIdList = sessions.map(s => s.sessionId);
    const messages = await Message.find({ sessionId: { $in: sessionIdList } })
      .sort({ sessionId: 1, createdAt: 1 });

    // 组织导出数据
    const exportData = [];
    
    for (const session of sessions) {
      const sessionMessages = messages.filter(m => m.sessionId === session.sessionId);
      
      for (const message of sessionMessages) {
        const rowData = {
          '会话ID': session.sessionId,
          '会话标题': session.title,
          '消息ID': message.messageId,
          '消息角色': message.role === 'user' ? '用户' : 'AI',
          '消息内容': message.content,
          '消息时间': message.createdAt.toLocaleString('zh-CN'),
          '会话状态': session.status,
          '会话创建时间': session.createdAt.toLocaleString('zh-CN')
        };

        if (includeUserInfo && session.userId) {
          rowData['用户姓名'] = session.userId.name || '';
          rowData['用户邮箱'] = session.userId.email || '';
          rowData['用户职位'] = session.userId.profile?.position || '';
          rowData['用户电话'] = session.userId.profile?.phone || '';
        }

        if (message.role === 'ai') {
          rowData['AI处理时间(毫秒)'] = message.metadata?.processingTime || '';
          rowData['法条引用数量'] = message.metadata?.references?.length || 0;
          rowData['质量评分'] = message.metadata?.qualityScore || '';
          rowData['用户反馈'] = message.feedback || '';
        }

        exportData.push(rowData);
      }
    }

    // 生成文件
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // 设置列宽
    const columnWidths = [
      { wch: 20 }, // 会话ID
      { wch: 30 }, // 会话标题
      { wch: 20 }, // 消息ID
      { wch: 10 }, // 消息角色
      { wch: 50 }, // 消息内容
      { wch: 20 }, // 消息时间
      { wch: 10 }, // 会话状态
      { wch: 20 }  // 会话创建时间
    ];
    
    if (includeUserInfo) {
      columnWidths.push(
        { wch: 15 }, // 用户姓名
        { wch: 25 }, // 用户邮箱
        { wch: 15 }, // 用户职位
        { wch: 15 }  // 用户电话
      );
    }
    
    worksheet['!cols'] = columnWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, '聊天记录');

    // 生成文件名
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const fileName = `聊天记录导出_${timestamp}.xlsx`;

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);

    // 输出文件
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);

    logger.info(`导出聊天记录成功`, { 
      adminId: req.admin._id,
      fileName,
      recordCount: exportData.length,
      sessionCount: sessions.length 
    });

  } catch (error) {
    logger.error(`导出聊天记录失败: ${error.message}`, { 
      adminId: req.admin?._id, 
      error: error.stack 
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'ADMIN_CHAT_004',
        message: '导出聊天记录失败',
        details: error.message
      }
    });
  }
};

/**
 * 获取会话消息详情 (管理员权限)
 * GET /api/v1/chat/admin/sessions/:sessionId/messages
 */
export const getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;

    logger.info(`管理员获取会话消息`, { adminId: req.admin._id, sessionId });

    // 获取会话基本信息
    const session = await Conversation.findOne({ sessionId })
      .populate('userId', 'name email profile.position');

    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHAT_001',
          message: '会话不存在'
        }
      });
    }

    // 获取所有消息
    const messages = await Message.find({ sessionId })
      .sort({ createdAt: 1 })
      .select('messageId role content metadata status feedback createdAt editHistory');

    res.json({
      success: true,
      data: {
        session: {
          sessionId: session.sessionId,
          title: session.title,
          status: session.status,
          messageCount: session.messageCount,
          duration: session.duration,
          createdAt: session.createdAt,
          lastMessageAt: session.lastMessageAt,
          user: {
            id: session.userId._id,
            name: session.userId.name,
            email: session.userId.email,
            position: session.userId.profile?.position
          }
        },
        messages
      }
    });

    logger.info(`管理员获取会话消息成功`, { 
      adminId: req.admin._id, 
      sessionId, 
      messageCount: messages.length 
    });

  } catch (error) {
    logger.error(`管理员获取会话消息失败: ${error.message}`, { 
      adminId: req.admin?._id, 
      sessionId: req.params?.sessionId, 
      error: error.stack 
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'ADMIN_CHAT_005',
        message: '获取会话消息失败',
        details: error.message
      }
    });
  }
};

// ================== 辅助函数 ==================

/**
 * 计算会话统计数据
 */
async function calculateSessionStats(query) {
  const [statusStats, total] = await Promise.all([
    Conversation.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          avgMessages: { $avg: '$messageCount' }
        }
      }
    ]),
    Conversation.countDocuments(query)
  ]);

  const stats = {
    totalSessions: total,
    activeSessions: 0,
    completedSessions: 0,
    abandonedSessions: 0,
    avgMessagesPerSession: 0
  };

  statusStats.forEach(stat => {
    switch (stat._id) {
      case 'active':
        stats.activeSessions = stat.count;
        break;
      case 'completed':
        stats.completedSessions = stat.count;
        break;
      case 'abandoned':
        stats.abandonedSessions = stat.count;
        break;
    }
  });

  // 计算平均每个会话的消息数
  if (statusStats.length > 0) {
    const totalMessages = statusStats.reduce((sum, stat) => sum + (stat.avgMessages * stat.count), 0);
    stats.avgMessagesPerSession = Math.round((totalMessages / total) * 100) / 100;
  }

  return stats;
}

/**
 * 获取每日统计数据
 */
async function getDailyStats(startDate, endDate, groupBy) {
  let groupFormat;
  
  switch (groupBy) {
    case 'week':
      groupFormat = {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
      break;
    case 'month':
      groupFormat = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      break;
    default: // day
      groupFormat = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
  }

  const dailySessionStats = await Conversation.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: groupFormat,
        sessions: { $sum: 1 },
        avgDuration: { $avg: '$duration' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  const dailyMessageStats = await Message.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        role: 'ai'
      }
    },
    {
      $group: {
        _id: groupFormat,
        messages: { $sum: 1 },
        avgResponseTime: { $avg: '$metadata.processingTime' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // 合并结果
  const dailyStats = [];
  const messageStatsMap = new Map();
  
  dailyMessageStats.forEach(stat => {
    const key = JSON.stringify(stat._id);
    messageStatsMap.set(key, stat);
  });

  dailySessionStats.forEach(sessionStat => {
    const key = JSON.stringify(sessionStat._id);
    const messageStat = messageStatsMap.get(key) || { messages: 0, avgResponseTime: 0 };
    
    let dateStr;
    if (groupBy === 'week') {
      dateStr = `${sessionStat._id.year}-W${sessionStat._id.week}`;
    } else if (groupBy === 'month') {
      dateStr = `${sessionStat._id.year}-${String(sessionStat._id.month).padStart(2, '0')}`;
    } else {
      dateStr = `${sessionStat._id.year}-${String(sessionStat._id.month).padStart(2, '0')}-${String(sessionStat._id.day).padStart(2, '0')}`;
    }
    
    dailyStats.push({
      date: dateStr,
      sessions: sessionStat.sessions,
      messages: messageStat.messages,
      avgResponseTime: Math.round((messageStat.avgResponseTime || 0) / 1000 * 100) / 100 // 转换为秒
    });
  });

  return dailyStats;
} 
