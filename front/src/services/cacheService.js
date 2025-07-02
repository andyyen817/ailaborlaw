/**
 * 智能緩存服務
 * 為API請求提供自適應緩存機制
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.isEnabled = import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true';
    this.defaultTTL = 5 * 60 * 1000; // 5分鐘默認緩存時間
    this.maxCacheSize = 100; // 最大緩存條目數
    
    // 定期清理過期緩存
    if (this.isEnabled) {
      setInterval(() => this.cleanup(), 60 * 1000); // 每分鐘清理一次
    }
  }

  /**
   * 生成緩存鍵
   */
  generateKey(url, method, data) {
    const keyData = {
      url: url.split('?')[0], // 移除查詢參數
      method,
      data: data ? JSON.stringify(data) : null
    };
    return btoa(JSON.stringify(keyData)).replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * 檢查是否應該緩存此請求
   */
  shouldCache(url, method, status) {
    if (!this.isEnabled) return false;
    
    // 只緩存GET請求的成功響應
    if (method !== 'GET' || status < 200 || status >= 300) {
      return false;
    }

    // 不緩存認證相關的請求
    if (url.includes('/auth/') || url.includes('/login') || url.includes('/logout')) {
      return false;
    }

    // 不緩存實時數據
    if (url.includes('/chat/') || url.includes('/messages')) {
      return false;
    }

    return true;
  }

  /**
   * 獲取緩存
   */
  get(url, method = 'GET', data = null) {
    if (!this.isEnabled) return null;

    const key = this.generateKey(url, method, data);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // 檢查是否過期
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * 設置緩存
   */
  set(url, method, data, response, status, customTTL = null) {
    if (!this.shouldCache(url, method, status)) return;

    const key = this.generateKey(url, method, data);
    const ttl = customTTL || this.getTTL(url);
    
    // 如果緩存已滿，移除最舊的條目
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data: response,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
      url,
      method
    });
  }

  /**
   * 根據URL類型確定TTL
   */
  getTTL(url) {
    // 用戶資料 - 較短緩存時間
    if (url.includes('/users/me')) {
      return 2 * 60 * 1000; // 2分鐘
    }

    // 靜態配置數據 - 較長緩存時間
    if (url.includes('/config') || url.includes('/settings')) {
      return 15 * 60 * 1000; // 15分鐘
    }

    // 管理員數據 - 中等緩存時間
    if (url.includes('/admin/')) {
      return 3 * 60 * 1000; // 3分鐘
    }

    // 列表數據 - 標準緩存時間
    if (url.includes('/list') || url.includes('/search')) {
      return 5 * 60 * 1000; // 5分鐘
    }

    return this.defaultTTL;
  }

  /**
   * 清除特定URL模式的緩存
   */
  invalidatePattern(urlPattern) {
    if (!this.isEnabled) return;

    for (const [key, cached] of this.cache.entries()) {
      if (cached.url.includes(urlPattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 清除所有緩存
   */
  clear() {
    this.cache.clear();
  }

  /**
   * 清理過期緩存
   */
  cleanup() {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 獲取緩存統計
   */
  getStats() {
    if (!this.isEnabled) return null;

    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const cached of this.cache.values()) {
      if (now > cached.expiry) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitRate: this.hitCount && this.requestCount 
        ? ((this.hitCount / this.requestCount) * 100).toFixed(2) + '%'
        : '0%',
      cacheSize: `${(JSON.stringify([...this.cache.values()]).length / 1024).toFixed(2)} KB`
    };
  }

  /**
   * 預熱關鍵緩存
   */
  async warmup(api) {
    if (!this.isEnabled) return;

    try {
      // 預載入常用的配置數據
      const warmupUrls = [
        '/api/v1/config/app',
        '/api/v1/users/me/queries'
      ];

      for (const url of warmupUrls) {
        try {
          await api.get(url);
        } catch (e) {
          // 預熱失敗不影響主流程
        }
      }
    } catch (e) {
      console.warn('緩存預熱失敗:', e.message);
    }
  }
}

// 創建全局實例
const cacheService = new CacheService();

export default cacheService; 