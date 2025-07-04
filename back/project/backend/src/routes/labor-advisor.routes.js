const express = require('express');
const LaborAdvisorController = require('../controllers/labor-advisor.controller.js');
const { protectAdmin } = require('../middlewares/admin-auth.middleware.js');
const { validateLaborAdvisor, validateAdvisorUpdate } = require('../validations/labor-advisor.validation.js');

const router = express.Router();

/**
 * 劳资顾问管理路由
 * 所有路由都需要管理员权限
 */

// ===== 劳资顾问管理 API =====

/**
 * @route   GET /api/v1/labor-advisors
 * @desc    获取劳资顾问列表
 * @access  Admin
 * @params  ?page=1&limit=20&region=台北�?specialty=labor_contract&status=active&search=张三
 */
router.get('/',
  protectAdmin,
  LaborAdvisorController.getAdvisors
);

/**
 * @route   GET /api/v1/labor-advisors/search
 * @desc    搜索可用顾问（用于指派）
 * @access  Admin  
 * @params  ?region=台北�?specialty=labor_contract&available=true
 */
router.get('/search',
  protectAdmin,
  LaborAdvisorController.searchAvailableAdvisors
);

/**
 * @route   GET /api/v1/labor-advisors/statistics
 * @desc    获取劳资顾问统计数据
 * @access  Admin
 * @params  ?region=台北�? */
router.get('/statistics',
  protectAdmin,
  LaborAdvisorController.getAdvisorStatistics
);

/**
 * @route   GET /api/v1/labor-advisors/:id
 * @desc    获取劳资顾问详情
 * @access  Admin
 */
router.get('/:id',
  protectAdmin,
  LaborAdvisorController.getAdvisorDetail
);

/**
 * @route   POST /api/v1/labor-advisors
 * @desc    添加新的劳资顾问
 * @access  Admin
 */
router.post('/',
  protectAdmin,
  validateLaborAdvisor,
  LaborAdvisorController.createAdvisor
);

/**
 * @route   PUT /api/v1/labor-advisors/:id
 * @desc    更新劳资顾问信息
 * @access  Admin
 */
router.put('/:id',
  protectAdmin,
  validateAdvisorUpdate,
  LaborAdvisorController.updateAdvisor
);

/**
 * @route   PUT /api/v1/labor-advisors/:id/toggle-status
 * @desc    切换劳资顾问状态（激�?停用�? * @access  Admin
 */
router.put('/:id/toggle-status',
  protectAdmin,
  LaborAdvisorController.toggleAdvisorStatus
);

/**
 * @route   DELETE /api/v1/labor-advisors/:id
 * @desc    删除劳资顾问
 * @access  Admin
 */
router.delete('/:id',
  protectAdmin,
  LaborAdvisorController.deleteAdvisor
);

// ===== 专家咨询指派 API =====

/**
 * @route   PUT /api/v1/labor-advisors/assign/:consultationId
 * @desc    手动指派顾问到咨询案�? * @access  Admin
 */
router.put('/assign/:consultationId',
  protectAdmin,
  LaborAdvisorController.assignAdvisorToConsultation
);

/**
 * @route   POST /api/v1/labor-advisors/auto-assign/:consultationId
 * @desc    自动指派最佳顾问到咨询案件
 * @access  Admin
 */
router.post('/auto-assign/:consultationId',
  protectAdmin,
  LaborAdvisorController.autoAssignAdvisor
);

/**
 * @route   GET /api/v1/labor-advisors/assignment-history/:consultationId
 * @desc    获取咨询案件的指派历�? * @access  Admin
 */
router.get('/assignment-history/:consultationId',
  protectAdmin,
  LaborAdvisorController.getAssignmentHistory
);

module.exports = router; 
