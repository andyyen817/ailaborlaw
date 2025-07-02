/**
 * 事件服務
 * 用於組件之間的通信和事件觸發
 */

// 定義系統事件類型常量
export const EventTypes = {
  // 認證相關事件
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_EXPIRED: 'auth:unauthenticated',
  
  // 用戶資料相關事件
  USER_PROFILE_UPDATED: 'user:profile_updated',
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_QUERIES_CHANGED: 'user:queries_changed',
  
  // 管理員相關事件
  ADMIN_LOGIN: 'admin:login',
  ADMIN_LOGOUT: 'admin:logout',
  ADMIN_AUTH_EXPIRED: 'admin:unauthenticated',
  
  // 數據同步事件
  DATA_SYNC_NEEDED: 'data:sync_needed'
};

// 防重复触发机制 - 记录最后事件时间
const lastEventTime = {};

/**
 * 觸發自定義事件
 * @param {string} eventType - 事件類型
 * @param {Object} detail - 事件詳情數據
 */
export const triggerEvent = (eventType, detail = {}) => {
  if (typeof window !== 'undefined') {
    console.log(`觸發事件: ${eventType}`, detail);
    window.dispatchEvent(new CustomEvent(eventType, { detail }));
  }
};

/**
 * 監聽事件
 * @param {string} eventType - 事件類型
 * @param {Function} callback - 事件處理函數
 * @returns {Function} - 移除事件監聽器的函數
 */
export const listenEvent = (eventType, callback) => {
  if (typeof window !== 'undefined') {
    window.addEventListener(eventType, callback);
    
    // 返回移除事件監聽器的函數
    return () => {
      window.removeEventListener(eventType, callback);
    };
  }
  
  // 返回空函數，防止錯誤
  return () => {};
};

/**
 * 觸發用戶資料更新事件
 * @param {string} userId - 用戶ID
 * @param {Object} userData - 更新後的用戶數據
 */
export const notifyUserProfileUpdated = (userId, userData) => {
  console.log(`🔔 eventService: 准备发出用户(ID: ${userId})资料更新事件`);
  
  // 防重复触发机制
  const eventKey = `user_profile_${userId}`;
  const now = Date.now();
  
  // 如果在100ms内重复触发相同用户的事件，则忽略
  if (lastEventTime[eventKey] && (now - lastEventTime[eventKey]) < 100) {
    console.log(`⚠️ eventService: 忽略重复的用户(ID: ${userId})资料更新事件`);
    return;
  }
  
  lastEventTime[eventKey] = now;
  
  const eventDetail = { userId, userData };
  console.log(`🚀 eventService: 发出用户资料更新事件，详情:`, eventDetail);
  
  // 发出实际事件
  triggerEvent(EventTypes.USER_PROFILE_UPDATED, eventDetail);
  
  // 延时发出数据同步事件以确保所有组件都能接收到
  setTimeout(() => {
    triggerEvent(EventTypes.DATA_SYNC_NEEDED, {
      dataType: 'users',
      action: 'update',
      userId,
      userData
    });
  }, 50);
};

/**
 * 觸發數據同步事件
 * @param {string} dataType - 數據類型 (users, conversations, etc.)
 * @param {string} action - 操作類型 (create, update, delete)
 * @param {Object} data - 相關數據
 */
export const notifyDataSyncNeeded = (dataType, action, data = {}) => {
  triggerEvent(EventTypes.DATA_SYNC_NEEDED, { dataType, action, data });
};

// 默認導出所有函數
export default {
  triggerEvent,
  listenEvent,
  notifyUserProfileUpdated,
  notifyDataSyncNeeded,
  EventTypes
}; 