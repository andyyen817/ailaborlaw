const express = require('express');
// 假设 adminAuthController 和 authMiddleware 都已或将被转换为 ES 模块
import * as adminAuthController from '../../controllers/admin/auth.controller.js'; 
// 从 auth.middleware.js 中我们导出了 protect 和 isAdmin
// 但这里的 isAdmin 是旧的，依赖于 Admin 模型。
// 我们新的 isAdmin 依赖于 req.user (来自 User 模型和 protect 中间件)。
// 旧的 adminAuthController.getCurrentAdmin 期望 req.admin
// 这个 admin 认证部分与我们基于 User 模型和 userType='admin' 的新认证系统不完全兼容。
// 为了使项目能运行，我暂时保留对旧 adminAuthController 的引用，
// 但这部分后续可能需要重构以统一认证逻辑。
// 理想情况下，管理员登录也应该走通用登录接口，然后通过 userType='admin' 来区分。
// 但如果存在一个完全独立的 "Admin" 用户表和逻辑，则另当别论。
// 假设目前我们只是让它能以 ES 模块方式导入。
import { isAdmin as isAdminCheckFromUser } from '../../middlewares/auth.middleware.js'; // 这是我们新的基于 User 的 isAdmin
import { protectAdmin, isSuperAdmin } from '../../middlewares/admin-auth.middleware.js';

const router = express.Router();

/**
 * 管理員認證路由 (基於獨立的Admin模型)
 */

// 管理員登入
router.post('/login', adminAuthController.login);

// 刷新訪問令牌 - 註釋掉這一行，因為 adminAuthController.refreshToken 不存在
// router.post('/refresh-token', adminAuthController.refreshToken);

// 獲取當前管理員信息
router.get('/me', protectAdmin, adminAuthController.getCurrentAdmin);

// 創建初始超級管理員帳戶（僅用於系統初始化）
router.post('/init', adminAuthController.createInitialAdmin);

// 公開API：創建初始超級管理員賬戶（僅在系統中沒有任何管理員時可用）
router.post('/setup-initial-admin', adminAuthController.setupInitialAdmin);

// 緊急更新管理員為超級管理員 (開發階段使用，之後應移除)
router.post('/emergency-super-admin/:email', adminAuthController.emergencySuperAdmin);

module.exports = router;
