<template>
  <div class="chat-container">
    <!-- 聊天界面头部 -->
    <div class="chat-header">
      <div class="flex items-center">
        <button 
          v-if="showConversationList && isSmallScreen" 
          @click="toggleConversationList"
          class="back-button"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <router-link :to="homeRoute" class="header-title hover:text-gray-100 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 mr-2">
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 101.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
          勞法通AI
        </router-link>
      </div>
      <div class="header-actions">
        <!-- 🔧 P0 修复：添加剩余次数显示 -->
        <div class="remaining-queries-display" v-if="remainingQueries !== null">
          <span class="queries-text">剩余咨询次数:</span>
          <span :class="['queries-count', { 'low-queries': remainingQueries <= 5 }]">
            {{ remainingQueries }}
          </span>
        </div>
        <button @click="testConnection" class="header-action-button tooltip-container" title="測試連接">
          <svg width="16" height="16" viewBox="0 0 640 512" fill="currentColor">
            <path d="M633.82 458.1l-69-53.33C585.34 360.09 601.48 310.52 601.48 256h-45.61c0 46.39-10.11 90.57-27.9 130.55l-43.5-33.68c12.27-32.15 18.88-66.8 18.88-102.42 0-128.47-86.87-236.86-204.59-270.27C255.79 55.78 224.1 128.55 224.1 208.09c0 110.99 73.85 205.07 175.37 235.88l-40.45 31.3C245.5 430.57 160 331.09 160 208.09c0-100.02 44.7-188.85 115.09-248.76l-35.3-27.31C150.7 15.31 96 106.14 96 208.09c0 150.69 98.08 279.07 234.26 324.95l-58.1 44.88C137.97 519.3.47 380.45.47 208.09c0-123.53 71.61-230.85 175.97-282l-35.86-27.76c-60.45 35.18-110.03 86.52-142.17 146.7L.47 101.8C21.44 45.4 64.3 0 117.8 0c33.97 0 65.8 13.16 89.66 36.94l6.31 6.29 5.97-6.11C246.09 13.03 279.99 0 320 0c44.16 0 84.82 15.8 116.15 41.81l52.82-40.85c-45.76-35.73-104.23-58-169.59-58-65.61 0-126.4 22.79-174.98 60.89C116.46 1.48 98.07 0 84.37 0 36.45 0 0 42.37 0 96c0 17.45 59.9 254.36 59.96 254.65L128 273.14V208.09c0-75.74 60.89-137.3 136-138.79-12.76 29.7-19.31 61.98-19.31 95.85 0 133.05 107.23 241.3 240 244v-55.29C399.71 349.47 336 285.46 336 208.09c0-45.04 18.01-86.09 47.16-116.24C399.07 100.96 419.17 104 438.71 104h5.19l10.42-12.87c-21.89-18.79-50.27-30.08-81.49-30.08-43.8 0-82.48 21.08-106.18 53.79C304.59 128.62 336 165.26 336 208.09c0 39.03-25.34 73.24-63.3 86.27L335.41 352c75.91-33.41 130.88-108.09 130.88-192.14 0-66.89-33.03-127.84-88.06-166.39l-53.19 41.19c42.29 30.88 68.43 79.97 68.43 131.8 0 27.99-7.23 55.89-21.04 80.07l55.89 43.2c17.33-32.45 26.35-68.04 26.35-103.21h50.73c0 55.35-17.4 107.99-49.9 152.94l75.68 58.52c36.48-57.15 55.67-122.46 55.67-188.25h48.88c0 101.92-33.85 198.27-96.02 280.43l69.52 53.77c76.03-97.69 114.1-215.5 114.1-332.76h23.85z"/>
          </svg>
          <span class="tooltip-text">測試連接</span>
        </button>
        <button @click="clearCurrentChat" class="header-action-button tooltip-container" title="清除對話">
          <i class="fas fa-trash-alt"></i>
          <span class="tooltip-text">清除對話</span>
        </button>
      </div>
    </div>
    
    <div class="chat-body-container">
      <!-- 会话列表侧边栏 -->
      <div 
        v-if="showConversationList" 
        :class="['conversation-list-panel', {'mobile-panel': isSmallScreen}]"
      >
        <ConversationList 
          :conversations="conversations"
          :activeConversationId="currentConversationId"
          @select-conversation="selectConversation"
          @new-conversation="startNewConversation"
          @edit-conversation-title="editConversationTitle"
          @delete-conversation="deleteConversation"
        />
        
        <!-- 添加左下角導航選項 -->
        <div class="sidebar-footer">
          <router-link :to="profileRoute" class="sidebar-footer-link">
            <svg class="icon" width="16" height="16" viewBox="0 0 448 512" fill="currentColor">
              <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/>
            </svg>
            我的資料
          </router-link>
          <router-link :to="consultationRoute" class="sidebar-footer-link">
            <svg class="icon" width="16" height="16" viewBox="0 0 512 512" fill="currentColor">
              <path d="M320 336c0 8.84-7.16 16-16 16h-96c-8.84 0-16-7.16-16-16v-48H0v144c0 25.6 22.4 48 48 48h416c25.6 0 48-22.4 48-48V288H320v48zm144-208h-80V80c0-25.6-22.4-48-48-48H176c-25.6 0-48 22.4-48 48v48H48c-25.6 0-48 22.4-48 48v80h512v-80c0-25.6-22.4-48-48-48zm-144 0H192V96h128v32z"/>
            </svg>
            專家諮詢
          </router-link>
          <router-link :to="inviteRoute" class="sidebar-footer-link">
            <svg class="icon" width="16" height="16" viewBox="0 0 512 512" fill="currentColor">
              <path d="M32 448c0 17.7 14.3 32 32 32h160V320H32v128zm256 32h160c17.7 0 32-14.3 32-32V320H288v160zm192-320h-42.1c6.2-12.1 10.1-25.5 10.1-40 0-48.5-39.5-88-88-88-41.6 0-68.5 21.3-103 68.3-34.5-47-61.4-68.3-103-68.3-48.5 0-88 39.5-88 88 0 14.5 3.8 27.9 10.1 40H32c-17.7 0-32 14.3-32 32v80c0 8.8 7.2 16 16 16h480c8.8 0 16-7.2 16-16v-80c0-17.7-14.3-32-32-32zm-326.1 0c-22.1 0-40-17.9-40-40s17.9-40 40-40c19.9 0 34.6 3.3 86.1 80h-86.1zm206.1 0h-86.1c51.4-76.5 65.7-80 86.1-80 22.1 0 40 17.9 40 40s-17.9 40-40 40z"/>
            </svg>
            邀請好友
          </router-link>
        </div>
      </div>
      
      <!-- 聊天消息区域 -->
      <div class="chat-content-panel">
        <div ref="chatBodyRef" class="chat-body">
          <template v-if="messages.length === 0">
            <!-- 欢迎消息 - 僅顯示在UI上，不添加到消息列表 -->
            <ChatBubble
              content="您好！我是勞法通AI，請問有什麼勞動法規相關問題我可以協助您解答？"
              :timestamp="new Date()"
              :isUser="false"
            />
          </template>
          
          <!-- 聊天消息 -->
          <template v-for="(message, index) in messages" :key="index">
            <ChatBubble
              :content="message.content"
              :timestamp="message.timestamp"
              :isUser="message.type === 'user'"
              :userName="userNickname"
              :reference="message.reference"
              :isFallback="message.isFallback"
            />
          </template>
          
          <!-- 正在输入指示器 -->
          <div v-if="isTyping" class="typing-indicator-wrapper">
            <ChatBubble :isUser="false">
              <TypingIndicator />
            </ChatBubble>
          </div>
        </div>
        
        <!-- 聊天输入区域 -->
        <div class="chat-footer">
          <ChatInput
            ref="chatInputRef"
            :value="userInput"
            :disabled="isTyping"
            @send="sendMessage"
          />
        </div>
      </div>
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
    
    <!-- 错误连接提示 -->
    <div v-if="connectionError" class="connection-error">
      <p><i class="fas fa-exclamation-circle"></i> 連接服務時出現問題，正在使用備份模式</p>
      <button @click="connectionError = false" class="close-error-button">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ChatBubble from '../components/chat/ChatBubble.vue';
