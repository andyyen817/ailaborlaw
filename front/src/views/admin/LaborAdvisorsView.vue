<template>
  <div class="p-0">
    <!-- 页面标题和操作区 -->
    <div class="bg-white px-6 py-4 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">劳工顾问管理</h2>
          <p class="mt-1 text-sm text-gray-600">管理系统中的专业劳工顾问信息和服务记录</p>
        </div>
        <button @click="showAddModal = true" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          添加顾问
        </button>
      </div>
    </div>

    <!-- 筛选和搜索区 -->
    <div class="bg-white px-6 py-4 border-b border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">搜索</label>
          <input 
            v-model="searchTerm" 
            type="text" 
            id="search" 
            placeholder="搜索姓名、联系方式..." 
            class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>
        <div>
          <label for="regionFilter" class="block text-sm font-medium text-gray-700 mb-1">服务地区</label>
          <select v-model="regionFilter" id="regionFilter" class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <option value="">全部地区</option>
            <optgroup label="直辖市">
              <option v-for="city in municipalities" :key="city" :value="city">{{ city }}</option>
            </optgroup>
            <optgroup label="县">
              <option v-for="county in counties" :key="county" :value="county">{{ county }}</option>
            </optgroup>
            <optgroup label="市">
              <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
            </optgroup>
          </select>
        </div>
        <div>
          <label for="specialtyFilter" class="block text-sm font-medium text-gray-700 mb-1">专业领域</label>
          <select v-model="specialtyFilter" id="specialtyFilter" class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <option value="">全部领域</option>
            <option v-for="specialty in specialties" :key="specialty" :value="specialty">{{ specialty }}</option>
          </select>
        </div>
        <div>
          <label for="statusFilter" class="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <select v-model="statusFilter" id="statusFilter" class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <option value="">全部状态</option>
            <option value="active">启用</option>
            <option value="inactive">停用</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顾问信息</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系方式</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">服务地区</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">专业领域</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">服务记录</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading" class="text-center">
              <td colspan="7" class="px-6 py-12">
                <div class="flex justify-center items-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span class="ml-2 text-gray-600">加载中...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredAdvisors.length === 0" class="text-center">
              <td colspan="7" class="px-6 py-12 text-gray-500">
                暂无顾问数据
              </td>
            </tr>
            <tr v-else v-for="advisor in paginatedAdvisors" :key="advisor.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {{ advisor.name.charAt(0) }}
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ advisor.name }}</div>
                    <div class="text-sm text-gray-500">ID: {{ advisor.id }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ advisor.phone }}</div>
                <div class="text-sm text-gray-500">{{ advisor.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ advisor.region }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span v-for="specialty in advisor.specialties" :key="specialty" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ getSpecialtyLabel(specialty) }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ advisor.serviceCount }} 次</div>
                <div class="text-sm text-gray-500">评分: {{ advisor.rating || 'N/A' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  advisor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]">
                  {{ advisor.status === 'active' ? '启用' : '停用' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button @click="editAdvisor(advisor)" class="text-blue-600 hover:text-blue-900">编辑</button>
                  <button @click="viewAdvisorDetails(advisor)" class="text-green-600 hover:text-green-900">详情</button>
                  <button 
                    @click="toggleAdvisorStatus(advisor)" 
                    :class="advisor.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'"
                  >
                    {{ advisor.status === 'active' ? '停用' : '启用' }}
                  </button>
                  <button @click="deleteAdvisor(advisor)" class="text-red-600 hover:text-red-900">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              显示 <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span> 到 
              <span class="font-medium">{{ Math.min(currentPage * pageSize, totalAdvisors) }}</span> 共 
              <span class="font-medium">{{ totalAdvisors }}</span> 条记录
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button 
                @click="currentPage--" 
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              <button 
                v-for="page in visiblePages" 
                :key="page" 
                @click="currentPage = page"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  page === currentPage 
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
              <button 
                @click="currentPage++" 
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑顾问模态框 -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ showAddModal ? '添加顾问' : '编辑顾问' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="submitAdvisor" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="advisorName" class="block text-sm font-medium text-gray-700">姓名 *</label>
                <input 
                  v-model="formData.name" 
                  type="text" 
                  id="advisorName" 
                  required 
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
              </div>
              <div>
                <label for="advisorPhone" class="block text-sm font-medium text-gray-700">联系电话 *</label>
                <input 
                  v-model="formData.phone" 
                  type="tel" 
                  id="advisorPhone" 
                  required 
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
              </div>
            </div>
            
            <div>
              <label for="advisorEmail" class="block text-sm font-medium text-gray-700">邮箱</label>
              <input 
                v-model="formData.email" 
                type="email" 
                id="advisorEmail" 
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
            </div>
            
            <div>
              <label for="advisorRegion" class="block text-sm font-medium text-gray-700">服务地区 *</label>
              <select 
                v-model="formData.region" 
                id="advisorRegion" 
                required 
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">请选择地区</option>
                <optgroup label="直辖市">
                  <option v-for="city in municipalities" :key="city" :value="city">{{ city }}</option>
                </optgroup>
                <optgroup label="县">
                  <option v-for="county in counties" :key="county" :value="county">{{ county }}</option>
                </optgroup>
                <optgroup label="市">
                  <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
                </optgroup>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">专业领域 *</label>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                <label v-for="option in specialtyOptions" :key="option.value" class="flex items-center">
                  <input 
                    v-model="formData.specialties" 
                    :value="option.value" 
                    type="checkbox" 
                    class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                  <span class="ml-2 text-sm text-gray-700">{{ option.label }}</span>
                </label>
              </div>
            </div>
            
            <div>
              <label for="advisorNotes" class="block text-sm font-medium text-gray-700">备注</label>
              <textarea 
                v-model="formData.notes" 
                id="advisorNotes" 
                rows="3" 
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="备注信息（可选）"
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button type="button" @click="closeModal" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                取消
              </button>
              <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                {{ showAddModal ? '添加' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 顾问详情模态框 -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">顾问详情</h3>
            <button @click="showDetailsModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div v-if="selectedAdvisor" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="text-sm font-medium text-gray-700">基本信息</h4>
                <dl class="mt-2 space-y-1">
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">姓名:</dt>
                    <dd class="text-sm text-gray-900">{{ selectedAdvisor.name }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">联系电话:</dt>
                    <dd class="text-sm text-gray-900">{{ selectedAdvisor.phone }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">邮箱:</dt>
                    <dd class="text-sm text-gray-900">{{ selectedAdvisor.email || 'N/A' }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">服务地区:</dt>
                    <dd class="text-sm text-gray-900">{{ selectedAdvisor.region }}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-700">服务统计</h4>
                <dl class="mt-2 space-y-1">
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">服务次数:</dt>
                    <dd class="text-sm text-gray-900">{{ selectedAdvisor.serviceCount }} 次</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">平均评分:</dt>
                    <dd class="text-sm text-gray-900">{{ selectedAdvisor.rating || 'N/A' }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-sm text-gray-500">状态:</dt>
                    <dd class="text-sm text-gray-900">
                      <span :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        selectedAdvisor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      ]">
                        {{ selectedAdvisor.status === 'active' ? '启用' : '停用' }}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div>
              <h4 class="text-sm font-medium text-gray-700">专业领域</h4>
              <div class="mt-2 flex flex-wrap gap-2">
                <span v-for="specialty in selectedAdvisor.specialties" :key="specialty" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ getSpecialtyLabel(specialty) }}
                </span>
              </div>
            </div>
            
            <div v-if="selectedAdvisor.notes">
              <h4 class="text-sm font-medium text-gray-700">备注</h4>
              <p class="mt-2 text-sm text-gray-900">{{ selectedAdvisor.notes }}</p>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button @click="editAdvisor(selectedAdvisor)" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                编辑顾问
              </button>
              <button @click="showDetailsModal = false" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import laborAdvisorService from '@/services/laborAdvisorService';

// 台灣地區數據 - 統一使用繁體中文以符合後端API規範
const municipalities = ['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市'];
const counties = ['新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣', '台東縣', '澎湖縣', '金門縣', '連江縣'];
const cities = ['基隆市', '新竹市', '嘉義市'];

// 专业领域数据 - 使用标签-值映射以符合后端API规范
const specialtyOptions = [
  { label: '勞動合同', value: 'labor_contract' },
  { label: '薪資福利', value: 'compensation' },
  { label: '終止勞動關係', value: 'termination' },
  { label: '工作場所安全', value: 'workplace_safety' },
  { label: '歧視問題', value: 'discrimination' },
  { label: '其他', value: 'other' }
];

// 用于筛选的专业领域（保持向后兼容）
const specialties = specialtyOptions.map(option => option.label);

// 数据状态
const loading = ref(false);
const advisors = ref([]);
const totalAdvisors = ref(0);
const searchTerm = ref('');
const regionFilter = ref('');
const specialtyFilter = ref('');
const statusFilter = ref('');

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = ref(0);

// 模态框状态
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDetailsModal = ref(false);
const selectedAdvisor = ref(null);

// 表单数据
const formData = reactive({
  name: '',
  phone: '',
  email: '',
  region: '',
  specialties: [],
  notes: ''
});

// 错误状态
const error = ref('');

// 重置表单
const resetForm = () => {
  formData.name = '';
  formData.phone = '';
  formData.email = '';
  formData.region = '';
  formData.specialties = [];
  formData.notes = '';
};

// 监听筛选条件变化，重置到第一页
watch([searchTerm, regionFilter, specialtyFilter, statusFilter], () => {
  currentPage.value = 1;
  loadAdvisors();
});

// 监听分页变化
watch(currentPage, () => {
  loadAdvisors();
});

// 加载顾问数据
const loadAdvisors = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      search: searchTerm.value || undefined,
      region: regionFilter.value || undefined,
      specialty: specialtyFilter.value || undefined,
      status: statusFilter.value || undefined
    };
    
    const response = await laborAdvisorService.getAllAdvisors(params);
    
    if (response.success) {
      advisors.value = response.data.advisors || [];
      const pagination = response.data.pagination || {};
      totalAdvisors.value = pagination.total || 0;
      totalPages.value = pagination.total_pages || 0;
      currentPage.value = pagination.current_page || 1;
    } else {
      throw new Error(response.error || '获取顾问数据失败');
    }
  } catch (err) {
    console.error('加载顾问数据失败:', err);
    
    // 检查是否是认证错误
    if (err.message.includes('管理員認證') || err.message.includes('认证')) {
      error.value = '管理员认证失败，请重新登录管理后台';
      // 可以考虑自动跳转到登录页面
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 3000);
    } else {
      error.value = err.message || '加载数据时发生错误';
    }
    
    advisors.value = [];
    totalAdvisors.value = 0;
    totalPages.value = 0;
  } finally {
    loading.value = false;
  }
};

// 分页相关计算属性
const filteredAdvisors = computed(() => advisors.value);
const paginatedAdvisors = computed(() => advisors.value);

const visiblePages = computed(() => {
  const pages = [];
  const startPage = Math.max(1, currentPage.value - 2);
  const endPage = Math.min(totalPages.value, currentPage.value + 2);
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
});

// 关闭模态框
const closeModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  showDetailsModal.value = false;
  selectedAdvisor.value = null;
  resetForm();
};

// 编辑顾问
const editAdvisor = (advisor) => {
  selectedAdvisor.value = advisor;
  formData.name = advisor.name;
  formData.phone = advisor.phone;
  formData.email = advisor.email || '';
  formData.region = advisor.region;
  
  // 🔧 修復：正確處理專業領域數據
  // 如果advisor.specialties包含標籤(舊數據)，轉換為值；如果已經是值，直接使用
  formData.specialties = Array.isArray(advisor.specialties) 
    ? advisor.specialties.map(specialty => {
        // 檢查是否為標籤格式，如果是則轉換為值格式
        const isLabel = specialtyOptions.some(opt => opt.label === specialty);
        return isLabel ? getSpecialtyValue(specialty) : specialty;
      })
    : [];
  
  formData.notes = advisor.notes || '';
  
  showDetailsModal.value = false;
  showEditModal.value = true;
};

// 查看顾问详情
const viewAdvisorDetails = (advisor) => {
  selectedAdvisor.value = advisor;
  showDetailsModal.value = true;
};

// 切换顾问状态
const toggleAdvisorStatus = async (advisor) => {
  try {
    console.log('🔄 切换顾问状态:', advisor.id, advisor.status);
    
    const response = await laborAdvisorService.toggleAdvisorStatus(advisor.id);
    
    if (response.success) {
      // 重新加载数据以获取最新状态
      await loadAdvisors();
      
      // 显示成功消息
      const newStatus = advisor.status === 'active' ? '停用' : '启用';
      console.log(`✅ 顾问状态已更新为: ${newStatus}`);
    } else {
      alert(response.error || '更新状态失败');
    }
  } catch (err) {
    console.error('更新顾问状态失败:', err);
    alert('更新状态时发生错误');
  }
};

// 删除顾问
const deleteAdvisor = async (advisor) => {
  if (!confirm(`确定要删除顾问 "${advisor.name}" 吗？此操作不可恢复。`)) {
    return;
  }
  
  try {
    const response = await laborAdvisorService.deleteAdvisor(advisor.id);
    
    if (response.success) {
      // 重新加载数据
      await loadAdvisors();
    } else {
      alert(response.error || '删除失败');
    }
  } catch (err) {
    console.error('删除顾问失败:', err);
    alert('删除时发生错误');
  }
};

// 表单验证
const validateForm = () => {
  if (!formData.name.trim()) {
    alert('请输入顾问姓名');
    return false;
  }
  if (!formData.phone.trim()) {
    alert('请输入联系电话');
    return false;
  }
  if (!formData.region) {
    alert('请选择服务地区');
    return false;
  }
  if (formData.specialties.length === 0) {
    alert('请至少选择一个专业领域');
    return false;
  }
  return true;
};

// 提交表单
const submitAdvisor = async () => {
  if (!validateForm()) {
    return;
  }
  
  try {
    loading.value = true;
    
    const advisorData = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      region: formData.region,
      specialties: [...formData.specialties],
      notes: formData.notes.trim() || undefined
    };
    
    let response;
    if (showAddModal.value) {
      // 添加新顾问
      response = await laborAdvisorService.createAdvisor(advisorData);
    } else if (showEditModal.value && selectedAdvisor.value) {
      // 编辑现有顾问
      response = await laborAdvisorService.updateAdvisor(selectedAdvisor.value.id, advisorData);
    }
    
    if (response && response.success) {
      closeModal();
      await loadAdvisors(); // 重新加载数据
    } else {
      alert(response?.error || '操作失败');
    }
  } catch (err) {
    console.error('提交顾问数据失败:', err);
    alert('提交时发生错误');
  } finally {
    loading.value = false;
  }
};

// 專業領域值轉換為標籤的輔助函數
const getSpecialtyLabel = (value) => {
  const option = specialtyOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

// 專業領域標籤轉換為值的輔助函數
const getSpecialtyValue = (label) => {
  const option = specialtyOptions.find(opt => opt.label === label);
  return option ? option.value : label;
};

// 格式化專業領域數組顯示
const formatSpecialties = (specialties) => {
  if (!Array.isArray(specialties)) return 'N/A';
  return specialties.map(specialty => getSpecialtyLabel(specialty)).join(', ');
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
};

// 组件挂载时加载数据
onMounted(() => {
  loadAdvisors();
});
</script>

<style scoped>
/* 使用 Tailwind CSS，大部分样式已内联 */
</style> 