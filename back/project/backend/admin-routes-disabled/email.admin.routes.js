import express from 'express';
import { body, param, query } from 'express-validator';
import { asyncHandler } from '../../middlewares/async.middleware.js';
import { authenticateToken, requireRole } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import {
  getEmailStatistics,
  getEmailLogs,
  resendFailedEmail,
  testEmailService,
  cleanupExpiredLogs
} from '../../controllers/admin/email.admin.controller.js';

const router = express.Router();

/**
 * 所有路由都需要管理員權限
 */
router.use(authenticateToken);
router.use(requireRole(['admin']));

/**
 * @swagger
 * /admin/emails/statistics:
 *   get:
 *     summary: Get email sending statistics
 *     tags: [Admin - Email Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics (ISO format)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, registration, password_reset, invite_confirmation]
 *         description: Email type filter
 *     responses:
 *       200:
 *         description: Email statistics retrieved successfully
 *       403:
 *         description: Access denied
 */
router.get('/statistics',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('開始日期格式無效'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('結束日期格式無效'),
    query('type')
      .optional()
      .isIn(['all', 'registration', 'password_reset', 'invite_confirmation'])
      .withMessage('郵件類型無效')
  ],
  validateRequest,
  asyncHandler(getEmailStatistics)
);

/**
 * @swagger
 * /admin/emails/logs:
 *   get:
 *     summary: Get email sending logs
 *     tags: [Admin - Email Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [registration, password_reset, invite_confirmation]
 *         description: Email type filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [sent, failed, verified]
 *         description: Email status filter
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Email address filter (partial match)
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID filter
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: Email logs retrieved successfully
 *       403:
 *         description: Access denied
 */
router.get('/logs',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('頁碼必須是正整數')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('每頁數量必須在1-100之間')
      .toInt(),
    query('type')
      .optional()
      .isIn(['registration', 'password_reset', 'invite_confirmation'])
      .withMessage('郵件類型無效'),
    query('status')
      .optional()
      .isIn(['sent', 'failed', 'verified'])
      .withMessage('郵件狀態無效'),
    query('email')
      .optional()
      .isEmail()
      .withMessage('郵箱格式無效'),
    query('userId')
      .optional()
      .isMongoId()
      .withMessage('用戶ID格式無效'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('開始日期格式無效'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('結束日期格式無效')
  ],
  validateRequest,
  asyncHandler(getEmailLogs)
);

/**
 * @swagger
 * /admin/emails/resend/{logId}:
 *   post:
 *     summary: Resend failed email
 *     tags: [Admin - Email Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: string
 *         description: Email log ID
 *     responses:
 *       200:
 *         description: Email resent successfully
 *       400:
 *         description: Invalid request or email not failed
 *       404:
 *         description: Email log not found
 *       403:
 *         description: Access denied
 */
router.post('/resend/:logId',
  [
    param('logId')
      .isMongoId()
      .withMessage('郵件日志ID格式無效')
  ],
  validateRequest,
  asyncHandler(resendFailedEmail)
);

/**
 * @swagger
 * /admin/emails/test-service:
 *   post:
 *     summary: Test email service connection
 *     tags: [Admin - Email Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email service test completed
 *       403:
 *         description: Access denied
 */
router.post('/test-service',
  asyncHandler(testEmailService)
);

/**
 * @swagger
 * /admin/emails/cleanup:
 *   post:
 *     summary: Clean up expired email logs
 *     tags: [Admin - Email Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               daysOld:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 365
 *                 default: 60
 *                 description: Days old to consider for cleanup
 *     responses:
 *       200:
 *         description: Cleanup completed successfully
 *       403:
 *         description: Access denied
 */
router.post('/cleanup',
  [
    body('daysOld')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('天數必須在1-365之間')
      .toInt()
  ],
  validateRequest,
  asyncHandler(cleanupExpiredLogs)
);

export default router; 