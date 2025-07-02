import express from 'express';
import { protectAdmin, isSuperAdmin } from '../../middlewares/admin-auth.middleware.js';
import { 
  createAdmin, 
  getAdmins, 
  updateAdminStatus, 
  resetAdminPassword 
} from '../../controllers/admin/admin-manager.controller.js';

const router = express.Router();

/**
 * 管理員賬戶管理路由
 * 基礎路徑: /api/v1/admin/managers
 * 所有路由都需要管理員認證，部分功能僅超級管理員可用
 */

// 所有路由都需要管理員認證
router.use(protectAdmin);

// 獲取管理員列表 (僅超級管理員可用)
router.get('/', isSuperAdmin, getAdmins);

// 創建新管理員 (僅超級管理員可用)
router.post('/', isSuperAdmin, createAdmin);

// 更新管理員狀態 (僅超級管理員可用)
router.patch('/:id/status', isSuperAdmin, updateAdminStatus);

// 重置管理員密碼 (僅超級管理員可用)
router.post('/:id/reset-password', isSuperAdmin, resetAdminPassword);

export default router; 