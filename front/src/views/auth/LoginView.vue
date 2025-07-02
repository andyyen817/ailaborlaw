<template>
  <!-- 法律主题专业风格容器 -->
  <div class="min-h-screen bg-gradient-to-br from-white to-blue-50 flex flex-col justify-center relative overflow-hidden">
    <!-- 背景图案 -->
    <div class="absolute inset-0 z-0 overflow-hidden">
      <img src="@/assets/bg-pattern.svg" alt="" class="w-full h-full object-cover">
    </div>

    <div class="relative z-10">
      <!-- 頂部 LOGO 區域 -->
      <div class="flex justify-center mb-8">
        <div class="text-center">
          <div class="inline-flex justify-center items-center mb-3">
            <LogoSvg width="64" height="64" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900">勞法通AI</h1>
          <p class="text-sm text-gray-600 mt-1">台灣專業勞動法規智能諮詢服務</p>
        </div>
      </div>

      <!-- 主要內容區域 -->
      <div class="w-full max-w-md mx-auto px-4">
        <div class="bg-white rounded-lg overflow-hidden shadow-xl border border-gray-100">
          <div class="p-8">
            <!-- 頁面標題 -->
            <div class="text-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-1">用戶登錄</h2>
              <p class="text-sm text-gray-600">專業諮詢 · 勞資雙贏 · 權益保障</p>
            </div>

            <!-- 錯誤提示 -->
            <div v-if="error" class="mb-6 rounded-md bg-red-50 p-4 animate-fadeIn border-l-4 border-red-400">
              <div class="flex">
                <div class="flex-shrink-0">
                  <i class="fas fa-exclamation-circle text-red-400"></i>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">登錄失敗</h3>
                  <div class="mt-1 text-sm text-red-700">
                    <p>{{ error }}</p>
                  </div>
                </div>
              </div>
            </div>
              
            <!-- 成功提示 -->
            <div v-if="loginSuccess" class="mb-6 rounded-md bg-green-50 p-4 animate-fadeIn border-l-4 border-green-400">
              <div class="flex">
                <div class="flex-shrink-0">
                  <i class="fas fa-check-circle text-green-400"></i>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800">{{ getSuccessTitle() }}</h3>
                  <div class="mt-1 text-sm text-green-700">
                    <p>{{ getSuccessMessage() }}</p>
                  </div>
                </div>
              </div>
            </div>
              
            <!-- 登錄表單 -->
            <Form @submit="handleLogin" :initial-values="{ email: initialEmail }" class="space-y-5">
              <!-- 電子郵箱 -->
              <Field name="email" v-slot="{ field, errors }" rules="required|email">
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1">電子郵箱</label>
                  <div class="relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-envelope text-gray-400"></i>
                    </div>
                    <input 
                      id="email" 
                      v-bind="field" 
                      type="email" 
                      class="block w-full pl-10 appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-sm transition-all duration-200" 
                      :class="{'border-red-300 focus:border-red-500 focus:ring-red-500': errors.length}"
                      placeholder="您的電子郵箱">
                    <div v-if="errors.length" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i class="fas fa-exclamation-circle text-red-500"></i>
                    </div>
                  </div>
                  <p class="mt-1.5 text-sm text-red-500 h-5" v-if="errors.length">{{ errors[0] }}</p>
                </div>
              </Field>

              <!-- 密碼 -->
              <Field name="password" v-slot="{ field, errors }" rules="required|min:8">
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label for="password" class="block text-sm font-medium text-gray-700">密碼</label>
                    <div class="text-sm">
                      <router-link to="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500 hover:underline">忘記密碼?</router-link>
                    </div>
                  </div>
                  <div class="relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-lock text-gray-400"></i>
                    </div>
                    <input 
                      id="password" 
                      v-bind="field" 
                      :type="showPassword ? 'text' : 'password'"
                      class="block w-full pl-10 appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-sm transition-all duration-200" 
                      :class="{'border-red-300 focus:border-red-500 focus:ring-red-500': errors.length}"
                      placeholder="您的密碼">
                    <!-- 密码显示/隐藏图标 -->
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                      <button
                        type="button"
                        @click="showPassword = !showPassword"
                        class="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                    </div>
                  </div>
                  <p class="mt-1.5 text-sm text-red-500 h-5" v-if="errors.length">{{ errors[0] }}</p>
                </div>
              </Field>

              <!-- 記住我 -->
              <div class="flex items-center">
                <input id="remember-me" v-model="rememberMe" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                <label for="remember-me" class="ml-2 block text-sm text-gray-700">記住我</label>
              </div>

              <!-- 登錄按鈕 -->
              <div>
                <button 
                  type="submit" 
                  :disabled="loading || loginSuccess" 
                  class="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <span v-if="loading" class="inline-block mr-2 animate-spin">
                    <i class="fas fa-circle-notch"></i>
                  </span>
                  <span v-else-if="loginSuccess" class="inline-block mr-2">
                    <i class="fas fa-check"></i>
                  </span>
                  {{ loading ? '正在登錄...' : loginSuccess ? '登錄成功' : '登錄' }}
                </button>
              </div>
            </Form>

            <!-- 分隔線 -->
            <!-- <div class="my-6">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-200"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="bg-white px-2 text-gray-500">或者</span>
                </div>
              </div>
            </div> -->

            <!-- LINE登錄 -->
            <!-- <div>
              <button 
                class="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white py-3 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                <i class="fab fa-line text-green-600 text-lg mr-2"></i>
                使用LINE賬戶登錄
              </button>
            </div> -->
              
            <!-- 註冊鏈接 -->
            <div class="mt-6 text-center text-sm">
              <p class="text-gray-600">
                還沒有賬戶? 
                <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                  立即註冊
                </router-link>
              </p>
            </div>
          </div>
        </div>
          
        <!-- 底部信息 -->
        <div class="mt-6 text-center text-xs text-gray-500">
          <p>© 2023 勞法通AI - 保留所有權利</p>
          <p class="mt-1">台灣專業勞動法規智能諮詢服務</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Form, Field } from 'vee-validate'
