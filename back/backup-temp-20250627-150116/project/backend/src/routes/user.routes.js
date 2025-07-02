import express from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { 
  getCurrentUser, 
  updateCurrentUser, 
  updatePassword, 
  deleteCurrentUser,
  getRemainingQueries,
  decreaseQuery
} from '../controllers/user.controller.js';

const router = express.Router();

/**
 * 用戶個人資料路由
 * 基礎路徑: /api/v1/users
 * 所有路由都需要認證
 */

// 使用 authenticateToken 中間件保護所有路由
router.use(authenticateToken);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: 獲取當前用戶資料
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取用戶資料
 *       401:
 *         description: 未認證
 *       404:
 *         description: 用戶不存在
 */
router.get('/me', getCurrentUser);

/**
 * @swagger
 * /api/v1/users/me:
 *   put:
 *     summary: 更新當前用戶資料
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               profile:
 *                 type: object
 *     responses:
 *       200:
 *         description: 用戶資料已更新
 *       401:
 *         description: 未認證
 *       404:
 *         description: 用戶不存在
 *       409:
 *         description: 郵箱已被使用
 */
router.put('/me', updateCurrentUser);

/**
 * @swagger
 * /api/v1/users/me/password:
 *   put:
 *     summary: 更新當前用戶密碼
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: 密碼已更新成功
 *       401:
 *         description: 當前密碼不正確
 *       404:
 *         description: 用戶不存在
 */
router.put('/me/password', updatePassword);

/**
 * @swagger
 * /api/v1/users/me:
 *   delete:
 *     summary: 刪除當前用戶（自行註銷）
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 用戶帳號已註銷
 *       401:
 *         description: 未認證
 *       404:
 *         description: 用戶不存在
 */
router.delete('/me', deleteCurrentUser);

/**
 * @swagger
 * /api/v1/users/me/queries:
 *   get:
 *     summary: 獲取當前用戶剩餘諮詢次數
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功獲取剩餘諮詢次數
 *       401:
 *         description: 未認證
 *       404:
 *         description: 用戶不存在
 */
router.get('/me/queries', getRemainingQueries);

/**
 * @swagger
 * /api/v1/users/me/queries/decrease:
 *   post:
 *     summary: 扣減當前用戶諮詢次數
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功扣減諮詢次數
 *       400:
 *         description: 諮詢次數不足
 *       401:
 *         description: 未認證
 *       404:
 *         description: 用戶不存在
 */
router.post('/me/queries/decrease', decreaseQuery);

export default router; 