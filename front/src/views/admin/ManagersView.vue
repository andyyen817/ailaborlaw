<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-6">管理員管理</h1>
    
    <!-- 只有超級管理員才能訪問此頁面 -->
    <AdminRoleCheck role="super_admin">
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <!-- 創建管理員表單 -->
        <div class="px-4 py-5 sm:p-6 border-b border-gray-200">
          <h3 class="text-lg font-medium leading-6 text-gray-900">
            建立新管理員
          </h3>
          
          <div class="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">
                用戶名
              </label>
              <input
                type="text"
                name="username"
                id="username"
                v-model="newManager.username"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                郵箱
              </label>
              <input
                type="email"
                name="email"
                id="email"
                v-model="newManager.email"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                密碼
              </label>
              <input
                type="password"
                name="password"
                id="password"
                v-model="newManager.password"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div class="mt-4">
            <label for="role" class="block text-sm font-medium text-gray-700">
              角色
            </label>
            <select
              id="role"
              name="role"
              v-model="newManager.role"
              class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="admin">普通管理員</option>
              <option value="super_admin">超級管理員</option>
            </select>
          </div>
          
          <div class="mt-4">
            <button
              type="button"
              @click="createManager"
              :disabled="isCreating"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span v-if="isCreating">創建中...</span>
              <span v-else>創建管理員</span>
            </button>
          </div>
          
          <!-- 錯誤信息 -->
          <div v-if="error" class="mt-4 text-sm text-red-600">
            {{ error }}
          </div>
        </div>
        
        <!-- 管理員列表 -->
        <div class="mt-6">
          <div v-if="isLoading" class="p-4 text-center text-gray-500">
            載入中...
          </div>
          
          <div v-else-if="managers.length === 0" class="p-4 text-center text-gray-500">
            尚無管理員記錄
          </div>
          
          <table v-else class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用戶名
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  郵箱
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  角色
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="manager in managers" :key="manager.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ manager.username }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ manager.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span 
                    :class="{
                      'bg-purple-100 text-purple-800': manager.role === 'super_admin',
                      'bg-blue-100 text-blue-800': manager.role === 'admin'
                    }"
                    class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ manager.role === 'super_admin' ? '超級管理員' : '普通管理員' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span 
                    :class="{
                      'bg-green-100 text-green-800': manager.status === 'active',
                      'bg-red-100 text-red-800': manager.status === 'inactive'
                    }"
                    class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ manager.status === 'active' ? '啟用' : '停用' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      @click="toggleManagerStatus(manager)"
                      :disabled="isUpdating"
                      class="text-indigo-600 hover:text-indigo-900"
                    >
                      {{ manager.status === 'active' ? '停用' : '啟用' }}
                    </button>
                    <button
                      @click="showResetPassword(manager)"
                      :disabled="isUpdating"
                      class="text-indigo-600 hover:text-indigo-900"
                    >
                      重設密碼
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- 重設密碼對話框 -->
      <div v-if="showResetPasswordDialog" class="fixed z-10 inset-0 overflow-y-auto">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity" aria-hidden="true">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div>
              <div class="mt-3 text-center sm:mt-5">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  重設密碼
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    為 {{ selectedManager?.username }} 重設密碼
                  </p>
                </div>
              </div>
              
              <div class="mt-4">
                <label for="new-password" class="block text-sm font-medium text-gray-700">
                  新密碼
                </label>
                <input
                  type="password"
                  id="new-password"
                  v-model="newPassword"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="button"
                @click="resetPassword"
                :disabled="isResetting"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
              >
                {{ isResetting ? '重設中...' : '確認重設' }}
              </button>
              <button
                type="button"
                @click="closeResetPasswordDialog"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminRoleCheck>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import AdminRoleCheck from '@/components/admin/AdminRoleCheck.vue';

