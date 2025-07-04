const express = require('express');
const authRoutes = require('./auth.routes.js');
const userRoutes = require('./user.routes.js');
const queryRoutes = require('./query.routes.js');
// const inviteRoutes = require('./invite.routes.js'); // 暫時註釋，有編碼問題
// const laborAdvisorRoutes = require('./labor-advisor.routes.js'); // 暫時註釋，控制器有ES模塊問題
// const expertConsultationRoutes = require('./expert-consultation.routes.js'); // 暫時註釋，控制器有ES模塊問題
const chatRoutes = require('./chat.routes.js');
// const testRoutes = require('./test.routes.js'); // 暫時註釋，有ES import問題
// const adminRoutes = require('./admin/index.js'); // 暫時註釋，使用ES模塊語法

const logger = require('../utils/logger.js');

/**
 * 主API路由配置
 * 集中管理所有API端點
 */

const mainRouter = express.Router();

// 路由中間件 - 記錄所有API請求
mainRouter.use((req, res, next) => {
  logger.info(`API請求: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// 健康檢查端點
mainRouter.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0',
    service: 'ai-labor-advisor-api'
  });
});

// API信息端點
mainRouter.get('/info', (req, res) => {
  res.json({
    success: true,
    name: 'AI勞基法顧問API',
    version: '1.0.0',
    description: '台灣勞動法規AI咨詢平台後端服務',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      queries: '/api/v1/queries',
      invites: '/api/v1/invites',
      laborAdvisors: '/api/v1/labor-advisors',
      expertConsultations: '/api/v1/expert-consultations',
      chat: '/api/v1/chat',
      admin: '/api/v1/admin',
      test: '/api/v1/test'
    },
    documentation: '/api/v1/docs',
    healthCheck: '/api/v1/health'
  });
});

// 掛載各模組路由
try {
  // 認證相關路由
  mainRouter.use('/auth', authRoutes);
  logger.info('✅ 認證路由已載入');

  // 用戶相關路由
  mainRouter.use('/users', userRoutes);
  logger.info('✅ 用戶路由已載入');

  // 查詢相關路由
  mainRouter.use('/queries', queryRoutes);
  logger.info('✅ 查詢路由已載入');

  // 邀請相關路由
  // mainRouter.use('/invites', inviteRoutes);
  // logger.info('✅ 邀請路由已載入');

  // 勞基法顧問相關路由 (暫時註釋，控制器有ES模塊問題)
  // mainRouter.use('/labor-advisors', laborAdvisorRoutes);
  // logger.info('✅ 勞基法顧問路由已載入');

  // 專家諮詢相關路由
  // mainRouter.use('/expert-consultations', expertConsultationRoutes);
  // logger.info('✅ 專家諮詢路由已載入');

  // 聊天相關路由
  mainRouter.use('/chat', chatRoutes);
  logger.info('✅ 聊天路由已載入');

  // 測試相關路由
  // mainRouter.use('/test', testRoutes);
  // logger.info('✅ 測試路由已載入');

  // 管理員相關路由 (暫時註釋，使用ES模塊語法)
  // mainRouter.use('/admin', adminRoutes);
  // logger.info('✅ 管理員路由已載入');

} catch (error) {
  logger.error('❌ 路由載入失敗:', error);
  throw error;
}

// 未匹配路由處理
mainRouter.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API端點不存在: ${req.method} ${req.originalUrl}`,
    error: {
      code: 'API_ENDPOINT_NOT_FOUND',
      details: `The requested API endpoint ${req.originalUrl} does not exist.`,
      availableEndpoints: '/api/v1/info'
    }
  });
});

logger.info('🚀 主API路由配置完成');

module.exports = mainRouter;
