/**
 * Service Worker - 勞工法律諮詢系統 PWA
 * 第六階段：系統整合與優化 - PWA支援
 * 
 * 功能特性：
 * - 離線緩存策略
 * - 背景同步
 * - 推送通知
 * - 自動更新管理
 * 
 * v1.0.0 - 2025-01-28
 */

const CACHE_NAME = 'labor-law-v1.0.0';
const API_CACHE_NAME = 'labor-law-api-v1.0.0';
const STATIC_CACHE_NAME = 'labor-law-static-v1.0.0';

// 需要緩存的靜態資源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/favicon.ico'
];

// 需要緩存的API端點
const API_ENDPOINTS = [
  '/api/v1/expert-consultations',
  '/api/v1/labor-advisors',
  '/api/v1/user/profile',
  '/api/v1/settings'
];

// 緩存策略配置
const CACHE_STRATEGIES = {
  NETWORK_FIRST: 'network_first',      // 網絡優先，失敗時使用緩存
  CACHE_FIRST: 'cache_first',          // 緩存優先，過期時使用網絡
  STALE_WHILE_REVALIDATE: 'stale_while_revalidate', // 緩存響應，後台更新
  NETWORK_ONLY: 'network_only',        // 僅使用網絡
  CACHE_ONLY: 'cache_only'             // 僅使用緩存
};

// 路由緩存策略映射
const ROUTE_CACHE_STRATEGIES = {
  // API路由 - 網絡優先
  '/api/': CACHE_STRATEGIES.NETWORK_FIRST,
  
  // 靜態資源 - 緩存優先
  '/assets/': CACHE_STRATEGIES.CACHE_FIRST,
  '/favicon.ico': CACHE_STRATEGIES.CACHE_FIRST,
  '/manifest.json': CACHE_STRATEGIES.CACHE_FIRST,
  
  // HTML頁面 - 緩存過期時重新驗證
  '/': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  '/index.html': CACHE_STRATEGIES.STALE_WHILE_REVALIDATE
};

/**
 * Service Worker安裝事件
 */
self.addEventListener('install', event => {
  console.log('🔧 Service Worker 安裝中...');
  
  event.waitUntil(
    Promise.all([
      // 緩存靜態資源
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('📦 緩存靜態資源');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // 跳過等待，立即激活新版本
      self.skipWaiting()
    ])
  );
});

/**
 * Service Worker激活事件
 */
self.addEventListener('activate', event => {
  console.log('✅ Service Worker 已激活');
  
  event.waitUntil(
    Promise.all([
      // 清理舊緩存
      cleanupOldCaches(),
      
      // 立即控制所有客戶端
      self.clients.claim()
    ])
  );
});

/**
 * 網絡請求攔截
 */
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // 只處理同源請求
  if (url.origin !== location.origin) {
    return;
  }
  
  // 根據路由選擇緩存策略
  const strategy = getCacheStrategy(url.pathname);
  
  event.respondWith(
    handleRequest(request, strategy)
  );
});

/**
 * 背景同步事件
 */