import ChatInput from '../components/chat/ChatInput.vue';
import TypingIndicator from '../components/chat/TypingIndicator.vue';
import ConversationList from '../components/chat/ConversationList.vue';
import conversationService from '@/services/conversationService';
// 使用新的AI聊天服務
import aiChatService from '@/services/aiChatService';
import authService from '@/services/auth';
import userService from '@/services/userService';

// 🔧 添加数据验证函数
const validateReferences = (refs) => {
  if (!refs) return [];
  if (Array.isArray(refs)) return refs;
  if (typeof refs === 'string') return []; // 用户消息不应有引用
  return [];
};

// 会话管理
const conversations = ref([]);
const currentConversationId = ref('');
const showConversationList = ref(false);

// 聊天消息
const messages = ref([]);
const userInput = ref('');
const isTyping = ref(false);
const chatBodyRef = ref(null);
const chatInputRef = ref(null);
const connectionError = ref(false);

// 🔧 P0 修复：添加咨询次数相关状态
const remainingQueries = ref(null);
const showInsufficientModal = ref(false);
const showError = ref('');

// 🔧 P0 修复：获取剩余咨询次数
async function updateQueryCount() {
  try {
    const response = await userService.getMyQueryStatus();
    remainingQueries.value = response.data.remainingQueries;
    console.log('剩余咨询次数:', remainingQueries.value);
  } catch (error) {
    console.error('获取咨询次数失败:', error);
    // 降级到本地存储
    try {
      const currentUserInfo = JSON.parse(localStorage.getItem('auth_user') || '{}');
      remainingQueries.value = currentUserInfo.remaining_free_queries || 0;
    } catch (localError) {
      console.error('从本地存储获取次数失败:', localError);
      remainingQueries.value = 0;
    }
  }
}

