const express = require('express');
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// 获取会话列表
router.get('/sessions', authenticate, chatController.getSessionList);

// 创建新会话
router.post('/sessions', authenticate, chatController.createSession);

// 获取会话详情
router.get('/sessions/:sessionId', authenticate, chatController.getSessionDetails);

// 更新会话标题
router.put('/sessions/:sessionId', authenticate, chatController.updateSessionTitle);

// 删除会话
router.delete('/sessions/:sessionId', authenticate, chatController.deleteSession);

// 发送消息
router.post('/sessions/:sessionId/messages', authenticate, chatController.sendMessage);

// 提交消息反馈
router.post('/sessions/:sessionId/messages/:messageId/feedback', authenticate, chatController.submitMessageFeedback);

module.exports = router; 