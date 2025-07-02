/**
 * API服務配置
 * 提供與後端API通信的基礎服務
 */

// 🔧 環境感知的API配置 - 支援開發/生產環境分離
// 開發環境使用代理，生產環境使用完整URL
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;
const appEnv = import.meta.env.VITE_APP_ENV || (isDevelopment ? 'development' : 'production');

let API_BASE_URL;
if (isDevelopment) {
  // 🔧 开发环境强制使用本地API，忽略环境变量中的生产URL
  API_BASE_URL = 'http://localhost:7070/api/v1';
  console.log('🔧 开发环境强制使用本地API:', API_BASE_URL);
} else {
  // 生產環境：使用環境變量或默認本地API（因為已遷移到本地開發）
  API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7070/api/v1';
}

// 網絡錯誤重試配置
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 毫秒

// 🔧 環境感知的配置 - 從環境變量讀取
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || (import.meta.env.DEV ? 30000 : 60000);
const ENABLE_API_LOGS = import.meta.env.VITE_ENABLE_API_LOGS === 'true';
const ENABLE_DEBUG = import.meta.env.VITE_ENABLE_DEBUG === 'true';

// 📊 環境配置資訊 (開發環境下顯示)
if (import.meta.env.DEV || ENABLE_DEBUG) {
  console.group('🔧 API 配置資訊');
  console.log('🌐 環境:', appEnv);
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('⏱️  請求超時:', API_TIMEOUT + 'ms');
  console.log('📝 API 日誌:', ENABLE_API_LOGS ? '開啟' : '關閉');
  console.log('🐛 除錯模式:', ENABLE_DEBUG ? '開啟' : '關閉');
  console.groupEnd();
}

// 性能監控和緩存服務導入
let performanceService = null;
let cacheService = null;
try {
  performanceService = (await import('./performanceService.js')).default;
  cacheService = (await import('./cacheService.js')).default;
} catch (e) {
  // 服務不可用時靜默失敗
}

/**
 * 延遲函數
 * @param {number} ms - 延遲毫秒數
 * @returns {Promise<void>}
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 根據請求路徑獲取合適的認證頭
 * @param {string} url - 請求路徑
 * @returns {string|null} - 認證頭或null
 */
const getAuthHeader = (url) => {
  // 管理員API請求（包括邀請管理API）
  if (url.startsWith('/admin') || url.includes('/admin/')) {
    const adminToken = localStorage.getItem('admin_access_token');
    if (adminToken) {
      return `Bearer ${adminToken}`;
    }
  } else {
    // 普通用戶API請求
    const userToken = localStorage.getItem('auth_token');
    if (userToken) {
      return `Bearer ${userToken}`;
    }
  }
  
  return null;
};

/**
 * 基礎請求方法，處理fetch請求
 * @param {string} url - API端點路徑
 * @param {Object} options - 請求選項
 * @param {number} retryCount - 當前重試次數
 * @returns {Promise<any>} - 請求結果Promise
 */
