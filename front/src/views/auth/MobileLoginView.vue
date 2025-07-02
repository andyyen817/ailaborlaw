<template>
  <MobileContainer>
    <!-- 登录背景 -->
    <div class="login-bg"></div>
    
    <!-- 登录内容 -->
    <div class="login-container">
      <div class="logo-container">
        <div class="mx-auto flex justify-center">
          <LogoSvg width="80" height="80" />
        </div>
        <h1 class="text-2xl font-bold text-white mt-4">勞法通AI</h1>
        <p class="text-blue-100 mt-1">您的職場權益保障專家</p>
      </div>
      
      <div class="form-container">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">欢迎回来</h2>
        
        <!-- 错误提示区域 -->
        <!-- 錯誤提示 -->
        <div v-if="error" class="mb-4 rounded-md bg-red-50 p-3 border-l-4 border-red-400">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- 成功提示 -->
        <div v-if="loginSuccess" class="mb-4 rounded-md bg-green-50 p-3 border-l-4 border-green-400">
          <div class="flex">
            <div class="flex-shrink-0">
              <i class="fas fa-check-circle text-green-400"></i>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">{{ getSuccessTitle() }}</h3>
              <p class="text-sm text-green-700 mt-1">{{ getSuccessMessage() }}</p>
            </div>
          </div>
        </div>
        
        <Form @submit="handleLogin" :initial-values="{ email: initialEmail }" class="mb-4">
          <div class="input-group">
            <i class="input-icon fas fa-envelope"></i>
            <Field name="email" v-slot="{ field, errors }" rules="required|email">
              <input v-bind="field" type="email" class="input-field" placeholder="电子邮箱" :class="{'border-red-400': errors.length}">
              <p v-if="errors.length" class="mt-1 text-xs text-red-500">{{ errors[0] }}</p>
            </Field>
          </div>
          
          <div class="input-group">
            <i class="input-icon fas fa-lock"></i>
            <Field name="password" v-slot="{ field, errors }" rules="required|min:8">
              <input v-bind="field" type="password" class="input-field" placeholder="密码" :class="{'border-red-400': errors.length}">
              <p v-if="errors.length" class="mt-1 text-xs text-red-500">{{ errors[0] }}</p>
            </Field>
          </div>
          
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center">
              <input id="remember-me" v-model="rememberMe" type="checkbox" class="h-4 w-4 text-blue-600 border-gray-300 rounded">
              <label for="remember-me" class="ml-2 block text-sm text-gray-600">记住我</label>
            </div>
            <router-link to="/mobile/forgot-password" class="text-sm text-blue-600 hover:text-blue-800">忘記密碼？</router-link>
          </div>
          
          <button type="submit" :disabled="loading" class="login-btn">
            <span v-if="loading" class="inline-block mr-2">
              <i class="fas fa-circle-notch fa-spin"></i>
            </span>
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </Form>
        
        <!-- <div class="divider">
          <span>或者</span>
        </div>
        
        <button class="w-full flex items-center justify-center border border-gray-300 rounded-lg py-3 space-x-2">
          <i class="fab fa-line text-green-600 text-xl"></i>
          <span class="text-gray-700">使用LINE账号登录</span>
        </button> -->
        
        <div class="text-center mt-8">
          <p class="text-gray-600">
            还没有账号？ 
            <router-link to="/mobile/register" class="text-blue-600 font-medium">立即注册</router-link>
          </p>
        </div>
      </div>
      
      <div class="text-center mt-6">
        <a href="#" class="text-sm text-gray-500">服务条款</a>
        <span class="mx-2 text-gray-300">|</span>
        <a href="#" class="text-sm text-gray-500">隐私政策</a>
      </div>
    </div>
  </MobileContainer>
</template>

