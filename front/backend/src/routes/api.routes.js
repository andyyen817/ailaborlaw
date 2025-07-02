const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const chatRoutes = require('./chat.routes');
const expertConsultationRoutes = require('./expert-consultation.routes');
const laborAdvisorRoutes = require('./labor-advisor.routes');

const router = express.Router();

// 認證相關路由
router.use('/auth', authRoutes);

// 用戶相關路由
router.use('/users', userRoutes);

// 聊天相關路由
router.use('/chat', chatRoutes);

// 專家諮詢相關路由
router.use('/expert-consultations', expertConsultationRoutes);

// 勞資顧問管理相關路由
router.use('/labor-advisors', laborAdvisorRoutes);

module.exports = router; 