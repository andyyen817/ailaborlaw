/**
 * 統一數據管理服務
 * 第六階段：系統整合與優化 - 核心數據管理層
 * 
 * 功能特性：
 * - API優先，localStorage作為降級方案
 * - 智能緩存和數據同步
 * - 統一的數據格式和錯誤處理
 * - 離線支持和數據一致性保障
 * 
 * v1.0.0 - 2025-01-28
 */

import cacheService from './cacheService.js';
import performanceService from './performanceService.js';
import api from './api.js';
import adminAuthService from './adminAuth.js';

// 數據類型定義
const DATA_TYPES = {
  // 用戶相關
  USER_PROFILE: 'user_profile',
  USER_SESSION: 'user_session',
  
  // 專家諮詢
  CONSULTATION_REQUESTS: 'consultation_requests',
  CONSULTATION_STATS: 'consultation_stats',
  
  // 勞工顧問
  LABOR_ADVISORS: 'labor_advisors',
  ADVISOR_ASSIGNMENTS: 'advisor_assignments',
  
  // 聊天相關
  CHAT_SESSIONS: 'chat_sessions',
  CHAT_HISTORY: 'chat_history',
  
  // 系統配置
  APP_SETTINGS: 'app_settings',
  USER_PREFERENCES: 'user_preferences'
};

// 同步策略配置
const SYNC_STRATEGIES = {
  API_FIRST: 'api_first',           // API優先，失敗時使用本地數據
  LOCAL_FIRST: 'local_first',       // 本地優先，定期同步到API
  REAL_TIME: 'real_time',           // 實時同步，每次操作都同步
  OFFLINE_QUEUE: 'offline_queue'    // 離線隊列，網絡恢復時批量同步
};

// 數據類型配置
const DATA_CONFIGS = {
  [DATA_TYPES.USER_PROFILE]: {
    storageKey: 'auth_user',
    apiEndpoint: '/user/profile',
    syncStrategy: SYNC_STRATEGIES.API_FIRST,
    cacheTTL: 60 * 60 * 1000, // 1小時
    requiresAuth: true
  },
  
  [DATA_TYPES.CONSULTATION_REQUESTS]: {
    storageKey: 'consultationRequests',
    apiEndpoint: '/expert-consultations',
    syncStrategy: SYNC_STRATEGIES.API_FIRST,
    cacheTTL: 5 * 60 * 1000, // 5分鐘
    requiresAuth: true
  },
  
  [DATA_TYPES.LABOR_ADVISORS]: {
    storageKey: 'laborAdvisors',
    apiEndpoint: '/labor-advisors',
    syncStrategy: SYNC_STRATEGIES.API_FIRST,
    cacheTTL: 30 * 60 * 1000, // 30分鐘
    requiresAuth: true
  },
  
  [DATA_TYPES.CHAT_HISTORY]: {
    storageKey: 'chat_history',
    apiEndpoint: '/chat/history',
    syncStrategy: SYNC_STRATEGIES.LOCAL_FIRST,
    cacheTTL: 10 * 60 * 1000, // 10分鐘
    requiresAuth: true
  },
  
  [DATA_TYPES.APP_SETTINGS]: {
    storageKey: 'app_settings',
    apiEndpoint: '/settings',
    syncStrategy: SYNC_STRATEGIES.LOCAL_FIRST,
    cacheTTL: 24 * 60 * 60 * 1000, // 24小時
    requiresAuth: false
  }
};

/**
 * 統一數據管理服務類
 */
class DataManager {
  constructor() {
    this.syncQueue = new Map(); // 待同步的操作隊列
    this.isOnline = navigator.onLine;
    this.syncInProgress = new Set(); // 正在同步的數據類型
    
    // 監聽網絡狀態
    this.initNetworkListeners();
    
    // 定期同步數據
    this.startSyncTimer();
  }

