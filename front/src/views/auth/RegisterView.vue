<template>
  <!-- 法律主题专业风格容器 -->
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <!-- Logo和標題 -->
      <div class="text-center mb-8">
        <LogoSvg width="80" height="80" class="mx-auto" />
        <h2 class="mt-6 text-3xl font-bold text-gray-900">創建賬戶</h2>
        <p class="mt-2 text-sm text-gray-600">專業諮詢 · 勞資雙贏 · 權益保障</p>
      </div>

      <div class="max-w-md mx-auto px-4">
        <div class="bg-white rounded-lg overflow-hidden shadow-xl border border-gray-100">
          <div class="p-8">
            <!-- 錯誤提示 -->
            <div v-if="error" class="mb-6 rounded-md bg-red-50 p-4 animate-fadeIn border-l-4 border-red-400">
              <div class="flex">
                <div class="flex-shrink-0">
                  <i class="fas fa-exclamation-circle text-red-400"></i>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">註冊錯誤</h3>
                  <div class="mt-1 text-sm text-red-700">
                    <p>{{ error }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 成功提示 -->
            <div v-if="registerSuccess" class="mb-6 rounded-md bg-green-50 p-4 animate-fadeIn border-l-4 border-green-400">
              <div class="flex">
                <div class="flex-shrink-0">
                  <i class="fas fa-check-circle text-green-400"></i>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800">註冊成功！</h3>
                  <div class="mt-1 text-sm text-green-700">
                    <p>正在為您跳轉至登錄頁面...</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 單頁面註冊表單 -->
            <Form @submit="handleRegister" :initial-values="{ terms: false }" class="space-y-5" v-slot="{ meta, values }">
              <!-- 昵称 -->
              <Field name="name" v-slot="{ field, errors }" rules="required">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                  <div class="relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-user text-gray-400"></i>
                    </div>
                    <input 
                      id="name" 
                      v-bind="field" 
                      type="text" 
                      class="block w-full pl-10 appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-sm transition-all duration-200" 
                      :class="{'border-red-300 focus:border-red-500 focus:ring-red-500': errors.length}"
                      placeholder="您的昵称">
                    <div v-if="errors.length" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i class="fas fa-exclamation-circle text-red-500"></i>
                    </div>
                  </div>
                  <p class="mt-1.5 text-sm text-red-500 h-5" v-if="errors.length">{{ errors[0] }}</p>
                </div>
              </Field>

              <!-- 電子郵箱和發送驗證碼 -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">電子郵箱</label>
                <div class="flex space-x-2">
                  <Field name="email" v-slot="{ field, errors }" rules="required|email" class="flex-1">
                    <div class="relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fas fa-envelope text-gray-400"></i>
                      </div>
                      <input 
                        id="email" 
                        v-bind="field" 
                        type="email" 
                        :disabled="verificationSent"
                        class="block w-full pl-10 appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-sm transition-all duration-200 disabled:bg-gray-100" 
                        :class="{'border-red-300 focus:border-red-500 focus:ring-red-500': errors.length}"
                        placeholder="您的電子郵箱"
                        v-model="formData.email">
                      <div v-if="errors.length" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <i class="fas fa-exclamation-circle text-red-500"></i>
                      </div>
                    </div>
                    <p class="mt-1.5 text-sm text-red-500 h-5" v-if="errors.length">{{ errors[0] }}</p>
                  </Field>
                  
                  <button
                    type="button"
                    @click="sendVerificationCode"
                    :disabled="emailSending || countdown > 0 || !formData.email"
                    class="px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    <span v-if="emailSending" class="inline-block mr-1">
                      <i class="fas fa-circle-notch fa-spin"></i>
                    </span>
                    {{ countdown > 0 ? `${countdown}秒` : '發送驗證碼' }}
                  </button>
                </div>
                <p v-if="!verificationSent" class="mt-1 text-xs text-gray-500">我們將向此郵箱發送6位數字驗證碼</p>
              </div>

              <!-- 驗證碼輸入區域 -->
              <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                <Field name="verificationCode" v-slot="{ field, errors }" rules="required|min:6|max:6">
                  <div>
                    <label for="verificationCode" class="block text-sm font-medium text-blue-800 mb-2">驗證碼</label>
                    <input 
                      id="verificationCode" 
                      v-bind="field" 
                      type="text" 
                      maxlength="6"
                      class="block w-full appearance-none rounded-md border border-blue-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-sm text-center text-lg font-semibold tracking-widest" 
                      :class="{'border-red-300 focus:border-red-500 focus:ring-red-500': errors.length}"
                      placeholder="請輸入6位數字驗證碼"
                      v-model="formData.verificationCode">
                    <p v-if="verificationSent" class="mt-2 text-sm text-green-600">
                      ✅ 驗證碼已發送至 <span class="font-medium">{{ formData.email }}</span>，請檢查您的郵箱（包括垃圾郵件夾）
                    </p>
                    <p v-else class="mt-2 text-sm text-gray-600">
                      請先點擊「發送驗證碼」按鈕獲取驗證碼
                    </p>
                    <p v-if="countdown > 0" class="mt-1 text-xs text-blue-600">
                      ⏰ 如需重新發送，請等待 {{ countdown }} 秒
                    </p>
                    <p class="mt-1.5 text-sm text-red-500" v-if="errors.length">{{ errors[0] }}</p>
                  </div>
                </Field>
              </div>

              <!-- 密碼 -->
              <Field name="password" v-slot="{ field, errors }" rules="required|min:8|password">
                <div>
                  <label for="password" class="block text-sm font-medium text-gray-700 mb-1">密碼</label>
                  <div class="relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-lock text-gray-400"></i>
                    </div>
                    <input 
                      id="password" 
                      v-bind="field" 
                      :type="showPassword ? 'text' : 'password'" 
                      @input="updatePasswordStrength"
                      class="block w-full pl-10 pr-10 appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-sm transition-all duration-200" 
                      :class="{'border-red-300 focus:border-red-500 focus:ring-red-500': errors.length}"
                      placeholder="至少8個字符，包含字母和數字"
                      v-model="formData.password">
                    
                    <!-- 顯示/隱藏密碼按鈕 -->
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button 
                        type="button" 
                        @click="showPassword = !showPassword"
                        class="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                    </div>
                  </div>
                  
                  <!-- 密碼強度指示器 -->
                  <div class="mt-2 flex items-center space-x-2">
                    <div class="flex-1">
                      <div class="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          class="h-1.5 rounded-full transition-all duration-300"
                          :class="{
                            'bg-red-500 w-1/3': passwordStrength === 'weak',
                            'bg-yellow-500 w-2/3': passwordStrength === 'medium',
                            'bg-green-500 w-full': passwordStrength === 'strong'
                          }"
                        ></div>
                      </div>
                    </div>
                    <span class="text-xs font-medium"
                      :class="{
                        'text-red-500': passwordStrength === 'weak',
                        'text-yellow-500': passwordStrength === 'medium',
                        'text-green-500': passwordStrength === 'strong'
                      }"
                    >
                      {{ passwordStrengthText }}
                    </span>
                  </div>
                  
                  <p class="mt-1.5 text-sm text-red-500 h-5" v-if="errors.length">{{ errors[0] }}</p>
                </div>
              </Field>

              <!-- 確認密碼 -->
              <Field name="confirmPassword" v-slot="{ field, errors }" rules="required|confirmed:password">
                <div>
                  <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">確認密碼</label>
                  <div class="relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i class="fas fa-lock text-gray-400"></i>
                    </div>
                    <input 
                      id="confirmPassword" 
                      v-bind="field" 
                      type="password"
                      class="block w-full pl-10 appearance-none rounded-md border border-gray-300 px-3 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-sm transition-all duration-200" 
                      :class="{'border-red-300 focus:border-red-500 focus:ring-red-500': errors.length}"
                      placeholder="請再次輸入密碼"
                      v-model="formData.confirmPassword">
                    <div v-if="errors.length" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i class="fas fa-exclamation-circle text-red-500"></i>
                    </div>
                  </div>
                  <p class="mt-1.5 text-sm text-red-500 h-5" v-if="errors.length">{{ errors[0] }}</p>
                </div>
              </Field>

              <!-- 行業和職位信息 -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="industry" class="block text-sm font-medium text-gray-700 mb-1">行業類別</label>
                  <select 
                    id="industry" 
                    v-model="formData.industry"
                    required
                    class="block w-full rounded-md border border-gray-300 px-3 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">選擇行業</option>
                    <option value="製造業">製造業</option>
                    <option value="服務業">服務業</option>
                    <option value="科技業">科技業</option>
                    <option value="金融業">金融業</option>
                    <option value="醫療業">醫療業</option>
                    <option value="教育業">教育業</option>
                    <option value="建築業">建築業</option>
                    <option value="零售業">零售業</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                
                <div>
                  <label for="position" class="block text-sm font-medium text-gray-700 mb-1">職位類型</label>
                  <select 
                    id="position" 
                    v-model="formData.position"
                    required
                    class="block w-full rounded-md border border-gray-300 px-3 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">選擇職位</option>
                    <option value="一般員工">一般員工</option>
                    <option value="主管">主管</option>
                    <option value="經理">經理</option>
                    <option value="總監">總監</option>
                    <option value="自由工作者">自由工作者</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
              </div>

              <!-- 邀請碼 -->
              <div class="border border-dashed border-blue-300 rounded-md p-4 bg-blue-50">
                <Field name="inviteCode" v-slot="{ field }">
                  <div>
                    <label for="inviteCode" class="block text-sm font-medium text-blue-800 mb-1">邀請碼（可選）</label>
                    <div class="relative">
                      <input 
                        id="inviteCode" 
                        v-bind="field" 
                        type="text" 
                        maxlength="20"
                        class="block w-full appearance-none rounded-md border px-3 py-2 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 text-sm transition-all duration-200"
                        :class="{
                          'border-blue-300 focus:border-blue-500 focus:ring-blue-500': !inviteCodeStatus,
                          'border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-500': inviteCodeStatus === 'valid',
                          'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500': inviteCodeStatus === 'invalid'
                        }"
                        placeholder="如果您有邀請碼，請輸入"
                        v-model="formData.inviteCode"
                        @input="handleInviteCodeInput"
                        @blur="validateInviteCode">
                      
                      <!-- 驗證狀態圖標 -->
                      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <div v-if="inviteCodeValidating" class="animate-spin">
                          <i class="fas fa-circle-notch text-blue-500"></i>
                        </div>
                        <i v-else-if="inviteCodeStatus === 'valid'" class="fas fa-check-circle text-green-500"></i>
                        <i v-else-if="inviteCodeStatus === 'invalid'" class="fas fa-times-circle text-red-500"></i>
                      </div>
                    </div>
                    
                    <!-- 邀請碼驗證結果顯示 -->
                    <div class="mt-2">
                      <!-- 默認提示 -->
                      <p v-if="!inviteCodeStatus && !formData.inviteCode" class="text-xs text-blue-600">
                        <i class="fas fa-gift mr-1"></i>
                        輸入邀請碼可獲得額外查詢次數獎勵
                      </p>
                      
                      <!-- 驗證成功 -->
                      <div v-else-if="inviteCodeStatus === 'valid' && inviterInfo" class="text-xs">
                        <div class="flex items-center text-green-600 mb-1">
                          <i class="fas fa-check-circle mr-1"></i>
                          邀請碼有效！
                        </div>
                        <div class="bg-green-50 border border-green-200 rounded p-2">
                          <p class="text-green-800">
                            <i class="fas fa-user mr-1"></i>
                            邀請人：{{ inviterInfo.name }}
                          </p>
                          <p class="text-green-700 text-xs mt-1">
                            <i class="fas fa-gift mr-1"></i>
                            您將獲得額外的查詢次數獎勵！
                          </p>
                        </div>
                      </div>
                      
                      <!-- 驗證失敗 -->
                      <div v-else-if="inviteCodeStatus === 'invalid'" class="text-xs">
                        <div class="flex items-center text-red-600">
                          <i class="fas fa-times-circle mr-1"></i>
                          {{ inviteCodeError || '邀請碼無效或已過期' }}
                        </div>
                      </div>
                    </div>
                  </div>
                </Field>
              </div>

              <!-- 服務條款 -->
              <Field name="terms" v-slot="{ value: termsValue, handleChange, errors }" rules="required" :initial-value="false">
                <div class="flex items-start">
                  <input 
                    id="terms" 
                    type="checkbox"
                    :checked="termsValue === true"
                    @change="handleChange($event.target.checked)"
                    class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    :class="{'border-red-300': errors.length}"
                  >
                  <label for="terms" class="ml-2 block text-sm text-gray-700">
                    我已閱讀並同意 
                    <a href="#" class="text-blue-600 hover:text-blue-500 underline">服務條款</a> 
                    和 
                    <a href="#" class="text-blue-600 hover:text-blue-500 underline">隱私政策</a>
                  </label>
                </div>
                <p class="mt-1 text-sm text-red-500" v-if="errors.length">此欄位為必填欄位</p>
              </Field>

              <!-- 註冊按鈕 -->
              <div>
                <button 
                  type="submit" 
                  :disabled="!meta.valid || loading || !values.name || !values.email || !values.verificationCode || !values.password || !values.confirmPassword || !values.terms || !formData.industry || !formData.position" 
                  class="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-medium text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <span v-if="loading" class="inline-block mr-2 animate-spin">
                    <i class="fas fa-circle-notch"></i>
                  </span>
                  {{ loading ? '註冊中...' : '立即註冊' }}
                </button>
              </div>
            </Form>

            <!-- 登錄鏈接 -->
            <div class="mt-6 text-center text-sm">
              <p class="text-gray-600">
                已有賬戶? 
                <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                  立即登錄
                </router-link>
              </p>
            </div>
          </div>
        </div>
        
        <!-- 註冊福利提示 -->
        <div class="mt-6 bg-white p-4 rounded-md border border-blue-200 shadow-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <i class="fas fa-gift text-blue-600"></i>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-blue-800">註冊福利</h3>
              <div class="mt-2 text-sm text-blue-700">
                <ul class="list-disc pl-5 space-y-1">
                  <li>立即獲得10次免費AI法律咨詢</li>
                  <li>每邀請一位好友註冊，再獲贈3次額外咨詢</li>
                  <li>被邀請人可額外獲得5次咨詢</li>
                  <li>專業真人專家服務優先體驗</li>
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
import { Form, Field } from 'vee-validate'
import { defineRules } from '@/utils/validation'
import emailVerificationService from '@/services/emailVerificationService'
import { inviteService } from '@/services/inviteService'
import userStore from '@/store/userStore'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import LogoSvg from '@/components/LogoSvg.vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'RegisterView',
  components: {
    Form,
    Field,
    LogoSvg
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    // 基本狀態
    const loading = ref(false)
    const emailSending = ref(false)
    const error = ref('')
    const showPassword = ref(false)
    const registerSuccess = ref(false)
    const passwordStrength = ref('weak')
    const verificationSent = ref(false)
    const countdown = ref(0)
    const countdownTimer = ref(null)
    
    // 邀請碼驗證狀態
    const inviteCodeValidating = ref(false)
    const inviteCodeStatus = ref(null) // null, 'valid', 'invalid'
    const inviteCodeError = ref('')
    const inviterInfo = ref(null)
    const inviteCodeDebounceTimer = ref(null)
    

    
    // 表單數據
    const formData = ref({
      name: '',
      email: '',
      verificationCode: '',
      password: '',
      confirmPassword: '',
      industry: '',
      position: '',
      inviteCode: '',
      terms: false
    })



    // 從URL獲取邀請碼參數
    onMounted(() => {
      if (route.query.invite) {
        formData.value.inviteCode = route.query.invite
        console.log('從URL獲取邀請碼:', formData.value.inviteCode)
        // 自動驗證URL中的邀請碼
        validateInviteCode()
      }
    })

    // 清理定時器
    onUnmounted(() => {
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value)
      }
      if (inviteCodeDebounceTimer.value) {
        clearTimeout(inviteCodeDebounceTimer.value)
      }
    })

    // 計算屬性
    const passwordStrengthText = computed(() => {
      switch(passwordStrength.value) {
        case 'weak': return '弱'
        case 'medium': return '中等'
        case 'strong': return '強'
        default: return ''
      }
    })

    // 注意：密碼確認驗證已改為使用標準的 confirmed:password 規則
    
    // 方法
    const updatePasswordStrength = (e) => {
      const password = e.target.value
      if (!password) {
        passwordStrength.value = 'weak'
        return
      }
      
      // 密碼強度評估邏輯
      const hasLetter = /[a-zA-Z]/.test(password)
      const hasNumber = /[0-9]/.test(password)
      const isLongEnough = password.length >= 8
      const hasOnlyAlphaNumeric = /^[a-zA-Z0-9]+$/.test(password)
      
      // 不允許特殊字符
      if (!hasOnlyAlphaNumeric) {
        passwordStrength.value = 'weak'
        return
      }
      
      let score = 0
      if (hasLetter) score++
      if (hasNumber) score++
      if (isLongEnough) score++
      
      if (score <= 1) {
        passwordStrength.value = 'weak'
      } else if (score === 2) {
        passwordStrength.value = 'medium'
      } else {
        passwordStrength.value = 'strong'
      }
    }

    // 發送驗證碼
    const sendVerificationCode = async () => {
      if (!formData.value.email) {
        error.value = '請輸入郵箱地址'
        return
      }
      
      // 檢查是否在倒數計時中
      if (countdown.value > 0) {
        error.value = `請等待 ${countdown.value} 秒後再重新發送`
        return
      }
      
      // 郵箱格式驗證
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.value.email)) {
        error.value = '請輸入有效的郵箱地址'
        return
      }
      
      emailSending.value = true
      error.value = ''
      
      try {
        // 確定驗證類型：邀請註冊使用 invite_confirmation，普通註冊使用 registration
        const verificationType = formData.value.inviteCode && formData.value.inviteCode.trim()
          ? emailVerificationService.EMAIL_VERIFICATION_TYPES.INVITE_CONFIRMATION
          : emailVerificationService.EMAIL_VERIFICATION_TYPES.REGISTRATION
        
        await emailVerificationService.sendEmailVerification(
          formData.value.email,
          verificationType,
          'zh-TW'
        )
        
        verificationSent.value = true
        
        // 啟動60秒倒數計時
        startCountdown(60)
        
        showSuccess('驗證碼已發送，請檢查您的郵箱（包括垃圾郵件夾）')
        
      } catch (err) {
        console.error('發送驗證碼失敗:', err)
        
        error.value = err.message || '發送驗證碼失敗，請重試'
      } finally {
        emailSending.value = false
      }
    }

    // 一次性註冊（使用後端一步式API）
    const handleRegister = async (values) => {
      loading.value = true
      error.value = ''
      
      try {
        // 準備用戶數據，使用vee-validate的values和formData的組合
        const userData = {
          name: values.name || formData.value.name,
          password: values.password || formData.value.password,
          industry: formData.value.industry,
          position: formData.value.position
        }

        // 如果有邀請碼，添加到userData中
        if (values.inviteCode || formData.value.inviteCode) {
          userData.inviteCode = values.inviteCode || formData.value.inviteCode
        }
        
        // 使用後端的一步式驗證並註冊API（支持邀請碼和普通註冊）
        const result = await emailVerificationService.verifyAndRegister(
          values.email || formData.value.email,
          values.verificationCode || formData.value.verificationCode,
          userData
        )
        
        if (result.success) {
          registerSuccess.value = true
          
          // 如果返回了token，自動登錄
          if (result.data && result.data.token) {
            localStorage.setItem('token', result.data.token)
            localStorage.setItem('user', JSON.stringify(result.data.user))
            
            // 處理邀請註冊獎勵
            if (userData.inviteCode) {
              try {
                // 調用邀請註冊處理API
                const inviteResult = await inviteService.processInviteRegistration(userData.inviteCode)
                if (inviteResult.success) {
                  console.log('邀請註冊處理成功:', inviteResult.data)
                }
                
                // 發放註冊獎勵
                const bonusResult = await inviteService.grantRegistrationBonus()
                if (bonusResult.success) {
                  console.log('註冊獎勵發放成功:', bonusResult.data)
                }
              } catch (inviteError) {
                console.error('處理邀請獎勵失敗:', inviteError)
                // 邀請獎勵失敗不影響註冊流程
              }
            }
            
            // 顯示成功信息和邀請獎勵
            let successMessage = `註冊成功！歡迎 ${result.data.user.name}！`
            if (result.data.inviteInfo) {
              successMessage += `\n🎉 邀請獎勵：您獲得了${result.data.inviteInfo.bonusReceived}次額外查詢機會！`
            } else if (userData.inviteCode && inviterInfo.value) {
              successMessage += `\n🎉 感謝 ${inviterInfo.value.name} 的邀請！您已獲得額外的查詢次數獎勵！`
            }
            showSuccess(successMessage)
            
            // 延遲跳轉到主應用
            setTimeout(() => {
              router.push('/')
            }, 3000)
          } else {
            showSuccess('註冊成功！正在跳轉...')
            
            // 延遲跳轉到登錄頁面
            setTimeout(() => {
              router.push('/login?message=registration_success&email=' + encodeURIComponent(formData.value.email))
            }, 2000)
          }
        } else {
          throw new Error(result.message || '註冊失敗')
        }
        
      } catch (err) {
        console.error('註冊失敗:', err)
        
        // 處理不同類型的錯誤
        if (err.message && err.message.includes('已註冊')) {
          error.value = '此郵箱已註冊，請直接登錄'
          setTimeout(() => {
            router.push('/login?email=' + encodeURIComponent(formData.value.email) + '&message=user_exists')
          }, 2000)
        } else if (err.message && err.message.includes('驗證碼')) {
          error.value = '驗證碼錯誤或已過期，請重新獲取驗證碼'
          // 不清除驗證狀態，讓用戶可以重新發送
        } else if (err.message && err.message.includes('邀請碼')) {
          error.value = '邀請碼無效，請檢查邀請碼是否正確'
        } else {
          error.value = err.message || '註冊失敗，請重試'
        }
      } finally {
        loading.value = false
      }
    }

    // 啟動倒數計時器
    const startCountdown = (seconds) => {
      countdown.value = seconds
      
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

    // 顯示成功信息
    const showSuccess = (message) => {
      console.log('Success:', message)
      // 這裡可以添加Toast通知或其他UI反饋
    }

    // 邀請碼輸入處理（防抖）
    const handleInviteCodeInput = () => {
      // 清除之前的驗證狀態
      inviteCodeStatus.value = null
      inviteCodeError.value = ''
      inviterInfo.value = null
      
      // 清除之前的防抖計時器
      if (inviteCodeDebounceTimer.value) {
        clearTimeout(inviteCodeDebounceTimer.value)
      }
      
      // 如果邀請碼為空，直接返回
      if (!formData.value.inviteCode || formData.value.inviteCode.trim() === '') {
        return
      }
      
      // 設置防抖延遲驗證
      inviteCodeDebounceTimer.value = setTimeout(() => {
        validateInviteCode()
      }, 800) // 800ms 防抖延遲
    }

    // 驗證邀請碼
    const validateInviteCode = async () => {
      const inviteCode = formData.value.inviteCode?.trim()
      
      // 如果邀請碼為空，重置狀態
      if (!inviteCode) {
        inviteCodeStatus.value = null
        inviteCodeError.value = ''
        inviterInfo.value = null
        return
      }
      
      // 基本格式驗證
      if (inviteCode.length < 4 || inviteCode.length > 20) {
        inviteCodeStatus.value = 'invalid'
        inviteCodeError.value = '邀請碼長度應為4-20個字符'
        return
      }
      
      inviteCodeValidating.value = true
      inviteCodeStatus.value = null
      
      try {
        const result = await inviteService.validateInviteCode(inviteCode)
        
        if (result.success && result.data.inviter) {
          inviteCodeStatus.value = 'valid'
          inviterInfo.value = result.data.inviter
          inviteCodeError.value = ''
          console.log('邀請碼驗證成功:', result.data.inviter)
        } else {
          inviteCodeStatus.value = 'invalid'
          inviteCodeError.value = result.message || '邀請碼無效或已過期'
          inviterInfo.value = null
        }
      } catch (error) {
        console.error('驗證邀請碼失敗:', error)
        inviteCodeStatus.value = 'invalid'
        inviteCodeError.value = error.message || '驗證邀請碼時發生錯誤'
        inviterInfo.value = null
      } finally {
        inviteCodeValidating.value = false
      }
    }

    return {
      // 狀態
      loading,
      emailSending,
      error,
      showPassword,
      registerSuccess,
      passwordStrength,
      passwordStrengthText,
      verificationSent,
      countdown,
      formData,
      
      // 邀請碼驗證狀態
      inviteCodeValidating,
      inviteCodeStatus,
      inviteCodeError,
      inviterInfo,
      
      // 計算屬性

      
      // 方法
      updatePasswordStrength,
      sendVerificationCode,
      handleRegister,
      handleInviteCodeInput,
      validateInviteCode
    }
  },
  created() {
    // 定義驗證規則
    defineRules()
    
    // 註釋掉自動重定向邏輯，避免干擾註冊流程
    // if (userStore.isAuthenticated.value) {
    //   this.$router.push('/')
    // }
  },
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

/* 驗證碼輸入框樣式優化 */
input[type="text"]:focus {
  transform: scale(1.02);
}

/* 數字輸入框去除上下箭頭 */
input[type="text"]::-webkit-outer-spin-button,
input[type="text"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="text"] {
  -moz-appearance: textfield;
  font-feature-settings: 'tnum'; /* 使用等寬數字 */
}
</style>
