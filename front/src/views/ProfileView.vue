<template>
  <div class="profile-container">
    <!-- 房子图标导航 -->
    <router-link :to="homeRoute" class="home-nav-button" title="回到首頁">
      <svg width="20" height="20" viewBox="0 0 576 512" fill="#3b82f6">
        <path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z"/>
      </svg>
    </router-link>
    
    <div class="profile-content">
      <!-- 左側資料卡片 -->
      <div class="profile-sidebar">
        <div class="profile-card">
          <div class="profile-avatar">{{ userInitials }}</div>
          <h2 class="profile-name">{{ userName }}</h2>
          <div class="profile-plan">{{ userPlan }}</div>
          <div class="profile-queries-container">
            <div class="profile-queries">
              剩餘諮詢次數 <span>{{ remainingQueries }}</span>
            </div>
            <button class="add-queries-btn">購買次數</button>
          </div>
          <button class="logout-btn" @click="logout">登出帳號</button>
        </div>
        
        <!-- 諮詢統計卡片 -->
        <div class="stats-card">
          <h3 class="card-title">諮詢統計</h3>
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
              <div class="stats-value">{{ todayUsageCount || 0 }}</div>
              <div class="stats-label">今日已用次數</div>
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
      </div>
      
      <!-- 右側內容區 -->
      <div class="profile-main">
        <!-- 基本資料區塊 -->
        <div class="info-card">
          <h3 class="card-title">基本資料</h3>
          <div class="info-grid">
            <div class="info-item">
              <label>姓名</label>
              <div class="info-content">
                <input v-if="editing.name" v-model="editValues.name" type="text" class="edit-input">
                <span v-else>{{ userName }}</span>
                <button v-if="editing.name" @click="saveField('name')" class="save-btn">保存</button>
                <button v-if="editing.name" @click="cancelEdit('name')" class="cancel-btn">取消</button>
                <button v-else @click="editField('name')" class="edit-btn">編輯</button>
              </div>
            </div>
            
            <div class="info-item">
              <label>電子郵件</label>
              <div class="info-content">
                <span>{{ userEmail }}</span>
                <!-- 郵箱不可編輯 -->
              </div>
            </div>
            
            <div class="info-item">
              <label>手機號碼</label>
              <div class="info-content">
                <input v-if="editing.phone" v-model="editValues.phone" type="tel" class="edit-input">
                <span v-else>{{ userPhone || '未設置' }}</span>
                <button v-if="editing.phone" @click="saveField('phone')" class="save-btn">保存</button>
                <button v-if="editing.phone" @click="cancelEdit('phone')" class="cancel-btn">取消</button>
                <button v-else @click="editField('phone')" class="edit-btn">編輯</button>
              </div>
            </div>
            
            <div class="info-item">
              <label>職業</label>
              <div class="info-content">
                <input v-if="editing.occupation" v-model="editValues.occupation" type="text" class="edit-input">
                <span v-else>{{ userOccupation }}</span>
                <button v-if="editing.occupation" @click="saveField('occupation')" class="save-btn">保存</button>
                <button v-if="editing.occupation" @click="cancelEdit('occupation')" class="cancel-btn">取消</button>
                <button v-else @click="editField('occupation')" class="edit-btn">編輯</button>
              </div>
            </div>
            
            <div class="info-item">
              <label>行業</label>
              <div class="info-content">
                <input v-if="editing.industry" v-model="editValues.industry" type="text" class="edit-input">
                <span v-else>{{ userIndustry }}</span>
                <button v-if="editing.industry" @click="saveField('industry')" class="save-btn">保存</button>
                <button v-if="editing.industry" @click="cancelEdit('industry')" class="cancel-btn">取消</button>
                <button v-else @click="editField('industry')" class="edit-btn">編輯</button>
              </div>
            </div>
            
            <div class="info-item">
              <label>公司名稱</label>
              <div class="info-content">
                <input v-if="editing.company" v-model="editValues.company" type="text" class="edit-input">
                <span v-else>{{ userCompany || '未設置' }}</span>
                <button v-if="editing.company" @click="saveField('company')" class="save-btn">保存</button>
                <button v-if="editing.company" @click="cancelEdit('company')" class="cancel-btn">取消</button>
                <button v-else @click="editField('company')" class="edit-btn">編輯</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 帳戶設定區塊 -->
        <div class="info-card">
          <h3 class="card-title">帳戶設定</h3>
          <div class="settings-list">
            <div class="settings-item">
              <div class="settings-info">
                <div class="settings-label">接收通知</div>
                <div class="settings-desc">接收系統通知和更新資訊</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="notificationsEnabled">
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="settings-item">
              <div class="settings-info">
                <div class="settings-label">更改密碼</div>
                <div class="settings-desc">定期更改密碼以確保帳戶安全</div>
              </div>
              <button class="action-btn" @click="changePassword">更改</button>
            </div>
            
            <div class="settings-item">
              <div class="settings-info">
                <div class="settings-label">語言偏好</div>
                <div class="settings-desc">選擇您偏好的語言</div>
              </div>
              <div class="language-select">
                <select v-model="language">
                  <option value="zh-TW">繁體中文</option>
                  <option value="zh-CN">简体中文</option>
                  <option value="en-US">English</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 其他設定區塊 -->
        <div class="info-card">
          <h3 class="card-title">其他設定</h3>
          <div class="settings-list">
            <div class="settings-item">
              <div class="settings-info">
                <div class="settings-label">清除歷史記錄</div>
                <div class="settings-desc">刪除所有諮詢歷史記錄</div>
              </div>
              <button class="action-btn danger" @click="clearHistory">清除</button>
            </div>
            
            <div class="settings-item">
              <div class="settings-info">
                <div class="settings-label">隱私政策</div>
                <div class="settings-desc">了解我們如何保護您的資訊</div>
              </div>
              <button class="action-btn" @click="openPrivacyPolicy">查看</button>
            </div>
            
            <div class="settings-item">
              <div class="settings-info">
                <div class="settings-label">服務條款</div>
                <div class="settings-desc">了解使用本服務的條款與條件</div>
              </div>
              <button class="action-btn" @click="openTerms">查看</button>
            </div>
            
            <div class="settings-item">
              <div class="settings-info">
                <div class="settings-label">關於我們</div>
                <div class="settings-desc">了解勞法通AI及其服務</div>
              </div>
              <button class="action-btn" @click="openAbout">查看</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/auth'