// 🔧 P0 修复：监听次数更新事件
function handleQueryCountUpdate(event) {
  remainingQueries.value = event.detail.remainingQueries;
  console.log('次数更新事件:', remainingQueries.value);
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

// 获取路由参数
const route = useRoute();
const router = useRouter();

// 判断是否为小屏幕设备
const isSmallScreen = computed(() => {
  return window.innerWidth < 768;
});

// 获取用户昵称
const userNickname = computed(() => {
  try {
    // 直接從localStorage提取用戶信息
    const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
    return authUser.name || '用戶';
  } catch (error) {
    console.error('獲取用戶昵稱時出錯:', error);
    return '用戶'; // 提供默認值以避免UI出錯
  }
});

// 获取home路由
const homeRoute = computed(() => {
  const userId = localStorage.getItem('auth_user_id') || '';
  // 如果有用戶ID，返回到用戶專屬頁面，否則返回根路徑
  return userId ? { path: `/user/${userId}` } : { path: '/' };
});

// 获取profile路由
const profileRoute = computed(() => {
  const userId = localStorage.getItem('auth_user_id') || '';
  return userId ? `/user/${userId}/profile` : '/profile';
});

// 获取consultation路由
const consultationRoute = computed(() => {
  const userId = localStorage.getItem('auth_user_id') || '';
  return userId ? `/user/${userId}/consultation` : '/consultation';
});

// 获取invite路由
const inviteRoute = computed(() => {
  const userId = localStorage.getItem('auth_user_id') || '';
  return userId ? `/user/${userId}/invite` : '/invite';
});

// 加载所有会话
async function loadConversations(forceRefresh = false) {
  try {
    // 🔧 修复：添加强制刷新参数支持，删除操作后绕过缓存
    const response = await aiChatService.getSessionList({ limit: 50 }, forceRefresh);
    
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
      
      console.log('✅ 會話列表加載成功:', conversations.value.length, '個會話');
    } else {
      console.log('📭 沒有找到會話記錄或响应格式错误');
      conversations.value = [];
    }
    
  } catch (error) {
    console.error('❌ 加載會話列表失敗:', error);
    // 後備到本地會話管理
    conversations.value = conversationService.getAllConversations();
  }
  
  // 检查URL参数中是否有指定的会话ID
  const urlConversationId = route.query.id;
  const urlQuestion = route.query.question;
  const isNewSessionRequest = route.query.newSession === 'true';
  
  // 🔧 修復：如果是新會話請求（從首頁常見問題點擊），強制創建新會話
  if (isNewSessionRequest && urlQuestion) {
    console.log('檢測到新會話請求，創建新會話並填入問題:', decodeURIComponent(urlQuestion));
    
    // 清除URL中的newSession參數，避免重複創建
    const newQuery = { ...route.query };
    delete newQuery.newSession;
    router.replace({ query: newQuery });
    
    // 創建新會話
    startNewConversation();
    
    // 將問題填入輸入框
    const decodedQuestion = decodeURIComponent(urlQuestion);
    userInput.value = decodedQuestion;
    
    // 確保在DOM更新後執行聚焦
    nextTick(() => {
      if (chatInputRef.value) {
        chatInputRef.value.focus();
      }
    });
    
    return; // 提前返回，不執行後續的會話加載邏輯
  }
  
  if (urlConversationId) {
    // 如果URL中有会话ID，优先加载该会话
    const conversationExists = conversations.value.some(conv => conv.id === urlConversationId);
    
    if (conversationExists) {
      console.log(`加載指定的會話ID: ${urlConversationId}`);
      
      // 在大屏幕上顯示會話列表，在小屏幕上也顯示（稍後會由handleResize自動決定）
      showConversationList.value = true;
      
      // 選擇並加載指定的會話
      selectConversation(urlConversationId);
    } else {
      console.warn(`找不到指定的会话ID: ${urlConversationId}，加载默认会话`);
      // 如果找不到指定ID的会话，创建一个新的会话
      startNewConversation();
    }
    
    // 檢查URL是否包含問題參數（非新會話請求的情況）
    if (urlQuestion) {
      const decodedQuestion = decodeURIComponent(urlQuestion);
      console.log('URL帶有問題參數:', decodedQuestion);
      
      // 將問題填入輸入框
      userInput.value = decodedQuestion;
      
      // 確保在DOM更新後執行聚焦，但不自動發送
      nextTick(() => {
        if (chatInputRef.value) {
          chatInputRef.value.focus();
        }
      });
    }
  } else {
    // 如果URL中没有会话ID，按原来的逻辑处理
    // 如果没有活动的会话ID，但有会话列表，选择第一个
    if (!currentConversationId.value && conversations.value.length > 0) {
      selectConversation(conversations.value[0].id);
    }
    
    // 如果没有会话，创建一个新的
    if (conversations.value.length === 0) {
      startNewConversation();
    }
  }
}

