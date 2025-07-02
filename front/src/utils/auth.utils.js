/**
 * 認證工具函數
 * 提供權限檢查和認證相關的輔助功能
 */
import authService from '@/services/auth';
import adminAuthService from '@/services/adminAuth';

/**
 * 檢查用戶是否有指定權限
 * @param {string|string[]} requiredPermissions - 需要的權限或權限列表
 * @returns {boolean} - 用戶是否具有需要的權限
 */
export function hasPermission(requiredPermissions) {
  // 首先檢查用戶是否已認證
  if (!authService.isAuthenticated()) {
    return false;
  }
  
  // 如果沒有指定權限要求，則視為只需登入
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }
  
  // 確保輸入權限為數組
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];
  
  // 管理員具有所有權限
  if (authService.isAdmin()) {
    return true;
  }
  
  // 檢查用戶是否具有所需權限
  for (const permission of permissions) {
    if (!authService.hasPermission(permission)) {
      return false;
    }
  }
  
  return true;
}

/**
 * 初始化認證系統
 * @returns {Promise<boolean>} - 初始化成功或失敗
 */
export async function initAuth() {
  try {
    // 檢查並刷新令牌
    await authService.ensureAuthenticated();
    return true;
  } catch (error) {
    console.error('認證初始化失敗:', error);
    return false;
  }
}

/**
 * 初始化管理員認證系統
 * @returns {Promise<boolean>} - 初始化成功或失敗
 */
export async function initAdminAuth() {
  try {
    // 檢查並刷新管理員令牌
    await adminAuthService.ensureAuthenticated();
    return true;
  } catch (error) {
    console.error('管理員認證初始化失敗:', error);
    return false;
  }
}

/**
 * 權限驗證守衛函數，用於Vue Router
 * @param {object} to - 目標路由
 * @param {object} from - 來源路由
 * @param {function} next - 導航函數
 */
export function authGuard(to, from, next) {
  // 初始化認證
  return Promise.all([
    initAuth(),       // 普通用戶認證初始化
    initAdminAuth()   // 管理員認證初始化
  ]).then(() => {
    // 檢查路由是否需要認證
    const requiresAuth = to.matched.some(route => route.meta.requiresAuth);
    
    // 檢查路由是否需要管理員權限
    const requiresAdmin = to.matched.some(route => route.meta.requiresAdmin);
    
    // 檢查路由是否需要超級管理員權限
    const requiresSuperAdmin = to.matched.some(route => route.meta.requiresSuperAdmin);
    
    // 檢查路由是否是公開路由
    const isPublicRoute = to.matched.some(route => route.meta.public);
    
    // 獲取需要的權限
    const requiredPermissions = to.meta.permissions || [];
    
    // 檢查普通用戶認證
    const isAuthenticated = authService.isAuthenticated();
    
    // 檢查管理員認證
    const isAdminAuthenticated = adminAuthService.isAuthenticated();
    const isSuperAdmin = adminAuthService.isSuperAdmin();
    
    // 從localStorage獲取當前用戶資訊
    const currentUser = authService.getCurrentUser();
    const currentAdmin = adminAuthService.getCurrentAdmin();
    
    // 記錄導航數據（僅在開發環境）
    if (import.meta.env.DEV) {
      console.log('路由守衛數據:', {
        to: to.fullPath,
        from: from.fullPath,
        requiresAuth,
        requiresAdmin,
        requiresSuperAdmin,
        isPublicRoute,
        isAuthenticated,
        isAdminAuthenticated,
        isSuperAdmin,
        requiredPermissions,
        currentUser: currentUser ? {
          id: currentUser.id,
          email: currentUser.email, 
          userType: currentUser.userType
        } : null,
        currentAdmin: currentAdmin ? {
          id: currentAdmin.id,
          email: currentAdmin.email,
          role: currentAdmin.role
        } : null
      });
    }
    
    // 🔧 修復：開發環境路由優先通過
    const isDevRoute = to.matched.some(route => route.meta.dev === true);
    if (isDevRoute) {
      next();
      return;
    }
    
    // 如果是公開路由，直接通過
    if (isPublicRoute) {
      next();
      return;
    }
    
    // 🔧 修復：管理員路由的認證處理 - 優先檢查管理員認證
    if (requiresAdmin) {
      // 如果需要管理員權限但未認證
      if (!isAdminAuthenticated) {
        console.warn('訪問管理員頁面需要管理員認證');
        next({
          path: '/admin/login',
          query: { 
            redirect: to.fullPath,
            auth_error: 'admin_required'
          }
        });
        return;
      }
      
      // 如果需要超級管理員權限但用戶不是超級管理員
      if (requiresSuperAdmin && !isSuperAdmin) {
        console.warn('訪問此頁面需要超級管理員權限');
        
        // 觸發權限不足事件
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('admin:permission_denied', {
            detail: { 
              source: 'router',
              requiredRole: 'super_admin',
              message: '此頁面需要超級管理員權限' 
            }
          }));
        }
        
        // 跳轉到管理員首頁
        next({ path: '/admin' });
        return;
      }
      
      // 管理員認證通過
      next();
      return;
    }
    
    // 🔧 修復：普通用户路由的認證處理 - 只有非管理员路由才检查普通用户认证
    if (requiresAuth && !requiresAdmin) {
      // 如果路由需要登入，但用戶未登入
      if (!isAuthenticated) {
        console.warn('訪問受保護路由需要登入');
        
        // 決定跳轉到哪個登入頁面
        const loginPath = to.path.startsWith('/mobile') ? '/mobile/login' : '/login';
        
        // 保存原目標路徑
        next({
          path: loginPath,
          query: { 
            redirect: to.fullPath,
            auth_error: 'required' // 添加錯誤參數，告知用戶需要登入
          }
        });
        return;
      }
    }
    
    // 檢查具體權限
    if (requiredPermissions.length > 0 && !hasPermission(requiredPermissions)) {
      console.warn('用戶缺少所需權限:', requiredPermissions);
      
      // 觸發權限不足事件
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:permission_denied', {
          detail: { 
            source: 'router',
            requiredPermissions,
            message: '您沒有訪問此頁面的必要權限' 
          }
        }));
      }
      
      // 無權限，跳轉到首頁或其他適當頁面
      const homePath = to.path.startsWith('/mobile') ? '/mobile' : '/';
      next({ path: homePath });
      return;
    }
    
    // 通過所有檢查，允許導航
    next();
  }).catch(error => {
    // 認證過程出錯
    console.error('路由守衛認證過程出錯:', error);
    
    // 觸發認證錯誤事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:error', {
        detail: { 
          source: 'router_guard', 
          message: '認證服務暫時不可用，請稍後再試' 
        }
      }));
    }
    
    // 发生错误时，根据路由类型决定重定向
    if (to.matched.some(route => route.meta.requiresAdmin)) {
      // 管理员路由错误，重定向到管理员登录页
      next({
        path: '/admin/login',
        query: { 
          redirect: to.fullPath,
          auth_error: 'system_error'
        }
      });
    } else {
      // 普通用户路由错误，重定向到普通登录页
      const loginPath = to.path.startsWith('/mobile') ? '/mobile/login' : '/login';
      next({
        path: loginPath,
        query: { 
          redirect: to.fullPath,
          auth_error: 'system_error'
        }
      });
    }
  });
}

export default {
  hasPermission,
  initAuth,
  initAdminAuth,
  authGuard
}; 