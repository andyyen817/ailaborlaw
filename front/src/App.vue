<template>
  <div class="app-container bg-slate-100 min-h-screen" :class="{ 'desktop-only': isMobileRoute }">
    <!-- 移除版本切換導航欄 -->

    <!-- 主内容区域 -->
    <main>
      <router-view />
    </main>

    <!-- 錯誤監控組件 -->
    <ErrorMonitor v-if="isDebugMode" />
  </div>
</template>

<script>
import { onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import conversationService from '@/services/conversationService'
import authService from '@/services/auth'
import adminAuthService from '@/services/adminAuth'
import ErrorMonitor from '@/components/common/ErrorMonitor.vue'

export default {
  components: {
    ErrorMonitor
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    // 計算是否為調試模式
    const isDebugMode = computed(() => {
      return import.meta.env.VITE_ENABLE_DEBUG === 'true' || import.meta.env.MODE === 'development'
    })
    
    // 检测设备类型
    const checkDeviceType = () => {
      console.log('執行設備檢測, 當前路徑:', window.location.pathname, '查詢參數:', window.location.search);
      
      // 檢查URL參數是否包含阻止重定向的標記
      if (window.location.search.includes('prevent_redirect=true') ||
          window.location.search.includes('t=') ||
          window.location.search.includes('force=true')) {
        console.log('檢測到特殊URL參數，禁用自動設備檢測重定向');
        console.log('URL參數:', window.location.search);
        return;
      }
      
      // 檢查當前是否在登入頁面，如果是則不進行設備檢測重定向
      if (window.location.pathname === '/login' || 
          window.location.pathname === '/mobile/login' ||
          window.location.pathname === '/register' ||
          window.location.pathname === '/mobile/register') {
        console.log('檢測到登入/註冊頁面，禁用自動設備檢測重定向');
        console.log('當前路徑:', window.location.pathname);
        return;
      }
    
      // 檢測設備類型並自動跳轉
      
      // 检查是否为移动设备（屏幕宽度小于768px）
      const isMobile = window.innerWidth < 768
      
      // 当前路径
      const currentPath = route.path
      
      // 检查当前路径是否已经是移动端路径
      const isMobilePath = currentPath.startsWith('/mobile')
      
      // 如果是移动设备但不是移动端路径，重定向到相应的移动端页面
      if (isMobile && !isMobilePath && !currentPath.startsWith('/admin')) {
        // 主页重定向
        if (currentPath === '/' || currentPath.startsWith('/user/')) {
          console.log('檢測到移動設備訪問桌面首頁，重定向到移動首頁');
          router.replace('/mobile');
          return;
        }
        
        // 聊天頁面重定向
        if (currentPath.includes('/chat')) {
          console.log('檢測到移動設備訪問桌面聊天頁，重定向到移動聊天頁');
          router.replace({
            path: '/mobile/chat',
            query: route.query
          });
          return;
        }
        
        // 個人資料頁面重定向
        if (currentPath.includes('/profile')) {
          console.log('檢測到移動設備訪問桌面個人資料頁，重定向到移動個人資料頁');
          router.replace('/mobile/profile');
          return;
        }
      }
      
      // 如果是桌面设备但访问的是移动端路径，重定向到相应的桌面端页面
      if (!isMobile && isMobilePath) {
        // 移动端主页重定向到桌面端主页
        if (currentPath === '/mobile') {
          console.log('檢測到桌面設備訪問移動首頁，重定向到桌面首頁');
          router.replace('/');
          return;
        }
        
        // 移动端聊天页面重定向到桌面端聊天页面
        if (currentPath === '/mobile/chat') {
          console.log('檢測到桌面設備訪問移動聊天頁，重定向到桌面聊天頁');
          router.replace({ 
            path: '/chat',
            query: route.query
          });
          return;
        }
        
        // 移動版個人資料頁面重定向到桌面個人資料頁面
        if (currentPath === '/mobile/profile') {
          console.log('檢測到桌面設備訪問移動個人資料頁，重定向到桌面個人資料頁');
          router.replace('/profile');
          return;
        }
      }
    }
    
    // 监听窗口大小变化
    const handleResize = () => {
      checkDeviceType()
    }
    
    // 定义一个同步事件
    const APP_SYNC_EVENT = 'app_data_sync'
    
    // 定义一个触发同步的函数
    const triggerSync = () => {
      const syncEvent = new CustomEvent(APP_SYNC_EVENT)
      window.dispatchEvent(syncEvent)
      console.log('已触发同步事件')
    }
    
    // 监听路由变化，当用户在移动端和桌面端之间切换时触发同步
    let previousIsMobile = null
    
    watch(
      () => route.path,
      (newPath, oldPath) => {
        const currentIsMobile = newPath.startsWith('/mobile')
        const previousWasMobile = oldPath?.startsWith('/mobile')
        
        // 檢查是否為認證頁面，避免在註冊/登錄過程中觸發同步
        const isAuthPage = newPath === '/login' || 
                          newPath === '/register' || 
                          newPath === '/mobile/login' || 
                          newPath === '/mobile/register' ||
                          newPath.startsWith('/admin/login')
        
        // 如果从桌面端切换到移动端或从移动端切换到桌面端，并且不是认证页面，触发同步
        if (previousWasMobile !== null && currentIsMobile !== previousWasMobile && !isAuthPage) {
          console.log('检测到路由切换:', previousWasMobile ? '桌面端 -> 移动端' : '移动端 -> 桌面端')
          
          // 触发同步事件
          triggerSync()
        }
        
        previousIsMobile = currentIsMobile
      }
    )
    
    // 處理認證失敗事件
    const handleAuthFailure = (event) => {
      console.warn('用戶認證失敗事件捕獲:', event.detail);
      
      // 🔧 修复：检查是否在管理员页面，避免错误处理管理员认证失败
      const currentPath = route.path;
      if (currentPath.startsWith('/admin')) {
        console.log('🔒 管理员页面忽略用户认证失败事件');
        return;
      }
      
      // 這裡應該強制登出並清理認證狀態
      authService.logout(false); // 不重定向，由下面的代碼處理
      
      // 決定重定向到哪個登入頁面
      const loginPath = route.path.startsWith('/mobile') ? '/mobile/login' : '/login';
      
      // 使用Vue Router進行導航
      router.push({
        path: loginPath,
        query: { 
          redirect: route.fullPath,
          auth_error: 'expired'
        }
      });
    };
    
    // 🔧 新增：處理管理員認證失敗事件
    const handleAdminAuthFailure = (event) => {
      console.warn('管理員認證失敗事件捕獲:', event.detail);
      
      // 🔧 修复：只有在管理员页面才处理管理员认证失败
      const currentPath = route.path;
      if (!currentPath.startsWith('/admin')) {
        console.log('🔒 非管理员页面忽略管理员认证失败事件');
        return;
      }
      
      // 清理管理員認證狀態
      if (typeof adminAuthService !== 'undefined' && adminAuthService.logout) {
        adminAuthService.logout(false); // 不重定向，由下面的代碼處理
      } else {
        // 如果没有adminAuthService，直接清理localStorage
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_data');
        localStorage.removeItem('admin_user');
      }
      
      // 跳轉到管理員登入頁面
      router.push({
        path: '/admin/login',
        query: { 
          redirect: route.fullPath,
          auth_error: 'expired'
        }
      });
    };
    
    // 處理權限錯誤事件
    const handlePermissionDenied = (event) => {
      console.warn('權限不足事件捕獲:', event.detail);
      
      // 顯示錯誤消息，但不登出用戶
      // 這裡可以添加全局通知組件的調用
      console.error('您沒有權限執行此操作');
    };
    
    // 🔧 新增：處理管理員權限錯誤事件
    const handleAdminPermissionDenied = (event) => {
      console.warn('管理員權限不足事件捕獲:', event.detail);
      
      // 顯示錯誤消息，但不登出管理員
      console.error('您沒有權限執行此管理操作');
    };
    
    // 處理網絡錯誤事件
    const handleNetworkError = (event) => {
      console.warn('網絡錯誤事件捕獲:', event.detail);
      
      // 顯示網絡錯誤提示
      console.error('網絡連接問題，請檢查您的網絡設置');
    };
    
    // 處理一般認證錯誤事件
    const handleAuthError = (event) => {
      console.warn('認證錯誤事件捕獲:', event.detail);
      
      // 顯示一般錯誤提示
      console.error('認證過程發生錯誤: ' + (event.detail.message || '未知錯誤'));
    };
    
    onMounted(() => {
      // 初始检测
      checkDeviceType()
      
      // 监听窗口大小变化
      window.addEventListener('resize', handleResize)
      
      // 在组件挂载后立即触发一次同步（但排除登錄/註冊頁面）
      setTimeout(() => {
        const currentPath = route.path
        const isAuthPage = currentPath === '/login' || 
                          currentPath === '/register' || 
                          currentPath === '/mobile/login' || 
                          currentPath === '/mobile/register' ||
                          currentPath.startsWith('/admin/login')
        
        // 只有在非認證頁面才觸發同步，避免干擾用戶註冊/登錄流程
        if (!isAuthPage) {
          triggerSync()
        }
      }, 1000)
      
      // 添加用戶認證事件監聽
      window.addEventListener('auth:unauthenticated', handleAuthFailure);
      window.addEventListener('auth:permission_denied', handlePermissionDenied);
      window.addEventListener('auth:network_error', handleNetworkError);
      window.addEventListener('auth:error', handleAuthError);
      
      // 🔧 新增：添加管理員認證事件監聽
      window.addEventListener('admin:unauthenticated', handleAdminAuthFailure);
      window.addEventListener('admin:permission_denied', handleAdminPermissionDenied);
      
      // 注释掉自动登录代码，防止登出后自动重新登录
      /*
      // 为开发环境添加模拟用户登录，如果用户未登录
      if (import.meta.env.DEV && !localStorage.getItem('auth_token')) {
        console.log('开发环境: 添加模拟用户登录')
        localStorage.setItem('auth_token', 'mock_token_' + Date.now())
        localStorage.setItem('auth_user', JSON.stringify({
          id: 'user123456',
          email: 'test@ailaborlaw.com',
          name: '测试用户'
        }))
      }
      */
    })
    
    onUnmounted(() => {
      // 移除事件监听
      window.removeEventListener('resize', handleResize)
      
      // 移除用戶認證事件監聽
      window.removeEventListener('auth:unauthenticated', handleAuthFailure);
      window.removeEventListener('auth:permission_denied', handlePermissionDenied);
      window.removeEventListener('auth:network_error', handleNetworkError);
      window.removeEventListener('auth:error', handleAuthError);
      
      // 🔧 新增：移除管理員認證事件監聽
      window.removeEventListener('admin:unauthenticated', handleAdminAuthFailure);
      window.removeEventListener('admin:permission_denied', handleAdminPermissionDenied);
    })
    
    return {
      triggerSync,
      isDebugMode
    }
  },
  computed: {
    // 判断当前是否为移动路由
    isMobileRoute() {
      return this.$route.path.startsWith('/mobile');
    },
    // 判断是否显示导航栏（在登录、注册和管理页面不显示，新增：在移動版也不顯示）
    showNavBar() {
      const noNavRoutes = [
        '/login', 
        '/register', 
        '/mobile/login', 
        '/mobile/register',
        '/admin/login', // 添加管理员登录页
        // 根据需要，也可以用 startsWith('/admin') 来排除所有管理页面
      ];
      // 对于仪表盘等管理页面，也应该隐藏这个导航
      if (this.$route.path.startsWith('/admin/')) {
        return false;
      }
      // 在移動版頁面不顯示導航欄
      if (this.$route.path.startsWith('/mobile/')) {
        return false;
      }
      return !noNavRoutes.includes(this.$route.path);
    }
  }
}
</script>

<style>
/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  /* background-color: #f1f5f9; */ /* 由 Tailwind 控制或在根元素上设置 */
}

/* 浏览器模拟样式共享 */
.browser-container {
  @apply bg-gray-100;
  min-height: 100vh;
}

.browser-header {
  @apply bg-gray-200 p-2 flex items-center;
}

.browser-buttons {
  @apply flex space-x-2 mr-2;
}

.browser-button {
  @apply w-3 h-3 rounded-full;
}

.browser-button-red {
  @apply bg-red-500;
}

.browser-button-yellow {
  @apply bg-yellow-500;
}

.browser-button-green {
  @apply bg-green-500;
}

.browser-address-bar {
  @apply flex-1 bg-white rounded px-3 py-1 text-sm text-gray-700;
}

.browser-content {
  @apply p-4;
}

/* 版本切換導航欄樣式保留，只是不顯示 */
.version-switcher {
  position: fixed;
  top: 10px;
  left: 0;
  right: 0;
  z-index: 100;
  display: none; /* 保持隱藏 */
}

.version-switcher.visible {
  display: none; /* 更改為始終隱藏 */
}
</style>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