  /**
   * 獲取數據 - 統一入口
   * @param {string} dataType - 數據類型
   * @param {Object} options - 選項
   * @returns {Promise<any>} 數據
   */
  async getData(dataType, options = {}) {
    const config = DATA_CONFIGS[dataType];
    if (!config) {
      throw new Error(`未知的數據類型: ${dataType}`);
    }

    const measureId = performanceService.startMeasure(`getData_${dataType}`, 'data_operation');
    
    try {
      // 檢查緩存
      const cacheKey = this.generateCacheKey(dataType, options);
      let cachedData = cacheService.get(cacheKey, dataType);
      
      if (cachedData && !options.forceRefresh) {
        console.log(`🎯 數據緩存命中: ${dataType}`);
        performanceService.endMeasure(measureId, { source: 'cache' });
        return cachedData;
      }

      let data = null;
      
      // 根據同步策略獲取數據
      switch (config.syncStrategy) {
        case SYNC_STRATEGIES.API_FIRST:
          data = await this.getDataApiFirst(dataType, config, options);
          break;
          
        case SYNC_STRATEGIES.LOCAL_FIRST:
          data = await this.getDataLocalFirst(dataType, config, options);
          break;
          
        case SYNC_STRATEGIES.REAL_TIME:
          data = await this.getDataRealTime(dataType, config, options);
          break;
          
        default:
          data = await this.getDataApiFirst(dataType, config, options);
      }

      // 緩存數據
      if (data) {
        cacheService.set(cacheKey, data, dataType, config.cacheTTL);
      }

      performanceService.endMeasure(measureId, { 
        source: 'api',
        dataSize: JSON.stringify(data || {}).length 
      });
      
      return data;
    } catch (error) {
      performanceService.endMeasure(measureId, { 
        source: 'error',
        error: error.message 
      });
      
      console.error(`❌ 獲取數據失敗 (${dataType}):`, error);
      throw error;
    }
  }

  /**
   * 設置數據 - 統一入口
   * @param {string} dataType - 數據類型
   * @param {any} data - 數據
   * @param {Object} options - 選項
   * @returns {Promise<boolean>} 是否成功
   */
  async setData(dataType, data, options = {}) {
    const config = DATA_CONFIGS[dataType];
    if (!config) {
      throw new Error(`未知的數據類型: ${dataType}`);
    }

    const measureId = performanceService.startMeasure(`setData_${dataType}`, 'data_operation');
    
    try {
      let success = false;
      
      // 根據同步策略設置數據
      switch (config.syncStrategy) {
        case SYNC_STRATEGIES.API_FIRST:
          success = await this.setDataApiFirst(dataType, data, config, options);
          break;
          
        case SYNC_STRATEGIES.LOCAL_FIRST:
          success = await this.setDataLocalFirst(dataType, data, config, options);
          break;
          
        case SYNC_STRATEGIES.REAL_TIME:
          success = await this.setDataRealTime(dataType, data, config, options);
          break;
          
        case SYNC_STRATEGIES.OFFLINE_QUEUE:
          success = await this.setDataOfflineQueue(dataType, data, config, options);
          break;
          
        default:
          success = await this.setDataApiFirst(dataType, data, config, options);
      }

      // 更新緩存
      if (success) {
        const cacheKey = this.generateCacheKey(dataType, options);
        cacheService.set(cacheKey, data, dataType, config.cacheTTL);
      }

      performanceService.endMeasure(measureId, { 
        success,
        dataSize: JSON.stringify(data || {}).length 
      });
      
      return success;
    } catch (error) {
      performanceService.endMeasure(measureId, { 
        success: false,
        error: error.message 
      });
      
      console.error(`❌ 設置數據失敗 (${dataType}):`, error);
      return false;
    }
  }

