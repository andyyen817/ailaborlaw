<template>
  <div class="auth-test-container">
    <h2>API 連接測試</h2>
    
    <div class="test-section">
      <h3>獲取當前用戶資料</h3>
      <button @click="getUserInfo" class="test-button">獲取資料</button>
      <div v-if="loading.userInfo" class="loading">加載中...</div>
      <div v-if="results.userInfo" class="result-box">
        <pre>{{ JSON.stringify(results.userInfo, null, 2) }}</pre>
      </div>
      <div v-if="errors.userInfo" class="error-box">{{ errors.userInfo }}</div>
    </div>
    
    <div class="test-section">
      <h3>更新用戶資料</h3>
      <form @submit.prevent="updateUserProfile">
        <div class="form-group">
          <label>名稱：</label>
          <input v-model="updateData.name" type="text" placeholder="輸入新名稱" />
        </div>
        
        <div class="form-group">
          <label>電話：</label>
          <input v-model="updateData.phone" type="text" placeholder="輸入新電話" />
        </div>
        
        <div class="form-group">
          <label>職業：</label>
          <select v-model="updateData.position">
            <option value="">請選擇職業</option>
            <option value="employee">一般員工</option>
            <option value="manager">管理者</option>
            <option value="hr">人力資源</option>
            <option value="boss">企業主/雇主</option>
            <option value="others">其他</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>行業：</label>
          <select v-model="updateData.industry">
            <option value="">請選擇行業</option>
            <option value="tech">科技/IT</option>
            <option value="manufacturing">製造業</option>
            <option value="retail">零售/貿易</option>
            <option value="finance">金融/保險</option>
            <option value="education">教育/培訓</option>
            <option value="healthcare">醫療/健康</option>
            <option value="service">服務業</option>
            <option value="others">其他</option>
          </select>
        </div>
        
        <button type="submit" class="test-button">更新資料</button>
      </form>
      <div v-if="loading.updateProfile" class="loading">更新中...</div>
      <div v-if="results.updateProfile" class="result-box">
        <pre>{{ JSON.stringify(results.updateProfile, null, 2) }}</pre>
      </div>
      <div v-if="errors.updateProfile" class="error-box">{{ errors.updateProfile }}</div>
    </div>
    
    <div class="test-section">
      <h3>獲取諮詢次數</h3>
      <button @click="getQueryCount" class="test-button">獲取次數</button>
      <div v-if="loading.queryCount" class="loading">加載中...</div>
      <div v-if="results.queryCount" class="result-box">
        <pre>{{ JSON.stringify(results.queryCount, null, 2) }}</pre>
      </div>
      <div v-if="errors.queryCount" class="error-box">{{ errors.queryCount }}</div>
    </div>
    
    <div class="test-section">
      <h3>扣減諮詢次數</h3>
      <button @click="decreaseQueryCount" class="test-button">扣減一次</button>
      <div v-if="loading.decreaseCount" class="loading">處理中...</div>
      <div v-if="results.decreaseCount" class="result-box">
        <pre>{{ JSON.stringify(results.decreaseCount, null, 2) }}</pre>
      </div>
      <div v-if="errors.decreaseCount" class="error-box">{{ errors.decreaseCount }}</div>
    </div>
    
    <div class="test-section">
      <h3>修改密碼測試</h3>
      <form @submit.prevent="updatePassword">
        <div class="form-group">
          <label>當前密碼：</label>
          <input v-model="passwordData.currentPassword" type="password" placeholder="當前密碼" />
        </div>
        
        <div class="form-group">
          <label>新密碼：</label>
          <input v-model="passwordData.newPassword" type="password" placeholder="新密碼" />
        </div>
        
        <button type="submit" class="test-button">更新密碼</button>
      </form>
      <div v-if="loading.updatePassword" class="loading">更新中...</div>
      <div v-if="results.updatePassword" class="result-box">
        <pre>{{ JSON.stringify(results.updatePassword, null, 2) }}</pre>
      </div>
      <div v-if="errors.updatePassword" class="error-box">{{ errors.updatePassword }}</div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import userService from '@/services/userService'

