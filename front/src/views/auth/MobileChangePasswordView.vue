<template>
  <div class="mobile-change-password-container">
    <!-- 導航欄 -->
    <div class="mobile-nav">
      <button class="back-btn" @click="$router.push('/mobile-profile')">
        <i class="fas fa-chevron-left"></i>
      </button>
      <h1 class="page-title">更改密碼</h1>
      <div class="nav-spacer"></div>
    </div>
    
    <div class="content-container">
      <div v-if="error" class="error-message">
        <i class="fas fa-exclamation-circle"></i> {{ error }}
      </div>
      
      <div v-if="success" class="success-message">
        <i class="fas fa-check-circle"></i> {{ success }}
      </div>
      
      <form @submit.prevent="handleSubmit" class="password-form">
        <div class="form-group">
          <label for="currentPassword">當前密碼</label>
          <div class="password-input">
            <input 
              :type="showCurrentPassword ? 'text' : 'password'" 
              id="currentPassword" 
              v-model="currentPassword" 
              class="form-control"
              required
              placeholder="請輸入當前密碼"
            />
            <button 
              type="button" 
              class="toggle-password" 
              @click="showCurrentPassword = !showCurrentPassword"
            >
              <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label for="newPassword">新密碼</label>
          <div class="password-input">
            <input 
              :type="showNewPassword ? 'text' : 'password'" 
              id="newPassword" 
              v-model="newPassword" 
              class="form-control"
              required
              minlength="8"
              placeholder="請輸入新密碼"
            />
            <button 
              type="button" 
              class="toggle-password" 
              @click="showNewPassword = !showNewPassword"
            >
              <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <div class="password-strength" :class="passwordStrengthClass">
            密碼強度: {{ passwordStrengthText }}
          </div>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">確認新密碼</label>
          <div class="password-input">
            <input 
              :type="showConfirmPassword ? 'text' : 'password'" 
              id="confirmPassword" 
              v-model="confirmPassword" 
              class="form-control"
              required
              minlength="8"
              placeholder="請再次輸入新密碼"
            />
            <button 
              type="button" 
              class="toggle-password" 
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <div v-if="passwordMismatch" class="error-message-inline">
            密碼不匹配
          </div>
        </div>
        
        <div class="password-requirements">
          <h4>密碼要求：</h4>
          <ul>
            <li :class="{ 'requirement-met': passwordLength }">至少 8 個字符</li>
            <li :class="{ 'requirement-met': passwordHasLetter }">包含至少一個字母</li>
            <li :class="{ 'requirement-met': passwordHasNumber }">包含至少一個數字</li>
          </ul>
        </div>
        
        <div class="form-actions">
          <button 
            type="submit" 
            class="submit-btn" 
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading">處理中...</span>
            <span v-else>更新密碼</span>
          </button>
          
          <button 
            type="button" 
            class="cancel-btn" 
            @click="$router.push('/mobile-profile')"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import userService from '@/services/userService'

