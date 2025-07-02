<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-800">專家諮詢管理</h1>
      <div class="flex space-x-3">
        <button @click="manualRefresh" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors shadow-sm flex items-center">
          <i class="fas fa-sync-alt mr-2"></i> 刷新數據
        </button>
        <a href="/test-consultation.html" target="_blank" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors shadow-sm flex items-center">
          <i class="fas fa-tools mr-2"></i> 專家諮詢測試工具
        </a>
      </div>
    </div>

    <!-- 篩選區域 -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="filterName" class="block text-sm font-medium text-gray-700 mb-1">用戶名/聯繫方式</label>
          <input type="text" id="filterName" v-model="filters.query" @input="applyFilters"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                 placeholder="搜索姓名、電話或郵箱...">
        </div>
        <div>
          <label for="filterStatus" class="block text-sm font-medium text-gray-700 mb-1">狀態</label>
          <select id="filterStatus" v-model="filters.status" @change="applyFilters"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
            <option value="">所有狀態</option>
            <option value="pending">待處理</option>
            <option value="processing">處理中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
        <div>
          <label for="filterDate" class="block text-sm font-medium text-gray-700 mb-1">提交日期</label>
          <input type="date" id="filterDate" v-model="filters.date" @input="applyFilters"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
        </div>
      </div>
    </div>

    <!-- 統計信息 -->
    <div class="mb-4 bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
        <div class="px-4 py-2">
          <div class="text-sm font-medium text-gray-500">總諮詢請求</div>
          <div class="text-2xl font-bold text-gray-800">{{ allRequests.length }}</div>
        </div>
        <div class="px-4 py-2">
          <div class="text-sm font-medium text-gray-500">待處理</div>
          <div class="text-2xl font-bold text-yellow-600">{{ getPendingCount }}</div>
        </div>
        <div class="px-4 py-2">
          <div class="text-sm font-medium text-gray-500">處理中</div>
          <div class="text-2xl font-bold text-blue-600">{{ getProcessingCount }}</div>
        </div>
        <div class="px-4 py-2">
          <div class="text-sm font-medium text-gray-500">已完成</div>
          <div class="text-2xl font-bold text-green-600">{{ getCompletedCount }}</div>
        </div>
      </div>
    </div>

    <!-- 諮詢請求列表 -->
    <div class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">聯絡資訊</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">服務類型</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">問題詳情</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">期望諮詢時間</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">提交時間</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="isLoading" >
            <td colspan="8" class="px-6 py-10 text-center">
              <i class="fas fa-spinner fa-spin text-blue-500 text-2xl"></i>
              <p class="text-sm text-gray-500 mt-1">加載中...</p>
            </td>
          </tr>
          <tr v-else-if="filteredRequests.length === 0">
            <td colspan="8" class="px-6 py-10 text-center text-gray-500">暫無諮詢請求</td>
          </tr>
          <tr v-for="request in filteredRequests" :key="request.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ request.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div><i class="fas fa-phone mr-1"></i> {{ request.phone }}</div>
              <div v-if="request.lineId"><i class="fab fa-line mr-1"></i> {{ request.lineId }}</div>
              <div v-if="request.email"><i class="fas fa-envelope mr-1"></i> {{ request.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ getServiceText(request.service) }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
              {{ request.details }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ request.consultationTime || '未指定' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatTimestamp(request.createdAt) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(request.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ getStatusText(request.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button @click="viewRequestDetails(request)" class="text-blue-600 hover:text-blue-800">查看詳情</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 詳情彈窗 -->
    <div v-if="selectedRequest" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl mx-auto my-8 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">諮詢詳情 (ID: {{ selectedRequest.id }})</h2>
          <button @click="selectedRequest = null" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
          <div><strong>姓名:</strong> {{ selectedRequest.name }}</div>
          <div><strong>聯絡電話:</strong> {{ selectedRequest.phone }}</div>
          <div v-if="selectedRequest.lineId"><strong>Line ID:</strong> {{ selectedRequest.lineId }}</div>
          <div v-if="selectedRequest.email"><strong>電子郵箱:</strong> {{ selectedRequest.email }}</div>
          <div><strong>服務類型:</strong> {{ getServiceText(selectedRequest.service) }}</div>
          <div><strong>希望諮詢時間:</strong> {{ selectedRequest.consultationTime || '未指定' }}</div>
          <div>
            <strong>偏好聯絡方式:</strong> 
            <div class="mt-1">
              <span v-if="selectedRequest.preferredContact && selectedRequest.preferredContact.length > 0">
                <span v-for="method in selectedRequest.preferredContact" :key="method" class="inline-block mr-2">
                  <i :class="getContactIcon(method)" class="mr-1"></i>
                  {{ getContactMethodText(method) }}
                </span>
              </span>
              <span v-else class="text-gray-400">未指定</span>
            </div>
          </div>
          <div><strong>提交時間:</strong> {{ formatTimestamp(selectedRequest.createdAt) }}</div>
        </div>

        <div class="mb-4">
          <strong class="block text-sm mb-1">問題詳情:</strong>
          <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{{ selectedRequest.details }}</p>
        </div>
        
        <div class="mb-4">
          <label for="requestStatus" class="block text-sm font-medium text-gray-700 mb-1">更新狀態:</label>
          <select v-model="selectedRequest.status" id="requestStatus"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
            <option value="pending">待處理</option>
            <option value="processing">處理中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>

        <div class="mb-4">
          <label for="adminNotes" class="block text-sm font-medium text-gray-700 mb-1">處理備註:</label>
          <textarea id="adminNotes" v-model="adminNotes" rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="添加處理備註..."></textarea>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button @click="selectedRequest = null"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
            取消
          </button>
          <button @click="updateRequest"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm">
            <i class="fas fa-save mr-1"></i> 更新請求
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue';

// 模擬從 localStorage 或服務獲取數據
const getAllConsultationRequests = () => {
  try {
    console.log('正在讀取諮詢請求數據...');
    const requests = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
    console.log(`讀取到 ${requests.length} 條諮詢請求數據`);
    return requests.map(req => ({
      ...req,
      // 確保 adminNotes 字段存在
      adminNotes: req.adminNotes || '' 
    })).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('讀取諮詢請求數據時出錯:', error);
    return [];
  }
};

const saveConsultationRequest = (updatedRequest) => {
  let requests = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
  const index = requests.findIndex(r => r.id === updatedRequest.id);
  if (index !== -1) {
    requests[index] = updatedRequest;
    localStorage.setItem('consultationRequests', JSON.stringify(requests));
    return true;
  }
  return false;
};


const allRequests = ref([]);
const isLoading = ref(false);
const filters = reactive({
  query: '',
  status: '',
  date: '',
});
const selectedRequest = ref(null);
const adminNotes = ref(''); // 用於編輯時的備註
const refreshTimer = ref(null); // 用於自動刷新計時器

// 刷新數據函數
const refreshData = async () => {
  console.log('正在刷新諮詢請求數據...');
  isLoading.value = true;
  await new Promise(resolve => setTimeout(resolve, 300)); // 短暫延遲以顯示加載狀態
  allRequests.value = getAllConsultationRequests();
  isLoading.value = false;
  console.log('數據刷新完成');
};

// 手動刷新
const manualRefresh = async () => {
  console.log('手動刷新數據...');
  await refreshData();
};

onMounted(async () => {
  await refreshData();
  
  // 設置自動刷新計時器 (每5秒)
  refreshTimer.value = setInterval(() => {
    console.log('自動刷新數據...');
    refreshData();
  }, 5000);
});

// 清理計時器
onBeforeUnmount(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
    refreshTimer.value = null;
  }
});

const filteredRequests = computed(() => {
  return allRequests.value.filter(req => {
    const queryLower = filters.query.toLowerCase();
    const queryMatch = filters.query ? 
      (req.name?.toLowerCase().includes(queryLower) || 
       req.phone?.toLowerCase().includes(queryLower) ||
       req.email?.toLowerCase().includes(queryLower) ||
       req.lineId?.toLowerCase().includes(queryLower)) : true;
    const statusMatch = filters.status ? req.status === filters.status : true;
    const dateMatch = filters.date ? 
      new Date(req.createdAt).toDateString() === new Date(filters.date).toDateString() : true;
    return queryMatch && statusMatch && dateMatch;
  });
});

// 計算各種狀態的請求數量
const getPendingCount = computed(() => {
  return allRequests.value.filter(req => req.status === 'pending').length;
});

const getProcessingCount = computed(() => {
  return allRequests.value.filter(req => req.status === 'processing').length;
});

const getCompletedCount = computed(() => {
  return allRequests.value.filter(req => req.status === 'completed').length;
});

function applyFilters() {
  // 計算屬性會自動更新
}

function viewRequestDetails(request) {
  selectedRequest.value = JSON.parse(JSON.stringify(request)); // 深拷貝以避免直接修改列表中的數據
  adminNotes.value = selectedRequest.value.adminNotes || ''; // 加載備註
}

function updateRequest() {
  if (selectedRequest.value) {
    isLoading.value = true;
    // 更新備註到 selectedRequest
    selectedRequest.value.adminNotes = adminNotes.value;
    
    const success = saveConsultationRequest(selectedRequest.value);
    if (success) {
      // 更新列表中的數據
      const index = allRequests.value.findIndex(r => r.id === selectedRequest.value.id);
      if (index !== -1) {
        allRequests.value[index] = { ...selectedRequest.value };
      }
      alert('請求已更新！');
    } else {
      alert('更新失敗！');
    }
    selectedRequest.value = null; // 關閉彈窗
    adminNotes.value = ''; // 清空備註
    isLoading.value = false;
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString('zh-TW', { 
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit' 
  });
}

function getStatusText(status) {
  const map = {
    pending: '待處理',
    processing: '處理中',
    completed: '已完成',
    cancelled: '已取消',
  };
  return map[status] || status;
}

function getStatusClass(status) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'processing': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getServiceText(service) {
  const map = {
    'labor_contract': '勞動契約審核',
    'compensation': '薪資與加班費問題',
    'termination': '終止僱傭關係',
    'workplace_safety': '職場安全問題',
    'discrimination': '就業歧視問題',
    'other': '其他問題'
  };
  return map[service] || service;
}

function getContactIcon(method) {
  const icons = {
    'phone': 'fas fa-phone',
    'email': 'fas fa-envelope',
    'line': 'fab fa-line',
  };
  return icons[method] || 'fas fa-question';
}

function getContactMethodText(method) {
  const texts = {
    'phone': '電話',
    'email': '電子郵箱',
    'line': 'Line',
  };
  return texts[method] || method;
}
</script>

<style scoped>
/* 增加表格內容最大寬度，防止內容過長導致換行 */
.max-w-xs {
  max-width: 20rem; /* 320px */
}
.whitespace-pre-wrap {
  white-space: pre-wrap; /* 保留換行符 */
}
</style>
