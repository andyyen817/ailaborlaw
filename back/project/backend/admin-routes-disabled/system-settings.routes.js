import express from 'express';
import { body, param, query } from 'express-validator';
import { asyncHandler } from '../../middlewares/async.middleware.js';
import { authenticateToken, requireRole } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import SystemSettingService from '../../services/system-setting.service.js';

const router = express.Router();

/**
 * 系统设置管理路由（管理员专用）
 * 提供系统配置的增删改查功能
 */

/**
 * @route   POST /api/v1/admin/system-settings/initialize
 * @desc    初始化系统默认设置
 * @access  Private (Admin)
 */
router.post('/initialize',
  authenticateToken,
  requireRole(['admin']),
  asyncHandler(async (req, res) => {
    const result = await SystemSettingService.initializeSystem();
    
    res.status(200).json(result);
  })
);

/**
 * @route   GET /api/v1/admin/system-settings
 * @desc    获取所有系统设置
 * @access  Private (Admin)
 */
router.get('/',
  authenticateToken,
  requireRole(['admin']),
  [
    query('category')
      .optional()
      .isIn(['invite', 'query', 'system', 'ui', 'notification'])
      .withMessage('设置分类无效'),
    query('activeOnly')
      .optional()
      .isBoolean()
      .withMessage('activeOnly必须是布尔值')
      .toBoolean()
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { category, activeOnly = true } = req.query;
    
    const result = await SystemSettingService.getAllSettings(category, activeOnly);
    
    res.status(200).json(result);
  })
);

/**
 * @route   GET /api/v1/admin/system-settings/:key
 * @desc    获取单个系统设置
 * @access  Private (Admin)
 */
router.get('/:key',
  authenticateToken,
  requireRole(['admin']),
  [
    param('key')
      .notEmpty()
      .withMessage('设置键名不能为空')
      .trim()
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    
    const result = await SystemSettingService.getSetting(key);
    
    res.status(200).json(result);
  })
);

/**
 * @route   PUT /api/v1/admin/system-settings/:key
 * @desc    更新单个系统设置
 * @access  Private (Admin)
 */
router.put('/:key',
  authenticateToken,
  requireRole(['admin']),
  [
    param('key')
      .notEmpty()
      .withMessage('设置键名不能为空')
      .trim(),
    body('value')
      .exists()
      .withMessage('设置值不能为空'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('描述不能超过500字符')
      .trim()
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { value, description } = req.body;
    const updatedBy = req.user.id;
    
    const result = await SystemSettingService.updateSetting(key, value, updatedBy, description);
    
    res.status(200).json(result);
  })
);

/**
 * @route   PUT /api/v1/admin/system-settings
 * @desc    批量更新系统设置
 * @access  Private (Admin)
 */
router.put('/',
  authenticateToken,
  requireRole(['admin']),
  [
    body('settings')
      .isArray({ min: 1, max: 100 })
      .withMessage('设置数组必须包含1-100个元素'),
    body('settings.*.key')
      .notEmpty()
      .withMessage('设置键名不能为空')
      .trim(),
    body('settings.*.value')
      .exists()
      .withMessage('设置值不能为空'),
    body('settings.*.description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('描述不能超过500字符')
      .trim(),
    body('settings.*.category')
      .optional()
      .isIn(['invite', 'query', 'system', 'ui', 'notification'])
      .withMessage('设置分类无效')
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { settings } = req.body;
    const updatedBy = req.user.id;
    
    const result = await SystemSettingService.batchUpdateSettings(settings, updatedBy);
    
    res.status(200).json(result);
  })
);

/**
 * @route   DELETE /api/v1/admin/system-settings/:key
 * @desc    删除系统设置（软删除）
 * @access  Private (Admin)
 */
router.delete('/:key',
  authenticateToken,
  requireRole(['admin']),
  [
    param('key')
      .notEmpty()
      .withMessage('设置键名不能为空')
      .trim()
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    const updatedBy = req.user.id;
    
    const result = await SystemSettingService.deleteSetting(key, updatedBy);
    
    res.status(200).json(result);
  })
);

/**
 * @route   POST /api/v1/admin/system-settings/:key/restore
 * @desc    恢复系统设置
 * @access  Private (Admin)
 */
router.post('/:key/restore',
  authenticateToken,
  requireRole(['admin']),
  [
    param('key')
      .notEmpty()
      .withMessage('设置键名不能为空')
      .trim()
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { key } = req.params;
    const updatedBy = req.user.id;
    
    const result = await SystemSettingService.restoreSetting(key, updatedBy);
    
    res.status(200).json(result);
  })
);

