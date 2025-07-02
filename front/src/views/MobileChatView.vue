<template>
  <MobileContainer :showBackButton="false" backRoute="/mobile">
    <!-- 聊天頁面表頭 -->
    <div class="chat-header">
      <div class="flex items-center justify-between w-full">
        <button class="menu-button" @click="showConversationList = !showConversationList">
          <!-- 汉堡菜单图标 -->
          <svg width="24" height="24" viewBox="0 0 448 512" fill="white">
            <path d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"/>
          </svg>
        </button>
        <div class="title-section">
          <h1 class="chat-title text-center truncate">{{ currentTitle }}</h1>
          <!-- 🔧 P0 修复：添加剩余次数显示 -->
          <div v-if="remainingQueries !== null" class="remaining-queries-mobile">
            <span :class="['queries-count-mobile', { 'low-queries': remainingQueries <= 5 }]">
              {{ remainingQueries }}
            </span>
          </div>
        </div>
        <button class="options-button" @click="showOptions = !showOptions">
          <!-- 三点选项图标 -->
          <svg width="24" height="24" viewBox="0 0 192 512" fill="white">
            <path d="M96 184c39.8 0 72 32.2 72 72s-32.2 72-72 72-72-32.2-72-72 32.2-72 72-72zM24 80c0 39.8 32.2 72 72 72s72-32.2 72-72S135.8 8 96 8 24 40.2 24 80zm0 352c0 39.8 32.2 72 72 72s72-32.2 72-72-32.2-72-72-72-72 32.2-72 72z"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 会话列表 (侧边栏) -->
    <div class="conversation-list" :class="{ 'active': showConversationList }">
      <div class="conversation-list-header">
        <h2>勞法通AI</h2>
        <button @click="showConversationList = false" class="close-btn">
          <!-- 关闭图标 -->
          <svg width="16" height="16" viewBox="0 0 352 512" fill="#4b5563">
            <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"/>
          </svg>
        </button>
      </div>
      
      <!-- 用户资料简介 -->
      <div class="user-profile">
        <div class="user-avatar">{{ userInitial }}</div>
        <div class="user-info">
          <div class="user-name">{{ userNickname }}</div>
          <div class="user-plan">免費用戶</div>
        </div>
      </div>
      
      <!-- 功能選單項 -->
      <div class="menu-items">
        <div class="menu-category">功能選單</div>
        <div class="menu-item" @click="goToHome">
          <!-- 首页图标 -->
          <svg width="20" height="20" viewBox="0 0 576 512" fill="#3b82f6" class="menu-icon">
            <path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z"/>
          </svg>
          <span>回到首頁</span>
        </div>
        <div class="menu-item" @click="goToProfile">
          <!-- 个人资料图标 -->
          <svg width="20" height="20" viewBox="0 0 448 512" fill="#3b82f6" class="menu-icon">
            <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/>
          </svg>
          <span>我的資料</span>
        </div>
        <div class="menu-item" @click="goToExpert">
          <!-- 专家咨询图标 -->
          <svg width="20" height="20" viewBox="0 0 512 512" fill="#3b82f6" class="menu-icon">
            <path d="M320 336c0 8.84-7.16 16-16 16h-96c-8.84 0-16-7.16-16-16v-48H0v144c0 25.6 22.4 48 48 48h416c25.6 0 48-22.4 48-48V288H320v48zm144-208h-80V80c0-25.6-22.4-48-48-48H176c-25.6 0-48 22.4-48 48v48H48c-25.6 0-48 22.4-48 48v80h512v-80c0-25.6-22.4-48-48-48zm-144 0H192V96h128v32z"/>
          </svg>
          <span>專人諮詢</span>
        </div>
        <div class="menu-item" @click="startNewConversation">
          <!-- 新建对话图标 -->
          <svg width="20" height="20" viewBox="0 0 448 512" fill="#3b82f6" class="menu-icon">
            <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/>
          </svg>
          <span>新建對話</span>
        </div>
        <div class="menu-item" @click="clearCurrentConversation">
          <!-- 清空对话图标 -->
          <svg width="20" height="20" viewBox="0 0 448 512" fill="#3b82f6" class="menu-icon">
            <path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"/>
          </svg>
          <span>清空對話</span>
        </div>
        <div class="menu-item" @click="shareConversation">
          <!-- 分享对话图标 -->
          <svg width="20" height="20" viewBox="0 0 512 512" fill="#3b82f6" class="menu-icon">
            <path d="M503.691 189.836L327.687 37.851C312.281 24.546 288 35.347 288 56.015v80.053C127.371 137.907 0 170.1 0 322.326c0 61.441 39.581 122.309 83.333 154.132 13.653 9.931 33.111-2.533 28.077-18.631C66.066 312.814 132.917 274.316 288 272.085V360c0 20.7 24.3 31.453 39.687 18.164l176.004-152c11.071-9.562 11.086-26.753 0-36.328z"/>
          </svg>
          <span>分享對話</span>
        </div>
        <div class="menu-item" @click="switchToDesktop">
          <!-- 切换到桌面版图标 -->
          <svg width="20" height="20" viewBox="0 0 640 512" fill="#3b82f6" class="menu-icon">
            <path d="M624 416H381.54c-.74 19.81-14.71 32-32.74 32H288c-18.69 0-33.02-17.47-32.77-32H16c-8.8 0-16 7.2-16 16v16c0 35.2 28.8 64 64 64h512c35.2 0 64-28.8 64-64v-16c0-8.8-7.2-16-16-16zM576 48c0-26.4-21.6-48-48-48H112C85.6 0 64 21.6 64 48v336h512V48zm-64 272H128V64h384v256z"/>
          </svg>
          <span>切換到桌面版</span>
        </div>
      </div>
      
      <!-- 底部版本信息 -->
      <div class="sidebar-footer">
        <router-link to="/profile" class="sidebar-footer-link">
          <i class="fas fa-user text-lg mb-1"></i>
          <span class="text-xs">我的資料</span>
        </router-link>
        <router-link to="/m/consultation" class="sidebar-footer-link">
          <i class="fas fa-headset text-lg mb-1"></i>
          <span class="text-xs">專家諮詢</span>
        </router-link>
        <a href="#" class="sidebar-footer-link">
          <i class="fas fa-gift text-lg mb-1"></i>
          <span class="text-xs">邀請好友</span>
        </a>
      </div>
    </div>
    
    <!-- 選項下拉菜單 -->
    <div v-if="showOptions" class="options-dropdown">
      <div class="option-item" @click="startNewConversation">
        <!-- 新建对话图标 -->
        <svg width="18" height="18" viewBox="0 0 448 512" fill="#4b5563" class="mr-2">
          <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/>
        </svg>
        <span>新建對話</span>
      </div>
      <div class="option-item" @click="clearCurrentConversation">
        <!-- 清空对话图标 -->
        <svg width="18" height="18" viewBox="0 0 448 512" fill="#4b5563" class="mr-2">
          <path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"/>
        </svg>
        <span>清空對話</span>
      </div>
      <div class="option-item" @click="shareConversation">
        <!-- 分享对话图标 -->
        <svg width="18" height="18" viewBox="0 0 512 512" fill="#4b5563" class="mr-2">
          <path d="M503.691 189.836L327.687 37.851C312.281 24.546 288 35.347 288 56.015v80.053C127.371 137.907 0 170.1 0 322.326c0 61.441 39.581 122.309 83.333 154.132 13.653 9.931 33.111-2.533 28.077-18.631C66.066 312.814 132.917 274.316 288 272.085V360c0 20.7 24.3 31.453 39.687 18.164l176.004-152c11.071-9.562 11.086-26.753 0-36.328z"/>
        </svg>
        <span>分享對話</span>
      </div>
    </div>
    
    <!-- 聊天内容区 -->
    <div class="chat-body" ref="chatBodyRef">
      <!-- 连接错误提示 -->
      <div v-if="connectionError" class="connection-error">
        <span class="icon-text">!</span>
        測試連接失數，請檢查您的網絡連接後重試
      </div>
      
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="welcome-message">
        <div class="ai-avatar">
          <span class="ai-avatar-large">AI</span>
        </div>
        <h2>歡迎使用勞法通AI</h2>
        <p>您可以向我諮詢任何關於台灣勞動法規的問題，例如：</p>
        <div class="example-questions">
          <button class="example-question" @click="setQuestion('公司沒有給加班費怎麼辦？')">
            公司沒有給加班費怎麼辦？
          </button>
          <button class="example-question" @click="setQuestion('我被資遣了，可以領什麼補償？')">
            我被資遣了，可以領什麼補償？
          </button>
          <button class="example-question" @click="setQuestion('特休假沒休完公司要賠償嗎？')">
            特休假沒休完公司要賠償嗎？
          </button>
        </div>
      </div>
      
      <!-- 聊天消息 -->
      <div v-for="(message, index) in messages" :key="index" class="message-container">
        <div :class="['message', message.type === 'user' ? 'user-message' : 'ai-message']">
          <div class="message-avatar">
            <span v-if="message.type === 'ai'" class="ai-avatar-icon">AI</span>
            <span v-else>{{ userInitial }}</span>
          </div>
          <div class="message-content">
            <div class="message-sender">{{ message.type === 'user' ? userNickname : '勞法通AI' }}</div>
            <div class="message-text" v-html="formatMessage(message.content)"></div>
            <div class="message-time">{{ formatMessageTime(message.timestamp) }}</div>
          </div>
        </div>
      </div>
      
      <!-- 打字指示器 -->
      <div v-if="isTyping" class="typing-indicator">
        <div class="typing-avatar">
          <span class="ai-avatar-icon">AI</span>
        </div>
        <div class="typing-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    </div>
    
    <!-- 聊天输入区 -->
    <div class="chat-input-container">
      <textarea 
        ref="chatInputRef"
        v-model="userInput" 
        placeholder="輸入問題..."
        class="chat-input"
        @keydown.enter.prevent="sendMessage"
        rows="1"
      ></textarea>
      <button class="send-button" @click="sendMessage" :disabled="isTyping || userInput.trim() === ''">
        <!-- 发送图标 -->
        <svg width="20" height="20" viewBox="0 0 512 512" fill="white">
          <path d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z"/>
        </svg>
      </button>
    </div>
    
    <!-- 🔧 P0 修复：次数不足弹窗 -->
    <div v-if="showInsufficientModal" class="insufficient-queries-modal-overlay" @click="closeInsufficientModal">
      <div class="insufficient-queries-modal" @click.stop>
        <div class="modal-header">
          <h3>咨询次数不足</h3>
          <button @click="closeInsufficientModal" class="close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-icon">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <p class="modal-message">您的咨询次数已用完，请通过以下方式获取更多次数：</p>
          <div class="modal-actions">
            <router-link :to="inviteRoute" class="action-button primary" @click="closeInsufficientModal">
              <i class="fas fa-user-plus"></i>
              邀请好友获取次数
            </router-link>
            <button @click="contactSupport" class="action-button secondary">
              <i class="fas fa-phone"></i>
              联系客服
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div v-if="showConversationList" class="overlay" @click="showConversationList = false"></div>
    <!-- 選項菜單遮罩 -->
    <div v-if="showOptions" class="overlay" @click="showOptions = false"></div>
  </MobileContainer>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MobileContainer from '@/components/layout/MobileContainer.vue'
