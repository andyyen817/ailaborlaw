const express = require('express');
const laborAdvisorController = require('../controllers/labor-advisor.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// ===== 劳资顾问管理路由 (11个) - 调整顺序避免冲突 =====

// 搜索可用顾问 (管理员) - 具体路径优先
router.get('/search', authenticate, authorize('admin'), laborAdvisorController.searchAvailableAdvisors);

// 获取顾问统计数据 (管理员) - 具体路径优先
router.get('/statistics', authenticate, authorize('admin'), laborAdvisorController.getAdvisorStatistics);

// 手动指派顾问 (管理员) - 具体路径优先
router.put('/assign/:consultationId', authenticate, authorize('admin'), laborAdvisorController.assignAdvisorManually);

// 自动指派最佳顾问 (管理员) - 具体路径优先
router.post('/auto-assign/:consultationId', authenticate, authorize('admin'), laborAdvisorController.autoAssignBestAdvisor);

// 获取指派历史 (管理员) - 具体路径优先
router.get('/assignment-history/:consultationId', authenticate, authorize('admin'), laborAdvisorController.getAssignmentHistory);

// 获取顾问列表 (管理员)
router.get('/', authenticate, authorize('admin'), laborAdvisorController.getAdvisorList);

// 创建新顾问 (管理员)
router.post('/', authenticate, authorize('admin'), laborAdvisorController.createAdvisor);

// 切换顾问状态 (管理员) - 具体路径优先
router.put('/:id/toggle-status', authenticate, authorize('admin'), laborAdvisorController.toggleAdvisorStatus);

// 获取顾问详情 (管理员)
router.get('/:id', authenticate, authorize('admin'), laborAdvisorController.getAdvisorDetails);

// 更新顾问信息 (管理员)
router.put('/:id', authenticate, authorize('admin'), laborAdvisorController.updateAdvisor);

// 删除顾问 (管理员)
router.delete('/:id', authenticate, authorize('admin'), laborAdvisorController.deleteAdvisor);

module.exports = router; 