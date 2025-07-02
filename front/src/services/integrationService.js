/**
 * 系統整合服務
 * 第六階段：系統整合與優化 - 統一協調層
 * 
 * 功能特性：
 * - 協調各服務間的交互
 * - 統一的初始化流程
 * - 性能監控集成
 * - 系統健康檢查
 * - 數據一致性保障
 * 
 * v1.0.0 - 2025-01-28
 */

import dataManager from './dataManager.js';
import offlineService from './offlineService.js';
import cacheService from './cacheService.js';
import performanceService from './performanceService.js';

/**
 * 系統整合服務類
 */
class IntegrationService {
  constructor() {
    this.isInitialized = false;
    this.services = {
      dataManager,
      offlineService,
      cacheService,
      performanceService
    };
    
    this.systemHealth = {
      overall: 'unknown',
      services: {},
      lastCheck: null
    };
  }

  /**
   * 初始化整合系統
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('🎯 系統整合服務已初始化');
      return true;
    }

    console.log('🚀 開始初始化系統整合服務...');
    
    const initMeasure = performanceService.startMeasure('system_initialization', 'system');
    
    try {
      // 1. 初始化性能監控（必須最先初始化）
      await this.initializePerformanceService();
      
      // 2. 初始化緩存服務
      await this.initializeCacheService();
      
      // 3. 初始化離線服務
      await this.initializeOfflineService();
      
      // 4. 初始化數據管理服務（依賴其他服務）
      await this.initializeDataManager();
      
      // 5. 系統健康檢查
      await this.performHealthCheck();
      
      // 6. 設置系統監控
      this.setupSystemMonitoring();
      
      this.isInitialized = true;
      
      performanceService.endMeasure(initMeasure, { 
        success: true,
        servicesCount: Object.keys(this.services).length
      });
      
      console.log('✅ 系統整合服務初始化完成');
      return true;
      
    } catch (error) {
      performanceService.endMeasure(initMeasure, { 
        success: false,
        error: error.message
      });
      
      console.error('❌ 系統整合服務初始化失敗:', error);
      return false;
    }
  }

  /**
   * 初始化性能服務
   */
  async initializePerformanceService() {
    try {
      console.log('📊 初始化性能監控服務...');
      
      // 性能服務通常是靜態方法，無需特殊初始化
      performanceService.startMeasure('service_init_performance', 'service_init');
      
      // 設置性能監控配置
      this.setupPerformanceConfig();
      
      performanceService.endMeasure('service_init_performance');
      console.log('✅ 性能監控服務初始化完成');
      
    } catch (error) {
      console.error('❌ 性能監控服務初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 初始化緩存服務
   */
  async initializeCacheService() {
    try {
      console.log('💾 初始化緩存服務...');
      
      const initMeasure = performanceService.startMeasure('service_init_cache', 'service_init');
      
      // 緩存清理
      cacheService.cleanup();
      
      // 緩存預熱（預加載常用數據）
      await this.prewarmCache();
      
      performanceService.endMeasure(initMeasure);
      console.log('✅ 緩存服務初始化完成');
      
    } catch (error) {
      console.error('❌ 緩存服務初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 初始化離線服務
   */
  async initializeOfflineService() {
    try {
      console.log('📱 初始化離線服務...');
      
      const initMeasure = performanceService.startMeasure('service_init_offline', 'service_init');
      
      // 離線服務有自己的初始化邏輯
      // 這裡主要是確認服務正常運行
      const offlineStats = offlineService.getStats();
      console.log('📱 離線服務狀態:', offlineStats);
      
      performanceService.endMeasure(initMeasure, { 
        offlineSupported: offlineStats.serviceWorkerSupported 
      });
      console.log('✅ 離線服務初始化完成');
      
    } catch (error) {
      console.error('❌ 離線服務初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 初始化數據管理服務
   */
  async initializeDataManager() {
    try {
      console.log('🗄️ 初始化數據管理服務...');
      
      const initMeasure = performanceService.startMeasure('service_init_data', 'service_init');
      
      // 數據管理服務有自己的初始化邏輯
      // 這裡主要是確認服務正常運行
      const dataStats = dataManager.getStats();
      console.log('🗄️ 數據管理服務狀態:', dataStats);
      
      performanceService.endMeasure(initMeasure, {
        isOnline: dataStats.isOnline,
        dataTypes: dataStats.dataTypes
      });
      console.log('✅ 數據管理服務初始化完成');
      
    } catch (error) {
      console.error('❌ 數據管理服務初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 緩存預熱
   */
  async prewarmCache() {
    try {
      console.log('🔥 開始緩存預熱...');
      
      // 預加載應用設置
      cacheService.set('app_initialized', true, 'APP_SETTINGS', 60000);
      
      // 預加載用戶偏好（如果用戶已登錄）
      const authToken = localStorage.getItem('auth_token');
      if (authToken) {
        cacheService.set('user_authenticated', true, 'USER_SESSION', 300000);
      }
      
      console.log('✅ 緩存預熱完成');
      
    } catch (error) {
      console.warn('⚠️ 緩存預熱失敗:', error);
    }
  }

  /**
   * 設置性能監控配置
   */
  setupPerformanceConfig() {
    // 設置性能監控閾值
    performanceService.setThresholds({
      api_call: 3000,      // API調用 3秒
      data_operation: 1000, // 數據操作 1秒
      ui_interaction: 500,  // UI交互 0.5秒
      service_init: 2000    // 服務初始化 2秒
    });
  }

  /**
   * 系統健康檢查
   */
  async performHealthCheck() {
    console.log('🔍 執行系統健康檢查...');
    
    const healthCheck = {
      timestamp: Date.now(),
      services: {},
      overall: 'healthy'
    };
    
    // 檢查各個服務
    try {
      // 檢查數據管理服務
      const dataStats = dataManager.getStats();
      healthCheck.services.dataManager = {
        status: dataStats.isOnline ? 'healthy' : 'degraded',
        details: dataStats
      };
      
      // 檢查離線服務
      const offlineStats = offlineService.getStats();
      healthCheck.services.offlineService = {
        status: 'healthy',
        details: offlineStats
      };
      
      // 檢查緩存服務
      const cacheStats = cacheService.getStats();
      healthCheck.services.cacheService = {
        status: 'healthy',
        details: cacheStats
      };
      
      // 檢查性能服務
      const performanceStats = performanceService.getStats();
      healthCheck.services.performanceService = {
        status: 'healthy',
        details: performanceStats
      };
      
      // 計算整體健康狀態
      const unhealthyServices = Object.values(healthCheck.services)
        .filter(service => service.status !== 'healthy');
      
      if (unhealthyServices.length === 0) {
        healthCheck.overall = 'healthy';
      } else if (unhealthyServices.length <= 1) {
        healthCheck.overall = 'degraded';
      } else {
        healthCheck.overall = 'unhealthy';
      }
      
    } catch (error) {
      console.error('❌ 健康檢查執行失敗:', error);
      healthCheck.overall = 'error';
      healthCheck.error = error.message;
    }
    
    this.systemHealth = healthCheck;
    console.log('🔍 系統健康檢查完成:', healthCheck.overall);
    
    return healthCheck;
  }

  /**
   * 設置系統監控
   */
  setupSystemMonitoring() {
    console.log('📊 設置系統監控...');
    
    // 定期健康檢查（每5分鐘）
    setInterval(() => {
      this.performHealthCheck();
    }, 5 * 60 * 1000);
    
    // 定期緩存清理（每30分鐘）
    setInterval(() => {
      cacheService.cleanup();
      if (dataManager.cleanupExpiredData) {
        dataManager.cleanupExpiredData();
      }
      if (offlineService.cleanupOfflineData) {
        offlineService.cleanupOfflineData();
      }
    }, 30 * 60 * 1000);
    
    // 性能報告（每10分鐘）
    setInterval(() => {
      const stats = this.getSystemStats();
      console.log('📊 系統性能報告:', stats);
      
      // 發送性能數據到監控服務（如果需要）
      this.reportPerformanceMetrics(stats);
    }, 10 * 60 * 1000);
    
    console.log('✅ 系統監控設置完成');
  }

  /**
   * 獲取系統統計數據
   */
  getSystemStats() {
    return {
      initialized: this.isInitialized,
      health: this.systemHealth,
      dataManager: dataManager.getStats(),
      offlineService: offlineService.getStats(),
      cacheService: cacheService.getStats(),
      performanceService: performanceService.getStats(),
      timestamp: Date.now()
    };
  }

  /**
   * 報告性能指標
   */
  reportPerformanceMetrics(stats) {
    // 檢查是否有性能問題
    const performanceIssues = [];
    
    // 檢查API響應時間
    const avgApiTime = stats.performanceService.averages?.api_call;
    if (avgApiTime && avgApiTime > 3000) {
      performanceIssues.push(`API響應時間過長: ${avgApiTime}ms`);
    }
    
    // 檢查緩存命中率
    const cacheHitRate = stats.cacheService.hitRate;
    if (cacheHitRate < 0.7) {
      performanceIssues.push(`緩存命中率過低: ${(cacheHitRate * 100).toFixed(1)}%`);
    }
    
    // 檢查同步隊列大小
    const syncQueueSize = stats.dataManager.syncQueueSize;
    if (syncQueueSize > 50) {
      performanceIssues.push(`同步隊列過大: ${syncQueueSize} 項目`);
    }
    
    if (performanceIssues.length > 0) {
      console.warn('⚠️ 發現性能問題:', performanceIssues);
    }
  }

  /**
   * 關閉系統整合服務
   */
  async shutdown() {
    console.log('🛑 關閉系統整合服務...');
    
    try {
      // 執行最後的數據同步
      if (dataManager.processSyncQueue) {
        await dataManager.processSyncQueue();
      }
      
      // 清理緩存
      cacheService.cleanup();
      
      // 執行離線數據清理
      if (offlineService.cleanupOfflineData) {
        await offlineService.cleanupOfflineData();
      }
      
      this.isInitialized = false;
      console.log('✅ 系統整合服務已關閉');
      
    } catch (error) {
      console.error('❌ 系統整合服務關閉時出錯:', error);
    }
  }
}

// 創建單例實例
const integrationService = new IntegrationService();

// 默認導出服務實例
export default integrationService; 