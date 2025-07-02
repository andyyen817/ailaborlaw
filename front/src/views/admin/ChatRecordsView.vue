<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">AI聊天记录管理</h1>
    
    <!-- 搜索和筛选 -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="form-group">
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">搜索</label>
          <input
            v-model="filters.search"
            type="text"
            id="search"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="搜索用户或聊天内容..."
          />
        </div>
        
        <div class="form-group">
          <label for="dateRange" class="block text-sm font-medium text-gray-700 mb-1">日期范围</label>
          <select
            v-model="filters.dateRange"
            id="dateRange"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">全部时间</option>
            <option value="today">今天</option>
            <option value="yesterday">昨天</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
          </select>
        </div>
        
        <div class="form-group md:col-span-2 flex items-end">
          <button 
            @click="applyFilters" 
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mr-2"
          >
            <i class="fas fa-search mr-1"></i> 搜索
          </button>
          <button 
            @click="resetFilters" 
            class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
          >
            <i class="fas fa-redo-alt mr-1"></i> 重置
          </button>
          <button 
            @click="refreshData" 
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md ml-2"
          >
            <i class="fas fa-sync-alt mr-1"></i> 刷新數據
          </button>
        </div>
      </div>
    </div>
    
    <!-- 聊天记录表格 -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用户信息
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                最近对话时间
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                对话数量
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                问题内容
              </th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="filteredChatRecords.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                <i class="fas fa-inbox text-2xl mb-2"></i>
                <p>暂无聊天记录</p>
              </td>
            </tr>
            
            <tr v-for="record in filteredChatRecords" :key="record.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 flex-shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {{ record.user.name.charAt(0) }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ record.user.name }}</div>
                    <div class="text-sm text-gray-500">{{ record.user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(record.updatedAt) }}</div>
                <div class="text-xs text-gray-500">{{ formatTime(record.updatedAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ record.messageCount }} 条消息
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 line-clamp-2">{{ record.lastMessage }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <button 
                  @click="viewChatDetails(record.id)" 
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button 
                  @click="deleteChatRecord(record.id)" 
                  class="text-red-600 hover:text-red-900"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页 -->
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            上一页
          </button>
          <button class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            下一页
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              显示 <span class="font-medium">1</span> 到 <span class="font-medium">10</span> 共 <span class="font-medium">{{ filteredChatRecords.length }}</span> 条记录
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span class="sr-only">上一页</span>
                <i class="fas fa-chevron-left text-xs"></i>
              </button>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-gray-50 text-sm font-medium text-gray-500">
                ...
              </button>
              <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span class="sr-only">下一页</span>
                <i class="fas fa-chevron-right text-xs"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 聊天详情模态框 -->
    <div v-if="showChatDetails" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen flex flex-col">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">聊天记录详情</h3>
          <button @click="closeChatDetails" class="text-gray-400 hover:text-gray-500">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="selectedChat" class="space-y-4">
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {{ selectedChat.user.name.charAt(0) }}
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">{{ selectedChat.user.name }}</p>
                  <p class="text-xs text-gray-500">{{ selectedChat.user.email }}</p>
                </div>
              </div>
              <div class="text-sm text-gray-500">
                会话开始时间: {{ formatDate(selectedChat.createdAt) }} {{ formatTime(selectedChat.createdAt) }}
              </div>
            </div>
            
            <!-- 聊天消息顯示區域 -->
            <div class="mt-6 space-y-4">
              <!-- 錯誤狀態顯示 -->
              <div v-if="selectedChat.error" class="text-center py-8">
                <i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
                <p class="text-red-600">{{ selectedChat.error }}</p>
              </div>
              
              <!-- 無消息狀態 -->
              <div v-else-if="!selectedChat.messages || selectedChat.messages.length === 0" class="text-center py-8">
                <i class="fas fa-comment-slash text-gray-400 text-2xl mb-2"></i>
                <p class="text-gray-500">此會話暫無消息記錄</p>
              </div>
              
              <!-- 消息列表 -->
              <div v-else class="space-y-4">
                <div v-for="(message, index) in selectedChat.messages" :key="message.messageId || index" 
                     class="chat-message-container" 
                     :class="message.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
                  <div :class="[
                    'max-w-lg rounded-lg p-3 shadow-sm',
                    message.role === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'
                  ]">
                    <!-- 消息內容 -->
                    <div class="whitespace-pre-wrap">{{ message.content }}</div>
                    
                    <!-- 法條引用（僅AI消息顯示） -->
                    <div v-if="message.role === 'ai' && message.metadata && message.metadata.references && message.metadata.references.length > 0" 
                         class="mt-2 pt-2 border-t border-gray-200">
                      <p class="text-xs text-gray-600 mb-1">相關法條：</p>
                      <div class="space-y-1">
                        <div v-for="ref in message.metadata.references" :key="ref._id" 
                             class="text-xs text-blue-600 hover:text-blue-800">
                          <a :href="ref.url" target="_blank" class="underline">
                            {{ ref.law }} {{ ref.article }}
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 反饋狀態（僅AI消息顯示） -->
                    <div v-if="message.role === 'ai' && message.feedback" 
                         class="mt-2 pt-2 border-t border-gray-200">
                      <span :class="[
                        'text-xs px-2 py-1 rounded',
                        message.feedback === 'helpful' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      ]">
                        {{ message.feedback === 'helpful' ? '👍 有用' : '👎 無用' }}
                      </span>
                    </div>
                    
                    <!-- 時間戳 -->
                    <div class="mt-2 text-xs text-gray-500 text-right">
                      {{ formatTime(message.createdAt) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="px-6 py-4 border-t border-gray-200">
          <button @click="closeChatDetails" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import userService from '@/services/userService';
import adminChatService from '@/services/adminChatService';

// 筛选条件
const filters = reactive({
  search: '',
  dateRange: 'all'
});

// 聊天记录数据
const chatRecords = ref([]);
const isLoading = ref(false);
let refreshInterval = null;

// 加載數據
async function loadChatData() {
  // 防重複調用檢查
  if (isLoading.value) {
    console.log('⚠️ 數據正在加載中，跳過重複請求');
    return;
  }
  
  isLoading.value = true;
  
  try {
    console.log('🔄 正在從後端API加載聊天數據...');
    
    // 使用真實的管理員聊天API獲取所有會話
    const response = await adminChatService.getAllSessions({
      page: 1,
      limit: 1000, // 獲取所有會話
      search: filters.search,
      status: 'all'
    });
    
    if (response && response.sessions) {
      // 使用adminChatService的格式化方法轉換數據
      chatRecords.value = adminChatService.formatSessionsForDisplay(response.sessions);
      console.log(`✅ 成功從API加載 ${chatRecords.value.length} 個對話`);
      
      // 添加調試信息
      console.log('📊 原始會話數據樣本:', chatRecords.value.slice(0, 2));
      console.log('🔍 當前篩選條件:', filters);
    } else {
      console.warn('❌ API響應中沒有會話數據');
      chatRecords.value = [];
    }
    
  } catch (error) {
    console.error('❌ 從API加載聊天數據失敗:', error);
    
    // 顯示用戶友好的錯誤提示
    chatRecords.value = [];
    
    // 可以在這裡添加用戶通知
    // 例如：toast通知或錯誤狀態顯示
    console.log('💡 請檢查網絡連接或聯繫系統管理員');
    
    // 重新拋出錯誤，讓調用者知道失敗了
    throw error;
  } finally {
    isLoading.value = false;
  }
}

// 聊天详情模态框
const showChatDetails = ref(false);
const selectedChat = ref(null);

// 过滤后的聊天记录
const filteredChatRecords = computed(() => {
  const filtered = chatRecords.value.filter(record => {
    // 增強搜索匹配的安全性，避免undefined導致的錯誤
    const searchMatch = !filters.search || 
      (record.user?.name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
      (record.user?.email || '').toLowerCase().includes(filters.search.toLowerCase()) ||
      (record.lastMessage || '').toLowerCase().includes(filters.search.toLowerCase());
    
    if (!searchMatch) return false;
    
    // 日期筛选逻辑
    if (filters.dateRange === 'all') return true;
    
    // 增強日期處理的安全性
    const recordDate = record.updatedAt ? new Date(record.updatedAt) : new Date();
    if (isNaN(recordDate.getTime())) {
      console.warn('無效的日期格式:', record.updatedAt);
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - today.getDay());
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    switch (filters.dateRange) {
      case 'today':
        return recordDate >= today;
      case 'yesterday':
        return recordDate >= yesterday && recordDate < today;
      case 'week':
        return recordDate >= weekStart;
      case 'month':
        return recordDate >= monthStart;
      default:
        return true;
    }
  });
  
  // 添加過濾結果的調試信息
  if (chatRecords.value.length !== filtered.length) {
    console.log(`🔍 過濾結果: ${chatRecords.value.length} → ${filtered.length} (過濾掉 ${chatRecords.value.length - filtered.length} 個)`);
  }
  
  return filtered;
});

// 事件處理函數
function handleChatSync(event) {
  console.log('收到聊天同步事件:', event.detail);
  loadChatData();
}

function handlePostMessage(event) {
  // 安全檢查
  if (!event.data || typeof event.data !== 'object') return;
  
  try {
    // 檢查是否是聊天歷史更新消息
    if (event.data.type === 'chat_history_updated') {
      console.log('收到聊天記錄更新postMessage通知:', event.data);
      loadChatData();
    }
  } catch (error) {
    console.error('處理postMessage事件時出錯:', error);
  }
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// 格式化时间
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

// 手動刷新數據
function refreshData() {
  loadChatData();
}

// 应用筛选
function applyFilters() {
  console.log('應用篩選:', filters);
}

// 重置筛选
function resetFilters() {
  filters.search = '';
  filters.dateRange = 'all';
}

// 查看聊天详情
async function viewChatDetails(id) {
  const chat = chatRecords.value.find(record => record.id === id);
  if (chat) {
    try {
      console.log('🔍 正在獲取會話詳情:', id);
      
      // 調用API獲取完整的會話詳情和消息列表
      const sessionDetails = await adminChatService.getSessionDetails(id);
      
      if (sessionDetails && sessionDetails.session) {
        // 將API返回的詳細數據與現有會話基本信息合併
        selectedChat.value = {
          ...chat, // 保留現有的基本信息
          ...sessionDetails.session, // 覆蓋with API返回的詳細信息
          messages: sessionDetails.messages || [] // 添加完整的消息列表
        };
        
        console.log('✅ 會話詳情獲取成功:', selectedChat.value);
        console.log('📝 消息數量:', selectedChat.value.messages.length);
        
        showChatDetails.value = true;
      } else {
        console.error('❌ API返回的會話詳情格式錯誤');
        // 降級處理：仍然顯示基本信息
        selectedChat.value = chat;
        showChatDetails.value = true;
      }
    } catch (error) {
      console.error('❌ 獲取會話詳情失敗:', error);
      
      // 錯誤處理：顯示錯誤提示，但仍然開啟詳情框顯示基本信息
      alert('獲取對話詳情失敗，將顯示基本信息。請檢查網絡連接或聯繫管理員。');
      selectedChat.value = {
        ...chat,
        messages: [], // 空消息列表
        error: '無法加載詳細對話記錄'
      };
      showChatDetails.value = true;
    }
  }
}

// 关闭聊天详情
function closeChatDetails() {
  showChatDetails.value = false;
  selectedChat.value = null;
}

// 删除聊天记录
function deleteChatRecord(id) {
  if (confirm('確定要刪除這條聊天記錄嗎？此操作不可撤銷。')) {
    const index = chatRecords.value.findIndex(record => record.id === id);
    if (index !== -1) {
      chatRecords.value.splice(index, 1);
      console.log(`已從前端列表中刪除會話 ${id}`);
      
      // TODO: 如果需要，可以調用後端API永久刪除此會話
      // await adminChatService.deleteSession(id);
    }
  }
}

// 组件挂载时初始化
onMounted(async () => {
  // 初次加載數據
  await loadChatData();
  
  // 設置定時刷新 (每30秒刷新一次)
  refreshInterval = setInterval(loadChatData, 30000);
});

// 組件卸載時清理
onUnmounted(() => {
  // 清除定時器
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 