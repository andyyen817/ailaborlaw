<template>
  <div>
    <!-- 筛选和操作栏 -->
    <div class="bg-white rounded-lg shadow mb-6">
      <div class="p-4 flex flex-wrap gap-4 items-center justify-between">
        <!-- 搜索框 -->
        <div class="flex-grow sm:flex-grow-0 sm:w-64">
            <label for="search-filter" class="block text-sm font-medium text-gray-700 mb-1">搜索用户</label>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-search text-gray-400"></i>
                </div>
                <input type="text" id="search-filter" v-model="filters.searchTerm" @keyup.enter="applyFilters" class="border rounded-md py-2 px-3 pl-10 w-full" placeholder="姓名或邮箱">
            </div>
        </div>

        <!-- 将筛选器和按钮放在一个flex容器中，确保它们在同一行 -->
        <div class="flex flex-nowrap gap-4 items-end"> 
          <div>
            <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-1">账户状态</label>
            <select id="status-filter" v-model="filters.status" class="border rounded-md py-2 px-3 w-40">
              <option value="">全部状态</option>
              <option value="active">活跃</option>
              <option value="pending">待验证</option>
              <option value="disabled">已禁用</option>
            </select>
          </div>
          
          <div>
            <label for="user-type-filter" class="block text-sm font-medium text-gray-700 mb-1">用户类型</label>
            <select id="user-type-filter" v-model="filters.userType" class="border rounded-md py-2 px-3 w-40">
              <option value="">全部类型</option>
              <option value="admin">管理员</option>
              <option value="hr">HR人员</option>
              <option value="employer">雇主</option>
              <option value="employee">员工</option>
            </select>
          </div>
          
          <div>
            <label for="date-filter" class="block text-sm font-medium text-gray-700 mb-1">注册日期</label>
            <select id="date-filter" v-model="filters.dateRange" class="border rounded-md py-2 px-3 w-40">
              <option value="">全部时间</option>
              <option value="today">今天</option>
              <option value="week">本周</option>
              <option value="month">本月</option>
              <option value="year">今年</option>
            </select>
          </div>
          
          <!-- 应用筛选和重置按钮 (现在是同一个flex容器的子项) -->
          <div class="flex items-end space-x-2">
            <button @click="applyFilters" class="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center">
              <i class="fas fa-filter mr-2"></i>
              应用筛选
            </button>
            <button @click="resetFilters" class="bg-gray-300 text-gray-700 py-2 px-4 rounded-md flex items-center">
              <i class="fas fa-undo mr-2"></i>
              重置
            </button>
          </div>
        </div>
        
        <div class="flex gap-3 mt-4 sm:mt-0 md:self-end"> 
          <button @click="openAddUserModal" class="bg-green-600 text-white py-2 px-4 rounded-md flex items-center">
            <i class="fas fa-plus mr-2"></i>
            添加用户
          </button>
          
          <button @click="exportUserData" :disabled="isExporting" class="bg-purple-600 text-white py-2 px-4 rounded-md flex items-center disabled:opacity-50">
            <i class="fas fa-file-export mr-2"></i>
            {{ isExporting ? '导出中...' : '导出数据' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 用户数据表格 -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center">
                  <input type="checkbox" class="mr-2 rounded">
                  用户
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center">
                  用户类型
                  <i class="fas fa-sort ml-1"></i>
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center">
                  注册日期
                  <i class="fas fa-sort ml-1"></i>
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center">
                  剩余次数
                  <i class="fas fa-sort ml-1"></i>
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center">
                  累计咨询
                  <i class="fas fa-sort ml-1"></i>
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center">
                  状态
                  <i class="fas fa-sort ml-1"></i>
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- 用户数据行将由 v-for 动态渲染 -->
            <tr v-if="isLoading">
              <td colspan="7" class="text-center py-4">加载中...</td>
            </tr>
            <tr v-else-if="error">
              <td colspan="7" class="text-center py-4 text-red-500">加载用户数据失败: {{ error.message }}</td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="7" class="text-center py-4">没有找到用户数据。</td>
            </tr>
            <tr v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <input type="checkbox" class="mr-3 rounded focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.name || 'N/A' }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getUserTypeClass(user.userType)">
                  {{ formatUserType(user.userType) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.registrationDate }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.remainingQueries }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.totalConsultations }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(user.status)">
                  {{ formatStatus(user.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end gap-2">
                  <button @click="viewUser(user)" class="text-blue-600 hover:text-blue-900">查看</button>
                  <button @click="editUser(user)" class="text-green-600 hover:text-green-900">编辑</button>
                  <button @click="toggleUserStatusAction(user)" :class="user.status === 'active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'">
                    {{ user.status === 'active' ? '禁用' : '启用' }}
                  </button>
                  <button @click="confirmDeleteUser(user)" class="text-red-600 hover:text-red-900">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 分页控件 -->
      <div v-if="!isLoading && !error && totalUsers > 0" class="p-4 border-t border-gray-200 flex justify-between items-center">
        <div>
          总共 {{ totalUsers }} 条记录，当前第 {{ currentPage }} 页
        </div>
        <div class="flex gap-2">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-chevron-left mr-1"></i> 上一页
          </button>
          <button 
            @click="nextPage" 
            :disabled="currentPage * itemsPerPage >= totalUsers"
            class="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页 <i class="fas fa-chevron-right ml-1"></i>
          </button>
        </div>
      </div>
       <div v-else-if="!isLoading && !error && users.length === 0 && totalUsers === 0 && (filters.searchTerm || filters.status || filters.userType || filters.dateRange)" class="p-4 text-center text-gray-500">
        根据当前筛选条件，没有找到匹配的用户。
      </div>
    </div>
    <AddUserModal :isVisible="isAddUserModalVisible" @close="closeAddUserModal" @save="handleSaveNewUser" />
    <EditUserModal 
      :isVisible="isEditUserModalVisible" 
      :userToEdit="currentUserToEdit" 
      @close="closeEditUserModal" 
      @save="handleUpdateUser" 
    />
    <ViewUserModal
      :isVisible="isViewUserModalVisible"
      :userToView="currentUserToView"
      @close="closeViewUserModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import userService from '@/services/userService';
import AddUserModal from '@/components/admin/AddUserModal.vue';
import EditUserModal from '@/components/admin/EditUserModal.vue';
import ViewUserModal from '@/components/admin/ViewUserModal.vue'; // 导入查看用户模态框
import Papa from 'papaparse';
import eventService from '@/services/eventService';
import { EventTypes, listenEvent } from '@/services/eventService';

const users = ref([]);
const isLoading = ref(false);
const error = ref(null);
const totalUsers = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(10);

const filters = ref({
  searchTerm: '',
  status: '',
  userType: '',
  dateRange: '',
});

const isAddUserModalVisible = ref(false);
const isEditUserModalVisible = ref(false);
const currentUserToEdit = ref(null);

const isViewUserModalVisible = ref(false); // 控制查看模态框的可见性
const currentUserToView = ref(null); // 存储当前正在查看的用户

// 添加事件监听清理函数引用
const eventCleanupFunctions = ref([]);

const openAddUserModal = () => {
  isAddUserModalVisible.value = true;
};

const closeAddUserModal = () => {
  isAddUserModalVisible.value = false;
};

const openEditUserModal = (user) => {
  currentUserToEdit.value = { ...user };
  isEditUserModalVisible.value = true;
};

const closeEditUserModal = () => {
  isEditUserModalVisible.value = false;
  // 延迟清理状态，确保事件处理完成
  setTimeout(() => {
    currentUserToEdit.value = null;
  }, 100);
};

// 新增：设置用户更新事件监听
const setupEventListeners = () => {
  console.log('设置UserManagementView事件监听器...');
  
  // 监听用户资料更新事件
  const userProfileUpdateCleanup = listenEvent(EventTypes.USER_PROFILE_UPDATED, (event) => {
    if (event.detail && event.detail.userId) {
      const { userId, userData } = event.detail;
      console.log(`UserManagementView: 监听到用户(ID: ${userId})资料更新事件`);
      console.log('UserManagementView: 自动刷新用户列表...');
      
      // 自动刷新用户列表以反映最新更改
      fetchUsers();
    }
  });
  
  // 监听数据同步事件
  const dataSyncCleanup = listenEvent(EventTypes.DATA_SYNC_NEEDED, (event) => {
    if (event.detail && event.detail.dataType === 'users' && event.detail.action === 'update') {
      console.log('UserManagementView: 监听到用户数据同步事件');
      console.log('UserManagementView: 自动刷新用户列表...');
      
      // 延迟刷新，确保数据已完全同步
      setTimeout(() => {
        fetchUsers();
      }, 100);
    }
  });
  
  // 保存清理函数
  eventCleanupFunctions.value.push(userProfileUpdateCleanup, dataSyncCleanup);
};

// 新增：清理事件监听器
const cleanupEventListeners = () => {
  console.log('清理UserManagementView事件监听器...');
  eventCleanupFunctions.value.forEach(cleanup => {
    if (typeof cleanup === 'function') {
      cleanup();
    }
  });
  eventCleanupFunctions.value = [];
};

const openViewUserModal = async (user) => {
  console.log('打開用戶詳情模態框，用戶ID:', user.id);
  
  // 顯示加載指示器
  isViewUserModalVisible.value = true;
  // 先設置基本數據，以便在API請求期間顯示基本信息
  currentUserToView.value = { 
    ...user,
    isLoading: true
  };
  
  try {
    // 強制從API獲取最新用戶詳情，避免使用過時的緩存數據
    console.log('正在從API獲取最新用戶資料...');
    const timestamp = new Date().getTime(); // 添加時間戳防止緩存
    const response = await userService.getUserById(user.id, true); // 明確要求強制刷新
    
    // 處理API響應
    if (response && (response.data?.user || response.data)) {
      // 更新模態框中的用戶數據
      const freshUserData = response.data?.user || response.data;
      if (freshUserData) {
        console.log('成功從API獲取到最新用戶詳情:', freshUserData);
        // 標準化數據，確保字段名稱一致
        currentUserToView.value = {
          ...freshUserData,
          // 確保使用統一的字段名稱
          phoneNumber: freshUserData.phoneNumber || freshUserData.phone || '',
          companyName: freshUserData.companyName || freshUserData.company || '',
          isLoading: false
        };
      }
    } else {
      console.warn('API返回的用戶詳情格式異常:', response);
      currentUserToView.value = { 
        ...user, 
        error: '獲取詳情失敗，顯示本地資料',
        isLoading: false
      };
    }
  } catch (error) {
    console.error(`獲取用戶(ID: ${user.id})詳情失敗:`, error);
    // 發生錯誤時，將錯誤信息添加到用戶數據中
    currentUserToView.value = { 
      ...user, 
      error: error.message || '獲取詳情失敗',
      isLoading: false
    };
  }
};

const closeViewUserModal = () => {
  isViewUserModalVisible.value = false;
  currentUserToView.value = null;
};

const isExporting = ref(false);

const exportUserData = async () => {
  if (isExporting.value) return;
  isExporting.value = true;
  try {
    const paramsForAllUsers = { ...filters.value }; 
    const response = await userService.getUsers(paramsForAllUsers);
    const usersToExport = response.users;

    if (!usersToExport || usersToExport.length === 0) {
      alert('没有可导出的用户数据。');
      isExporting.value = false;
      return;
    }

    const headers = ['ID', '姓名', '邮箱', '用户类型', '注册日期', '剩余次数', '累计咨询', '状态'];
    const dataForCsv = usersToExport.map(user => ([
      user.id,
      user.name || '',
      user.email || '',
      formatUserType(user.userType), 
      user.registrationDate,
      user.remainingQueries,
      user.totalConsultations,
      formatStatus(user.status) 
    ]));

    const csv = Papa.unparse({
      fields: headers,
      data: dataForCsv
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (err) {
    console.error("Failed to export user data:", err);
    alert(`导出用户数据失败: ${err.message || '未知错误'}`);
  } finally {
    isExporting.value = false;
  }
};

const handleSaveNewUser = async (userData) => {
  try {
    // 確保欄位名稱一致
    const userDataToSave = {
      ...userData,
      // 統一使用 position 字段
      position: userData.position,
      status: userData.status || 'active' // 默認為活躍狀態
    };
    
    await userService.addUser(userDataToSave);
    fetchUsers();
    closeAddUserModal();
    alert('用户添加成功！');
  } catch (err) {
    console.error("添加用户失败:", err);
    alert(`添加用户失败: ${err.message || '未知错误'}`);
  }
};

const handleUpdateUser = async (updatedData) => {
  // 增强安全检查
  const userToEdit = currentUserToEdit.value;
  if (!userToEdit || !userToEdit.id) {
    console.error('handleUpdateUser: 用户数据无效', userToEdit);
    alert('无法更新用户：未选择用户或用户ID缺失。');
    return;
  }
  
  const userId = userToEdit.id; // 提前保存ID
  
  try {
    // 確保欄位名稱一致
    const dataToUpdate = {
      ...updatedData,
      // 統一使用 position 字段
      position: updatedData.position
    };
    
    console.log(`准备更新用户(ID: ${userId})，数据:`, dataToUpdate);
    
    const response = await userService.updateUser(userId, dataToUpdate);
    
    // 使用保存的userId而不是currentUserToEdit.value.id
    if (response) {
      const userData = response.data?.user || response.data || dataToUpdate;
      console.log(`触发用户(ID: ${userId})资料更新事件，数据:`, userData);
      eventService.notifyUserProfileUpdated(userId, userData);
    }
    
    fetchUsers();
    closeEditUserModal();
    alert('用户信息更新成功！');
  } catch (err) {
    console.error("更新用户信息失败:", err);
    alert(`更新用户信息失败: ${err.message || '未知错误'}`);
  }
};

const fetchUsers = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const params = { 
      search: filters.value.searchTerm,
      status: filters.value.status,
      userType: filters.value.userType,
      dateRange: filters.value.dateRange,
      page: currentPage.value,
      limit: itemsPerPage.value,
    };
    
    console.log('發送獲取用戶列表請求，參數:', params);
    const response = await userService.getUsers(params);
    console.log('用戶列表API響應:', response);
    
    // 增加防護處理，確保users和total有正確的默認值
    if (response && Array.isArray(response.users)) {
      users.value = response.users;
      totalUsers.value = response.total || 0;
    } else {
      console.warn('API返回的用戶數據格式異常:', response);
      users.value = [];
      totalUsers.value = 0;
    }
  } catch (err) {
    console.error("獲取用戶列表失敗:", err);
    error.value = err;
    users.value = [];
    totalUsers.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const applyFilters = () => {
  currentPage.value = 1;
  fetchUsers();
};

const resetFilters = () => {
  filters.value = {
    searchTerm: '',
    status: '',
    userType: '',
    dateRange: '',
  };
  currentPage.value = 1;
  fetchUsers();
};

const nextPage = () => {
  if (currentPage.value * itemsPerPage.value < totalUsers.value) {
    currentPage.value++;
    fetchUsers();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchUsers();
  }
};

// 生命周期钩子 - 组件挂载时设置事件监听器并获取用户数据
onMounted(() => {
  console.log('UserManagementView 组件已挂载');
  setupEventListeners(); // 设置事件监听器
  fetchUsers(); // 获取用户数据
});

// 生命周期钩子 - 组件卸载时清理事件监听器
onUnmounted(() => {
  console.log('UserManagementView 组件即将卸载');
  cleanupEventListeners(); // 清理事件监听器
});

const formatUserType = (type) => {
  const types = {
    admin: '管理员',
    hr: 'HR人员',
    employer: '雇主',
    employee: '员工',
  };
  return types[type] || type || '未知';
};

const getUserTypeClass = (type) => {
  const baseClass = 'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full';
  const typeClasses = {
    admin: `${baseClass} bg-purple-100 text-purple-800`,
    hr: `${baseClass} bg-indigo-100 text-indigo-800`,
    employer: `${baseClass} bg-pink-100 text-pink-800`,
    employee: `${baseClass} bg-blue-100 text-blue-800`,
  };
  return typeClasses[type] || `${baseClass} bg-gray-100 text-gray-800`;
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

const viewUser = (user) => { // 修改参数为整个 user 对象
  console.log('View user:', user.id);
  openViewUserModal(user); // 打开查看模态框
};

const editUser = (user) => {
  console.log('Edit user:', user.id);
  openEditUserModal(user);
};

const confirmDeleteUser = async (user) => {
  if (window.confirm(`您确定要删除用户 "${user.name}" (邮箱: ${user.email}) 吗？此操作无法撤销。`)) {
    try {
      await userService.deleteUser(user.id);
      alert('用户已成功删除。');
      fetchUsers(); // 重新加载用户列表
    } catch (err) {
      console.error("删除用户失败:", err);
      alert(`删除用户失败: ${err.message || '未知错误'}`);
    }
  }
};

const toggleUserStatusAction = async (user) => {
  console.log('切换用户状态:', user.id);
  try {
    await userService.toggleUserStatus(user.id);
    fetchUsers();
  } catch (err) {
    console.error("切换用户状态失败:", err);
    alert(`切换用户状态失败: ${err.message || '未知错误'}`);
  }
};

</script>

<style scoped>
/* 如果需要，可以在此处添加特定于此组件的样式 */
</style>