// 选择会话
async function selectConversation(conversationId) {
  if (currentConversationId.value === conversationId) return;
  
  currentConversationId.value = conversationId;
  
  try {
    // 使用新的API獲取會話詳情
    const sessionDetails = await aiChatService.getSessionDetails(conversationId);
    
    // 🔧 修复：根据API文档正确访问响应数据结构
    if (sessionDetails && sessionDetails.success && sessionDetails.data && sessionDetails.data.messages) {
      // 轉換API數據格式為前端格式，使用API文档中的正确字段名
      messages.value = sessionDetails.data.messages.map(msg => ({
        type: msg.role === 'user' ? 'user' : 'ai',
        content: msg.content,
        reference: validateReferences(msg.metadata?.references || msg.references), // 🔧 使用验证函数
        timestamp: new Date(msg.createdAt),
        messageId: msg.messageId // 🔧 保存消息ID用于反馈功能
      }));
      
      console.log('✅ 會話詳情加載成功:', messages.value.length, '條消息');
    } else {
      console.warn('⚠️ 会话详情响应格式错误:', sessionDetails);
      messages.value = [];
    }
    
  } catch (error) {
    console.error('❌ 加載會話詳情失敗:', error);
    // 後備到本地會話管理
    const conversation = conversationService.getConversation(conversationId);
    if (conversation && conversation.messages) {
      messages.value = conversation.messages;
    } else {
      messages.value = [];
    }
  }
  
  // 在小屏幕下，选择会话后隐藏会话列表
  if (isSmallScreen.value) {
    showConversationList.value = false;
  }
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom();
    if (chatInputRef.value) {
      chatInputRef.value.focus();
    }
  });
}

