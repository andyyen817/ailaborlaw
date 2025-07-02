/**
 * 管理員認證服務
 * 處理管理員登入、登出和令牌刷新等功能
 */

import api from './api';

// 認證相關API端點
const ADMIN_AUTH_ENDPOINTS = {
  LOGIN: '/admin/auth/login',
  REFRESH_TOKEN: '/admin/auth/refresh-token',
  GET_ME: '/admin/auth/me'
};

// 本地存儲密鑰
const ADMIN_TOKEN_KEY = 'admin_access_token';
const ADMIN_REFRESH_TOKEN_KEY = 'admin_refresh_token';
const ADMIN_TOKEN_EXPIRES_KEY = 'admin_token_expires';
const ADMIN_DATA_KEY = 'admin_data';

// 令牌刷新配置
const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000; // 10分鐘，單位毫秒
let refreshTokenPromise = null; // 用於防止多次刷新請求

/**
 * 解析JWT令牌
 * @param {string} token - JWT令牌字符串
 * @returns {Object|null} - 解析後的JWT有效載荷或null
 */
function parseJwt(token) {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('JWT令牌解析失敗:', e);
    return null;
  }
}

/**
 * 管理員認證服務對象
 */
const adminAuthService = {
  /**
   * 管理員登入
   * @param {string} email - 管理員郵箱
   * @param {string} password - 管理員密碼
   * @returns {Promise<Object>} - 登入成功的管理員信息和令牌
   */
  async login(email, password) {
    try {
      const response = await api.post(ADMIN_AUTH_ENDPOINTS.LOGIN, { email, password });
      
      if (response.success && response.data) {
        const { admin, tokens } = response.data;
        
        // 保存令牌
        this.setTokens(tokens.access_token, tokens.refresh_token);
        
        // 保存管理員數據
        if (admin) {
          localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(admin));
        }
      }
      
      return response;
    } catch (error) {
      console.error('管理員登入失敗:', error);
      throw error;
    }
  },
  
  /**
   * 設置管理員令牌
   * @param {string} accessToken - 訪問令牌
   * @param {string} refreshToken - 刷新令牌
   */
  setTokens(accessToken, refreshToken) {
    if (!accessToken || !refreshToken) return;
    
    // 保存令牌
    localStorage.setItem(ADMIN_TOKEN_KEY, accessToken);
    localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, refreshToken);
    
    // 解析令牌獲取過期時間
    const payload = parseJwt(accessToken);
    if (payload && payload.exp) {
      const expiresAt = payload.exp * 1000; // 轉換為毫秒
      localStorage.setItem(ADMIN_TOKEN_EXPIRES_KEY, expiresAt.toString());
    }
  },
  
  /**
   * 管理員登出
   * @param {boolean} redirectToLogin - 是否重定向到登入頁
   */
  logout(redirectToLogin = false) {
    try {
      // 在清除本地存儲前先獲取當前路徑信息
      const isInAdminArea = window.location.pathname.startsWith('/admin');
      
      // 清除本地存儲的認證信息
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
      localStorage.removeItem(ADMIN_TOKEN_EXPIRES_KEY);
      localStorage.removeItem(ADMIN_DATA_KEY);
      
      console.log('管理員已登出，所有認證令牌已清除');
      
      // 觸發登出事件，通知其他組件
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin:logout', {
          detail: { redirected: redirectToLogin }
        }));
      }
      
      // 如果需要重定向到登入頁，不再使用window.location.assign
      // 而是回傳登出狀態，由調用者使用Vue Router進行導航
      return {
        success: true,
        shouldRedirect: redirectToLogin && isInAdminArea,
        redirectPath: '/admin/login'
      };
    } catch (error) {
      console.error('管理員登出過程發生錯誤:', error);
      // 即使出錯也嘗試清除令牌
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
      localStorage.removeItem(ADMIN_TOKEN_EXPIRES_KEY);
      localStorage.removeItem(ADMIN_DATA_KEY);
      
      return {
        success: false,
        error: error.message,
        shouldRedirect: false
      };
    }
  },
  
  /**
   * 獲取當前管理員信息
   * @returns {Object|null} - 管理員信息或null
   */
  getCurrentAdmin() {
    const adminData = localStorage.getItem(ADMIN_DATA_KEY);
    if (!adminData) return null;
    
    try {
      return JSON.parse(adminData);
    } catch (e) {
      console.error('解析管理員數據失敗:', e);
      return null;
    }
  },
  
  /**
   * 獲取訪問令牌
   * @returns {string|null} - 訪問令牌或null
   */
  getAccessToken() {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },
  
  /**
   * 獲取刷新令牌
   * @returns {string|null} - 刷新令牌或null
   */
  getRefreshToken() {
    return localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
  },
  
  /**
   * 獲取令牌過期時間
   * @returns {number|null} - 過期時間戳或null
   */
  getTokenExpiration() {
    const expiry = localStorage.getItem(ADMIN_TOKEN_EXPIRES_KEY);
    return expiry ? parseInt(expiry, 10) : null;
  },
  
  /**
   * 檢查令牌是否即將過期
   * @returns {boolean} - 是否即將過期
   */
  isTokenExpiringSoon() {
    const expiry = this.getTokenExpiration();
    if (!expiry) return true;
    
    return expiry - Date.now() < TOKEN_REFRESH_THRESHOLD;
  },
  
  /**
   * 檢查令牌是否已過期
   * @returns {boolean} - 是否已過期
   */
  isTokenExpired() {
    const expiry = this.getTokenExpiration();
    if (!expiry) return true;
    
    return expiry <= Date.now();
  },
  
  /**
   * 檢查管理員是否已認證
   * @returns {boolean} - 是否已認證
   */
  isAuthenticated() {
    return !!this.getAccessToken() && !this.isTokenExpired();
  },
  
  /**
   * 確保管理員已認證
   * @returns {Promise<boolean>} - 是否成功確保認證
   */
  async ensureAuthenticated() {
    if (!this.getAccessToken()) return false;
    
    // 如果令牌即將過期，嘗試刷新
    if (this.isTokenExpiringSoon()) {
      return await this.refreshTokenIfNeeded();
    }
    
    return !this.isTokenExpired();
  },
  
  /**
   * 檢查是否是超級管理員
   * @returns {boolean} - 是否是超級管理員
   */
  isSuperAdmin() {
    const admin = this.getCurrentAdmin();
    return admin && admin.role === 'super_admin';
  },
  
  /**
   * 如需要，刷新認證令牌
   * @returns {Promise<boolean>} - 是否成功刷新
   */
  async refreshTokenIfNeeded() {
    if (!this.getAccessToken() || !this.getRefreshToken()) return false;
    
    // 如果令牌未即將過期，不需要刷新
    if (!this.isTokenExpiringSoon()) return true;
    
    // 防止多次並發刷新請求
    if (refreshTokenPromise) {
      return refreshTokenPromise;
    }
    
    // 創建並緩存刷新請求
    refreshTokenPromise = this.refreshToken()
      .finally(() => {
        refreshTokenPromise = null;
      });
    
    return refreshTokenPromise;
  },
  
  /**
   * 刷新認證令牌
   * @returns {Promise<boolean>} - 是否成功刷新
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;
      
      const response = await api.post(ADMIN_AUTH_ENDPOINTS.REFRESH_TOKEN, {
        refresh_token: refreshToken
      });
      
      if (response.success && response.data && response.data.tokens) {
        this.setTokens(response.data.tokens.access_token, response.data.tokens.refresh_token);
        
        // 如果同時返回了更新的管理員資料，也一併更新
        if (response.data.admin) {
          localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(response.data.admin));
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('刷新管理員令牌失敗:', error);
      
      // 令牌刷新失敗，執行登出
      if (error.status === 401 || error.status === 403) {
        this.logout(true);
      }
      
      return false;
    }
  },
  
  /**
   * 獲取管理員詳細信息
   * @returns {Promise<Object>} - 管理員詳細信息
   */
  async getAdminDetails() {
    try {
      const response = await api.get(ADMIN_AUTH_ENDPOINTS.GET_ME);
      
      if (response.success && response.data && response.data.admin) {
        // 更新本地存儲的管理員信息
        localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(response.data.admin));
        return response.data.admin;
      }
      
      return null;
    } catch (error) {
      console.error('獲取管理員詳情失敗:', error);
      throw error;
    }
  }
};

export default adminAuthService; 