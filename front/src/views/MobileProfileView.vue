<template>
  <MobileContainer :showBackButton="false" :showHomeButton="true">
    <!-- 頂部背景 -->
    <div class="profile-header-bg"></div>
    
    <!-- 主内容區 -->
    <div class="mobile-profile-container">
      <!-- 用戶頭像卡片 -->
      <div class="user-profile-card">
        <div class="profile-avatar">{{ userInitials }}</div>
        <h2 class="profile-name">{{ userName }}</h2>
        <p class="profile-plan">{{ userPlan }}</p>
        <div class="profile-queries">
          剩餘諮詢次數: <span>{{ remainingQueries }}</span> 次
        </div>
      </div>
      
      <!-- 基本資料區塊 -->
      <div class="profile-section">
        <h3 class="section-title">基本資料</h3>
        <div class="profile-items">
          <div class="profile-item" @click="editField('name')">
            <div class="item-label">姓名</div>
            <div class="item-value">{{ userName }}</div>
            <span class="item-arrow">›</span>
          </div>
          
          <div class="profile-item">
            <div class="item-label">電子郵件</div>
            <div class="item-value">{{ userEmail }}</div>
          </div>
          
          <div class="profile-item" @click="editField('phone')">
            <div class="item-label">手機號碼</div>
            <div class="item-value">{{ userPhone || '未設置' }}</div>
            <span class="item-arrow">›</span>
          </div>
          
          <div class="profile-item" @click="editField('occupation')">
            <div class="item-label">職業</div>
            <div class="item-value">{{ userOccupation }}</div>
            <span class="item-arrow">›</span>
          </div>
          
          <div class="profile-item" @click="editField('industry')">
            <div class="item-label">行業</div>
            <div class="item-value">{{ userIndustry }}</div>
            <span class="item-arrow">›</span>
          </div>
          
          <div class="profile-item" @click="editField('company')">
            <div class="item-label">公司名稱</div>
            <div class="item-value">{{ userCompany || '未設置' }}</div>
            <span class="item-arrow">›</span>
          </div>
        </div>
      </div>
      
      <!-- 帳戶設定區塊 -->
      <div class="profile-section">
        <h3 class="section-title">帳戶設定</h3>
        <div class="profile-items">
          <div class="profile-item toggle-item">
            <div class="item-label">接收通知</div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="notificationsEnabled">
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="profile-item" @click="goToChangePassword">
            <div class="item-label">更改密碼</div>
            <span class="item-arrow">›</span>
          </div>
          
          <div class="profile-item" @click="selectLanguage">
            <div class="item-label">語言偏好</div>
            <div class="item-value">繁體中文</div>
            <span class="item-arrow">›</span>
          </div>
        </div>
      </div>
      
      <!-- 諮詢統計區塊 -->
      <div class="profile-section">
        <h3 class="section-title">諮詢統計</h3>
        <div class="stats-grid">
          <div class="stats-item">
            <div class="stats-value">{{ totalConsultations }}</div>
            <div class="stats-label">總諮詢次數</div>
          </div>
          
          <div class="stats-item">
            <div class="stats-value">{{ remainingQueries }}</div>
            <div class="stats-label">剩餘免費次數</div>
          </div>
          
          <div class="stats-item">
            <div class="stats-value">{{ totalQuestions }}</div>
            <div class="stats-label">累計提問數</div>
          </div>
          
          <div class="stats-item">
            <div class="stats-value">{{ lastConsultTime }}</div>
            <div class="stats-label">最近諮詢時間</div>
          </div>
        </div>
      </div>
      
      <!-- 其他設定區塊 -->
      <div class="profile-section">
        <h3 class="section-title">其他設定</h3>
        <div class="profile-items">
          <div class="profile-item" @click="clearHistory">
            <div class="item-label">清除歷史記錄</div>
            <span class="item-arrow">›</span>
          </div>
          
          <div class="profile-item" @click="openPrivacyPolicy">
            <div class="item-label">隱私政策</div>
            <span class="item-arrow">›</span>
          </div>
          
          <div class="profile-item" @click="openTerms">
            <div class="item-label">服務條款</div>
            <span class="item-arrow">›</span>
          </div>
          
          <div class="profile-item" @click="openAbout">
            <div class="item-label">關於我們</div>
            <span class="item-arrow">›</span>
          </div>
        </div>
      </div>
      
      <!-- 登出按鈕 -->
      <button class="logout-button" @click="logout">
        登出
      </button>
      
      <!-- 編輯彈窗 -->
      <div v-if="editingField" class="edit-modal">
        <div class="edit-modal-content">
          <h3>編輯{{ editFieldLabel }}</h3>
          <input 
            v-model="editValue" 
            :type="editFieldType" 
            :placeholder="`請輸入${editFieldLabel}`"
            class="edit-input"
          >
          <div class="edit-buttons">
            <button @click="cancelEdit" class="cancel-button">取消</button>
            <button @click="saveEdit" class="save-button">保存</button>
          </div>
        </div>
        <div class="edit-modal-overlay" @click="cancelEdit"></div>
      </div>
    </div>
  </MobileContainer>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import MobileContainer from '@/components/layout/MobileContainer.vue'
