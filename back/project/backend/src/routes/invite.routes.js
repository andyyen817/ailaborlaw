const express = require('express');
const { body, param, query } = require('express-validator');
const { asyncHandler } = require('../middlewares/async.middleware.js');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware.js');
const { protectAdmin } = require('../middlewares/admin-auth.middleware.js');
const { validateRequest } = require('../middlewares/validation.middleware.js');
const InviteService = require('../services/invite.service.js');
const { AppError } = require('../utils/error.js');

const router = express.Router();

/**
 * 邀请管理路�? * 提供邀请码生成、验证、统计等功能
 */

/**
 * @route   POST /api/v1/invites/validate
 * @desc    验证邀请码
 * @access  Public
 */
router.post('/validate',
  [
    body('inviteCode')
      .notEmpty()
      .withMessage('邀请码不能为空')
      .isLength({ min: 4, max: 20 })
      .withMessage('邀请码长度必须�?-20之间')
      .trim()
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { inviteCode } = req.body;
    
    const result = await InviteService.validateInviteCode(inviteCode);
    
    res.status(200).json({
      success: result.valid,
      message: result.message,
      data: result.valid ? {
        inviter: result.inviter
      } : null
    });
  })
);

/**
 * @route   POST /api/v1/invites/process-registration
 * @desc    处理邀请注册（用户注册时调用）
 * @access  Private (新注册用�?
 */
router.post('/process-registration',
  authenticateToken,
  [
    body('inviteCode')
      .notEmpty()
      .withMessage('邀请码不能为空')
      .trim()
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { inviteCode } = req.body;
    const userId = req.user.id;
    
    const result = await InviteService.processInviteRegistration(userId, inviteCode);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        data: {
          alreadyProcessed: result.alreadyProcessed || false
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  })
);

/**
 * @route   POST /api/v1/invites/grant-registration-bonus
 * @desc    发放注册奖励（用户注册时自动调用�? * @access  Private
 */
router.post('/grant-registration-bonus',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const result = await InviteService.grantRegistrationBonus(userId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        data: {
          alreadyGranted: result.alreadyGranted || false
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  })
);

/**
 * @route   GET /api/v1/invites/my-stats
 * @desc    获取当前用户的邀请统�? * @access  Private
 */
router.get('/my-stats',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const result = await InviteService.getUserInviteStats(userId);
    
    res.status(200).json(result);
  })
);

/**
 * @route   GET /api/v1/invites/leaderboard
 * @desc    获取邀请排行榜
 * @access  Private
 */
router.get('/leaderboard',
  authenticateToken,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('限制数量必须�?-100之间')
      .toInt(),
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
    const { limit = 10, startDate, endDate } = req.query;
    
    const result = await InviteService.getInviteLeaderboard(limit, startDate, endDate);
    
    res.status(200).json(result);
  })
);

/**
 * @route   GET /api/v1/invites/user/:userId/stats
 * @desc    获取指定用户的邀请统计（管理员）
 * @access  Private (Admin)
 */
router.get('/user/:userId/stats',
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
    
    const result = await InviteService.getUserInviteStats(userId);
    
    res.status(200).json(result);
  })
);

/**
 * @route   GET /api/v1/invites/system-stats
 * @desc    获取邀请系统统计（管理员）
 * @access  Private (Admin)
 */
router.get('/system-stats',
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
    
    const result = await InviteService.getInviteSystemStats(startDate, endDate);
    
    res.status(200).json(result);
  })
);

/**
 * @route   GET /api/v1/invites/my-code
 * @desc    获取当前用户的邀请码
 * @access  Private
 */
