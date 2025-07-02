import express from 'express';
import ExpertConsultationController from '../controllers/expert-consultation.controller.js';
import { protect, isAdmin, protectOptional } from '../middlewares/auth.middleware.js';
import { protectAdmin } from '../middlewares/admin-auth.middleware.js';
import { validateExpertConsultation, validateConsultationUpdate } from '../validations/expert-consultation.validation.js';

const router = express.Router();

/**
 * 专家咨询路由
 * 包含用户端和管理员端API
 */

// ===== 用户端API =====

/**
 * @route   POST /api/v1/expert-consultations
 * @desc    提交专家咨询申请
 * @access  Private (需要认证，不再支持游客用户)
 */
router.post('/', 
  protect, // 修改：强制要求认证，符合前端设计
  validateExpertConsultation,
  ExpertConsultationController.createConsultation
);

/**
 * @route   GET /api/v1/expert-consultations/user/:userId
 * @desc    获取用户的咨询申请列表
 * @access  Private (需要认证)
 */
router.get('/user/:userId',
  protect,
  ExpertConsultationController.getUserConsultations
);

/**
 * @route   GET /api/v1/expert-consultations/:id
 * @desc    获取单个咨询申请详情
 * @access  Private (只能查看自己的申请)
 */
router.get('/:id',
  protect,
  ExpertConsultationController.getConsultationDetail
);

/**
 * @route   PUT /api/v1/expert-consultations/:id/cancel
 * @desc    取消咨询申请
 * @access  Private (只能取消自己的申请)
 */
router.put('/:id/cancel',
  protect,
  ExpertConsultationController.cancelConsultation
);

// ===== 管理员API =====

/**
 * @route   GET /api/v1/expert-consultations/admin/list
 * @desc    获取所有咨询申请列表 (管理员)
 * @access  Admin (支持Admin模型认证)
 */
router.get('/admin/list',
  protectAdmin, // 修改：支持Admin模型认证
  ExpertConsultationController.getAdminConsultations
);

/**
 * @route   GET /api/v1/expert-consultations/admin/statistics
 * @desc    获取咨询统计数据 (管理员)
 * @access  Admin (支持Admin模型认证)
 * @note    必须放在动态参数路由之前，避免被 /admin/:id 拦截
 */
router.get('/admin/statistics',
  protectAdmin, // 修改：支持Admin模型认证
  ExpertConsultationController.getStatistics
);

/**
 * @route   GET /api/v1/expert-consultations/admin/:id
 * @desc    获取咨询申请详情 (管理员)
 * @access  Admin (支持Admin模型认证)
 */
router.get('/admin/:id',
  protectAdmin, // 修改：支持Admin模型认证
  ExpertConsultationController.getAdminConsultationDetail
);

/**
 * @route   PUT /api/v1/expert-consultations/admin/:id
 * @desc    更新咨询申请 (管理员)
 * @access  Admin (支持Admin模型认证)
 */
router.put('/admin/:id',
  protectAdmin, // 修改：支持Admin模型认证
  validateConsultationUpdate,
  ExpertConsultationController.updateConsultation
);

/**
 * @route   DELETE /api/v1/expert-consultations/admin/:id
 * @desc    删除咨询申请 (管理员)
 * @access  Admin (支持Admin模型认证)
 */
router.delete('/admin/:id',
  protectAdmin, // 修改：支持Admin模型认证
  ExpertConsultationController.deleteConsultation
);

export default router; 