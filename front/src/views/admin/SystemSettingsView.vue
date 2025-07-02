<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h1 class="text-2xl font-semibold text-gray-800 mb-6">系統設定</h1>

    <!-- 邀請與註冊設定 -->
    <div class="mb-6 bg-white p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">邀請與註冊設定</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="defaultFreeQueries" class="block text-sm font-medium text-gray-700 mb-1">新用戶默認免費諮詢次數</label>
          <input type="number" id="defaultFreeQueries" v-model.number="settings.defaultFreeQueries" min="0"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div>
          <label for="inviteBonusQueries" class="block text-sm font-medium text-gray-700 mb-1">邀請成功獎勵諮詢次數 (給邀請人)</label>
          <input type="number" id="inviteBonusQueries" v-model.number="settings.inviteBonusQueries" min="0"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
        </div>
         <div>
          <label for="inviteeBonusQueries" class="block text-sm font-medium text-gray-700 mb-1">被邀請人註冊獎勵諮詢次數</label>
          <input type="number" id="inviteeBonusQueries" v-model.number="settings.inviteeBonusQueries" min="0"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
        </div>
      </div>
      <div class="mt-6 text-right">
        <button @click="saveInviteSettings"
                class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3" />
          </svg>
          保存邀請設定
        </button>
      </div>
    </div>

    <!-- 管理員帳戶管理 -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">管理員帳戶管理</h2>
      
      <!-- 添加管理員表單 -->
      <div class="mb-6 pb-4 border-b">
        <h3 class="text-lg font-medium text-gray-700 mb-2">新增管理員</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label for="newAdminEmail" class="block text-sm font-medium text-gray-700 mb-1">郵箱</label>
            <input type="email" id="newAdminEmail" v-model="newAdmin.email"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="admin@example.com">
          </div>
          <div>
            <label for="newAdminPassword" class="block text-sm font-medium text-gray-700 mb-1">初始密碼</label>
            <input type="password" id="newAdminPassword" v-model="newAdmin.password"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="設置初始密碼">
          </div>
          <div>
            <label for="newAdminRole" class="block text-sm font-medium text-gray-700 mb-1">角色</label>
            <select id="newAdminRole" v-model="newAdmin.role"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white">
              <option value="operator">運營管理員</option>
              <option value="superadmin">超級管理員</option> <!-- 只有超管可以添加超管 -->
            </select>
          </div>
        </div>
        <div class="mt-3 text-right">
          <button @click="addAdminUser" :disabled="!canAddAdminRole"
                  class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm disabled:bg-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            添加管理員
          </button>
          <p v-if="!canAddAdminRole && currentUserRole !== 'superadmin'" class="text-xs text-red-500 mt-1">只有超級管理員才能添加新的超級管理員。</p>
        </div>
      </div>

      <!-- 管理員列表 -->
      <div>
        <h3 class="text-lg font-medium text-gray-700 mb-3">管理員列表</h3>
        <div v-if="isLoadingAdmins" class="text-center py-4">
            <svg class="animate-spin h-6 w-6 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
             <p class="mt-1 text-sm text-gray-500">加載中...</p>
        </div>
        <ul v-else-if="adminUsers.length > 0" class="space-y-3">
          <li v-for="admin in adminUsers" :key="admin.id" 
              class="p-3 border rounded-md bg-gray-50 flex justify-between items-center">
            <div>
              <p class="font-medium text-gray-800">{{ admin.email }}</p>
              <p class="text-xs text-gray-500">角色: {{ getRoleText(admin.role) }} (ID: {{ admin.id }})</p>
            </div>
            <div class="space-x-2">
              <!-- MVP 簡化：修改權限和刪除暫時不做 -->
              <button v-if="canModifyUser(admin)" @click="confirmRemoveAdmin(admin)" title="移除管理員"
                      class="inline-flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 mr-1">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.342.052.682.107 1.022.166m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09.992-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                移除
              </button>
               <span v-else class="text-xs text-gray-400 italic">不可操作</span>
            </div>
          </li>
        </ul>
        <p v-else class="text-gray-500">暫無其他管理員帳戶。</p>
      </div>
    </div>
    
    <!-- 提示消息 -->
    <div v-if="toast.message" 
         :class="['fixed bottom-6 right-6 px-4 py-3 rounded-md shadow-lg text-white', toast.type === 'success' ? 'bg-green-500' : 'bg-red-500']">
      {{ toast.message }}
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { mockUserStore } from '@/store/mockUserStore';
import { inviteService } from '@/services/inviteService';
import authService from '@/services/auth';

const settings = reactive({
  defaultFreeQueries: 10,
  inviteBonusQueries: 10,
  inviteeBonusQueries: 10, 
});

const newAdmin = reactive({
  email: '',
  password: '',
  role: 'operator', // 默認為運營管理員
});

const adminUsers = ref([]);
const isLoadingAdmins = ref(false);
const currentUserRole = ref(''); // 當前登錄管理員的角色

const toast = reactive({
  message: '',
  type: 'success', // 'success' or 'error'
  visible: false,
});

function showToast(message, type = 'success') {
  toast.message = message;
  toast.type = type;
  toast.visible = true;
  setTimeout(() => {
    toast.visible = false;
    toast.message = '';
  }, 3000);
}