router.get('/my-code',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    // 从数据库获取用户的邀请码
    const User = (await import('../models/user.model.js')).default;
    const user = await User.findById(userId, 'myInviteCode name');
    
    if (!user) {
      throw new AppError('用户不存�?, 404);
    }
    
    res.status(200).json({
      success: true,
      data: {
        inviteCode: user.myInviteCode,
        userName: user.name,
        inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?invite=${user.myInviteCode}`
      }
    });
  })
);

/**
 * @route   POST /api/v1/invites/regenerate-code
 * @desc    重新生成邀请码
 * @access  Private
 */
router.post('/regenerate-code',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    // 生成新的邀请码
    const User = (await import('../models/user.model.js')).default;
    const newCode = await InviteService.generateUniqueInviteCode();
    
    const user = await User.findByIdAndUpdate(
      userId,
      { myInviteCode: newCode },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      throw new AppError('用户不存�?, 404);
    }
    
    res.status(200).json({
      success: true,
      message: '邀请码重新生成成功',
      data: {
        newInviteCode: user.myInviteCode,
        inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?invite=${user.myInviteCode}`
      }
    });
  })
);

/**
 * @route   GET /api/v1/invites/settings
 * @desc    获取邀请系统设�? * @access  Private
 */
router.get('/settings',
  authenticateToken,
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        inviterBonus: 10,         // 邀請人獲得的獎勵次�?        inviteeBonus: 10,         // 被邀請人獲得的獎勵次�?        isEnabled: true,          // 邀請功能是否啟�?        maxInvitesPerUser: 100,   // 每用戶最大邀請數
        description: "邀請好友註冊可獲得額外諮詢次數"
      }
    });
  })
);

// 管理员专用路由组
/**
 * @route   GET /api/v1/invites/admin/records
 * @desc    获取所有邀请记录（管理员）
 * @access  Private (Admin)
 */
router.get('/admin/records',
  protectAdmin,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('页码必须是正整数')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('每页数量必须�?-100之间')
      .toInt(),
    query('status')
      .optional()
      .isIn(['all', 'completed', 'pending', 'expired'])
      .withMessage('状态筛选值无�?),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('开始日期格式无效')
      .toDate(),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('结束日期格式无效')
      .toDate(),
    query('search')
      .optional()
      .isLength({ max: 100 })
      .withMessage('搜索关键词长度不能超�?00字符')
      .trim()
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      status = 'all',
      startDate,
      endDate,
      search = ''
    } = req.query;

    const result = await InviteService.getAllInviteRecords({
      page,
      limit,
      status,
      startDate,
      endDate,
      search
    });

    res.status(200).json(result);
  })
);

/**
 * @route   GET /api/v1/invites/admin/system-stats
 * @desc    获取邀请系统统计（管理员增强版�? * @access  Private (Admin)
 */
router.get('/admin/system-stats',
  protectAdmin,
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
    
    // 使用现有的系统统计方�?    const result = await InviteService.getInviteSystemStats(startDate, endDate);
    
    res.status(200).json(result);
  })
);

/**
 * @route   GET /api/v1/invites/admin/settings
 * @desc    获取邀请系统设置（管理员）
 * @access  Private (Admin)
 */
router.get('/admin/settings',
  protectAdmin,
  asyncHandler(async (req, res) => {
    const result = await InviteService.getInviteAdminSettings();
    res.status(200).json(result);
  })
);

/**
 * @route   PUT /api/v1/invites/admin/settings
 * @desc    更新邀请系统设置（管理员）
 * @access  Private (Admin)
 */
router.put('/admin/settings',
  protectAdmin,
  [
    body('inviterBonus')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('邀请人奖励次数必须�?-100之间的整�?),
    body('inviteeBonus')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('被邀请人奖励次数必须�?-100之间的整�?),
    body('registrationBonus')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('注册奖励次数必须�?-100之间的整�?),
    body('isEnabled')
      .optional()
      .isBoolean()
      .withMessage('邀请系统启用状态必须是布尔�?),
    body('maxInvitesPerUser')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('每用户最大邀请数必须�?-1000之间的整�?)
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const settings = req.body;
    
    const result = await InviteService.updateInviteAdminSettings(settings);
    
    res.status(200).json(result);
  })
);

module.exports = router; 
