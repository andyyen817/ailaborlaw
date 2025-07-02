<template>
  <div v-if="isVisible" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
    <div class="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg leading-6 font-medium text-gray-900">用户详情</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <span class="sr-only">关闭</span>
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div v-if="userToView" class="px-7 py-3 text-sm">
          <!-- 加載指示器 -->
          <div v-if="userToView.isLoading" class="flex justify-center items-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="ml-3 text-gray-600">正在獲取最新用戶資料...</span>
          </div>
          
          <!-- 錯誤提示 -->
          <div v-else-if="userToView.error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-red-600"><i class="fas fa-exclamation-circle mr-2"></i>{{ userToView.error }}</p>
            <p class="text-gray-600 mt-1 text-xs">顯示可能不是最新的資料</p>
          </div>
          
          <!-- 用戶資料顯示 -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p class="font-medium text-gray-700">姓名:</p>
              <p class="text-gray-900">{{ userToView.name || 'N/A' }}</p>
            </div>
            <div>
              <p class="font-medium text-gray-700">邮箱:</p>
              <p class="text-gray-900">{{ userToView.email }}</p>
            </div>
            <div>
              <p class="font-medium text-gray-700">用户ID:</p>
              <p class="text-gray-900">{{ userToView.id }}</p>
            </div>
            <div>
              <p class="font-medium text-gray-700">用户类型:</p>
              <p class="text-gray-900">{{ formatUserType(userToView.userType) }}</p>
            </div>
            <div>
              <p class="font-medium text-gray-700">行业:</p>
              <p class="text-gray-900">{{ formatIndustry(userToView.industry) || 'N/A' }}</p>
            </div>
            <div>
              <p class="font-medium text-gray-700">职位:</p>
              <p class="text-gray-900">{{ formatOccupation(userToView.occupation) || 'N/A' }}</p>
            </div>
            <div>
              <p class="font-medium text-gray-700">公司名称:</p>
              <p class="text-gray-900">{{ userToView.companyName || 'N/A' }}</p>
            </div>
            <div>
              <p class="font-medium text-gray-700">手机号码:</p>
              <p class="text-gray-900">{{ userToView.phoneNumber || 'N/A' }}</p>
            </div>
            <div>
              <p class="font-medium text-gray-700">注册日期:</p>
              <p class="text-gray-900">{{ userToView.registrationDate }}</p>
            </div>
             <div>
              <p class="font-medium text-gray-700">账户状态:</p>
              <p>
                <span :class="getStatusClass(userToView.status)">
                  {{ formatStatus(userToView.status) }}
                </span>
              </p>
            </div>
            <div>
              <p class="font-medium text-gray-700">剩余咨询次数:</p>
              <p class="text-gray-900">{{ userToView.remainingQueries }}</p>
            </div>
            <div>
              <p class="font-medium text-gray-700">累计咨询次数:</p>
              <p class="text-gray-900">{{ userToView.totalConsultations }}</p>
            </div>
            <div class="md:col-span-2">
              <p class="font-medium text-gray-700">最后登录时间:</p>
              <p class="text-gray-900">{{ userToView.lastLogin || 'N/A' }}</p>
            </div>
            <!-- 可以根据需要添加更多字段 -->
          </div>
        </div>
        <div v-else class="px-7 py-3 text-sm text-gray-500">
          无法加载用户信息。
        </div>

        <div class="items-center py-3 px-7 flex justify-end">
          <button @click="closeModal"
                  class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  userToView: {
    type: Object,
    default: () => null
  }
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

// Helper functions for formatting (can be moved to a utils file if used elsewhere)
const formatUserType = (type) => {
  const types = {
    admin: '管理员',
    hr: 'HR人员',
    employer: '雇主',
    employee: '员工',
  };
  return types[type] || type || '未知';
};

const formatIndustry = (industry) => {
  const industries = {
    tech: '科技/IT',
    manufacturing: '製造業',
    retail: '零售/貿易',
    finance: '金融/保險',
    education: '教育/培訓',
    healthcare: '醫療/健康',
    service: '服務業',
    others: '其他'
  };
  return industries[industry] || industry || '未知';
};

const formatOccupation = (occupation) => {
  const occupations = {
    employee: '一般員工',
    manager: '管理者',
    hr: '人力資源',
    boss: '企業主/雇主',
    others: '其他'
  };
  return occupations[occupation] || occupation || '未知';
};

const formatStatus = (status) => {
  const statuses = {
    active: '活跃',
    pending: '待验证',
    disabled: '已禁用',
  };
  return statuses[status] || status || '未知';
};

const getStatusClass = (status) => {
  const baseClass = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
  const statusClasses = {
    active: `${baseClass} bg-green-100 text-green-800`,
    pending: `${baseClass} bg-yellow-100 text-yellow-800`,
    disabled: `${baseClass} bg-red-100 text-red-800`,
  };
  return statusClasses[status] || `${baseClass} bg-gray-100 text-gray-800`;
};
</script>

<style scoped>
/* 样式可以根据需要调整 */
</style>
