<template>
  <!-- 浏览器模拟容器 -->
  <div class="browser-container">
    <!-- 移除瀏覽器模擬窗口 -->
    
    <div class="browser-content">
      <div class="container mx-auto px-4 py-8">
        <!-- 顶部导航 -->
        <div class="mb-6 flex justify-between items-center">
          <div class="flex items-center">
            <LogoSvg width="30" height="30" class="mr-2" />
            <h1 class="text-xl font-bold text-gray-800">勞法通AI</h1>
          </div>
          
          <div class="flex items-center">
            <div class="mr-4 text-sm text-gray-700">
              歡迎回來，{{ userName }}
            </div>
            
            <div class="relative">
              <button @click="isMenuOpen = !isMenuOpen" class="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none">
                <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {{ userInitials }}
                </span>
                <!-- 替換為內聯SVG下拉箭頭圖標 -->
                <svg class="ml-1 text-xs" width="10" height="10" viewBox="0 0 320 512" fill="currentColor">
                  <path d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"/>
                </svg>
              </button>
              
              <div v-if="isMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <router-link :to="profileRoute" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <!-- 替換為內聯SVG用戶圖標 -->
                  <svg class="inline-block mr-2" width="14" height="14" viewBox="0 0 448 512" fill="currentColor">
                    <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/>
                  </svg>
                  個人資料
                </router-link>
                <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <!-- 替換為內聯SVG設置圖標 -->
                  <svg class="inline-block mr-2" width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"/>
                  </svg>
                  設置
                </a>
                <a href="#" @click.prevent="handleLogout" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <!-- 替換為內聯SVG登出圖標 -->
                  <svg class="inline-block mr-2" width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"/>
                  </svg>
                  登出
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 主要内容 -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- 侧边栏导航 -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow p-4">
              <div class="mb-4">
                <div class="text-sm text-gray-500 mb-1">剩餘諮詢次數</div>
                <div class="text-2xl font-bold text-gray-800">
                  <!-- 🔧 Task 1.1: 添加加载状态和错误处理 -->
                  <span v-if="isLoadingQueries" class="animate-pulse text-gray-400">載入中...</span>
                  <span v-else-if="queriesError" class="text-red-500 cursor-pointer" title="點擊重新載入" @click="loadQueryCount">
                    錯誤 🔄
                  </span>
                  <span v-else-if="remainingQueries !== null">{{ remainingQueries }} 次</span>
                  <span v-else class="text-gray-400">-- 次</span>
                </div>
              </div>
              
              <nav class="space-y-1">
                <router-link :to="homeRoute" class="block px-3 py-2 rounded-md bg-blue-100 text-blue-700 font-medium">
                  <!-- 替換為內聯SVG首頁圖標 -->
                  <svg class="inline-block mr-2" width="16" height="16" viewBox="0 0 576 512" fill="currentColor">
                    <path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z"/>
                  </svg>
                  首頁
                </router-link>
                <router-link :to="chatRoute" class="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 font-medium">
                  <!-- 替換為內聯SVG AI法律諮詢圖標 -->
                  <svg class="inline-block mr-2" width="16" height="16" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M448 0H64C28.7 0 0 28.7 0 64v288c0 35.3 28.7 64 64 64h96v84c0 9.8 11.2 15.5 19.1 9.7L304 416h144c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64zM128 240c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128 0c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128 0c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"/>
                  </svg>
                  AI法律諮詢
                </router-link>
                <router-link :to="profileRoute" class="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 font-medium">
                  <!-- 替換為內聯SVG我的資料圖標 -->
                  <svg class="inline-block mr-2" width="16" height="16" viewBox="0 0 448 512" fill="currentColor">
                    <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/>
                  </svg>
                  我的資料
                </router-link>
                <router-link :to="consultationRoute" class="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 font-medium">
                  <!-- 替換為更合適的專家諮詢圖標 - 公事包/顧問圖標 -->
                  <svg class="inline-block mr-2" width="16" height="16" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M320 336c0 8.84-7.16 16-16 16h-96c-8.84 0-16-7.16-16-16v-48H0v144c0 25.6 22.4 48 48 48h416c25.6 0 48-22.4 48-48V288H320v48zm144-208h-80V80c0-25.6-22.4-48-48-48H176c-25.6 0-48 22.4-48 48v48H48c-25.6 0-48 22.4-48 48v80h512v-80c0-25.6-22.4-48-48-48zm-144 0H192V96h128v32z"/>
                  </svg>
                  專家諮詢
                </router-link>
                <router-link :to="inviteRoute" class="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 font-medium">
                  <!-- 替換為內聯SVG邀請好友圖標 -->
                  <svg class="inline-block mr-2" width="16" height="16" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M32 448c0 17.7 14.3 32 32 32h160V320H32v128zm256 32h160c17.7 0 32-14.3 32-32V320H288v160zm192-320h-42.1c6.2-12.1 10.1-25.5 10.1-40 0-48.5-39.5-88-88-88-41.6 0-68.5 21.3-103 68.3-34.5-47-61.4-68.3-103-68.3-48.5 0-88 39.5-88 88 0 14.5 3.8 27.9 10.1 40H32c-17.7 0-32 14.3-32 32v80c0 8.8 7.2 16 16 16h480c8.8 0 16-7.2 16-16v-80c0-17.7-14.3-32-32-32zm-326.1 0c-22.1 0-40-17.9-40-40s17.9-40 40-40c19.9 0 34.6 3.3 86.1 80h-86.1zm206.1 0h-86.1c51.4-76.5 65.7-80 86.1-80 22.1 0 40 17.9 40 40s-17.9 40-40 40z"/>
                  </svg>
                  邀請好友
                </router-link>
              </nav>
            </div>
          </div>
          
          <!-- 主内容区 -->
          <div class="lg:col-span-3">
            <!-- 欢迎卡片 -->
            <div class="bg-white rounded-lg shadow p-6 mb-6">
              <h2 class="text-xl font-bold text-gray-800 mb-2">歡迎使用勞法通AI</h2>
              <p class="text-gray-600 mb-4">
                您可以隨時向我們的AI顧問提問關於台灣勞動法規的問題，獲取專業解答。
              </p>
              <button @click="startNewConsultation" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center inline-block">
                <!-- 替換為內聯SVG諮詢圖標 -->
                <svg class="mr-2" width="16" height="16" viewBox="0 0 512 512" fill="currentColor">
                  <path d="M448 0H64C28.7 0 0 28.7 0 64v288c0 35.3 28.7 64 64 64h96v84c0 9.8 11.2 15.5 19.1 9.7L304 416h144c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64zM128 240c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128 0c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128 0c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"/>
                </svg>
                開始諮詢
              </button>
            </div>
            
            <!-- 快速问题卡片 -->
            <div class="bg-white rounded-lg shadow p-6 mb-6">
              <h3 class="text-lg font-bold text-gray-800 mb-4">常見問題</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="border border-gray-200 rounded-md p-4 hover:bg-blue-50 cursor-pointer transition"
                  @click="goToQuestionChat('如何計算加班費？')">
                  <h4 class="font-medium text-gray-800 mb-1">如何計算加班費？</h4>
                  <p class="text-sm text-gray-600">了解加班費的計算方式和相關規定</p>
                </div>
                
                <div class="border border-gray-200 rounded-md p-4 hover:bg-blue-50 cursor-pointer transition"
                  @click="goToQuestionChat('年終獎金是否強制？')">
                  <h4 class="font-medium text-gray-800 mb-1">年終獎金是否強制？</h4>
                  <p class="text-sm text-gray-600">了解年終獎金的相關法律規定</p>
                </div>
                
                <div class="border border-gray-200 rounded-md p-4 hover:bg-blue-50 cursor-pointer transition"
                  @click="goToQuestionChat('勞健保如何計算？')">
                  <h4 class="font-medium text-gray-800 mb-1">勞健保如何計算？</h4>
                  <p class="text-sm text-gray-600">了解勞工保險和健康保險的計算方式</p>
                </div>
                
                <div class="border border-gray-200 rounded-md p-4 hover:bg-blue-50 cursor-pointer transition"
                  @click="goToQuestionChat('試用期間可以解雇嗎？')">
                  <h4 class="font-medium text-gray-800 mb-1">試用期間可以解雇嗎？</h4>
                  <p class="text-sm text-gray-600">了解試用期間解雇的相關規定</p>
                </div>
              </div>
            </div>
            
            <!-- 最近咨询 -->
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-gray-800">最近諮詢</h3>
                <a href="#" class="text-sm text-blue-600 hover:text-blue-800">查看全部</a>
              </div>
              
              <div v-if="recentConsultations.length === 0" class="text-center py-6 text-gray-500">
                <i class="fas fa-inbox text-3xl mb-2"></i>
                <p>暫無諮詢記錄</p>
              </div>
              
              <div v-else class="space-y-4">
                <div 
                  v-for="(consultation, index) in recentConsultations" 
                  :key="index" 
                  @click="goToConversation(consultation.id)"
                  class="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0 cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors duration-150"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-medium text-gray-800">{{ consultation.title }}</h4>
                      <p class="text-sm text-gray-600 mt-1">{{ consultation.date }}</p>
                    </div>
                    <span class="px-2 py-1 text-xs rounded-full" :class="statusClass(consultation.status)">
                      {{ statusText(consultation.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/auth'
import aiChatService from '@/services/aiChatService'
import { fixCacheIsolation } from '@/utils/cache-fix'
import LogoSvg from '@/components/LogoSvg.vue'
// 🔧 Task 1.1: userService动态导入以避免循环依赖，在函数内部导入

export default {
  name: 'HomeView',
  components: {
    LogoSvg
  },
  setup() {
    const router = useRouter()
    const isMenuOpen = ref(false)
    const currentUser = ref(null) // 先设为null，避免API未集成导致错误
    const userName = ref('用戶') // 默认用户名
    const recentConsultations = ref([])
    
    // 🔧 Task 1.1: 添加咨询次数状态管理
    const remainingQueriesData = ref(null) // 直接从API获取的数据
    const isLoadingQueries = ref(false) // 加载状态
    const queriesError = ref(null) // 错误状态
    
    // 計算屬性：獲取用戶ID用於路由
    const userId = computed(() => {
      return localStorage.getItem('auth_user_id') || '';
    });
    
    // 計算屬性：主頁路由
    const homeRoute = computed(() => {
      return userId.value ? `/user/${userId.value}` : '/';
    });
    
    // 計算屬性：聊天頁路由
    const chatRoute = computed(() => {
      return userId.value ? `/user/${userId.value}/chat` : '/chat';
    });
    
    // 計算屬性：個人資料頁路由
    const profileRoute = computed(() => {
      return userId.value ? `/user/${userId.value}/profile` : '/profile';
    });
    
    // 計算屬性：專家諮詢頁路由
    const consultationRoute = computed(() => {
      return userId.value ? `/user/${userId.value}/consultation` : '/consultation';
    });
    
    // 計算屬性：邀請好友頁路由
    const inviteRoute = computed(() => {
      return userId.value ? `/user/${userId.value}/invite` : '/invite';
    });
    
    // 🔧 Task 1.1: 添加咨询次数API调用函数
    const loadQueryCount = async () => {
      isLoadingQueries.value = true;
      queriesError.value = null;
      
      try {
        // 动态导入userService以避免循环依赖
        const userServiceModule = await import('@/services/userService');
        const userService = userServiceModule.default;
        
        console.log('🏠 首页：开始获取咨询次数...');
        const response = await userService.getMyQueryStatus();
        
        if (response && response.success && response.data) {
          remainingQueriesData.value = response.data.remainingQueries;
          console.log('🏠 首页：咨询次数获取成功:', remainingQueriesData.value);
        } else {
          throw new Error('API响应格式错误');
        }
      } catch (error) {
        console.error('🏠 首页：获取咨询次数失败:', error);
        queriesError.value = error.message;
        
        // 降级到本地数据
        try {
          const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
          if (authUser.remaining_free_queries !== undefined) {
            remainingQueriesData.value = authUser.remaining_free_queries;
            console.log('🏠 首页：降级使用本地数据:', remainingQueriesData.value);
          }
        } catch (localError) {
          console.error('🏠 首页：本地数据也无法获取:', localError);
        }
      } finally {
        isLoadingQueries.value = false;
      }
    };

    // 🔧 Task 1.1: 添加咨询次数更新事件监听
    const handleQueryCountUpdate = (event) => {
      if (event.detail && typeof event.detail.remainingQueries === 'number') {
        remainingQueriesData.value = event.detail.remainingQueries;
        console.log('🏠 首页：收到咨询次数更新事件:', event.detail.remainingQueries);
      }
    };

    // 尝试获取当前用户
    try {
      const user = authService.getCurrentUser()
      if (user) {
        currentUser.value = user
        if (user.name) {
          userName.value = user.name
        } else if (user.email) {
          userName.value = user.email.split('@')[0]
        }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
    
    // 加载最近咨询历史
    const loadRecentConsultations = async () => {
      try {
        console.log('🔄 正在從後端API加載最近諮詢數據...');
        
        // 🔧 修复：首次加载时强制刷新，确保获取当前用户的数据
        const currentUserId = authService.getCurrentUserId();
        console.log('👤 当前用户ID:', currentUserId);
        
        // 使用aiChatService獲取用戶的會話列表（强制刷新避免旧缓存）
        const response = await aiChatService.getSessionList({
          page: 1,
          limit: 5 // 只獲取最近5個會話
        }, true); // 🔧 修复：强制刷新，绕过可能的混合用户缓存
        
        // 🔧 修复：正确访问响应数据结构
        if (response && response.success && response.data && response.data.sessions && response.data.sessions.length > 0) {
          // 格式化會話數據供首頁顯示，使用API文档中的正确字段名
          recentConsultations.value = response.data.sessions.map(session => ({
            id: session.sessionId, // 🔧 使用API文档中的sessionId字段
            title: session.title || '新的對話',
            date: formatDate(session.lastMessageAt || session.createdAt), // 🔧 使用API文档中的lastMessageAt字段
            status: session.status === 'active' ? 'completed' : 'completed' // 根据API文档调整状态映射
          }));
          
          console.log('✅ 成功加載最近諮詢:', recentConsultations.value.length, '個會話');
        } else {
          console.log('📭 沒有找到會話記錄');
          recentConsultations.value = [];
        }
      } catch (error) {
        console.error('❌ 加載最近諮詢失敗:', error);
        
        // 錯誤處理：嘗試降級到本地存儲（如果需要）
        console.log('🔄 嘗試降級處理...');
        recentConsultations.value = [];
        
        // 可選：顯示用戶友好的錯誤提示
        // 這裡可以添加toast通知或其他UI反饋
      }
    };
    
    // 格式化日期（保留原有函數以便其他地方使用）
    const formatDate = (date) => {
      if (!date) return '';
      
      const d = date instanceof Date ? date : new Date(date);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (d >= today) {
        // 今天 - 显示时间
        return `今天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      } else if (d >= yesterday) {
        // 昨天
        return `昨天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      } else {
        // 更早 - 显示日期
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      }
    };
    
    // 窗口大小变化处理函数
    const handleResize = () => {
      // 可以添加响应式处理逻辑
    };
    
    // 🔧 Task 1.1: 修改组件挂载时的逻辑
    onMounted(async () => {
      // 🔧 修复：首先清除可能的混合用户缓存
      console.log('🔧 HomeView: 执行缓存修复...');
      fixCacheIsolation();
      
      // 并行加载数据以提高性能
      await Promise.all([
        loadRecentConsultations(),
        loadQueryCount() // 添加咨询次数加载
      ]);
      
      // 监听窗口大小变化
      window.addEventListener('resize', handleResize);
      
      // 🔧 Task 1.1: 添加咨询次数更新事件监听
      window.addEventListener('queryCountUpdated', handleQueryCountUpdate);
    })
    
    // 🔧 Task 1.1: 组件卸载时移除所有事件监听
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('queryCountUpdated', handleQueryCountUpdate);
    })
    
    // 计算属性：用户首字母头像
    const userInitials = computed(() => {
      if (userName.value) {
        return userName.value.charAt(0);
      }
      return '用';
    })
    
    // 🔧 Task 1.1: 修复后的剩余咨询次数计算
    const remainingQueries = computed(() => {
      // 优先使用API获取的实时数据
      if (remainingQueriesData.value !== null) {
        return remainingQueriesData.value;
      }
      
      // 降级：从本地用户数据获取
      if (currentUser.value?.remainingQueries !== undefined) {
        return currentUser.value.remainingQueries;
      }
      
      // 降级：备用字段名
      if (currentUser.value?.remaining_free_queries !== undefined) {
        return currentUser.value.remaining_free_queries;
      }
      
      // 最后降级：从localStorage获取
      try {
        const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
        if (authUser.remaining_free_queries !== undefined) {
          return authUser.remaining_free_queries;
        }
      } catch (error) {
        console.error('解析localStorage失败:', error);
      }
      
      // 如果数据正在加载中，显示加载状态而不是默认值
      if (isLoadingQueries.value) {
        return '...'; // 加载中显示
      }
      
      // 只有在所有数据源都失败时才返回null，让UI显示错误状态
      return queriesError.value ? 0 : null;
    })
    
    // 方法：状态样式类
    const statusClass = (status) => {
      const classes = {
        'completed': 'bg-green-100 text-green-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'cancelled': 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800';
    }
    
    // 方法：状态文本
    const statusText = (status) => {
      const texts = {
        'completed': '已完成',
        'pending': '待回覆',
        'cancelled': '已取消'
      }
      return texts[status] || '未知狀態';
    }
    
    // 方法：处理登出
    const handleLogout = () => {
      // 先清除認證信息
      authService.logout();
      isMenuOpen.value = false; // 關閉菜單
      
      // 直接設置頁面 location，繞過 Vue Router
      const timestamp = new Date().getTime();
      document.location.href = `${window.location.origin}/login?t=${timestamp}`;
    }
    
    // 方法：跳转到指定对话
    const goToConversation = (conversationId) => {
      console.log('跳轉到指定對話:', conversationId);
      
      // 檢查用戶是否已登錄
      if (!authService.isAuthenticated()) {
        console.warn('用戶未登錄');
        router.push({ name: 'login' });
        return;
      }
      
      // 跳轉到聊天頁面，使用會話ID
      if (userId.value) {
        // 用戶專屬路由，直接跳轉到聊天頁面
        // AI聊天頁面會自動加載指定的會話
        router.push({
          name: 'userChat',
          params: { userId: userId.value },
          query: { id: conversationId }
        });
      } else {
        // 通用路由
        router.push({
          name: 'chat',
          query: { id: conversationId }
        });
      }
    };
    
    // 方法：跳转到常见问题聊天
    const goToQuestionChat = (question) => {
      console.log('跳转到常见问题聊天:', question);
      
      // 检查用户是否已登录
      if (!authService.isAuthenticated()) {
        console.warn('用户未登录');
        router.push({ name: 'login' });
        return;
      }
      
      // 🔧 修復：跳轉到聊天頁面，只傳遞問題參數，讓聊天頁面負責創建新會話
      // 不傳遞會話ID，這樣聊天頁面會自動創建新會話
      if (userId.value) {
        router.push({
          name: 'userChat',
          params: { userId: userId.value },
          query: { 
            question: encodeURIComponent(question),
            newSession: 'true' // 添加標記表示這是新會話請求
          }
        });
      } else {
        router.push({
          name: 'chat',
          query: { 
            question: encodeURIComponent(question),
            newSession: 'true' // 添加標記表示這是新會話請求
          }
        });
      }
    };
    
    // 方法：開始新的諮詢對話
    const startNewConsultation = () => {
      console.log('開始新的諮詢');
      
      // 檢查用戶是否已登錄
      if (!authService.isAuthenticated()) {
        console.warn('用戶未登錄');
        router.push({ name: 'login' });
        return;
      }
      
      // 跳轉到聊天頁面
      if (userId.value) {
        router.push({
          name: 'userChat',
          params: { userId: userId.value }
        });
      } else {
        router.push({
          name: 'chat'
        });
      }
    };
    
    return {
      isMenuOpen,
      userName,
      userInitials,
      remainingQueries,
      recentConsultations,
      formatDate,
      statusClass,
      statusText,
      goToConversation,
      goToQuestionChat,
      startNewConsultation,
      userId,
      homeRoute,
      chatRoute,
      profileRoute,
      consultationRoute,
      inviteRoute,
      handleLogout,
      // 🔧 Task 1.1: 添加新的状态变量
      isLoadingQueries,
      queriesError,
      loadQueryCount
    }
  }
}
</script> 