// 开始新会话
async function startNewConversation() {
  try {
    // 使用新的API創建會話
    const newSession = await aiChatService.createSession();
    
    // 🔧 修复：根据API文档正确访问响应数据结构
    if (newSession && newSession.success && newSession.data && newSession.data.sessionId) {
      // 🔧 修复：强制刷新会话列表以确保新会话显示
      await loadConversations(true);
      
      // 選擇新會話但確保消息列表為空，使用API文档中的sessionId字段
      currentConversationId.value = newSession.data.sessionId; // 🔧 使用API文档中的sessionId字段
      messages.value = []; // 確保新對話的消息列表為空
      
      console.log('✅ 新會話創建成功:', newSession.data.sessionId);
    } else {
      console.error('⚠️ 创建会话响应格式错误:', newSession);
      throw new Error('创建会话响应格式错误');
    }
    
  } catch (error) {
    console.error('❌ 創建新會話失敗:', error);
    // 後備到本地會話管理
    const newConversation = conversationService.createConversation();
    
    if (newConversation) {
      // 刷新会话列表
      conversations.value = conversationService.getAllConversations();
      
      // 選擇新對話但確保消息列表為空
      currentConversationId.value = newConversation.id;
      messages.value = []; // 確保新對話的消息列表為空
    }
  }
  
  // 在小屏幕下，选择会话后隐藏会话列表
  if (isSmallScreen.value) {
    showConversationList.value = false;
  }
  
  // 滚动到底部並聚焦輸入框
  nextTick(() => {
    scrollToBottom();
    if (chatInputRef.value) {
      chatInputRef.value.focus();
    }
  });
}

// 清除当前聊天
function clearCurrentChat() {
  if (!currentConversationId.value) return;
  
  if (confirm('確定要清除當前對話嗎？')) {
    // 删除当前会话
    conversationService.deleteConversation(currentConversationId.value);
    
    // 刷新会话列表
    conversations.value = conversationService.getAllConversations();
    
    // 如果还有会话，选择第一个，否则创建新会话
    if (conversations.value.length > 0) {
      selectConversation(conversations.value[0].id);
    } else {
      startNewConversation();
    }
  }
}

// 編輯會話標題
async function editConversationTitle({ conversationId, newTitle }) {
  try {
    // 使用後端API更新會話標題
    await aiChatService.updateSessionTitle(conversationId, newTitle);
    
    // 🔧 修复：强制刷新会话列表以确保标题更新
    await loadConversations(true);
    
    console.log('✅ 會話標題更新成功:', newTitle);
  } catch (error) {
    console.error('❌ 更新會話標題失敗:', error);
    // 後備到本地更新
    conversationService.updateConversationTitle(conversationId, newTitle);
    // 重新加載本地會話列表
    conversations.value = conversationService.getAllConversations();
  }
}

