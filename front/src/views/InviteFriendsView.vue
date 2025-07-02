<template>
  <div class="invite-container">
    <!-- 頁面頭部 -->
    <div class="page-header">
      <div class="container mx-auto px-4 py-6">
        <!-- 添加返回首頁按鈕 -->
        <div class="flex items-center mb-4">
          <router-link to="/" class="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span>回到首頁</span>
          </router-link>
        </div>

        <h1 class="text-2xl font-bold text-gray-800">邀請好友</h1>
        <p class="text-gray-600 mt-2">邀請您的朋友和同事一起使用勞法通AI，雙方都能獲得免費諮詢獎勵！</p>
      </div>
    </div>

    <div class="container mx-auto px-4 py-6">
      <!-- 加載狀態 -->
      <div v-if="loading" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="animate-pulse">
          <div class="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="h-16 bg-gray-200 rounded mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      <!-- 邀請卡片 -->
      <div v-else class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">您的專屬邀請碼</h2>
        
        <!-- 邀請碼展示區 -->
        <div class="invite-code-display bg-gray-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between mb-6">
          <div class="invite-code text-2xl font-mono font-bold text-blue-600 tracking-wider">
            {{ inviteCode }}
          </div>
          <button 
            @click="copyInviteCode" 
            class="copy-button bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors flex items-center"
          >
            <svg class="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
            </svg>
            複製邀請碼
          </button>
        </div>

        <!-- 修改後的邀請文案區域 -->
        <div class="invite-text-display bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div class="flex justify-between items-center mb-3">
            <p class="text-gray-700 text-sm font-medium">邀請文案：</p>
            <div class="flex space-x-2">
              <button 
                v-if="!isEditing" 
                @click="startEditing" 
                class="edit-button bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 text-sm rounded-md transition-colors flex items-center"
              >
                <svg class="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                </svg>
                編輯
              </button>
              <button 
                v-if="isEditing" 
                @click="saveInviteText" 
                class="save-button bg-green-100 hover:bg-green-200 text-green-800 py-1 px-3 text-sm rounded-md transition-colors flex items-center"
              >
                <svg class="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                保存
              </button>
              <button 
                @click="copyInviteText" 
                class="copy-button bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-3 text-sm rounded-md transition-colors flex items-center"
              >
                <svg class="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
                </svg>
                複製
              </button>
            </div>
          </div>
          
          <!-- 可編輯的文案區域 -->
          <textarea 
            v-if="isEditing" 
            v-model="editableInviteText" 
            class="w-full min-h-24 p-3 text-gray-600 text-sm border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          ></textarea>
          
          <!-- 僅顯示文案 -->
          <div v-else class="bg-white p-3 border border-gray-100 rounded-md">
            <p class="text-gray-600 text-sm whitespace-pre-wrap">{{ customInviteText }}</p>
          </div>
        </div>
      </div>

      <!-- 邀請統計卡片 -->
      <div v-if="!loading" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">邀請統計</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 已邀請人數 -->
          <div class="stat-card bg-blue-50 rounded-lg p-4">
            <div class="stat-label text-sm text-gray-600 mb-1">已邀請人數</div>
            <div class="stat-value text-3xl font-bold text-blue-600">{{ invitedCount }}</div>
          </div>
          
          <!-- 獲得的額外諮詢次數 -->
          <div class="stat-card bg-green-50 rounded-lg p-4">
            <div class="stat-label text-sm text-gray-600 mb-1">獲得的額外諮詢次數</div>
            <div class="stat-value text-3xl font-bold text-green-600">{{ bonusConsultations }}</div>
          </div>
        </div>
      </div>

      <!-- 邀請列表卡片 -->
      <div v-if="!loading" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">已邀請好友</h2>
        
        <div v-if="invitedFriends.length === 0" class="bg-gray-50 rounded-lg p-10 text-center">
          <p class="text-gray-500">您尚未成功邀請任何好友</p>
          <p class="text-gray-400 text-sm mt-2">邀請好友註冊使用後，他們將出現在這裡</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full bg-white">
            <thead class="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th class="py-3 px-4 text-left">用戶名</th>
                <th class="py-3 px-4 text-left">電子郵箱</th>
                <th class="py-3 px-4 text-left">註冊時間</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-gray-800 text-sm">
              <tr v-for="friend in invitedFriends" :key="friend.id" class="hover:bg-gray-50">
                <td class="py-3 px-4">{{ friend.name }}</td>
                <td class="py-3 px-4">{{ maskEmail(friend.email) }}</td>
                <td class="py-3 px-4">{{ formatDate(friend.registrationDate) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 邀請說明卡片 -->
      <div v-if="!loading" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">獎勵規則</h2>
        
        <div class="rules-container space-y-4">
          <div class="rule-item flex">
            <div class="rule-icon mr-4 text-blue-500">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="rule-content">
              <h3 class="text-md font-semibold text-gray-800">邀請者獎勵</h3>
              <p class="text-gray-600">每成功邀請1人，您將獲得{{ inviteSettings.inviterBonus }}次額外的免費諮詢額度。</p>
            </div>
          </div>
          
          <div class="rule-item flex">
            <div class="rule-icon mr-4 text-green-500">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="rule-content">
              <h3 class="text-md font-semibold text-gray-800">被邀請者獎勵</h3>
              <p class="text-gray-600">使用邀請碼註冊的新用戶，免費諮詢次數將額外增加{{ inviteSettings.inviteeBonus }}次。</p>
            </div>
          </div>
          
          <div class="rule-item flex">
            <div class="rule-icon mr-4 text-yellow-500">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <div class="rule-content">
              <h3 class="text-md font-semibold text-gray-800">使用規則</h3>
              <p class="text-gray-600">每個電子郵件只能使用邀請碼一次，不可重複使用。</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 複製成功提示 -->
    <div
      v-if="showCopyMessage"
      class="copy-message fixed bottom-6 right-6 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg transition-opacity"
      :class="{ 'opacity-100': showCopyMessage, 'opacity-0': !showCopyMessage }"
    >
      {{ copyMessage }}
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
  return `${window.location.origin}/register?invite=${inviteCode.value}`;
});

