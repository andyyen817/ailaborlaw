import express from 'express';
import { protect, hasRemainingQueries } from '../middlewares/auth.middleware.js';
import {
  createSession,
  getUserSessions,
  getSessionDetail,
  updateSessionTitle,
  deleteSession,
  sendMessage,
  getMessages
} from '../controllers/chat.controller.js';

const router = express.Router();

/**
 * 聊天会话路由
 * 基础路径: /api/v1/chat
 * 完全符合前端API需求格式
 * 集成现有认证和次数管理系统
 */

// ================== 会话管理 API ==================

/**
 * @route POST /api/v1/chat/sessions
 * @desc 创建新聊天会话
 * @access Private (需要登录)
 * @note 创建会话不需要检查次数，只有发送消息时才检查
 */
router.post('/sessions', protect, createSession);

/**
 * @route GET /api/v1/chat/sessions
 * @desc 获取用户会话列表
 * @access Private
 * @query page: 页码(默认1), limit: 每页数量(默认20), search: 搜索关键词
 */
router.get('/sessions', protect, getUserSessions);

/**
 * @route GET /api/v1/chat/sessions/:sessionId
 * @desc 获取特定会话详情和消息
 * @access Private (仅限会话所有者)
 */
router.get('/sessions/:sessionId', protect, getSessionDetail);

/**
 * @route PUT /api/v1/chat/sessions/:sessionId
 * @desc 更新会话标题
 * @access Private (仅限会话所有者)
 */
router.put('/sessions/:sessionId', protect, updateSessionTitle);

/**
 * @route DELETE /api/v1/chat/sessions/:sessionId
 * @desc 删除会话及其所有消息
 * @access Private (仅限会话所有者)
 */
router.delete('/sessions/:sessionId', protect, deleteSession);

// ================== 消息管理 API ==================

/**
 * @route POST /api/v1/chat/sessions/:sessionId/messages
 * @desc 发送用户消息并获取AI回复
 * @access Private (需要登录 + 剩余次数检查)
 * @note 这是核心API，会扣减咨询次数并调用N8N服务
 */
router.post('/sessions/:sessionId/messages', protect, hasRemainingQueries, sendMessage);

/**
 * @route GET /api/v1/chat/sessions/:sessionId/messages
 * @desc 获取会话消息列表
 * @access Private (仅限会话所有者)
 * @query page: 页码, limit: 每页数量, before: 时间戳之前的消息
 */
router.get('/sessions/:sessionId/messages', protect, getMessages);

// ================== 消息反馈 API ==================

/**
 * @route POST /api/v1/chat/sessions/:sessionId/messages/:messageId/feedback
 * @desc 为AI回复提供反馈
 * @access Private (仅限会话所有者)
 */
router.post('/sessions/:sessionId/messages/:messageId/feedback', protect, async (req, res) => {
  try {
    const { sessionId, messageId } = req.params;
    const { feedback } = req.body;
    const userId = req.user.id;
    
    // 引入需要的模型
    const { default: Message } = await import('../models/message.model.js');
    const { default: Conversation } = await import('../models/conversation.model.js');
    
    // 验证会话权限
    const conversation = await Conversation.findOne({ sessionId, userId });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { code: 'CHAT_001', message: '会话不存在' }
      });
    }
    
    // 查找并更新消息反馈
    const message = await Message.findOne({ messageId, sessionId, role: 'ai' });
    if (!message) {
      return res.status(404).json({
        success: false,
        error: { code: 'CHAT_005', message: '消息不存在或无法反馈' }
      });
    }
    
    await message.setFeedback(feedback);
    
    res.json({
      success: true,
      message: '反馈提交成功',
      data: {
        message: {
          messageId: message.messageId,
          feedback: message.feedback
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'CHAT_006', message: '提交反馈失败', details: error.message }
    });
  }
});

export default router; 