export default {
  name: 'MobileChangePasswordView',
  setup() {
    const router = useRouter()
    const currentPassword = ref('')
    const newPassword = ref('')
    const confirmPassword = ref('')
    const error = ref('')
    const success = ref('')
    const loading = ref(false)
    
    // 密碼顯示控制
    const showCurrentPassword = ref(false)
    const showNewPassword = ref(false)
    const showConfirmPassword = ref(false)
    
    // 密碼強度檢查
    const passwordLength = computed(() => newPassword.value.length >= 8)
    const passwordHasLetter = computed(() => /[a-zA-Z]/.test(newPassword.value))
    const passwordHasNumber = computed(() => /[0-9]/.test(newPassword.value))
    
    const passwordStrength = computed(() => {
      // 只檢查符合新規則的密碼強度：英文字母+數字，不分大小寫
      if (!newPassword.value) return 0
      
      const hasOnlyAlphaNumeric = /^[a-zA-Z0-9]+$/.test(newPassword.value)
      if (!hasOnlyAlphaNumeric) return 0 // 包含不允許字符則強度為0
      
      let strength = 0
      if (passwordLength.value) strength++
      if (passwordHasLetter.value) strength++
      if (passwordHasNumber.value) strength++
      if (newPassword.value.length >= 12) strength++ // 長度獎勵
      
      return strength
    })
    
    const passwordStrengthText = computed(() => {
      const strength = passwordStrength.value
      if (strength <= 1) return '非常弱'
      if (strength === 2) return '弱'
      if (strength === 3) return '中等'
      if (strength === 4) return '強'
      return '非常強'
    })
    
    const passwordStrengthClass = computed(() => {
      const strength = passwordStrength.value
      if (strength <= 1) return 'very-weak'
      if (strength === 2) return 'weak'
      if (strength === 3) return 'medium'
      if (strength === 4) return 'strong'
      return 'very-strong'
    })
    
    const passwordMismatch = computed(() => {
      if (!confirmPassword.value) return false
      return newPassword.value !== confirmPassword.value
    })
    
    const isFormValid = computed(() => {
      return (
        currentPassword.value && 
        newPassword.value &&
        confirmPassword.value && 
        !passwordMismatch.value &&
        passwordLength.value &&
        passwordHasLetter.value &&
        passwordHasNumber.value
      )
    })
    
    const handleSubmit = async () => {
      if (!isFormValid.value) return
      
      loading.value = true
      error.value = ''
      success.value = ''
      
      try {
        await userService.updatePassword(currentPassword.value, newPassword.value)
        
        success.value = '密碼已成功更新'
        
        // 成功後重置表單
        currentPassword.value = ''
        newPassword.value = ''
        confirmPassword.value = ''
        
        // 3秒後返回個人資料頁面
        setTimeout(() => {
          router.push('/mobile-profile')
        }, 3000)
      } catch (err) {
        console.error('更新密碼失敗:', err)
        
        // 處理特定的錯誤情況
        if (err.status === 401) {
          error.value = '當前密碼不正確'
        } else {
          error.value = err.message || '更新密碼失敗，請稍後再試'
        }
      } finally {
        loading.value = false
      }
    }
    
    return {
      currentPassword,
      newPassword,
      confirmPassword,
      error,
      success,
      loading,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      passwordLength,
      passwordHasLetter,
      passwordHasNumber,
      passwordStrengthText,
      passwordStrengthClass,
      passwordMismatch,
      isFormValid,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.mobile-change-password-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f9fafb;
}

.mobile-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #3b82f6;
  padding: 0.5rem;
  cursor: pointer;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
}

.nav-spacer {
  width: 1.5rem; /* 平衡左側的返回按鈕 */
}

.content-container {
  flex: 1;
  padding: 1rem;
}

.error-message {
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #fee2e2;
  color: #b91c1c;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.error-message-inline {
  color: #b91c1c;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.success-message {
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #d1fae5;
  color: #065f46;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.375rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.password-input {
  position: relative;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.form-control:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  font-size: 0.875rem;
}

.password-strength {
  margin-top: 0.375rem;
  font-size: 0.75rem;
}

.very-weak {
  color: #ef4444;
}

.weak {
  color: #f59e0b;
}

.medium {
  color: #10b981;
}

.strong {
  color: #3b82f6;
}

.very-strong {
  color: #6366f1;
}

.password-requirements {
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  font-size: 0.75rem;
}

.password-requirements h4 {
  margin-top: 0;
  margin-bottom: 0.375rem;
  font-size: 0.75rem;
  color: #374151;
}

.password-requirements ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #6b7280;
}

.password-requirements li {
  margin-bottom: 0.25rem;
}

.requirement-met {
  color: #10b981;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.submit-btn, .cancel-btn {
  padding: 0.875rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  text-align: center;
  font-size: 1rem;
}

.submit-btn {
  background-color: #3b82f6;
  border: none;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.submit-btn:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #4b5563;
}

.cancel-btn:hover {
  background-color: #e5e7eb;
}
</style> 