// 默認邀請文案（動態獎勵）
const defaultInviteText = computed(() => {
  const totalBonus = 10 + inviteSettings.value.inviteeBonus; // 基礎10次 + 邀請獎勵
  return `我正在使用勞法通AI，它能夠快速回答勞動法規相關問題！使用我的邀請碼 ${inviteCode.value} 註冊，你可以獲得${totalBonus}次免費諮詢額度。註冊網址：${window.location.origin}/register?invite=${inviteCode.value}，請在註冊頁面邀請碼欄位，填入邀請碼：${inviteCode.value}`;
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
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 遮罩Email地址
function maskEmail(email) {
  if (!email) return '-';
  
  const [localPart, domain] = email.split('@');
  
  if (localPart.length <= 2) {
    return `${localPart}@${domain}`;
  }
  
  const firstChar = localPart.charAt(0);
  const lastChar = localPart.charAt(localPart.length - 1);
  const maskedPart = 'X'.repeat(localPart.length - 2);
  
  return `${firstChar}${maskedPart}${lastChar}@${domain}`;
}

// 複製邀請碼
function copyInviteCode() {
  navigator.clipboard.writeText(inviteCode.value)
    .then(() => showCopySuccess('邀請碼已複製到剪貼板！'))
    .catch(err => console.error('複製失敗:', err));
}

// 注意：根據簡化需求，已移除重新生成邀請碼功能
// 每個用戶的邀請碼是唯一且不可修改的

// 複製邀請鏈接
function copyInviteLink() {
  navigator.clipboard.writeText(inviteLink.value)
    .then(() => showCopySuccess('邀請鏈接已複製到剪貼板！'))
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
.invite-container {
  min-height: 100vh;
  background-color: #f9fafb;
}

.page-header {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
}

.copy-message {
  transition: opacity 0.3s ease;
}

.invite-code {
  letter-spacing: 0.1em;
}

.rule-item {
  transition: transform 0.2s ease;
}

.rule-item:hover {
  transform: translateX(5px);
}
</style> 