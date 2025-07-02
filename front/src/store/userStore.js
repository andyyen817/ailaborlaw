/**
 * 用戶資料存儲模塊
 * 使用Vue Composition API管理用戶狀態
 */
import { ref, computed, watch } from 'vue';
import authService from '@/services/auth';

// 用戶資料響應式引用
const userData = ref(null);
const isLoading = ref(false);
const error = ref(null);

// 初始化用戶資料
function initUserData() {
  // 嘗試從認證服務獲取當前用戶
  const currentUser = authService.getCurrentUser();
  userData.value = currentUser;
}

// 用戶狀態計算屬性
const isAuthenticated = computed(() => {
  return !!userData.value && authService.isAuthenticated();
});

const isAdmin = computed(() => {
  return isAuthenticated.value && userData.value.userType === 'admin';
});

// 更新用戶資料
async function updateUserData(newData) {
  try {
    isLoading.value = true;
    error.value = null;
    
    // 調用API更新用戶資料
    const response = await authService.updateProfile(newData);
    
    // 更新本地存儲的用戶資料
    if (response.success && response.data) {
      userData.value = response.data;
    }
    
    return response;
  } catch (err) {
    error.value = err.message || '更新用戶資料失敗';
    throw err;
  } finally {
    isLoading.value = false;
  }
}

// 刷新用戶資料
async function refreshUserData() {
  try {
    isLoading.value = true;
    error.value = null;
    
    if (!isAuthenticated.value) {
      return null;
    }
    
    // 從服務器獲取最新用戶資料
    const user = await authService.refreshUserDataAsync(userData.value?.id);
    
    if (user) {
      userData.value = user;
    }
    
    return user;
  } catch (err) {
    error.value = err.message || '獲取用戶資料失敗';
    console.error('刷新用戶資料失敗:', err);
    return null;
  } finally {
    isLoading.value = false;
  }
}

// 清除用戶資料
function clearUserData() {
  userData.value = null;
  error.value = null;
}

// 設置監聽器，當認證狀態改變時更新用戶資料
watch(isAuthenticated, (newValue) => {
  if (!newValue) {
    clearUserData();
  }
});

// 初始化
initUserData();

export default {
  userData,
  isLoading,
  error,
  isAuthenticated,
  isAdmin,
  updateUserData,
  refreshUserData,
  clearUserData
}; 