import userService from '@/services/userService'
import conversationService from '@/services/conversationService'
import { handleLogout as routerLogout } from '@/router'

export default {
  name: 'ProfileView',
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const error = ref(null);
    const successMessage = ref('');
    
    const userData = ref({
      name: '用戶',
      email: 'user@example.com',
      phone: '',
      occupation: '',
      industry: '',
      company: '',
      plan: '免費用戶',
      remainingQueries: 10,
      totalConsultations: 0,
      totalQuestions: 0,
      todayUsageCount: 0,
      lastConsultTime: '未使用'
    });
    
    // 編輯狀態
    const editing = reactive({
      name: false,
      phone: false,
      occupation: false,
      industry: false,
      company: false
    });
    
    // 編輯的值
    const editValues = reactive({
      name: '',
      phone: '',
      occupation: '',
      industry: '',
      company: ''
    });
    
    // 設定相關
    const notificationsEnabled = ref(true);
    const language = ref('zh-TW');
    
    // 🔧 Task 1.3: 添加事件监听统一
    const handleQueryCountUpdate = (event) => {
      if (event.detail && typeof event.detail.remainingQueries === 'number') {
        userData.value.remainingQueries = event.detail.remainingQueries;
        console.log('📊 ProfileView：收到咨询次数更新事件:', event.detail.remainingQueries);
        
        // 如果次数更新了，也更新今日使用次数（可能增加了）
        if (event.detail.action === 'decreased') {
          userData.value.todayUsageCount = (userData.value.todayUsageCount || 0) + 1;
          userData.value.totalQuestions = (userData.value.totalQuestions || 0) + 1;
          userData.value.lastConsultTime = formatDate(new Date());
        }
      }
    };
    
        // 加載用戶資料
    const loadUserData = async () => {
      loading.value = true;
      error.value = null;
      try {
        // 從認證服務獲取基本用戶資訊
        const user = authService.getCurrentUser();
        console.log('本地存儲的用戶資訊:', user);
        
        // 同步用戶資料（從API獲取最新數據並更新本地存儲）
        const userInfo = await userService.syncUserData();
        
        if (userInfo) {
          console.log('用戶資料載入成功:', userInfo);
          
          userData.value = {
            ...userData.value,
            name: userInfo.name || '用戶',
            email: userInfo.email || 'user@example.com',
            phone: userInfo.phone || user?.phoneNumber || '', // 兼容新舊數據結構
            phoneNumber: userInfo.phoneNumber || userInfo.phone || user?.phoneNumber || '', // 🔧 修复：确保phoneNumber字段也被赋值
            companyName: userInfo.companyName || userInfo.company || '', // 🔧 修复：确保companyName字段也被赋值
            remainingQueries: userInfo.remainingQueries || 0,
            totalConsultations: userInfo.totalConsultations || 0
          };
          
          // 處理用戶profile資訊 - 優先從根級別獲取，然後從profile對象（向後兼容）
          userData.value.industry = userInfo.industry || userInfo.profile?.industry || '';
          userData.value.occupation = userInfo.position || userInfo.profile?.position || '';
          userData.value.position = userInfo.position || userInfo.profile?.position || ''; // 確保position字段也被設置
          
          // 🔧 修复：添加公司名称赋值逻辑
          userData.value.company = userInfo.companyName || userInfo.company || userInfo.profile?.company || '';
          console.log('🔧 公司名称赋值完成:', {
            userInfoCompanyName: userInfo.companyName,
            userInfoCompany: userInfo.company,
            profileCompany: userInfo.profile?.company,
            finalCompany: userData.value.company
          });
          
          // 同步更新編輯值
          editValues.name = userData.value.name;
          editValues.phone = userData.value.phone;
          editValues.occupation = userData.value.occupation;
          editValues.industry = userData.value.industry;
          editValues.company = userData.value.company;
        }
        
        // 🔧 Task 1.2: 完全API化的统计数据获取
        try {
          // 使用新的API获取我的咨询状态 - 主要数据源
          const queryStatusResponse = await userService.getMyQueryStatus();
          console.log('📊 获取咨询状态成功:', queryStatusResponse);
          
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
            
            console.log('📊 桌面端API数据解析完成:', {
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
            console.log('📊 今日使用次数:', userData.value.todayUsageCount);
          }
          
          // 🔧 Task 2.4: 尝试从记录API获取更精确的累计提问数（可选增强功能）
          try {
            console.log('📊 桌面端尝试获取详细咨询记录以优化显示...');
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
                console.log('📊 桌面端使用记录API优化累计提问数:', userData.value.totalQuestions);
              } else {
                console.log('📊 桌面端记录API数据较少，保持使用totalConsultations:', userData.value.totalQuestions);
              }
            } else {
              console.log('📊 桌面端记录API无数据，保持使用totalConsultations:', userData.value.totalQuestions);
            }
          } catch (recordsError) {
            console.log('📊 桌面端记录API调用失败，这是正常的，保持使用totalConsultations:', userData.value.totalQuestions);
          }
          
        } catch (queryError) {
          console.error('📊 获取咨询状态失败:', queryError);
          // 降级到旧API
          try {
            const queryCountData = await userService.getQueryCount();
            console.log('📊 降级：使用旧API获取咨询次数:', queryCountData);
            if (queryCountData) {
              userData.value.remainingQueries = queryCountData.remainingQueries;
              userData.value.totalConsultations = queryCountData.totalConsultations;
            }
          } catch (fallbackError) {
            console.error('📊 降级API也失败:', fallbackError);
          }
        }
        
      } catch (error) {
        console.error('獲取用戶資料失敗:', error);
        error.value = '無法加載用戶資料，請稍後再試';
      } finally {
        loading.value = false;
      }
      
      // 🔧 Task 2.5: 完全移除本地存储依赖，系统已基于API数据
      // 系统现在完全依赖API数据，生产环境更加可靠
      console.log('📊 桌面端数据加载完成，累计提问数:', userData.value.totalQuestions);
      console.log('📊 桌面端不再依赖本地存储，系统更适合生产环境');
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
    const userPhone = computed(() => userData.value.phoneNumber || userData.value.profile?.phone || userData.value.phone);
    const userOccupation = computed(() => formatOccupation(userData.value.position || userData.value.profile?.position || userData.value.occupation));
    const userIndustry = computed(() => formatIndustry(userData.value.industry || userData.value.profile?.industry));
    const userCompany = computed(() => userData.value.companyName || userData.value.profile?.company || userData.value.company);
    const userPlan = computed(() => userData.value.plan || '基本方案');
    const remainingQueries = computed(() => userData.value.remainingQueries);
    const totalConsultations = computed(() => userData.value.totalConsultations);
    const totalQuestions = computed(() => userData.value.totalQuestions);
    const todayUsageCount = computed(() => userData.value.todayUsageCount);
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
    
    // 進入編輯模式
    const editField = (field) => {
      editing[field] = true;
      
      // 設置初始值
      switch (field) {
        case 'name':
          editValues.name = userName.value;
          break;
        case 'phone':
          editValues.phone = userPhone.value;
          break;
        case 'occupation':
          editValues.occupation = userOccupation.value;
          break;
        case 'industry':
          editValues.industry = userIndustry.value;
          break;
        case 'company':
          editValues.company = userCompany.value;
          break;
        default:
          break;
      }
    };
    
    // 保存編輯的字段值
    const saveField = async (field) => {
      loading.value = true;
      error.value = '';
      
      try {
        // 構建用於更新的數據對象
        const updateData = {};
        switch (field) {
          case 'name':
            updateData.name = editValues.name.trim();
            break;
          case 'phone':
            updateData.phoneNumber = editValues.phone.trim(); // 使用 phoneNumber 字段與後端保持一致
            console.log(`保存手機號碼，值: ${editValues.phone.trim()}`);
            break;
          case 'occupation':
            updateData.profile = { position: editValues.occupation.trim() };
            break;
          case 'industry':
            updateData.profile = { industry: editValues.industry.trim() };
            break;
          case 'company':
            updateData.companyName = editValues.company.trim(); // 使用 companyName 字段與後端保持一致
            console.log(`保存公司名稱，值: ${editValues.company.trim()}`);
            break;
          default:
            break;
        }
        
        console.log(`準備更新用戶資料，字段: ${field}，數據:`, JSON.stringify(updateData));
        
        // 調用用戶服務更新資料
        const result = await userService.updateUserProfile(updateData);
        console.log(`API 更新結果:`, JSON.stringify(result));
        
        // 更新本地狀態
        if (result) {
          // 根據字段更新本地狀態
          if (field === 'name') userData.value.name = editValues.name;
          if (field === 'phone') {
            userData.value.phoneNumber = editValues.phone;
            // 同时更新profile中的值保持一致
            if (!userData.value.profile) userData.value.profile = {};
            userData.value.profile.phone = editValues.phone;
          }
          if (field === 'occupation') {
            userData.value.position = editValues.occupation;
            if (!userData.value.profile) userData.value.profile = {};
            userData.value.profile.position = editValues.occupation;
            userData.value.profile.occupation = editValues.occupation; // 兼容性
          }
          if (field === 'industry') {
            userData.value.industry = editValues.industry;
            if (!userData.value.profile) userData.value.profile = {};
            userData.value.profile.industry = editValues.industry;
          }
          if (field === 'company') {
            userData.value.companyName = editValues.company;
            if (!userData.value.profile) userData.value.profile = {};
            userData.value.profile.company = editValues.company;
          }
          
          // 確保同步更新 localStorage 中的用戶數據
          const currentUser = authService.getCurrentUser() || {};
          
          // 根據欄位類型更新 localStorage 中相應的字段
          if (field === 'name') {
            currentUser.name = editValues.name;
          }
          if (field === 'phone') {
            currentUser.phoneNumber = editValues.phone; // 使用統一的 phoneNumber 字段
            console.log(`已更新 localStorage 中的 phoneNumber 字段: ${currentUser.phoneNumber}`);
            // 同时删除可能存在的旧字段，避免数据不一致
            if ('phone' in currentUser) {
              console.log(`刪除 localStorage 中的冗餘 phone 字段: ${currentUser.phone}`);
              delete currentUser.phone;
            }
            // 同时更新profile中的值
            if (!currentUser.profile) currentUser.profile = {};
            currentUser.profile.phone = editValues.phone;
          }
          if (field === 'company') {
            currentUser.companyName = editValues.company; // 使用統一的 companyName 字段
            console.log(`已更新 localStorage 中的 companyName 字段: ${currentUser.companyName}`);
            // 同时删除可能存在的旧字段，避免数据不一致
            if ('company' in currentUser) {
              console.log(`刪除 localStorage 中的冗餘 company 字段: ${currentUser.company}`);
              delete currentUser.company;
            }
            // 同时更新profile中的值
            if (!currentUser.profile) currentUser.profile = {};
            currentUser.profile.company = editValues.company;
          }
          
          // 更新 profile 相關字段
          if (!currentUser.profile) currentUser.profile = {};
          if (field === 'occupation') {
            currentUser.position = editValues.occupation;
            currentUser.profile.position = editValues.occupation;
            currentUser.profile.occupation = editValues.occupation; // 兼容性
          }
          if (field === 'industry') {
            currentUser.industry = editValues.industry;
            currentUser.profile.industry = editValues.industry;
          }
          
          // 保存更新後的用戶數據到 localStorage
          localStorage.setItem('auth_user', JSON.stringify(currentUser));
          console.log('本地存儲的用戶資料已更新:', JSON.stringify(currentUser));
          
          successMessage.value = '資料更新成功';
          setTimeout(() => {
            successMessage.value = '';
          }, 3000);
        }
        
        // 退出編輯模式
        editing[field] = false;
      } catch (err) {
        console.error(`保存${field}失敗:`, err);
        error.value = err.message || `保存${field}失敗，請稍後再試`;
      } finally {
        loading.value = false;
      }
    };
    
    // 取消編輯
    const cancelEdit = (field) => {
      editing[field] = false;
      
      // 恢復原始值，使用计算属性获取当前显示的值
      switch (field) {
        case 'name':
          editValues.name = userName.value;
          break;
        case 'phone':
          editValues.phone = userPhone.value;
          break;
        case 'occupation':
          editValues.occupation = userOccupation.value;
          break;
        case 'industry':
          editValues.industry = userIndustry.value;
          break;
        case 'company':
          editValues.company = userCompany.value;
          break;
        default:
          break;
      }
    };
    
    // 變更密碼
    const changePassword = () => {
      router.push('/change-password');
    };
    
    // 登出
    const logout = async () => {
      try {
        await authService.logout();
        routerLogout();
        router.push('/login');
      } catch (error) {
        console.error('登出失敗:', error);
        // 即使API调用失败，我们也强制登出
        authService.clearLocalToken();
        router.push('/login');
      }
    };
    
    // 計算首頁路由，保留用戶ID
    const homeRoute = computed(() => {
      const userId = localStorage.getItem('auth_user_id') || '';
      // 如果有用戶ID，返回到用戶專屬頁面，否則返回根路徑
      return userId ? { path: `/user/${userId}` } : { path: '/' };
    });
    
    // 🔧 Task 1.3: 生命周期钩子 - 添加事件监听
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
      todayUsageCount,
      lastConsultTime,
      editing,
      editValues,
      notificationsEnabled,
      language,
      editField,
      saveField,
      cancelEdit,
      changePassword,
      logout,
      homeRoute,
      loading,
      error,
      successMessage
    };
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 20px;
  position: relative;
}

