import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import n8nService from '../services/n8n.service.js';
import logger from '../utils/logger.js';

/**
 * 聊天控制器
 * 实现完整的聊天会话和消息管理功能
 * 集成N8N AI服务和现有认证系统
 */

// ================== 会话管理功能 ==================

/**
 * 创建新聊天会话
 * POST /api/v1/chat/sessions
 */
export const createSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    logger.info(`用户创建新会话`, { userId, title });

    // 创建新会话
    const conversation = new Conversation({
      userId,
      title: title || '新的劳法咨询'
    });

    await conversation.save();

    // 返回成功响应
    res.status(201).json({
      success: true,
      message: '会话创建成功',
      data: {
        sessionId: conversation.sessionId,
        title: conversation.title,
        status: conversation.status,
        messageCount: conversation.messageCount,
        createdAt: conversation.createdAt,
        lastMessageAt: conversation.lastMessageAt
      }
    });

    logger.info(`会话创建成功`, { 
      userId, 
      sessionId: conversation.sessionId,
      title: conversation.title 
    });

  } catch (error) {
    logger.error(`创建会话失败: ${error.message}`, { 
      userId: req.user?.id, 
      error: error.stack 
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_007',
        message: '创建会话失败',
        details: error.message
      }
    });
  }
};

/**
 * 获取用户会话列表
 * GET /api/v1/chat/sessions
 */
export const getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      search = ''
    } = req.query;

    // 参数验证
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    logger.info(`获取用户会话列表`, { userId, page: pageNum, limit: limitNum, search });

    // 构建查询条件
    const query = { userId };
    if (search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    // 执行查询
    const [sessions, totalCount] = await Promise.all([
      Conversation.find(query)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('sessionId title status messageCount lastMessageAt createdAt duration'),
      Conversation.countDocuments(query)
    ]);

    // 计算分页信息
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalSessions: totalCount,
          hasNextPage,
          hasPrevPage
        }
      }
    });

    logger.info(`获取会话列表成功`, { 
      userId, 
      sessionCount: sessions.length, 
      totalCount 
    });

  } catch (error) {
    logger.error(`获取会话列表失败: ${error.message}`, { 
      userId: req.user?.id, 
      error: error.stack 
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_008',
        message: '获取会话列表失败',
        details: error.message
      }
    });
  }
};

/**
 * 获取会话详情和消息
 * GET /api/v1/chat/sessions/:sessionId
 */
export const getSessionDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    logger.info(`获取会话详情`, { userId, sessionId });

    // 验证会话权限
    const conversation = await Conversation.findOne({ sessionId, userId });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHAT_001',
          message: '会话不存在'
        }
      });
    }

    // 获取会话消息
    const messages = await Message.getSessionMessages(sessionId, { limit: 100 });

    res.json({
      success: true,
      data: {
        session: {
          sessionId: conversation.sessionId,
          title: conversation.title,
          status: conversation.status,
          messageCount: conversation.messageCount,
          createdAt: conversation.createdAt,
          lastMessageAt: conversation.lastMessageAt,
          duration: conversation.duration
        },
        messages
      }
    });

    logger.info(`获取会话详情成功`, { 
      userId, 
      sessionId, 
      messageCount: messages.length 
    });

  } catch (error) {
    logger.error(`获取会话详情失败: ${error.message}`, { 
      userId: req.user?.id, 
      sessionId: req.params?.sessionId, 
      error: error.stack 
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_009',
        message: '获取会话详情失败',
        details: error.message
      }
    });
  }
};

/**
 * 更新会话标题
 * PUT /api/v1/chat/sessions/:sessionId
 */
