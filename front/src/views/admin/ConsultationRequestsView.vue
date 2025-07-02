<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">專人諮詢申請管理</h1>
      <div class="flex space-x-3">
        <button @click="manualRefresh" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors shadow-sm flex items-center">
          <i class="fas fa-sync-alt mr-2"></i> 刷新數據
        </button>
        <a href="/test-consultation.html" target="_blank" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors shadow-sm flex items-center">
          <i class="fas fa-tools mr-2"></i> 專家諮詢測試工具
        </a>
      </div>
    </div>
    
    <!-- 搜索和筛选 -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="form-group">
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">搜索</label>
          <input
            v-model="filters.search"
            type="text"
            id="search"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="搜索姓名、电话..."
          />
        </div>
        
        <div class="form-group">
          <label for="status" class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <select
            v-model="filters.status"
            id="status"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">全部状态</option>
            <option value="pending">待处理</option>
            <option value="processing">处理中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="service" class="block text-sm font-medium text-gray-700 mb-1">服务类型</label>
          <select
            v-model="filters.service"
            id="service"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">全部类型</option>
            <option value="labor_contract">劳动契约审核</option>
            <option value="compensation">薪资与加班费问题</option>
            <option value="termination">终止雇佣关系</option>
            <option value="workplace_safety">职场安全问题</option>
            <option value="discrimination">就业歧视问题</option>
            <option value="other">其他问题</option>
          </select>
        </div>
        
        <!-- 新增地區筛选 -->
        <div class="form-group">
          <label for="regionFilter" class="block text-sm font-medium text-gray-700 mb-1">地區</label>
          <select 
            v-model="filters.region" 
            id="regionFilter" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">全部地區</option>
            <option value="台北市">台北市</option>
            <option value="新北市">新北市</option>
            <option value="桃園市">桃園市</option>
            <option value="台中市">台中市</option>
            <option value="台南市">台南市</option>
            <option value="高雄市">高雄市</option>
            <option value="基隆市">基隆市</option>
            <option value="新竹市">新竹市</option>
            <option value="新竹縣">新竹縣</option>
            <option value="苗栗縣">苗栗縣</option>
            <option value="彰化縣">彰化縣</option>
            <option value="南投縣">南投縣</option>
            <option value="雲林縣">雲林縣</option>
            <option value="嘉義市">嘉義市</option>
            <option value="嘉義縣">嘉義縣</option>
            <option value="屏東縣">屏東縣</option>
            <option value="宜蘭縣">宜蘭縣</option>
            <option value="花蓮縣">花蓮縣</option>
            <option value="台東縣">台東縣</option>
            <option value="澎湖縣">澎湖縣</option>
            <option value="金門縣">金門縣</option>
            <option value="連江縣">連江縣</option>
          </select>
        </div>
        
        <div class="form-group flex items-end">
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
    
    <!-- 咨询申请表格 -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                申請人
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                地區
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                服務類型
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                聯絡方式
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                問題詳情
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                提交時間
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="isLoading">
              <td colspan="8" class="px-6 py-10 text-center">
                <i class="fas fa-spinner fa-spin text-blue-500 text-2xl"></i>
                <p class="text-sm text-gray-500 mt-1">加载中...</p>
              </td>
            </tr>
            <tr v-else-if="filteredRequests.length === 0">
              <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                <i class="fas fa-inbox text-2xl mb-2"></i>
                <p>暫無諮詢申請</p>
              </td>
            </tr>
            
            <tr v-for="request in filteredRequests" :key="request.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ request.name }}</div>
                <div class="text-xs text-gray-500">ID: {{ request.userId }}</div>
              </td>
              
              <!-- 新增地區顯示列 -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ request.region || '未填寫' }}</div>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ getServiceName(request.service) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ request.phone }}</div>
                <div v-if="request.lineId" class="text-sm text-gray-500"><i class="fab fa-line mr-1"></i> {{ request.lineId }}</div>
                <div v-if="request.email" class="text-sm text-gray-500"><i class="fas fa-envelope mr-1"></i> {{ request.email }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {{ request.details }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(request.createdAt) }}</div>
                <div class="text-xs text-gray-500">{{ formatTime(request.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getStatusClass(request.status)">
                  {{ getStatusName(request.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <button 
                  @click="viewRequestDetails(request.id)" 
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button 
                  @click="updateRequestStatus(request.id, getNextStatus(request.status))" 
                  class="text-green-600 hover:text-green-900 mr-3"
                >
                  <i class="fas fa-check-circle"></i>
                </button>
                <button 
                  @click="deleteRequest(request.id)" 
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
              显示 <span class="font-medium">1</span> 到 <span class="font-medium">10</span> 共 <span class="font-medium">{{ filteredRequests.length }}</span> 条记录
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
              <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <span class="sr-only">下一页</span>
                <i class="fas fa-chevron-right text-xs"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 申请详情模态框 -->
    <div v-if="showRequestDetails" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen flex flex-col">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">諮詢申請詳情</h3>
          <button @click="closeRequestDetails" class="text-gray-400 hover:text-gray-500">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="selectedRequest" class="space-y-6">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="text-lg font-medium text-gray-900">{{ selectedRequest.name }}</h4>
                <p class="text-sm text-gray-500">用户ID: {{ selectedRequest.userId }}</p>
              </div>
              <span 
                class="px-2 py-1 text-xs font-semibold rounded-full" 
                :class="getStatusClass(selectedRequest.status)"
              >
                {{ getStatusName(selectedRequest.status) }}
              </span>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h5 class="text-sm font-medium text-gray-700 mb-1">所在地區</h5>
                <p class="text-gray-900">{{ selectedRequest.region || '未填寫' }}</p>
              </div>
              <div>
                <h5 class="text-sm font-medium text-gray-700 mb-1">聯絡電話</h5>
                <p class="text-gray-900">{{ selectedRequest.phone }}</p>
              </div>
              <div v-if="selectedRequest.lineId">
                <h5 class="text-sm font-medium text-gray-700 mb-1">Line ID</h5>
                <p class="text-gray-900">{{ selectedRequest.lineId }}</p>
              </div>
              <div v-if="selectedRequest.email">
                <h5 class="text-sm font-medium text-gray-700 mb-1">電子郵箱</h5>
                <p class="text-gray-900">{{ selectedRequest.email }}</p>
              </div>
              <div>
                <h5 class="text-sm font-medium text-gray-700 mb-1">首選聯絡方式</h5>
                <p class="text-gray-900" v-if="selectedRequest.preferredContact && selectedRequest.preferredContact.length">
                  <span v-for="method in selectedRequest.preferredContact" :key="method" class="inline-block mr-2">
                    <i :class="getContactIcon(method)" class="mr-1"></i>
                    {{ getContactMethodName(method) }}
                  </span>
                </p>
                <p v-else class="text-gray-500 italic">未指定</p>
              </div>
              <div>
                <h5 class="text-sm font-medium text-gray-700 mb-1">服務類型</h5>
                <p class="text-gray-900">{{ getServiceName(selectedRequest.service) }}</p>
              </div>
              <div>
                <h5 class="text-sm font-medium text-gray-700 mb-1">諮詢時間</h5>
                <p class="text-gray-900">{{ selectedRequest.consultationTime || '未指定' }}</p>
              </div>
              <div>
                <h5 class="text-sm font-medium text-gray-700 mb-1">申請時間</h5>
                <p class="text-gray-900">{{ formatDate(selectedRequest.createdAt) }} {{ formatTime(selectedRequest.createdAt) }}</p>
              </div>
            </div>
            
            <div>
              <h5 class="text-sm font-medium text-gray-700 mb-2">問題詳情</h5>
              <div class="bg-gray-50 rounded-md p-4 text-gray-900 whitespace-pre-wrap">
                {{ selectedRequest.details }}
              </div>
            </div>
            
            <div>
              <h5 class="text-sm font-medium text-gray-700 mb-2">處理備註</h5>
              <textarea 
                v-model="adminNotes"
                rows="3" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="添加處理備註..."
              ></textarea>
            </div>
            
            <div>
              <h5 class="text-sm font-medium text-gray-700 mb-2">狀態更新</h5>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="status in availableStatuses" 
                  :key="status.value"
                  @click="updateSelectedRequestStatus(status.value)"
                  class="px-3 py-1 text-sm font-medium rounded-md" 
                  :class="status.value === selectedRequest.status ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'"
                >
                  {{ status.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button 
            @click="deleteRequest(selectedRequest?.id)" 
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            刪除申請
          </button>
          <div class="flex space-x-3">
            <button 
              @click="closeRequestDetails" 
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              取消
            </button>
            <button 
              @click="saveRequestDetails"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              保存更改
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
// 🎯 第六階段：導入統一數據管理服務
import dataManager, { DATA_TYPES } from '../../services/dataManager.js';
import expertConsultationService from '../../services/expertConsultationService.js';
import adminAuthService from '../../services/adminAuth.js'; // 添加管理员认证服务

// 加载状态
const isLoading = ref(false);

// 筛选条件
const filters = reactive({
  search: '',
  status: 'all',
  service: 'all',
  region: 'all'  // 新增地區筛选
});

// 获取管理员token - 使用正确的管理员认证服务
const getAdminToken = () => {
  return adminAuthService.getAccessToken();
};

// 🔧 新增：检查管理员认证状态
const checkAdminAuth = () => {
  const isAuthenticated = adminAuthService.isAuthenticated();
  const hasToken = !!adminAuthService.getAccessToken();
  
  console.log('🔐 管理员认证状态检查:', {
    isAuthenticated,
    hasToken,
    currentPath: window.location.pathname
  });
  
  return isAuthenticated && hasToken;
};

// 获取所有咨询请求 - 統一使用DataManager，增强降级处理
const getAllConsultationRequests = async () => {
  try {
    // 🔧 在API调用前检查认证状态
    if (!checkAdminAuth()) {
      console.warn('⚠️ 管理员未认证，无法获取咨询请求数据');
      throw new Error('管理员认证已过期，请重新登录');
    }
    
    console.log('🎯 使用DataManager獲取所有諮詢請求...');
    
    // 🔧 修复：增加try-catch来处理DataManager可能的错误
    let consultationData = null;
    
    try {
      // 首先尝试使用DataManager统一数据管理
      consultationData = await dataManager.getData(
        DATA_TYPES.CONSULTATION_REQUESTS,
        {
          page: 1,
          limit: 100, // 管理端需要看到所有數據
          forceRefresh: true,
          // 覆蓋默認endpoint，使用管理員專用API
          endpoint: '/expert-consultations/admin/list'
        }
      );
    } catch (dataManagerError) {
      console.warn('❌ DataManager调用失败，尝试直接API调用:', dataManagerError.message);
      
      // 🔧 修复：DataManager失败时的降级方案 - 直接使用expertConsultationService
      try {
        console.log('🔄 降级到直接API调用...');
        
        // 🔧 修复：确保传递正确的管理员token
        const adminToken = adminAuthService.getAccessToken();
        console.log('🔐 降级方案获取管理员token，长度:', adminToken ? adminToken.length : 0);
        
        const fallbackResponse = await expertConsultationService.getAdminConsultationList({
          page: 1,
          limit: 100,
          adminToken: adminToken  // 🔧 修复：显式传递管理员token
        });
        
        if (fallbackResponse.success && fallbackResponse.data) {
          consultationData = fallbackResponse.data;
          console.log('✅ 降级API调用成功');
        } else {
          throw new Error('降级API调用失败');
        }
      } catch (fallbackError) {
        console.error('❌ 降级API调用也失败:', fallbackError.message);
        throw new Error(`数据获取失败: ${dataManagerError.message}`);
      }
    }
    
    // 🔧 修复：增强数据格式验证和处理
    if (consultationData) {
      console.log(`✅ 最终获取到数据:`, consultationData);
      console.log(`📊 数据类型:`, typeof consultationData, '数组检查:', Array.isArray(consultationData));
      
      // 🔧 修复：多层数据格式处理
      let requests = [];
      
      // 处理不同的API响应格式
      if (Array.isArray(consultationData)) {
        // 直接是数组
        requests = consultationData;
        console.log('📊 数据格式：直接数组');
      } else if (consultationData && Array.isArray(consultationData.consultations)) {
        // API响应格式：{ consultations: [...] }
        requests = consultationData.consultations;
        console.log('📊 数据格式：嵌套数组 (consultations)');
      } else if (consultationData && Array.isArray(consultationData.data)) {
        // API响应格式：{ data: [...] }
        requests = consultationData.data;
        console.log('📊 数据格式：嵌套数组 (data)');
      } else if (consultationData && Array.isArray(consultationData.requests)) {
        // API响应格式：{ requests: [...] }
        requests = consultationData.requests;
        console.log('📊 数据格式：嵌套数组 (requests)');
      } else {
        // 🔧 修复：无法识别格式时，返回空数组而不是报错
        console.warn('⚠️ 无法识别的数据格式，使用空数组:', consultationData);
        requests = [];
      }
      
      console.log(`📊 最终提取到 ${requests.length} 条记录`);
      
      // 🔧 修复：确保requests是数组后再进行map操作
      if (!Array.isArray(requests)) {
        console.warn('⚠️ 提取的requests不是数组，强制转换为空数组:', requests);
        requests = [];
      }
      
      // 进行数据处理和排序
      return requests.map(req => ({
        ...req,
        // 确保所有必要字段存在
        adminNotes: req.adminNotes || req.admin_notes || '',
        status: req.status || 'pending',
        createdAt: req.createdAt || req.created_at,
        source: 'api_success'
      })).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    // 🔧 修复：数据为空时返回空数组
    console.log('📊 无数据返回，使用空数组');
    return [];
    
  } catch (error) {
    console.error('❌ 获取諮詢請求數據最终失败:', error);
    
    // 🔧 修复：根据错误类型提供不同处理
    if (error.message.includes('认证') || error.message.includes('登录') || error.message.includes('登入')) {
      // 认证相关错误，不抛出，返回空数组让组件能正常渲染
      console.warn('🔄 认证错误，等待重定向...');
      return [];
    }
    
    // 🔧 修复：其他错误也返回空数组，避免页面崩溃
    console.warn('🔄 其他错误，返回空数组以保持页面稳定:', error.message);
    return [];
  }
};

// 保存咨询请求状态更新 - 統一使用DataManager
const saveConsultationRequest = async (updatedRequest) => {
  try {
    console.log('🎯 使用DataManager更新諮詢請求狀態:', updatedRequest.id);
    
    const updateData = {
      ...updatedRequest,
      updatedAt: new Date().toISOString()
    };
    
    // 使用統一數據管理服務更新數據
    const success = await dataManager.setData(
      DATA_TYPES.CONSULTATION_REQUESTS,
      updateData,
      {
        method: 'PUT',
        endpoint: `/expert-consultations/admin/${updatedRequest.customId || updatedRequest.id}`,
        requiresAuth: true
      }
    );
    
    if (success) {
      console.log('✅ DataManager諮詢請求狀態更新成功');
      return true;
    } else {
      throw new Error('DataManager更新失敗');
    }
    
  } catch (error) {
    console.error('❌ DataManager更新諮詢請求狀態失敗:', error);
    return false;
  }
};

// 删除咨询请求 - 統一使用DataManager
const deleteConsultationRequest = async (id) => {
  try {
    console.log('🎯 使用DataManager刪除諮詢請求:', id);
    
    // 找到對應請求的customId
    const request = allRequests.value.find(r => r.id === id);
    const consultationId = request?.customId || id;
    
    // 使用統一數據管理服務刪除數據
    const success = await dataManager.setData(
      DATA_TYPES.CONSULTATION_REQUESTS,
      null,
      {
        method: 'DELETE',
        endpoint: `/expert-consultations/admin/${consultationId}`,
        requiresAuth: true
      }
    );
    
    if (success) {
      console.log('✅ DataManager諮詢請求刪除成功');
      return true;
    } else {
      throw new Error('DataManager刪除失敗');
    }
    
  } catch (error) {
    console.error('❌ DataManager刪除諮詢請求失敗:', error);
    return false;
  }
};

// 请求数据
const allRequests = ref([]);
const refreshTimer = ref(null);
const adminNotes = ref('');

// 刷新數據
const refreshData = async () => {
  try {
    console.log('🔄 專人諮詢數據刷新中...');
    
    // 🔧 修复：在刷新前检查认证状态
    if (!checkAdminAuth()) {
      console.warn('⚠️ 管理员认证失效，停止刷新');
      isLoading.value = false;
      return;
    }
    
    isLoading.value = true;
    
    // 🔧 修复：添加重试机制
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        const data = await getAllConsultationRequests();
        
        if (Array.isArray(data)) {
          allRequests.value = data;
          console.log(`✅ 專人諮詢數據刷新成功，共 ${data.length} 條記錄`);
          break; // 成功则跳出重试循环
        } else {
          throw new Error('返回的数据不是数组格式');
        }
        
      } catch (retryError) {
        retryCount++;
        
        // 🔧 修复：认证错误不重试
        if (retryError.message.includes('认证') || retryError.message.includes('登入')) {
          console.warn('❌ 认证错误，停止重试:', retryError.message);
          allRequests.value = [];
          break;
        }
        
        if (retryCount <= maxRetries) {
          console.warn(`⚠️ 数据刷新失败，重试第 ${retryCount}/${maxRetries} 次:`, retryError.message);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // 指数退避
        } else {
          console.error(`❌ 数据刷新最终失败:`, retryError.message);
          allRequests.value = [];
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 數據刷新失敗:', error);
    // 🔧 修复：确保即使出错也设置为空数组
    allRequests.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 手動刷新
const manualRefresh = async () => {
  console.log('👆 手動刷新數據...');
  await refreshData();
};

// 页面加载时获取数据
onMounted(async () => {
  // 🔧 改进：在组件挂载时先检查认证状态
  console.log('🚀 ConsultationRequestsView 组件开始挂载...');
  
  // 如果认证状态无效，等待一下让App.vue的事件处理器完成重定向
  if (!checkAdminAuth()) {
    console.warn('⚠️ 管理员认证无效，延迟数据加载...');
    // 等待2秒，如果用户还在这个页面，说明认证可能没问题，尝试加载数据
    setTimeout(async () => {
      if (checkAdminAuth()) {
        console.log('🔄 延迟检查通过，开始加载数据...');
        await refreshData();
      } else {
        console.warn('🔄 延迟检查仍然失败，等待重定向...');
      }
    }, 2000);
  } else {
    // 认证状态有效，正常加载数据
    await refreshData();
  }
  
  // 🔧 修复：设置智能自动刷新计时器
  let failureCount = 0;
  const maxFailures = 3;
  
  refreshTimer.value = setInterval(async () => {
    // 🔧 修复：自动刷新前检查认证状态
    if (!checkAdminAuth()) {
      console.warn('⏰ 自動刷新跳過：管理员认证无效');
      failureCount++;
      
      // 连续失败超过阈值时停止定时器
      if (failureCount >= maxFailures) {
        console.warn('❌ 连续认证失败，停止自动刷新');
        if (refreshTimer.value) {
          clearInterval(refreshTimer.value);
          refreshTimer.value = null;
        }
      }
      return;
    }
    
    // 🔧 修复：认证有效时进行刷新
    try {
      console.log('⏰ 自動刷新數據...');
      await refreshData();
      failureCount = 0; // 重置失败计数
    } catch (error) {
      failureCount++;
      console.warn(`⏰ 自动刷新失败 ${failureCount}/${maxFailures}:`, error.message);
      
      // 连续失败超过阈值时停止定时器
      if (failureCount >= maxFailures) {
        console.warn('❌ 连续刷新失败，停止自动刷新');
        if (refreshTimer.value) {
          clearInterval(refreshTimer.value);
          refreshTimer.value = null;
        }
      }
    }
  }, 30000); // 30秒间隔
});

// 清理计时器
onBeforeUnmount(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value);
    refreshTimer.value = null;
  }
});

// 状态选项
const availableStatuses = [
  { value: 'pending', name: '待處理' },
  { value: 'processing', name: '處理中' },
  { value: 'completed', name: '已完成' },
  { value: 'cancelled', name: '已取消' }
];

// 详情模态框
const showRequestDetails = ref(false);
const selectedRequest = ref(null);

// 过滤后的咨询申请
const filteredRequests = computed(() => {
  return allRequests.value.filter(request => {
    // 搜索匹配
    const searchMatch = !filters.search || 
      request.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.phone?.includes(filters.search) ||
      request.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.lineId?.toLowerCase().includes(filters.search.toLowerCase());
    
    // 状态匹配
    const statusMatch = filters.status === 'all' || request.status === filters.status;
    
    // 服务类型匹配
    const serviceMatch = filters.service === 'all' || request.service === filters.service;
    
    // 地區匹配
    const regionMatch = filters.region === 'all' || request.region === filters.region;
    
    return searchMatch && statusMatch && serviceMatch && regionMatch;
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

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// 格式化时间
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
}

// 获取服务类型名称
function getServiceName(serviceCode) {
  const serviceMap = {
    'labor_contract': '勞動契約審核',
    'compensation': '薪資與加班費問題',
    'termination': '終止僱傭關係',
    'workplace_safety': '職場安全問題',
    'discrimination': '就業歧視問題',
    'other': '其他問題'
  };
  return serviceMap[serviceCode] || serviceCode;
}

// 获取联系方式名称
function getContactMethodName(methodCode) {
  const methodMap = {
    'phone': '電話',
    'line': 'LINE',
    'email': '電子郵件'
  };
  return methodMap[methodCode] || methodCode;
}

// 获取联系方式图标
function getContactIcon(method) {
  const icons = {
    'phone': 'fas fa-phone',
    'email': 'fas fa-envelope',
    'line': 'fab fa-line',
  };
  return icons[method] || 'fas fa-question';
}

// 获取状态名称
function getStatusName(statusCode) {
  const statusMap = {
    'pending': '待處理',
    'processing': '處理中',
    'completed': '已完成',
    'cancelled': '已取消'
  };
  return statusMap[statusCode] || statusCode;
}

// 获取状态样式类
function getStatusClass(status) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// 获取下一个状态
function getNextStatus(currentStatus) {
  const statusFlow = {
    'pending': 'processing',
    'processing': 'completed',
    'completed': 'completed',
    'cancelled': 'pending'
  };
  return statusFlow[currentStatus] || 'pending';
}

// 应用筛选
function applyFilters() {
  console.log('🔍 應用篩選:', filters);
  // 重新獲取數據以應用篩選
  refreshData();
}

// 重置筛选
function resetFilters() {
  filters.search = '';
  filters.status = 'all';
  filters.service = 'all';
  filters.region = 'all';  // 重置地區筛选
  // 重置後重新獲取數據
  refreshData();
}

// 查看申请详情
function viewRequestDetails(id) {
  const request = allRequests.value.find(req => req.id === id);
  if (request) {
    selectedRequest.value = JSON.parse(JSON.stringify(request)); // 深拷贝，避免直接修改
    adminNotes.value = request.adminNotes || '';
    showRequestDetails.value = true;
  }
}

// 关闭申请详情
function closeRequestDetails() {
  showRequestDetails.value = false;
  selectedRequest.value = null;
  adminNotes.value = '';
}

// 更新选中请求的状态
function updateSelectedRequestStatus(newStatus) {
  if (selectedRequest.value) {
    selectedRequest.value.status = newStatus;
  }
}

// 保存请求详情
async function saveRequestDetails() {
  if (selectedRequest.value) {
    isLoading.value = true;
    
    try {
      // 更新备注
      selectedRequest.value.adminNotes = adminNotes.value;
      selectedRequest.value.updatedAt = new Date().toISOString();
      
      const success = await saveConsultationRequest(selectedRequest.value);
      if (success) {
        // 更新列表数据
        await refreshData();
        alert('✅ 請求已更新！');
        closeRequestDetails();
      } else {
        alert('❌ 更新失敗！');
      }
    } catch (error) {
      console.error('保存請求詳情失敗:', error);
      alert('❌ 更新失敗：' + error.message);
    } finally {
      isLoading.value = false;
    }
  }
}

// 直接更新申请状态（表格中的快捷操作）
async function updateRequestStatus(id, newStatus) {
  const request = allRequests.value.find(req => req.id === id);
  if (request) {
    try {
      const updatedRequest = { 
        ...request, 
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      const success = await saveConsultationRequest(updatedRequest);
      if (success) {
        await refreshData();
        console.log('✅ 快捷狀態更新成功');
      }
    } catch (error) {
      console.error('快捷狀態更新失敗:', error);
      alert('❌ 狀態更新失敗：' + error.message);
    }
  }
}

// 删除咨询申请
async function deleteRequest(id) {
  if (confirm('確定要刪除這條諮詢申請嗎？此操作不可恢復。')) {
    isLoading.value = true;
    
    try {
      const success = await deleteConsultationRequest(id);
      if (success) {
        await refreshData();
        
        // 如果是在详情模态框内删除，关闭模态框
        if (showRequestDetails.value && selectedRequest.value && selectedRequest.value.id === id) {
          closeRequestDetails();
        }
        
        alert('✅ 申請已刪除！');
      } else {
        alert('❌ 刪除失敗！');
      }
    } catch (error) {
      console.error('刪除申請失敗:', error);
      alert('❌ 刪除失敗：' + error.message);
    } finally {
      isLoading.value = false;
    }
  }
}
</script> 