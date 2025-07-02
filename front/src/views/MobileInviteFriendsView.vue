<template>
  <div class="mobile-invite-container">
    <!-- 頁面頭部 -->
    <div class="page-header">
      <router-link to="/mobile" class="back-btn">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        <span>返回</span>
      </router-link>
      <h1 class="page-title">邀請好友</h1>
    </div>

    <div class="page-content">
      <!-- 加載狀態 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">正在載入邀請數據...</p>
      </div>
      
      <!-- 邀請碼卡片 -->
      <div v-else class="card invite-code-card">
        <h2 class="card-title">您的專屬邀請碼</h2>
        
        <div class="invite-code">{{ inviteCode }}</div>
        
        <button 
          @click="copyInviteCode" 
          class="copy-btn primary-btn"
        >
          <svg class="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
          </svg>
          複製邀請碼
        </button>
      </div>

      <!-- 邀請文案區域 -->
      <div v-else class="card invite-text-card">
        <div class="card-header">
          <h3 class="subtitle">邀請文案</h3>
          <div class="action-btns">
            <button 
              v-if="!isEditing" 
              @click="startEditing" 
              class="icon-btn"
            >
              <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
              </svg>
            </button>
            <button 
              v-if="isEditing" 
              @click="saveInviteText" 
              class="icon-btn save-btn"
            >
              <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- 可編輯的文案區域 -->
        <textarea 
          v-if="isEditing" 
          v-model="editableInviteText" 
          class="invite-text-editor"
          rows="5"
        ></textarea>
        
        <!-- 僅顯示文案 -->
        <div v-else class="invite-text-display">
          <p>{{ customInviteText }}</p>
        </div>
        
        <button 
          @click="copyInviteText" 
          class="copy-btn secondary-btn"
        >
          <svg class="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
          </svg>
          複製文案
        </button>
      </div>

      <!-- 邀請統計卡片 -->
      <div v-else class="stats-container">
        <!-- 已邀請人數 -->
        <div class="stat-card">
          <div class="stat-icon bg-blue-100">
            <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">已邀請人數</div>
            <div class="stat-value">{{ invitedCount }}</div>
          </div>
        </div>
        
        <!-- 獲得的額外諮詢次數 -->
        <div class="stat-card">
          <div class="stat-icon bg-green-100">
            <svg class="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">額外諮詢次數</div>
            <div class="stat-value">{{ bonusConsultations }}</div>
          </div>
        </div>
      </div>

      <!-- 邀請列表卡片 -->
      <div v-else class="card friends-list-card">
        <h2 class="card-title">已邀請好友</h2>
        
        <div v-if="invitedFriends.length === 0" class="empty-state">
          <svg class="w-12 h-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"></path>
          </svg>
          <p>您尚未成功邀請任何好友</p>
          <p class="text-sm">邀請好友註冊使用後，他們將出現在這裡</p>
        </div>
        
        <div v-else class="friends-list">
          <div 
            v-for="friend in invitedFriends" 
            :key="friend.id" 
            class="friend-card"
          >
            <div class="avatar">
              {{ friend.name.charAt(0) }}
            </div>
            <div class="friend-info">
              <div class="friend-name">{{ friend.name }}</div>
              <div class="friend-email">{{ maskEmail(friend.email) }}</div>
              <div class="friend-date">{{ formatDate(friend.registrationDate) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 獎勵規則卡片 (可折疊) -->
      <div v-else class="card rules-card">
        <div 
          class="card-header clickable"
          @click="showRules = !showRules"
        >
          <h2 class="card-title">獎勵規則</h2>
          <svg 
            class="w-5 h-5 transition-transform" 
            :class="{ 'rotate-180': showRules }"
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </div>
        
        <div v-if="showRules" class="rules-content">
          <div class="rule-item">
            <div class="rule-icon text-blue-500">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="rule-content">
              <h3 class="rule-title">邀請者獎勵</h3>
              <p class="rule-text">每成功邀請1人，您將獲得{{ inviteSettings.inviterBonus }}次額外的免費諮詢額度。</p>
            </div>
          </div>
          
          <div class="rule-item">
            <div class="rule-icon text-green-500">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="rule-content">
              <h3 class="rule-title">被邀請者獎勵</h3>
              <p class="rule-text">使用邀請碼註冊的新用戶，免費諮詢次數額外增加{{ inviteSettings.inviteeBonus }}次。</p>
            </div>
          </div>
          
          <div class="rule-item">
            <div class="rule-icon text-yellow-500">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="rule-content">
              <h3 class="rule-title">使用規則</h3>
              <p class="rule-text">每個電子郵件只能使用邀請碼一次，不可重複使用。</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 複製成功提示 -->
    <div
      v-if="showCopyMessage"
      class="toast-message"
      :class="{ 'show': showCopyMessage }"
    >
      <div class="toast-content">
        <svg class="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        {{ copyMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import authService from '../services/auth';
import { inviteService } from '../services/inviteService';
import { mockUserStore } from '../store/mockUserStore';

// 基本數據
const inviteCode = ref('--------'); // 初始值
const invitedCount = ref(0);
const showCopyMessage = ref(false);
const copyMessage = ref('');
const showRules = ref(false);
const loading = ref(true);

// 邀請設置和獎勵
const inviteSettings = ref({
  inviterBonus: 10, // 邀請人獲得的獎勵次數
  inviteeBonus: 10  // 被邀請人獲得的獎勵次數
});

// 獲得的額外諮詢次數（直接使用後端提供的數據）
const bonusConsultations = ref(0);

// 邀請文案編輯相關
const isEditing = ref(false);
const editableInviteText = ref('');
const customInviteText = ref('');

// 已邀請好友列表
const invitedFriends = ref([]);

// 獲取當前用戶信息
const currentUser = ref(null);

// 計算邀請鏈接
const inviteLink = computed(() => {
  return `${window.location.origin}/mobile/register?invite=${inviteCode.value}`;
});

// 默認邀請文案（動態獎勵）
const defaultInviteText = computed(() => {
  const totalBonus = 10 + inviteSettings.value.inviteeBonus; // 基礎10次 + 邀請獎勵
  return `我正在使用勞法通AI，它能夠快速回答勞動法規相關問題！使用我的邀請碼 ${inviteCode.value} 註冊，你可以獲得${totalBonus}次免費諮詢額度。註冊網址：${window.location.origin}/mobile/register?invite=${inviteCode.value}`;
});

// 初始化
onMounted(async () => {
  // 獲取當前用戶
  currentUser.value = authService.getCurrentUser();
  
  if (currentUser.value && currentUser.value.id) {
    await loadInviteData();
  }
});

// 獲取邀請數據 - 集成真實API
async function loadInviteData() {
  loading.value = true;
  
  try {
    console.log('開始載入邀請數據...');
    
    // 並行獲取邀請碼、統計數據和設置
    const [codeResponse, statsResponse, settingsResponse] = await Promise.all([
      inviteService.getMyInviteCode(),
      inviteService.getMyInviteStats(),
      inviteService.getInviteSettings().catch(err => {
        console.warn('獲取邀請設置失敗，使用默認值:', err);
        return { success: true, data: inviteSettings.value };
      })
    ]);
    
    // 設置邀請碼
    if (codeResponse.success) {
      inviteCode.value = codeResponse.data.inviteCode;
      console.log('獲取邀請碼成功:', inviteCode.value);
    }
    
    // 設置統計數據
    if (statsResponse.success) {
      const stats = statsResponse.data;
      invitedCount.value = stats.totalInvited || 0;
      bonusConsultations.value = stats.totalBonusEarned || 0;  // ✅ 直接使用後端提供的獎勵數據
      
      // 處理已邀請好友列表（信息隱藏）
      if (stats.recentInvitees && Array.isArray(stats.recentInvitees)) {
        invitedFriends.value = stats.recentInvitees.map(friend => ({
          id: friend.id || Date.now() + Math.random(),
          name: inviteService.maskName(friend.name),
          email: inviteService.maskEmail(friend.email),
          registrationDate: friend.invitedAt
        }));
      }
      
      console.log('獲取邀請統計成功:', stats);
    }
    
    // 設置邀請獎勵配置
    if (settingsResponse.success && settingsResponse.data) {
      inviteSettings.value = {
        inviterBonus: settingsResponse.data.inviterBonus || 10,
        inviteeBonus: settingsResponse.data.inviteeBonus || 10
      };
      console.log('獲取邀請設置成功:', inviteSettings.value);
    }
    
    // 載入自定義文案
    loadCustomInviteText();
    
  } catch (error) {
    console.error('獲取邀請數據失敗:', error);
    
    // 降級到mock數據
    try {
      console.log('降級使用mock數據...');
      inviteCode.value = await mockUserStore.getUserInviteCode(currentUser.value.id);
      const stats = await mockUserStore.getInviteStats(currentUser.value.id);
      invitedCount.value = stats.totalInvited || 0;  // ✅ 使用正確字段名
      bonusConsultations.value = stats.totalBonusEarned || 0;  // ✅ 使用正確字段名
      // 移除 fetchInvitedFriends() 調用，直接使用API數據
      loadCustomInviteText();
    } catch (fallbackError) {
      console.error('mock數據也失敗:', fallbackError);
    }
  } finally {
    loading.value = false;
  }
}

// 監聽邀請碼變化，更新邀請文案
watch(inviteCode, () => {
  if (!isEditing.value) {
    customInviteText.value = defaultInviteText.value;
  }
});

// 載入自定義文案
function loadCustomInviteText() {
  const userId = currentUser.value.id;
  const savedText = localStorage.getItem(`invite_text_${userId}`);
  
  if (savedText) {
    customInviteText.value = savedText;
  } else {
    customInviteText.value = defaultInviteText.value;
  }
  
  editableInviteText.value = customInviteText.value;
}

// 開始編輯
function startEditing() {
  isEditing.value = true;
  editableInviteText.value = customInviteText.value;
}

// 保存邀請文案
function saveInviteText() {
  isEditing.value = false;
  customInviteText.value = editableInviteText.value;
  
  // 保存到localStorage
  const userId = currentUser.value.id;
  localStorage.setItem(`invite_text_${userId}`, customInviteText.value);
  
  showCopySuccess('邀請文案已保存！');
}

// 獲取已邀請好友列表
async function fetchInvitedFriends() {
  try {
    // 獲取所有邀請記錄
    const userId = currentUser.value.id;
    const records = JSON.parse(localStorage.getItem('app_invite_records') || '[]');
    const userInvites = records.filter(record => record.inviterId === userId);
    
    // 根據邀請記錄獲取用戶信息
    const friendPromises = userInvites.map(async (invite) => {
      const user = await mockUserStore.getUserById(invite.inviteeId);
      return user;
    });
    
    invitedFriends.value = await Promise.all(friendPromises);
    invitedFriends.value = invitedFriends.value.filter(Boolean); // 過濾掉null或undefined
  } catch (error) {
    console.error('獲取邀請好友列表失敗:', error);
  }
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// 遮罩Email地址（使用邀請服務）
function maskEmail(email) {
  return inviteService.maskEmail(email);
}

// 複製邀請碼
function copyInviteCode() {
  navigator.clipboard.writeText(inviteCode.value)
    .then(() => showCopySuccess('邀請碼已複製到剪貼板！'))
    .catch(err => console.error('複製失敗:', err));
}

// 複製邀請文案
function copyInviteText() {
  navigator.clipboard.writeText(customInviteText.value)
    .then(() => showCopySuccess('邀請文案已複製到剪貼板！'))
    .catch(err => console.error('複製失敗:', err));
}

// 顯示複製成功訊息
function showCopySuccess(message) {
  copyMessage.value = message;
  showCopyMessage.value = true;
  
  // 2秒後隱藏訊息
  setTimeout(() => {
    showCopyMessage.value = false;
  }, 2000);
}
</script>

<style scoped>
.mobile-invite-container {
  min-height: 100vh;
  background-color: #f9fafb;
  padding-bottom: 3rem;
  position: relative;
}

.page-header {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  display: flex;
  align-items: center;
  color: #3b82f6;
  font-size: 0.875rem;
  margin-right: 1rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  flex-grow: 1;
  text-align: center;
  margin-right: 2rem; /* Compensate for the back button */
}

.page-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.clickable {
  cursor: pointer;
}

.subtitle {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

.invite-code {
  font-family: monospace;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #3b82f6;
  text-align: center;
  padding: 1rem 0;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.primary-btn, .secondary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

.primary-btn {
  background-color: #3b82f6;
  color: white;
}

.primary-btn:hover {
  background-color: #2563eb;
}

.secondary-btn {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.secondary-btn:hover {
  background-color: #e5e7eb;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  background-color: #f3f4f6;
  color: #4b5563;
  transition: all 0.2s;
}

.icon-btn:hover {
  background-color: #e5e7eb;
}

.save-btn {
  color: #059669;
}

.invite-text-editor {
  width: 100%;
  min-height: 6rem;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  resize: vertical;
}

.invite-text-display {
  background-color: #f9fafb;
  padding: 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #4b5563;
  white-space: pre-wrap;
  margin-bottom: 1rem;
  min-height: 4rem;
}

.stats-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  flex: 1;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
}

.stat-content {
  flex-grow: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.empty-state {
  text-align: center;
  padding: 2rem 0;
  color: #6b7280;
}

.friends-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.friend-card {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 0.75rem;
}

.friend-info {
  flex-grow: 1;
}

.friend-name {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.friend-email {
  font-size: 0.75rem;
  color: #6b7280;
}

.friend-date {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

.rules-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.rule-item {
  display: flex;
  align-items: flex-start;
}

.rule-icon {
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.rule-title {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.rule-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.toast-message {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
  background-color: rgba(31, 41, 55, 0.9);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  z-index: 50;
  transition: transform 0.3s ease;
}

.toast-message.show {
  transform: translateX(-50%) translateY(0);
}

.toast-content {
  display: flex;
  align-items: center;
}

/* Transitions */
.rotate-180 {
  transform: rotate(180deg);
}

.transition-transform {
  transition: transform 0.2s ease;
}

/* 加載狀態樣式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: #6b7280;
  font-size: 0.875rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 