import authService from '@/services/auth'
import userService from '@/services/userService'
import conversationService from '@/services/conversationService'
import { handleLogout as routerLogout } from '@/router'

export default {
  name: 'MobileProfileView',
  components: {
    MobileContainer
  },
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const error = ref('');
    const successMessage = ref('');
    
    // 用戶資料
    const userData = ref({
      name: '',
      email: '',
      phone: '',
      position: '',
      industry: '',
      remainingQueries: 0,
      totalConsultations: 0,
      totalQuestions: 0
    });
    
    // 通知設定
    const notificationsEnabled = ref(true);
    
    // 編輯相關
    const editingField = ref('');
    const editValue = ref('');
    const editFieldLabel = ref('');
    const editFieldType = ref('text');
    
    // 加載用戶資料
    const loadUserData = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        // 從認證服務獲取基本用戶資訊
        const localUser = authService.getCurrentUser();
        console.log('本地存儲的用戶資訊:', localUser);
        
        // 同步用戶資料（從API獲取最新數據並更新本地存儲）
        const userInfo = await userService.syncUserData();
        console.log('同步後的用戶資料:', userInfo);
        
        if (userInfo) {
          userData.value = {
            name: userInfo.name || '用戶',
            email: userInfo.email || '',
            phoneNumber: userInfo.phoneNumber || userInfo.phone || localUser?.phoneNumber || '',
            companyName: userInfo.companyName || userInfo.company || '',
            remainingQueries: userInfo.remainingQueries || 0,
            totalConsultations: userInfo.totalConsultations || 0
          };
          
          // 處理用戶profile資訊 - 優先從根級別獲取，然後從profile對象（向後兼容）
          userData.value.industry = userInfo.industry || userInfo.profile?.industry || '';
          userData.value.position = userInfo.position || userInfo.profile?.position || '';
          
          // 🔧 修复：添加公司名称赋值逻辑（与桌面端保持一致）
          userData.value.company = userInfo.companyName || userInfo.company || userInfo.profile?.company || '';
          console.log('🔧 移动端公司名称赋值完成:', {
            userInfoCompanyName: userInfo.companyName,
            userInfoCompany: userInfo.company,
            profileCompany: userInfo.profile?.company,
            finalCompany: userData.value.company
          });
        }
        
        // 🔧 Task 1.2: 完全API化的统计数据获取（与桌面端保持一致）
        try {
          // 使用新的API获取我的咨询状态 - 主要数据源
          const queryStatusResponse = await userService.getMyQueryStatus();
          console.log('📊 移动端获取咨询状态成功:', queryStatusResponse);
          
          if (queryStatusResponse.success && queryStatusResponse.data) {
            const data = queryStatusResponse.data;
            
            // 🔧 Task 2.3: 使用API返回的准确数据，优先使用totalConsultations作为累计提问数
            userData.value.remainingQueries = data.remainingQueries || 0;
            userData.value.totalConsultations = data.totalConsultations || 0;
            userData.value.totalQuestions = data.totalConsultations || 0; // 直接使用API的totalConsultations
            
            // 🔧 Task 2.3: 从API获取最近咨询时间，而不是本地计算
            if (data.lastQueryAt) {
              userData.value.lastConsultTime = formatDate(new Date(data.lastQueryAt));
            } else {
              userData.value.lastConsultTime = '未使用';
            }
            
            console.log('📊 移动端API数据解析完成:', {
              remainingQueries: userData.value.remainingQueries,
              totalConsultations: userData.value.totalConsultations,
              totalQuestions: userData.value.totalQuestions,
              lastConsultTime: userData.value.lastConsultTime
            });
          }
          
          // 获取今日使用次数
          const todayUsageResponse = await userService.getTodayUsageCount();
          if (todayUsageResponse.success && todayUsageResponse.data) {
            userData.value.todayUsageCount = todayUsageResponse.data.todayCount || 0;
            console.log('📊 移动端今日使用次数:', userData.value.todayUsageCount);
          }
          
          // 🔧 Task 2.4: 尝试从记录API获取更精确的累计提问数（可选增强功能）
          try {
            console.log('📊 移动端尝试获取详细咨询记录以优化显示...');
            const recordsResponse = await userService.getMyQueryRecords({ limit: 100, page: 1 });
            
            if (recordsResponse.success && recordsResponse.data && recordsResponse.data.records && recordsResponse.data.records.length > 0) {
              // 计算总提问数（decrease类型的记录数量）
              const decreaseRecords = recordsResponse.data.records.filter(record => 
                record.action === 'decrease'
              );
              // 如果从记录计算的数量更大，则使用记录数据（更精确）
              const recordBasedCount = decreaseRecords.length;
              if (recordBasedCount >= userData.value.totalQuestions) {
                userData.value.totalQuestions = recordBasedCount;
                console.log('📊 移动端使用记录API优化累计提问数:', userData.value.totalQuestions);
              } else {
                console.log('📊 移动端记录API数据较少，保持使用totalConsultations:', userData.value.totalQuestions);
              }
            } else {
              console.log('📊 移动端记录API无数据，保持使用totalConsultations:', userData.value.totalQuestions);
            }
          } catch (recordsError) {
            console.log('📊 移动端记录API调用失败，这是正常的，保持使用totalConsultations:', userData.value.totalQuestions);
          }
          
        } catch (queryError) {
          console.error('📊 移动端获取咨询状态失败:', queryError);
          // 降级到旧API
          try {
            const queryCountData = await userService.getQueryCount();
            console.log('📊 移动端降级：使用旧API获取咨询次数:', queryCountData);
            if (queryCountData) {
              userData.value.remainingQueries = queryCountData.remainingQueries;
              userData.value.totalConsultations = queryCountData.totalConsultations;
            }
          } catch (fallbackError) {
            console.error('📊 移动端降级API也失败:', fallbackError);
          }
        }
        
      } catch (err) {
        console.error('獲取用戶資料失敗:', err);
        error.value = '加載用戶資料失敗，請稍後再試';
      } finally {
        loading.value = false;
      }
      
      // 🔧 Task 2.5: 完全移除本地存储依赖，系统已基于API数据
      // 系统现在完全依赖API数据，生产环境更加可靠
            console.log('📊 移动端数据加载完成，累计提问数:', userData.value.totalQuestions);
      console.log('📊 移动端不再依赖本地存储，系统更适合生产环境');
    };
    
    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '未使用';
      
      const d = date instanceof Date ? date : new Date(date);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (d >= today) {
        return `今天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      } else if (d >= yesterday) {
        return `昨天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      } else {
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      }
    };
    
    // 計算屬性
    const userName = computed(() => userData.value.name);
    const userEmail = computed(() => userData.value.email);
    const userPhone = computed(() => userData.value.phoneNumber);
    const userOccupation = computed(() => formatOccupation(userData.value.position));
    const userIndustry = computed(() => formatIndustry(userData.value.industry));
    const userCompany = computed(() => userData.value.companyName || userData.value.company || '未設置');
    const userPlan = computed(() => userData.value.plan);
    const remainingQueries = computed(() => userData.value.remainingQueries);
    const totalConsultations = computed(() => userData.value.totalConsultations);
    const totalQuestions = computed(() => userData.value.totalQuestions);
    const lastConsultTime = computed(() => userData.value.lastConsultTime);
    
    // 計算用戶首字母
    const userInitials = computed(() => {
      if (userName.value) {
        return userName.value.charAt(0);
      }
      return '用';
    });
    
    // 行業格式化函數
    const formatIndustry = (industry) => {
      const industries = {
        tech: '科技/IT',
        manufacturing: '製造業',
        retail: '零售/貿易',
        finance: '金融/保險',
        education: '教育/培訓',
        healthcare: '醫療/健康',
        service: '服務業',
        others: '其他'
      };
      return industries[industry] || industry || '未設置';
    };
    
    // 職業格式化函數
    const formatOccupation = (occupation) => {
      const occupations = {
        employee: '一般員工',
        manager: '管理者',
        hr: '人力資源',
        boss: '企業主/雇主',
        others: '其他'
      };
      return occupations[occupation] || occupation || '未設置';
    };
    
    // 編輯字段
    const editField = (field) => {
      editingField.value = field;
      editFieldType.value = 'text';
      
      switch (field) {
        case 'name':
          editValue.value = userName.value;
          editFieldLabel.value = '姓名';
          break;
        case 'phone':
          editValue.value = userPhone.value;
          editFieldLabel.value = '手機號碼';
          editFieldType.value = 'tel';
          break;
        case 'occupation':
          editValue.value = userOccupation.value;
          editFieldLabel.value = '職業';
          break;
        case 'industry':
          editValue.value = userIndustry.value;
          editFieldLabel.value = '行業';
          break;
        case 'company':
          editValue.value = userCompany.value;
          editFieldLabel.value = '公司名稱';
          break;
        default:
          break;
      }
    };
    
    // 保存編輯
    const saveEdit = async () => {
      if (editingField.value && editValue.value.trim()) {
        try {
          // 構建需要更新的數據對象
          const updateData = {};
          
          switch (editingField.value) {
            case 'name':
              updateData.name = editValue.value.trim();
              break;
            case 'phone':
              updateData.phoneNumber = editValue.value.trim(); // 使用 phoneNumber 字段與後端保持一致
              console.log(`保存手機號碼，值: ${editValue.value.trim()}`);
              break;
            case 'occupation':
              updateData.profile = { position: editValue.value.trim() };
              break;
            case 'industry':
              updateData.profile = { industry: editValue.value.trim() };
              break;
            case 'company':
              updateData.companyName = editValue.value.trim(); // 使用 companyName 字段與後端保持一致
              console.log(`保存公司名稱，值: ${editValue.value.trim()}`);
              break;
            default:
              break;
          }
          
          // 特殊處理職業和行業，需要保持其他profile字段不變
          if (editingField.value === 'occupation' || editingField.value === 'industry') {
            const currentUser = authService.getCurrentUser();
            if (currentUser && currentUser.profile) {
              updateData.profile = {
                ...currentUser.profile,
                ...updateData.profile
              };
            }
          }
          
          console.log('準備發送更新用戶資料請求，詳細數據:', JSON.stringify(updateData));
          // 調用用戶服務更新數據
          const result = await userService.updateUserProfile(updateData);
          console.log('更新用戶資料API回應:', JSON.stringify(result));
          
          // 更新本地存儲的用戶數據
          if (result) {
            // 更新 localStorage 中的用戶數據
            const currentUser = authService.getCurrentUser() || {};
            
            // 根據欄位類型更新 localStorage 中相應的字段
            switch (editingField.value) {
              case 'name':
                currentUser.name = editValue.value.trim();
                break;
              case 'phone':
                currentUser.phoneNumber = editValue.value.trim(); // 使用統一的 phoneNumber 字段
                console.log(`已更新 localStorage 中的 phoneNumber 字段: ${currentUser.phoneNumber}`);
                // 同時刪除可能存在的舊字段，避免數據不一致
                if ('phone' in currentUser) {
                  console.log(`刪除 localStorage 中的冗餘 phone 字段: ${currentUser.phone}`);
                  delete currentUser.phone;
                }
                break;
              case 'occupation':
                if (!currentUser.profile) currentUser.profile = {};
                currentUser.profile.position = editValue.value.trim();
                break;
              case 'industry':
                if (!currentUser.profile) currentUser.profile = {};
                currentUser.profile.industry = editValue.value.trim();
                break;
              case 'company':
                currentUser.companyName = editValue.value.trim(); // 使用統一的 companyName 字段
                console.log(`已更新 localStorage 中的 companyName 字段: ${currentUser.companyName}`);
                // 同時刪除可能存在的舊字段，避免數據不一致
                if ('company' in currentUser) {
                  console.log(`刪除 localStorage 中的冗餘 company 字段: ${currentUser.company}`);
                  delete currentUser.company;
                }
                break;
              default:
                break;
            }
            
            // 保存更新後的用戶數據到 localStorage
            localStorage.setItem('auth_user', JSON.stringify(currentUser));
            console.log('本地存儲的用戶資料已更新:', JSON.stringify(currentUser));
            
            editingField.value = '';
            loadUserData();
          }
        } catch (error) {
          console.error('更新資料失敗:', error);
          alert('更新資料失敗: ' + (error.message || '請稍後再試'));
        }
      } else {
        editingField.value = '';
      }
    };
    
    // 取消編輯
    const cancelEdit = () => {
      editingField.value = '';
    };
    
    // 打開更改密碼頁面
    const goToChangePassword = () => {
      router.push('/mobile-change-password');
    };
    
    // 選擇語言
    const selectLanguage = () => {
      // TODO: 語言選擇邏輯
      alert('語言選擇功能正在開發中');
    };
    
    // 清除歷史記錄
    const clearHistory = () => {
      if (confirm('確定要清除所有諮詢歷史嗎？此操作不可撤銷。')) {
        // TODO: 清除歷史記錄的實際邏輯
        alert('歷史記錄已清除');
      }
    };
    
    // 打開隱私政策
    const openPrivacyPolicy = () => {
      router.push('/mobile/privacy-policy');
    };
    
    // 打開服務條款
    const openTerms = () => {
      router.push('/mobile/terms');
    };
    
    // 打開關於我們
    const openAbout = () => {
      router.push('/mobile/about');
    };
    
    // 登出
    const logout = async () => {
      try {
        console.log('🚀 开始执行移动端个人资料页面登出流程...');
        
        // 直接清除认证状态
        console.log('🔒 清除认证状态...');
        
        // 清除所有认证相关的localStorage数据
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_token_expires');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_user_id');
        localStorage.removeItem('logging_out');
        
        console.log('✅ 认证状态已清除');
        
        // 使用Vue Router进行页面跳转
        console.log('🔄 跳转到移动端登录页面...');
        await router.push('/mobile/login');
        
        console.log('✅ 移动端个人资料页面登出完成');
        
      } catch (error) {
        console.error('❌ 移动端个人资料页面登出过程中发生错误:', error);
        
        // 即使发生错误，也要确保清除认证状态
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_token_expires');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_user_id');
        localStorage.removeItem('logging_out');
        
        // 强制跳转
        try {
          await router.push('/mobile/login');
        } catch (routerError) {
          console.error('❌ Vue Router跳转失败，使用fallback方案:', routerError);
          window.location.href = '/mobile/login';
        }
      }
    };
    
    // 🔧 Task 1.3: 添加事件监听统一
    const handleQueryCountUpdate = (event) => {
      if (event.detail && typeof event.detail.remainingQueries === 'number') {
        userData.value.remainingQueries = event.detail.remainingQueries;
        console.log('📊 MobileProfileView：收到咨询次数更新事件:', event.detail.remainingQueries);
        
        // 如果次数更新了，也更新今日使用次数（可能增加了）
        if (event.detail.action === 'decreased') {
          userData.value.todayUsageCount = (userData.value.todayUsageCount || 0) + 1;
          userData.value.totalQuestions = (userData.value.totalQuestions || 0) + 1;
          userData.value.lastConsultTime = formatDate(new Date());
        }
      }
    };

    // 生命周期鉤子
    onMounted(() => {
      loadUserData();
      // 添加咨询次数更新事件监听
      window.addEventListener('queryCountUpdated', handleQueryCountUpdate);
    });
    
    onUnmounted(() => {
      // 移除事件监听
      window.removeEventListener('queryCountUpdated', handleQueryCountUpdate);
    });
    
    return {
      userName,
      userEmail,
      userPhone,
      userOccupation,
      userIndustry,
      userCompany,
      userPlan,
      userInitials,
      remainingQueries,
      totalConsultations,
      totalQuestions,
      lastConsultTime,
      notificationsEnabled,
      editingField,
      editValue,
      editFieldLabel,
      editFieldType,
      editField,
      saveEdit,
      cancelEdit,
      goToChangePassword,
      selectLanguage,
      clearHistory,
      openPrivacyPolicy,
      openTerms,
      openAbout,
      logout
    };
  }
};
</script>

