<template>
  <!-- 忘記密碼頁面 - 移動版 -->
  <MobileContainer :showBackButton="true" backRoute="/mobile/login">
    <!-- 背景 -->
    <div class="forgot-password-bg"></div>
    
    <!-- 內容 -->
    <div class="forgot-password-container">
      <!-- Logo和標題區域 -->
      <div class="logo-container">
        <div class="mx-auto flex justify-center">
          <LogoSvg width="80" height="80" />
        </div>
        <h1 class="text-2xl font-bold text-white mt-4">勞法通AI</h1>
        <p class="text-blue-100 mt-1">重置您的登入密碼</p>
      </div>
      
      <!-- 主要內容卡片 -->
      <div class="form-container">
        <!-- 標題區域 -->
        <div class="text-center mb-6">
          <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <i class="fas fa-key text-blue-600 text-2xl"></i>
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">忘記密碼</h2>
          <p class="text-sm text-gray-600 leading-relaxed px-4">
            請輸入您註冊時使用的電子郵箱地址，我們將發送6位數字驗證碼幫助您重置密碼
          </p>
        </div>

        <!-- 錯誤提示 -->
        <div v-if="error" class="mb-4 rounded-md bg-red-50 p-3 border-l-4 border-red-400">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">發送失敗</h3>
              <p class="text-sm text-red-700 mt-1">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- 成功提示 -->
        <div v-if="sendSuccess" class="mb-4 rounded-md bg-green-50 p-3 border-l-4 border-green-400">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-check-circle text-green-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">發送成功</h3>
              <p class="text-sm text-green-700 mt-1">驗證碼已發送至您的郵箱，正在跳轉到驗證頁面...</p>
            </div>
          </div>
        </div>

        <!-- 忘記密碼表單 -->
        <Form @submit="handleForgotPassword" class="space-y-6">
          <!-- 電子郵箱 -->
          <Field name="email" v-slot="{ field, errors }" rules="required|email">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">電子郵箱</label>
              <div class="relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fas fa-envelope text-gray-400"></i>
                </div>
                <input 
                  id="email" 
                  v-bind="field" 
                  type="email" 
                  inputmode="email"
                  class="block w-full pl-10 appearance-none rounded-md border border-gray-300 px-3 py-4 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-base transition-all duration-200" 
                  :class="{'border-red-300 focus:border-red-500 focus:ring-red-500': errors.length}"
                  placeholder="您的電子郵箱地址">
                <div v-if="errors.length" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <i class="fas fa-exclamation-circle text-red-500"></i>
                </div>
              </div>
              <p class="mt-2 text-sm text-red-500" v-if="errors.length">{{ errors[0] }}</p>
            </div>
          </Field>

          <!-- 發送驗證碼按鈕 -->
          <button 
            type="submit" 
            :disabled="loading || sendSuccess" 
            class="send-btn"
            :class="{
              'bg-gray-300 cursor-not-allowed': loading || sendSuccess,
              'bg-blue-600 hover:bg-blue-700': !loading && !sendSuccess
            }"
          >
            <span v-if="loading" class="inline-block mr-2">
              <i class="fas fa-circle-notch fa-spin"></i>
            </span>
            <span v-else-if="sendSuccess" class="inline-block mr-2">
              <i class="fas fa-check"></i>
            </span>
            <span v-else class="inline-block mr-2">
              <i class="fas fa-paper-plane"></i>
            </span>
            {{ loading ? '發送中...' : sendSuccess ? '發送成功' : '發送驗證碼' }}
          </button>
        </Form>

        <!-- 幫助信息 -->
        <div class="mt-6 bg-gray-50 p-4 rounded-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <i class="fas fa-info-circle text-blue-600 text-sm"></i>
              </div>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-gray-800">溫馨提示</h3>
              <div class="mt-1 text-xs text-gray-600">
                <ul class="list-disc pl-4 space-y-0.5">
                  <li>驗證碼有效期為15分鐘</li>
                  <li>請檢查垃圾郵件資料夾</li>
                  <li>確保輸入正確的註冊郵箱</li>
                  <li>如未收到郵件，請稍後重試</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 返回登入 -->
        <div class="mt-6 text-center">
          <router-link 
            to="/mobile/login" 
            class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <i class="fas fa-arrow-left mr-2"></i>
            返回登入頁面
          </router-link>
        </div>
      </div>
    </div>
  </MobileContainer>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Form, Field } from 'vee-validate'
import { defineRules } from '@/utils/validation'
import emailVerificationService from '@/services/emailVerificationService'
import MobileContainer from '@/components/layout/MobileContainer.vue'
import LogoSvg from '@/components/LogoSvg.vue'

export default {
  name: 'MobileForgotPasswordView',
  components: {
    Form,
    Field,
    MobileContainer,
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
            name: 'MobileEmailVerification',
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
.forgot-password-bg {
  background-image: linear-gradient(135deg, #3b82f6, #2563eb);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 30%;
  z-index: 0;
}

.forgot-password-container {
  position: relative;
  z-index: 1;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.logo-container {
  text-align: center;
  margin-top: 50px;
  margin-bottom: 20px;
}

.form-container {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.send-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 52px;
}

/* 移動端優化 */
@media (max-width: 640px) {
  .form-container {
    padding: 20px;
    margin: 0 4px;
  }
  
  .forgot-password-container {
    padding: 16px;
  }
}

/* 動畫效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-container {
  animation: fadeIn 0.3s ease-out;
}
</style> 