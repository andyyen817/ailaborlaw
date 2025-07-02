<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h1 class="text-2xl font-semibold text-gray-800 mb-6">聊天記錄管理</h1>

    <!-- 搜索和篩選 -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="searchUser" class="block text-sm font-medium text-gray-700 mb-1">搜索用戶 (ID 或郵箱)</label>
          <input type="text" id="searchUser" v-model="filters.userQuery" @input="applyFilters"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                 placeholder="輸入用戶ID或郵箱...">
        </div>
        <div>
          <label for="searchConversation" class="block text-sm font-medium text-gray-700 mb-1">搜索會話 ID</label>
          <input type="text" id="searchConversation" v-model="filters.conversationIdQuery" @input="applyFilters"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                 placeholder="輸入會話ID...">
        </div>
        <div>
          <label for="dateRange" class="block text-sm font-medium text-gray-700 mb-1">日期範圍</label>
          <input type="date" id="dateRange" v-model="filters.date" @input="applyFilters"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
        </div>
      </div>
      <div class="mt-4 flex space-x-4">
        <button @click="loadConversationsData" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          刷新聊天記錄
        </button>
        <button @click="diagnoseChatHistory" class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
          診斷聊天記錄
        </button>
        <span v-if="lastRefreshTime" class="text-sm text-gray-500 self-center ml-2">
          上次刷新: {{ new Date(lastRefreshTime).toLocaleTimeString() }}
        </span>
      </div>
    </div>

    <!-- 診斷信息顯示區 -->
    <div v-if="showDiagnostics" class="mb-6 bg-white p-4 rounded-lg shadow">
      <h3 class="font-semibold text-lg mb-2 flex justify-between">
        <span>診斷信息</span>
        <button @click="showDiagnostics = false" class="text-gray-500 hover:text-gray-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </h3>
      <div class="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-64">
        <p>localStorage 全局聊天記錄大小: {{ chatHistorySize }}</p>
        <p>聊天記錄條數: {{ chatHistoryCount }}</p>
        <p>已加載會話數: {{ allConversations.length }}</p>
        <p>最後更新時間: {{ lastGlobalHistoryUpdate }}</p>
        <div v-if="diagnosticSample" class="mt-2">
          <p>記錄樣本:</p>
          <pre class="bg-gray-200 p-2 rounded text-xs mt-1">{{ diagnosticSample }}</pre>
        </div>
      </div>
      <div class="mt-4">
        <button @click="repairChatHistory" class="px-3 py-1.5 bg-red-500 text-white rounded-md text-sm hover:bg-red-600">
          嘗試修復全局聊天記錄
        </button>
        <span class="text-xs text-gray-500 ml-2">僅在全局聊天記錄損壞時使用</span>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- 會話列表 -->
      <div class="lg:w-1/3 bg-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-semibold text-gray-700 mb-3">會話列表</h2>
        <div v-if="isLoadingConversations" class="text-center py-4">
          <i class="fas fa-spinner fa-spin text-blue-500 text-2xl"></i>
          <p class="text-sm text-gray-500 mt-1">加載中...</p>
        </div>
        <div v-else-if="filteredConversations.length === 0" class="text-center py-4 text-gray-500">
          無符合條件的會話
          <div class="mt-2">
            <button @click="loadConversationsData" class="text-blue-500 hover:text-blue-700 text-sm underline">
              重新加載
            </button>
          </div>
        </div>
        <ul v-else class="space-y-2 max-h-96 overflow-y-auto">
          <li v-for="conv in filteredConversations" :key="conv.id"
              @click="selectConversation(conv)"
              :class="['p-3 rounded-md cursor-pointer hover:bg-blue-50', selectedConversation?.id === conv.id ? 'bg-blue-100 border-l-4 border-blue-500' : 'border border-gray-200']">
            <div class="font-medium text-gray-800">用戶: {{ conv.userName || conv.userId || 'N/A' }}</div>
            <div class="text-xs text-gray-500">ID: {{ conv.id }}</div>
            <div class="text-xs text-gray-500">最後更新: {{ formatTimestamp(conv.lastMessageTime) }}</div>
          </li>
        </ul>
      </div>

      <!-- 聊天詳情 -->
      <div class="lg:w-2/3 bg-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-semibold text-gray-700 mb-3">聊天詳情</h2>
        <div v-if="!selectedConversation" class="text-center py-10 text-gray-500">
          請選擇一個會話以查看詳情
        </div>
        <div v-else>
          <div class="mb-4 flex justify-between items-center">
            <div>
              <h3 class="text-md font-semibold">會話 ID: {{ selectedConversation.id }}</h3>
              <p class="text-sm text-gray-600">用戶: {{ selectedConversation.userName || selectedConversation.userId || 'N/A' }}</p>
            </div>
            <div class="space-x-2">
              <button @click="exportConversation(selectedConversation.id)"
                      class="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md shadow-sm">
                <i class="fas fa-download mr-1"></i> 導出
              </button>
            </div>
          </div>

          <div class="border rounded-md p-3 max-h-96 overflow-y-auto bg-gray-50 space-y-3">
            <div v-if="isLoadingMessages" class="text-center py-4">
                <i class="fas fa-spinner fa-spin text-blue-500 text-xl"></i>
            </div>
            <div v-else-if="selectedConversationMessages.length === 0" class="text-gray-500 text-sm">
                此會話沒有消息。
            </div>
            <div v-for="msg in selectedConversationMessages" :key="msg.timestamp"
                 :class="['p-2 rounded-lg max-w-xl', msg.type === 'user' ? 'bg-blue-100 ml-auto text-right' : 'bg-gray-200 mr-auto']">
              <p class="text-sm">{{ msg.content }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ formatTimestamp(msg.timestamp) }}</p>
              <div v-if="msg.reference" class="mt-1 p-1.5 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 text-left">
                參考: {{ msg.reference }}
              </div>
               <div v-if="msg.isFallback" class="mt-1 text-xs text-orange-600 text-left">
                (備援模式)
              </div>
            </div>
          </div>
          
          <!-- 標記與分類 (MVP 佔位) -->
          <div class="mt-4 pt-4 border-t">
            <h4 class="text-sm font-semibold text-gray-700 mb-2">標記與分類 (MVP 功能)</h4>
            <div class="flex items-center space-x-2">
              <select class="px-3 py-1.5 border border-gray-300 rounded-md text-sm">
                <option value="">選擇標籤</option>
                <option value="bad_answer">回答不佳</option>
                <option value="sensitive_info">敏感信息</option>
                <option value="follow_up">需跟進</option>
              </select>
              <button class="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 rounded-md">添加標籤</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';
