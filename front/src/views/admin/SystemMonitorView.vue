<template>
  <div class="system-monitor">
    <div class="monitor-header">
      <h1 class="page-title">🔍 系統監控儀表板</h1>
      <div class="header-actions">
        <button @click="refreshData" class="refresh-btn" :disabled="isLoading">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
          刷新數據
        </button>
        <button @click="downloadReport" class="download-btn">
          <i class="fas fa-download"></i>
          下載報告
        </button>
      </div>
    </div>

    <!-- 總覽統計卡片 -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-tachometer-alt text-blue-500"></i>
        </div>
        <div class="stat-content">
          <h3>API 成功率</h3>
          <p class="stat-value" :class="getSuccessRateClass(performanceStats?.successRate)">
            {{ performanceStats?.successRate || 0 }}%
          </p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-clock text-green-500"></i>
        </div>
        <div class="stat-content">
          <h3>平均響應時間</h3>
          <p class="stat-value">{{ performanceStats?.averageResponseTime || 0 }}ms</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-exchange-alt text-purple-500"></i>
        </div>
        <div class="stat-content">
          <h3>總請求數</h3>
          <p class="stat-value">{{ performanceStats?.totalRequests || 0 }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-exclamation-triangle text-red-500"></i>
        </div>
        <div class="stat-content">
          <h3>錯誤數量</h3>
          <p class="stat-value text-red-600">{{ performanceStats?.recentErrors || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- 詳細監控面板 -->
    <div class="monitor-panels">
      <!-- API 性能面板 -->
      <div class="monitor-panel">
        <h2 class="panel-title">📊 API 性能監控</h2>
        <div class="panel-content">
          <div v-if="performanceStats" class="performance-details">
            <div class="detail-row">
              <span class="detail-label">成功請求:</span>
              <span class="detail-value text-green-600">{{ performanceStats.successfulRequests }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">失敗請求:</span>
              <span class="detail-value text-red-600">{{ performanceStats.failedRequests }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">慢請求 (>3s):</span>
              <span class="detail-value text-yellow-600">{{ performanceStats.slowRequests }}</span>
            </div>
          </div>
          <div v-else class="no-data">
            <p>暫無性能數據</p>
          </div>
        </div>
      </div>

      <!-- 緩存統計面板 -->
      <div class="monitor-panel">
        <h2 class="panel-title">💾 緩存系統監控</h2>
        <div class="panel-content">
          <div v-if="cacheStats" class="cache-details">
            <div class="detail-row">
              <span class="detail-label">緩存條目:</span>
              <span class="detail-value">{{ cacheStats.totalEntries }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">有效條目:</span>
              <span class="detail-value text-green-600">{{ cacheStats.validEntries }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">過期條目:</span>
              <span class="detail-value text-red-600">{{ cacheStats.expiredEntries }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">命中率:</span>
              <span class="detail-value text-blue-600">{{ cacheStats.hitRate }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">緩存大小:</span>
              <span class="detail-value">{{ cacheStats.cacheSize }}</span>
            </div>
          </div>
          <div v-else class="no-data">
            <p>暫無緩存數據</p>
          </div>
        </div>
      </div>

      <!-- 系統健康面板 -->
      <div class="monitor-panel">
        <h2 class="panel-title">💚 系統健康狀態</h2>
        <div class="panel-content">
          <div class="health-indicators">
            <div class="health-item">
              <span class="health-label">前端服務:</span>
              <span class="health-status online">🟢 正常</span>
            </div>
            <div class="health-item">
              <span class="health-label">API 連接:</span>
              <span class="health-status" :class="apiHealthClass">
                {{ apiHealthStatus }}
              </span>
            </div>
            <div class="health-item">
              <span class="health-label">性能監控:</span>
              <span class="health-status" :class="monitoringEnabled ? 'online' : 'offline'">
                {{ monitoringEnabled ? '🟢 已啟用' : '🔴 未啟用' }}
              </span>
            </div>
            <div class="health-item">
              <span class="health-label">緩存系統:</span>
              <span class="health-status" :class="cacheEnabled ? 'online' : 'offline'">
                {{ cacheEnabled ? '🟢 已啟用' : '🔴 未啟用' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 推薦優化面板 -->
      <div class="monitor-panel">
        <h2 class="panel-title">💡 優化建議</h2>
        <div class="panel-content">
          <div v-if="recommendations.length > 0" class="recommendations-list">
            <div v-for="(rec, index) in recommendations" :key="index" class="recommendation-item">
              <i class="fas fa-lightbulb text-yellow-500"></i>
              <span>{{ rec }}</span>
            </div>
          </div>
          <div v-else class="no-data">
            <p>🎉 系統運行良好，暫無優化建議</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 環境資訊 -->
    <div class="environment-info">
      <h2 class="panel-title">🔧 環境資訊</h2>
      <div class="env-details">
        <div class="env-item">
          <span class="env-label">環境:</span>
          <span class="env-value">{{ environment }}</span>
        </div>
        <div class="env-item">
          <span class="env-label">前端域名:</span>
          <span class="env-value">{{ frontendUrl }}</span>
        </div>
        <div class="env-item">
          <span class="env-label">API 基礎URL:</span>
          <span class="env-value">{{ apiBaseUrl }}</span>
        </div>
        <div class="env-item">
          <span class="env-label">更新時間:</span>
          <span class="env-value">{{ lastUpdated }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemMonitorView',
  data() {
    return {
      isLoading: false,
      performanceStats: null,
      cacheStats: null,
      recommendations: [],
      lastUpdated: new Date().toLocaleString('zh-TW'),
      refreshTimer: null
    }
  },
  
  computed: {
    environment() {
      return import.meta.env.VITE_APP_ENV || 'unknown'
    },
    
    frontendUrl() {
      return window.location.origin
    },
    
    apiBaseUrl() {
      return import.meta.env.VITE_API_BASE_URL || '未配置'
    },
    
    monitoringEnabled() {
      return import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true'
    },
    
    cacheEnabled() {
      return this.monitoringEnabled && this.cacheStats !== null
    },
    
    apiHealthStatus() {
      if (!this.performanceStats) return '🔴 無數據'
      const successRate = parseFloat(this.performanceStats.successRate)
      if (successRate >= 95) return '🟢 健康'
      if (successRate >= 80) return '🟡 警告'
      return '🔴 異常'
    },
    
    apiHealthClass() {
      if (!this.performanceStats) return 'offline'
      const successRate = parseFloat(this.performanceStats.successRate)
      if (successRate >= 95) return 'online'
      if (successRate >= 80) return 'warning'
      return 'offline'
    }
  },
  
  async mounted() {
    await this.loadMonitoringData()
    this.startAutoRefresh()
  },
  
  beforeUnmount() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  },
  
  methods: {
    /**
     * 載入監控數據
     */
    async loadMonitoringData() {
      this.isLoading = true
      try {
        // 動態載入服務
        const [performanceModule, cacheModule] = await Promise.allSettled([
          import('@/services/performanceService.js'),
          import('@/services/cacheService.js')
        ])
        
        // 獲取性能統計
        if (performanceModule.status === 'fulfilled') {
          const performanceService = performanceModule.value.default
          this.performanceStats = performanceService.getPerformanceStats()
          
          // 獲取優化建議
          if (this.performanceStats) {
            this.recommendations = this.generateRecommendations(this.performanceStats)
          }
        }
        
        // 獲取緩存統計
        if (cacheModule.status === 'fulfilled') {
          const cacheService = cacheModule.value.default
          this.cacheStats = cacheService.getStats()
        }
        
        this.lastUpdated = new Date().toLocaleString('zh-TW')
      } catch (error) {
        console.error('載入監控數據失敗:', error)
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * 生成優化建議
     */
    generateRecommendations(stats) {
      const recommendations = []
      
      if (stats.successRate < 95) {
        recommendations.push('API成功率低於95%，請檢查後端服務狀態')
      }
      
      if (stats.averageResponseTime > 2000) {
        recommendations.push('API平均響應時間過長，考慮實施緩存策略')
      }
      
      if (stats.slowRequests > 5) {
        recommendations.push('存在多個慢請求，建議優化API性能或增加超時處理')
      }
      
      if (stats.recentErrors > 10) {
        recommendations.push('錯誤率較高，需要檢查錯誤處理邏輯')
      }
      
      return recommendations
    },
    
    /**
     * 刷新數據
     */
    async refreshData() {
      await this.loadMonitoringData()
    },
    
    /**
     * 下載報告
     */
    downloadReport() {
      const report = {
        timestamp: new Date().toISOString(),
        environment: this.environment,
        frontendUrl: this.frontendUrl,
        apiBaseUrl: this.apiBaseUrl,
        performance: this.performanceStats,
        cache: this.cacheStats,
        recommendations: this.recommendations,
        system: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      }
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `system-monitor-report-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
    },
    
    /**
     * 獲取成功率樣式類
     */
    getSuccessRateClass(rate) {
      if (!rate) return ''
      const numRate = parseFloat(rate)
      if (numRate >= 95) return 'text-green-600'
      if (numRate >= 80) return 'text-yellow-600'
      return 'text-red-600'
    },
    
    /**
     * 開始自動刷新
     */
    startAutoRefresh() {
      this.refreshTimer = setInterval(() => {
        this.loadMonitoringData()
      }, 30 * 1000) // 每30秒刷新一次
    }
  }
}
</script>

<style scoped>
.system-monitor {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-title {
  margin: 0;
  color: #333;
  font-size: 1.8rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.refresh-btn, .download-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.refresh-btn {
  background: #007bff;
  color: white;
}

.refresh-btn:hover:not(:disabled) {
  background: #0056b3;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.download-btn {
  background: #28a745;
  color: white;
}

.download-btn:hover {
  background: #1e7e34;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-content h3 {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.monitor-panels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.monitor-panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.panel-title {
  margin: 0;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  color: #333;
  font-size: 1.2rem;
}

.panel-content {
  padding: 1.5rem;
}

.performance-details, .cache-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #666;
}

.detail-value {
  font-weight: 600;
}

.health-indicators {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.health-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
}

.health-label {
  font-weight: 500;
  color: #666;
}

.health-status.online {
  color: #28a745;
}

.health-status.warning {
  color: #ffc107;
}

.health-status.offline {
  color: #dc3545;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  color: #856404;
}

.environment-info {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.env-details {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.env-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.env-item:last-child {
  border-bottom: none;
}

.env-label {
  font-weight: 500;
  color: #666;
}

.env-value {
  font-family: monospace;
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.no-data {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 2rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .system-monitor {
    padding: 1rem;
  }
  
  .monitor-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .monitor-panels {
    grid-template-columns: 1fr;
  }
  
  .env-details {
    grid-template-columns: 1fr;
  }
}

/* 輔助樣式類 */
.text-blue-500 { color: #3b82f6; }
.text-green-500 { color: #10b981; }
.text-purple-500 { color: #8b5cf6; }
.text-red-500 { color: #ef4444; }
.text-yellow-500 { color: #f59e0b; }
.text-green-600 { color: #059669; }
.text-red-600 { color: #dc2626; }
.text-yellow-600 { color: #d97706; }
.text-blue-600 { color: #2563eb; }
</style> 