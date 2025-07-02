<template>
  <!-- 忘記密碼頁面 - 桌面版 -->
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Logo和標題 -->
      <div class="text-center">
        <div class="mx-auto h-16 w-16 text-blue-600">
          <LogoSvg />
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">忘記密碼</h2>
        <p class="mt-2 text-sm text-gray-600">輸入您的電子郵箱，我們將發送驗證碼幫助您重置密碼</p>
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
              <h3 class="text-sm font-medium text-red-800">發送失敗</h3>
              <div class="mt-1 text-sm text-red-700">
                <p>{{ error }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 成功提示 -->
        <div v-if="sendSuccess" class="mb-6 rounded-md bg-green-50 p-4 animate-fadeIn border-l-4 border-green-400">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-check-circle text-green-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">發送成功</h3>
              <div class="mt-1 text-sm text-green-700">
                <p>驗證碼已發送至您的郵箱，正在跳轉到驗證頁面...</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 忘記密碼表單 -->
        <Form @submit="handleForgotPassword" class="space-y-6">
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
                  placeholder="請輸入您註冊時使用的電子郵箱">
                <div v-if="errors.length" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <i class="fas fa-exclamation-circle text-red-500"></i>
                </div>
              </div>
              <p class="mt-1.5 text-sm text-red-500 h-5" v-if="errors.length">{{ errors[0] }}</p>
            </div>
          </Field>

          <!-- 發送驗證碼按鈕 -->
          <div>
            <button 
              type="submit" 
              :disabled="loading || sendSuccess" 
              class="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span v-if="loading" class="inline-block mr-2 animate-spin">
                <i class="fas fa-circle-notch"></i>
              </span>
              <span v-else-if="sendSuccess" class="inline-block mr-2">
                <i class="fas fa-check"></i>
              </span>
              <span v-else class="inline-block mr-2">
                <i class="fas fa-paper-plane"></i>
              </span>
              {{ loading ? '發送中...' : sendSuccess ? '發送成功' : '發送驗證碼' }}
            </button>
          </div>
        </Form>

        <!-- 幫助信息 -->
        <div class="mt-8 bg-blue-50 p-4 rounded-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <i class="fas fa-info-circle text-blue-600 text-sm"></i>
              </div>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">溫馨提示</h3>
              <div class="mt-1 text-sm text-blue-700">
                <ul class="list-disc pl-4 space-y-1">
                  <li>請確保輸入的是您註冊時使用的電子郵箱</li>
                  <li>驗證碼將在15分鐘內有效</li>
                  <li>請檢查垃圾郵件資料夾</li>
                  <li>如未收到郵件，請稍後重試</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Form, Field } from 'vee-validate'
import { defineRules } from '@/utils/validation'
import emailVerificationService from '@/services/emailVerificationService'
import LogoSvg from '@/components/LogoSvg.vue'

export default {
  name: 'ForgotPasswordView',
  components: {
    Form,
    Field,
    LogoSvg
  },
  setup() {
    const router = useRouter()
    
    // 響應式數據
    const loading = ref(false)
    const error = ref('')
    const sendSuccess = ref(false)

    // 處理忘記密碼請求
    const handleForgotPassword = async (values) => {
      try {
        loading.value = true
        error.value = ''

        // 發送密碼重置驗證碼
        await emailVerificationService.sendPasswordReset(values.email, 'zh-TW')

        sendSuccess.value = true

        // 延遲跳轉到驗證頁面
        setTimeout(() => {
          router.push({
            name: 'EmailVerification',
            query: {
              email: values.email,
              type: emailVerificationService.EMAIL_VERIFICATION_TYPES.PASSWORD_RESET
            }
          })
        }, 2000)

      } catch (err) {
        console.error('發送密碼重置驗證碼失敗:', err)
        error.value = err.message || '發送失敗，請稍後重試'
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      error,
      sendSuccess,
      handleForgotPassword
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