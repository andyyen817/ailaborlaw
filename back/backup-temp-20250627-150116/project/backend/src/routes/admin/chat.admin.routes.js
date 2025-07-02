import express from 'express';
import { protectAdmin } from '../../middlewares/admin-auth.middleware.js';
import {
  getAllSessions,
  getChatStats,
  exportChatRecords,
  getSessionMessages
} from '../../controllers/admin/chat.admin.controller.js';

const router = express.Router();

/**
 * 管理后台聊天路由
 * 基础路径: /api/v1/admin/chat
 * 所有接口都需要管理员权限
 */

// 应用全局中间件：管理员认证
router.use(protectAdmin);

/**
 * @route GET /api/v1/chat/admin/sessions
 * @desc 获取所有用户会话列表
 * @access Admin
 * @query page: 页码, limit: 每页数量, status: 会话状态, userId: 用户ID, search: 搜索关键词, startDate: 开始日期, endDate: 结束日期
 */
router.get('/sessions', getAllSessions);

/**
 * @route GET /api/v1/chat/admin/sessions/:sessionId/messages
 * @desc 获取指定会话的消息详情
 * @access Admin
 */
router.get('/sessions/:sessionId/messages', getSessionMessages);

/**
 * @route GET /api/v1/chat/admin/stats
 * @desc 获取聊天统计数据
 * @access Admin
 * @query startDate: 开始日期, endDate: 结束日期, groupBy: 统计分组方式(day/week/month)
 */
router.get('/stats', getChatStats);

/**
 * @route POST /api/v1/chat/admin/export
 * @desc 导出聊天记录
 * @access Admin
 */
router.post('/export', exportChatRecords);

export default router; 