const express = require('express');
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
const n8nService = require('../services/n8n.service.js');
const logger = require('../utils/logger.js');
// 浠诲姟缁?锛氫笓瀹跺挩璇㈡ā鍧楁祴璇曟墍闇€瀵煎叆
const ExpertConsultationController = require('../controllers/expert-consultation.controller.js');
import ExpertConsultation, { SERVICE_TYPES, STATUS_TYPES, CONTACT_METHODS } from '../models/expert_consultation.model.js';

const router = express.Router();

/**
 * 娓│璺敱
 * 鍩虹璺緫: /api/v1/test
 * 閫欎簺璺敱涓昏鐢ㄦ柤娓│瑾嶈瓑鍜屾瑠闄愪腑闁撲欢
 */

// 鍏叡璺敱 - 鐒￠渶瑾嶈瓑
router.get('/public', (req, res) => {
  res.status(200).json({
    success: true,
    message: '鍏叡璺敱瑷晱鎴愬姛 - 鐒￠渶瑾嶈瓑',
    data: { isAuthenticated: false }
  });
});

// 闇€瑕佽獚璀夌殑璺敱
router.get('/auth', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: '瑾嶈瓑璺敱瑷晱鎴愬姛 - 闇€瑕佹湁鏁堜护鐗?,
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

// 绠＄悊鍝¤鑹茶矾鐢?router.get('/admin', protect, isAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: '绠＄悊鍝¤矾鐢辫í鍟忔垚鍔?- 闇€瑕佺鐞嗗摗娆婇檺',
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

// HR瑙掕壊璺敱
router.get('/hr', protect, isHR, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HR璺敱瑷晱鎴愬姛 - 闇€瑕丠R娆婇檺',
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

// 闆囦富瑙掕壊璺敱
router.get('/employer', protect, isEmployer, (req, res) => {
  res.status(200).json({
    success: true,
    message: '闆囦富璺敱瑷晱鎴愬姛 - 闇€瑕侀泧涓绘瑠闄?,
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

// 鍝″伐瑙掕壊璺敱
router.get('/employee', protect, isEmployee, (req, res) => {
  res.status(200).json({
    success: true,
    message: '鍝″伐璺敱瑷晱鎴愬姛 - 闇€瑕佸摗宸ユ瑠闄?,
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

// 澶氳鑹茶矾鐢?(绠＄悊鍝℃垨HR)
router.get('/admin-hr', protect, hasRole(['admin', 'hr']), (req, res) => {
  res.status(200).json({
    success: true,
    message: '澶氳鑹茶矾鐢辫í鍟忔垚鍔?- 闇€瑕佺鐞嗗摗鎴朒R娆婇檺',
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

// 妾㈡煡璜娆℃暩璺敱
router.get('/check-queries', protect, hasRemainingQueries, (req, res) => {
  res.status(200).json({
    success: true,
    message: '璜娆℃暩妾㈡煡閫氶亷 - 鏈夎冻澶犵殑璜娆℃暩',
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

// 娓│妯℃摤鐢ㄦ埗璩囨簮璺敱 - 娓│ isSelfOrAdmin 涓枔浠?router.get('/users/:userId/profile', protect, isSelfOrAdmin(), (req, res) => {
  res.status(200).json({
    success: true,
    message: '鐢ㄦ埗璩囨簮瑷晱鎴愬姛 - 鍙兘瑷晱鑷繁鐨勮硣婧愭垨绠＄悊鍝″彲瑷晱鎵€鏈夎硣婧?,
    data: {
      requestedUserId: req.params.userId,
      currentUserId: req.user.id,
      isAdmin: req.user.userType === 'admin',
      accessType: req.user.id === req.params.userId ? 'self' : 'admin'
    }
  });
});

// 娓│浠ょ墝淇℃伅璺敱 - 鏌ョ湅鐣跺墠浠ょ墝涓寘鍚殑淇℃伅
router.get('/token-info', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: '浠ょ墝淇℃伅鐛插彇鎴愬姛',
    data: {
      user: req.user,
      // 涓嶈繑鍥炴晱鎰熶俊鎭紝鍙繑鍥炲畨鍏ㄧ殑鐢ㄦ埗淇℃伅
    }
  });
});

// 娓│璜娆℃暩鏌ヨ鍜屾墸娓?router.get('/queries', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: '璜娆℃暩娓│璺敱 - 鐛插彇璜娆℃暩淇℃伅',
    data: {
      userId: req.user.id,
      remainingQueries: req.user.remainingQueries,
      totalConsultations: req.user.totalConsultations
    }
  });
});

// 娓│璜娆℃暩闄愬埗涓枔浠?router.get('/queries/check', protect, hasRemainingQueries, (req, res) => {
  res.status(200).json({
    success: true,
    message: '璜娆℃暩妾㈡煡閫氶亷 - 鎮ㄦ湁瓒冲鐨勮瑭㈡鏁?,
    data: {
      userId: req.user.id,
      remainingQueries: req.user.remainingQueries,
      totalConsultations: req.user.totalConsultations
    }
  });
});

/**
 * 鐩存帴娴嬭瘯N8N鏈嶅姟
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
          message: '娴嬭瘯娑堟伅涓嶈兘涓虹┖'
        }
      });
    }
    
    logger.info('鐩存帴娴嬭瘯N8N鏈嶅姟寮€濮?, { 
      message: message.substring(0, 50) + '...',
      messageLength: message.length
    });
    
    // 鏋勯€犳祴璇曚笂涓嬫枃
    const testContext = {
      sessionId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'test_user',
      nickname: 'API Test User',
      recentMessages: []
    };
    
    // 璋冪敤N8N鏈嶅姟
    const startTime = Date.now();
    const response = await n8nService.sendToAI(message.trim(), testContext);
    const duration = Date.now() - startTime;
    
    logger.info('鐩存帴娴嬭瘯N8N鏈嶅姟瀹屾垚', {
      sessionId: testContext.sessionId,
      duration,
      responseLength: response.content.length,
      hasReferences: response.references.length > 0
    });
    
    // 杩斿洖娴嬭瘯缁撴灉
    res.json({
      success: true,
      message: 'N8N鐩存帴娴嬭瘯瀹屾垚',
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
    logger.error('鐩存帴娴嬭瘯N8N鏈嶅姟澶辫触', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: {
        code: 'TEST_002',
        message: 'N8N娴嬭瘯璋冪敤澶辫触',
        details: error.message
      }
    });
  }
});

/**
 * 妫€鏌8N鏈嶅姟鍋ュ悍鐘舵€? * GET /api/v1/test/n8n/health
 */
router.get('/n8n/health', async (req, res) => {
  try {
    logger.info('寮€濮婲8N鍋ュ悍妫€鏌?);
    
    const isHealthy = await n8nService.healthCheck();
    const stats = n8nService.getStats();
    
    res.json({
      success: true,
      message: 'N8N鍋ュ悍妫€鏌ュ畬鎴?,
      data: {
        isHealthy,
        status: isHealthy ? '鉁?鏈嶅姟姝ｅ父' : '鉂?鏈嶅姟寮傚父',
        stats,
        serviceUrl: process.env.N8N_WEBHOOK_URL || 'https://andyaiauto.zeabur.app/webhook/5cc76a7e-2e6a-4428-ba09-cbe8f8598f9b/chat',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logger.error('N8N鍋ュ悍妫€鏌ュけ璐?, {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: {
        code: 'TEST_003',
        message: 'N8N鍋ュ悍妫€鏌ュけ璐?,
        details: error.message
      }
    });
  }
});

/**
 * ============================================================
 * 浠诲姟缁?锛氫笓瀹跺挩璇㈡ā鍧桝PI娴嬭瘯
 * ============================================================
 */



/**
 * 浠诲姟5.1: 娴嬭瘯鍒涘缓涓撳鍜ㄨ鐢宠 (鏀寔娓稿)
 * POST /api/v1/test/expert-consultation/create
 */
router.post('/expert-consultation/create', async (req, res) => {
  try {
    const testData = {
      name: '娓│鐢ㄦ埗',
      phone: '0912345678',
      email: 'test@example.com',
      lineId: 'test_line_123',
      service: SERVICE_TYPES.LABOR_CONTRACT,
      details: '閫欐槸涓€鍊嬫脯瑭﹀挩瑭紝鎴戞兂浜嗚В鍕炲嫊鍚堝悓鐩搁棞鐨勬硶寰嬪晱椤屻€傚収瀹归渶瑕佽秴閬?0鍊嬪瓧绗︿締閫氶亷椹楄瓑銆?,
      preferredContact: [CONTACT_METHODS.PHONE, CONTACT_METHODS.EMAIL],
      timeOfDay: 'morning',
      startTime: '09:00',
      endTime: '11:00'
    };

    // 妯℃嫙璇锋眰瀵硅薄
    const mockReq = {
      body: testData,
      user: { id: 'guest', userType: 'guest' } // 妯℃嫙娓稿鐢ㄦ埛
    };

    const mockRes = {
      status: (code) => mockRes,
      json: (data) => {
        res.json({
          success: true,
          message: '灏堝鍜ㄨ鍓靛缓娓│瀹屾垚',
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
      message: '灏堝鍜ㄨ鍓靛缓娓│澶辨晽',
      error: error.message
    });
  }
});

/**
 * 浠诲姟5.2: 娴嬭瘯鑾峰彇鍜ㄨ鍒楄〃 (绠＄悊鍛?
 * GET /api/v1/test/expert-consultation/admin-list
 */
router.get('/expert-consultation/admin-list', protect, isAdmin, async (req, res) => {
  try {
    // 妯℃嫙璇锋眰瀵硅薄
    const mockReq = {
      query: {
        page: 1,
        limit: 5,
        status: STATUS_TYPES.PENDING
      },
      user: req.user // 浣跨敤鐪熷疄鐨勭鐞嗗憳鐢ㄦ埛
    };

    const mockRes = {
      json: (data) => {
        res.json({
          success: true,
          message: '绠＄悊鍝″挩瑭㈠垪琛ㄦ脯瑭﹀畬鎴?,
          testResult: data,
          timestamp: new Date().toISOString()
        });
      }
    };

    await ExpertConsultationController.getAdminConsultations(mockReq, mockRes);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '绠＄悊鍝″挩瑭㈠垪琛ㄦ脯瑭﹀け鏁?,
      error: error.message
    });
  }
});

/**
 * 浠诲姟5.3: 娴嬭瘯鑾峰彇缁熻鏁版嵁
 * GET /api/v1/test/expert-consultation/statistics
 */
router.get('/expert-consultation/statistics', protect, isAdmin, async (req, res) => {
  try {
    // 妯℃嫙璇锋眰瀵硅薄
    const mockReq = {
      query: {},
      user: req.user // 浣跨敤鐪熷疄鐨勭鐞嗗憳鐢ㄦ埛
    };

    const mockRes = {
      json: (data) => {
        res.json({
          success: true,
          message: '鍜ㄨ绲辫▓鏁告摎娓│瀹屾垚',
          testResult: data,
          timestamp: new Date().toISOString()
        });
      }
    };

    await ExpertConsultationController.getStatistics(mockReq, mockRes);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '鍜ㄨ绲辫▓鏁告摎娓│澶辨晽',
      error: error.message
    });
  }
});

/**
 * 浠诲姟5.4: 娴嬭瘯鏁版嵁搴撴ā鍨嬫柟娉? * GET /api/v1/test/expert-consultation/model-test
 */
router.get('/expert-consultation/model-test', async (req, res) => {
  try {
    // 娴嬭瘯鍒涘缓鍜ㄨ璁板綍
    const testConsultation = new ExpertConsultation({
      user_id: 'test_user_123',
      name: '妯″瀷娓│鐢ㄦ埗',
      phone: '0987654321',
      email: 'modeltest@example.com',
      service_type: SERVICE_TYPES.COMPENSATION,
      details: '閫欐槸涓€鍊嬫暩鎿氬韩妯″瀷娓│瑷橀寗锛岀敤鏂奸璀夋墍鏈夊瓧娈靛拰鏂规硶鏄惁姝ｅ父宸ヤ綔銆?,
      preferred_contact: [CONTACT_METHODS.EMAIL]
    });

    await testConsultation.save();

    // 娴嬭瘯鏌ヨ鏂规硶
    const userConsultations = await ExpertConsultation.findByUser('test_user_123', { limit: 5 });
    const pendingConsultations = await ExpertConsultation.findByStatus(STATUS_TYPES.PENDING, { limit: 3 });
    const statistics = await ExpertConsultation.getStatistics();

    // 娴嬭瘯鐘舵€佹洿鏂?    await testConsultation.updateStatus(STATUS_TYPES.PROCESSING, 'test_admin', '娓│鐙€鎱嬫洿鏂?);

    // 娓呯悊娴嬭瘯鏁版嵁
    await ExpertConsultation.deleteOne({ id: testConsultation.id });

    res.json({
      success: true,
      message: '鏁告摎搴ā鍨嬫脯瑭﹀畬鎴?,
      testResults: {
        modelCreation: '鉁?妯″瀷鍓靛缓鎴愬姛',
        userQuery: `鉁?鐢ㄦ埗鏌ヨ鎴愬姛 (${userConsultations.length} 姊濊閷?`,
        statusQuery: `鉁?鐙€鎱嬫煡瑭㈡垚鍔?(${pendingConsultations.length} 姊濊閷?`,
        statistics: '鉁?绲辫▓鏁告摎鐛插彇鎴愬姛',
        statusUpdate: '鉁?鐙€鎱嬫洿鏂版垚鍔?,
        cleanup: '鉁?娓│鏁告摎娓呯悊鎴愬姛',
        statisticsData: statistics
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '鏁告摎搴ā鍨嬫脯瑭﹀け鏁?,
      error: error.message,
      stack: error.stack
    });
  }
});

/**
 * 浠诲姟5.5: 娴嬭瘯楠岃瘉瑙勫垯
 * POST /api/v1/test/expert-consultation/validation
 */
router.post('/expert-consultation/validation', async (req, res) => {
  try {
    const validTestData = {
      name: '椹楄瓑娓│鐢ㄦ埗',
      phone: '0912345678',
      email: 'validation@test.com',
      service: SERVICE_TYPES.WORKPLACE_SAFETY,
      details: '閫欐槸椹楄瓑瑕忓墖娓│锛岀⒑淇濇墍鏈夊瓧娈甸璀夐兘姝ｅ父宸ヤ綔銆?,
      preferredContact: [CONTACT_METHODS.PHONE]
    };

    const invalidTestData = {
      name: '', // 绌哄鍚?- 搴旇澶辫触
      phone: '123', // 鏃犳晥鐢佃瘽 - 搴旇澶辫触
      email: 'invalid-email', // 鏃犳晥閭 - 搴旇澶辫触
      service: 'invalid_service', // 鏃犳晥鏈嶅姟绫诲瀷 - 搴旇澶辫触
      details: '鐭?, // 澶煭鐨勮鎯?- 搴旇澶辫触
      preferredContact: [] // 绌鸿仈绯绘柟寮?- 搴旇澶辫触
    };

    res.json({
      success: true,
      message: '椹楄瓑瑕忓墖娓│瀹屾垚',
      testData: {
        valid: validTestData,
        invalid: invalidTestData,
        serviceTypes: Object.values(SERVICE_TYPES),
        statusTypes: Object.values(STATUS_TYPES),
        contactMethods: Object.values(CONTACT_METHODS)
      },
      instructions: '璜嬩娇鐢ㄩ€欎簺娓│鏁告摎鍚?POST /api/v1/expert-consultations 鐧奸€佽珛姹備締娓│椹楄瓑瑕忓墖',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '椹楄瓑瑕忓墖娓│澶辨晽',
      error: error.message
    });
  }
});

module.exports = router; 