import aiChatService from '@/services/aiChatService'
import conversationService from '@/services/conversationService'
import authService from '@/services/auth'
import userService from '@/services/userService'

export default {
  name: 'MobileChatView',
  components: {
    MobileContainer
  },
  setup() {
    // 会话管理
    const conversations = ref([])
    const currentConversationId = ref('')
    const showConversationList = ref(false)
    const showOptions = ref(false)
    
    // 聊天消息
    const messages = ref([])
    const userInput = ref('')
    const isTyping = ref(false)
    const chatBodyRef = ref(null)
    const chatInputRef = ref(null)
    const connectionError = ref(false)

    // 🔧 P0 修复：添加咨询次数相关状态
    const remainingQueries = ref(null)
    const showInsufficientModal = ref(false)
    
    // 获取路由和路由参数
    const route = useRoute()
    const router = useRouter()
    
    // 获取用户昵称首字母
    const userNickname = computed(() => {
      try {
        // 直接從localStorage提取用戶信息
        const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
        return authUser.name || '用戶';
      } catch (error) {
        console.error('獲取用戶昵稱時出錯:', error);
        return '用戶'; // 提供默認值以避免UI出錯
      }
    })
    
    const userInitial = computed(() => {
      return userNickname.value.charAt(0).toUpperCase()
    })
    
    // 当前对话标题
    const currentTitle = computed(() => {
      const current = conversations.value.find(c => c.id === currentConversationId.value)
      const title = current?.title || '新的對話'
      // 確保標題完整顯示，但限制長度以防止溢出
      return title.length > 25 ? title.substring(0, 25) + '...' : title
    })
    
    // 加载所有会话
    async function loadConversations() {
      console.log('MobileChatView 載入所有會話');
      
      try {
        // 使用新的API獲取會話列表
        const response = await aiChatService.getSessionList({ limit: 50 });
        
        // 🔧 修复：根据API文档正确访问响应数据结构
        if (response && response.success && response.data && response.data.sessions) {
          // 轉換API數據格式為前端格式（保持兼容性），使用API文档中的正确字段名
          conversations.value = response.data.sessions.map(session => ({
            id: session.sessionId, // 🔧 使用API文档中的sessionId字段
            title: session.title,
            lastMessage: '', // API文档中没有lastMessage字段，设为空
            messageCount: session.messageCount,
            createdAt: session.createdAt,
            updatedAt: session.lastMessageAt // 🔧 使用API文档中的lastMessageAt字段
          }));
          
          console.log('✅ 移動端會話列表加載成功:', conversations.value.length, '個會話');
        } else {
          console.log('📭 移动端沒有找到會話記錄或响应格式错误');
          conversations.value = [];
        }
        
      } catch (error) {
        console.error('❌ 移動端加載會話列表失敗:', error);
        // 後備到本地會話管理
        conversations.value = conversationService.getAllConversations();
      }
      
      // 检查URL参数中是否有指定的会话ID
      const urlConversationId = route.query.id;
      const urlQuestion = route.query.question;
      const isNewSessionRequest = route.query.newSession === 'true';
      console.log('移動端URL會話ID:', urlConversationId);
      console.log('移動端URL問題參數:', urlQuestion);
      console.log('移動端新會話請求:', isNewSessionRequest);
      
      // 🔧 修復：如果是新會話請求（從首頁常見問題點擊），強制創建新會話
      if (isNewSessionRequest && urlQuestion) {
        console.log('移動端檢測到新會話請求，創建新會話並填入問題:', decodeURIComponent(urlQuestion));
        
        // 清除URL中的newSession參數，避免重複創建
        const newQuery = { ...route.query };
        delete newQuery.newSession;
        router.replace({ name: route.name, query: newQuery });
        
        // 創建新會話
        startNewConversation();
        
        // 將問題填入輸入框
        const decodedQuestion = decodeURIComponent(urlQuestion);
        userInput.value = decodedQuestion;
        
        // 滚动到底部
        nextTick(() => {
          scrollToBottom();
        });
        
        return; // 提前返回，不執行後續的會話加載邏輯
      }
      
      if (urlConversationId) {
        // 检查会话是否存在
        const conversationExists = conversations.value.some(c => c.id === urlConversationId);
        if (conversationExists) {
          console.log('移動端找到並選擇指定會話:', urlConversationId);
          selectConversation(urlConversationId);
        } else {
          console.warn('移動端URL中指定的會話不存在:', urlConversationId);
          
          // ✅ 修復：清除無效的URL參數，避免無限循環
          console.log('🔄 移動端清除無效的會話ID參數，避免無限循環');
          router.replace({ 
            name: route.name,
            query: { ...route.query, id: undefined } // 清除無效的ID參數
          });
          
          // 檢查是否有問題參數，如果有就創建新會話並填入問題（非新會話請求的情況）
          if (urlQuestion) {
            console.log('移動端檢測到問題參數，創建新會話');
            startNewConversation();
            
            const decodedQuestion = decodeURIComponent(urlQuestion);
            console.log('移動端URL帶有問題參數:', decodedQuestion);
            userInput.value = decodedQuestion;
          } else if (conversations.value.length > 0) {
            // 如果沒有問題參數但有會話列表，選擇第一個
            console.log('移動端選擇第一個會話');
            selectConversation(conversations.value[0].id);
          } else {
            // 如果都沒有，創建新會話
            console.log('移動端創建新會話（兜底）');
            startNewConversation();
          }
        }
      } else if (conversations.value.length > 0) {
        // 否则加载最近的会话
        console.log('移動端沒有指定會話ID，加載最近的會話');
        selectConversation(conversations.value[0].id);
      } else {
        // 没有会话时创建新会话
        console.log('移動端沒有會話記錄，創建新會話');
        startNewConversation();
      }
      
      // 滚动到底部
      nextTick(() => {
        scrollToBottom();
      });
    }
    
    // 选择会话
    async function selectConversation(conversationId) {
      // 如果已经是当前会话，不做任何操作
      if (conversationId === currentConversationId.value) {
        showConversationList.value = false
        return
      }
      
      currentConversationId.value = conversationId
      
      // 更新路由参数但不重新加载页面
      router.replace({ query: { ...route.query, id: conversationId } })
      
      try {
        // 使用新的API獲取會話詳情
        const sessionDetails = await aiChatService.getSessionDetails(conversationId);
        
        // 🔧 修复：根据API文档正确访问响应数据结构
        if (sessionDetails && sessionDetails.success && sessionDetails.data && sessionDetails.data.messages) {
          // 轉換API數據格式為前端格式，使用API文档中的正确字段名
          messages.value = sessionDetails.data.messages.map(msg => ({
            type: msg.role === 'user' ? 'user' : 'ai',
            content: msg.content,
            reference: msg.metadata?.references || msg.references || null, // 🔧 处理引用字段
            timestamp: new Date(msg.createdAt),
            messageId: msg.messageId // 🔧 保存消息ID用于反馈功能
          }));
          
          console.log('✅ 移動端會話詳情加載成功:', messages.value.length, '條消息');
        } else {
          console.warn('⚠️ 移动端会话详情响应格式错误:', sessionDetails);
          messages.value = [];
        }
        
      } catch (error) {
        console.error('❌ 移動端加載會話詳情失敗:', error);
        // 後備到本地會話管理
        messages.value = conversationService.getConversationMessages(conversationId) || []
      }
      
      // 隐藏会话列表
      showConversationList.value = false
      
      // 滚动到底部
      nextTick(() => {
        scrollToBottom()
      })
    }
    
    // 创建新会话
    async function startNewConversation() {
      try {
        // 使用新的API創建會話
        const newSession = await aiChatService.createSession();
        
        // 🔧 修复：根据API文档正确访问响应数据结构
        if (newSession && newSession.success && newSession.data && newSession.data.sessionId) {
          // 刷新会话列表
          await loadConversations();
          
          // 選擇新會話但確保消息列表為空，使用API文档中的sessionId字段
          currentConversationId.value = newSession.data.sessionId; // 🔧 使用API文档中的sessionId字段
          messages.value = []; // 確保新對話的消息列表為空
          
          console.log('✅ 移動端新會話創建成功:', newSession.data.sessionId);
        } else {
          console.error('⚠️ 移动端创建会话响应格式错误:', newSession);
          throw new Error('移动端创建会话失败');
        }
        
      } catch (error) {
        console.error('❌ 移動端創建新會話失敗:', error);
        // 後備到本地會話管理
        const newConversationId = conversationService.createNewConversation()
        if (newConversationId) {
          selectConversation(newConversationId)
        } else {
          // 处理创建新会话失败的情况
          console.error('创建新会话失败')
          connectionError.value = true
        }
      }
      
      // 隐藏会话列表
      showConversationList.value = false
    }
    
    // 发送消息
    async function sendMessage() {
      // 如果正在输入或输入为空，不发送
      if (isTyping.value || userInput.value.trim() === '') {
        return
      }
      
      console.log('🚀 移動端發送消息:', userInput.value);
      
      try {
        // 檢查用戶是否有足夠的諮詢次數
        const userId = localStorage.getItem('userId') || localStorage.getItem('auth_user_id');
        const userInfo = localStorage.getItem('auth_user');
        
        if (userId && userInfo) {
          try {
            const userData = JSON.parse(userInfo);
            if (userData && userData.remaining_free_queries !== undefined) {
              if (userData.remaining_free_queries <= 0) {
                console.warn('用戶諮詢次數不足');
                alert('您的諮詢次數已用完，請充值後再試');
                return;
              }
            }
          } catch (error) {
            console.error('檢查用戶諮詢次數時出錯:', error);
          }
        }

        // 如果沒有當前會話，先創建一個新會話
        if (!currentConversationId.value) {
          console.log('🆕 移動端創建新會話...');
          const newSession = await aiChatService.createSession();
          
          // 🔧 修复：根据API文档正确访问响应数据结构
          if (newSession && newSession.success && newSession.data && newSession.data.sessionId) {
            currentConversationId.value = newSession.data.sessionId; // 🔧 使用API文档中的sessionId字段
            console.log('✅ 移動端新會話已創建:', newSession.data.sessionId);
          } else {
            console.error('⚠️ 移动端创建会话响应格式错误:', newSession);
            throw new Error('移动端创建会话失败');
          }
        }
        
        // 保存用戶輸入內容
        const messageContent = userInput.value;
        
        // 添加用戶消息到UI
        const userMessage = {
          type: 'user',
          content: messageContent,
          timestamp: new Date()
        };
        
        messages.value.push(userMessage);
        
        // 清空输入
        userInput.value = '';
        
        // 调整输入框高度
        nextTick(() => {
          if (chatInputRef.value) {
            chatInputRef.value.style.height = 'auto'
          }
        });
        
        // 保存到本地会话管理（保持兼容性）
        conversationService.updateConversation(currentConversationId.value, messages.value);
        
        // 滚动到底部
        scrollToBottom();
        
        // 显示AI正在输入
        isTyping.value = true;
        
        console.log('🚀 移動端發送消息到後端API...');
        
        // 調用新的後端API
        const response = await aiChatService.sendMessage(
          currentConversationId.value, 
          messageContent, 
          'question'
        );
        
        console.log('✅ 移動端收到後端API回應:', response);
        
        // 添加AI回复到UI
        const aiMessage = {
          type: 'ai',
          content: response.data.aiResponse.content,
          reference: response.data.aiResponse.references || null,
          timestamp: new Date(response.data.aiResponse.createdAt)
        };
        
        // 短暂延迟，使交互更自然
        setTimeout(() => {
          isTyping.value = false;
          messages.value.push(aiMessage);
          
          // 更新本地会话管理（保持兼容性）
          conversationService.updateConversation(currentConversationId.value, messages.value);
          
          // 刷新会话列表（標題可能已更新）
          loadConversations();
          
          // 更新剩餘諮詢次數（如果後端提供）
          if (response.data.remainingQueries !== undefined) {
            console.log('移動端剩餘諮詢次數:', response.data.remainingQueries);
            // 更新localStorage中的用戶信息
            try {
              const currentUserInfo = JSON.parse(localStorage.getItem('auth_user') || '{}');
              currentUserInfo.remaining_free_queries = response.data.remainingQueries;
              localStorage.setItem('auth_user', JSON.stringify(currentUserInfo));
            } catch (error) {
              console.error('移動端更新剩餘諮詢次數失敗:', error);
            }
          }
          
          scrollToBottom();
        }, 500);
        
      } catch (error) {
        console.error('❌ 移動端發送消息失敗:', error);
        
        // 🔧 P0 修复：专门处理不同类型的错误
        setTimeout(() => {
          isTyping.value = false;
          
          if (error.message && error.message.includes('咨询次数已用完')) {
            // 显示次数不足弹窗
            showInsufficientModal.value = true;
            return;
          } else if (error.message && error.message.includes('请先登录')) {
            // 引导用户登录
            router.push('/mobile/login');
            return;
          } else {
            // 显示其他错误消息
            const errorMessage = {
              type: 'ai',
              content: aiChatService.formatError(error) || '抱歉，連接服務時出現問題，請稍後再試。',
              timestamp: new Date()
            };
            
            messages.value.push(errorMessage);
            
            // 更新会话
            conversationService.updateConversation(currentConversationId.value, messages.value);
            
            scrollToBottom();
          }
        }, 500);
      }
    }
    
    // 处理连接错误
    function handleConnectionError() {
      // 設置連接錯誤標志
      connectionError.value = true
      
      // 檢查是否已經有錯誤消息
      const hasErrorMessage = messages.value.some(msg => 
        msg.type === 'ai' && msg.content.includes('抱歉，连接服务时出现问题')
      );
      
      // 只在沒有錯誤消息時添加
      if (!hasErrorMessage) {
        // 延迟添加错误消息
        setTimeout(() => {
          const errorMessage = {
            type: 'ai',
            content: '抱歉，连接服务时出现问题，请稍后再试。',
            timestamp: new Date()
          }
          
          messages.value.push(errorMessage)
          
          // 更新会话
          conversationService.updateConversation(currentConversationId.value, messages.value)
          
          scrollToBottom()
        }, 500)
      }
    }
    
    // 设置预设问题
    function setQuestion(question) {
      userInput.value = question
      nextTick(() => {
        sendMessage()
      })
    }
    
    // 格式化消息内容（支持简单HTML和换行）
    function formatMessage(content) {
      if (!content) return ''
      
      // 将换行符转换为<br>
      return content.replace(/\n/g, '<br>')
    }
    
    // 格式化消息时间
    function formatMessageTime(timestamp) {
      if (!timestamp) return ''
      
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }
    
    // 格式化日期（用于会话列表）
    function formatDate(date) {
      if (!date) return ''
      
      const d = date instanceof Date ? date : new Date(date)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (d >= today) {
        return '今天'
      } else if (d >= yesterday) {
        return '昨天'
      } else {
        return `${d.getMonth() + 1}月${d.getDate()}日`
      }
    }
    
    // 滚动到底部
    function scrollToBottom() {
      nextTick(() => {
        if (chatBodyRef.value) {
          chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
        }
      })
    }
    
    // 窗口大小变化时调整布局
    function handleResize() {
      scrollToBottom()
    }
    
    // 生命周期钩子
    onMounted(async () => {
      console.log('MobileChatView 組件掛載');
      
      // 🔧 P0 修复：添加次数更新事件监听
      window.addEventListener('queryCountUpdated', handleQueryCountUpdate);
      
      // 🔧 P0 修复：初始化时获取剩余咨询次数
      await updateQueryCount();
      
      // 如果URL包含會話ID，先記錄它
      const urlConversationId = route.query.id;
      if (urlConversationId) {
        console.log('URL中包含會話ID:', urlConversationId);
      }
      
      // 加載所有會話
      loadConversations();
      
      // 添加事件監聽器
      window.addEventListener('resize', handleResize);
      window.addEventListener('app_data_sync', handleSync);
      window.addEventListener('chat:sync', handleChatSync);
      
      // 如果是新創建的會話，需要確保畫面已經更新
      nextTick(() => {
        // 如果消息為空但有會話ID，嘗試再次加載
        if (messages.value.length === 0 && currentConversationId.value) {
          console.log('嘗試重新加載會話:', currentConversationId.value);
          const reloadedMessages = conversationService.getConversationMessages(currentConversationId.value);
          if (reloadedMessages && reloadedMessages.length > 0) {
            console.log('重新加載會話成功');
            messages.value = reloadedMessages;
            scrollToBottom();
          }
        }
      });
      
      // 測試API連接
      testApiConnection();
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      
      // 🔧 P0 修复：移除次数更新事件监听
      window.removeEventListener('queryCountUpdated', handleQueryCountUpdate)
      
      // 移除同步事件监听
      window.removeEventListener('app_data_sync', handleSync)
      window.removeEventListener('chat:sync', handleChatSync)
    })
    
    // 处理同步事件
    function handleSync() {
      console.log('MobileChatView 处理同步事件')
      
      // 获取当前会话ID
      const currentId = currentConversationId.value
      
      // 获取所有会话
      conversations.value = conversationService.getAllConversations()
      
      // 如果当前有选中的会话，检查是否还存在
      if (currentId) {
        // 检查当前会话是否还存在
        const stillExists = conversations.value.some(c => c.id === currentId)
        
        if (stillExists) {
          // 如果存在，更新消息
          messages.value = conversationService.getConversationMessages(currentId) || []
          
          // 滚动到底部
          nextTick(() => {
            scrollToBottom()
          })
        } else if (conversations.value.length > 0) {
          // 如果不存在但有其他会话，选择第一个会话
          selectConversation(conversations.value[0].id)
        } else {
          // 如果没有会话，清空消息
          messages.value = []
        }
      }
    }
    
    // 处理聊天同步事件
    function handleChatSync(event) {
      console.log('MobileChatView 处理聊天同步事件', event.detail);
      
      const { action, data } = event.detail;
      
      // 如果这不是当前会话的消息，忽略
      if (data.conversationId !== currentConversationId.value) {
        console.log('非當前會話消息，已忽略');
        return;
      }
      
      switch (action) {
        case 'new_message':
          // 添加新消息
          if (data.message) {
            // 創建消息ID
            const messageId = data.message.content + '_' + (data.message.timestamp || new Date().getTime());
            
            // 檢查是否最近已處理的回應 (用於防止重複處理來自sendMessage的回應)
            if (window.lastResponseId && window.lastResponseId.includes(data.message.content)) {
              console.log('檢測到可能的重複回應，ID:', window.lastResponseId);
              // 清除上次回應ID
              window.lastResponseId = null;
            }
            
            // 检查是否重复
            const isDuplicate = messages.value.some(msg => 
              msg.type === data.message.type && 
              msg.content === data.message.content && 
              Math.abs(new Date(msg.timestamp || new Date()) - new Date(data.message.timestamp || new Date())) < 2000
            );
            
            if (!isDuplicate) {
              console.log('添加新消息到會話:', data.message.type);
              messages.value.push({
                ...data.message,
                timestamp: new Date(data.message.timestamp || new Date())
              });
              
              // 更新会话
              conversationService.updateConversation(currentConversationId.value, messages.value);
              
              // 滚动到底部
              nextTick(() => {
                scrollToBottom();
              });
            } else {
              console.log('檢測到重複消息，已忽略');
            }
          }
          break;
          
        case 'error':
          // 设置连接错误
          connectionError.value = true;
          break;
          
        default:
          // 其他类型的同步事件，调用同步函数
          handleSync();
      }
    }
    
    // 测试API连接
    async function testApiConnection() {
      try {
        console.log('移動端測試API連接...')
        
        // 使用新的aiChatService測試連接
        const isConnected = await aiChatService.testConnection();
        
        if (isConnected) {
          console.log('移動端API連接成功')
          // 連接成功，清除錯誤標志
          connectionError.value = false
        } else {
          console.error('移動端API連接失敗')
          // 不要立即顯示錯誤，因為這可能只是網路暫時問題
        }
      } catch (error) {
        console.error('移動端測試API連接出錯:', error)
        // 只有在實際連接出錯時才設置錯誤狀態
        // 并且只在用戶主動操作時才顯示錯誤
        if (messages.value.length > 0) {
          connectionError.value = true
        }
      }
    }
    
    // 導航功能 - 返回首頁
    function goToHome() {
      showConversationList.value = false;
      router.push('/mobile');
    }
    
    // 導航功能 - 個人資料
    function goToProfile() {
      showConversationList.value = false;
      // 此處可添加個人資料頁面的路由
      router.push('/mobile/profile');
    }
    
    // 導航功能 - 專人諮詢
    function goToExpert() {
      showConversationList.value = false;
      router.push('/m/consultation');
    }
    
    // 清空當前對話
    function clearCurrentConversation() {
      if (!currentConversationId.value) return;
      
      if (confirm('確定要清空當前對話嗎？此操作不可撤銷。')) {
        // 清空消息
        messages.value = [];
        // 更新會話
        conversationService.updateConversation(currentConversationId.value, messages.value);
        // 關閉選項菜單
        showOptions.value = false;
      }
    }
    
    // 分享對話
    function shareConversation() {
      if (!currentConversationId.value) return;
      
      // 嘗試使用Web Share API分享
      if (navigator.share) {
        navigator.share({
          title: '勞法通AI對話分享',
          text: `查看我與勞法通AI的對話: ${currentTitle.value}`,
          url: `${window.location.origin}/mobile/chat?id=${currentConversationId.value}`
        })
        .then(() => console.log('成功分享'))
        .catch((error) => console.log('分享失敗', error));
      } else {
        // 如果不支持Web Share API，則複製鏈接到剪貼板
        const url = `${window.location.origin}/mobile/chat?id=${currentConversationId.value}`;
        navigator.clipboard.writeText(url)
          .then(() => {
            alert('對話鏈接已複製到剪貼板');
          })
          .catch(() => {
            alert('無法複製鏈接');
          });
      }
      
      // 關閉選項菜單
      showOptions.value = false;
    }
    
    // 切換到桌面版
    function switchToDesktop() {
      showConversationList.value = false;
      const currentId = currentConversationId.value;
      const targetUrl = currentId ? `/chat?id=${currentId}` : '/chat';
      window.location.href = targetUrl;
    }
    
    // 🔧 P0 修复：获取剩余咨询次数
    async function updateQueryCount() {
      try {
        const count = await userService.getQueryCount();
        remainingQueries.value = count.remainingQueries;
        console.log('✅ 移动端剩余咨询次数:', count.remainingQueries);
      } catch (error) {
        console.error('❌ 移动端获取咨询次数失败:', error);
        remainingQueries.value = null;
      }
    }

    // 🔧 P0 修复：监听次数更新事件
    function handleQueryCountUpdate(event) {
      remainingQueries.value = event.detail.remainingQueries;
      console.log('🔄 移动端次数已更新:', event.detail.remainingQueries);
    }

    // 🔧 P0 修复：关闭次数不足弹窗
    function closeInsufficientModal() {
      showInsufficientModal.value = false;
    }

    // 🔧 P0 修复：联系客服
    function contactSupport() {
      closeInsufficientModal();
      // 这里可以添加联系客服的逻辑，比如跳转到客服页面或拨打电话
      alert('请联系客服微信：your_service_wechat 或拨打热线：400-123-4567');
    }

    // 获取邀请路由
    const inviteRoute = computed(() => {
      const userId = localStorage.getItem('auth_user_id') || '';
      return userId ? `/mobile/user/${userId}/invite` : '/mobile/invite';
    });

    // 處理登出
    async function handleLogout() {
      // 確認是否要登出
      if (confirm('確定要登出嗎？')) {
        try {
          console.log('🚀 开始执行移动端聊天页面登出流程...');
          
          // 直接清除认证状态，不使用任何标记机制
          console.log('🔒 清除认证状态...');
          
          // 清除所有认证相关的localStorage数据
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_token_expires');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_user_id');
          localStorage.removeItem('logging_out');
          
          console.log('✅ 认证状态已清除');
          
          // 使用Vue Router进行页面跳转
          console.log('🔄 跳转到移动端登录页面...');
          await router.push('/mobile/login');
          
          console.log('✅ 移动端聊天页面登出完成');
          
        } catch (error) {
          console.error('❌ 移动端聊天页面登出过程中发生错误:', error);
          
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
      }
    }
    
    return {
      conversations,
      currentConversationId,
      showConversationList,
      showOptions,
      messages,
      userInput,
      isTyping,
      chatBodyRef,
      chatInputRef,
      connectionError,
      // 🔧 P0 修复：咨询次数相关
      remainingQueries,
      showInsufficientModal,
      updateQueryCount,
      handleQueryCountUpdate,
      closeInsufficientModal,
      contactSupport,
      inviteRoute,
      userNickname,
      userInitial,
      currentTitle,
      selectConversation,
      startNewConversation,
      sendMessage,
      formatMessage,
      formatMessageTime,
      formatDate,
      setQuestion,
      goToHome,
      goToProfile,
      goToExpert,
      clearCurrentConversation,
      shareConversation,
      switchToDesktop,
      handleLogout
    }
  }
}
</script>

