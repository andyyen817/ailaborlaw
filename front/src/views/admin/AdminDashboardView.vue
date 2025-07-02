<template>
  <div class="p-0"> <!-- AdminLayout 已经有 p-6，所以这里设为 p-0 或根据需要调整 -->
    <!-- 统计卡片区域 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">
      <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-500 text-white mr-4">
            <!-- Heroicon - outline - users -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-600">总用户数</p>
            <p class="text-2xl font-semibold text-gray-800">{{ stats.totalUsers }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-500 text-white mr-4">
            <!-- Heroicon - outline - user-plus -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766Z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-600">今日新增</p>
            <p class="text-2xl font-semibold text-gray-800">{{ stats.newUsersToday }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-500 text-white mr-4">
            <!-- Heroicon - outline - user-group (for active users) -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-600">活跃用户</p>
            <p class="text-2xl font-semibold text-gray-800">{{ stats.activeUsers }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-500 text-white mr-4">
            <!-- Heroicon - outline - chat-bubble-left-ellipsis -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-3.861 8.25-8.625 8.25S3.75 16.556 3.75 12S7.611 3.75 12.375 3.75S21 7.444 21 12Z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-600">总咨询量 (AI)</p>
            <p class="text-2xl font-semibold text-gray-800">{{ stats.totalAIConsultations }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-red-500 text-white mr-4">
            <!-- Heroicon - outline - document-magnifying-glass -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5 4.5H6.375c-.621 0-1.125-.504-1.125-1.125v-6.75c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125v6.75e-3M6.375 17.25H12" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-600">待处理专家咨询</p>
            <p class="text-2xl font-semibold text-gray-800">{{ stats.pendingExpertConsultations }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 列表区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 最新注册用户 -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">最新注册用户</h3>
        <ul v-if="latestUsers.length > 0" class="divide-y divide-gray-200">
          <li v-for="user in latestUsers" :key="user.id" class="py-3 flex justify-between items-center">
            <div>
              <p class="text-sm font-medium text-gray-800">{{ user.name || user.email }}</p>
              <p class="text-xs text-gray-500">注册于: {{ formatDate(user.registrationDate) }}</p>
            </div>
            <span :class="['px-2 py-0.5 text-xs font-semibold rounded-full', userStatusClass(user.status)]">
              {{ userStatusText(user.status) }}
            </span>
          </li>
        </ul>
        <p v-else class="text-sm text-gray-500">暂无新用户数据。</p>
      </div>

      <!-- 最新咨询请求 (专家) -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">最新专家咨询请求</h3>
        <ul v-if="latestConsultations.length > 0" class="divide-y divide-gray-200">
          <li v-for="consultation in latestConsultations" :key="consultation.id" class="py-3">
            <div class="flex justify-between items-center mb-1">
              <p class="text-sm font-medium text-gray-800">{{ consultation.name }} <span class="text-xs text-gray-500">({{ consultation.contact }})</span></p>
              <span :class="['px-2 py-0.5 text-xs font-semibold rounded-full', expertConsultationStatusClass(consultation.status)]">
                {{ expertConsultationStatusText(consultation.status) }}
              </span>
            </div>
            <p class="text-xs text-gray-500 truncate" :title="consultation.issueSummary">
              问题: {{ consultation.issueSummary }}
            </p>
            <p class="text-xs text-gray-400 mt-1">提交于: {{ formatDate(consultation.submittedAt) }}</p>
          </li>
        </ul>
        <p v-else class="text-sm text-gray-500">暂无新的专家咨询请求。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { mockUserStore } from '@/store/mockUserStore';
import adminChatService from '@/services/adminChatService';
import expertConsultationService from '@/services/expertConsultationService';
import adminAuthService from '@/services/adminAuth';

const stats = reactive({
  totalUsers: 0,
  newUsersToday: 0,
  activeUsers: 0,
  totalAIConsultations: 0, // 需要从用户数据累计
  pendingExpertConsultations: 0,
});

const latestUsers = ref([]);
const latestConsultations = ref([]);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const userStatusText = (status) => {
  const map = { active: '活跃', pending: '待验证', disabled: '禁用' };
  return map[status] || status;
};

const userStatusClass = (status) => {
  const map = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    disabled: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};

const expertConsultationStatusText = (status) => {
  const map = { pending: '待处理', processing: '处理中', completed: '已解决', cancelled: '已取消' };
  return map[status] || status;
};

const expertConsultationStatusClass = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};

onMounted(async () => {
  try {
    // 使用真實的聊天統計API
    const today = new Date().toISOString().split('T')[0];
    const chatStats = await adminChatService.getChatStats({
      startDate: today,
      endDate: today
    });

    // 更新聊天相關統計數據
    if (chatStats.overview) {
      stats.totalAIConsultations = chatStats.overview.totalMessages || 0;
      stats.activeUsers = chatStats.overview.totalUsers || 0;
    }

    console.log('✅ 管理後台聊天統計數據加載成功:', chatStats);

  } catch (error) {
    console.error('❌ 加載聊天統計數據失敗:', error);
    // 如果API失敗，使用備用mock數據
  }

  // 加载用户数据和其他统计（保持現有邏輯）
  try {
    const { users: allUsers, total } = await mockUserStore.getUsers({ limit: 10000 });
    stats.totalUsers = total;

    const today = new Date().toISOString().split('T')[0];
    stats.newUsersToday = allUsers.filter(u => u.registrationDate === today).length;
    
    // 只有在API失敗時才使用mock數據更新activeUsers
    if (stats.activeUsers === 0) {
      stats.activeUsers = allUsers.filter(u => u.status === 'active').length;
    }

    latestUsers.value = [...allUsers]
      .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
      .slice(0, 5);

  } catch (error) {
    console.error('❌ 加載用戶數據失敗:', error);
  }

  // 🚀 使用真實API加载专家咨询数据
  try {
    console.log('🚀 正在從API加載專家諮詢統計數據...');
    
    const adminToken = adminAuthService.getAccessToken();
    if (!adminToken) {
      console.warn('⚠️ 未找到管理員token，请先登录管理后台');
      throw new Error('管理員認證失敗');
    }
    
    // 獲取專家諮詢統計數據
    const consultationsResponse = await expertConsultationService.getConsultationsWithFallback({
      isAdmin: true,
      adminToken: adminToken,
      page: 1,
      limit: 1000
    });
    
    if (consultationsResponse.success && consultationsResponse.data) {
      const allConsultations = consultationsResponse.data.consultations || [];
      console.log(`✅ 成功獲取 ${allConsultations.length} 條專家諮詢數據`);
      
      // 計算待處理數量
      stats.pendingExpertConsultations = allConsultations.filter(c => c.status === 'pending').length;
      
      // 準備最新諮詢列表（格式轉換）
      latestConsultations.value = allConsultations
        .sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt))
        .slice(0, 5)
        .map(consultation => ({
          id: consultation.id || consultation._id,
          name: consultation.name,
          contact: consultation.phone || consultation.email || consultation.line_id || consultation.lineId,
          issueSummary: consultation.details?.substring(0, 50) + (consultation.details?.length > 50 ? '...' : '') || '無詳情',
          status: consultation.status,
          submittedAt: consultation.created_at || consultation.createdAt
        }));
        
      console.log('✅ 專家諮詢統計數據處理完成');
      
    } else {
      throw new Error(consultationsResponse.message || 'API響應格式錯誤');
    }
      
  } catch (apiError) {
    console.error("❌ API加載專家諮詢數據失敗:", apiError);
    
    // 设置默认空值，不再使用localStorage降级
    latestConsultations.value = [];
    stats.pendingExpertConsultations = 0;
    
    console.warn('🔄 专家咨询数据加载失败，显示空数据。请确保已正确登录管理后台。');
  }
});

</script>

<style scoped>
/* Tailwind handles most styles */
</style>
