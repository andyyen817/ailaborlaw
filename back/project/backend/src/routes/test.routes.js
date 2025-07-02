import express from 'express';
import { 
  protect, 
  isAdmin, 
  isHR, 
  isEmployer, 
  isEmployee, 
  hasRole, 
  hasRemainingQueries,
  isSelfOrAdmin
} from '../middlewares/auth.middleware.js';
import n8nService from '../services/n8n.service.js';
import logger from '../utils/logger.js';
// 任务组5：专家咨询模块测试所需导入
import ExpertConsultationController from '../controllers/expert-consultation.controller.js';
import ExpertConsultation, { SERVICE_TYPES, STATUS_TYPES, CONTACT_METHODS } from '../models/expert_consultation.model.js';

const router = express.Router();

/**
 * 測試路由
 * 基礎路徑: /api/v1/test
 * 這些路由主要用於測試認證和權限中間件
 */

// 公共路由 - 無需認證
router.get('/public', (req, res) => {
  res.status(200).json({
    success: true,
    message: '公共路由訪問成功 - 無需認證',
    data: { isAuthenticated: false }
  });
});

// 需要認證的路由
router.get('/auth', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: '認證路由訪問成功 - 需要有效令牌',
    data: {
      isAuthenticated: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        userType: req.user.userType
      }
    }
  });
});

// 管理員角色路由
router.get('/admin', protect, isAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: '管理員路由訪問成功 - 需要管理員權限',
    data: {
      isAuthenticated: true,
      isAdmin: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        userType: req.user.userType
      }
    }
  });
});

// HR角色路由
router.get('/hr', protect, isHR, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HR路由訪問成功 - 需要HR權限',
    data: {
      isAuthenticated: true,
      isHR: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        userType: req.user.userType
      }
    }
  });
});

// 雇主角色路由
router.get('/employer', protect, isEmployer, (req, res) => {
  res.status(200).json({
    success: true,
    message: '雇主路由訪問成功 - 需要雇主權限',
    data: {
      isAuthenticated: true,
      isEmployer: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        userType: req.user.userType
      }
    }
  });
});

// 員工角色路由
router.get('/employee', protect, isEmployee, (req, res) => {
  res.status(200).json({
    success: true,
    message: '員工路由訪問成功 - 需要員工權限',
    data: {
      isAuthenticated: true,
      isEmployee: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        userType: req.user.userType
      }
    }
  });
});

// 多角色路由 (管理員或HR)
router.get('/admin-hr', protect, hasRole(['admin', 'hr']), (req, res) => {
  res.status(200).json({
    success: true,
    message: '多角色路由訪問成功 - 需要管理員或HR權限',
    data: {
      isAuthenticated: true,
      allowedRoles: ['admin', 'hr'],
      currentRole: req.user.userType,
      user: {
        id: req.user.id,
        name: req.user.name,
        userType: req.user.userType
      }
    }
  });
});

// 檢查諮詢次數路由
router.get('/check-queries', protect, hasRemainingQueries, (req, res) => {
  res.status(200).json({
    success: true,
    message: '諮詢次數檢查通過 - 有足夠的諮詢次數',
    data: {
      isAuthenticated: true,
      remainingQueries: req.user.remainingQueries,
      user: {
        id: req.user.id,
        name: req.user.name,
        userType: req.user.userType
      }
    }
  });
});

// 測試模擬用戶資源路由 - 測試 isSelfOrAdmin 中間件
router.get('/users/:userId/profile', protect, isSelfOrAdmin(), (req, res) => {
  res.status(200).json({
    success: true,
    message: '用戶資源訪問成功 - 只能訪問自己的資源或管理員可訪問所有資源',
    data: {
      requestedUserId: req.params.userId,
      currentUserId: req.user.id,
      isAdmin: req.user.userType === 'admin',
      accessType: req.user.id === req.params.userId ? 'self' : 'admin'
    }
  });
});

// 測試令牌信息路由 - 查看當前令牌中包含的信息
router.get('/token-info', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: '令牌信息獲取成功',
    data: {
      user: req.user,
      // 不返回敏感信息，只返回安全的用戶信息
    }
  });
});

// 測試諮詢次數查詢和扣減
router.get('/queries', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: '諮詢次數測試路由 - 獲取諮詢次數信息',
    data: {
      userId: req.user.id,
      remainingQueries: req.user.remainingQueries,
      totalConsultations: req.user.totalConsultations
    }
  });
});

