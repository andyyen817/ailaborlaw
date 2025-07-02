<template>
  <MobileContainer :showSettingsButton="true" @openSettings="toggleSettings">
    <!-- 頂部背景與LOGO -->
    <div class="home-header-bg">
      <div class="header-logo-container">
        <LogoSvg width="32" height="32" />
        <h1 class="logo-text">勞法通AI</h1>
      </div>
    </div>
    
    <!-- 主内容区 -->
    <div class="mobile-home-container">
      <!-- 用户信息卡片 -->
      <div class="user-card">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="avatar">{{ userInitials }}</div>
            <div class="ml-3">
              <h2 class="text-lg font-bold">{{ userName }}</h2>
              <p class="text-sm text-blue-600">剩餘諮詢次數: {{ remainingQueries }} 次</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 设置菜单 -->
      <div v-if="showSettings" class="settings-menu">
        <div class="settings-header">
          <h3>設置</h3>
          <button @click="toggleSettings" class="close-btn">
            <svg width="14" height="14" viewBox="0 0 352 512" fill="#4b5563">
              <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"/>
            </svg>
          </button>
        </div>
        <div class="settings-items">
          <div class="settings-item" @click="goToHelp">
            <svg width="18" height="18" viewBox="0 0 512 512" fill="#6b7280" class="mr-2">
              <path d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zM262.655 90c-54.497 0-89.255 22.957-116.549 63.758-3.536 5.286-2.353 12.415 2.715 16.258l34.699 26.31c5.205 3.947 12.621 3.008 16.665-2.122 17.864-22.658 30.113-35.797 57.303-35.797 20.429 0 45.698 13.148 45.698 32.958 0 14.976-12.363 22.667-32.534 33.976C247.128 238.528 216 254.941 216 296v4c0 6.627 5.373 12 12 12h56c6.627 0 12-5.373 12-12v-1.333c0-28.462 83.186-29.647 83.186-106.667 0-58.002-60.165-102-116.531-102zM256 338c-25.365 0-46 20.635-46 46 0 25.364 20.635 46 46 46s46-20.636 46-46c0-25.365-20.635-46-46-46z"/>
            </svg>
            <span>幫助與支援</span>
          </div>
          <div class="settings-item" @click="goToProfile">
            <svg width="18" height="18" viewBox="0 0 448 512" fill="#6b7280" class="mr-2">
              <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/>
            </svg>
            <span>個人資料</span>
          </div>
          <div class="settings-item" @click="logout">
            <svg width="18" height="18" viewBox="0 0 512 512" fill="#6b7280" class="mr-2">
              <path d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"/>
            </svg>
            <span>登出</span>
          </div>
        </div>
      </div>
      
      <!-- 设置菜单遮罩层 -->
      <div v-if="showSettings" class="settings-overlay" @click="toggleSettings"></div>
      
      <!-- 欢迎卡片 -->
      <div class="welcome-card">
        <h2 class="text-xl font-bold text-white mb-2">歡迎使用勞法通AI</h2>
        <p class="text-blue-100">
          您可以隨時點擊AI法律諮詢,向我們的AI勞基法顧問提問關於台灣勞動法規的問題，獲取專業解答。
        </p>
      </div>
      
      <!-- 功能导航 -->
      <div class="nav-grid">
        <a href="/mobile/chat" class="nav-item" @click.prevent="handleStartConsultation">
          <div class="nav-icon bg-blue-100 text-blue-600">
            <svg width="22" height="22" viewBox="0 0 512 512" fill="currentColor">
              <path d="M448 0H64C28.7 0 0 28.7 0 64v288c0 35.3 28.7 64 64 64h96v84c0 9.8 11.2 15.5 19.1 9.7L304 416h144c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64zM128 240c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128 0c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128 0c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"/>
            </svg>
          </div>
          <span>AI法律諮詢</span>
        </a>
        
        <a href="#" class="nav-item" @click.prevent="goToProfile">
          <div class="nav-icon bg-indigo-100 text-indigo-600">
            <svg width="22" height="22" viewBox="0 0 448 512" fill="currentColor">
              <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/>
            </svg>
          </div>
          <span>我的資料</span>
        </a>
        
        <a href="#" class="nav-item" @click.prevent="goToExpert">
          <div class="nav-icon bg-green-100 text-green-600">
            <svg width="22" height="22" viewBox="0 0 512 512" fill="currentColor">
              <path d="M320 336c0 8.84-7.16 16-16 16h-96c-8.84 0-16-7.16-16-16v-48H0v144c0 25.6 22.4 48 48 48h416c25.6 0 48-22.4 48-48V288H320v48zm144-208h-80V80c0-25.6-22.4-48-48-48H176c-25.6 0-48 22.4-48 48v48H48c-25.6 0-48 22.4-48 48v80h512v-80c0-25.6-22.4-48-48-48zm-144 0H192V96h128v32z"/>
            </svg>
          </div>
          <span>專家諮詢</span>
        </a>
        
        <a href="#" class="nav-item" @click.prevent="goToInvite">
          <div class="nav-icon bg-yellow-100 text-yellow-600">
            <svg width="22" height="22" viewBox="0 0 512 512" fill="currentColor">
              <path d="M32 448c0 17.7 14.3 32 32 32h160V320H32v128zm256 32h160c17.7 0 32-14.3 32-32V320H288v160zm192-320h-42.1c6.2-12.1 10.1-25.5 10.1-40 0-48.5-39.5-88-88-88-41.6 0-68.5 21.3-103 68.3-34.5-47-61.4-68.3-103-68.3-48.5 0-88 39.5-88 88 0 14.5 3.8 27.9 10.1 40H32c-17.7 0-32 14.3-32 32v80c0 8.8 7.2 16 16 16h480c8.8 0 16-7.2 16-16v-80c0-17.7-14.3-32-32-32zm-326.1 0c-22.1 0-40-17.9-40-40s17.9-40 40-40c19.9 0 34.6 3.3 86.1 80h-86.1zm206.1 0h-86.1c51.4-76.5 65.7-80 86.1-80 22.1 0 40 17.9 40 40s-17.9 40-40 40z"/>
            </svg>
          </div>
          <span>邀請好友</span>
        </a>
      </div>
      
      <!-- 常见问题 -->
      <div class="common-questions">
        <div class="section-header">
          <h3 class="text-lg font-bold">常見問題</h3>
        </div>
        
        <div class="question-items">
          <div class="question-item" @click="goToQuestionChat('如何計算加班費？')">
            <h4>如何計算加班費？</h4>
            <p>了解加班費的計算方式和相關規定</p>
            <span class="arrow-icon">›</span>
          </div>
          
          <div class="question-item" @click="goToQuestionChat('年終獎金是否強制？')">
            <h4>年終獎金是否強制？</h4>
            <p>了解年終獎金的相關法律規定</p>
            <span class="arrow-icon">›</span>
          </div>
          
          <div class="question-item" @click="goToQuestionChat('勞健保如何計算？')">
            <h4>勞健保如何計算？</h4>
            <p>了解勞工保險和健康保險的計算方式</p>
            <span class="arrow-icon">›</span>
          </div>
        </div>
      </div>
      
      <!-- 最近咨询 -->
      <div class="recent-consultations" v-if="recentConsultations.length > 0">
        <div class="section-header">
          <h3 class="text-lg font-bold">最近諮詢</h3>
          <a href="#" class="text-sm text-blue-600" @click.prevent="goToAllConsultations">查看全部</a>
        </div>
        
        <div class="consultation-items">
          <div 
            v-for="(consultation, index) in recentConsultations" 
            :key="index"
            class="consultation-item"
            @click="goToConversation(consultation.id)"
          >
            <div>
              <h4>{{ consultation.title }}</h4>
              <p>{{ consultation.date }}</p>
            </div>
            <span :class="statusClass(consultation.status)">
              {{ statusText(consultation.status) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 无咨询记录时显示 -->
      <div class="empty-state" v-else>
        <span class="empty-icon">·</span>
        <p class="text-gray-500">暫無諮詢記錄</p>
        <button @click="handleStartConsultation" class="start-consultation-btn">
          開始您的第一次諮詢
        </button>
      </div>
    </div>
  </MobileContainer>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import MobileContainer from '@/components/layout/MobileContainer.vue'
import LogoSvg from '@/components/LogoSvg.vue'
import authService from '@/services/auth'
import conversationService from '@/services/conversationService'
import aiChatService from '@/services/aiChatService'

export default {
  name: 'MobileHomeView',
  components: {
    MobileContainer,
    LogoSvg
  },
  setup() {
    const router = useRouter()
    const currentUser = ref(null)
    const userName = ref('用戶') // 默认用户名
    const recentConsultations = ref([])
    const refreshInterval = ref(null) // 添加refreshInterval變量
    const showSettings = ref(false) // 添加设置菜单状态
    
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
        console.log('🔄 移动端正在从后端API加载最近咨询数据...');
        
        // 使用aiChatService获取用户的会话列表（与PC版本一致）
        const response = await aiChatService.getSessionList({
          page: 1,
          limit: 5 // 只获取最近5个会话
        });
        
        // 🔧 修复：正确访问响应数据结构
        if (response && response.success && response.data && response.data.sessions && response.data.sessions.length > 0) {
          // 格式化会话数据供移动端首页显示，使用API文档中的正确字段名
          recentConsultations.value = response.data.sessions.map(session => ({
            id: session.sessionId, // 🔧 使用API文档中的sessionId字段
            title: session.title || '新的對話',
            date: formatDate(session.lastMessageAt || session.createdAt), // 🔧 使用API文档中的lastMessageAt字段
            status: session.status === 'active' ? 'completed' : 'completed' // 根据API文档调整状态映射
          }));
          
          console.log('✅ 移动端成功加载最近咨询:', recentConsultations.value.length, '个会话');
        } else {
          console.log('📭 移动端没有找到会话记录或响应格式错误');
          recentConsultations.value = [];
        }
      } catch (error) {
        console.error('❌ 移动端加载最近咨询失败:', error);
        
        // 错误处理：降级到空数组，不再使用测试数据
        console.log('🔄 移动端尝试降级处理...');
        recentConsultations.value = [];
      }
    };
    
    // 格式化日期
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
    
    // 在组件挂载时加载最近咨询
    onMounted(async () => {
      // 第一次加载数据
      await loadRecentConsultations();
      
      // 每30秒自动刷新一次最近咨询
      refreshInterval.value = setInterval(async () => {
        await loadRecentConsultations();
      }, 30000); // 30 seconds
      
      // 监听app_data_sync事件
      window.addEventListener('app_data_sync', handleSync);
    });
    
    // 组件卸载时清除定时器
    onUnmounted(() => {
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value);
      }
      
      // 移除app_data_sync事件监听
      window.removeEventListener('app_data_sync', handleSync);
    });
    
    // 计算属性：用户首字母头像
    const userInitials = computed(() => {
      if (userName.value) {
        return userName.value.charAt(0);
      }
      return '用';
    })
    
    // 计算属性：剩余咨询次数
    const remainingQueries = computed(() => {
      // 优先从最新的用户数据获取
      if (currentUser.value?.remainingQueries !== undefined) {
        return currentUser.value.remainingQueries;
      }
      // 备用字段名
      if (currentUser.value?.remaining_free_queries !== undefined) {
        return currentUser.value.remaining_free_queries;
      }
      return 10; // 默认值
    })
    
    // 方法：状态样式类
    const statusClass = (status) => {
      const classes = {
        'completed': 'status-completed',
        'pending': 'status-pending',
        'cancelled': 'status-cancelled'
      }
      return classes[status] || 'status-default';
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
    
    // 方法：跳转到指定对话
    const goToConversation = (conversationId) => {
      console.log('移动端跳转到指定对话:', conversationId);
      
      // 检查用户是否已登录
      if (!authService.isAuthenticated()) {
        console.warn('移动端用户未登录');
        router.push({ name: 'mobileLogin' });
        return;
      }
      
      // 直接跳转到聊天页面，使用会话ID（与PC版本一致）
      router.push({
        name: 'mobileChat',
        query: { id: conversationId }
      });
    };
    
    // 方法：处理app_data_sync事件
    const handleSync = () => {
      console.log('MobileHomeView 处理app_data_sync事件');
      loadRecentConsultations();
    };
    
    // 方法：处理开始咨询
    const handleStartConsultation = () => {
      console.log('MobileHomeView 处理开始咨询', authService.isAuthenticated());
      
      // 检查用户是否已登录
      if (!authService.isAuthenticated()) {
        console.warn('用户未登录');
        router.push({ name: 'mobileLogin' });
        return;
      }
      
      // 检查剩余次数
      if (currentUser.value && remainingQueries.value > 0) {
        console.log('开始新会话');
        // 创建新会话
        const newConversationId = conversationService.createNewConversation();
        // 跳转到聊天页面
        if (newConversationId) {
          console.log('开始导航到聊天页面，id:', newConversationId);
          // 使用router.push而不是window.location.href
          router.push({ 
            name: 'mobileChat',
            query: { id: newConversationId }
          });
        } else {
          console.error('创建新会话失败');
          // 仍然使用router.push
          router.push({ name: 'mobileChat' });
        }
      } else {
        console.warn('没有足够的剩余咨询次数');
        // 可以显示提示或跳转到充值页面
        alert('您的咨询次数已用完，请充值');
      }
    };
    
    // 方法：跳转到历史咨询页面
    const goToHistory = () => {
      console.log('MobileHomeView 跳转到历史咨询页面');
      // 使用router.push而不是window.location.href
      router.push({ path: '/mobile/history' });
    };
    
    // 方法：跳转到专家咨询页面
    const goToExpert = () => {
      console.log('MobileHomeView 跳转到专家咨询页面');
      // 使用router.push而不是window.location.href
      router.push('/m/consultation');
    };
    
    // 方法：跳转到邀请好友页面
    const goToInvite = () => {
      console.log('MobileHomeView 跳转到邀请好友页面');
      // 使用router.push而不是window.location.href
      router.push({ name: 'mobileInvite' });
    };
    
    // 切换设置菜单
    const toggleSettings = () => {
      showSettings.value = !showSettings.value;
    };
    
    // 前往个人资料页面
    const goToProfile = () => {
      router.push('/mobile/profile');
      showSettings.value = false;
    };
    
    // 前往帮助与支持页面
    const goToHelp = () => {
      router.push('/mobile/help');
      showSettings.value = false;
    };
    
    // 登出
    const logout = async () => {
      try {
        console.log('🚀 开始执行移动端登出流程...');
        
        // 直接执行登出，不使用任何标记机制
        console.log('🔒 清除认证状态...');
        
        // 步骤1：清除所有认证相关的localStorage数据
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_token_expires');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_user_id');
        
        // 步骤2：清除可能遗留的登出标记
        localStorage.removeItem('logging_out');
        
        // 步骤3：关闭设置菜单
        showSettings.value = false;
        
        console.log('✅ 认证状态已清除');
        
        // 步骤4：使用Vue Router进行页面跳转
        console.log('🔄 跳转到移动端登录页面...');
        await router.push('/mobile/login');
        
        console.log('✅ 移动端登出完成');
        
      } catch (error) {
        console.error('❌ 移动端登出过程中发生错误:', error);
        
        // 即使发生错误，也要确保清除认证状态
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_token_expires');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_user_id');
        localStorage.removeItem('logging_out');
        
        // 强制跳转
        try {
          await router.push('/mobile/login');
        } catch (routerError) {
          console.error('❌ Vue Router跳转失败，使用fallback方案:', routerError);
          window.location.href = '/mobile/login';
        }
      }
    };
    
    // 前往查看所有咨询页面
    const goToAllConsultations = () => {
      console.log('MobileHomeView 跳转到查看所有咨询页面');
      // 使用router.push而不是window.location.href
      router.push({ path: '/mobile/history' });
    };
    
    // 方法：跳转到常见问题聊天
    const goToQuestionChat = (question) => {
      console.log('跳转到常见问题聊天:', question);
      
      // 检查用户是否已登录
      if (!authService.isAuthenticated()) {
        console.warn('用户未登录');
        router.push({ name: 'mobileLogin' });
        return;
      }
      
      // 🔧 修復：不再創建本地會話ID，讓聊天頁面負責創建新會話
      // 只傳遞問題參數和新會話標記
      router.push({
        name: 'mobileChat',
        query: { 
          question: encodeURIComponent(question),
          newSession: 'true' // 添加標記表示這是新會話請求
        }
      });
    };
    
    return {
      userName,
      userInitials,
      remainingQueries,
      recentConsultations,
      showSettings,
      handleStartConsultation,
      goToConversation,
      goToHistory,
      goToExpert,
      goToInvite,
      goToQuestionChat,
      statusClass,
      statusText,
      formatDate,
      toggleSettings,
      goToProfile,
      goToHelp,
      logout,
      goToAllConsultations
    }
  }
}
</script>