// 刪除會話
async function deleteConversation(conversationId) {
  try {
    // 使用後端API刪除會話
    await aiChatService.deleteSession(conversationId);
    
    // 🔧 修复：强制刷新会话列表，绕过缓存确保数据一致性
    await loadConversations(true);
    
    // 如果刪除的是當前會話，需要選擇新的會話
    if (currentConversationId.value === conversationId) {
      if (conversations.value.length > 0) {
        selectConversation(conversations.value[0].id);
      } else {
        startNewConversation();
      }
    }
    
    console.log('✅ 會話刪除成功');
  } catch (error) {
    console.error('❌ 刪除會話失敗:', error);
    
    // 🔧 修复：404错误时自动清理前端数据
    if (error.response?.status === 404 || error.message?.includes('請求的資源不存在') || error.message?.includes('請求資源不存在')) {
      console.log('🗑️ 自动清理不存在的会话:', conversationId);
      
      // 从前端列表移除不存在的会话
      conversations.value = conversations.value.filter(c => c.id !== conversationId);
      
      // 如果删除的是当前会话，选择新会话
      if (currentConversationId.value === conversationId) {
        if (conversations.value.length > 0) {
          selectConversation(conversations.value[0].id);
        } else {
          startNewConversation();
        }
      }
      
      console.log('✅ 已自动清理无效会话');
      return; // 提前返回，避免再次执行后备逻辑
    }
    
    // 其他错误的后备处理
    conversationService.deleteConversation(conversationId);
    
    // 重新加載本地會話列表
    conversations.value = conversationService.getAllConversations();
    
    // 如果刪除的是當前會話，需要選擇新的會話
    if (currentConversationId.value === conversationId) {
      if (conversations.value.length > 0) {
        selectConversation(conversations.value[0].id);
      } else {
        startNewConversation();
      }
    }
  }
}

// 切换会话列表显示
function toggleConversationList() {
  showConversationList.value = !showConversationList.value;
}

// 🔧 添加发送状态标志，防止重复提交
const isSending = ref(false);

