import express from 'express';
import adminAuthRoutes from './auth.routes.js';
import adminUserRoutes from './user.routes.js';
import adminManagerRoutes from './admin-manager.routes.js';
import adminChatRoutes from './chat.admin.routes.js'; // 聊天管理路由
import adminEmailRoutes from './email.admin.routes.js'; // 郵件管理路由
import systemSettingsRoutes from './system-settings.routes.js'; // 系统设置管理路由
import laborAdvisorRoutes from '../labor-advisor.routes.js'; // 劳资顾问管理路由
// import consultationRoutes from './consultation.routes.js'; // 示例
// import expertRoutes from './expert.routes.js'; // 示例
// import statisticsRoutes from './statistics.routes.js'; // 示例

const router = express.Router();

/**
 * 管理后台API路由 (/api/v1/admin)
 */

// 认证路由 (/api/v1/admin/auth)
router.use('/auth', adminAuthRoutes);

// 用户管理路由 (/api/v1/admin/users)
// 注意: backend_tasks_auth_user_management.md 中用户管理路由前缀是 /api/v1/admin/users
// 所以这里 user.routes.js 应该只包含 users 路径下的具体端点 (如 GET /, POST /, GET /:userId 等)
router.use('/users', adminUserRoutes);

// 管理員管理路由 (/api/v1/admin/managers)
router.use('/managers', adminManagerRoutes);

// 聊天管理路由 (/api/v1/admin/chat)
router.use('/chat', adminChatRoutes);

// 郵件管理路由 (/api/v1/admin/emails)
router.use('/emails', adminEmailRoutes);

// 劳资顾问管理路由 (/api/v1/admin/labor-advisors)
router.use('/labor-advisors', laborAdvisorRoutes);

// 系统设置管理路由 (/api/v1/admin/system-settings)
router.use('/system-settings', systemSettingsRoutes);

// 后续将添加更多路由:
// router.use('/consultations', consultationRoutes);
// router.use('/experts', expertRoutes);
// router.use('/statistics', statisticsRoutes);

export default router;
