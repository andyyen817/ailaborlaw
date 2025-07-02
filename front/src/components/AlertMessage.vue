<template>
  <!-- 統一提示信息組件 -->
  <transition name="alert-fade">
    <div v-if="visible" class="alert-container" :class="containerClass">
      <div class="alert-content">
        <div class="alert-icon">
          <i :class="iconClass"></i>
        </div>
        <div class="alert-text">
          <h3 v-if="title" class="alert-title">{{ title }}</h3>
          <div class="alert-message">
            <slot>{{ message }}</slot>
          </div>
        </div>
        <button v-if="closable" @click="close" class="alert-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'AlertMessage',
  props: {
    // 提示類型
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    // 提示標題
    title: {
      type: String,
      default: ''
    },
    // 提示內容
    message: {
      type: String,
      default: ''
    },
    // 是否可關閉
    closable: {
      type: Boolean,
      default: true
    },
    // 自動關閉時間（毫秒）
    autoClose: {
      type: Number,
      default: 0
    },
    // 是否顯示
    show: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visible: this.show
    }
  },
  computed: {
    containerClass() {
      return {
        'alert-success': this.type === 'success',
        'alert-error': this.type === 'error',
        'alert-warning': this.type === 'warning',
        'alert-info': this.type === 'info'
      }
    },
    iconClass() {
      const icons = {
        success: 'fas fa-check-circle text-green-400',
        error: 'fas fa-exclamation-circle text-red-400',
        warning: 'fas fa-exclamation-triangle text-yellow-400',
        info: 'fas fa-info-circle text-blue-400'
      }
      return icons[this.type]
    }
  },
  watch: {
    show(newVal) {
      this.visible = newVal
    }
  },
  mounted() {
    if (this.autoClose > 0) {
      setTimeout(() => {
        this.close()
      }, this.autoClose)
    }
  },
  methods: {
    close() {
      this.visible = false
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.alert-container {
  margin-bottom: 16px;
  border-radius: 8px;
  border-left: 4px solid;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.alert-success {
  background-color: #f0f9ff;
  border-left-color: #10b981;
}

.alert-error {
  background-color: #fef2f2;
  border-left-color: #ef4444;
}

.alert-warning {
  background-color: #fffbeb;
  border-left-color: #f59e0b;
}

.alert-info {
  background-color: #eff6ff;
  border-left-color: #3b82f6;
}

.alert-content {
  display: flex;
  align-items: flex-start;
}

.alert-icon {
  flex-shrink: 0;
  margin-right: 12px;
  font-size: 18px;
}

.alert-text {
  flex: 1;
}

.alert-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.alert-success .alert-title {
  color: #065f46;
}

.alert-error .alert-title {
  color: #991b1b;
}

.alert-warning .alert-title {
  color: #92400e;
}

.alert-info .alert-title {
  color: #1e40af;
}

.alert-message {
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.alert-success .alert-message {
  color: #047857;
}

.alert-error .alert-message {
  color: #dc2626;
}

.alert-warning .alert-message {
  color: #d97706;
}

.alert-info .alert-message {
  color: #2563eb;
}

.alert-close {
  flex-shrink: 0;
  margin-left: 12px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
  line-height: 1;
  transition: color 0.2s;
}

.alert-close:hover {
  color: #374151;
}

/* 動畫效果 */
.alert-fade-enter-active, .alert-fade-leave-active {
  transition: all 0.3s ease;
}

.alert-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.alert-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 移動端優化 */
@media (max-width: 640px) {
  .alert-container {
    margin-bottom: 12px;
    padding: 10px 14px;
  }
  
  .alert-icon {
    margin-right: 10px;
    font-size: 16px;
  }
  
  .alert-title {
    font-size: 13px;
  }
  
  .alert-message {
    font-size: 13px;
  }
}
</style> 