export default {
  name: 'ManagersView',
  components: {
    AdminRoleCheck
  },
  setup() {
    const managers = ref([]);
    const isLoading = ref(true);
    const isCreating = ref(false);
    const isUpdating = ref(false);
    const isResetting = ref(false);
    const error = ref('');
    
    const newManager = ref({
      username: '',
      email: '',
      password: '',
      role: 'admin'
    });
    
    const selectedManager = ref(null);
    const newPassword = ref('');
    const showResetPasswordDialog = ref(false);
    
    // 獲取管理員列表
    const fetchManagers = async () => {
      try {
        isLoading.value = true;
        const response = await api.get('/admin/managers');
        
        if (response.success && response.data) {
          managers.value = response.data.managers || [];
        } else {
          error.value = response.message || '獲取管理員列表失敗';
        }
      } catch (err) {
        error.value = err.message || '獲取管理員列表發生錯誤';
        console.error('獲取管理員列表錯誤:', err);
      } finally {
        isLoading.value = false;
      }
    };
    
    // 創建新管理員
    const createManager = async () => {
      try {
        error.value = '';
        isCreating.value = true;
        
        // 驗證表單
        if (!newManager.value.username || !newManager.value.email || !newManager.value.password) {
          error.value = '請完成所有必填欄位';
          return;
        }
        
        const response = await api.post('/admin/managers', newManager.value);
        
        if (response.success) {
          // 清空表單
          newManager.value = {
            username: '',
            email: '',
            password: '',
            role: 'admin'
          };
          
          // 重新獲取列表
          await fetchManagers();
        } else {
          error.value = response.message || '創建管理員失敗';
        }
      } catch (err) {
        error.value = err.message || '創建管理員發生錯誤';
        console.error('創建管理員錯誤:', err);
      } finally {
        isCreating.value = false;
      }
    };
    
    // 切換管理員狀態
    const toggleManagerStatus = async (manager) => {
      try {
        isUpdating.value = true;
        error.value = '';
        
        const newStatus = manager.status === 'active' ? 'inactive' : 'active';
        const response = await api.patch(`/admin/managers/${manager.id}/status`, {
          status: newStatus
        });
        
        if (response.success) {
          // 更新本地狀態
          manager.status = newStatus;
        } else {
          error.value = response.message || '更新管理員狀態失敗';
        }
      } catch (err) {
        error.value = err.message || '更新管理員狀態發生錯誤';
        console.error('更新管理員狀態錯誤:', err);
      } finally {
        isUpdating.value = false;
      }
    };
    
    // 顯示重設密碼對話框
    const showResetPassword = (manager) => {
      selectedManager.value = manager;
      newPassword.value = '';
      showResetPasswordDialog.value = true;
    };
    
    // 關閉重設密碼對話框
    const closeResetPasswordDialog = () => {
      showResetPasswordDialog.value = false;
      selectedManager.value = null;
      newPassword.value = '';
    };
    
    // 重設管理員密碼
    const resetPassword = async () => {
      if (!selectedManager.value || !newPassword.value) {
        return;
      }
      
      try {
        isResetting.value = true;
        error.value = '';
        
        const response = await api.post(`/admin/managers/${selectedManager.value.id}/reset-password`, {
          password: newPassword.value
        });
        
        if (response.success) {
          closeResetPasswordDialog();
        } else {
          error.value = response.message || '重設密碼失敗';
        }
      } catch (err) {
        error.value = err.message || '重設密碼發生錯誤';
        console.error('重設密碼錯誤:', err);
      } finally {
        isResetting.value = false;
      }
    };
    
    // 初始加載
    onMounted(() => {
      fetchManagers();
    });
    
    return {
      managers,
      isLoading,
      isCreating,
      isUpdating,
      isResetting,
      error,
      newManager,
      fetchManagers,
      createManager,
      toggleManagerStatus,
      showResetPassword,
      closeResetPasswordDialog,
      resetPassword,
      selectedManager,
      newPassword,
      showResetPasswordDialog
    };
  }
};
</script> 