/**
 * 認證初始化工具
 * 用於在應用啟動時初始化認證狀態
 */

import userStore from '@/store/user';
import authService from '@/services/auth';

/**
 * 初始化應用認證狀態
 * @returns {Promise<boolean>} 初始化結果
 */
export async function initializeAuth() {
  try {
    console.log('🔐 初始化認證狀態...');
    
    // 從本地存儲加載用戶數據
    userStore.initialize();
    
    // 如果有令牌，確保它是有效的
    if (authService.getToken()) {
      // 檢查令牌是否過期或即將過期
      console.log('📝 檢查令牌狀態...');
      const isValid = await authService.ensureAuthenticated();
      
      if (!isValid) {
        console.log('⚠️ 令牌無效或已過期，執行登出操作');
        userStore.logout(false); // 不重定向
        return false;
      }
      
      console.log('✅ 認證狀態有效');
      return true;
    }
    
    console.log('ℹ️ 未找到認證令牌');
    return false;
  } catch (error) {
    console.error('❌ 初始化認證狀態時出錯:', error);
    userStore.logout(false); // 不重定向
    return false;
  }
}

/**
 * 設置令牌監控，定期檢查令牌狀態
 */
export function setupTokenMonitor() {
  // 每5分鐘檢查一次令牌狀態
  const INTERVAL = 5 * 60 * 1000; // 5分鐘
  
  // 定期檢查令牌是否即將過期
  setInterval(async () => {
    try {
      if (authService.isAuthenticated() && authService.isTokenExpiringSoon()) {
        console.log('🔄 令牌即將過期，嘗試刷新...');
        await authService.refreshTokenIfNeeded();
      }
    } catch (error) {
      console.error('❌ 令牌監控出錯:', error);
    }
  }, INTERVAL);
}

/**
 * 初始化認證監聽器，處理跨標籤頁同步
 */
export function setupAuthListeners() {
  // 監聽存儲變更事件，處理跨標籤頁登入/登出同步
  window.addEventListener('storage', (event) => {
    // 🔧 修复：检查当前页面类型，避免跨系统影响
    const currentPath = window.location.pathname;
    const isAdminPage = currentPath.startsWith('/admin');
    const isMobilePage = currentPath.startsWith('/mobile');
    
    // 當認證令牌在其他標籤頁被移除時，同步登出當前頁面
    if (event.key === 'auth_token' && !event.newValue) {
      console.log('🔔 檢測到其他標籤頁登出，同步登出當前頁面');
      
      // 🔧 修复：只有非管理员页面才执行用户登出同步
      if (!isAdminPage) {
        userStore.logout(false); // 不重定向，避免頁面跳轉
      } else {
        console.log('🔒 管理员页面忽略用户端登出同步');
      }
    }
    
    // 當認證令牌在其他標籤頁被設置時，同步更新當前頁面
    if (event.key === 'auth_token' && event.newValue && !authService.isAuthenticated()) {
      console.log('🔔 檢測到其他標籤頁登入，同步更新當前頁面');
      
      // 🔧 修复：只有非管理员页面才执行用户登录同步
      if (!isAdminPage) {
        userStore.initialize();
      } else {
        console.log('🔒 管理员页面忽略用户端登录同步');
      }
    }
    
    // 🔧 新增：管理员token的独立同步处理
    if (event.key === 'admin_token' && !event.newValue) {
      console.log('🔔 檢測到其他標籤頁管理員登出');
      
      // 只有管理员页面才执行管理员登出同步
      if (isAdminPage) {
        // 触发管理员登出事件，但不直接操作
        window.dispatchEvent(new CustomEvent('admin:logout_sync', {
          detail: { source: 'cross_tab' }
        }));
      }
    }
    
    if (event.key === 'admin_token' && event.newValue) {
      console.log('🔔 檢測到其他標籤頁管理員登入');
      
      // 只有管理员页面才执行管理员登录同步  
      if (isAdminPage) {
        window.dispatchEvent(new CustomEvent('admin:login_sync', {
          detail: { source: 'cross_tab' }
        }));
      }
    }
  });
}

/**
 * 一站式初始化認證系統
 * @returns {Promise<boolean>} 初始化結果
 */
export async function setupAuth() {
  // 初始化認證狀態
  const result = await initializeAuth();
  
  // 設置令牌監控
  setupTokenMonitor();
  
  // 設置認證監聽器
  setupAuthListeners();
  
  return result;
}

export default {
  initializeAuth,
  setupTokenMonitor,
  setupAuthListeners,
  setupAuth
}; 