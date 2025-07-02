<template>
  <!-- 郵箱驗證頁面 - 桌面版 -->
  <div class="min-h-screen bg-gradient-to-br from-white to-blue-50 flex flex-col justify-center relative overflow-hidden">
    <!-- 背景圖案 -->
    <div class="absolute inset-0 z-0 overflow-hidden">
      <img src="@/assets/bg-pattern.svg" alt="" class="w-full h-full object-cover">
    </div>

    <div class="relative z-10 py-12">
      <!-- 頂部 LOGO 區域 -->
      <div class="flex justify-center mb-6">
        <div class="text-center">
          <div class="inline-flex justify-center items-center mb-3">
            <LogoSvg width="64" height="64" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900">勞法通AI</h1>
          <p class="text-sm text-gray-600 mt-1">{{ getPageSubtitle() }}</p>
        </div>
      </div>

      <!-- 主要內容區域 -->
      <div class="max-w-md mx-auto px-4">
        <div class="bg-white rounded-lg overflow-hidden shadow-xl border border-gray-100">
          <div class="p-8">
            <!-- 標題區域 -->
            <div class="text-center mb-6">
              <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <i class="fas fa-envelope text-blue-600 text-2xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ getPageTitle() }}</h2>
              <p class="text-sm text-gray-600">
                我們已向
                <span class="font-medium text-blue-600">{{ email }}</span>
                發送了6位數字驗證碼
              </p>
              <p class="text-xs text-gray-500 mt-1">請檢查您的郵箱（包括垃圾郵件資料夾）</p>
            </div>

            <!-- 錯誤提示 -->
            <div v-if="error" class="mb-6 rounded-md bg-red-50 p-4 animate-fadeIn border-l-4 border-red-400">
              <div class="flex">
                <div class="flex-shrink-0">
                  <i class="fas fa-exclamation-circle text-red-400"></i>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">驗證失敗</h3>
                  <div class="mt-1 text-sm text-red-700">
                    <p>{{ error }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 成功提示 -->
            <div v-if="verifySuccess" class="mb-6 rounded-md bg-green-50 p-4 animate-fadeIn border-l-4 border-green-400">
              <div class="flex">
                <div class="flex-shrink-0">
                  <i class="fas fa-check-circle text-green-400"></i>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800">驗證成功</h3>
                  <div class="mt-1 text-sm text-green-700">
                    <p>{{ getSuccessMessage() }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 驗證碼輸入區域 -->
            <div v-if="!verifySuccess" class="space-y-6">
              <!-- 6位數字驗證碼輸入框 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">輸入驗證碼</label>
                <div class="flex justify-center space-x-2 mb-4">
                  <input
                    v-for="(digit, index) in verificationCode"
                    :key="index"
                    :ref="el => { if (el) codeInputs[index] = el }"
                    v-model="verificationCode[index]"
                    @input="handleCodeInput(index, $event)"
                    @keydown="handleKeyDown(index, $event)"
                    @paste="handlePaste($event)"
                    type="text"
                    maxlength="1"
                    class="w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                    :class="{
                      'border-red-300 focus:border-red-500 focus:ring-red-500': error,
                      'border-green-300 focus:border-green-500 focus:ring-green-500': verifySuccess
                    }"
                  />
                </div>
                <p class="text-xs text-gray-500 text-center">請輸入郵箱收到的6位數字驗證碼</p>
              </div>

              <!-- 驗證按鈕 -->
              <button
                @click="handleVerify"
                :disabled="!isCodeComplete || loading"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="loading" class="inline-block mr-2">
                  <i class="fas fa-circle-notch fa-spin"></i>
                </span>
                {{ loading ? '驗證中...' : '確認驗證' }}
              </button>

              <!-- 重發驗證碼 -->
              <div class="text-center">
                <p class="text-sm text-gray-600 mb-2">沒有收到驗證碼？</p>
                <button
                  @click="handleResendCode"
                  :disabled="!canResend || resendLoading"
                  class="inline-flex items-center text-sm font-medium transition-colors"
                  :class="{
                    'text-blue-600 hover:text-blue-500': canResend && !resendLoading,
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
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <i class="fas fa-arrow-right mr-2"></i>
                {{ getContinueButtonText() }}
              </button>
            </div>

            <!-- 返回鏈接 -->
            <div class="mt-6 text-center">
              <button
                @click="handleGoBack"
                class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <i class="fas fa-arrow-left mr-2"></i>
                返回上一頁
              </button>
            </div>
          </div>
        </div>

        <!-- 幫助信息 -->
        <div class="mt-6 bg-white p-4 rounded-md border border-gray-200 shadow-sm">
          <div class="flex">
            <div class="flex-shrink-0">
              <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <i class="fas fa-info-circle text-blue-600"></i>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-800">常見問題</h3>
              <div class="mt-2 text-sm text-gray-600">
                <ul class="list-disc pl-5 space-y-1">
                  <li>驗證碼有效期為15分鐘，請及時輸入</li>
                  <li>如未收到郵件，請檢查垃圾郵件資料夾</li>
                  <li>每60秒只能重發一次驗證碼</li>
                  <li>如遇到"頻繁發送"提示，說明驗證碼已成功發送</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部信息 -->
        <div class="mt-6 text-center text-xs text-gray-500">
          <p>© 2025 勞法通AI - 保留所有權利</p>
          <p class="mt-1">台灣專業勞動法規智能諮詢服務</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import emailVerificationService from '@/services/emailVerificationService'
import LogoSvg from '@/components/LogoSvg.vue'

export default {
  name: 'EmailVerificationView',
  components: {
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
        const minutes = Math.floor(countdown.value / 60)
        const seconds = countdown.value % 60
        if (minutes > 0) {
          return `${minutes}分${seconds.toString().padStart(2, '0')}秒後可重發`
        } else {
          return `${seconds}秒後可重發`
        }
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

      // 聚焦到第一個輸入框
      await nextTick()
      if (codeInputs.value[0]) {
        codeInputs.value[0].focus()
      }
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
      
      // 處理左右箭頭鍵
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
        handleVerify()
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
          
          // 延遲跳轉
          setTimeout(() => {
            handleContinue()
          }, 2000)
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
      // 設定重發驗證碼的倒數時間（固定60秒）
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
          router.push('/login')
          break
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.PASSWORD_RESET:
          router.push({
            name: 'ResetPassword',
            query: {
              email: email.value,
              code: verificationCode.value.join('')
            }
          })
          break
        default:
          router.push('/')
      }
    }

    const handleGoBack = () => {
      switch (verificationType.value) {
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.REGISTRATION:
          router.push('/register')
          break
        case emailVerificationService.EMAIL_VERIFICATION_TYPES.PASSWORD_RESET:
          router.push('/forgot-password')
          break
        default:
          router.go(-1)
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
      handleCodeInput,
      handleKeyDown,
      handlePaste,
      handleVerify,
      handleResendCode,
      handleContinue,
      handleGoBack
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

/* 驗證碼輸入框樣式 */
input[type="text"] {
  -webkit-appearance: none;
  -moz-appearance: textfield;
}

input[type="text"]::-webkit-outer-spin-button,
input[type="text"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style> 