export const updateSessionTitle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const { title } = req.body;

    // 参数验证
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CHAT_010',
          message: '会话标题不能为空'
        }
      });
    }

    logger.info(`更新会话标题`, { userId, sessionId, newTitle: title });

    // 验证会话权限并更新
    const conversation = await Conversation.findOne({ sessionId, userId });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHAT_001',
          message: '会话不存在'
        }
      });
    }

    await conversation.updateTitle(title.trim());

    res.json({
      success: true,
      message: '会话标题更新成功',
      data: {
        sessionId: conversation.sessionId,
        title: conversation.title
      }
    });

    logger.info(`会话标题更新成功`, { userId, sessionId, title: conversation.title });

  } catch (error) {
    logger.error(`更新会话标题失败: ${error.message}`, { 
      userId: req.user?.id, 
      sessionId: req.params?.sessionId, 
      error: error.stack 
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_011',
        message: '更新会话标题失败',
        details: error.message
      }
    });
  }
};

/**
 * 删除会话及其所有消息
 * DELETE /api/v1/chat/sessions/:sessionId
 */
export const deleteSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    logger.info(`删除会话`, { userId, sessionId });

    // 验证会话权限
    const conversation = await Conversation.findOne({ sessionId, userId });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHAT_001',
          message: '会话不存在'
        }
      });
    }

    // 删除相关消息
    const deletedMessagesResult = await Message.deleteMany({ sessionId });
    const deletedMessageCount = deletedMessagesResult.deletedCount || 0;

    // 删除会话
    await Conversation.deleteOne({ sessionId, userId });

    res.json({
      success: true,
      message: '会话已删除',
      data: {
        deletedSessionId: sessionId,
        deletedMessages: deletedMessageCount
      }
    });

    logger.info(`会话删除成功`, { 
      userId, 
      sessionId, 
      deletedMessages: deletedMessageCount 
    });

  } catch (error) {
    logger.error(`删除会话失败: ${error.message}`, { 
      userId: req.user?.id, 
      sessionId: req.params?.sessionId, 
      error: error.stack 
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_012',
        message: '删除会话失败',
        details: error.message
      }
    });
  }
};

// ================== 消息管理功能 ==================