// 測試諮詢次數限制中間件
router.get('/queries/check', protect, hasRemainingQueries, (req, res) => {
  res.status(200).json({
    success: true,
    message: '諮詢次數檢查通過 - 您有足夠的諮詢次數',
    data: {
      userId: req.user.id,
      remainingQueries: req.user.remainingQueries,
      totalConsultations: req.user.totalConsultations
    }
  });
});

/**
 * 直接测试N8N服务
 * POST /api/v1/test/n8n/direct
 */
router.post('/n8n/direct', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TEST_001',
          message: '测试消息不能为空'
        }
      });
    }
    
    logger.info('直接测试N8N服务开始', { 
      message: message.substring(0, 50) + '...',
      messageLength: message.length
    });
    
    // 构造测试上下文
    const testContext = {
      sessionId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'test_user',
      nickname: 'API Test User',
      recentMessages: []
    };
    
    // 调用N8N服务
    const startTime = Date.now();
    const response = await n8nService.sendToAI(message.trim(), testContext);
    const duration = Date.now() - startTime;
    
    logger.info('直接测试N8N服务完成', {
      sessionId: testContext.sessionId,
      duration,
      responseLength: response.content.length,
      hasReferences: response.references.length > 0
    });
    
    // 返回测试结果
    res.json({
      success: true,
      message: 'N8N直接测试完成',
      data: {
        input: message,
        output: response.content,
        references: response.references,
        processingTime: response.processingTime,
        testDuration: duration,
        qualityScore: response.qualityScore,
        sessionId: testContext.sessionId,
        timestamp: new Date().toISOString(),
        rawResponse: process.env.NODE_ENV === 'development' ? response.rawResponse : undefined
      }
    });
    
  } catch (error) {
    logger.error('直接测试N8N服务失败', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: {
        code: 'TEST_002',
        message: 'N8N测试调用失败',
        details: error.message
      }
    });
  }
});

/**
 * 检查N8N服务健康状态
 * GET /api/v1/test/n8n/health
 */
router.get('/n8n/health', async (req, res) => {
  try {
    logger.info('开始N8N健康检查');
    
    const isHealthy = await n8nService.healthCheck();
    const stats = n8nService.getStats();
    
    res.json({
      success: true,
      message: 'N8N健康检查完成',
      data: {
        isHealthy,
        status: isHealthy ? '✅ 服务正常' : '❌ 服务异常',
        stats,
        serviceUrl: process.env.N8N_WEBHOOK_URL || 'https://andyaiauto.zeabur.app/webhook/5cc76a7e-2e6a-4428-ba09-cbe8f8598f9b/chat',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logger.error('N8N健康检查失败', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: {
        code: 'TEST_003',
        message: 'N8N健康检查失败',
        details: error.message
      }
    });
  }
});

/**
 * ============================================================
 * 任务组5：专家咨询模块API测试
 * ============================================================
 */



/**
 * 任务5.1: 测试创建专家咨询申请 (支持游客)
 * POST /api/v1/test/expert-consultation/create
 */
router.post('/expert-consultation/create', async (req, res) => {
  try {
    const testData = {
      name: '測試用戶',
      phone: '0912345678',
      email: 'test@example.com',
      lineId: 'test_line_123',
      service: SERVICE_TYPES.LABOR_CONTRACT,
      details: '這是一個測試咨詢，我想了解勞動合同相關的法律問題。內容需要超過10個字符來通過驗證。',
      preferredContact: [CONTACT_METHODS.PHONE, CONTACT_METHODS.EMAIL],
      timeOfDay: 'morning',
      startTime: '09:00',
      endTime: '11:00'
    };

    // 模拟请求对象
    const mockReq = {
      body: testData,
      user: { id: 'guest', userType: 'guest' } // 模拟游客用户
    };

    const mockRes = {
      status: (code) => mockRes,
      json: (data) => {
        res.json({
          success: true,
          message: '專家咨詢創建測試完成',
          testResult: data,
          testData,
          timestamp: new Date().toISOString()
        });
      }
    };

    await ExpertConsultationController.createConsultation(mockReq, mockRes);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '專家咨詢創建測試失敗',
      error: error.message
    });
  }
});

/**
 * 任务5.2: 测试获取咨询列表 (管理员)
 * GET /api/v1/test/expert-consultation/admin-list
 */
