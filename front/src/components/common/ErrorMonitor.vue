<template>
  <div v-if="showMonitor && errors.length > 0" class="error-monitor-overlay">
    <div class="error-monitor-panel">
      <div class="monitor-header">
        <h3>🚨 錯誤監控面板</h3>
        <button @click="closeMonitor" class="close-btn">×</button>
      </div>
      
      <div class="error-list">
        <div v-for="(error, index) in recentErrors" :key="index" class="error-item">
          <div class="error-meta">
            <span class="error-time">{{ formatTime(error.timestamp) }}</span>
            <span class="error-type">{{ error.type }}</span>
          </div>
          <div class="error-message">{{ error.message }}</div>
          <div class="error-url" v-if="error.url">{{ error.url }}</div>
        </div>
      </div>
      
      <div class="monitor-actions">
        <button @click="clearErrors" class="clear-btn">清除錯誤</button>
        <button @click="downloadErrorReport" class="report-btn">下載報告</button>
      </div>
    </div>
  </div>
</template>

<script>
import performanceService from '@/services/performanceService.js'

export default {
  name: 'ErrorMonitor',
  data() {
    return {
      errors: [],
      showMonitor: false,
      isEnabled: import.meta.env.VITE_ENABLE_DEBUG === 'true'
    }
  },
  
  computed: {
    recentErrors() {
      return this.errors.slice(-10).reverse() // 顯示最近10個錯誤
    }
  },
  
  mounted() {
    if (this.isEnabled) {
      this.setupErrorHandlers()
      this.setupKeyboardShortcuts()
    }
  },
  
  methods: {
    /**
     * 設置全局錯誤處理器
     */
    setupErrorHandlers() {
      // JavaScript 錯誤處理
      window.addEventListener('error', (event) => {
        this.recordError({
          type: 'JavaScript Error',
          message: event.message,
          url: event.filename,
          line: event.lineno,
          column: event.colno,
          stack: event.error?.stack,
          timestamp: Date.now()
        })
      })
      
      // Promise 拒絕處理
      window.addEventListener('unhandledrejection', (event) => {
        this.recordError({
          type: 'Promise Rejection',
          message: event.reason?.message || event.reason,
          stack: event.reason?.stack,
          timestamp: Date.now()
        })
      })
      
      // Vue 錯誤處理
      const app = this.$root
      if (app && app.config) {
        app.config.errorHandler = (error, instance, info) => {
          this.recordError({
            type: 'Vue Error',
            message: error.message,
            stack: error.stack,
            component: instance?.$options.name || 'Unknown',
            info,
            timestamp: Date.now()
          })
        }
      }
      
      // 資源加載錯誤
      window.addEventListener('error', (event) => {
        if (event.target !== window) {
          this.recordError({
            type: 'Resource Error',
            message: `Failed to load: ${event.target.tagName}`,
            url: event.target.src || event.target.href,
            timestamp: Date.now()
          })
        }
      }, true)
    },
    
    /**
     * 設置鍵盤快捷鍵
     */
    setupKeyboardShortcuts() {
      document.addEventListener('keydown', (event) => {
        // Ctrl+Shift+E 開啟錯誤監控面板
        if (event.ctrlKey && event.shiftKey && event.key === 'E') {
          event.preventDefault()
          this.toggleMonitor()
        }
      })
    },
    
    /**
     * 記錄錯誤
     */
    recordError(errorInfo) {
      this.errors.push(errorInfo)
      
      // 將錯誤發送到性能監控服務
      if (performanceService) {
        performanceService.recordError(new Error(errorInfo.message), {
          type: errorInfo.type,
          url: errorInfo.url,
          component: errorInfo.component
        })
      }
      
      // 只保留最近100個錯誤
      if (this.errors.length > 100) {
        this.errors = this.errors.slice(-100)
      }
      
      // 如果是嚴重錯誤，自動顯示監控面板
      if (this.isCriticalError(errorInfo)) {
        this.showMonitor = true
      }
      
      console.error('🚨 錯誤已記錄:', errorInfo)
    },
    
    /**
     * 判斷是否為嚴重錯誤
     */
    isCriticalError(errorInfo) {
      const criticalPatterns = [
        'network error',
        'failed to fetch',
        'script error',
        'cors',
        'authentication'
      ]
      
      const message = errorInfo.message?.toLowerCase() || ''
      return criticalPatterns.some(pattern => message.includes(pattern))
    },
    
    /**
     * 切換監控面板顯示
     */
    toggleMonitor() {
      this.showMonitor = !this.showMonitor
    },
    
    /**
     * 關閉監控面板
     */
    closeMonitor() {
      this.showMonitor = false
    },
    
    /**
     * 清除錯誤記錄
     */
    clearErrors() {
      this.errors = []
      this.showMonitor = false
    },
    
    /**
     * 下載錯誤報告
     */
    downloadErrorReport() {
      const report = {
        timestamp: new Date().toISOString(),
        environment: import.meta.env.VITE_APP_ENV,
        userAgent: navigator.userAgent,
        url: window.location.href,
        errors: this.errors,
        performanceStats: performanceService?.getPerformanceStats()
      }
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `error-report-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
    },
    
    /**
     * 格式化時間顯示
     */
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.error-monitor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-monitor-panel {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.monitor-header {
  background: #dc3545;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.monitor-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.error-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
}

.error-item {
  border-bottom: 1px solid #eee;
  padding: 0.75rem 0;
}

.error-item:last-child {
  border-bottom: none;
}

.error-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
}

.error-time {
  color: #666;
}

.error-type {
  background: #dc3545;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
}

.error-message {
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: #333;
}

.error-url {
  font-size: 0.8rem;
  color: #666;
  font-family: monospace;
}

.monitor-actions {
  padding: 1rem;
  background: #f8f9fa;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.clear-btn, .report-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.clear-btn {
  background: #6c757d;
  color: white;
}

.clear-btn:hover {
  background: #5a6268;
}

.report-btn {
  background: #007bff;
  color: white;
}

.report-btn:hover {
  background: #0056b3;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .error-monitor-panel {
    width: 95%;
    max-height: 90vh;
  }
  
  .monitor-actions {
    flex-direction: column;
  }
  
  .clear-btn, .report-btn {
    width: 100%;
  }
}
</style> 