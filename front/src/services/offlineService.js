/**
 * 離線支援服務
 * 第六階段：系統整合與優化 - PWA離線功能
 * 
 * 功能特性：
 * - Service Worker 管理
 * - 離線數據同步
 * - 網絡狀態監控
 * - 離線頁面緩存
 * - 背景同步支援
 * 
 * v1.0.0 - 2025-01-28
 */

import dataManager, { DATA_TYPES } from './dataManager.js';
import cacheService from './cacheService.js';

/**
 * 離線支援服務類
 */
class OfflineService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.offlineQueue = [];
    this.syncInProgress = false;
    this.lastSyncTime = null;
    
    // 初始化離線功能
    this.init();
  }

  /**
   * 初始化離線服務
   */
  async init() {
    // 註冊網絡監聽器
    this.setupNetworkListeners();
    
    // 註冊Service Worker
    await this.registerServiceWorker();
    
    // 設置離線緩存策略
    this.setupOfflineCache();
    
    // 初始化背景同步
    this.setupBackgroundSync();
    
    console.log('🔧 離線服務初始化完成');
  }

  /**
   * 註冊Service Worker
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker註冊成功:', registration.scope);
        
        // 監聽Service Worker更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 發現Service Worker更新');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('📢 新版本可用，建議重新載入頁面');
              this.notifyUserOfUpdate();
            }
          });
        });
        
        return registration;
      } catch (error) {
        console.error('❌ Service Worker註冊失敗:', error);
        return null;
      }
    } else {
      console.warn('⚠️ 瀏覽器不支援Service Worker');
      return null;
    }
  }

  /**
   * 設置網絡監聽器
   */
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 網絡重新連接');
      this.isOnline = true;
      this.onNetworkReconnect();
    });

    window.addEventListener('offline', () => {
      console.log('📵 網絡連接斷開');
      this.isOnline = false;
      this.onNetworkDisconnect();
    });
  }

  /**
   * 設置離線緩存策略
   */
  setupOfflineCache() {
    // 預緩存重要數據
    this.preCacheEssentialData();
    
    // 設置自動緩存策略
    this.setupAutoCacheStrategy();
  }

  /**
   * 預緩存重要數據
   */
  async preCacheEssentialData() {
    try {
      console.log('📦 開始預緩存重要數據');
      
      // 緩存用戶配置文件
      if (this.isOnline) {
        await dataManager.getData(DATA_TYPES.USER_PROFILE, { forceRefresh: false });
        await dataManager.getData(DATA_TYPES.APP_SETTINGS, { forceRefresh: false });
      }
      
      // 緩存靜態資源
      await this.cacheStaticResources();
      
      console.log('✅ 重要數據預緩存完成');
    } catch (error) {
      console.error('❌ 預緩存失敗:', error);
    }
  }

  /**
   * 緩存靜態資源
   */
  async cacheStaticResources() {
    const resourcesToCache = [
      '/index.html',
      '/manifest.json',
      '/assets/icons/icon-192x192.png',
      '/assets/icons/icon-512x512.png',
      // 添加其他重要靜態資源
    ];

    try {
      if ('caches' in window) {
        const cache = await caches.open('static-resources-v1');
        await cache.addAll(resourcesToCache);
        console.log('📦 靜態資源緩存完成');
      }
    } catch (error) {
      console.warn('⚠️ 靜態資源緩存失敗:', error);
    }
  }

  /**
   * 設置自動緩存策略
   */
  setupAutoCacheStrategy() {
    // 攔截重要的API調用，確保離線可用
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // 緩存成功的API響應
        if (response.ok && this.shouldCacheResponse(args[0])) {
          this.cacheApiResponse(args[0], response.clone());
        }
        
        return response;
      } catch (error) {
        // 網絡錯誤時嘗試從緩存獲取
        const cachedResponse = await this.getCachedResponse(args[0]);
        if (cachedResponse) {
          console.log('📱 使用離線緩存響應:', args[0]);
          return cachedResponse;
        }
        
        throw error;
      }
    };
  }

  /**
   * 判斷是否應該緩存響應
   */
  shouldCacheResponse(url) {
    const cacheableEndpoints = [
      '/api/v1/expert-consultations',
      '/api/v1/labor-advisors',
      '/api/v1/user/profile',
      '/api/v1/settings'
    ];
    
    return cacheableEndpoints.some(endpoint => 
      typeof url === 'string' && url.includes(endpoint)
    );
  }

  /**
   * 緩存API響應
   */
  async cacheApiResponse(url, response) {
    try {
      if ('caches' in window) {
        const cache = await caches.open('api-responses-v1');
        await cache.put(url, response);
      }
    } catch (error) {
      console.warn('⚠️ API響應緩存失敗:', error);
    }
  }

  /**
   * 獲取緩存的響應
   */
  async getCachedResponse(url) {
    try {
      if ('caches' in window) {
        const cache = await caches.open('api-responses-v1');
        return await cache.match(url);
      }
    } catch (error) {
      console.warn('⚠️ 獲取緩存響應失敗:', error);
    }
    
    return null;
  }

  /**
   * 設置背景同步
   */
  setupBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        console.log('🔄 背景同步功能已啟用');
        
        // 註冊同步事件
        registration.sync.register('background-sync')
          .then(() => {
            console.log('✅ 背景同步已註冊');
          })
          .catch(error => {
            console.warn('⚠️ 背景同步註冊失敗:', error);
          });
      });
    }
  }

  /**
   * 網絡重新連接處理
   */
  async onNetworkReconnect() {
    // 顯示重連通知
    this.showNotification('🌐 網絡已重新連接', 'success');
    
    // 處理離線隊列
    await this.processOfflineQueue();
    
    // 同步數據
    await this.syncOfflineData();
    
    // 更新最後同步時間
    this.lastSyncTime = Date.now();
  }

  /**
   * 網絡斷開處理
   */
  onNetworkDisconnect() {
    // 顯示離線通知
    this.showNotification('📵 網絡連接斷開，已切換至離線模式', 'warning');
    
    // 啟用離線模式
    this.enableOfflineMode();
  }

  /**
   * 啟用離線模式
   */
  enableOfflineMode() {
    // 添加離線樣式類
    document.body.classList.add('offline-mode');
    
    // 顯示離線狀態指示器
    this.showOfflineIndicator();
    
    // 啟用離線緩存策略
    cacheService.set('offline_mode', true, 'APP_SETTINGS');
  }

  /**
   * 禁用離線模式
   */
  disableOfflineMode() {
    // 移除離線樣式類
    document.body.classList.remove('offline-mode');
    
    // 隱藏離線狀態指示器
    this.hideOfflineIndicator();
    
    // 禁用離線緩存策略
    cacheService.delete('offline_mode', 'APP_SETTINGS');
  }

  /**
   * 處理離線隊列
   */
  async processOfflineQueue() {
    if (this.syncInProgress || this.offlineQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log(`🔄 開始處理離線隊列 (${this.offlineQueue.length} 項)`);

    const successfulSyncs = [];
    const failedSyncs = [];

    for (const queueItem of this.offlineQueue) {
      try {
        await this.syncQueueItem(queueItem);
        successfulSyncs.push(queueItem);
      } catch (error) {
        console.error('❌ 離線隊列項目同步失敗:', error);
        failedSyncs.push({ ...queueItem, error: error.message });
      }
    }

    // 移除成功同步的項目
    this.offlineQueue = this.offlineQueue.filter(item => 
      !successfulSyncs.includes(item)
    );

    console.log(`✅ 離線隊列處理完成: ${successfulSyncs.length} 成功, ${failedSyncs.length} 失敗`);
    
    this.syncInProgress = false;
    
    // 顯示同步結果
    if (successfulSyncs.length > 0) {
      this.showNotification(
        `✅ 已同步 ${successfulSyncs.length} 項離線數據`, 
        'success'
      );
    }
  }

  /**
   * 同步隊列項目
   */
  async syncQueueItem(queueItem) {
    const { type, action, data, timestamp } = queueItem;
    
    switch (type) {
      case DATA_TYPES.CONSULTATION_REQUESTS:
        return await this.syncConsultationRequest(action, data);
        
      case DATA_TYPES.LABOR_ADVISORS:
        return await this.syncLaborAdvisor(action, data);
        
      case DATA_TYPES.CHAT_HISTORY:
        return await this.syncChatHistory(action, data);
        
      default:
        throw new Error(`未知的隊列項目類型: ${type}`);
    }
  }

  /**
   * 同步諮詢請求
   */
  async syncConsultationRequest(action, data) {
    switch (action) {
      case 'create':
        return await dataManager.setData(DATA_TYPES.CONSULTATION_REQUESTS, data, {
          method: 'POST',
          forceSync: true
        });
        
      case 'update':
        return await dataManager.setData(DATA_TYPES.CONSULTATION_REQUESTS, data, {
          method: 'PUT',
          forceSync: true
        });
        
      default:
        throw new Error(`未知的諮詢請求操作: ${action}`);
    }
  }

  /**
   * 同步勞工顧問
   */
  async syncLaborAdvisor(action, data) {
    switch (action) {
      case 'create':
      case 'update':
        return await dataManager.setData(DATA_TYPES.LABOR_ADVISORS, data, {
          method: action === 'create' ? 'POST' : 'PUT',
          forceSync: true
        });
        
      default:
        throw new Error(`未知的勞工顧問操作: ${action}`);
    }
  }

  /**
   * 同步聊天歷史
   */
  async syncChatHistory(action, data) {
    return await dataManager.setData(DATA_TYPES.CHAT_HISTORY, data, {
      method: 'POST',
      forceSync: true
    });
  }

  /**
   * 同步離線數據
   */
  async syncOfflineData() {
    try {
      console.log('🔄 開始同步離線數據');
      
      // 強制刷新關鍵數據
      await dataManager.getData(DATA_TYPES.CONSULTATION_REQUESTS, { forceRefresh: true });
      await dataManager.getData(DATA_TYPES.LABOR_ADVISORS, { forceRefresh: true });
      
      console.log('✅ 離線數據同步完成');
    } catch (error) {
      console.error('❌ 離線數據同步失敗:', error);
    }
  }

  /**
   * 添加到離線隊列
   */
  addToOfflineQueue(type, action, data) {
    const queueItem = {
      id: `${type}_${action}_${Date.now()}`,
      type,
      action,
      data,
      timestamp: Date.now()
    };
    
    this.offlineQueue.push(queueItem);
    console.log(`📁 添加到離線隊列: ${type} ${action}`);
    
    // 嘗試立即處理（如果網絡可用）
    if (this.isOnline && !this.syncInProgress) {
      setTimeout(() => this.processOfflineQueue(), 1000);
    }
  }

  /**
   * 顯示離線狀態指示器
   */
  showOfflineIndicator() {
    // 創建離線指示器元素
    let indicator = document.getElementById('offline-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'offline-indicator';
      indicator.className = 'offline-indicator';
      indicator.innerHTML = `
        <div class="offline-content">
          <span class="offline-icon">📵</span>
          <span class="offline-text">離線模式</span>
        </div>
      `;
      
      // 添加樣式
      const style = document.createElement('style');
      style.textContent = `
        .offline-indicator {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #ff9800;
          color: white;
          padding: 8px;
          text-align: center;
          z-index: 10000;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .offline-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .offline-icon {
          font-size: 16px;
        }
      `;
      
      if (!document.getElementById('offline-styles')) {
        style.id = 'offline-styles';
        document.head.appendChild(style);
      }
      
      document.body.appendChild(indicator);
    }
    
    indicator.style.display = 'block';
  }

  /**
   * 隱藏離線狀態指示器
   */
  hideOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }

  /**
   * 顯示通知
   */
  showNotification(message, type = 'info') {
    // 創建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加樣式
    const style = document.createElement('style');
    style.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 4px;
        color: white;
        font-size: 14px;
        z-index: 10001;
        max-width: 300px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
      }
      .notification-success { background: #4caf50; }
      .notification-warning { background: #ff9800; }
      .notification-error { background: #f44336; }
      .notification-info { background: #2196f3; }
      .notification.show {
        opacity: 1;
        transform: translateX(0);
      }
    `;
    
    if (!document.getElementById('notification-styles')) {
      style.id = 'notification-styles';
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // 顯示動畫
    setTimeout(() => notification.classList.add('show'), 100);
    
    // 自動移除
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }

  /**
   * 通知用戶有更新
   */
  notifyUserOfUpdate() {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'update-banner';
    updateBanner.innerHTML = `
      <div class="update-content">
        <span>🚀 有新版本可用</span>
        <button onclick="window.location.reload()" class="update-button">
          立即更新
        </button>
        <button onclick="this.parentElement.parentElement.remove()" class="dismiss-button">
          稍後提醒
        </button>
      </div>
    `;
    
    // 添加樣式
    const style = document.createElement('style');
    style.textContent = `
      .update-banner {
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: #2196f3;
        color: white;
        padding: 16px;
        border-radius: 8px;
        z-index: 10002;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      }
      .update-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .update-button, .dismiss-button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      .update-button {
        background: white;
        color: #2196f3;
        font-weight: bold;
      }
      .dismiss-button {
        background: transparent;
        color: white;
        border: 1px solid white;
      }
    `;
    
    if (!document.getElementById('update-styles')) {
      style.id = 'update-styles';
      document.head.appendChild(style);
    }
    
    document.body.appendChild(updateBanner);
  }

  /**
   * 獲取離線服務統計
   */
  getStats() {
    return {
      isOnline: this.isOnline,
      offlineQueueSize: this.offlineQueue.length,
      syncInProgress: this.syncInProgress,
      lastSyncTime: this.lastSyncTime,
      serviceWorkerSupported: 'serviceWorker' in navigator,
      backgroundSyncSupported: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
    };
  }

  /**
   * 清理離線數據
   */
  async cleanupOfflineData() {
    try {
      // 清理過期的緩存
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          if (cacheName.includes('old') || cacheName.includes('expired')) {
            await caches.delete(cacheName);
            console.log(`🗑️ 清理過期緩存: ${cacheName}`);
          }
        }
      }
      
      // 清理過期的離線隊列項目
      const now = Date.now();
      const expiredThreshold = 7 * 24 * 60 * 60 * 1000; // 7天
      
      this.offlineQueue = this.offlineQueue.filter(item => {
        const isExpired = now - item.timestamp > expiredThreshold;
        if (isExpired) {
          console.log(`🗑️ 清理過期離線隊列項目: ${item.type} ${item.action}`);
        }
        return !isExpired;
      });
      
      console.log('✅ 離線數據清理完成');
    } catch (error) {
      console.error('❌ 離線數據清理失敗:', error);
    }
  }
}

// 創建單例實例
const offlineService = new OfflineService();

// 默認導出服務實例
export default offlineService; 