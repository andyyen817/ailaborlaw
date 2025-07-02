<template>
  <!-- 郵箱驗證頁面 - 移動版 -->
  <MobileContainer :showBackButton="true" :backRoute="getBackRoute()">
    <!-- 驗證背景 -->
    <div class="verification-bg"></div>
    
    <!-- 驗證內容 -->
    <div class="verification-container">
      <!-- Logo和標題區域 -->
      <div class="logo-container">
        <div class="mx-auto flex justify-center">
          <LogoSvg width="80" height="80" />
        </div>
        <h1 class="text-2xl font-bold text-white mt-4">勞法通AI</h1>
        <p class="text-blue-100 mt-1">{{ getPageSubtitle() }}</p>
      </div>
      
      <!-- 主要內容卡片 -->
      <div class="form-container">
        <!-- 標題區域 -->
        <div class="text-center mb-6">
          <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <i class="fas fa-envelope text-blue-600 text-2xl"></i>
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">{{ getPageTitle() }}</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            我們已向
            <span class="font-medium text-blue-600 break-all">{{ email }}</span>
            發送了6位數字驗證碼
          </p>
          <p class="text-xs text-gray-500 mt-2">請檢查您的郵箱（包括垃圾郵件資料夾）</p>
        </div>

        <!-- 錯誤提示 -->
        <div v-if="error" class="mb-4 rounded-md bg-red-50 p-3 border-l-4 border-red-400">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">驗證失敗</h3>
              <p class="text-sm text-red-700 mt-1">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- 成功提示 -->
        <div v-if="verifySuccess" class="mb-4 rounded-md bg-green-50 p-3 border-l-4 border-green-400">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-check-circle text-green-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">驗證成功</h3>
              <p class="text-sm text-green-700 mt-1">{{ getSuccessMessage() }}</p>
            </div>
          </div>
        </div>

        <!-- 驗證碼輸入區域 -->
        <div v-if="!verifySuccess" class="space-y-6">
          <!-- 6位數字驗證碼輸入框 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3 text-center">輸入驗證碼</label>
            <div class="flex justify-center space-x-2 mb-4">
              <input
                v-for="(digit, index) in verificationCode"
                :key="index"
                :ref="el => { if (el) codeInputs[index] = el }"
                v-model="verificationCode[index]"
                @input="handleCodeInput(index, $event)"
                @keydown="handleKeyDown(index, $event)"
                @paste="handlePaste($event)"
                @focus="handleInputFocus(index)"
                type="number"
                inputmode="numeric"
                maxlength="1"
                class="w-10 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-colors"
                :class="{
                  'border-red-300 focus:border-red-500 focus:ring-red-500': error,
                  'border-green-300 focus:border-green-500 focus:ring-green-500': verifySuccess
                }"
              />
            </div>
            <p class="text-xs text-gray-500 text-center px-4">請輸入郵箱收到的6位數字驗證碼</p>
          </div>

          <!-- 驗證按鈕 -->
          <button
            @click="handleVerify"
            :disabled="!isCodeComplete || loading"
            class="verify-btn"
            :class="{
              'bg-gray-300 cursor-not-allowed': !isCodeComplete || loading,
              'bg-blue-600 hover:bg-blue-700': isCodeComplete && !loading
            }"
          >
            <span v-if="loading" class="inline-block mr-2">
              <i class="fas fa-circle-notch fa-spin"></i>
            </span>
            {{ loading ? '驗證中...' : '確認驗證' }}
          </button>

          <!-- 重發驗證碼 -->
          <div class="text-center">
            <p class="text-sm text-gray-600 mb-3">沒有收到驗證碼？</p>
            <button
              @click="handleResendCode"
              :disabled="!canResend || resendLoading"
              class="resend-btn"
              :class="{
                'text-blue-600': canResend && !resendLoading,
                'text-gray-400 cursor-not-allowed': !canResend || resendLoading
              }"
            >
              <span v-if="resendLoading" class="inline-block mr-2">
                <i class="fas fa-circle-notch fa-spin"></i>
              </span>
              <i v-else class="fas fa-paper-plane mr-2"></i>
              <span v-if="canResend && !resendLoading">重新發送驗證碼</span>
              <span v-else>{{ countdownText }}</span>
            </button>
          </div>
        </div>

        <!-- 驗證成功後的操作按鈕 -->
        <div v-if="verifySuccess" class="space-y-4">
          <button
            @click="handleContinue"
            class="success-btn"
          >
            <i class="fas fa-arrow-right mr-2"></i>
            {{ getContinueButtonText() }}
          </button>
        </div>

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
                  <li>每60秒只能重發一次</li>
                  <li>如遇到"頻繁發送"提示，說明驗證碼已成功發送</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MobileContainer>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import emailVerificationService from '@/services/emailVerificationService'
