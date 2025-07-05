const express = require('express');
const { body, param, query } = require('express-validator');
const { asyncHandler } = require('../middlewares/async.middleware');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validation.middleware');
const InviteService = require('../services/invite.service');
const { AppError } = require('../utils/error');

const router = express.Router();

/**
 * 邀请管理路由
 * 提供邀请码生成、验证、统计等功能
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
      .withMessage('邀请码长度必须在4-20之间')
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
 * @access  Private (新注册用户)
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
 * @desc    发放注册奖励（用户注册时自动调用）
 * @access  Private
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
 * @desc    获取当前用户的邀请统计
 * @access  Private
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
      .withMessage('限制数量必须在1-100之间')
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
      throw new AppError('用户不存在', 404);
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
      throw new AppError('用户不存在', 404);
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
 * @desc    获取邀请系统设置
 * @access  Private
 */
router.get('/settings',
  authenticateToken,
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        inviterBonus: 10,         // 邀請人獲得的獎勵次數
        inviteeBonus: 10,         // 被邀請人獲得的獎勵次數
        isEnabled: true,          // 邀請功能是否啟用
        maxInvitesPerUser: 100,   // 每用戶最大邀請數
        description: "邀請好友註冊可獲得額外諮詢次數"
      }
    });
  })
);

module.exports = router; 