<style scoped>
/* 聊天容器样式 */
.chat-header {
  position: fixed;
  top: 0; /* 移除狀態欄後頂部從0開始 */
  left: 0;
  right: 0;
  z-index: 10;
  background: #3b82f6; /* 使用与网页端相同的蓝色 */
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 430px; /* 匹配iPhone容器宽度 */
  margin: 0 auto;
}

.chat-title {
  font-size: 18px;
  font-weight: 600;
  max-width: calc(100% - 100px); /* 確保標題在兩個按鈕之間有足夠空間 */
  white-space: nowrap; /* 不允許換行 */
  display: block; /* 確保標題能夠完整顯示 */
  text-align: center; /* 文字置中 */
  margin: 0 auto; /* 居中顯示 */
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-button, .options-button {
  width: 38px;
  height: 38px;
  border-radius: 50%; /* 使用圆形设计与网页端保持一致 */
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.2s;
}

.menu-button:hover, .options-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.menu-button i, .options-button i {
  font-size: 18px;
}

/* 侧边栏样式 */
.conversation-list {
  position: fixed;
  top: 0;
  left: -320px;
  width: 320px;
  height: 100%;
  background: white; /* 使用白色背景与网页端保持一致 */
  z-index: 1000;
  transition: transform 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  color: #333; /* 使用与网页端相同的文本颜色 */
  overflow-y: auto; /* 添加滾動功能 */
}

.conversation-list.active {
  transform: translateX(320px);
}

.conversation-list-header {
  padding: 20px 15px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0; /* 移除頂部間距 */
  position: sticky;
  top: 0;
  background: white;
  z-index: 5;
}

.conversation-list-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #3b82f6; /* 使用蓝色与网页端保持一致 */
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
}

