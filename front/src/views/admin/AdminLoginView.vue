<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        后台管理系统登录
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleAdminLogin">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              邮箱
            </label>
            <div class="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                v-model="email"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              密码
            </label>
            <div class="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                v-model="password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          
          <!-- 錯誤提示 -->
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative text-sm">
            {{ errorMessage }}
          </div>

          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                登录中...
              </span>
              <span v-else>登录</span>
            </button>
          </div>
        </form>
        
        <!-- 登入提示 -->
        <div class="mt-4 text-sm text-center text-gray-600">
          <p>管理員帳號：test@ailaborlaw.com</p>
          <p>管理員密碼：Test1234（區分大小寫）</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import adminAuthService from '@/services/adminAuth';

export default {
  name: 'AdminLoginView',
  setup() {
    const email = ref('');
    const password = ref('');
    const router = useRouter();
    const errorMessage = ref('');
    const isLoading = ref(false);

    const handleAdminLogin = async () => {
      errorMessage.value = ''; // 清除之前的錯誤
      isLoading.value = true;
      
      console.log('Admin Login Attempt:', {
        email: email.value,
        password: password.value,
      });
      
      try {
        // 使用專用的管理員認證服務
        const response = await adminAuthService.login(email.value, password.value);
        
        if (response && response.success) {
          // 檢查是否成功認證
          if (adminAuthService.isAuthenticated()) {
            // 登入成功，跳轉到管理員儀表板
            router.push({ name: 'adminDashboard' });
          } else {
            errorMessage.value = '登入失敗，請檢查帳號密碼';
          }
        } else {
          errorMessage.value = response ? response.message : '登入失敗，請檢查帳號密碼';
        }
      } catch (error) {
        console.error('管理员登录请求出错:', error);
        errorMessage.value = error.message || '登入過程發生錯誤，請稍後再試';
      } finally {
        isLoading.value = false;
      }
    };

    return {
      email,
      password,
      handleAdminLogin,
      errorMessage,
      isLoading
    };
  },
};
</script>

<style scoped>
/* 如果需要，可以在此处添加特定于此组件的样式 */
</style>