import conversationService from '@/services/conversationService'; // 假設我們有這個服務
import userService from '@/services/userService'; // 假設我們有這個服務
import adminChatService from '@/services/adminChatService'; // 假設我們有這個服務

const allConversations = ref([]);
const allUsers = ref([]); // 用於根據用戶ID獲取用戶名或郵箱

const isLoadingConversations = ref(false);
const isLoadingMessages = ref(false);
const showDiagnostics = ref(false);
const lastRefreshTime = ref(null);
const chatHistorySize = ref('未知');
const chatHistoryCount = ref(0);
const lastGlobalHistoryUpdate = ref('未知');
const diagnosticSample = ref('');

const filters = reactive({
  userQuery: '',
  conversationIdQuery: '',
  date: '',
});

const selectedConversation = ref(null);
const selectedConversationMessages = ref([]);
let refreshInterval = null; // 用於設置定時刷新

// 診斷功能
function diagnoseChatHistory() {
  showDiagnostics.value = true;
  
  try {
    const globalStoreKey = 'global_chat_history';
    const globalHistory = localStorage.getItem(globalStoreKey);
    
    if (globalHistory) {
      chatHistorySize.value = `${(globalHistory.length / 1024).toFixed(2)} KB`;
      
      try {
        const historyData = JSON.parse(globalHistory);
        chatHistoryCount.value = historyData.length;
        
        // 獲取最後更新時間
        if (historyData.length > 0) {
          const lastItem = historyData[historyData.length - 1];
          lastGlobalHistoryUpdate.value = new Date(lastItem.timestamp).toLocaleString();
          
          // 顯示最新的記錄樣本
          const recentItems = historyData.slice(-2);
          diagnosticSample.value = JSON.stringify(recentItems, null, 2);
        } else {
          lastGlobalHistoryUpdate.value = '沒有記錄';
          diagnosticSample.value = '[]';
        }
      } catch (e) {
        console.error('解析全局聊天歷史失敗:', e);
        chatHistoryCount.value = '解析錯誤';
        lastGlobalHistoryUpdate.value = '解析錯誤';
        diagnosticSample.value = globalHistory.substring(0, 200) + '...';
      }
    } else {
      chatHistorySize.value = '0 KB';
      chatHistoryCount.value = 0;
      lastGlobalHistoryUpdate.value = '沒有數據';
      diagnosticSample.value = '沒有存儲數據';
    }
  } catch (error) {
    console.error('診斷聊天記錄失敗:', error);
  }
}

