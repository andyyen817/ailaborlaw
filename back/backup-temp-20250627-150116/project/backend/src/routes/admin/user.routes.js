import express from 'express';
import {
    getUsers,
    createUserByAdmin,
    getUserDetail,
    updateUserInfoByAdmin,
    updateUserStatus,
    deleteUserByAdmin,
    exportUsers
} from '../../controllers/admin/user.controller.js';
import { protect, isAdmin } from '../../middlewares/auth.middleware.js';
import { increaseQueries } from '../../controllers/user.controller.js';
import { protectAdmin } from '../../middlewares/admin-auth.middleware.js';

const router = express.Router();

/**
 * API Routes for User Management by Admin.
 * All routes are now protected with protectAdmin middleware to support Admin model authentication.
 * This fixes the multi-model authentication issue where Admin model users couldn't access these routes.
 * Base path: /api/v1/admin/users (defined in admin/index.js and main index.js)
 */

// GET /api/v1/admin/users - Get user list (with filtering and pagination)
router.get('/', protectAdmin, getUsers);

// POST /api/v1/admin/users - Create a new user (admin operation)
router.post('/', protectAdmin, createUserByAdmin);

/**
 * GET /api/v1/admin/users/export
 * 匯出用戶數據為CSV格式
 */
router.get('/export', protectAdmin, exportUsers);

// GET /api/v1/admin/users/:userId - Get specific user details
router.get('/:userId', protectAdmin, getUserDetail);

// PUT /api/v1/admin/users/:userId - Update user information (admin operation)
router.put('/:userId', protectAdmin, updateUserInfoByAdmin);

// PATCH /api/v1/admin/users/:userId/status - Toggle user status (admin operation)
router.patch('/:userId/status', protectAdmin, updateUserStatus);

// DELETE /api/v1/admin/users/:userId - Delete a user (admin operation)
router.delete('/:userId', protectAdmin, deleteUserByAdmin);

/**
 * POST /api/v1/admin/users/:userId/queries/increase 
 * 增加指定用戶的諮詢次數
 * 注意：此路由使用protectAdmin中間件，支持Admin模型的令牌訪問
 */
router.post('/:userId/queries/increase', protectAdmin, increaseQueries);

export default router;