export default {
  name: 'AuthTestView',
  setup() {
    // 加載狀態
    const loading = reactive({
      userInfo: false,
      updateProfile: false,
      queryCount: false,
      decreaseCount: false,
      updatePassword: false
    })
    
    // 結果存儲
    const results = reactive({
      userInfo: null,
      updateProfile: null,
      queryCount: null,
      decreaseCount: null,
      updatePassword: null
    })
    
    // 錯誤存儲
    const errors = reactive({
      userInfo: null,
      updateProfile: null,
      queryCount: null,
      decreaseCount: null,
      updatePassword: null
    })
    
    // 更新資料的表單數據
    const updateData = reactive({
      name: '',
      phone: '',
      position: '',
      industry: ''
    })
    
    // 密碼資料
    const passwordData = reactive({
      currentPassword: '',
      newPassword: ''
    })
    
    // 獲取用戶資料
    const getUserInfo = async () => {
      loading.userInfo = true
      errors.userInfo = null
      results.userInfo = null
      
      try {
        const result = await userService.getCurrentUserInfo()
        results.userInfo = result
        
        // 填充表單
        if (result) {
          updateData.name = result.name || ''
          updateData.phone = result.phone || ''
          
          if (result.profile) {
            updateData.position = result.profile.position || ''
            updateData.industry = result.profile.industry || ''
          }
        }
      } catch (error) {
        console.error('獲取用戶資料失敗:', error)
        errors.userInfo = `獲取失敗: ${error.message || '未知錯誤'}`
      } finally {
        loading.userInfo = false
      }
    }
    
    // 更新用戶資料
    const updateUserProfile = async () => {
      loading.updateProfile = true
      errors.updateProfile = null
      results.updateProfile = null
      
      try {
        const profileData = {
          name: updateData.name,
          phone: updateData.phone,
          profile: {
            position: updateData.position,
            industry: updateData.industry
          }
        }
        
        const result = await userService.updateUserProfile(profileData)
        results.updateProfile = result
      } catch (error) {
        console.error('更新用戶資料失敗:', error)
        errors.updateProfile = `更新失敗: ${error.message || '未知錯誤'}`
      } finally {
        loading.updateProfile = false
      }
    }
    
    // 獲取諮詢次數
    const getQueryCount = async () => {
      loading.queryCount = true
      errors.queryCount = null
      results.queryCount = null
      
      try {
        const result = await userService.getQueryCount()
        results.queryCount = result
      } catch (error) {
        console.error('獲取諮詢次數失敗:', error)
        errors.queryCount = `獲取失敗: ${error.message || '未知錯誤'}`
      } finally {
        loading.queryCount = false
      }
    }
    
    // 扣減諮詢次數
    const decreaseQueryCount = async () => {
      if (!confirm('確定要扣減一次諮詢次數嗎？')) return
      
      loading.decreaseCount = true
      errors.decreaseCount = null
      results.decreaseCount = null
      
      try {
        const result = await userService.decreaseQueryCount()
        results.decreaseCount = result
      } catch (error) {
        console.error('扣減諮詢次數失敗:', error)
        errors.decreaseCount = `扣減失敗: ${error.message || '未知錯誤'}`
      } finally {
        loading.decreaseCount = false
      }
    }
    
    // 更新密碼
    const updatePassword = async () => {
      if (!passwordData.currentPassword || !passwordData.newPassword) {
        errors.updatePassword = '請輸入當前密碼和新密碼'
        return
      }
      
      loading.updatePassword = true
      errors.updatePassword = null
      results.updatePassword = null
      
      try {
        const result = await userService.updatePassword(
          passwordData.currentPassword,
          passwordData.newPassword
        )
        results.updatePassword = result
        
        // 清空密碼字段
        passwordData.currentPassword = ''
        passwordData.newPassword = ''
      } catch (error) {
        console.error('更新密碼失敗:', error)
        errors.updatePassword = `更新失敗: ${error.message || '未知錯誤'}`
      } finally {
        loading.updatePassword = false
      }
    }
    
    return {
      loading,
      results,
      errors,
      updateData,
      passwordData,
      getUserInfo,
      updateUserProfile,
      getQueryCount,
      decreaseQueryCount,
      updatePassword
    }
  }
}
</script>

<style scoped>
.auth-test-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  color: #2563eb;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 10px;
}

.test-section {
  margin-bottom: 30px;
  padding: 15px;
  background: #f9fafb;
  border-radius: 6px;
}

.test-section h3 {
  margin-top: 0;
  color: #374151;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.test-button {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.test-button:hover {
  background-color: #1d4ed8;
}

.loading {
  margin-top: 10px;
  color: #6b7280;
  font-style: italic;
}

.result-box {
  margin-top: 10px;
  padding: 10px;
  background: #edf5ff;
  border-radius: 4px;
  overflow: auto;
  max-height: 200px;
}

.error-box {
  margin-top: 10px;
  padding: 10px;
  background: #ffeded;
  color: #b91c1c;
  border-radius: 4px;
}

pre {
  margin: 0;
  white-space: pre-wrap;
}
</style> 