/**
 * @route   GET /api/v1/admin/system-settings/invite/settings
 * @desc    获取邀请系统设置
 * @access  Private (Admin)
 */
router.get('/invite/settings',
  authenticateToken,
  requireRole(['admin']),
  asyncHandler(async (req, res) => {
    const result = await SystemSettingService.getInviteSettings();
    
    res.status(200).json(result);
  })
);

/**
 * @route   PUT /api/v1/admin/system-settings/invite/settings
 * @desc    更新邀请系统设置
 * @access  Private (Admin)
 */
router.put('/invite/settings',
  authenticateToken,
  requireRole(['admin']),
  [
    body('defaultFreeQueries')
      .optional()
      .isInt({ min: 0, max: 1000 })
      .withMessage('默认免费次数必须在0-1000之间')
      .toInt(),
    body('bonusQueries')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('邀请奖励次数必须在0-100之间')
      .toInt(),
    body('inviteeBonusQueries')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('被邀请人奖励次数必须在0-100之间')
      .toInt(),
    body('maxInvitesPerDay')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('每日最大邀请次数必须在1-1000之间')
      .toInt(),
    body('inviteCodeLength')
      .optional()
      .isInt({ min: 4, max: 20 })
      .withMessage('邀请码长度必须在4-20之间')
      .toInt(),
    body('inviteCodeExpireDays')
      .optional()
      .isInt({ min: 1, max: 3650 })
      .withMessage('邀请码过期天数必须在1-3650之间')
      .toInt(),
    body('enableInviteSystem')
      .optional()
      .isBoolean()
      .withMessage('启用邀请系统必须是布尔值')
      .toBoolean()
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const settings = req.body;
    const updatedBy = req.user.id;
    
    const result = await SystemSettingService.updateInviteSettings(settings, updatedBy);
    
    res.status(200).json(result);
  })
);

/**
 * @route   GET /api/v1/admin/system-settings/history
 * @desc    获取设置变更历史
 * @access  Private (Admin)
 */
router.get('/history',
  authenticateToken,
  requireRole(['admin']),
  [
    query('key')
      .optional()
      .trim(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 200 })
      .withMessage('限制数量必须在1-200之间')
      .toInt()
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { key, limit = 50 } = req.query;
    
    const result = await SystemSettingService.getSettingHistory(key, limit);
    
    res.status(200).json(result);
  })
);

/**
 * @route   GET /api/v1/admin/system-settings/export
 * @desc    导出系统设置
 * @access  Private (Admin)
 */
router.get('/export',
  authenticateToken,
  requireRole(['admin']),
  [
    query('category')
      .optional()
      .isIn(['invite', 'query', 'system', 'ui', 'notification'])
      .withMessage('设置分类无效')
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { category } = req.query;
    
    const result = await SystemSettingService.exportSettings(category);
    
    // 设置下载headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="system-settings-${category || 'all'}-${new Date().toISOString().split('T')[0]}.json"`);
    
    res.status(200).json(result.data);
  })
);

/**
 * @route   POST /api/v1/admin/system-settings/import
 * @desc    导入系统设置
 * @access  Private (Admin)
 */
router.post('/import',
  authenticateToken,
  requireRole(['admin']),
  [
    body('settings')
      .isArray({ min: 1 })
      .withMessage('设置数据必须是数组'),
    body('settings.*.key')
      .notEmpty()
      .withMessage('设置键名不能为空'),
    body('settings.*.value')
      .exists()
      .withMessage('设置值不能为空')
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const importData = req.body;
    const updatedBy = req.user.id;
    
    const result = await SystemSettingService.importSettings(importData, updatedBy);
    
    res.status(200).json(result);
  })
);

/**
 * @route   POST /api/v1/admin/system-settings/reset
 * @desc    重置设置为默认值
 * @access  Private (Admin)
 */
router.post('/reset',
  authenticateToken,
  requireRole(['admin']),
  [
    body('category')
      .optional()
      .isIn(['invite', 'query', 'system', 'ui', 'notification'])
      .withMessage('设置分类无效')
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { category } = req.body;
    const updatedBy = req.user.id;
    
    const result = await SystemSettingService.resetToDefaults(category, updatedBy);
    
    res.status(200).json(result);
  })
);

export default router; 