<style scoped>
/* 頁面容器樣式 */
.mobile-home-container {
  padding: 15px;
  padding-top: 80px;
  position: relative;
  min-height: 100vh;
  overflow-y: auto; /* 添加垂直滾動 */
  -webkit-overflow-scrolling: touch; /* 增強iOS的滾動體驗 */
  padding-bottom: 60px; /* 增加底部間距，確保內容完全可見 */
}

.home-header-bg {
  position: absolute; /* 改回absolute定位 */
  top: 0;
  left: 0;
  right: 0;
  height: 150px;
  background: linear-gradient(to bottom, #3b82f6, #60a5fa);
  z-index: 0; /* 修改為0，而不是-1 */
  max-width: 430px; /* 限制最大寬度，與容器一致 */
  margin: 0 auto; /* 水平居中 */
  width: 100%; /* 確保佔據可用空間 */
}

/* 添加LOGO與標題樣式 */
.header-logo-container {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  z-index: 1; /* 確保在背景上層 */
}

.logo-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #ffffff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.logo-text {
  margin-left: 8px;
  color: #ffffff;
  font-size: 17px;
  font-weight: 600;
}

/* 用户卡片样式 */
.user-card {
  background: white;
  border-radius: 16px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
  font-size: 16px;
}

/* 欢迎卡片样式 */
.welcome-card {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
}