self.addEventListener('sync', event => {
  console.log('🔄 背景同步事件:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

/**
 * 推送通知事件
 */
self.addEventListener('push', event => {
  console.log('📢 收到推送通知');
  
  const options = {
    body: event.data ? event.data.text() : '您有新的勞工法律諮詢消息',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'labor-law-notification',
    actions: [
      {
        action: 'open',
        title: '查看詳情',
        icon: '/assets/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: '關閉',
        icon: '/assets/icons/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('勞工法律諮詢系統', options)
  );
});

/**
 * 通知點擊事件
 */
self.addEventListener('notificationclick', event => {
  console.log('🔔 通知被點擊:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

/**
 * 獲取緩存策略
 */
function getCacheStrategy(pathname) {
  for (const [route, strategy] of Object.entries(ROUTE_CACHE_STRATEGIES)) {
    if (pathname.startsWith(route)) {
      return strategy;
    }
  }
  
  // 默認策略
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

/**
 * 處理請求
 */
async function handleRequest(request, strategy) {
  const url = new URL(request.url);
  
  try {
    switch (strategy) {
      case CACHE_STRATEGIES.NETWORK_FIRST:
        return await networkFirstStrategy(request);
        
      case CACHE_STRATEGIES.CACHE_FIRST:
        return await cacheFirstStrategy(request);
        
      case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        return await staleWhileRevalidateStrategy(request);
        
      case CACHE_STRATEGIES.NETWORK_ONLY:
        return await fetch(request);
        
      case CACHE_STRATEGIES.CACHE_ONLY:
        return await getCachedResponse(request);
        
      default:
        return await networkFirstStrategy(request);
    }
  } catch (error) {
    console.error('❌ 請求處理失敗:', error);
    
    // 錯誤降級 - 嘗試從緩存獲取
    const cachedResponse = await getCachedResponse(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 如果是HTML請求，返回離線頁面
    if (request.destination === 'document') {
      return getOfflinePage();
    }
    
    throw error;
  }
}

/**
 * 網絡優先策略
 */
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      // 緩存成功的響應
      await cacheResponse(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.warn('⚠️ 網絡請求失敗，嘗試使用緩存:', request.url);
    
    const cachedResponse = await getCachedResponse(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * 緩存優先策略
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await getCachedResponse(request);
  
  if (cachedResponse) {
    // 檢查緩存是否過期
    const cacheTime = cachedResponse.headers.get('sw-cache-time');
    const maxAge = 24 * 60 * 60 * 1000; // 24小時
    
    if (!cacheTime || Date.now() - parseInt(cacheTime) < maxAge) {
      return cachedResponse;
    }
  }
  
  // 緩存未命中或已過期，從網絡獲取
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      await cacheResponse(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // 網絡失敗，返回過期的緩存（如果有）
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * 緩存過期時重新驗證策略
 */
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = getCachedResponse(request);
  const networkResponse = fetch(request).then(response => {
    if (response.ok) {
      cacheResponse(request, response.clone());
    }
    return response;
  }).catch(error => {
    console.warn('⚠️ 後台更新失敗:', error);
  });
  
  // 優先返回緩存，同時在後台更新
  return (await cachedResponse) || (await networkResponse);
}

/**
 * 緩存響應
 */
async function cacheResponse(request, response) {
  const url = new URL(request.url);
  const cacheName = url.pathname.startsWith('/api/') ? API_CACHE_NAME : CACHE_NAME;
  
  try {
    const cache = await caches.open(cacheName);
    
    // 添加緩存時間戳
    const responseWithTimestamp = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        'sw-cache-time': Date.now().toString()
      }
    });
    
    await cache.put(request, responseWithTimestamp);
    console.log(`📦 已緩存: ${request.url}`);
  } catch (error) {
    console.warn('⚠️ 緩存失敗:', error);
  }
}

/**
 * 獲取緩存響應
 */
async function getCachedResponse(request) {
  const url = new URL(request.url);
  const cacheName = url.pathname.startsWith('/api/') ? API_CACHE_NAME : CACHE_NAME;
  
  try {
    const cache = await caches.open(cacheName);
    const response = await cache.match(request);
    
    if (response) {
      console.log(`🎯 緩存命中: ${request.url}`);
    }
    
    return response;
  } catch (error) {
    console.warn('⚠️ 獲取緩存失敗:', error);
    return null;
  }
}

/**
 * 獲取離線頁面
 */
async function getOfflinePage() {
  const offlineHtml = `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>離線模式 - 勞工法律諮詢系統</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .container {
          max-width: 400px;
          padding: 40px;
          background: rgba(255,255,255,0.1);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        h1 {
          margin: 0 0 16px 0;
          font-size: 24px;
          font-weight: 600;
        }
        p {
          margin: 0 0 24px 0;
          font-size: 16px;
          opacity: 0.9;
          line-height: 1.5;
        }
        .retry-btn {
          background: white;
          color: #667eea;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .retry-btn:hover {
          transform: translateY(-2px);
        }
        .features {
          margin-top: 32px;
          text-align: left;
        }
        .feature {
          display: flex;
          align-items: center;
          margin: 12px 0;
          font-size: 14px;
        }
        .feature-icon {
          margin-right: 8px;
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📵</div>
        <h1>您目前處於離線模式</h1>
        <p>網絡連接不可用，但您仍可以使用部分功能。</p>
        
        <button class="retry-btn" onclick="window.location.reload()">
          重新連接
        </button>
        
        <div class="features">
          <div class="feature">
            <span class="feature-icon">📱</span>
            <span>查看已緩存的諮詢記錄</span>
          </div>
          <div class="feature">
            <span class="feature-icon">💬</span>
            <span>離線聊天功能</span>
          </div>
          <div class="feature">
            <span class="feature-icon">📋</span>
            <span>瀏覽本地保存的資料</span>
          </div>
          <div class="feature">
            <span class="feature-icon">🔄</span>
            <span>網絡恢復時自動同步</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return new Response(offlineHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

/**
 * 處理背景同步
 */
async function handleBackgroundSync() {
  try {
    console.log('🔄 執行背景同步');
    
    // 獲取離線期間的數據並同步
    const offlineData = await getOfflineData();
    
    for (const item of offlineData) {
      try {
        await syncDataItem(item);
        await removeOfflineData(item.id);
      } catch (error) {
        console.error('❌ 背景同步項目失敗:', error);
      }
    }
    
    console.log('✅ 背景同步完成');
    
    // 通知客戶端同步完成
    await notifyClients('sync-complete');
  } catch (error) {
    console.error('❌ 背景同步失敗:', error);
  }
}

/**
 * 獲取離線數據
 */
async function getOfflineData() {
  // 這裡應該從IndexedDB或其他持久化存儲獲取離線數據
  // 目前返回空數組作為示例
  return [];
}

/**
 * 同步數據項目
 */
async function syncDataItem(item) {
  const { type, action, data, endpoint } = item;
  
  const response = await fetch(endpoint, {
    method: action.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`同步失敗: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * 移除離線數據
 */
async function removeOfflineData(id) {
  // 從離線存儲中移除已同步的數據
  console.log(`🗑️ 移除已同步的離線數據: ${id}`);
}

/**
 * 通知客戶端
 */
async function notifyClients(message) {
  const clients = await self.clients.matchAll();
  
  clients.forEach(client => {
    client.postMessage({
      type: 'sw-message',
      message: message,
      timestamp: Date.now()
    });
  });
}

/**
 * 清理舊緩存
 */
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = [CACHE_NAME, API_CACHE_NAME, STATIC_CACHE_NAME];
  
  const deletePromises = cacheNames
    .filter(cacheName => !currentCaches.includes(cacheName))
    .map(cacheName => {
      console.log(`🗑️ 清理舊緩存: ${cacheName}`);
      return caches.delete(cacheName);
    });
  
  await Promise.all(deletePromises);
  console.log('✅ 緩存清理完成');
}

/**
 * 監聽來自主線程的消息
 */
self.addEventListener('message', event => {
  console.log('📨 收到來自主線程的消息:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: '1.0.0' });
  }
});

console.log('🚀 Service Worker 已載入 - v1.0.0'); 