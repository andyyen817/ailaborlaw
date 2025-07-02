import express from 'express';
import { body, param, query } from 'express-validator';
import { asyncHandler } from '../middlewares/async.middleware.js';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import QueryService from '../services/query.service.js';

const router = express.Router();

/**
 * 咨询次数管理路由
 * 提供次数扣减、增加、统计等功能
 */

/**
 * @route   POST /api/v1/queries/decrease
 * @desc    扣减用户咨询次数
 * @access  Private
 */
router.post('/decrease',
  authenticateToken,
  [
    body('reason')
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage('扣减原因长度必须在1-255之间')
      .trim(),
    body('relatedResourceId')
      .optional()
      .isMongoId()
      .withMessage('关联资源ID格式无效'),
    body('relatedResourceType')
      .optional()
      .isIn(['ChatSession', 'ExpertConsultation'])
      .withMessage('关联资源类型无效'),
    body('metadata')
      .optional()
      .isObject()
      .withMessage('元数据必须是对象格式')
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { 
      reason = 'AI咨询', 
      relatedResourceId = null, 
      relatedResourceType = null, 
      metadata = {} 
    } = req.body;
    
    const result = await QueryService.decreaseQueryCount(
      userId, 
      reason, 
      relatedResourceId, 
      relatedResourceType, 
      metadata
    );
    
    res.status(200).json(result);
  })
);

/**
 * @route   POST /api/v1/queries/increase
 * @desc    增加用户咨询次数（管理员或系统）
 * @access  Private (Admin or System)
 */
router.post('/increase',
  authenticateToken,
  requireRole(['admin']),
  [
    body('userId')
      .notEmpty()
      .withMessage('用户ID不能为空')
      .isMongoId()
      .withMessage('用户ID格式无效'),
    body('amount')
      .notEmpty()
      .withMessage('增加数量不能为空')
      .isInt({ min: 1, max: 1000 })
      .withMessage('增加数量必须在1-1000之间')
      .toInt(),
    body('reason')
      .notEmpty()
      .withMessage('增加原因不能为空')
      .isLength({ min: 1, max: 255 })
      .withMessage('增加原因长度必须在1-255之间')
      .trim(),
    body('metadata')
      .optional()
      .isObject()
      .withMessage('元数据必须是对象格式')
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { userId, amount, reason, metadata = {} } = req.body;
    const adminId = req.user.id;
    
    const result = await QueryService.increaseQueryCount(
      userId, 
      amount, 
      reason, 
      adminId, 
      'admin', 
      metadata
    );
    
    res.status(200).json(result);
  })
);

/**
 * @route   POST /api/v1/queries/admin/adjust
 * @desc    管理员调整用户咨询次数
 * @access  Private (Admin)
 */
router.post('/admin/adjust',
  authenticateToken,
  requireRole(['admin']),
  [
    body('userId')
      .notEmpty()
      .withMessage('用户ID不能为空')
      .isMongoId()
      .withMessage('用户ID格式无效'),
    body('operation')
      .notEmpty()
      .withMessage('操作类型不能为空')
      .isIn(['increase', 'decrease', 'set'])
      .withMessage('操作类型必须是 increase, decrease, 或 set'),
    body('amount')
      .notEmpty()
      .withMessage('操作数量不能为空')
      .isInt({ min: 0, max: 10000 })
      .withMessage('操作数量必须在0-10000之间')
      .toInt(),
    body('reason')
      .notEmpty()
      .withMessage('操作原因不能为空')
      .isLength({ min: 1, max: 255 })
      .withMessage('操作原因长度必须在1-255之间')
      .trim()
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { userId, operation, amount, reason } = req.body;
    const adminId = req.user.id;
    
    const result = await QueryService.adminAdjustQueryCount(
      userId, 
      operation, 
      amount, 
      reason, 
      adminId
    );
    
    res.status(200).json(result);
  })
);

/**
 * @route   POST /api/v1/queries/admin/batch-adjust
 * @desc    管理员批量调整用户咨询次数
 * @access  Private (Admin)
 */