async function request(url, options = {}, retryCount = 0) {
  const startTime = performance.now();
  const method = options.method || 'GET';
  
  // 檢查緩存 (僅GET請求)
  if (cacheService && method === 'GET') {
    const cachedResponse = cacheService.get(url, method, options.params);
    if (cachedResponse) {
      if (ENABLE_API_LOGS || ENABLE_DEBUG) {
        console.log(`💾 緩存命中: ${method} ${url}`);
      }
      return cachedResponse;
    }
  }
  
  try {
    // 準備請求URL，處理查詢參數
    let requestUrl = `${API_BASE_URL}${url}`;
    
    // 如果是GET請求並且有params參數，將其轉換為查詢字符串
    if (options.method === 'GET' && options.params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        requestUrl += `?${queryString}`;
      }
    }
    
    // 默認請求頭
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // 添加認證令牌，根據路徑選擇合適的令牌
    const authHeader = getAuthHeader(url);
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // 發起請求 - 環境感知的日誌輸出
    if (ENABLE_API_LOGS || ENABLE_DEBUG) {
      console.log(`🌐 發送請求到: ${requestUrl}`);
    }
    const response = await fetch(requestUrl, {
      ...options,
      headers,
      // 添加超時控制
      signal: options.signal || (options.timeout ? AbortSignal.timeout(options.timeout) : undefined)
    });
    
    // 解析響應數據 - 增加安全检查
    let data;
    try {
      const responseText = await response.text();
      if (!responseText.trim()) {
        throw new Error('服务器返回空响应');
      }
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON解析错误:', parseError);
      throw new Error(`服务器响应格式错误: ${parseError.message}`);
    }
    
    // 檢查響應狀態
    if (!response.ok) {
      // 創建自定義錯誤對象
      const apiError = new Error(data.message || data.error?.message || '請求失敗');
      apiError.status = response.status;
      apiError.data = data;
      apiError.code = data.error?.code;
      
      // 處理特定的認證相關錯誤
      if (response.status === 401) {
        // 區分登錄失敗和令牌過期
        if (data.error?.code === 'INVALID_CREDENTIALS') {
          // 登錄憑證錯誤（密碼/郵箱錯誤）- 保留後端原始錯誤信息
          apiError.code = 'INVALID_CREDENTIALS';
          apiError.message = data.error?.message || data.message || '郵箱或密碼錯誤';
        } else {
          // 令牌失效或其他認證問題
          apiError.code = apiError.code || 'UNAUTHENTICATED';
          apiError.message = data.error?.message || data.message || '您的登入已過期，請重新登入';
          
          // 只有在非登錄請求的認證失敗時才觸發事件
          if (typeof window !== 'undefined' && !url.includes('/auth/login')) {
            // 區分管理員和普通用戶的認證失敗
            const eventName = url.startsWith('/admin') ? 'admin:unauthenticated' : 'auth:unauthenticated';
            window.dispatchEvent(new CustomEvent(eventName, {
              detail: { source: 'api', url }
            }));
          }
        }
      } else if (response.status === 403) {
        // 權限不足
        apiError.code = apiError.code || 'PERMISSION_DENIED';
        apiError.message = '您沒有權限執行此操作';
        
        // 觸發權限錯誤事件，區分管理員和普通用戶
        if (typeof window !== 'undefined') {
          const eventName = url.startsWith('/admin') ? 'admin:permission_denied' : 'auth:permission_denied';
          window.dispatchEvent(new CustomEvent(eventName, {
            detail: { source: 'api', url, requiredPermission: data.error?.requiredPermission }
          }));
        }
      } else if (response.status === 404) {
        // 資源不存在
        apiError.code = apiError.code || 'NOT_FOUND';
        apiError.message = '請求的資源不存在';
      } else if (response.status === 409) {
        // 資源衝突（如註冊時郵箱已存在）
        apiError.code = apiError.code || 'CONFLICT';
        apiError.message = data.message || '資源衝突，操作無法完成';
      } else if (response.status >= 500) {
        // 伺服器錯誤
        apiError.code = apiError.code || 'SERVER_ERROR';
        apiError.message = '伺服器暫時無法處理您的請求，請稍後再試';
      }
      
      throw apiError;
    }
    
    // 記錄成功的API性能
    if (performanceService && startTime) {
      const duration = performance.now() - startTime;
      performanceService.recordUserInteraction('api_success', {
        url: requestUrl,
        method: method,
        duration: duration,
        status: response.status
      });
    }
    
    // 設置緩存 (僅GET請求的成功響應)
    if (cacheService && method === 'GET' && response.status >= 200 && response.status < 300) {
      cacheService.set(url, method, options.params, data, response.status);
    }
    
    return data;
  } catch (error) {
    // 網絡錯誤處理和重試邏輯
    if (
      (error.name === 'TypeError' && error.message === 'Failed to fetch' || 
       error.name === 'AbortError' || 
       error instanceof DOMException) && 
      retryCount < MAX_RETRIES
    ) {
      console.warn(`📡 網絡請求失敗，正在重試 (${retryCount + 1}/${MAX_RETRIES})...`);
      await delay(RETRY_DELAY * (retryCount + 1));
      return request(url, options, retryCount + 1);
    }
    
    // 記錄錯誤的API性能
    if (performanceService && startTime) {
      const duration = performance.now() - startTime;
      performanceService.recordUserInteraction('api_error', {
        url: `${API_BASE_URL}${url}`,
        method: options.method || 'GET',
        duration: duration,
        status: error.status || 0,
        error: error.message,
        retryCount
      });
      performanceService.recordError('api_request', error, {
        url: `${API_BASE_URL}${url}`,
        method: options.method || 'GET',
        retryCount
      });
    }
    
    // 錯誤增強，添加更多上下文信息
    console.error('API請求錯誤:', {
      url: `${API_BASE_URL}${url}`,
      method: options.method || 'GET',
      status: error.status,
      message: error.message,
      code: error.code,
      retryCount
    });
    
    // 將錯誤標準化為前端可理解的格式
    const enhancedError = new Error(error.message || '網絡請求失敗');
    enhancedError.originalError = error;
    enhancedError.status = error.status || 0;
    enhancedError.isNetworkError = error.name === 'TypeError' && error.message === 'Failed to fetch';
    enhancedError.isTimeoutError = error.name === 'AbortError';
    enhancedError.code = error.code;
    enhancedError.data = error.data;
    
    // 添加容器環境特定的錯誤診斷信息
    if (enhancedError.isNetworkError) {
      enhancedError.message = '無法連接到API服務器。請確認網絡連接或聯繫系統管理員。';
      enhancedError.containerHelp = '這可能是由於前後端容器間通信問題導致，請檢查API基礎URL配置是否正確。';
      enhancedError.diagnosticInfo = {
        apiBaseUrl: API_BASE_URL,
        targetEndpoint: url,
        containerNetwork: true,
        timeStamp: new Date().toISOString()
      };
      console.info('容器網絡連接診斷信息:', {
        apiBaseUrl: API_BASE_URL,
        fullUrl: `${API_BASE_URL}${url}`,
        possibleIssue: '容器間DNS解析或網絡連接問題',
        corsProblem: error.message.includes('CORS'),
        timeStamp: new Date().toISOString(),
        retryCount
      });
    }
    
    throw enhancedError;
  }
}