<script>
import { Form, Field } from 'vee-validate'
import { defineRules } from '@/utils/validation'
import authService from '@/services/auth'
import { ref, onMounted } from 'vue'
import MobileContainer from '@/components/layout/MobileContainer.vue'
import LogoSvg from '@/components/LogoSvg.vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'MobileLoginView',
  components: {
    Form,
    Field,
    MobileContainer,
    LogoSvg
  },
  setup() {
    // 初始化表单状态
    const loading = ref(false)
    const error = ref('')
    const rememberMe = ref(false)
    const loginSuccess = ref(false)
    const isPasswordResetSuccess = ref(false)
    const initialEmail = ref('')
    const router = useRouter()
    const route = useRoute()
    
    // 确保验证规则已定义
    defineRules()
    
    // 檢查是否是從登出重定向過來的
    const checkIfFromLogout = () => {
      if (route.query.t || route.query.prevent_redirect === 'true') {
        console.log('檢測到從登出重定向到登入頁面，清理URL參數');
        // 移除所有可能遗留的認證信息
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_token_expires');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_user_id');
        localStorage.removeItem('logging_out');
      }
    }
    
    // 组件挂载时处理
    onMounted(() => {
      console.log('移動版登入頁面掛載');
      console.log('當前URL路徑:', window.location.pathname);
      console.log('當前URL參數:', route.query);
      
      // 檢查是否是從登出重定向過來的
      checkIfFromLogout();
      
      // 如果URL中有郵箱地址，自動填入
      const email = route.query.email;
      if (email) {
        initialEmail.value = decodeURIComponent(email);
      }
      
      // 檢查是否有成功提示信息
      const message = route.query.message;
      if (message === 'registration_success') {
        // 顯示註冊成功提示
        loginSuccess.value = true;
        setTimeout(() => {
          loginSuccess.value = false;
        }, 4000);
      } else if (message === 'user_exists') {
        // 用戶已存在，可以直接登錄
        error.value = '該郵箱已完成註冊，請直接登錄';
        setTimeout(() => {
          error.value = '';
        }, 4000);
      } else if (message === 'password_reset_success') {
        isPasswordResetSuccess.value = true;
        loginSuccess.value = true;
        setTimeout(() => {
          loginSuccess.value = false;
          isPasswordResetSuccess.value = false;
        }, 4000);
      }
    })
    
    // 处理登录逻辑
    const handleLogin = async (values) => {
      try {
        loading.value = true
        error.value = ''
        
        // 调用登录接口
        const response = await authService.login(values.email, values.password)
        
        // 取得目标路径参数
        const redirect = route.query.redirect || '/mobile'
        
        // 登录成功跳转
        setTimeout(() => {
          console.log('移動版登入成功，檢查是否有重定向參數:', route.query);
          
          // 如果有重定向参数，且不是登出后进入的登录页面，则使用该参数
          if (route.query.redirect && !route.query.t && !route.query.prevent_redirect) {
            console.log('使用重定向參數:', redirect);
            router.push(redirect);
          } else {
            // 没有重定向参数或是登出后进入的登录页面，直接导向移动版首页
            console.log('無重定向參數或登出後進入，跳轉到移動版首頁');
            router.push('/mobile');
          }
        }, 500)
      } catch (err) {
        console.error('登录失败:', err)
        error.value = err.message || '登录失败，请重试'
        loading.value = false
      }
    }
    
    // 輔助方法
    const getSuccessTitle = () => {
      return isPasswordResetSuccess.value ? '密碼重置成功' : '登錄成功'
    }
    
    const getSuccessMessage = () => {
      if (isPasswordResetSuccess.value) {
        return '您的密碼已成功重置，現在可以使用新密碼登入了';
      } else if (route.query.message === 'registration_success') {
        return '註冊成功！現在可以使用您的郵箱和密碼登入了';
      } else {
        return '正在為您跳轉至首頁...';
      }
    }

    return {
      loading,
      error,
      rememberMe,
      loginSuccess,
      isPasswordResetSuccess,
      initialEmail,
      handleLogin,
      getSuccessTitle,
      getSuccessMessage
    }
  }
}
</script>

<style scoped>
.login-bg {
  background-image: linear-gradient(135deg, #3b82f6, #2563eb);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40%;
  z-index: 0;
}

.login-container {
  position: relative;
  z-index: 1;
  padding: 25px 20px;
  height: 100%;
  overflow-y: auto;
}

.logo-container {
  text-align: center;
  margin-top: 60px;
  margin-bottom: 30px;
}

.form-container {
  background: white;
  border-radius: 24px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.input-group {
  position: relative;
  margin-bottom: 20px;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  z-index: 5;
}

.input-field {
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s;
}

.input-field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  outline: none;
}

.login-btn {
  width: 100%;
  background: #2563eb;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.login-btn:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 25px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.divider span {
  padding: 0 10px;
  color: #94a3b8;
  font-size: 14px;
}
</style>