/* 用户资料样式 */
.user-profile {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f3f4f6;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  margin-right: 12px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 2px;
}

.user-plan {
  font-size: 13px;
  opacity: 0.7;
}

/* 菜单分类 */
.menu-category {
  padding: 12px 15px;
  font-size: 13px;
  opacity: 0.7;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: #f9fafb; /* 添加背景色增加辨識度 */
  position: sticky;
  top: 60px; /* 在用戶資料後固定 */
  z-index: 4;
}

.menu-items {
  padding: 5px 0;
  border-bottom: 1px solid #f3f4f6;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 15px; /* 增加字體大小 */
}

.menu-item:hover {
  background-color: #f3f4f6;
}

.menu-item:active {
  background-color: #e5e7eb; /* 添加點擊效果 */
}

.menu-item i {
  font-size: 20px; /* 增加圖標大小 */
  width: 30px; /* 增加圖標區域寬度 */
  color: #3b82f6; /* 保持藍色圖標 */
  margin-right: 15px;
  text-align: center; /* 確保圖標居中對齊 */
}

/* 会话列表样式 */
.conversation-items {
  flex: 1;
  overflow-y: auto;
  padding: 5px 10px;
}

.conversation-item {
  padding: 12px 15px;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
}

.conversation-item:hover {
  background-color: #f3f4f6;
}

