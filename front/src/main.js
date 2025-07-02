import './assets/main.css'
import './assets/base.css'
import './assets/theme.css'
import './assets/tailwind.css'

// 引入本地安裝的Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 創建Vue應用
const app = createApp(App)

// 全局錯誤處理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局錯誤:', err)
  console.error('錯誤組件:', vm)
  console.error('錯誤信息:', info)
}

// 🔧 临时简化：直接启动应用，跳过复杂的认证初始化
console.log('🚀 启动简化版应用...')

// 使用路由
app.use(router)

// 掛載應用
app.mount('#app')

console.log('✅ 应用启动完成')

// 🔧 延迟初始化认证系统（避免阻塞应用启动）
setTimeout(async () => {
  try {
    console.log('🔐 延迟初始化认证系统...')
    const { setupAuth } = await import('./utils/auth-initializer')
    await setupAuth()
    console.log('✅ 认证系统初始化完成')
  } catch (error) {
    console.warn('⚠️ 认证系统初始化失败，但应用仍可使用:', error)
  }
}, 1000) // 1秒后初始化认证
