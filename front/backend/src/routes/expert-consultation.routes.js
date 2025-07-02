const express = require('express');
const expertConsultationController = require('../controllers/expert-consultation.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// 可选认证中间件 - 支持游客模式
const optionalAuthenticate = (req, res, next) => {
  // 检查是否有Authorization头
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // 如果有token，进行认证
    return authenticate(req, res, next);
  } else {
    // 如果没有token，设置游客用户信息
    req.user = { id: 'guest', userType: 'guest' };
    next();
  }
};

// ===== 管理员端路由 (5个) - 放在前面避免路由冲突 =====

// 获取所有申请列表 (管理员)
router.get('/admin/list', authenticate, authorize('admin'), expertConsultationController.getAdminConsultationList);

// 获取统计数据 (管理员)
router.get('/admin/statistics', authenticate, authorize('admin'), expertConsultationController.getAdminStatistics);

// 更新申请状态 (管理员)
router.put('/admin/:id', authenticate, authorize('admin'), expertConsultationController.updateAdminConsultation);

// 删除申请 (管理员)
router.delete('/admin/:id', authenticate, authorize('admin'), expertConsultationController.deleteAdminConsultation);

// ===== 用户端路由 (4个) =====

// 提交专家咨询申请 (支持游客模式)
router.post('/', optionalAuthenticate, expertConsultationController.submitConsultation);

// 获取用户申请列表 (需要认证)
router.get('/user/:userId', authenticate, expertConsultationController.getUserConsultations);

// 取消申请 (需要认证)
router.put('/:id/cancel', authenticate, expertConsultationController.cancelConsultation);

// 获取申请详情 (需要认证) - 放在最后避免冲突
router.get('/:id', authenticate, expertConsultationController.getConsultationDetails);

module.exports = router; 