.home-nav-button {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 40px;
  height: 40px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #f0f0f0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  z-index: 10;
}

.home-nav-button svg {
  transform: translateY(1px); /* 图标向下微调 */
}

.home-nav-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.profile-content {
  display: flex;
  gap: 30px;
  padding-top: 10px; /* 减少顶部边距，内容向上移 */
}

/* 左側邊欄 */
.profile-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 600;
  margin-bottom: 15px;
}

.profile-name {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 5px;
  color: #111827;
}

.profile-plan {
  color: #6b7280;
  margin-bottom: 20px;
  font-size: 15px;
}

.profile-queries-container {
  width: 100%;
  margin-bottom: 20px;
}

.profile-queries {
  background: #f3f9ff;
  color: #3b82f6;
  padding: 12px;
  border-radius: 8px;
  font-size: 15px;
  margin-bottom: 10px;
}

.profile-queries span {
  font-weight: 600;
}

.add-queries-btn {
  width: 100%;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 0;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-queries-btn:hover {
  background: #2563eb;
}

.logout-btn {
  width: 100%;
  background: #f9fafb;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 8px;
  padding: 10px 0;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #fee2e2;
}

.stats-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-title {
  padding: 15px 20px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #f3f4f6;
  margin: 0;
  color: #111827;
}

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

/* 主內容區域 */
.profile-main {
  flex: 1;
}

.info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.info-grid {
  padding: 5px 0;
}

.info-item {
  display: flex;
  padding: 15px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  width: 120px;
  color: #4b5563;
  font-size: 15px;
  padding-top: 6px;
}

.info-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-content span {
  font-size: 15px;
  color: #111827;
  flex: 1;
}

.edit-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 15px;
}

.edit-btn, .save-btn, .cancel-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
}

.edit-btn {
  background: #f3f4f6;
  color: #4b5563;
  border: none;
}

.save-btn {
  background: #3b82f6;
  color: white;
  border: none;
}

.cancel-btn {
  background: white;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

/* 設定列表 */
.settings-list {
  padding: 5px 0;
}

.settings-item {
  display: flex;
  padding: 15px 20px;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
  justify-content: space-between;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-info {
  flex: 1;
}

.settings-label {
  font-size: 15px;
  color: #111827;
  margin-bottom: 3px;
}

.settings-desc {
  font-size: 13px;
  color: #6b7280;
}

.action-btn {
  padding: 6px 15px;
  border-radius: 6px;
  background: #f3f4f6;
  color: #111827;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background: #e5e7eb;
}

.action-btn.danger {
  color: #ef4444;
}

.action-btn.danger:hover {
  background: #fee2e2;
}

/* 切換開關樣式 */
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

/* 語言選擇 */
.language-select select {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  background: white;
}

/* 響應式調整 */
@media (max-width: 900px) {
  .profile-content {
    flex-direction: column;
  }
  
  .profile-sidebar {
    width: 100%;
  }
}
</style> 