router.post('/admin/batch-adjust',
  authenticateToken,
  requireRole(['admin']),
  [
    body('userIds')
      .isArray({ min: 1, max: 1000 })
      .withMessage('用户ID数组必须包含1-1000个元素'),
    body('userIds.*')
      .isMongoId()
      .withMessage('用户ID格式无效'),
    body('operation')
      .notEmpty()
      .withMessage('操作类型不能为空')
      .isIn(['increase', 'decrease', 'set'])
      .withMessage('操作类型必须是 increase, decrease, 或 set'),
    body('amount')
      .notEmpty()
      .withMessage('操作数量不能为空')
      .isInt({ min: 0, max: 10000 })
      .withMessage('操作数量必须在0-10000之间')
      .toInt(),
    body('reason')
      .notEmpty()
      .withMessage('操作原因不能为空')
      .isLength({ min: 1, max: 255 })
      .withMessage('操作原因长度必须在1-255之间')
      .trim()
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { userIds, operation, amount, reason } = req.body;
    const adminId = req.user.id;
    
    const result = await QueryService.batchUpdateQueryCount(
      userIds, 
      operation, 
      amount, 
      reason, 
      adminId
    );
    
    res.status(200).json(result);
  })
);

/**
 * @route   GET /api/v1/queries/my-status
 * @desc    获取当前用户的咨询次数状态
 * @access  Private
 */
router.get('/my-status',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const result = await QueryService.getUserQueryStatus(userId);
    
    res.status(200).json(result);
  })
);

/**
 * @route   GET /api/v1/queries/my-records
 * @desc    获取当前用户的咨询记录
 * @access  Private
 */
router.get('/my-records',
  authenticateToken,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('页码必须大于0')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('每页数量必须在1-100之间')
      .toInt(),
    query('action')
      .optional()
      .isIn(['decrease', 'increase', 'admin_adjust', 'invite_bonus', 'registration_bonus', 'system_grant'])
      .withMessage('操作类型无效')
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 20, action } = req.query;
    
    const result = await QueryService.getUserQueryRecords(userId, page, limit, action);
    
    res.status(200).json(result);
  })
);

/**
 * @route   GET /api/v1/queries/user/:userId/status
 * @desc    获取指定用户的咨询次数状态（管理员）
 * @access  Private (Admin)
 */
router.get('/user/:userId/status',
  authenticateToken,
  requireRole(['admin']),
  [
    param('userId')
      .isMongoId()
      .withMessage('用户ID格式无效')
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    const result = await QueryService.getUserQueryStatus(userId);
    
    res.status(200).json(result);
  })
);

/**
 * @route   GET /api/v1/queries/user/:userId/records
 * @desc    获取指定用户的咨询记录（管理员）
 * @access  Private (Admin)
 */
router.get('/user/:userId/records',
  authenticateToken,
  requireRole(['admin']),
  [
    param('userId')
      .isMongoId()
      .withMessage('用户ID格式无效'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('页码必须大于0')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('每页数量必须在1-100之间')
      .toInt(),
    query('action')
      .optional()
      .isIn(['decrease', 'increase', 'admin_adjust', 'invite_bonus', 'registration_bonus', 'system_grant'])
      .withMessage('操作类型无效')
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 20, action } = req.query;
    
    const result = await QueryService.getUserQueryRecords(userId, page, limit, action);
    
    res.status(200).json(result);
  })
);

/**
 * @route   GET /api/v1/queries/admin/system-stats
 * @desc    获取系统咨询统计（管理员）
 * @access  Private (Admin)
 */
router.get('/admin/system-stats',
  authenticateToken,
  requireRole(['admin']),
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('开始日期格式无效')
      .toDate(),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('结束日期格式无效')
      .toDate()
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    const result = await QueryService.getSystemQueryStats(startDate, endDate);
    
    res.status(200).json(result);
  })
);

/**
 * @route   GET /api/v1/queries/my-today-count
 * @desc    获取当前用户今日咨询次数 (基于台湾时区)
 * @access  Private
 */
router.get('/my-today-count',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const todayCount = await QueryService.getTodayQueryCount(userId);
    
    // 获取台湾时区的当前日期
    const taipeiDate = new Date().toLocaleString("en-US", {timeZone: "Asia/Taipei"});
    const currentTaipeiDate = new Date(taipeiDate).toISOString().split('T')[0];
    
    res.status(200).json({
      success: true,
      data: {
        todayCount,
        date: currentTaipeiDate,
        timezone: "Asia/Taipei"
      }
    });
  })
);

export default router; 