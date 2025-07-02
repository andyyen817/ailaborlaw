<template>
  <div class="query-records-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="container mx-auto px-4 py-6">
        <!-- 返回按钮 -->
        <div class="flex items-center mb-4">
          <router-link :to="profileRoute" class="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            <span>返回个人资料</span>
          </router-link>
        </div>

        <h1 class="text-2xl font-bold text-gray-800">咨询记录</h1>
        <p class="text-gray-600 mt-2">查看您的咨询历史和使用统计</p>
      </div>
    </div>

    <div class="container mx-auto px-4 py-6">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="stat-card bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div class="stat-icon text-blue-600 mb-3">
            <i class="fas fa-comments text-2xl"></i>
          </div>
          <div class="stat-value text-3xl font-bold text-blue-600">{{ totalQueries }}</div>
          <div class="stat-label text-blue-700">总咨询次数</div>
        </div>

        <div class="stat-card bg-green-50 border border-green-200 rounded-lg p-6">
          <div class="stat-icon text-green-600 mb-3">
            <i class="fas fa-clock text-2xl"></i>
          </div>
          <div class="stat-value text-3xl font-bold text-green-600">{{ todayQueries }}</div>
          <div class="stat-label text-green-700">今日咨询</div>
        </div>

        <div class="stat-card bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div class="stat-icon text-yellow-600 mb-3">
            <i class="fas fa-battery-half text-2xl"></i>
          </div>
          <div class="stat-value text-3xl font-bold text-yellow-600">{{ remainingQueries }}</div>
          <div class="stat-label text-yellow-700">剩余次数</div>
        </div>

        <div class="stat-card bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div class="stat-icon text-purple-600 mb-3">
            <i class="fas fa-chart-line text-2xl"></i>
          </div>
          <div class="stat-value text-3xl font-bold text-purple-600">{{ averageDaily }}</div>
          <div class="stat-label text-purple-700">日均咨询</div>
        </div>
      </div>

      <!-- 筛选和搜索 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">搜索</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索咨询内容..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">时间范围</label>
            <select v-model="timeRange" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">全部时间</option>
              <option value="today">今天</option>
              <option value="week">最近一周</option>
              <option value="month">最近一个月</option>
              <option value="quarter">最近三个月</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">状态</label>
            <select v-model="statusFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">全部状态</option>
              <option value="completed">已完成</option>
              <option value="pending">处理中</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 咨询记录列表 -->
      <div class="bg-white rounded-lg shadow-md">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-800">咨询记录</h2>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">加载中...</p>
        </div>

        <!-- 记录列表 -->
        <div v-else-if="filteredRecords.length > 0" class="divide-y divide-gray-200">
          <div
            v-for="record in paginatedRecords"
            :key="record.id"
            class="p-6 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="text-lg font-medium text-gray-900 mb-2">{{ record.question }}</h3>
                <div class="flex items-center text-sm text-gray-500 space-x-4">
                  <span class="flex items-center">
                    <i class="fas fa-calendar-alt mr-1"></i>
                    {{ formatDate(record.createdAt) }}
                  </span>
                  <span class="flex items-center">
                    <i class="fas fa-clock mr-1"></i>
                    {{ formatTime(record.createdAt) }}
                  </span>
                  <span :class="getStatusClass(record.status)">
                    {{ getStatusText(record.status) }}
                  </span>
                </div>
              </div>
              <button
                @click="toggleRecord(record.id)"
                class="text-blue-600 hover:text-blue-800 ml-4"
              >
                <i :class="['fas', expandedRecords.includes(record.id) ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
              </button>
            </div>

            <!-- 展开的详情 -->
            <div v-if="expandedRecords.includes(record.id)" class="mt-4 p-4 bg-gray-50 rounded-lg">
              <div class="mb-4">
                <h4 class="font-medium text-gray-900 mb-2">AI回复：</h4>
                <div class="text-gray-700 prose prose-sm max-w-none" v-html="formatAIResponse(record.response)"></div>
              </div>
              
              <div v-if="record.references && record.references.length > 0" class="mb-4">
                <h4 class="font-medium text-gray-900 mb-2">相关法规：</h4>
                <div class="space-y-2">
                  <div
                    v-for="ref in record.references"
                    :key="ref.id"
                    class="text-sm text-blue-600 hover:text-blue-800"
                  >
                    <a :href="ref.url" target="_blank" class="flex items-center">
                      <i class="fas fa-external-link-alt mr-1"></i>
                      {{ ref.title }}
                    </a>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between text-sm text-gray-500">
                <span>消耗咨询次数: 1次</span>
                <span>记录ID: {{ record.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="p-12 text-center">
          <div class="text-gray-400 mb-4">
            <i class="fas fa-inbox text-6xl"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">暂无咨询记录</h3>
          <p class="text-gray-600 mb-6">您还没有进行过任何咨询</p>
          <router-link
            :to="chatRoute"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <i class="fas fa-comments mr-2"></i>
            开始咨询
          </router-link>
        </div>

        <!-- 分页 -->
        <div v-if="filteredRecords.length > pageSize" class="p-6 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              显示 {{ ((currentPage - 1) * pageSize) + 1 }} 到 {{ Math.min(currentPage * pageSize, filteredRecords.length) }} 条，
              共 {{ filteredRecords.length }} 条记录
            </div>
            <div class="flex space-x-2">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                上一页
              </button>
              <button
                @click="currentPage++"
                :disabled="currentPage >= totalPages"
                class="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import userService from '@/services/userService';
import authService from '@/services/auth';

const router = useRouter();

// 响应式数据
const loading = ref(true);
const records = ref([]);
const searchQuery = ref('');
const timeRange = ref('all');
const statusFilter = ref('all');
const expandedRecords = ref([]);
const currentPage = ref(1);
const pageSize = 10;

// 统计数据
const totalQueries = ref(0);
const todayQueries = ref(0);
const remainingQueries = ref(0);

// 计算属性
const profileRoute = computed(() => {
  const userId = localStorage.getItem('auth_user_id') || '';
  return userId ? `/user/${userId}/profile` : '/profile';
});

const chatRoute = computed(() => {
  const userId = localStorage.getItem('auth_user_id') || '';
  return userId ? `/user/${userId}/chat` : '/chat';
});

const averageDaily = computed(() => {
  if (records.value.length === 0) return '0';
  const days = Math.max(1, Math.ceil((Date.now() - new Date(records.value[records.value.length - 1]?.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
  return Math.round(records.value.length / days);
});

const filteredRecords = computed(() => {
  let filtered = [...records.value];

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(record => 
      record.question.toLowerCase().includes(query) ||
      record.response.toLowerCase().includes(query)
    );
  }

  // 时间范围过滤
  if (timeRange.value !== 'all') {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange.value) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
    }
    
    filtered = filtered.filter(record => new Date(record.createdAt) >= startDate);
  }

  // 状态过滤
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(record => record.status === statusFilter.value);
  }

  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredRecords.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredRecords.value.length / pageSize);
});

// 方法
async function loadQueryRecords() {
  try {
    loading.value = true;
    
    // 获取咨询记录
    const recordsResponse = await userService.getMyQueryRecords();
    if (recordsResponse.success && recordsResponse.data) {
      records.value = recordsResponse.data.records || [];
      totalQueries.value = recordsResponse.data.total || records.value.length;
    }
    
    // 获取今日使用次数
    const todayResponse = await userService.getTodayUsageCount();
    if (todayResponse.success && todayResponse.data) {
      todayQueries.value = todayResponse.data.todayCount || 0;
    }
    
    // 获取剩余次数
    const statusResponse = await userService.getMyQueryStatus();
    if (statusResponse.success && statusResponse.data) {
      remainingQueries.value = statusResponse.data.remainingQueries || 0;
    }
    
  } catch (error) {
    console.error('加载咨询记录失败:', error);
    // 降级到本地数据
    records.value = [];
  } finally {
    loading.value = false;
  }
}

function toggleRecord(recordId) {
  const index = expandedRecords.value.indexOf(recordId);
  if (index > -1) {
    expandedRecords.value.splice(index, 1);
  } else {
    expandedRecords.value.push(recordId);
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatAIResponse(response) {
  // 简单的文本格式化，将换行转换为HTML
  return response.replace(/\n/g, '<br>');
}

function getStatusClass(status) {
  const classes = {
    completed: 'px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full',
    pending: 'px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full',
    failed: 'px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full'
  };
  return classes[status] || classes.completed;
}

function getStatusText(status) {
  const texts = {
    completed: '已完成',
    pending: '处理中',
    failed: '失败'
  };
  return texts[status] || '已完成';
}

// 初始化
onMounted(() => {
  loadQueryRecords();
});
</script>

<style scoped>
.query-records-container {
  min-height: 100vh;
  background-color: #f9fafb;
}

.page-header {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
}

.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-value {
  margin: 8px 0 4px 0;
}

.stat-label {
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .container {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .grid-cols-1 {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 