  /**
   * API優先策略：先嘗試API，失敗後使用本地數據
   */
  async getDataApiFirst(dataType, config, options) {
    // 🔧 修复：将isAdminEndpoint移到函数开始处，确保整个函数作用域内可访问
    const isAdminEndpoint = options.endpoint && options.endpoint.includes('/admin/');
    
    try {
      console.log(`🌐 API優先策略獲取數據: ${dataType}`);
      
      let apiOptions = { ...options };
      
      // 🔧 为管理员端点添加正确的认证头和认证验证
      if (isAdminEndpoint) {
        console.log('🔐 检测到管理员端点，验证认证状态...');
        
        // 🔧 修复：先检查认证状态，确保token有效
        if (!adminAuthService.isAuthenticated()) {
          console.warn('❌ 管理员认证已失效');
          throw new Error('管理員認證已過期，請重新登入');
        }
        
        // 🔧 修复：确保token刷新
        const ensureAuthResult = await adminAuthService.ensureAuthenticated();
        if (!ensureAuthResult) {
          console.warn('❌ 管理员认证确保失败');
          throw new Error('管理員認證確保失敗，請重新登入');
        }
        
        const adminToken = adminAuthService.getAccessToken();
        if (!adminToken) {
          console.warn('❌ 未找到管理员访问令牌');
          throw new Error('未找到管理員認證令牌');
        }
        
        // 🔧 修复：设置正确的认证头
        apiOptions.headers = {
          ...apiOptions.headers,
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        };
        
        console.log('🔐 使用管理员认证调用API:', options.endpoint);
        console.log('🔐 认证头已设置，token长度:', adminToken.length);
      }
      
      // 使用自定義端點或配置中的端點
      const endpoint = options.endpoint || config.apiEndpoint;
      const response = await this.callAPI('GET', endpoint, null, apiOptions);
      
      if (response && response.success) {
        console.log(`✅ API獲取數據成功: ${dataType}`);
        
        // 將數據保存到本地存儲作為備份
        this.setLocalStorage(config.storageKey, response.data);
        
        return response.data;
      } else {
        throw new Error('API響應失敗');
      }
    } catch (error) {
      console.warn(`⚠️ API獲取數據失敗，嘗試本地數據: ${dataType}`, error);
      
      // 🔧 修复：增强认证错误处理，减少过度清理
      if (isAdminEndpoint && (
        error.message.includes('管理員認證') || 
        error.message.includes('認證令牌') ||
        error.message.includes('登入已過期') ||
        error.status === 401
      )) {
        console.error('❌ 管理员认证失败:', error.message);
        
        // 🔧 修复：增加重试机制，避免立即清除认证状态
        if (!options.isRetry) {
          console.log('🔄 认证失败，尝试重新获取token并重试...');
          
          try {
            // 尝试刷新token
            const refreshResult = await adminAuthService.refreshTokenIfNeeded();
            if (refreshResult) {
              console.log('✅ Token刷新成功，重试API调用...');
              
              // 重新获取token并重试
              const newToken = adminAuthService.getAccessToken();
              if (newToken) {
                const retryOptions = {
                  ...options,
                  isRetry: true,
                  headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${newToken}`,
                    'Content-Type': 'application/json'
                  }
                };
                
                // 递归重试（仅一次）
                return await this.getDataApiFirst(dataType, config, retryOptions);
              }
            }
          } catch (refreshError) {
            console.warn('❌ Token刷新失败:', refreshError.message);
          }
        }
        
        // 🔧 修复：只有在重试也失败后才考虑清除认证状态
        console.warn('⚠️ 认证重试失败，但不立即清除认证状态，等待用户手动处理');
        
        // 🔧 修复：抛出友好的认证错误，不回退到本地数据
        throw new Error('管理員認證失效，請嘗試刷新頁面或重新登入');
      }
      
      // 🔧 修复：对于非认证错误，尝试使用本地数据
      const localData = this.getLocalStorage(config.storageKey);
      if (localData) {
        console.log(`🔄 使用本地數據: ${dataType}`);
        return localData;
      }
      
      throw error;
    }
  }

  /**
   * 本地優先獲取數據
   */
  async getDataLocalFirst(dataType, config, options) {
    // 優先使用本地數據
    const localData = this.getLocalStorage(config.storageKey);
    
    // 如果沒有本地數據，或者強制刷新，則從API獲取
    if (!localData || options.forceRefresh) {
      try {
        if (this.isOnline && config.apiEndpoint) {
          // 允許options中覆蓋endpoint
          const endpoint = options.endpoint || config.apiEndpoint;
          const response = await this.callAPI('GET', endpoint, null, options);
          if (response && response.success) {
            this.setLocalStorage(config.storageKey, response.data);
            return response.data;
          }
        }
      } catch (error) {
        console.warn(`⚠️ API同步失敗，使用本地數據 (${dataType}):`, error.message);
      }
    }

    return localData;
  }

  /**
   * 實時獲取數據
   */
  async getDataRealTime(dataType, config, options) {
    if (!this.isOnline || !config.apiEndpoint) {
      return this.getLocalStorage(config.storageKey);
    }

    try {
      // 允許options中覆蓋endpoint
      const endpoint = options.endpoint || config.apiEndpoint;
      const response = await this.callAPI('GET', endpoint, null, options);
      if (response && response.success) {
        this.setLocalStorage(config.storageKey, response.data);
        return response.data;
      }
    } catch (error) {
      console.warn(`⚠️ 實時獲取失敗，使用本地數據 (${dataType}):`, error.message);
    }

    return this.getLocalStorage(config.storageKey);
  }

  /**
   * API優先設置數據
   */
  async setDataApiFirst(dataType, data, config, options) {
    // 🔧 修复：记录API调用状态
    let apiSuccess = false;
    let localSuccess = false;
    
    try {
      // 🔧 修复：先尝试API调用，记录结果
      if (this.isOnline && config.apiEndpoint) {
        const method = options.method || 'POST';
        // 允許options中覆蓋endpoint
        const endpoint = options.endpoint || config.apiEndpoint;
        const response = await this.callAPI(method, endpoint, data, options);
        
        if (response && response.success) {
          apiSuccess = true;
          console.log(`✅ API同步成功 (${dataType})`);
          
          // API成功后再保存到本地作为缓存
          localSuccess = this.setLocalStorage(config.storageKey, data);
          
          return true; // API成功，返回真正的成功
        } else {
          throw new Error('API響應失敗');
        }
      } else {
        // 離線狀態或無API端點
        console.warn(`⚠️ 離線狀態或無API端點，僅保存到本地 (${dataType})`);
        localSuccess = this.setLocalStorage(config.storageKey, data);
        this.addToSyncQueue(dataType, data, options);
        
        // 🔧 修复：离线状态下明确返回false，表示未真正提交到服务器
        return false;
      }
      
    } catch (error) {
      console.warn(`⚠️ API調用失敗 (${dataType}):`, error.message);
      
      // 🔧 修复：API失败时，保存到本地但返回失败状态
      localSuccess = this.setLocalStorage(config.storageKey, data);
      this.addToSyncQueue(dataType, data, options);
      
      // 🔧 修复：抛出错误而不是返回true，让调用者知道API失败了
      const enhancedError = new Error(`API提交失败: ${error.message}`);
      enhancedError.originalError = error;
      enhancedError.localSaved = localSuccess;
      enhancedError.needsSync = true;
      throw enhancedError;
    }
  }

  /**
   * 本地優先設置數據
   */
  async setDataLocalFirst(dataType, data, config, options) {
    // 立即保存到本地
    this.setLocalStorage(config.storageKey, data);
    
    // 後台同步到API（非阻塞）
    if (this.isOnline && config.apiEndpoint) {
      this.backgroundSync(dataType, data, config, options);
    } else {
      this.addToSyncQueue(dataType, data, options);
    }

    return true;
  }

  /**
   * 實時設置數據
   */
  async setDataRealTime(dataType, data, config, options) {
    if (!this.isOnline || !config.apiEndpoint) {
      this.setLocalStorage(config.storageKey, data);
      this.addToSyncQueue(dataType, data, options);
      return true;
    }

    try {
      const method = options.method || 'POST';
      const response = await this.callAPI(method, config.apiEndpoint, data, options);
      
      if (response && response.success) {
        this.setLocalStorage(config.storageKey, data);
        return true;
      }
    } catch (error) {
      console.warn(`⚠️ 實時同步失敗 (${dataType}):`, error.message);
      this.setLocalStorage(config.storageKey, data);
      this.addToSyncQueue(dataType, data, options);
    }

    return true;
  }

  /**
   * 離線隊列設置數據
   */
  async setDataOfflineQueue(dataType, data, config, options) {
    // 保存到本地
    this.setLocalStorage(config.storageKey, data);
    
    // 添加到同步隊列
    this.addToSyncQueue(dataType, data, options);

    return true;
  }

  /**
   * 調用API
   */
  async callAPI(method, endpoint, data, options) {
    const upperMethod = method.toUpperCase();
    
    try {
      let response;
      
      switch (upperMethod) {
        case 'GET':
          response = await api.get(endpoint, options);
          break;
        case 'POST':
          response = await api.post(endpoint, data, options);
          break;
        case 'PUT':
          response = await api.put(endpoint, data, options);
          break;
        case 'DELETE':
          response = await api.delete(endpoint, options);
          break;
        default:
          throw new Error(`不支援的HTTP方法: ${method}`);
      }
      
      return response;
    } catch (error) {
      console.error(`❌ API調用失敗 (${upperMethod} ${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * 本地存儲操作
   */
  getLocalStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`❌ 讀取本地存儲失敗 (${key}):`, error);
      return null;
    }
  }

  setLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`❌ 保存本地存儲失敗 (${key}):`, error);
      return false;
    }
  }

  /**
   * 添加到同步隊列
   */
  addToSyncQueue(dataType, data, options) {
    const queueItem = {
      dataType,
      data,
      options,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.syncQueue.set(`${dataType}_${Date.now()}`, queueItem);
    console.log(`📁 添加到同步隊列: ${dataType}`);
  }

  /**
   * 後台同步
   */
  async backgroundSync(dataType, data, config, options) {
    try {
      const method = options.method || 'POST';
      const response = await this.callAPI(method, config.apiEndpoint, data, options);
      
      if (response && response.success) {
        console.log(`🔄 後台同步成功 (${dataType})`);
      }
    } catch (error) {
      console.warn(`⚠️ 後台同步失敗 (${dataType}):`, error.message);
      this.addToSyncQueue(dataType, data, options);
    }
  }

  /**
   * 處理同步隊列
   */
  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.size === 0) {
      return;
    }

    console.log(`🔄 開始處理同步隊列 (${this.syncQueue.size} 項)`);
    
    const maxRetries = 3;
    const itemsToRemove = [];

    for (const [queueId, item] of this.syncQueue.entries()) {
      if (this.syncInProgress.has(item.dataType)) {
        continue; // 跳過正在同步的類型
      }

      this.syncInProgress.add(item.dataType);
      
      try {
        const config = DATA_CONFIGS[item.dataType];
        if (!config || !config.apiEndpoint) {
          itemsToRemove.push(queueId);
          continue;
        }

        const method = item.options.method || 'POST';
        const response = await this.callAPI(method, config.apiEndpoint, item.data, item.options);
        
        if (response && response.success) {
          console.log(`✅ 隊列同步成功: ${item.dataType}`);
          itemsToRemove.push(queueId);
        } else {
          throw new Error('API響應失敗');
        }
      } catch (error) {
        console.warn(`⚠️ 隊列同步失敗 (${item.dataType}):`, error.message);
        
        item.retryCount++;
        if (item.retryCount >= maxRetries) {
          console.error(`❌ 隊列項超過最大重試次數，移除: ${item.dataType}`);
          itemsToRemove.push(queueId);
        }
      } finally {
        this.syncInProgress.delete(item.dataType);
      }
    }

    // 移除已處理的項目
    itemsToRemove.forEach(queueId => {
      this.syncQueue.delete(queueId);
    });

    console.log(`🔄 同步隊列處理完成，移除 ${itemsToRemove.length} 項`);
  }

  /**
   * 生成緩存鍵
   */
  generateCacheKey(dataType, options) {
    const baseKey = dataType;
    const optionsKey = Object.keys(options).length > 0 
      ? `_${JSON.stringify(options)}` 
      : '';
    
    return `${baseKey}${optionsKey}`;
  }

  /**
   * 初始化網絡監聽器
   */
  initNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 網絡已連接');
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      console.log('📵 網絡已斷開');
      this.isOnline = false;
    });
  }