// 嘗試修復全局聊天記錄
function repairChatHistory() {
  try {
    // 檢查是否有備份或其他來源的聊天記錄
    const conversationsData = conversationService.getAllConversations();
    if (!conversationsData || conversationsData.length === 0) {
      alert('沒有找到可用於修復的會話數據');
      return;
    }
    
    // 從現有的會話數據創建全局聊天記錄
    const globalHistory = [];
    
    conversationsData.forEach(conv => {
      if (conv.messages && conv.messages.length > 0) {
        conv.messages.forEach(msg => {
          globalHistory.push({
            type: msg.type,
            content: msg.content,
            userId: conv.userId || 'unknown',
            conversationId: conv.id,
            sessionId: conv.id,
            timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString(),
            reference: msg.reference,
            isFallback: msg.isFallback
          });
        });
      }
    });
    
    if (globalHistory.length > 0) {
      localStorage.setItem('global_chat_history', JSON.stringify(globalHistory));
      alert(`修復完成，已從會話數據中恢復了 ${globalHistory.length} 條聊天記錄`);
      diagnoseChatHistory(); // 更新診斷信息
      loadConversationsData(); // 重新加載數據
    } else {
      alert('沒有找到可用的聊天消息進行修復');
    }
  } catch (error) {
    console.error('修復全局聊天記錄失敗:', error);
    alert('修復失敗：' + error.message);
  }
}

// 載入會話數據
async function loadConversationsData() {
  isLoadingConversations.value = true;
  lastRefreshTime.value = Date.now();
  
  try {
    console.log('正在從後端API重新載入聊天記錄...');
    
    // 使用管理員API獲取所有會話
    const response = await adminChatService.getAllSessions({
      page: 1,
      limit: 1000, // 獲取所有會話
      status: 'all'
    });
    
    if (response && response.sessions) {
      // 轉換API數據為所需格式
      const conversations = response.sessions.map(session => ({
        id: session.sessionId,
        userId: session.userId,
        userName: session.userName || '未知用戶',
        userEmail: session.userEmail || '',
        title: session.title || '新對話',
        messageCount: session.messageCount || 0,
        lastMessageTime: new Date(session.lastMessageAt || session.createdAt),
        preview: `${session.messageCount || 0} 條消息`,
        messages: [] // 如果需要詳細消息，可以通過getSessionDetails獲取
      }));
      
      // 按時間排序
      allConversations.value = conversations.sort((a, b) => 
        b.lastMessageTime - a.lastMessageTime
      );
      
      console.log(`✅ 成功從API載入 ${conversations.length} 個會話`);
      
      // 如果當前已選擇了會話，更新其消息
      if (selectedConversation.value) {
        const updatedConv = allConversations.value.find(c => c.id === selectedConversation.value.id);
        if (updatedConv) {
          console.log(`更新當前選擇的會話 ${selectedConversation.value.id}`);
          selectedConversation.value = updatedConv;
          // 如果需要詳細消息，可以重新加載
          await selectConversation(updatedConv);
        }
      }
    } else {
      console.warn('❌ API響應中沒有會話數據');
      allConversations.value = [];
    }
    
  } catch (error) {
    console.error('❌ 從API載入聊天記錄失敗:', error);
    
    // 顯示用戶友好的錯誤提示
    allConversations.value = [];
    console.log('💡 請檢查網絡連接或聯繫系統管理員');
    
  } finally {
    isLoadingConversations.value = false;
  }
}