router.get('/expert-consultation/admin-list', protect, isAdmin, async (req, res) => {
  try {
    // 模拟请求对象
    const mockReq = {
      query: {
        page: 1,
        limit: 5,
        status: STATUS_TYPES.PENDING
      },
      user: req.user // 使用真实的管理员用户
    };

    const mockRes = {
      json: (data) => {
        res.json({
          success: true,
          message: '管理員咨詢列表測試完成',
          testResult: data,
          timestamp: new Date().toISOString()
        });
      }
    };

    await ExpertConsultationController.getAdminConsultations(mockReq, mockRes);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '管理員咨詢列表測試失敗',
      error: error.message
    });
  }
});

/**
 * 任务5.3: 测试获取统计数据
 * GET /api/v1/test/expert-consultation/statistics
 */
router.get('/expert-consultation/statistics', protect, isAdmin, async (req, res) => {
  try {
    // 模拟请求对象
    const mockReq = {
      query: {},
      user: req.user // 使用真实的管理员用户
    };

    const mockRes = {
      json: (data) => {
        res.json({
          success: true,
          message: '咨詢統計數據測試完成',
          testResult: data,
          timestamp: new Date().toISOString()
        });
      }
    };

    await ExpertConsultationController.getStatistics(mockReq, mockRes);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '咨詢統計數據測試失敗',
      error: error.message
    });
  }
});

/**
 * 任务5.4: 测试数据库模型方法
 * GET /api/v1/test/expert-consultation/model-test
 */
router.get('/expert-consultation/model-test', async (req, res) => {
  try {
    // 测试创建咨询记录
    const testConsultation = new ExpertConsultation({
      user_id: 'test_user_123',
      name: '模型測試用戶',
      phone: '0987654321',
      email: 'modeltest@example.com',
      service_type: SERVICE_TYPES.COMPENSATION,
      details: '這是一個數據庫模型測試記錄，用於驗證所有字段和方法是否正常工作。',
      preferred_contact: [CONTACT_METHODS.EMAIL]
    });

    await testConsultation.save();

    // 测试查询方法
    const userConsultations = await ExpertConsultation.findByUser('test_user_123', { limit: 5 });
    const pendingConsultations = await ExpertConsultation.findByStatus(STATUS_TYPES.PENDING, { limit: 3 });
    const statistics = await ExpertConsultation.getStatistics();

    // 测试状态更新
    await testConsultation.updateStatus(STATUS_TYPES.PROCESSING, 'test_admin', '測試狀態更新');

    // 清理测试数据
    await ExpertConsultation.deleteOne({ id: testConsultation.id });

    res.json({
      success: true,
      message: '數據庫模型測試完成',
      testResults: {
        modelCreation: '✅ 模型創建成功',
        userQuery: `✅ 用戶查詢成功 (${userConsultations.length} 條記錄)`,
        statusQuery: `✅ 狀態查詢成功 (${pendingConsultations.length} 條記錄)`,
        statistics: '✅ 統計數據獲取成功',
        statusUpdate: '✅ 狀態更新成功',
        cleanup: '✅ 測試數據清理成功',
        statisticsData: statistics
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '數據庫模型測試失敗',
      error: error.message,
      stack: error.stack
    });
  }
});

/**
 * 任务5.5: 测试验证规则
 * POST /api/v1/test/expert-consultation/validation
 */
router.post('/expert-consultation/validation', async (req, res) => {
  try {
    const validTestData = {
      name: '驗證測試用戶',
      phone: '0912345678',
      email: 'validation@test.com',
      service: SERVICE_TYPES.WORKPLACE_SAFETY,
      details: '這是驗證規則測試，確保所有字段驗證都正常工作。',
      preferredContact: [CONTACT_METHODS.PHONE]
    };

    const invalidTestData = {
      name: '', // 空姓名 - 应该失败
      phone: '123', // 无效电话 - 应该失败
      email: 'invalid-email', // 无效邮箱 - 应该失败
      service: 'invalid_service', // 无效服务类型 - 应该失败
      details: '短', // 太短的详情 - 应该失败
      preferredContact: [] // 空联系方式 - 应该失败
    };

    res.json({
      success: true,
      message: '驗證規則測試完成',
      testData: {
        valid: validTestData,
        invalid: invalidTestData,
        serviceTypes: Object.values(SERVICE_TYPES),
        statusTypes: Object.values(STATUS_TYPES),
        contactMethods: Object.values(CONTACT_METHODS)
      },
      instructions: '請使用這些測試數據向 POST /api/v1/expert-consultations 發送請求來測試驗證規則',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '驗證規則測試失敗',
      error: error.message
    });
  }
});

export default router; 