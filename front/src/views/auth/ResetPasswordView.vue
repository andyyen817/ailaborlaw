<template>
  <!-- 密碼重置頁面 - 桌面版 -->
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Logo和標題 -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 text-blue-600">
          <LogoSvg />
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">設置新密碼</h2>
        <p class="mt-2 text-sm text-gray-600">請為您的賬戶設置一個安全的新密碼</p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-6 shadow-xl rounded-lg sm:px-8">
        <!-- 錯誤提示 -->
        <div v-if="error" class="mb-6 rounded-md bg-red-50 p-4 animate-fadeIn border-l-4 border-red-400">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">重置失敗</h3>
              <div class="mt-1 text-sm text-red-700">
                <p>{{ error }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 成功提示 -->
        <div v-if="resetSuccess" class="mb-6 rounded-md bg-green-50 p-4 animate-fadeIn border-l-4 border-green-400">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-check-circle text-green-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">重置成功</h3>
              <div class="mt-1 text-sm text-green-700">
                <p>密碼重置成功！正在跳轉到登入頁面...</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 重置密碼表單 -->
        <Form @submit="handleResetPassword" class="space-y-6">
          <!-- 新密碼 -->
          <Field name="password" v-slot="{ field, errors }" rules="required|min:8|password">
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">新密碼</label>
              <div class="relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fas fa-lock text-gray-400"></i>
                </div>
                <input 
                  id="password" 
                  v-bind="field" 
                  :type="showPassword ? 'text' : 'password'"
                  class="block w-full pl-10 pr-10 appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-sm transition-all duration-200" 
                  :class="{'border-red-300 focus:border-red-500 focus:ring-red-500': errors.length}"
                  placeholder="請輸入新密碼">
                <!-- 密碼顯示/隱藏圖標 -->
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

          <!-- 確認新密碼 -->
          <Field name="confirmPassword" v-slot="{ field, errors }" rules="required|confirmed:password">
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">確認新密碼</label>
              <div class="relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fas fa-lock text-gray-400"></i>
                </div>
                <input 
                  id="confirmPassword" 
                  v-bind="field" 
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="block w-full pl-10 pr-10 appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-sm transition-all duration-200" 
                  :class="{'border-red-300 focus:border-red-500 focus:ring-red-500': errors.length}"
                  placeholder="請再次輸入新密碼">
                <!-- 密碼顯示/隱藏圖標 -->
                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
              </div>
              <p class="mt-1.5 text-sm text-red-500 h-5" v-if="errors.length">{{ errors[0] }}</p>
            </div>
          </Field>

          <!-- 密碼強度提示 -->
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="fas fa-shield-alt text-blue-600"></i>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800">密碼要求</h3>
                <div class="mt-1 text-sm text-blue-700">
                  <ul class="list-disc pl-4 space-y-1">
                    <li>至少8個字符</li>
                    <li>包含至少一個英文字母</li>
                    <li>包含至少一個數字</li>
                    <li>只能包含英文字母和數字（不區分大小寫）</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- 重置密碼按鈕 -->
          <div>
            <button 
              type="submit" 
              :disabled="loading || resetSuccess" 
              class="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span v-if="loading" class="inline-block mr-2 animate-spin">
                <i class="fas fa-circle-notch"></i>
              </span>
              <span v-else-if="resetSuccess" class="inline-block mr-2">
                <i class="fas fa-check"></i>
              </span>
              <span v-else class="inline-block mr-2">
                <i class="fas fa-key"></i>
              </span>
              {{ loading ? '重置中...' : resetSuccess ? '重置成功' : '重置密碼' }}
            </button>
          </div>
        </Form>

        <!-- 返回登入 -->
        <div class="mt-6 text-center">
          <router-link 
            to="/login" 
            class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
          >
            <i class="fas fa-arrow-left mr-2"></i>
            返回登入頁面
          </router-link>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="mt-6 text-center text-xs text-gray-500">
        <p>© 2023 勞法通AI - 保留所有權利</p>
        <p class="mt-1">台灣專業勞動法規智能諮詢服務</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Form, Field } from 'vee-validate'
import { defineRules } from '@/utils/validation'
import emailVerificationService from '@/services/emailVerificationService'
import LogoSvg from '@/components/LogoSvg.vue'

export default {
  name: 'ResetPasswordView',
  components: {
    Form,
    Field,
    LogoSvg
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    // 響應式數據
    const loading = ref(false)
    const error = ref('')
    const resetSuccess = ref(false)
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const email = ref('')
    const verificationCode = ref('')

    // 生命週期鈎子
    onMounted(() => {
      // 從路由參數獲取信息
      email.value = route.query.email || ''
      verificationCode.value = route.query.code || ''

      // 檢查必要參數
      if (!email.value || !verificationCode.value) {
        error.value = '缺少必要參數，請重新進行密碼重置流程'
        // 延遲跳轉到忘記密碼頁面
        setTimeout(() => {
          router.push('/forgot-password')
        }, 3000)
      }
    })

    // 處理密碼重置
    const handleResetPassword = async (values) => {
      try {
        loading.value = true
        error.value = ''

        // 調用密碼重置API
        const result = await emailVerificationService.resetPassword(
          email.value,
          verificationCode.value,
          values.password
        )

        if (result.success) {
          resetSuccess.value = true

          // 延遲跳轉到登入頁面
          setTimeout(() => {
            router.push({
              path: '/login',
              query: {
                message: 'password_reset_success'
              }
            })
          }, 2000)
        }

      } catch (err) {
        console.error('密碼重置失敗:', err)
        error.value = err.message || '密碼重置失敗，請重試'
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      error,
      resetSuccess,
      showPassword,
      showConfirmPassword,
      handleResetPassword
    }
  },
  created() {
    // 定義驗證規則
    defineRules()
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style> 