/**
 * HTTP請求方法
 */
export default {
  /**
   * GET請求
   * @param {string} url - API端點
   * @param {Object} options - 請求選項
   * @returns {Promise<any>}
   */
  get(url, options = {}) {
    return request(url, {
      method: 'GET',
      timeout: API_TIMEOUT,
      ...options
    });
  },
  
  /**
   * POST請求
   * @param {string} url - API端點
   * @param {Object} data - 請求數據
   * @param {Object} options - 請求選項
   * @returns {Promise<any>}
   */
  post(url, data = {}, options = {}) {
    return request(url, {
      method: 'POST',
      body: JSON.stringify(data),
      timeout: API_TIMEOUT,
      ...options
    });
  },
  
  /**
   * PUT請求
   * @param {string} url - API端點
   * @param {Object} data - 請求數據
   * @param {Object} options - 請求選項
   * @returns {Promise<any>}
   */
  put(url, data = {}, options = {}) {
    return request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      timeout: API_TIMEOUT,
      ...options
    });
  },
  
  /**
   * DELETE請求
   * @param {string} url - API端點
   * @param {Object} options - 請求選項
   * @returns {Promise<any>}
   */
  delete(url, options = {}) {
    return request(url, {
      method: 'DELETE',
      timeout: API_TIMEOUT,
      ...options
    });
  }
}; 