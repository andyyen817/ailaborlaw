<template>
  <div>
    <!-- 頁面標題 - 採用簡潔設計 -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-gray-800">邀請管理</h1>
        <p class="text-sm text-gray-600 mt-1">管理系統邀請記錄和統計數據</p>
      </div>
      <div class="flex gap-3">
        <button @click="refreshData" :disabled="loading" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50">
          <svg :class="['w-4 h-4', { 'animate-spin': loading }]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m-4.991 4.99a8.25 8.25 0 0 1-2.51 1.888M16.023 9.348a8.25 8.25 0 0 1 2.51-1.888" />
          </svg>
          刷新數據
        </button>
        <button @click="exportData" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          導出報告
        </button>
      </div>
    </div>

    <!-- 統計卡片區域 - 採用標準化設計 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-500 text-white mr-4">
            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-600">發出邀請總數</p>
            <p class="text-2xl font-semibold text-gray-800">{{ formatNumber(systemStats.totalInvitesSent) }}</p>
            <p class="text-xs text-green-600 mt-1">
              <svg class="w-3 h-3 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
              </svg>
              +{{ systemStats.dailyInvitesSent || 0 }} 今日新增
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-500 text-white mr-4">
            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-600">成功註冊數</p>
            <p class="text-2xl font-semibold text-gray-800">{{ formatNumber(systemStats.successfulRegistrations) }}</p>
            <p class="text-xs text-green-600 mt-1">
              <svg class="w-3 h-3 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
              </svg>
              +{{ systemStats.dailySuccessfulInvites || 0 }} 今日新增
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-500 text-white mr-4">
            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 15.75V18a2.25 2.25 0 0 1-2.25 2.25h-7.5A2.25 2.25 0 0 1 3.75 18v-7.5A2.25 2.25 0 0 1 6 8.25h7.5a2.25 2.25 0 0 1 2.25 2.25V15.75ZM4.5 12H9l3-3 4.5 4.5" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-600">轉化率</p>
            <p class="text-2xl font-semibold text-gray-800">{{ systemStats.conversionRate }}%</p>
            <p class="text-xs text-gray-500 mt-1">
              <svg class="w-3 h-3 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
              </svg>
              較昨日持平
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-500 text-white mr-4">
            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-600">已發放獎勵次數</p>
            <p class="text-2xl font-semibold text-gray-800">{{ formatNumber(systemStats.totalBonusAwarded) }}</p>
            <p class="text-xs text-green-600 mt-1">
              <svg class="w-3 h-3 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
              </svg>
              +{{ systemStats.dailyBonusAwarded || 0 }} 今日發放
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 錯誤提示區域 -->
    <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <div class="flex-1">
          <h3 class="text-sm font-medium text-red-800">數據加載錯誤</h3>
          <p class="text-sm text-red-700 mt-1">{{ errorMessage }}</p>
        </div>
        <button @click="refreshData" class="text-red-600 hover:text-red-800 text-sm font-medium">
          重新加載
        </button>
      </div>
    </div>

    <!-- 篩選和搜索區域 -->
    <div class="bg-white rounded-lg shadow mb-6">
      <div class="p-4 flex flex-wrap gap-4 items-center justify-between">
        <!-- 搜索框 -->
        <div class="flex-grow sm:flex-grow-0 sm:w-64">
          <label class="block text-sm font-medium text-gray-700 mb-1">搜索邀請人</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              v-model="filters.inviterQuery"
              type="text"
              placeholder="用戶名、郵箱或ID"
              class="border border-gray-300 rounded-md py-2 px-3 pl-10 w-full focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
        </div>

        <div class="flex flex-wrap gap-4 items-end">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">搜索被邀請人</label>
            <input
              v-model="filters.inviteeQuery"
              type="text"
              placeholder="用戶名、郵箱或ID"
              class="border border-gray-300 rounded-md py-2 px-3 w-40 focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">時間範圍</label>
            <select v-model="filters.timeRange" class="border border-gray-300 rounded-md py-2 px-3 w-40 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">全部時間</option>
              <option value="today">今天</option>
              <option value="week">最近一週</option>
              <option value="month">最近一個月</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">狀態篩選</label>
            <select v-model="filters.status" class="border border-gray-300 rounded-md py-2 px-3 w-40 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">全部狀態</option>
              <option value="success">已成功註冊</option>
              <option value="pending">等待註冊</option>
              <option value="rewarded">已發放獎勵</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 邀請記錄列表 -->
    <div class="bg-white rounded-lg shadow overflow-x-auto mb-6">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邀請人</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">被邀請人</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">使用的邀請碼</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">被邀請人註冊時間</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">獎勵狀態</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="5" class="px-6 py-10 text-center">
              <svg class="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-sm text-gray-500 mt-2">加載中...</p>
            </td>
          </tr>
          <tr v-else-if="filteredInviteRecords.length === 0">
            <td colspan="5" class="px-6 py-10 text-center text-gray-500">暫無邀請記錄</td>
          </tr>
          <tr v-for="record in filteredInviteRecords" :key="record.inviteeId + '-' + record.inviterId" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ record.inviterName || record.inviterId }}
              <div class="text-xs text-gray-500">{{ record.inviterEmail }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ record.inviteeName || record.inviteeId }}
              <div class="text-xs text-gray-500">{{ record.inviteeEmail }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{{ record.inviteCodeUsed }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatTimestamp(record.inviteeRegistrationDate) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="record.rewardApplied ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'" 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ record.rewardApplied ? '獎勵已發放' : '待處理/未發放' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 用戶邀請統計查詢區域 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
        用戶邀請統計
      </h3>
      
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">查詢用戶</label>
          <input 
            type="text" 
            v-model="statsUserIdQuery" 
            placeholder="輸入用戶ID或郵箱查詢統計" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
        <button 
          @click="fetchUserInviteStats" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center gap-2 whitespace-nowrap"
        >
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          查詢統計
        </button>
      </div>
      
      <!-- 統計結果顯示 -->
      <div v-if="userInviteStats" class="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 class="font-medium text-gray-800 mb-3">統計結果</h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <span class="text-gray-600">用戶:</span>
            <span class="font-medium text-gray-800">{{ userInviteStats.userName || userInviteStats.userId }}</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766Z" />
            </svg>
            <span class="text-gray-600">已成功邀請:</span>
            <span class="font-medium text-green-600">{{ userInviteStats.invitedCount }} 人</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
            <span class="text-gray-600">總獎勵次數:</span>
            <span class="font-medium text-purple-600">{{ userInviteStats.totalBonusAwarded }} 次</span>
          </div>
        </div>
      </div>
      
      <!-- 錯誤信息顯示 -->
      <div v-if="statsError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <span class="text-sm text-red-600">{{ statsError }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import inviteService from '@/services/inviteService';
import userService from '@/services/userService';

// 🔧 P3 更新：响应式数据
const loading = ref(false);
const allInviteRecords = ref([]);

// 統計功能相關響應式變量
const statsUserIdQuery = ref('');
const userInviteStats = ref(null);
const statsError = ref('');

// 數字格式化函數
const formatNumber = (num) => {
  if (num == null) return '0';
  return Number(num).toLocaleString('zh-TW');
};

// 獲取所有邀請記錄 - 集成真實API
const getAllInviteRecordsFromStorage = async () => {
  try {
    console.log('開始獲取管理後台邀請記錄...');
    
    // 調用管理後台API獲取邀請記錄
    const response = await inviteService.getAllInviteRecords();
    
    if (response.success && response.data) {
      // 支持多種數據格式
      const records = response.data.records || response.data.invites || response.data || [];
      console.log('獲取邀請記錄成功:', records.length, '條記錄');
      
      // 轉換數據格式以匹配現有模板
      return records.map(record => ({
        id: record.id || record._id || `${record.inviterId || record.inviter?._id}-${record.inviteeId || record.invitee?._id}`,
        inviterUserId: record.inviterId || record.inviter?._id || record.inviter?.id,
        inviterName: record.inviterName || record.inviter?.name || record.inviter?.username || '未知',
        inviterEmail: record.inviterEmail || record.inviter?.email,
        inviteeUserId: record.inviteeId || record.invitee?._id || record.invitee?.id,
        inviteeName: record.inviteeName || record.invitee?.name || record.invitee?.username || '未知',
        inviteeEmail: record.inviteeEmail || record.invitee?.email,
        inviteCodeUsed: record.inviteCode || record.code,
        inviteDate: record.invitedAt || record.createdAt || record.inviteDate,
        // 🔧 修復：支持後端返回的 completedAt 字段作為註冊時間
        inviteeRegistrationDate: record.completedAt || record.registeredAt || record.invitee?.registeredAt || record.invitee?.createdAt,
        // 🔧 修復：支持完成狀態的正確判斷
        status: (record.completedAt || record.registeredAt || record.invitee?.registeredAt) ? '已註冊' : '待註冊',
        // 🔧 修復：支持後端返回的 bonusGiven 字段作為獎勵狀態
        rewardApplied: record.bonusGiven || record.bonusAwarded || record.rewardGiven || false
      }));
    } else {
      console.warn('API返回數據格式異常，降級到mock數據');
      throw new Error('API返回數據格式異常');
    }
    
  } catch (error) {
    console.error('獲取邀請記錄失敗:', error);
    
    // 顯示用戶友好的錯誤信息
    if (error.response?.status === 401) {
      throw new Error('登錄已過期，請重新登錄');
    } else if (error.response?.status === 403) {
      throw new Error('權限不足，無法訪問邀請記錄');
    } else if (error.response?.status === 500) {
      throw new Error('服務器錯誤，請稍後重試');
    } else {
      throw new Error('獲取邀請記錄失敗，請檢查網絡連接');
    }
  }
};

// 錯誤信息狀態
const errorMessage = ref('');

// 刷新數據函數 - 集成真實API
const refreshData = async () => {
  loading.value = true;
  errorMessage.value = '';
  
  try {
    console.log('開始刷新管理後台數據...');
    
    // 並行獲取邀請記錄和系統統計
    const [recordsResult, statsResult] = await Promise.all([
      getAllInviteRecordsFromStorage(),
      getSystemStats()
    ]);
    
    // 更新邀請記錄
    allInviteRecords.value = recordsResult;
    allInviteRecords.value.sort((a,b) => new Date(b.inviteeRegistrationDate || 0) - new Date(a.inviteeRegistrationDate || 0));
    
    // 更新系統統計
    systemStats.value = statsResult;
    
    console.log('管理後台數據刷新成功');
    
  } catch (error) {
    console.error('刷新數據失敗:', error);
    errorMessage.value = error.message || '數據加載失敗，請稍後重試';
    
    // 如果是權限問題，清空數據
    if (error.message?.includes('權限') || error.message?.includes('登錄')) {
      allInviteRecords.value = [];
      systemStats.value = {
        totalInvitesSent: 0,
        successfulRegistrations: 0,
        pendingInvites: 0,
        conversionRate: 0,
        totalBonusAwarded: 0,
        dailyInvitesSent: 0,
        dailySuccessfulInvites: 0,
        dailyBonusAwarded: 0
      };
    }
  } finally {
    loading.value = false;
  }
};

// 獲取系統統計數據 - 集成真實API
const getSystemStats = async () => {
  try {
    console.log('開始獲取系統統計數據...');
    
    // 調用管理後台統計API
    const response = await inviteService.getSystemStats();
    
    if (response.success && response.data) {
      const stats = response.data;
      console.log('獲取系統統計成功:', stats);
      
      // 支持多種統計數據格式
      return {
        totalInvitesSent: stats.totalInvitesSent || stats.totalInvites || stats.invitesSent || 0,
        successfulRegistrations: stats.successfulRegistrations || stats.totalRegistrations || stats.registrations || 0,
        pendingInvites: stats.pendingInvites || stats.pendingRegistrations || 0,
        conversionRate: stats.conversionRate || (stats.totalInvites > 0 ? ((stats.successfulRegistrations || 0) / stats.totalInvites * 100).toFixed(1) : 0),
        totalBonusAwarded: stats.totalBonusAwarded || stats.bonusAwarded || stats.totalBonus || 0,
        dailyInvitesSent: stats.dailyStats?.invitesSent || stats.today?.invitesSent || stats.dailyInvites || 0,
        dailySuccessfulInvites: stats.dailyStats?.successfulRegistrations || stats.today?.registrations || stats.dailyRegistrations || 0,
        dailyBonusAwarded: stats.dailyStats?.bonusAwarded || stats.today?.bonusAwarded || stats.dailyBonus || 0
      };
    } else {
      console.warn('統計API返回數據格式異常，使用記錄計算');
      throw new Error('統計API返回數據格式異常');
    }
    
  } catch (error) {
    console.error('獲取系統統計失敗:', error);
    
    // 如果有邀請記錄數據，嘗試本地計算統計
    if (allInviteRecords.value.length > 0) {
      const totalSent = allInviteRecords.value.length;
      const successfulRegistrations = allInviteRecords.value.filter(record => record.status === '已註冊').length;
      const pendingInvites = allInviteRecords.value.filter(record => record.status === '待註冊').length;
      
      return {
        totalInvitesSent: totalSent,
        successfulRegistrations: successfulRegistrations,
        pendingInvites: pendingInvites,
        conversionRate: totalSent > 0 ? (successfulRegistrations / totalSent * 100).toFixed(1) : 0,
        totalBonusAwarded: allInviteRecords.value.filter(r => r.rewardApplied === true).length * 10,
        dailyInvitesSent: 0,
        dailySuccessfulInvites: 0,
        dailyBonusAwarded: 0
      };
    }
    
    // 拋出錯誤讓上層處理
    throw error;
  }
};

// 導出數據功能
const exportData = () => {
  try {
    // 準備要導出的數據
    const exportRecords = allInviteRecords.value.map(record => ({
      '邀請者ID': record.inviterUserId,
      '邀請者姓名': record.inviterName,
      '被邀請者姓名': record.inviteeName,
      '被邀請者信箱': record.inviteeEmail,
      '邀請日期': new Date(record.inviteDate).toLocaleDateString('zh-TW'),
      '註冊日期': record.inviteeRegistrationDate ? new Date(record.inviteeRegistrationDate).toLocaleDateString('zh-TW') : '未註冊',
      '狀態': record.status
    }));
    
    // 轉換為CSV格式
    const headers = Object.keys(exportRecords[0] || {});
    const csvContent = [
      headers.join(','),
      ...exportRecords.map(record => 
        headers.map(header => `"${record[header] || ''}"`).join(',')
      )
    ].join('\n');
    
    // 創建下載連結
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `邀請管理報告_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('導出數據失敗:', error);
    alert('導出失敗，請稍後再試');
  }
};
const systemStats = ref({
  totalInvitesSent: 0,
  totalSuccessfulInvites: 0,
  conversionRate: 0,
  totalBonusAwarded: 0,
  dailyInvitesSent: 0,
  dailySuccessfulInvites: 0,
  dailyBonusAwarded: 0
});

const filters = reactive({
  inviterQuery: '',
  inviteeQuery: '',
  timeRange: 'all',
  status: 'all'
});

const selectedRecords = ref([]);
const showBatchModal = ref(false);
const showSettingsModal = ref(false);
const inviteSettings = ref({
  bonusPerInvite: 10,
  maxInvitesPerUser: 100,
  enableInviteSystem: true,
  requireVerification: false
});


// 頁面初始化 - 集成真實API
onMounted(async () => {
  console.log('管理後台邀請管理頁面初始化...');
  
  // 直接調用refreshData，它已經集成了真實API
  await refreshData();
  
  console.log('管理後台邀請管理頁面初始化完成');
});

const filteredInviteRecords = computed(() => {
  return allInviteRecords.value.filter(record => {
    const inviterQueryLower = filters.inviterQuery.toLowerCase();
    const inviteeQueryLower = filters.inviteeQuery.toLowerCase();

    const inviterMatch = filters.inviterQuery ?
      (record.inviterId?.toLowerCase().includes(inviterQueryLower) ||
       record.inviterName?.toLowerCase().includes(inviterQueryLower) ||
       record.inviterEmail?.toLowerCase().includes(inviterQueryLower)) : true;

    const inviteeMatch = filters.inviteeQuery ?
      (record.inviteeId?.toLowerCase().includes(inviteeQueryLower) ||
       record.inviteeName?.toLowerCase().includes(inviteeQueryLower) ||
       record.inviteeEmail?.toLowerCase().includes(inviteeQueryLower)) : true;
      
    return inviterMatch && inviteeMatch;
  });
});

const totalSuccessfulInvites = computed(() => {
  // 假設只要有記錄就是成功邀請（被邀請者已註冊）
  return allInviteRecords.value.length;
});

const totalBonusAwarded = computed(() => {
  // 每次成功邀請獎勵固定次數，例如10次
  // 並且 rewardApplied 為 true 才算
  const bonusAmount = 10; // 固定獎勵次數
  return allInviteRecords.value.filter(r => r.rewardApplied === true).length * bonusAmount;
});


// 查詢用戶邀請統計 - 集成真實API
async function fetchUserInviteStats() {
  if (!statsUserIdQuery.value.trim()) {
    statsError.value = '請輸入用戶ID或郵箱進行查詢。';
    userInviteStats.value = null;
    return;
  }
  
  statsError.value = '';
  userInviteStats.value = null;
  
  try {
    console.log('開始查詢用戶邀請統計:', statsUserIdQuery.value);
    
    // 調用管理後台API查詢用戶邀請統計
    const response = await inviteService.getUserInviteStats(statsUserIdQuery.value.trim());
    
    if (response.success && response.data) {
      const stats = response.data;
      userInviteStats.value = {
        userId: stats.userId,
        userName: stats.userName || '未知用戶',
        userEmail: stats.userEmail,
        invitedCount: stats.totalInvited || 0,
        totalBonusAwarded: stats.totalBonusEarned || 0,
        inviteCode: stats.inviteCode,
        registrationDate: stats.registrationDate
      };
      console.log('用戶邀請統計查詢成功:', userInviteStats.value);
    } else {
      statsError.value = response.message || '未找到該用戶。';
      console.warn('用戶統計API返回失敗:', response);
    }
    
  } catch (error) {
    console.error('查詢用戶邀請統計失敗:', error);
    
    // 根據錯誤類型顯示不同的錯誤信息
    if (error.response?.status === 404) {
      statsError.value = '未找到該用戶，請檢查用戶ID或郵箱是否正確。';
    } else if (error.response?.status === 401) {
      statsError.value = '登錄已過期，請重新登錄後再試。';
    } else if (error.response?.status === 403) {
      statsError.value = '權限不足，無法查詢用戶統計信息。';
    } else {
      statsError.value = '查詢失敗，請稍後再試。';
    }
  }
}


function applyFilters() {
  // 計算屬性會自動更新
}

function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString('zh-TW', { 
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit' 
  });
}




</script>

<style scoped>
/* 所有樣式已使用 Tailwind CSS 實現，無需自定義樣式 */
</style>