import { defineRules } from '@/utils/validation'
import authService from '@/services/auth'
import userStore from '@/store/userStore'
import { ref } from 'vue'
import LogoSvg from '@/components/LogoSvg.vue'

export default {
  name: 'LoginView',
  components: {
    Form,
    Field,
    LogoSvg
  },
  setup() {
    const loading = ref(false)
    const error = ref('')
    const rememberMe = ref(false)
    const showPassword = ref(false)
    const loginSuccess = ref(false)
    const isPasswordResetSuccess = ref(false)
    const initialEmail = ref('')
    
    return {
      loading,
      error,
      rememberMe,
      showPassword,
      loginSuccess,
      isPasswordResetSuccess,
      initialEmail
    }
  },
  created() {
    // 定義驗證規則
    defineRules()
    
    // 如果用戶已經登入，直接跳轉到首頁
    if (userStore.isAuthenticated.value) {
      this.$router.push('/')
    }
    
    // 檢查URL參數中是否有認證錯誤信息或成功信息
    const authError = this.$route.query.auth_error
    const message = this.$route.query.message
    const email = this.$route.query.email
    
    // 如果URL中有郵箱地址，自動填入
    if (email) {
      this.initialEmail = decodeURIComponent(email)
    }
    
    if (message === 'registration_success') {
      // 顯示註冊成功提示
      this.loginSuccess = true
      this.error = '' // 確保沒有錯誤信息
      setTimeout(() => {
        this.loginSuccess = false
      }, 4000)
    } else if (message === 'user_exists') {
      // 用戶已存在，可以直接登錄
      this.error = '該郵箱已完成註冊，請直接登錄'
      setTimeout(() => {
        this.error = ''
      }, 4000)
    } else if (message === 'password_reset_success') {
      // 顯示密碼重置成功提示
      this.isPasswordResetSuccess = true
      this.loginSuccess = true
      this.error = '' // 確保沒有錯誤信息
      setTimeout(() => {
        this.loginSuccess = false
        this.isPasswordResetSuccess = false
      }, 4000)
    } else if (authError === 'expired') {
      this.error = '您的登入已過期，請重新登入'
    } else if (authError === 'required') {
      this.error = '請先登入以訪問該頁面'
    } else if (authError === 'admin_required') {
      this.error = '該頁面需要管理員權限，請使用管理員賬戶登入'
    } else if (authError === 'permission_denied') {
      this.error = '您沒有訪問該頁面的權限'
    } else if (authError === 'invalid_token') {
      this.error = '您的認證令牌無效，請重新登入'
    } else if (authError === 'system_error') {
      this.error = '系統暫時無法處理您的請求，請稍後再試'
    }
  },
  methods: {
    async handleLogin(values) {
      try {
        this.loading = true
        this.error = ''
        
        // 調用認證服務進行登入
        const response = await authService.login(
          values.email,
          values.password
        )
        
        // 登入成功
        if (response.success && response.data) {
          // 顯示登入成功動畫
          this.loginSuccess = true
          
          // 延遲重定向，給用戶一點視覺反饋時間
          setTimeout(() => {
            // 獲取登入後的重定向路徑
            const redirectPath = this.$route.query.redirect || '/'
            this.$router.push(redirectPath)
          }, 1000)
        } else {
          this.error = '登入失敗，請重試'
          this.loading = false
        }
      } catch (error) {
        // 顯示錯誤信息
        this.error = error.message || '登入失敗，請重試'
        console.error('登入失敗:', error)
        this.loading = false
      }
    },
    
    getSuccessTitle() {
      return this.isPasswordResetSuccess ? '密碼重置成功' : '登錄成功'
    },
    
    getSuccessMessage() {
      if (this.isPasswordResetSuccess) {
        return '您的密碼已成功重置，現在可以使用新密碼登入了'
      } else if (this.$route.query.message === 'registration_success') {
        return '註冊成功！現在可以使用您的郵箱和密碼登入了'
      } else {
        return '正在為您跳轉至首頁...'
      }
    }
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}
</style>
