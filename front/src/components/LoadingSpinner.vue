<template>
  <!-- 統一加載 Spinner 組件 -->
  <div class="loading-spinner" :class="{ 'inline': inline }">
    <div v-if="!inline" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner-container">
          <div class="spinner" :class="sizeClass"></div>
        </div>
        <p v-if="message" class="loading-message">{{ message }}</p>
      </div>
    </div>
    <div v-else class="inline-spinner">
      <div class="spinner" :class="sizeClass"></div>
      <span v-if="message" class="ml-2 text-sm text-gray-600">{{ message }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    // 是否為內聯顯示
    inline: {
      type: Boolean,
      default: false
    },
    // 加載提示信息
    message: {
      type: String,
      default: ''
    },
    // 尺寸大小
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    }
  },
  computed: {
    sizeClass() {
      return {
        'w-4 h-4': this.size === 'small',
        'w-6 h-6': this.size === 'medium',
        'w-8 h-8': this.size === 'large'
      }
    }
  }
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  text-align: center;
  max-width: 280px;
}

.spinner-container {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.inline-spinner {
  display: inline-flex;
  align-items: center;
}

.spinner {
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-message {
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 響應式優化 */
@media (max-width: 640px) {
  .loading-content {
    padding: 20px;
    margin: 16px;
  }
  
  .loading-message {
    font-size: 13px;
  }
}
</style> 