/**
 * 发送用户消息并获取AI回复 - 核心功能
 * POST /api/v1/chat/sessions/:sessionId/messages
 */
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const { content, messageType = 'question' } = req.body;

    // 参数验证
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CHAT_003',
          message: '消息内容不能为空'
        }
      });
    }

    if (content.length > 5000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CHAT_003',
          message: '消息内容过长，最多5000字符'
        }
      });
    }

    logger.info(`发送消息`, { 
      userId, 
      sessionId, 
      contentLength: content.length, 
      messageType 
    });

    // 验证会话权限
    const conversation = await Conversation.findOne({ sessionId, userId });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHAT_001',
          message: '会话不存在'
        }
      });
    }

    // 获取最近消息作为上下文
    const recentMessages = await Message.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('role content createdAt');

    // 创建用户消息
    const userMessage = new Message({
      sessionId,
      userId,
      role: 'user',
      content: content.trim(),
      metadata: {
        messageType
      }
    });

    await userMessage.save();

    // 设置第一个问题（用于自动生成标题）
    if (conversation.messageCount === 0) {
      await conversation.setFirstQuestion(content.trim());
    }

    // 更新会话消息统计
    await conversation.incrementMessageCount('user');

    // 调用AI服务获取回复
    let aiResponse;
    let aiMessage;

    try {
      const aiContext = {
        sessionId,
        userId,
        recentMessages: recentMessages.reverse() // 按时间正序
      };

      aiResponse = await n8nService.sendToAI(content.trim(), aiContext);

      // 创建AI回复消息
      aiMessage = new Message({
        sessionId,
        userId,
        role: 'ai',
        content: aiResponse.content,
        metadata: {
          processingTime: aiResponse.processingTime,
          n8nResponse: aiResponse.rawResponse,
          references: aiResponse.references,
          qualityScore: aiResponse.qualityScore
        }
      });

      await aiMessage.save();

      // 更新会话统计
      await conversation.incrementMessageCount('ai');

      logger.info(`AI回复成功`, { 
        userId, 
        sessionId, 
        processingTime: aiResponse.processingTime,
        referencesCount: aiResponse.references.length 
      });

    } catch (aiError) {
      logger.error(`AI服务调用失败: ${aiError.message}`, { 
        userId, 
        sessionId, 
        error: aiError.stack 
      });

      // AI服务失败时返回错误，但用户消息已保存
      return res.status(500).json({
        success: false,
        error: {
          code: 'CHAT_004',
          message: 'AI服务暂时不可用，请稍后再试',
          details: aiError.message
        },
        data: {
          userMessage: {
            messageId: userMessage.messageId,
            role: userMessage.role,
            content: userMessage.content,
            status: userMessage.status,
            createdAt: userMessage.createdAt
          }
        }
      });
    }

    // 扣减用户咨询次数（在成功获取AI回复后）
    try {
      const user = await User.findById(userId);
      if (user && user.profile.remainingQueries > 0) {
        user.profile.remainingQueries -= 1;
        await user.save();
        logger.info(`咨询次数扣减成功`, { 
          userId, 
          remainingQueries: user.profile.remainingQueries 
        });
      }
    } catch (quotaError) {
      logger.error(`扣减咨询次数失败: ${quotaError.message}`, { 
        userId, 
        error: quotaError.stack 
      });
      // 次数扣减失败不影响聊天功能，只记录日志
    }

    // 获取用户剩余次数
    const updatedUser = await User.findById(userId).select('profile.remainingQueries');
    const remainingQueries = updatedUser?.profile?.remainingQueries || 0;

    // 返回成功响应
    res.json({
      success: true,
      message: '消息发送成功',
      data: {
        userMessage: {
          messageId: userMessage.messageId,
          role: userMessage.role,
          content: userMessage.content,
          status: userMessage.status,
          createdAt: userMessage.createdAt
        },
        aiResponse: {
          messageId: aiMessage.messageId,
          role: aiMessage.role,
          content: aiMessage.content,
          status: aiMessage.status,
          processingTime: aiMessage.metadata.processingTime,
          references: aiMessage.metadata.references,
          createdAt: aiMessage.createdAt
        },
        remainingQueries,
        sessionUpdated: {
          messageCount: conversation.messageCount + 2,
          lastMessageAt: aiMessage.createdAt
        }
      }
    });

    logger.info(`消息发送完成`, { 
      userId, 
      sessionId, 
      userMessageId: userMessage.messageId,
      aiMessageId: aiMessage.messageId,
      remainingQueries 
    });

  } catch (error) {
    logger.error(`发送消息失败: ${error.message}`, { 
      userId: req.user?.id, 
      sessionId: req.params?.sessionId, 
      error: error.stack 
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_013',
        message: '发送消息失败',
        details: error.message
      }
    });
  }
};

/**
 * 获取会话消息列表
 * GET /api/v1/chat/sessions/:sessionId/messages
 */
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const {
      page = 1,
      limit = 50,
      before = null
    } = req.query;

    logger.info(`获取消息列表`, { userId, sessionId, page, limit, before });

    // 验证会话权限
    const conversation = await Conversation.findOne({ sessionId, userId });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHAT_001',
          message: '会话不存在'
        }
      });
    }

    // 获取消息
    const messages = await Message.getSessionMessages(sessionId, {
      page: parseInt(page),
      limit: Math.min(100, parseInt(limit)),
      beforeTimestamp: before
    });

    // 计算是否还有更多消息
    const totalMessages = await Message.countDocuments({ sessionId });
    const currentTotal = messages.length;
    const hasMore = (parseInt(page) * parseInt(limit)) < totalMessages;

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalMessages,
          hasMore
        }
      }
    });

    logger.info(`获取消息列表成功`, { 
      userId, 
      sessionId, 
      messageCount: messages.length 
    });

  } catch (error) {
    logger.error(`获取消息列表失败: ${error.message}`, { 
      userId: req.user?.id, 
      sessionId: req.params?.sessionId, 
      error: error.stack 
    });

    res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_014',
        message: '获取消息列表失败',
        details: error.message
      }
    });
  }
}; 