.conversation-item.active {
  background-color: #ebf5ff;
}

.conversation-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #e0e7ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.conversation-details {
  flex: 1;
  overflow: hidden;
}

.conversation-details h3 {
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 3px;
}

.conversation-details p {
  font-size: 13px;
  color: #6b7280;
}

.empty-conversations {
  text-align: center;
  padding: 30px 20px;
  color: #9ca3af;
}

.new-chat-btn {
  margin-top: 15px;
  padding: 10px 16px;
  background: #3b82f6;
  color: white;
  border-radius: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 15px auto 0;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f3f4f6;
  font-size: 13px;
}

.version-info {
  opacity: 0.6;
}

.logout-btn {
  cursor: pointer;
  display: flex;
  align-items: center;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.logout-btn:hover {
  opacity: 1;
}

.logout-btn i {
  font-size: 18px;
  margin-right: 8px;
  color: #3b82f6; /* 使登出按鈕圖標也使用藍色 */
}

/* 聊天内容区 */
.chat-body {
  padding: 15px;
  height: calc(100vh - 120px); /* 調整高度，考慮表頭和底部輸入框 */
  overflow-y: auto;
  margin-top: 60px; /* 調整頂部邊距，與表頭對齊 */
  padding-bottom: 80px;
  background-color: #f9fafb; /* 使用与网页端相同的背景色 */
  color: #333; /* 使用与网页端相同的文本颜色 */
}

.connection-error {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 10px 15px;
  border-radius: 12px;
  margin-bottom: 15px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.welcome-message {
  text-align: center;
  padding: 30px 15px;
}

.ai-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
}

.ai-avatar i {
  font-size: 32px;
}

.welcome-message h2 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.welcome-message p {
  color: #6b7280;
  margin-bottom: 20px;
}

.example-questions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.example-question {
  padding: 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  text-align: left;
  transition: background-color 0.2s;
  color: #333;
}

.example-question:hover {
  background: #e5e7eb;
}

/* 聊天消息样式 */
.message-container {
  margin-bottom: 24px;
  display: flex;
  justify-content: center; /* 保留居中容器 */
}

.message {
  display: flex;
  max-width: 90%; /* 增加消息最大寬度 */
  width: auto; /* 使寬度自適應內容 */
}

.user-message {
  margin-left: auto;
  margin-right: 0; /* 確保用戶消息靠右對齊 */
  justify-content: flex-end; /* 用戶消息右對齊 */
  flex-direction: row-reverse;
}

.ai-message {
  margin-right: auto; /* AI消息左對齊 */
  margin-left: 0; /* 確保AI消息靠左對齊 */
  justify-content: flex-start;
}

.message-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
  flex-shrink: 0; /* 防止頭像縮小 */
}