  /**
   * 啟動同步定時器
   */
  startSyncTimer() {
    // 每30秒檢查一次同步隊列
    setInterval(() => {
      if (this.isOnline && this.syncQueue.size > 0) {
        this.processSyncQueue();
      }
    }, 30000);
  }

  /**
   * 清理過期數據
   */
  cleanupExpiredData() {
    const now = Date.now();
    const expiredThreshold = 7 * 24 * 60 * 60 * 1000; // 7天

    // 清理過期的同步隊列項目
    for (const [queueId, item] of this.syncQueue.entries()) {
      if (now - item.timestamp > expiredThreshold) {
        this.syncQueue.delete(queueId);
        console.log(`🗑️ 清理過期同步項目: ${item.dataType}`);
      }
    }
  }

  /**
   * 獲取數據管理統計
   */
  getStats() {
    return {
      isOnline: this.isOnline,
      syncQueueSize: this.syncQueue.size,
      syncInProgress: Array.from(this.syncInProgress),
      cacheStats: cacheService.getStats(),
      dataTypes: Object.keys(DATA_CONFIGS).length
    };
  }
}

// 創建單例實例
const dataManager = new DataManager();

// 數據類型常量導出
export { DATA_TYPES, SYNC_STRATEGIES };

// 默認導出服務實例
export default dataManager; 