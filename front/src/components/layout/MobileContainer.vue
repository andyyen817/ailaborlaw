<template>
  <!-- iPhone 容器，移除狀態欄 -->
  <div class="iphone-container">
    <!-- 導航按鈕，如果需要的話 -->
    <router-link v-if="showBackButton" :to="backRoute" class="back-button">
      <i class="fas fa-arrow-left"></i>
    </router-link>
    
    <!-- 回首頁按鈕，如果需要的話 -->
    <router-link v-if="showHomeButton" to="/mobile" class="home-button">
      <!-- 首页图标 -->
      <svg width="18" height="18" viewBox="0 0 576 512" fill="#4b5563">
        <path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z"/>
      </svg>
    </router-link>
    
    <!-- 選項按鈕，如果需要的話 -->
    <button v-if="showSettingsButton" @click="$emit('openSettings')" class="settings-button">
      <svg width="18" height="18" viewBox="0 0 512 512" fill="#4b5563">
        <path d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"/>
      </svg>
    </button>
    
    <!-- 内容插槽 -->
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'MobileContainer',
  props: {
    showBackButton: {
      type: Boolean,
      default: false
    },
    backRoute: {
      type: String,
      default: '/'
    },
    showSettingsButton: {
      type: Boolean,
      default: false
    },
    showHomeButton: {
      type: Boolean,
      default: false
    }
  },
  emits: ['openSettings']
}
</script>

<style scoped>
.iphone-container {
  width: 100%;
  max-width: 430px;
  height: 100vh;
  margin: 0 auto;
  background-color: #ffffff;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
}

.back-button {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 1000;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.settings-button {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 1000;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
}

.home-button {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 1000;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
}

@media (min-width: 768px) {
  .iphone-container {
    margin-top: 2rem;
    margin-bottom: 2rem;
    height: calc(100vh - 4rem);
    border-radius: 20px;
    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.15);
    overflow-y: auto;
  }
}
</style> 