import MobileContainer from '@/components/layout/MobileContainer.vue'
import LogoSvg from '@/components/LogoSvg.vue'

export default {
  name: 'MobileEmailVerificationView',
  components: {
    MobileContainer,
    LogoSvg
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    // 響應式數據
    const email = ref('')
    const verificationType = ref('')
    const inviteCode = ref('')
    const verificationCode = ref(['', '', '', '', '', ''])
    const codeInputs = ref([])
    const loading = ref(false)
    const resendLoading = ref(false)
    const error = ref('')
    const verifySuccess = ref(false)
    const countdown = ref(0)
    const countdownTimer = ref(null)

    // 計算屬性
    const isCodeComplete = computed(() => {
      return verificationCode.value.every(digit => digit.length === 1)
    })

    const canResend = computed(() => {
      return countdown.value === 0 && !resendLoading.value
    })

    const countdownText = computed(() => {
      if (resendLoading.value) {
        return '發送中...'
      }
      if (countdown.value > 0) {
        return `${countdown.value}秒後可重發`
      }
      return '重新發送驗證碼'
    })

    // 生命週期鈎子
    onMounted(async () => {
      // 從路由參數獲取信息
      email.value = route.query.email || ''
      verificationType.value = route.query.type || emailVerificationService.EMAIL_VERIFICATION_TYPES.REGISTRATION
      inviteCode.value = route.query.inviteCode || ''

      // 檢查必要參數
      if (!email.value) {
        error.value = '缺少郵箱參數，請重新操作'
        return
      }

      // 自動發送驗證碼
      await sendVerificationCode()

      // 聚焦到第一個輸入框（移動端延遲聚焦避免鍵盤彈出問題）
      setTimeout(() => {
        if (codeInputs.value[0]) {
          codeInputs.value[0].focus()
        }
      }, 500)
    })

    onUnmounted(() => {
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value)
      }
    })

    // 方法
    const getPageTitle = () => {
      switch (verificationType.value) {
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.REGISTRATION:
          return '驗證您的郵箱'
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.PASSWORD_RESET:
          return '重置密碼驗證'
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.INVITE_CONFIRMATION:
          return '確認邀請註冊'
        default:
          return '郵箱驗證'
      }
    }

    const getPageSubtitle = () => {
      switch (verificationType.value) {
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.REGISTRATION:
          return '完成註冊，開始您的法律諮詢之旅'
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.PASSWORD_RESET:
          return '安全重置您的登入密碼'
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.INVITE_CONFIRMATION:
          return '確認邀請，獲得額外諮詢次數'
        default:
          return '驗證您的身份'
      }
    }

    const getSuccessMessage = () => {
      switch (verificationType.value) {
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.REGISTRATION:
          return '郵箱驗證成功！正在跳轉到登入頁面...'
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.PASSWORD_RESET:
          return '驗證成功！正在跳轉到密碼重置頁面...'
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.INVITE_CONFIRMATION:
          return '邀請確認成功！正在跳轉到登入頁面...'
        default:
          return '驗證成功！'
      }
    }

    const getContinueButtonText = () => {
      switch (verificationType.value) {
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.REGISTRATION:
          return '前往登入'
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.PASSWORD_RESET:
          return '設置新密碼'
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.INVITE_CONFIRMATION:
          return '前往登入'
        default:
          return '繼續'
      }
    }

    const getBackRoute = () => {
      switch (verificationType.value) {
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.REGISTRATION:
          return '/mobile/register'
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.PASSWORD_RESET:
          return '/mobile/forgot-password'
        default:
          return '/mobile/login'
      }
    }

    const sendVerificationCode = async () => {
      try {
        resendLoading.value = true
        error.value = ''

        await emailVerificationService.sendEmailVerification(
          email.value,
          verificationType.value,
          'zh-TW'
        )

        // 啟動倒數計時器
        startCountdown()
      } catch (err) {
        console.error('發送驗證碼失敗:', err)
        
        // 檢查是否是頻率限制錯誤
        if (err.code === 'RATE_LIMITED' || err.message.includes('頻繁')) {
          // 如果是頻率限制，說明之前已經發送過，啟動倒數計時器
          error.value = `驗證碼已發送到您的郵箱，請等待 ${err.remainingTime || 60} 秒後可重新發送`
          startCountdown()
        } else {
          error.value = err.message || '發送驗證碼失敗'
        }
      } finally {
        resendLoading.value = false
      }
    }

    const handleInputFocus = (index) => {
      // 移動端優化：聚焦時清除錯誤信息
      if (error.value) {
        error.value = ''
      }
    }

    const handleCodeInput = (index, event) => {
      const value = event.target.value.replace(/\D/g, '') // 只允許數字
      
      if (value.length > 1) {
        // 處理粘貼多個字符的情況
        const digits = value.split('').slice(0, 6)
        digits.forEach((digit, i) => {
          if (index + i < 6) {
            verificationCode.value[index + i] = digit
          }
        })
        
        // 聚焦到最後一個輸入的位置或最後一個輸入框
        const nextIndex = Math.min(index + digits.length, 5)
        nextTick(() => {
          if (codeInputs.value[nextIndex]) {
            codeInputs.value[nextIndex].focus()
          }
        })
      } else {
        verificationCode.value[index] = value
        
        // 自動跳轉到下一個輸入框
        if (value && index < 5) {
          nextTick(() => {
            if (codeInputs.value[index + 1]) {
              codeInputs.value[index + 1].focus()
            }
          })
        }
      }

      // 清除錯誤信息
      if (error.value) {
        error.value = ''
      }
    }

    const handleKeyDown = (index, event) => {
      // 處理退格鍵
      if (event.key === 'Backspace' && !verificationCode.value[index] && index > 0) {
        nextTick(() => {
          if (codeInputs.value[index - 1]) {
            codeInputs.value[index - 1].focus()
          }
        })
      }
      
      // 處理左右箭頭鍵（移動端可能用不到，但保留兼容性）
      if (event.key === 'ArrowLeft' && index > 0) {
        nextTick(() => {
          if (codeInputs.value[index - 1]) {
            codeInputs.value[index - 1].focus()
          }
        })
      }
      
      if (event.key === 'ArrowRight' && index < 5) {
        nextTick(() => {
          if (codeInputs.value[index + 1]) {
            codeInputs.value[index + 1].focus()
          }
        })
      }

      // 處理Enter鍵
      if (event.key === 'Enter' && isCodeComplete.value) {
        // 移動端鍵盤收起，然後執行驗證
        event.target.blur()
        setTimeout(() => {
          handleVerify()
        }, 100)
      }
    }

    const handlePaste = (event) => {
      event.preventDefault()
      const pastedData = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
      
      if (pastedData.length > 0) {
        const digits = pastedData.split('')
        digits.forEach((digit, i) => {
          if (i < 6) {
            verificationCode.value[i] = digit
          }
        })
        
        // 聚焦到最後一個輸入的位置
        const lastIndex = Math.min(digits.length - 1, 5)
        nextTick(() => {
          if (codeInputs.value[lastIndex]) {
            codeInputs.value[lastIndex].focus()
          }
        })
        
        // 清除錯誤信息
        if (error.value) {
          error.value = ''
        }
      }
    }

    const handleVerify = async () => {
      try {
        loading.value = true
        error.value = ''

        const code = verificationCode.value.join('')
        
        // 根據驗證類型調用不同的API
        let result
        if (verificationType.value === emailVerificationService.EMAIL_VERIFICATION_TYPES.INVITE_CONFIRMATION && inviteCode.value) {
          result = await emailVerificationService.verifyInviteRegistration(
            email.value,
            code,
            inviteCode.value
          )
        } else {
          result = await emailVerificationService.verifyEmail(
            email.value,
            code,
            verificationType.value
          )
        }

        if (result.success) {
          verifySuccess.value = true
          
          // 移動端延遲稍長，給用戶更多時間看到成功信息
          setTimeout(() => {
            handleContinue()
          }, 2500)
        }
      } catch (err) {
        console.error('驗證失敗:', err)
        error.value = err.message || '驗證碼錯誤，請重新輸入'
        
        // 清空驗證碼並聚焦到第一個輸入框
        verificationCode.value = ['', '', '', '', '', '']
        nextTick(() => {
          if (codeInputs.value[0]) {
            codeInputs.value[0].focus()
          }
        })
      } finally {
        loading.value = false
      }
    }

    const handleResendCode = async () => {
      if (!canResend.value) return
      
      try {
        resendLoading.value = true
        error.value = ''

        await emailVerificationService.resendVerification(
          email.value,
          verificationType.value
        )

        // 重新啟動倒數計時器
        startCountdown()
        
        // 清空當前輸入的驗證碼
        verificationCode.value = ['', '', '', '', '', '']
        
        // 聚焦到第一個輸入框
        await nextTick()
        if (codeInputs.value[0]) {
          codeInputs.value[0].focus()
        }
      } catch (err) {
        console.error('重發驗證碼失敗:', err)
        
        // 檢查是否是頻率限制錯誤
        if (err.code === 'RATE_LIMITED' || err.message.includes('頻繁')) {
          // 如果是頻率限制，說明之前已經發送過，更新倒數計時器
          error.value = `驗證碼已重新發送，請等待 ${err.remainingTime || 60} 秒後可再次重發`
          startCountdown()
        } else {
          error.value = err.message || '重發驗證碼失敗'
        }
      } finally {
        resendLoading.value = false
      }
    }

    const startCountdown = () => {
      countdown.value = 60
      
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value)
      }
      
      countdownTimer.value = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(countdownTimer.value)
          countdownTimer.value = null
        }
      }, 1000)
    }

    const handleContinue = () => {
      switch (verificationType.value) {
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.REGISTRATION:
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.INVITE_CONFIRMATION:
          router.push('/mobile/login')
          break
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.PASSWORD_RESET:
          router.push({
            name: 'MobileResetPassword',
            query: {
              email: email.value,
              code: verificationCode.value.join('')
            }
          })
          break
        default:
          router.push('/mobile')
      }
    }

    return {
      // 數據
      email,
      verificationType,
      inviteCode,
      verificationCode,
      codeInputs,
      loading,
      resendLoading,
      error,
      verifySuccess,
      
      // 計算屬性
      isCodeComplete,
      canResend,
      countdownText,
      
      // 方法
      getPageTitle,
      getPageSubtitle,
      getSuccessMessage,
      getContinueButtonText,
      getBackRoute,
      handleInputFocus,
      handleCodeInput,
      handleKeyDown,
      handlePaste,
      handleVerify,
      handleResendCode,
      handleContinue
    }
  }
}
</script>

<style scoped>
.verification-bg {
  background-image: linear-gradient(135deg, #3b82f6, #2563eb);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 30%;
  z-index: 0;
}

.verification-container {
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

/* 驗證碼輸入框樣式 */
input[type="number"] {
  -webkit-appearance: none;
  -moz-appearance: textfield;
  font-feature-settings: 'tnum'; /* 使用等寬數字 */
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* 按鈕樣式 */
.verify-btn {
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

.resend-btn {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.2s;
  background: transparent;
  border: 1px solid #e5e7eb;
}

.resend-btn:not(:disabled):hover {
  background: #f8fafc;
}

.success-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  color: white;
  background: #16a34a;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 52px;
}

.success-btn:hover {
  background: #15803d;
}

/* 移動端優化 */
@media (max-width: 640px) {
  .form-container {
    padding: 20px;
    margin: 0 4px;
  }
  
  .verification-container {
    padding: 16px;
  }
  
  /* 優化驗證碼輸入框在小屏上的間距 */
  .verification-code-inputs {
    gap: 8px;
  }
  
  input[type="number"] {
    width: 40px;
    height: 48px;
    font-size: 18px;
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