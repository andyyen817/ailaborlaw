import express from 'express';
import authRoutes from './auth.routes.js'; // 我们新创建的认证路由
import userRoutes from './user.routes.js'; // 导入用户路由
import adminRoutes from './admin/index.js'; // 假设 admin 路由的入口是 admin/index.js
import testRoutes from './test.routes.js'; // 导入测试路由
import chatRoutes from './chat.routes.js'; // 聊天模块路由
import expertConsultationRoutes from './expert-consultation.routes.js'; // 专家咨询路由
import laborAdvisorRoutes from './labor-advisor.routes.js'; // 劳资顾问管理路由
import inviteRoutes from './invite.routes.js'; // 邀请管理路由
import queryRoutes from './query.routes.js'; // 咨询次数管理路由

const mainRouter = express.Router(); // 主 /api 路由器
const v1Router = express.Router(); // /api/v1 子路由器

/**
 * API路由主文件
 * 集中管理所有路由
 */

// === V1 Routes ===
// 认证路由 (User registration and login)
v1Router.use('/auth', authRoutes);

// 用户路由 (User profile, settings, etc.)
v1Router.use('/users', userRoutes);

// 聊天模块路由 (Chat sessions and messages)
v1Router.use('/chat', chatRoutes);

// 专家咨询路由 (Expert consultation requests)
v1Router.use('/expert-consultations', expertConsultationRoutes);

// 劳资顾问管理路由 (Labor advisor management)
v1Router.use('/labor-advisors', laborAdvisorRoutes);

// 邀请管理路由 (Invite management)
v1Router.use('/invites', inviteRoutes);

// 咨询次数管理路由 (Query count management)
v1Router.use('/queries', queryRoutes);

// 測試路由 (测试认证和权限中间件)
v1Router.use('/test', testRoutes);

// 后台用户管理路由 (Admin User Management - 将在后续模块实现)
// import adminUserRoutes from './admin/user.routes.js'; // 示例，后续添加
// v1Router.use('/admin/users', adminUserRoutes);


// === Legacy or Non-Versioned Routes (if any) ===
// 原有的管理后台路由 (如果仍然需要，并且其 API 路径不是 /api/v1/admin)
// 如果 admin 路由也应该是 /api/v1/admin，则应该挂载到 v1Router 上
// mainRouter.use('/admin', adminRoutes); 
// 假设现有的 /admin 路由是指向 /api/admin (非 /api/v1/admin)
// 如果所有 admin 路由都应在 /api/v1/admin 下，那么下面的 adminRoutes 也应该移到 v1Router
// 比如: v1Router.use('/admin', adminRoutes); // 这样 admin 路由就是 /api/v1/admin/...
// 根据 backend_tasks_auth_user_management.md, Admin User Management 路由前缀是 /api/v1/admin/users
// 这意味着 admin 相关的路由也应该在 v1Router 下。
// 为了清晰，我将假设原有的 /admin 路由也应版本化到 /v1/admin
v1Router.use('/admin', adminRoutes); // 这会使路径变为 /api/v1/admin/...


// 将 v1 版本的路由挂载到主 API 路由器
mainRouter.use('/v1', v1Router);


// API路由健康检查 (可以放在 /api/health 或 /api/v1/health)
mainRouter.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API 服务正常运行',
    timestamp: new Date().toISOString(),
    version: 'v1' // 可以指明当前主要服务的API版本
  });
});

// 測試路由配置
mainRouter.get('/test-routes', (req, res) => {
  res.status(200).json({
    success: true,
    message: '路由配置測試',
    routes: {
      health: '/api/health',
      v1_auth: '/api/v1/auth/*',
      v1_users: '/api/v1/users/*',
      v1_chat: '/api/v1/chat/*'
    },
    timestamp: new Date().toISOString()
  });
});

// 直接測試auth端點（繞過復雜中間件）
mainRouter.post('/test-auth', (req, res) => {
  res.status(200).json({
    success: true,
    message: '直接auth路由測試成功',
    receivedData: {
      body: req.body,
      method: req.method,
      path: req.path
    },
    timestamp: new Date().toISOString()
  });
});

export default mainRouter;
