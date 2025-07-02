<template>
  <!-- 密碼重置頁面 - 移動版 -->
  <MobileContainer :showBackButton="true" backRoute="/mobile/login">
    <!-- 背景 -->
    <div class="reset-password-bg"></div>
    
    <!-- 內容 -->
    <div class="reset-password-container">
      <!-- Logo和標題區域 -->
      <div class="logo-container">
        <div class="mx-auto flex justify-center">
          <LogoSvg width="80" height="80" />
        </div>
        <h1 class="text-2xl font-bold text-white mt-4">勞法通AI</h1>
        <p class="text-blue-100 mt-1">設置您的新密碼</p>
      </div>
      
      <!-- 主要內容卡片 -->
      <div class="form-container">
        <!-- 標題區域 -->
        <div class="text-center mb-6">
          <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <i class="fas fa-key text-blue-600 text-2xl"></i>
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">設置新密碼</h2>
          <p class="text-sm text-gray-600 leading-relaxed px-2">
            請為您的賬戶設置一個安全的新密碼
          </p>
        </div>

        <!-- 錯誤提示 -->
        <div v-if="error" class="mb-4 rounded-md bg-red-50 p-3 border-l-4 border-red-400">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">重置失敗</h3>
              <p class="text-sm text-red-700 mt-1">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- 成功提示 -->
        <div v-if="resetSuccess" class="mb-4 rounded-md bg-green-50 p-3 border-l-4 border-green-400">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-check-circle text-green-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">重置成功</h3>
              <p class="text-sm text-green-700 mt-1">密碼重置成功！正在跳轉到登入頁面...</p>
            </div>
          </div>
        </div>

        <!-- 重置密碼表單 -->
        <Form @submit="handleResetPassword" class="space-y-6">
          <!-- 新密碼 -->
          <Field name="password" v-slot="{ field, errors }" rules="required|min:8|password">
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">新密碼</label>
              <div class="relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fas fa-lock text-gray-400"></i>
                </div>
                <input 
                  id="password" 
                  v-bind="field" 
                  :type="showPassword ? 'text' : 'password'"
                  class="block w-full pl-10 pr-12 appearance-none rounded-md border border-gray-300 px-3 py-4 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-base transition-all duration-200" 
                  :class="{'border-red-300 focus:border-red-500 focus:ring-red-500': errors.length}"
                  placeholder="請輸入新密碼">
                <!-- 密碼顯示/隱藏圖標 -->
                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="text-gray-400 hover:text-gray-500 focus:outline-none p-1"
                  >
                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
              </div>
              <p class="mt-2 text-sm text-red-500" v-if="errors.length">{{ errors[0] }}</p>
            </div>
          </Field>

          <!-- 確認新密碼 -->
          <Field name="confirmPassword" v-slot="{ field, errors }" rules="required|confirmed:password">
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">確認新密碼</label>
              <div class="relative rounded-md shadow-sm">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fas fa-lock text-gray-400"></i>
                </div>
                <input 
                  id="confirmPassword" 
                  v-bind="field" 
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="block w-full pl-10 pr-12 appearance-none rounded-md border border-gray-300 px-3 py-4 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-base transition-all duration-200" 
                  :class="{'border-red-300 focus:border-red-500 focus:ring-red-500': errors.length}"
                  placeholder="請再次輸入新密碼">
                <!-- 密碼顯示/隱藏圖標 -->
                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="text-gray-400 hover:text-gray-500 focus:outline-none p-1"
                  >
                    <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
              </div>
              <p class="mt-2 text-sm text-red-500" v-if="errors.length">{{ errors[0] }}</p>
            </div>
          </Field>

          <!-- 密碼強度提示 -->
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="flex">
              <div class="flex-shrink-0">
                <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <i class="fas fa-shield-alt text-blue-600 text-sm"></i>
                </div>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800">密碼要求</h3>
                <div class="mt-1 text-xs text-blue-700">
                  <ul class="list-disc pl-4 space-y-0.5">
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
          <button 
            type="submit" 
            :disabled="loading || resetSuccess" 
            class="reset-btn"
            :class="{
              'bg-gray-300 cursor-not-allowed': loading || resetSuccess,
              'bg-blue-600 hover:bg-blue-700': !loading && !resetSuccess
            }"
          >
            <span v-if="loading" class="inline-block mr-2">
              <i class="fas fa-circle-notch fa-spin"></i>
            </span>
            <span v-else-if="resetSuccess" class="inline-block mr-2">
              <i class="fas fa-check"></i>
            </span>
            <span v-else class="inline-block mr-2">
              <i class="fas fa-key"></i>
            </span>
            {{ loading ? '重置中...' : resetSuccess ? '重置成功' : '重置密碼' }}
          </button>
        </Form>

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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Form, Field } from 'vee-validate'
import { defineRules } from '@/utils/validation'
import emailVerificationService from '@/services/emailVerificationService'
import MobileContainer from '@/components/layout/MobileContainer.vue'
import LogoSvg from '@/components/LogoSvg.vue'

export default {
  name: 'MobileResetPasswordView',
  components: {
    Form,
    Field,
    MobileContainer,
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
          router.push('/mobile/forgot-password')
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
              path: '/mobile/login',
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
.reset-password-bg {
  background-image: linear-gradient(135deg, #3b82f6, #2563eb);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 30%;
  z-index: 0;
}

.reset-password-container {
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

.reset-btn {
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
  
  .reset-password-container {
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