/**
 * 權限檢查工具
 * 根據用戶類型和權限控制功能訪問
 */

import authService from '@/services/auth';

/**
 * 權限定義
 * 將功能權限與用戶類型映射
 */
const PERMISSIONS = {
  // 用戶管理權限
  MANAGE_USERS: ['admin'],
  
  // 系統設置權限
  MANAGE_SYSTEM: ['admin'],
  
  // 查看報表權限
  VIEW_REPORTS: ['admin', 'hr', 'employer'],
  
  // 管理諮詢請求權限
  MANAGE_CONSULTATIONS: ['admin', 'hr'],
  
  // 查看聊天記錄權限
  VIEW_CHAT_LOGS: ['admin', 'hr'],
  
  // 查看自己的聊天記錄權限（所有用戶）
  VIEW_OWN_CHATS: ['admin', 'hr', 'employer', 'employee'],
  
  // 發起專家諮詢權限
  REQUEST_CONSULTATION: ['employer', 'employee', 'hr'],
  
  // 修改用戶資料權限
  EDIT_PROFILE: ['admin', 'hr', 'employer', 'employee']
};

/**
 * 特殊操作權限定義
 * 更細粒度的權限檢查
 */
const OPERATIONS = {
  // 增加用戶諮詢次數
  ADD_QUERY_CREDITS: (user) => user?.userType === 'admin',
  
  // 刪除聊天記錄
  DELETE_CHAT: (user, chatOwnerId) => {
    // 管理員可以刪除任何聊天
    if (user?.userType === 'admin') return true;
    
    // 用戶只能刪除自己的聊天
    return user?.id === chatOwnerId;
  },
  
  // 修改用戶狀態
  CHANGE_USER_STATUS: (user) => user?.userType === 'admin',
  
  // 是否可以訪問管理員功能
  ACCESS_ADMIN: (user) => user?.userType === 'admin'
};

/**
 * 檢查用戶是否有特定權限
 * @param {string} permission - 權限名稱
 * @param {Object} user - 用戶對象（可選，默認使用當前用戶）
 * @returns {boolean} - 是否有權限
 */
export function hasPermission(permission, user = null) {
  // 如果未提供用戶，使用當前認證用戶
  const currentUser = user || authService.getCurrentUser();
  
  // 如果用戶未登入，無權限
  if (!currentUser) return false;
  
  // 獲取權限定義
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  
  // 檢查用戶類型是否在允許的角色列表中
  return allowedRoles.includes(currentUser.userType);
}

/**
 * 檢查用戶是否可以執行特定操作
 * @param {string} operation - 操作名稱
 * @param {Object} user - 用戶對象（可選，默認使用當前用戶）
 * @param {*} params - 操作相關的參數
 * @returns {boolean} - 是否可以執行操作
 */
export function canPerformOperation(operation, user = null, ...params) {
  // 如果未提供用戶，使用當前認證用戶
  const currentUser = user || authService.getCurrentUser();
  
  // 如果用戶未登入，無權限
  if (!currentUser) return false;
  
  // 獲取操作檢查函數
  const operationCheck = OPERATIONS[operation];
  if (!operationCheck) return false;
  
  // 執行操作檢查
  return operationCheck(currentUser, ...params);
}

/**
 * 檢查用戶是否為管理員
 * @param {Object} user - 用戶對象（可選，默認使用當前用戶）
 * @returns {boolean} - 是否為管理員
 */
export function isAdmin(user = null) {
  const currentUser = user || authService.getCurrentUser();
  return currentUser?.userType === 'admin';
}

/**
 * 檢查用戶是否為HR
 * @param {Object} user - 用戶對象（可選，默認使用當前用戶）
 * @returns {boolean} - 是否為HR
 */
export function isHR(user = null) {
  const currentUser = user || authService.getCurrentUser();
  return currentUser?.userType === 'hr';
}

/**
 * 檢查用戶是否為僱主
 * @param {Object} user - 用戶對象（可選，默認使用當前用戶）
 * @returns {boolean} - 是否為僱主
 */
export function isEmployer(user = null) {
  const currentUser = user || authService.getCurrentUser();
  return currentUser?.userType === 'employer';
}

/**
 * 檢查用戶是否為員工
 * @param {Object} user - 用戶對象（可選，默認使用當前用戶）
 * @returns {boolean} - 是否為員工
 */
export function isEmployee(user = null) {
  const currentUser = user || authService.getCurrentUser();
  return currentUser?.userType === 'employee';
}

export default {
  hasPermission,
  canPerformOperation,
  isAdmin,
  isHR,
  isEmployer,
  isEmployee,
  PERMISSIONS,
  OPERATIONS
}; 