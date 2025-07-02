/**
 * 認證服務
 * 處理用戶註冊、登入、註銷等認證相關功能
 */

import api from './api';
// import { mockUserStore } from '@/store/mockUserStore'; // 注释掉模拟数据
import { normalizePassword, isEssentiallyEqual, isValidPassword } from '@/utils/stringUtils';

// 認證相關API端點
const AUTH_ENDPOINTS = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  REFRESH_TOKEN: '/auth/refresh-token',
  FORGOT_PASSWORD: '/auth/forgot-password'
};

// 本地存儲密鑰
const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRES_KEY = 'auth_token_expires';
const USER_KEY = 'auth_user';
const USER_ID_KEY = 'auth_user_id'; // 添加用户ID存储键，用于获取完整用户信息

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
    // 基本格式檢查
    if (!token.includes('.') || token.split('.').length !== 3) {
      // 處理測試令牌格式 (如 test_token_for_user_1)
      if (token.startsWith('test_token_for_user_')) {
        const userId = token.replace('test_token_for_user_', '');
        return { id: userId, exp: Date.now() + 24 * 60 * 60 * 1000 }; // 24小時過期
      }
      return null;
    }
    
    // 一般JWT格式
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload;
    
    if (typeof window !== 'undefined') {
      jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } else {
      // Node.js環境
      jsonPayload = Buffer.from(base64, 'base64').toString();
    }
    
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('JWT令牌解析失敗:', e);
    return null;
  }
}

/**
 * 認證服務對象
 */