.welcome-card h2 {
  font-size: 18px;
  margin-bottom: 8px;
}

.welcome-card p {
  font-size: 14px;
  line-height: 1.5;
}

/* 导航网格样式 */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 12px;
  margin-bottom: 25px;
}

.nav-item {
  background: white;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
}

.nav-icon {
  width: 46px;
  height: 46px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  font-size: 18px;
}

.nav-item span {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.common-questions, .recent-consultations {
  margin-bottom: 25px;
}

.question-items {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
}

.question-item {
  padding: 14px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.question-item:last-child {
  border-bottom: none;
}

.question-item h4 {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 15px;
  color: #333;
}

.question-item p {
  font-size: 13px;
  color: #666;
  margin-right: 20px;
}

.arrow-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #999;
}

.consultation-items {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.consultation-item {
  padding: 15px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.consultation-item:last-child {
  border-bottom: none;
}

.consultation-item h4 {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 15px;
  color: #111827;
}

.consultation-item p {
  font-size: 13px;
  color: #6b7280;
}

.status-completed {
  background-color: #dcfce7;
  color: #16a34a;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background-color: #fef3c7;
  color: #d97706;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-cancelled {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-default {
  background-color: #f3f4f6;
  color: #6b7280;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.empty-state {
  background: white;
  border-radius: 16px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.start-consultation-btn {
  margin-top: 15px;
  background-color: #3b82f6;
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 500;
}

/* 设置菜单样式 */
.settings-menu {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 220px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f3f4f6;
}

.settings-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.settings-items {
  padding: 8px 0;
}

.settings-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.settings-item:hover {
  background-color: #f9fafb;
}

.settings-item i {
  font-size: 18px;
  color: #6b7280;
  width: 24px;
  margin-right: 12px;
}

.settings-item span {
  color: #374151;
  font-size: 14px;
}

/* 遮罩层 */
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 990;
}

/* 圖標文字樣式 - 更新為更專業的樣式 */
.icon-text {
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-weight: 500;
  font-family: 'Helvetica', 'Arial', sans-serif;
}

/* 空狀態圖標 */
.empty-icon {
  font-size: 40px;
  color: #d1d5db;
  margin-bottom: 10px;
}
</style> 