// 加載所有會話和用戶數據
onMounted(async () => {
  // 初次加載數據
  await loadConversationsData();
  
  // 設置定時刷新 (每15秒刷新一次)
  refreshInterval = setInterval(loadConversationsData, 15000);
  
  // 添加聊天同步事件監聽
  window.addEventListener('chat:sync', handleChatSync);
  window.addEventListener('message', handlePostMessage);
});

// 清理
onUnmounted(() => {
  // 清除定時器
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  // 移除事件監聽
  window.removeEventListener('chat:sync', handleChatSync);
  window.removeEventListener('message', handlePostMessage);
});

// 處理聊天同步事件
function handleChatSync(event) {
  console.log('管理後台接收到聊天同步事件:', event.detail);
  
  // 收到新消息通知後，重新載入數據
  loadConversationsData();
}

// 處理postMessage事件
function handlePostMessage(event) {
  // 安全檢查
  if (!event.data || typeof event.data !== 'object') return;
  
  try {
    // 檢查是否是聊天歷史更新消息
    if (event.data.type === 'chat_history_updated') {
      console.log('收到聊天記錄更新postMessage通知:', event.data);
      loadConversationsData();
    }
  } catch (error) {
    console.error('處理postMessage事件時出錯:', error);
  }
}

const filteredConversations = computed(() => {
  return allConversations.value.filter(conv => {
    const userMatch = filters.userQuery ? 
      (conv.userId?.toLowerCase().includes(filters.userQuery.toLowerCase()) || 
       conv.userName?.toLowerCase().includes(filters.userQuery.toLowerCase())) : true;
    const conversationIdMatch = filters.conversationIdQuery ? 
      conv.id?.toLowerCase().includes(filters.conversationIdQuery.toLowerCase()) : true;
    const dateMatch = filters.date ? 
      new Date(conv.lastMessageTime).toDateString() === new Date(filters.date).toDateString() : true;
    return userMatch && conversationIdMatch && dateMatch;
  });
});

async function selectConversation(conversation) {
  selectedConversation.value = conversation;
  isLoadingMessages.value = true;
  selectedConversationMessages.value = [];
  
  try {
    console.log(`選擇會話: ${conversation.id}`);
    
    // 使用管理員API獲取會話詳情和消息
    const sessionDetails = await adminChatService.getSessionDetails(conversation.id);
    
    if (sessionDetails && sessionDetails.messages) {
      // 轉換API消息格式
      selectedConversationMessages.value = sessionDetails.messages.map(msg => ({
        type: msg.role === 'user' ? 'user' : 'ai',
        content: msg.content,
        timestamp: new Date(msg.createdAt),
        messageId: msg.messageId,
        feedback: msg.feedback,
        references: msg.metadata?.references || []
      }));
      
      console.log(`✅ 從API加載了 ${selectedConversationMessages.value.length} 條消息`);
    } else {
      console.warn('❌ 無法獲取會話詳情');
      selectedConversationMessages.value = [];
    }
    
  } catch (error) {
    console.error('❌ 加載會話消息失敗:', error);
    selectedConversationMessages.value = [];
    console.log('💡 請檢查網絡連接或聯繫系統管理員');
  } finally {
    isLoadingMessages.value = false;
  }
}

function applyFilters() {
  // 觸發 computed property 重新計算
  // 如果需要，可以在這裡添加 debounce 邏輯
  selectedConversation.value = null; // 清除已選擇的會話
  selectedConversationMessages.value = [];
}

function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

function exportConversation(conversationId) {
  // MVP: 簡單的 JSON 導出
  const conversation = conversationService.getConversation(conversationId);
  if (conversation) {
    const dataStr = JSON.stringify(conversation, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `conversation_${conversationId}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    linkElement.remove();
    alert('會話已導出為 JSON 文件。');
  } else {
    alert('找不到會話數據。');
  }
}
</script>

<style scoped>
/* 可以在這裡添加一些額外的樣式，Tailwind 應該能處理大部分 */
.max-h-96 {
  max-height: 24rem; /* 384px */
}
</style>