const authService = {
  /**
   * 用戶註冊
   * @param {Object} userData - 用戶註冊數據
   * @returns {Promise<Object>} - 註冊成功的用戶信息
   */
  async register(userData) {
    try {
      // 使用實際後端API
      const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
      console.log('註冊API響應:', response);
      
      // 保存認證信息
      if (response.success && response.data) {
        this.setToken(response.data.token);
        
        // 保存用戶數據，確保正確提取
        if (response.data.user) {
          // 統一處理用戶數據格式，確保一致性
          const userData = {
            ...response.data.user,
            // 確保profile字段存在
            profile: response.data.user.profile || {}
          };
          
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
          
          // 額外保存用戶ID，用於路由等
          if (response.data.user.id) {
            localStorage.setItem(USER_ID_KEY, response.data.user.id);
          }
          
          console.log('註冊後保存的用戶數據:', userData);
        }
      }
      
      return response;
    } catch (error) {
      console.error('註冊失敗:', error);
      throw error;
    }
  },
  
  /**
   * 用戶登入
   * @param {string} email - 用戶郵箱
   * @param {string} password - 用戶密碼
   * @returns {Promise<Object>} - 登入成功的用戶信息和令牌
   */
  async login(email, password) {
    try {
      // 使用實際後端API
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, { email, password });
      console.log('登入API響應:', response);
      
      // 保存認證信息
      if (response.success && response.data) {
        this.setToken(response.data.token);
        
        // 保存用戶數據，確保正確提取
        if (response.data.user) {
          // 統一處理用戶數據格式，確保一致性
          const userData = {
            ...response.data.user,
            // 確保profile字段存在
            profile: response.data.user.profile || {}
          };
          
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
          
          // 額外保存用戶ID，用於路由等
          if (response.data.user.id) {
            localStorage.setItem(USER_ID_KEY, response.data.user.id);
          }
          
          console.log('登入後保存的用戶數據:', userData);
        }
      }
      
      return response;
    } catch (error) {
      console.error('登入失敗:', error);
      throw error;
    }
  },
  
  /**
   * 設置認證令牌
   * @param {string} token - JWT令牌
   */
  setToken(token) {
    if (!token) return;
    
    // 保存令牌
    localStorage.setItem(TOKEN_KEY, token);
    
    // 解析令牌獲取過期時間
    const payload = parseJwt(token);
    if (payload && payload.exp) {
      const expiresAt = payload.exp * 1000; // 轉換為毫秒
      localStorage.setItem(TOKEN_EXPIRES_KEY, expiresAt.toString());
    }
  },
  
  /**
   * 用戶註銷
   * @param {boolean} redirectToLogin - 是否重定向到登入頁
   */
  logout(redirectToLogin = false) {
    // 清除本地存儲的認證信息
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_ID_KEY); // 添加清除用戶ID
    
    // 如果需要，重定向到登入頁
    if (redirectToLogin && window.location.pathname !== '/login' && 
        window.location.pathname !== '/mobile/login') {
      // 判斷是否為移動端頁面
      if (window.location.pathname.startsWith('/mobile')) {
        window.location.href = '/mobile/login';
      } else {
        window.location.href = '/login';
      }
    }
  },
  
  /**
   * 獲取當前登入用戶信息
   * @returns {Object|null} - 當前用戶信息或null
   */
  getCurrentUser() {
    try {
      const userJson = localStorage.getItem(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('解析用戶數據失敗:', error);
      this.logout(); // 出錯時註銷
      return null;
    }
  },
  
  /**
   * 獲取當前登入用戶ID
   * @returns {string|null} - 當前用戶ID或null
   */
  getCurrentUserId() {
    try {
      // 首先嘗試從專門的USER_ID_KEY獲取
      const userId = localStorage.getItem(USER_ID_KEY);
      if (userId) {
        return userId;
      }
      
      // 如果沒有，從用戶對象中獲取
      const user = this.getCurrentUser();
      return user ? user.id : null;
    } catch (error) {
      console.error('獲取用戶ID失敗:', error);
      return null;
    }
  },
  
  /**
   * 獲取認證令牌
   * @returns {string|null} - 認證令牌或null
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  /**
   * 獲取令牌過期時間
   * @returns {number|null} - 過期時間戳(毫秒)或null
   */
  getTokenExpiration() {
    const expires = localStorage.getItem(TOKEN_EXPIRES_KEY);
    return expires ? parseInt(expires, 10) : null;
  },
  
  /**
   * 檢查令牌是否即將過期
   * @returns {boolean} - 是否即將過期
   */
  isTokenExpiringSoon() {
    const expiration = this.getTokenExpiration();
    if (!expiration) return false;
    
    return Date.now() > (expiration - TOKEN_REFRESH_THRESHOLD);
  },
  
  /**
   * 檢查令牌是否已過期
   * @returns {boolean} - 是否已過期
   */
  isTokenExpired() {
    const expiration = this.getTokenExpiration();
    if (!expiration) return true;
    
    return Date.now() >= expiration;
  },
  
  /**
   * 檢查用戶是否已認證
   * @returns {boolean} - 是否已認證
   */
  isAuthenticated() {
    return !!this.getToken() && !this.isTokenExpired();
  },
  
  /**
   * 確保用戶已認證（如果令牌即將過期則刷新）
   * @returns {Promise<boolean>} - 認證是否有效
   */
  async ensureAuthenticated() {
    if (!this.getToken()) return false;
    
    if (this.isTokenExpired()) {
      this.logout();
      return false;
    }
    
    if (this.isTokenExpiringSoon()) {
      try {
        await this.refreshTokenIfNeeded();
      } catch (error) {
        console.error('令牌刷新失敗:', error);
        if (error.status === 401) {
          this.logout();
          return false;
        }
      }
    }
    
    return true;
  },
  
  /**
   * 檢查當前用戶是否是管理員
   * @returns {boolean} - 是否是管理員
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.userType === 'admin';
  },
  
  /**
   * 檢查是否有特定權限
   * @param {string} permission - 權限名稱
   * @returns {boolean} - 是否有權限
   */
  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // 管理員擁有所有權限
    if (user.userType === 'admin') return true;
    
    // 基於用戶類型的權限檢查
    switch (permission) {
      case 'manage_consultations':
        return ['admin', 'hr'].includes(user.userType);
        
      case 'view_reports':
        return ['admin', 'hr', 'employer'].includes(user.userType);
        
      default:
        return false;
    }
  },
  
  /**
   * 如需要，刷新認證令牌
   * @returns {Promise<Object>} - 新的令牌
   */
  async refreshTokenIfNeeded() {
    // 如果令牌不存在或未即將過期，不需要刷新
    if (!this.getToken() || !this.isTokenExpiringSoon()) {
      return { success: true };
    }
    
    // 防止多次並發刷新請求
    if (refreshTokenPromise) {
      return refreshTokenPromise;
    }
    
    // 創建並緩存刷新請求
    refreshTokenPromise = this.refreshToken()
      .finally(() => {
        refreshTokenPromise = null; // 請求完成後清除緩存
      });
    
    return refreshTokenPromise;
  },
  
  /**
   * 刷新認證令牌
   * @returns {Promise<boolean>} - 刷新成功或失敗
   */
  async refreshToken() {
    // 防止多次同時刷新令牌
    if (refreshTokenPromise) {
      return refreshTokenPromise;
    }
    
    try {
      refreshTokenPromise = (async () => {
        const currentToken = this.getToken();
        if (!currentToken) return false;
        
        // 處理測試令牌
        if (currentToken.startsWith('test_token_for_user_')) {
          // 對於測試令牌，不需要實際調用後端，而是延長本地過期時間
          const userId = currentToken.replace('test_token_for_user_', '');
          const newExpiresTime = Date.now() + 24 * 60 * 60 * 1000; // 24小時
          localStorage.setItem(TOKEN_EXPIRES_KEY, newExpiresTime.toString());
          return true;
        }
        
        // 實際API刷新令牌
        try {
          const response = await api.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {
            token: currentToken
          });
          
          if (response.success && response.data && response.data.token) {
            this.setToken(response.data.token);
            
            // 如果同時返回了更新的用戶資料，也一併更新
            if (response.data.user) {
              localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
            }
            
            console.log('令牌刷新成功，新令牌过期时间:', this.getTokenExpiration());
            return true;
          }
          console.warn('令牌刷新API响应格式不正确', response);
          return false;
        } catch (error) {
          console.error('刷新令牌失敗:', error);
          
          // 針對不同錯誤類型進行處理
          if (error.status === 401) {
            // 令牌無效或已過期
            console.warn('認證令牌已過期或無效，執行登出');
            this.logout(false); // 不自動重定向
            
            // 触发全局认证失败事件
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth:unauthenticated', {
                detail: { source: 'refresh_token', message: '令牌已過期，請重新登入' }
              }));
            }
            return false;
          } else if (error.status === 403) {
            // 用戶被禁用或沒有權限
            console.warn('用戶無權限或已被禁用');
            this.logout(true); // 自動重定向到登入頁
            
            // 触发全局权限失败事件
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth:permission_denied', {
                detail: { source: 'refresh_token', message: '用戶無權限或已被禁用' }
              }));
            }
            return false;
          } else if (error.isNetworkError) {
            // 網絡錯誤，可能是暫時性問題
            console.warn('刷新令牌時發生網絡錯誤，暫時保留當前令牌');
            // 延長令牌有效期，允許用戶繼續使用一段時間
            const currentExpiry = this.getTokenExpiration() || Date.now() + 5 * 60 * 1000;
            const extendedExpiry = Math.max(currentExpiry, Date.now() + 5 * 60 * 1000); // 至少延長5分鐘
            localStorage.setItem(TOKEN_EXPIRES_KEY, extendedExpiry.toString());
            
            // 触发网络错误事件
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth:network_error', {
                detail: { source: 'refresh_token', message: '網絡連接問題，請檢查您的網絡' }
              }));
            }
            return true; // 返回成功，讓用戶可以繼續操作
          } else {
            // 其他未知錯誤
            console.error('令牌刷新發生未知錯誤', error);
            // 若令牌確實已過期，執行登出
            if (this.isTokenExpired()) {
              this.logout(false);
              
              // 触发认证错误事件
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('auth:error', {
                  detail: { source: 'refresh_token', message: '認證過程發生錯誤，請重新登入' }
                }));
              }
            }
            return false;
          }
        }
      })();
      
      const result = await refreshTokenPromise;
      refreshTokenPromise = null;
      return result;
    } catch (error) {
      console.error('刷新令牌過程出錯:', error);
      refreshTokenPromise = null;
      return false;
    }
  },
  
  /**
   * 更新用戶資料
   * @param {Object} userData - 用戶更新數據
   * @returns {Promise<Object>} - 更新後的用戶信息
   */
  async updateProfile(userData) {
    try {
      const response = await api.put('/users/profile', userData);
      
      if (response.success && response.data && response.data.user) {
        // 更新本地存儲的用戶信息
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }
      
      return response;
    } catch (error) {
      console.error('更新資料失敗:', error);
      throw error;
    }
  },
  
  /**
   * 更新用戶密碼
   * @param {string} currentPassword - 當前密碼
   * @param {string} newPassword - 新密碼
   * @returns {Promise<Object>} - 操作結果
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.put('/users/password', {
        currentPassword,
        newPassword
      });
      
      return response;
    } catch (error) {
      console.error('更新密碼失敗:', error);
      throw error;
    }
  },
  
  /**
   * 刪除用戶帳號
   * @returns {Promise<Object>} - 操作結果
   */
  async deleteAccount() {
    try {
      const response = await api.delete('/users/me');
      
      if (response.success) {
        this.logout(true);
      }
      
      return response;
    } catch (error) {
      console.error('刪除帳號失敗:', error);
      throw error;
    }
  },
  
  /**
   * 異步刷新用戶數據（更新本地緩存）
   * @param {string} userId - 用戶ID
   */
  async refreshUserDataAsync(userId) {
    try {
      // 這裡模擬從後端API獲取最新用戶數據
      const fullUserData = await mockUserStore.getUserById(userId);
      if (fullUserData) {
        // 更新本地存儲的用戶信息
        const updatedUserData = {
          id: fullUserData.id,
          email: fullUserData.email,
          name: fullUserData.name,
          userType: fullUserData.userType,
          occupation: fullUserData.occupation || '',
          industry: fullUserData.industry || '',
          company: fullUserData.companyName || '',
          phoneNumber: fullUserData.phoneNumber || '',
          remaining_free_queries: fullUserData.remainingQueries || 10
        };
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUserData));
      }
    } catch (error) {
      console.error('刷新用戶數據失敗:', error);
    }
  },
  
  /**
   * 忘記密碼
   * @param {string} email - 用戶郵箱
   * @returns {Promise<Object>} - 操作結果
   */
  async forgotPassword(email) {
    try {
      // 當後端API就緒時，將使用實際API
      // return await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      
      // 模擬API響應
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ 
            success: true, 
            message: '密碼重置連結已發送到您的郵箱'
          });
        }, 800);
      });
    } catch (error) {
      console.error('重置密碼請求失敗:', error);
      throw error;
    }
  },
  
  /**
   * 更新本地存儲的用戶數據
   * @param {Object} userData - 新的用戶數據
   */
  updateLocalUserData(userData) {
    if (!userData) return;
    
    try {
      // 獲取當前本地存儲的用戶數據
      const currentUser = this.getCurrentUser() || {};
      
      // 合併新舊數據，保留ID等重要信息
      const updatedUser = {
        ...currentUser,
        ...userData,
        // 確保profile字段存在並合併
        profile: {
          ...(currentUser.profile || {}),
          ...(userData.profile || {})
        }
      };
      
      // 保存更新後的用戶數據
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      console.log('本地用戶數據已更新:', updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('更新本地用戶數據失敗:', error);
      return null;
    }
  }
};

export default authService;
