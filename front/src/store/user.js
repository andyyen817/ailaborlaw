/**
 * 用戶數據存儲模塊
 * 使用 Vue 的響應式 API 管理用戶狀態
 */

import { reactive, readonly } from 'vue'
import authService from '@/services/auth'

// 初始狀態
const initialState = {
  user: null,
  isLoading: false,
  error: null,
  remainingQueries: null,
  isAuthenticated: false
}

// 用戶數據響應式狀態
const state = reactive({
  ...initialState
})

// 操作方法
const actions = {
  /**
   * 初始化用戶狀態
   * 從本地存儲加載用戶數據
   */
  initialize() {
    const user = authService.getCurrentUser()
    if (user) {
      state.user = user
      state.isAuthenticated = true
      state.remainingQueries = user.remainingQueries || 0
    }
  },

  /**
   * 設置用戶數據
   * @param {Object} userData - 用戶數據
   */
  setUser(userData) {
    state.user = userData
    state.isAuthenticated = !!userData
    state.remainingQueries = userData?.remainingQueries || 0
    state.error = null
  },

  /**
   * 清除用戶數據
   */
  clearUser() {
    Object.assign(state, initialState)
  },

  /**
   * 設置加載狀態
   * @param {boolean} isLoading - 是否加載中
   */
  setLoading(isLoading) {
    state.isLoading = isLoading
  },

  /**
   * 設置錯誤信息
   * @param {Object|string} error - 錯誤信息
   */
  setError(error) {
    state.error = error
  },

  /**
   * 更新用戶資料
   * @param {Object} userData - 用戶更新數據
   * @returns {Promise<Object>} - 更新結果
   */
  async updateProfile(userData) {
    try {
      actions.setLoading(true)
      const response = await authService.updateProfile(userData)
      
      if (response.success && response.data.user) {
        actions.setUser(response.data.user)
      }
      
      return response
    } catch (error) {
      actions.setError(error.message || '更新用戶資料失敗')
      throw error
    } finally {
      actions.setLoading(false)
    }
  },

  /**
   * 更新剩餘諮詢次數
   * @param {number} count - 新的諮詢次數
   */
  updateRemainingQueries(count) {
    state.remainingQueries = count
    if (state.user) {
      state.user.remainingQueries = count
    }
  },

  /**
   * 減少諮詢次數
   * @returns {Promise<Object>} - 操作結果
   */
  async decreaseQuery() {
    try {
      actions.setLoading(true)
      const response = await authService.api.post('/users/decrease-query')
      
      if (response.success && response.data) {
        actions.updateRemainingQueries(response.data.remainingQueries)
      }
      
      return response
    } catch (error) {
      actions.setError(error.message || '扣減諮詢次數失敗')
      throw error
    } finally {
      actions.setLoading(false)
    }
  },

  /**
   * 登入用戶
   * @param {string} email - 用戶郵箱
   * @param {string} password - 用戶密碼
   * @returns {Promise<Object>} - 登入結果
   */
  async login(email, password) {
    try {
      actions.setLoading(true)
      actions.setError(null)
      
      const response = await authService.login(email, password)
      
      if (response.success && response.data.user) {
        actions.setUser(response.data.user)
      }
      
      return response
    } catch (error) {
      actions.setError(error.message || '登入失敗')
      throw error
    } finally {
      actions.setLoading(false)
    }
  },

  /**
   * 註冊用戶
   * @param {Object} userData - 用戶註冊數據
   * @returns {Promise<Object>} - 註冊結果
   */
  async register(userData) {
    try {
      actions.setLoading(true)
      actions.setError(null)
      
      const response = await authService.register(userData)
      
      if (response.success && response.data.user) {
        actions.setUser(response.data.user)
      }
      
      return response
    } catch (error) {
      actions.setError(error.message || '註冊失敗')
      throw error
    } finally {
      actions.setLoading(false)
    }
  },

  /**
   * 登出用戶
   * @param {boolean} redirect - 是否重定向到登入頁
   */
  logout(redirect = true) {
    actions.clearUser()
    authService.logout(redirect)
  }
}

// 導出只讀狀態和操作方法
export default {
  state: readonly(state),
  ...actions
} 