.user-message .message-avatar {
  background: #3b82f6;
  color: white;
}

.ai-message .message-avatar {
  background: #e0e7ff;
  color: #3b82f6;
}

.message-content {
  background: white;
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-width: calc(100% - 60px); /* 確保消息內容區域不會被頭像擠壓 */
  word-break: break-word;
}

.user-message .message-content {
  background: #3b82f6;
  color: white;
  border-top-right-radius: 4px;
  margin-right: 5px;
  text-align: right; /* 用戶消息文字靠右顯示 */
}

.ai-message .message-content {
  border-top-left-radius: 4px;
  margin-left: 5px;
}

.message-sender {
  font-size: 13px;
  margin-bottom: 5px;
  font-weight: 500;
}

.user-message .message-sender {
  color: rgba(255, 255, 255, 0.9);
}

.message-text {
  line-height: 1.5;
  white-space: pre-wrap;
  font-size: 15px; /* 增加文字大小 */
  display: block; /* 確保文字完整顯示 */
  overflow: visible; /* 防止文字被截斷 */
}

.message-time {
  font-size: 12px;
  margin-top: 5px;
  text-align: right;
  opacity: 0.7;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.typing-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.typing-dots {
  background: white;
  padding: 15px 20px;
  border-radius: 16px;
  border-top-left-radius: 4px;
  display: flex;
}

.dot {
  width: 8px;
  height: 8px;
  background: #d1d5db;
  border-radius: 50%;
  margin: 0 3px;
  animation: typing 1.5s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.3s;
}

.dot:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes typing {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* 聊天输入区 - 修复位置和配色问题 */
.chat-input-container {
  position: fixed;
  bottom: 14px; /* 稍微增加底部间距 */
  left: 50%;
  transform: translateX(-50%); /* 确保居中 */
  z-index: 50;
  width: calc(100% - 30px); /* 宽度固定在容器内，两边各留15px边距 */
  max-width: 400px; /* 确保不会超出iPhone容器 */
  background: white;
  padding: 10px 15px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
}

.chat-input {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 12px 15px;
  padding-right: 50px;
  resize: none;
  max-height: 100px;
  overflow-y: auto;
  line-height: 1.5;
  font-size: 15px;
  background-color: white;
  color: #333;
}

.chat-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.chat-input::placeholder {
  color: #9ca3af;
}

.send-button {
  position: absolute;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.send-button:active {
  transform: scale(0.95);
}

.send-button:disabled {
  background: #d1d5db;
  color: white;
  cursor: not-allowed;
  box-shadow: none;
}

/* 遮罩层 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  backdrop-filter: blur(2px);
}

/* 选项下拉菜单 */
.options-dropdown {
  position: fixed;
  top: 125px; /* 调整顶部位置，与表头底部对齐 */
  right: 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 5px 0;
  z-index: 1001; /* 高于侧边栏 */
  min-width: 150px;
  border: 1px solid #f3f4f6;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #333;
}

.option-item:hover {
  background-color: #f3f4f6;
}

.option-item i {
  margin-right: 10px;
  width: 25px;
  text-align: center;
  color: #3b82f6;
  font-size: 18px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  body {
    touch-action: manipulation;
  }
}

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

.ai-avatar-icon {
  font-size: 14px;
  font-weight: 500;
  font-family: 'Helvetica', 'Arial', sans-serif;
}

.ai-avatar-large {
  font-size: 24px;
  font-weight: 500;
  font-family: 'Helvetica', 'Arial', sans-serif;
}

.conversation-item .icon-text {
  margin-right: 12px;
  background: #e0e7ff;
  color: #3b82f6;
  border-radius: 8px;
  min-width: 32px;
  height: 32px;
}

/* 添加内联SVG图标的样式 */
.menu-icon {
  margin-right: 15px;
  flex-shrink: 0;
}

.menu-item svg {
  flex-shrink: 0;
}

.option-item svg {
  flex-shrink: 0;
}

/* 🔧 P0 修复：移动端剩余次数显示样式 */
.remaining-queries-mobile {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
}

.queries-count-mobile {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  min-width: 24px;
  text-align: center;
}

.queries-count-mobile.low-queries {
  background: rgba(239, 68, 68, 0.8);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 🔧 P0 修复：移动端次数不足弹窗样式 */
.insufficient-queries-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.insufficient-queries-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 350px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { 
    transform: translateY(-20px);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 20px;
  text-align: center;
}

.modal-icon {
  font-size: 48px;
  color: #f59e0b;
  margin-bottom: 16px;
}

.modal-message {
  font-size: 15px;
  color: #6b7280;
  margin-bottom: 20px;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.action-button.primary {
  background: #3b82f6;
  color: white;
}

.action-button.primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.action-button.secondary {
  background: #f3f4f6;
  color: #6b7280;
}

.action-button.secondary:hover {
  background: #e5e7eb;
  color: #4b5563;
}
</style> 