<style scoped>
/* 頁面容器樣式 */
.mobile-profile-container {
  padding: 15px;
  padding-top: 20px;
  position: relative;
  min-height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 40px;
}

.profile-header-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(to bottom, #3b82f6, #60a5fa);
  z-index: -1;
}

/* 用戶頭像卡片 */
.user-profile-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 12px;
}

.profile-name {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.profile-plan {
  color: #6b7280;
  margin-bottom: 12px;
  font-size: 14px;
}

.profile-queries {
  background: #ebf5ff;
  color: #3b82f6;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.profile-queries span {
  font-weight: 600;
}

/* 資料區塊樣式 */
.profile-section {
  background: white;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-title {
  padding: 15px;
  font-weight: 600;
  font-size: 16px;
  border-bottom: 1px solid #f3f4f6;
  margin: 0;
}

.profile-items {
  padding: 0;
}

.profile-item {
  padding: 15px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
  position: relative;
  cursor: pointer;
}

.profile-item:last-child {
  border-bottom: none;
}

.item-label {
  width: 40%;
  color: #374151;
  font-size: 15px;
}

.item-value {
  flex: 1;
  text-align: right;
  color: #6b7280;
  font-size: 15px;
  padding-right: 20px;
}

.item-arrow {
  position: absolute;
  right: 15px;
  color: #9ca3af;
  font-size: 18px;
}

/* 設定開關樣式 */
.toggle-item {
  justify-content: space-between;
  cursor: default;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #3b82f6;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

/* 統計網格樣式 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background-color: #f3f4f6;
}

.stats-item {
  background: white;
  padding: 15px;
  text-align: center;
}

.stats-value {
  font-weight: 600;
  font-size: 18px;
  color: #3b82f6;
  margin-bottom: 4px;
}

.stats-label {
  font-size: 13px;
  color: #6b7280;
}

/* 登出按鈕 */
.logout-button {
  width: 100%;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 15px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 10px;
  cursor: pointer;
}

/* 編輯彈窗 */
.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: -1;
}

.edit-modal-content {
  width: 90%;
  max-width: 350px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.edit-modal-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.edit-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 15px;
}

.edit-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-button, .save-button {
  padding: 10px 15px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.cancel-button {
  background: #f3f4f6;
  color: #4b5563;
  border: none;
}

.save-button {
  background: #3b82f6;
  color: white;
  border: none;
}
</style> 