// 頁面初始化 - 集成真實API
onMounted(async () => {
  console.log('系統設置頁面初始化...');
  
  // 加載邀請設定 - 集成真實API
  await loadInviteSettings();

  // 加載當前用戶角色
  const currentUser = authService.getCurrentUser();
  currentUserRole.value = currentUser?.role || 'operator';

  // 加載管理員列表
  await loadAdminUsers();
  
  console.log('系統設置頁面初始化完成');
});

// 加載邀請設定 - 集成真實API
async function loadInviteSettings() {
  try {
    console.log('開始載入邀請設定...');
    
    // 調用管理後台API獲取邀請設定
    const response = await inviteService.getInviteSettings();
    
    if (response.success && response.data) {
      const data = response.data;
      settings.defaultFreeQueries = data.defaultFreeQueries || 10;
      settings.inviteBonusQueries = data.inviterBonus || 10;
      settings.inviteeBonusQueries = data.inviteeBonus || 10;
      
      console.log('邀請設定載入成功:', data);
    } else {
      console.warn('邀請設定API返回格式異常，使用mock數據');
      throw new Error('邀請設定API返回格式異常');
    }
    
  } catch (error) {
    console.error('載入邀請設定失敗，降級到mock數據:', error);
    
    // 降級到mock數據
    const savedInviteSettings = mockUserStore.getInviteSettings();
    if (savedInviteSettings) {
      settings.defaultFreeQueries = savedInviteSettings.defaultFreeQueries;
      settings.inviteBonusQueries = savedInviteSettings.inviteBonusQueries;
      settings.inviteeBonusQueries = savedInviteSettings.inviteeBonusQueries;
    }
  }
}

async function loadAdminUsers() {
  isLoadingAdmins.value = true;
  try {
    // 假設 mockUserStore.getAdminUsers() 返回所有管理員用戶列表
    adminUsers.value = await mockUserStore.getAdminUsers();
  } catch (error) {
    console.error("加載管理員列表失敗:", error);
    showToast('加載管理員列表失敗', 'error');
  } finally {
    isLoadingAdmins.value = false;
  }
}

// 保存邀請設定 - 集成真實API
async function saveInviteSettings() {
  try {
    console.log('開始保存邀請設定...', settings);
    
    // 調用管理後台API保存邀請設定
    const response = await inviteService.updateInviteSettings({
      defaultFreeQueries: settings.defaultFreeQueries,
      inviterBonus: settings.inviteBonusQueries,
      inviteeBonus: settings.inviteeBonusQueries
    });
    
    if (response.success) {
      console.log('邀請設定保存成功:', response.data);
      showToast('邀請設定已保存！');
    } else {
      console.warn('邀請設定API保存失敗:', response);
      throw new Error(response.message || '保存失敗');
    }
    
  } catch (error) {
    console.error('保存邀請設定失敗，降級到mock存儲:', error);
    
    // 降級到mock數據保存
    try {
      mockUserStore.saveInviteSettings({ ...settings });
      showToast('邀請設定已保存到本地！');
      console.log('使用mock存儲保存成功');
    } catch (fallbackError) {
      console.error('mock存儲也失敗:', fallbackError);
      showToast('保存邀請設定失敗', 'error');
    }
  }
}

const canAddAdminRole = computed(() => {
    // 只有超級管理員可以添加其他超級管理員
    if (newAdmin.role === 'superadmin') {
        return currentUserRole.value === 'superadmin';
    }
    // 超級管理員和運營管理員（如果未來允許）都可以添加運營管理員
    return true; 
});

async function addAdminUser() {
  if (!newAdmin.email || !newAdmin.password) {
    showToast('郵箱和密碼不能為空！', 'error');
    return;
  }
  if (!canAddAdminRole.value) {
    showToast('權限不足，無法添加此角色的管理員。', 'error');
    return;
  }

  try {
    // 假設 mockUserStore.addAdminUser 處理添加邏輯
    // 它應該檢查郵箱是否已存在，並處理密碼加密等
    await mockUserStore.addAdminUser(newAdmin.email, newAdmin.password, newAdmin.role);
    showToast(`管理員 ${newAdmin.email} (${getRoleText(newAdmin.role)}) 添加成功！`);
    newAdmin.email = '';
    newAdmin.password = '';
    newAdmin.role = 'operator';
    await loadAdminUsers(); // 重新加載列表
  } catch (error) {
    console.error("添加管理員失敗:", error);
    showToast(error.message || '添加管理員失敗', 'error');
  }
}

function getRoleText(role) {
  if (role === 'superadmin') return '超級管理員';
  if (role === 'operator') return '運營管理員';
  return role;
}

function canModifyUser(userToModify) {
  if (currentUserRole.value === 'superadmin') {
    // 超級管理員不能移除自己
    const currentUser = authService.getCurrentUser();
    return userToModify.id !== currentUser?.id;
  }
  // 運營管理員不能操作其他管理員
  return false;
}

async function confirmRemoveAdmin(admin) {
  if (!canModifyUser(admin)) {
    showToast('權限不足。', 'error');
    return;
  }
  if (confirm(`確定要移除管理員 ${admin.email} (${getRoleText(admin.role)}) 嗎？此操作不可撤銷。`)) {
    try {
      await mockUserStore.removeAdminUser(admin.id);
      showToast(`管理員 ${admin.email} 已移除。`);
      await loadAdminUsers();
    } catch (error) {
      console.error("移除管理員失敗:", error);
      showToast(error.message || '移除管理員失敗', 'error');
    }
  }
}

</script>

<style scoped>
/* Tailwind handles most styles */
</style>