// 🔧 修复：发送用户消息并获取AI回复（统一咨询次数扣减）
async function sendMessage(message) {
  if (!message || isTyping.value || isSending.value) return;
  
  // 设置发送状态，防止重复提交
  isSending.value = true;
  
  console.log('🚀 發送消息:', message);
  
  try {
    // 🔧 P0 修复：检查用户是否已登录
    const userId = localStorage.getItem('auth_user_id') || '';
    if (userId.startsWith('guest_')) {
      alert('请先登录后再进行咨询');
      router.push('/login');
      return;
    }

    // 🔧 P0 修复：检查剩余咨询次数
    if (remainingQueries.value <= 0) {
      showInsufficientModal.value = true;
      return;
    }

    // 🔧 修复：移除重复的扣费逻辑，咨询次数扣减统一在 aiChatService 中处理

    // 如果沒有當前會話，先創建一個新會話
    if (!currentConversationId.value) {
      console.log('🆕 創建新會話...');
      const newSession = await aiChatService.createSession();
      
      // 🔧 修复：根据API文档正确访问响应数据结构
      if (newSession && newSession.success && newSession.data && newSession.data.sessionId) {
        currentConversationId.value = newSession.data.sessionId; // 🔧 使用API文档中的sessionId字段
        console.log('✅ 新會話已創建:', newSession.data.sessionId);
      } else {
        console.error('⚠️ 创建会话响应格式错误:', newSession);
        throw new Error('创建会话失败');
      }
    }
    
    // 添加用戶消息到UI
    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    messages.value.push(userMessage);
    
    // 保存到本地会话管理（保持兼容性）
    conversationService.updateConversation(currentConversationId.value, messages.value);
    
    // 滚动到底部
    await scrollToBottom();
    
    // 显示AI正在输入
    isTyping.value = true;
    
    console.log('🚀 發送消息到後端API...');
    
    // 調用新的後端API
    const response = await aiChatService.sendMessage(
      currentConversationId.value, 
      message, 
      'question'
    );
    
    console.log('✅ 收到後端API回應:', response);
    
    // 🔧 修復：根據API文檔正確訪問響應數據結構
    if (response && response.success && response.data) {
      // 添加AI回复到UI
      const aiMessage = {
        type: 'ai',
        content: response.data.aiResponse.content,
        reference: validateReferences(response.data.aiResponse.references), // 🔧 使用验证函数
        timestamp: new Date(response.data.aiResponse.createdAt)
      };
      
      // 短暂延迟，使交互更自然
      setTimeout(() => {
        isTyping.value = false;
        isSending.value = false; // 重置发送状态
        messages.value.push(aiMessage);
        
        // 更新本地会话管理（保持兼容性）
        conversationService.updateConversation(currentConversationId.value, messages.value);
        
        // 刷新会话列表（標題可能已更新）
        loadConversations();
        
        // 更新剩餘諮詢次數（如果後端提供）
        if (response.data.remainingQueries !== undefined) {
          console.log('剩餘諮詢次數:', response.data.remainingQueries);
          // 更新localStorage中的用戶信息
          try {
            const currentUserInfo = JSON.parse(localStorage.getItem('auth_user') || '{}');
            currentUserInfo.remaining_free_queries = response.data.remainingQueries;
            localStorage.setItem('auth_user', JSON.stringify(currentUserInfo));
          } catch (error) {
            console.error('更新剩餘諮詢次數失敗:', error);
          }
        }
        
        scrollToBottom();
      }, 500);
    } else {
      // 處理API響應格式錯誤
      setTimeout(() => {
        isTyping.value = false;
        isSending.value = false; // 重置发送状态
        
        const errorMessage = {
          type: 'ai',
          content: response?.message || '服務器響應格式錯誤，請稍後再試。',
          timestamp: new Date()
        };
        
        messages.value.push(errorMessage);
        conversationService.updateConversation(currentConversationId.value, messages.value);
        scrollToBottom();
      }, 500);
    }
    
  } catch (error) {
    console.error('❌ 發送消息失敗:', error);
    
    // 🔧 修复：专门处理不同类型的错误
    setTimeout(() => {
      isTyping.value = false;
      isSending.value = false; // 重置发送状态
      
      if (error.message && error.message.includes('咨询次数已用完')) {
        // 显示次数不足弹窗
        showInsufficientModal.value = true;
        return;
      } else if (error.message && error.message.includes('扣减咨询次数失败')) {
        // 专门处理扣减次数失败的错误
        showInsufficientModal.value = true;
        return;
      } else if (error.message && error.message.includes('请先登录')) {
        // 引导用户登录
        router.push('/login');
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

// 格式化时间为HH:MM
function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 滚动到聊天底部
async function scrollToBottom() {
  await nextTick();
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
  }
}

// 响应窗口大小变化
function handleResize() {
  if (window.innerWidth >= 768) {
    // 大屏幕默认显示会话列表
    showConversationList.value = true;
  } else {
    // 小屏幕默认隐藏会话列表，除非URL中有指定的conversationId
    const urlConversationId = route.query.id;
    if (urlConversationId) {
      // 如果是從特定對話跳轉來的，在小屏幕上也顯示會話列表
      showConversationList.value = true;
    } else {
      showConversationList.value = false;
    }
  }
}

// 测试连接函数 - 使用新的API
async function testConnection() {
  try {
    isTyping.value = true;
    
    const testMessage = {
      type: 'user',
      content: '測試連接...',
      timestamp: new Date()
    };
    
    messages.value.push(testMessage);
    
    // 更新会话
    if (currentConversationId.value) {
      conversationService.updateConversation(currentConversationId.value, messages.value);
    }
    
    await scrollToBottom();
    
    // 使用新的aiChatService測試連接
    const isConnected = await aiChatService.testConnection();
    
    // 添加测试结果到消息列表
    setTimeout(() => {
      isTyping.value = false;
      
      const resultMessage = {
        type: 'ai',
        content: isConnected ? '✅ API連接測試成功！' : '❌ API連接測試失敗，請檢查網絡或聯繫技術支援。',
        timestamp: new Date()
      };
      
      messages.value.push(resultMessage);
      
      // 更新会话
      if (currentConversationId.value) {
        conversationService.updateConversation(currentConversationId.value, messages.value);
      }
      
      scrollToBottom();
    }, 500);
  } catch (error) {
    console.error('測試連接失敗:', error);
    
    // 显示错误消息
    setTimeout(() => {
      isTyping.value = false;
      
      const errorMessage = {
        type: 'ai',
        content: '❌ 測試連接時出現錯誤，請稍後再試。',
        timestamp: new Date()
      };
      
      messages.value.push(errorMessage);
      
      // 更新会话
      if (currentConversationId.value) {
        conversationService.updateConversation(currentConversationId.value, messages.value);
      }
      
      scrollToBottom();
    }, 500);
  }
}



// 监听窗口大小变化
onMounted(async () => {
  window.addEventListener('resize', handleResize);
  handleResize(); // 初始设置
  
  // 🔧 P0 修复：添加次数更新事件监听
  window.addEventListener('queryCountUpdated', handleQueryCountUpdate);
  
  // 🔧 P0 修复：初始化时获取剩余咨询次数
  await updateQueryCount();
  
  // 加载会话列表
  loadConversations();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  // 🔧 P0 修复：移除次数更新事件监听
  window.removeEventListener('queryCountUpdated', handleQueryCountUpdate);
});
</script>

<style scoped>
/* ChatView 样式 */
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 600;
  text-decoration: none;
  color: white;
  transition: opacity 0.2s;
}

.header-title:hover {
  opacity: 0.8;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 🔧 P0 修复：剩余次数显示样式 */
.remaining-queries-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  margin-right: 8px;
}

.queries-text {
  color: rgba(255, 255, 255, 0.9);
}

.queries-count {
  font-weight: bold;
  color: white;
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
}

.queries-count.low-queries {
  background: #ef4444;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 🔧 P0 修复：次数不足弹窗样式 */
.insufficient-queries-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.insufficient-queries-modal {
  background: white;
  border-radius: 12px;
  padding: 0;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.insufficient-queries-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.insufficient-queries-modal .modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.insufficient-queries-modal .close-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.insufficient-queries-modal .close-button:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.insufficient-queries-modal .modal-body {
  padding: 24px;
  text-align: center;
}

.insufficient-queries-modal .modal-icon {
  font-size: 48px;
  color: #f59e0b;
  margin-bottom: 16px;
}

.insufficient-queries-modal .modal-message {
  margin-bottom: 24px;
  color: #6b7280;
  line-height: 1.5;
}

.insufficient-queries-modal .modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.insufficient-queries-modal .action-button {
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.insufficient-queries-modal .action-button.primary {
  background-color: #3b82f6;
  color: white;
}

.insufficient-queries-modal .action-button.primary:hover {
  background-color: #2563eb;
}

.insufficient-queries-modal .action-button.secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.insufficient-queries-modal .action-button.secondary:hover {
  background-color: #e5e7eb;
}

@media (min-width: 640px) {
  .insufficient-queries-modal .modal-actions {
    flex-direction: row;
  }
}

.header-action-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  padding: 8px;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.header-action-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.tooltip-container {
  position: relative;
}

.tooltip-text {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.tooltip-container:hover .tooltip-text {
  opacity: 1;
}

.back-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  margin-right: 16px;
}

.chat-body-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.conversation-list-panel {
  width: 300px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}

.conversation-list-panel.mobile-panel {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 999;
  transform: translateX(-100%);
}

.conversation-list-panel.mobile-panel.active {
  transform: translateX(0);
}

.chat-content-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.chat-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.chat-footer {
  border-top: 1px solid #e5e7eb;
  padding: 20px;
  background: white;
}

.sidebar-footer {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-around;
}

.sidebar-footer-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #6b7280;
  font-size: 12px;
  transition: color 0.2s;
}

.sidebar-footer-link:hover {
  color: #3b82f6;
}

.sidebar-footer-link .icon {
  margin-bottom: 4px;
}

.typing-indicator-wrapper {
  margin-top: 16px;
}

.connection-error {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.close-error-button {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
}

/* 🔧 P0 修复：剩余次数显示样式 */
.remaining-queries-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.queries-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

.queries-count {
  color: white;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 24px;
  text-align: center;
}

.queries-count.low-queries {
  background: rgba(239, 68, 68, 0.8);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 🔧 P0 修复：次数不足弹窗样式 */
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
  max-width: 480px;
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
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
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
  padding: 24px;
  text-align: center;
}

.modal-icon {
  font-size: 48px;
  color: #f59e0b;
  margin-bottom: 16px;
}

.modal-message {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 24px;
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
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-header {
    padding: 12px 16px;
  }
  
  .header-title {
    font-size: 1.25rem;
  }
  
  .chat-body {
    padding: 16px;
  }
  
  .chat-footer {
    padding: 16px;
  }
  
  .conversation-list-panel {
    width: 280px;
  }
}
</style> 