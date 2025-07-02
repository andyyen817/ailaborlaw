<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h1 class="text-2xl font-semibold text-gray-800 mb-6">聊天記錄診斷工具</h1>
    
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <h2 class="text-lg font-semibold text-gray-700 mb-4">測試和診斷</h2>
      
      <div class="space-y-4">
        <div class="flex space-x-2">
          <button @click="createTestData" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            創建測試聊天記錄
          </button>
          <button @click="clearChatHistory" class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
            清除全局聊天記錄
          </button>
          <button @click="refreshDiagnostics" class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
            刷新診斷
          </button>
        </div>
        
        <div class="flex space-x-2">
          <button @click="createSpecificUserData" class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">
            創建 creatyen@gmail.com 的記錄
          </button>
          <div class="flex items-center">
            <input type="checkbox" id="appendData" v-model="appendData" class="mr-1">
            <label for="appendData" class="text-sm text-gray-700">添加而非覆蓋數據</label>
          </div>
        </div>
        
        <div class="flex space-x-2">
          <button @click="backupBossUserChatRecords" class="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">
            備份BOSS用戶聊天記錄
          </button>
          <button @click="restoreBossUserChatRecords" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            恢復BOSS用戶聊天記錄
          </button>
        </div>
        
        <div class="flex space-x-2">
          <button @click="fixDuplicateUserIds" class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
            修復重複用戶ID問題
          </button>
          <div class="flex items-center">
            <input type="checkbox" id="generateNewIds" v-model="generateNewIds" class="mr-1">
            <label for="generateNewIds" class="text-sm text-gray-700">為重複用戶生成新ID</label>
          </div>
        </div>
        
        <div class="flex space-x-2">
          <button @click="fixSpecificUserIds" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            修復特定用戶ID問題 (creatyen)
          </button>
          <div class="flex items-center">
            <input type="checkbox" id="forceRecreate" v-model="forceRecreate" class="mr-1">
            <label for="forceRecreate" class="text-sm text-gray-700">強制重新生成用戶ID</label>
          </div>
        </div>
        
        <div class="flex space-x-2">
          <button @click="cleanupUserData" class="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900">
            徹底清理用戶數據
          </button>
          <input 
            type="text" 
            v-model="cleanupEmail" 
            placeholder="輸入要清理的郵箱" 
            class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div class="bg-gray-100 p-4 rounded-lg">
          <h3 class="font-medium text-gray-700 mb-2">localStorage 診斷</h3>
          <div class="space-y-2">
            <p><span class="font-medium">全局聊天記錄大小:</span> {{ chatHistorySize }}</p>
            <p><span class="font-medium">消息數量:</span> {{ messageCount }}</p>
            <p><span class="font-medium">會話數量:</span> {{ conversationCount }}</p>
            <p><span class="font-medium">最後更新時間:</span> {{ lastUpdateTime }}</p>
          </div>
        </div>
        
        <div v-if="showSample" class="bg-gray-100 p-4 rounded-lg">
          <h3 class="font-medium text-gray-700 mb-2 flex justify-between">
            <span>數據樣本</span>
            <button @click="showSample = false" class="text-gray-500 hover:text-gray-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </h3>
          <pre class="bg-gray-200 p-3 rounded text-xs overflow-auto max-h-64">{{ sampleData }}</pre>
        </div>
      </div>
    </div>
    
    <div class="bg-white p-4 rounded-lg shadow">
      <h2 class="text-lg font-semibold text-gray-700 mb-4">手動創建聊天記錄</h2>
      
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="userId" class="block text-sm font-medium text-gray-700 mb-1">用戶 ID</label>
            <input type="text" id="userId" v-model="newChat.userId" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div>
            <label for="conversationId" class="block text-sm font-medium text-gray-700 mb-1">會話 ID</label>
            <input type="text" id="conversationId" v-model="newChat.conversationId" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
          </div>
        </div>
        
        <div>
          <label for="userMessage" class="block text-sm font-medium text-gray-700 mb-1">用戶消息</label>
          <textarea id="userMessage" v-model="newChat.userMessage" rows="3"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
        </div>
        
        <div>
          <label for="aiMessage" class="block text-sm font-medium text-gray-700 mb-1">AI 回覆</label>
          <textarea id="aiMessage" v-model="newChat.aiMessage" rows="3"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
        </div>
        
        <div>
          <button @click="addManualChat" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            添加聊天記錄
          </button>
          <span v-if="addSuccess" class="text-green-500 ml-2">添加成功!</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import chatService from '@/services/chatService';

// 全局聊天記錄狀態
const chatHistorySize = ref('未知');
const messageCount = ref(0);
const conversationCount = ref(0);
const lastUpdateTime = ref('未知');
const showSample = ref(false);
const sampleData = ref('');

// 手動添加聊天記錄
const newChat = ref({
  userId: localStorage.getItem('userId') || localStorage.getItem('auth_user_id') || 'test_user',
  conversationId: 'manual_conv_' + Date.now(),
  userMessage: '',
  aiMessage: ''
});
const addSuccess = ref(false);
const appendData = ref(true);
const generateNewIds = ref(false);
const forceRecreate = ref(false);
const cleanupEmail = ref('');

// 創建測試數據
function createTestData() {
  if (chatService.createTestChatHistory(true)) {
    // 自動備份BOSS用戶聊天記錄
    backupBossUserChatRecords();
    alert('測試聊天記錄創建成功！');
    refreshDiagnostics();
  } else {
    alert('創建測試聊天記錄失敗，請查看控制台日誌。');
  }
}

// 創建特定用戶的測試數據
function createSpecificUserData() {
  if (chatService.createUserSpecificChatHistory(appendData.value)) {
    alert(`已成功${appendData.value ? '添加' : '創建'} creatyen@gmail.com 的聊天記錄！`);
    refreshDiagnostics();
  } else {
    alert('創建特定用戶聊天記錄失敗，請查看控制台日誌。');
  }
}

// 清除全局聊天記錄
function clearChatHistory() {
  if (confirm('確定要清除全局聊天記錄嗎？此操作不可恢復！')) {
    localStorage.removeItem('global_chat_history');
    alert('聊天記錄已清除');
    refreshDiagnostics();
  }
}

// 刷新診斷
function refreshDiagnostics() {
  try {
    const globalStoreKey = 'global_chat_history';
    const globalHistory = localStorage.getItem(globalStoreKey);
    
    if (globalHistory) {
      // 計算大小
      chatHistorySize.value = `${(globalHistory.length / 1024).toFixed(2)} KB`;
      
      try {
        const historyData = JSON.parse(globalHistory);
        messageCount.value = historyData.length;
        
        // 計算會話數量
        const conversations = new Set();
        historyData.forEach(msg => {
          const convId = msg.conversationId || msg.sessionId;
          if (convId) {
            conversations.add(convId);
          }
        });
        conversationCount.value = conversations.size;
        
        // 獲取最後更新時間
        if (historyData.length > 0) {
          const lastItem = historyData[historyData.length - 1];
          lastUpdateTime.value = new Date(lastItem.timestamp).toLocaleString();
          
          // 顯示樣本數據
          showSample.value = true;
          sampleData.value = JSON.stringify(historyData.slice(-2), null, 2);
        } else {
          lastUpdateTime.value = '沒有記錄';
          sampleData.value = '';
          showSample.value = false;
        }
      } catch (e) {
        console.error('解析全局聊天歷史失敗:', e);
        messageCount.value = 0;
        conversationCount.value = 0;
        lastUpdateTime.value = '解析錯誤';
        showSample.value = true;
        sampleData.value = '解析錯誤: ' + e.message + '\n\n' + globalHistory.substring(0, 200) + '...';
      }
    } else {
      chatHistorySize.value = '0 KB';
      messageCount.value = 0;
      conversationCount.value = 0;
      lastUpdateTime.value = '沒有數據';
      showSample.value = false;
      sampleData.value = '';
    }
    
    // 檢查是否存在BOSS用戶的聊天記錄備份
    const bossBackupKey = 'boss_chat_history_backup';
    const hasBossBackup = localStorage.getItem(bossBackupKey) ? true : false;
    if (hasBossBackup) {
      console.log('檢測到BOSS用戶聊天記錄備份存在');
    }
  } catch (error) {
    console.error('診斷失敗:', error);
  }
}

// 備份BOSS用戶聊天記錄
function backupBossUserChatRecords() {
  try {
    const globalStoreKey = 'global_chat_history';
    const globalHistory = localStorage.getItem(globalStoreKey);
    
    if (!globalHistory) {
      console.log('沒有聊天記錄可備份');
      return false;
    }
    
    const historyData = JSON.parse(globalHistory);
    
    // 過濾出BOSS用戶相關的聊天記錄
    const bossRecords = historyData.filter(msg => {
      return msg.userEmail === 'boss@qq.com' || 
             (msg.content && msg.content.includes('boss@qq.com'));
    });
    
    if (bossRecords.length > 0) {
      const bossBackupKey = 'boss_chat_history_backup';
      localStorage.setItem(bossBackupKey, JSON.stringify(bossRecords));
      console.log(`已備份 ${bossRecords.length} 條BOSS用戶聊天記錄`);
      return true;
    } else {
      console.log('沒有找到BOSS用戶聊天記錄');
      return false;
    }
  } catch (error) {
    console.error('備份BOSS用戶聊天記錄失敗:', error);
    return false;
  }
}

// 恢復BOSS用戶聊天記錄
function restoreBossUserChatRecords() {
  try {
    const bossBackupKey = 'boss_chat_history_backup';
    const bossBackup = localStorage.getItem(bossBackupKey);
    
    if (!bossBackup) {
      alert('沒有找到BOSS用戶聊天記錄備份');
      return false;
    }
    
    const bossRecords = JSON.parse(bossBackup);
    
    // 獲取當前全局聊天歷史
    const globalStoreKey = 'global_chat_history';
    const globalHistory = localStorage.getItem(globalStoreKey);
    let currentHistory = [];
    
    if (globalHistory) {
      try {
        currentHistory = JSON.parse(globalHistory);
      } catch (e) {
        console.error('解析全局聊天歷史失敗:', e);
        currentHistory = [];
      }
    }
    
    // 過濾掉當前歷史中可能存在的BOSS用戶記錄（避免重複）
    const filteredHistory = currentHistory.filter(msg => {
      return msg.userEmail !== 'boss@qq.com' && 
             !(msg.content && msg.content.includes('boss@qq.com'));
    });
    
    // 合併BOSS用戶備份記錄
    const mergedHistory = [...filteredHistory, ...bossRecords];
    
    // 按時間排序
    mergedHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // 保存回全局聊天歷史
    localStorage.setItem(globalStoreKey, JSON.stringify(mergedHistory));
    
    alert(`成功恢復 ${bossRecords.length} 條BOSS用戶聊天記錄！`);
    refreshDiagnostics();
    return true;
  } catch (error) {
    console.error('恢復BOSS用戶聊天記錄失敗:', error);
    alert('恢復失敗: ' + error.message);
    return false;
  }
}

// 手動添加聊天記錄
function addManualChat() {
  if (!newChat.value.userMessage || !newChat.value.aiMessage) {
    alert('請輸入用戶消息和AI回覆');
    return;
  }
  
  try {
    // 調用聊天服務的方法保存消息
    chatService.saveToGlobalChatHistory(
      newChat.value.conversationId,
      newChat.value.userMessage,
      newChat.value.aiMessage
    );
    
    // 顯示成功信息
    addSuccess.value = true;
    setTimeout(() => {
      addSuccess.value = false;
    }, 3000);
    
    // 清空輸入框
    newChat.value.userMessage = '';
    newChat.value.aiMessage = '';
    
    // 更新診斷信息
    refreshDiagnostics();
  } catch (error) {
    console.error('添加聊天記錄失敗:', error);
    alert('添加失敗: ' + error.message);
  }
}

// 修復用戶ID重複問題
function fixDuplicateUserIds() {
  try {
    // 從localStorage獲取用戶數據
    const usersStorageKey = 'app_users_mock_data';
    const storedUsers = localStorage.getItem(usersStorageKey);
    
    if (!storedUsers) {
      alert('沒有找到用戶數據');
      return;
    }
    
    // 解析用戶數據
    const users = JSON.parse(storedUsers);
    
    // 檢查是否有用戶ID重複的情況
    const userEmailMap = {};
    const userIdMap = {};
    const duplicateUsers = [];
    
    for (const user of users) {
      // 如果已經有相同的ID
      if (userIdMap[user.id]) {
        duplicateUsers.push({
          ...user,
          duplicateWith: userIdMap[user.id].email
        });
      } else {
        userIdMap[user.id] = user;
      }
      
      // 記錄郵箱和ID的對應關係
      userEmailMap[user.email] = user.id;
    }
    
    if (duplicateUsers.length === 0) {
      alert('沒有找到重複的用戶ID');
      return;
    }
    
    if (generateNewIds.value) {
      // 為重複的用戶生成新ID
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const isDuplicate = duplicateUsers.some(dupUser => dupUser.email === user.email);
        
        if (isDuplicate) {
          // 生成新ID
          const timestamp = Date.now();
          const randomPart = Math.random().toString(36).substring(2, 10);
          const emailHash = user.email ? user.email.split('@')[0].substring(0, 8) : 'user';
          
          const oldId = user.id;
          const newId = `user_${timestamp}_${emailHash}_${randomPart}`;
          
          console.log(`為用戶 ${user.email} 修改ID: ${oldId} -> ${newId}`);
          
          // 更新用戶ID
          users[i].id = newId;
          
          // 更新本地存儲中的關聯數據
          // 1. 用戶邀請碼關聯
          const oldInviteCode = localStorage.getItem(`invite_code_${oldId}`);
          if (oldInviteCode) {
            localStorage.setItem(`invite_code_${newId}`, oldInviteCode);
            localStorage.removeItem(`invite_code_${oldId}`);
          }
          
          // 2. 用戶聊天記錄關聯
          const oldChatHistory = localStorage.getItem(`chat_${oldId}`);
          if (oldChatHistory) {
            localStorage.setItem(`chat_${newId}`, oldChatHistory);
            localStorage.removeItem(`chat_${oldId}`);
          }
          
          // 3. 檢查全局聊天記錄
          const globalChatHistory = localStorage.getItem('global_chat_history');
          if (globalChatHistory) {
            try {
              const chatData = JSON.parse(globalChatHistory);
              let updated = false;
              
              // 更新聊天記錄中的用戶ID
              for (let j = 0; j < chatData.length; j++) {
                if (chatData[j].userId === oldId) {
                  chatData[j].userId = newId;
                  updated = true;
                }
              }
              
              if (updated) {
                localStorage.setItem('global_chat_history', JSON.stringify(chatData));
                console.log(`已更新全局聊天記錄中的用戶ID: ${oldId} -> ${newId}`);
              }
            } catch (e) {
              console.error('解析全局聊天記錄失敗:', e);
            }
          }
          
          // 4. 檢查當前登入用戶
          const currentUserId = localStorage.getItem('auth_user_id');
          if (currentUserId === oldId) {
            localStorage.setItem('auth_user_id', newId);
            
            // 同時更新auth_user對象
            try {
              const authUser = JSON.parse(localStorage.getItem('auth_user'));
              if (authUser && authUser.id === oldId) {
                authUser.id = newId;
                localStorage.setItem('auth_user', JSON.stringify(authUser));
              }
            } catch (e) {
              console.error('更新當前用戶ID失敗:', e);
            }
          }
        }
      }
      
      // 保存更新後的用戶數據
      localStorage.setItem(usersStorageKey, JSON.stringify(users));
      
      alert(`已成功修復 ${duplicateUsers.length} 個重複的用戶ID`);
      refreshDiagnostics();
    } else {
      // 顯示重複用戶信息
      let message = '發現以下重複用戶ID問題:\n\n';
      
      duplicateUsers.forEach(user => {
        message += `用戶 ${user.email} 與 ${user.duplicateWith} 使用相同ID: ${user.id}\n`;
      });
      
      message += '\n請勾選「為重複用戶生成新ID」選項並再次點擊此按鈕來修復。';
      
      alert(message);
    }
  } catch (error) {
    console.error('修復用戶ID重複問題失敗:', error);
    alert('修復失敗: ' + error.message);
  }
}

// 修復特定用戶ID問題 (creatyen系列帳號)
function fixSpecificUserIds() {
  try {
    // 從localStorage獲取用戶數據
    const usersStorageKey = 'app_users_mock_data';
    const storedUsers = localStorage.getItem(usersStorageKey);
    
    if (!storedUsers) {
      alert('沒有找到用戶數據');
      return;
    }
    
    // 解析用戶數據
    const users = JSON.parse(storedUsers);
    
    // 尋找特定的兩個用戶
    const creatyen1 = users.find(u => u.email === 'creatyen@gmail.com');
    const creatyen2 = users.find(u => u.email === 'creatyen2@gmail.com');
    
    let message = '';
    let needUpdate = false;
    
    // 檢查兩個用戶是否存在
    if (!creatyen1 && !creatyen2) {
      alert('未找到creatyen@gmail.com或creatyen2@gmail.com用戶');
      return;
    }
    
    // 檢查是否有ID衝突或ID格式問題
    const hasIdConflict = creatyen1 && creatyen2 && creatyen1.id === creatyen2.id;
    const needsIdUpdate = forceRecreate.value || 
                         (creatyen1 && creatyen1.id.includes('1747')) || 
                         (creatyen2 && creatyen2.id.includes('1747'));
    
    if (hasIdConflict || needsIdUpdate) {
      message = '需要修復的問題:\n';
      if (hasIdConflict) {
        message += `• 檢測到ID衝突: ${creatyen1.email} 和 ${creatyen2.email} 共用ID ${creatyen1.id}\n`;
      }
      
      if (needsIdUpdate) {
        if (creatyen1) {
          message += `• ${creatyen1.email} 當前ID: ${creatyen1.id}\n`;
        }
        if (creatyen2) {
          message += `• ${creatyen2.email} 當前ID: ${creatyen2.id}\n`;
        }
      }
      
      // 開始修復
      if (creatyen1) {
        const oldId1 = creatyen1.id;
        
        // 生成新ID
        const timestamp = Date.now();
        const emailHash = 'creatyen';
        const randomPart = Math.random().toString(36).substring(2, 10);
        const newId1 = `user_${timestamp}_${emailHash}_${randomPart}`;
        
        message += `\n將修改 ${creatyen1.email} 的ID:\n${oldId1} -> ${newId1}\n`;
        
        // 更新用戶ID
        creatyen1.id = newId1;
        needUpdate = true;
        
        // 更新本地存儲中的關聯數據
        updateRelatedData(oldId1, newId1);
      }
      
      if (creatyen2) {
        const oldId2 = creatyen2.id;
        
        // 確保與creatyen1使用不同的時間戳以避免衝突
        setTimeout(() => {
          const timestamp = Date.now();
          const emailHash = 'creatyen2';
          const randomPart = Math.random().toString(36).substring(2, 10);
          const newId2 = `user_${timestamp}_${emailHash}_${randomPart}`;
          
          message += `\n將修改 ${creatyen2.email} 的ID:\n${oldId2} -> ${newId2}\n`;
          
          // 更新用戶ID
          creatyen2.id = newId2;
          needUpdate = true;
          
          // 更新本地存儲中的關聯數據
          updateRelatedData(oldId2, newId2);
          
          // 保存更新後的用戶數據
          if (needUpdate) {
            localStorage.setItem(usersStorageKey, JSON.stringify(users));
            alert(`修復完成!\n${message}`);
            refreshDiagnostics();
          }
        }, 100); // 延遲100毫秒確保時間戳不同
      } else {
        // 如果只有creatyen1，直接保存
        if (needUpdate) {
          localStorage.setItem(usersStorageKey, JSON.stringify(users));
          alert(`修復完成!\n${message}`);
          refreshDiagnostics();
        }
      }
    } else {
      // 沒有問題需要修復
      message = '特定用戶ID檢查結果:\n';
      if (creatyen1) {
        message += `• ${creatyen1.email} ID正常: ${creatyen1.id}\n`;
      }
      if (creatyen2) {
        message += `• ${creatyen2.email} ID正常: ${creatyen2.id}\n`;
      }
      alert(message);
    }
  } catch (error) {
    console.error('修復特定用戶ID失敗:', error);
    alert('修復失敗: ' + error.message);
  }
}

// 更新相關數據
function updateRelatedData(oldId, newId) {
  try {
    // 1. 用戶邀請碼關聯
    const oldInviteCode = localStorage.getItem(`invite_code_${oldId}`);
    if (oldInviteCode) {
      localStorage.setItem(`invite_code_${newId}`, oldInviteCode);
      localStorage.removeItem(`invite_code_${oldId}`);
    }
    
    // 2. 用戶聊天記錄關聯
    const oldChatHistory = localStorage.getItem(`chat_${oldId}`);
    if (oldChatHistory) {
      localStorage.setItem(`chat_${newId}`, oldChatHistory);
      localStorage.removeItem(`chat_${oldId}`);
    }
    
    // 3. 檢查全局聊天記錄
    const globalChatHistory = localStorage.getItem('global_chat_history');
    if (globalChatHistory) {
      try {
        const chatData = JSON.parse(globalChatHistory);
        let updated = false;
        
        // 更新聊天記錄中的用戶ID
        for (let j = 0; j < chatData.length; j++) {
          if (chatData[j].userId === oldId) {
            chatData[j].userId = newId;
            updated = true;
          }
        }
        
        if (updated) {
          localStorage.setItem('global_chat_history', JSON.stringify(chatData));
          console.log(`已更新全局聊天記錄中的用戶ID: ${oldId} -> ${newId}`);
        }
      } catch (e) {
        console.error('解析全局聊天記錄失敗:', e);
      }
    }
    
    // 4. 檢查當前登入用戶
    const currentUserId = localStorage.getItem('auth_user_id');
    if (currentUserId === oldId) {
      localStorage.setItem('auth_user_id', newId);
      
      // 同時更新auth_user對象
      try {
        const authUser = JSON.parse(localStorage.getItem('auth_user'));
        if (authUser && authUser.id === oldId) {
          authUser.id = newId;
          localStorage.setItem('auth_user', JSON.stringify(authUser));
        }
      } catch (e) {
        console.error('更新當前用戶ID失敗:', e);
      }
    }
  } catch (error) {
    console.error('更新相關數據失敗:', error);
  }
}

// 徹底清理特定用戶的所有數據
function cleanupUserData() {
  try {
    const email = cleanupEmail.value.trim();
    if (!email) {
      alert('請輸入要清理的用戶郵箱');
      return;
    }
    
    if (!confirm(`確定要徹底清理 ${email} 的所有數據嗎？此操作不可恢復！`)) {
      return;
    }
    
    // 從localStorage獲取用戶數據
    const usersStorageKey = 'app_users_mock_data';
    const storedUsers = localStorage.getItem(usersStorageKey);
    
    if (!storedUsers) {
      alert('沒有找到用戶數據');
      return;
    }
    
    // 解析用戶數據
    let users = JSON.parse(storedUsers);
    
    // 查找要刪除的用戶
    const targetUser = users.find(u => u.email === email);
    
    if (!targetUser) {
      alert(`未找到郵箱為 ${email} 的用戶`);
      return;
    }
    
    // 保存用戶ID以便清理相關數據
    const userId = targetUser.id;
    
    // 1. 刪除用戶記錄
    const initialLength = users.length;
    users = users.filter(u => u.email !== email);
    
    // 檢查是否成功刪除
    if (users.length === initialLength) {
      alert(`刪除用戶 ${email} 失敗，用戶可能不存在`);
      return;
    }
    
    // 2. 保存更新後的用戶列表
    localStorage.setItem(usersStorageKey, JSON.stringify(users));
    
    // 3. 清理用戶相關的localStorage數據
    const keysToClean = [
      // 用戶邀請碼
      `invite_code_${userId}`,
      // 用戶聊天記錄
      `chat_${userId}`,
      // 會話數據
      `conversations_${userId}`
    ];
    
    // 清理特定鍵
    keysToClean.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`已刪除 ${key}`);
      }
    });
    
    // 4. 清理全局聊天記錄中的該用戶數據
    const globalChatHistory = localStorage.getItem('global_chat_history');
    if (globalChatHistory) {
      try {
        let chatData = JSON.parse(globalChatHistory);
        const initialChatLength = chatData.length;
        
        // 刪除該用戶的聊天記錄
        chatData = chatData.filter(msg => msg.userId !== userId && 
                                         (!msg.userEmail || msg.userEmail !== email));
        
        if (chatData.length < initialChatLength) {
          localStorage.setItem('global_chat_history', JSON.stringify(chatData));
          console.log(`已從全局聊天記錄中刪除 ${initialChatLength - chatData.length} 條與用戶 ${email} 相關的消息`);
        }
      } catch (e) {
        console.error('處理全局聊天記錄時出錯:', e);
      }
    }
    
    // 5. 清理邀請記錄
    const inviteRecordsKey = 'app_invite_records';
    const storedRecords = localStorage.getItem(inviteRecordsKey);
    if (storedRecords) {
      try {
        let inviteRecords = JSON.parse(storedRecords);
        const initialInviteLength = inviteRecords.length;
        
        // 刪除與該用戶相關的邀請記錄(作為邀請者或被邀請者)
        inviteRecords = inviteRecords.filter(record => 
                                           record.inviterId !== userId && 
                                           record.inviteeId !== userId);
        
        if (inviteRecords.length < initialInviteLength) {
          localStorage.setItem(inviteRecordsKey, JSON.stringify(inviteRecords));
          console.log(`已刪除 ${initialInviteLength - inviteRecords.length} 條與用戶 ${email} 相關的邀請記錄`);
        }
      } catch (e) {
        console.error('處理邀請記錄時出錯:', e);
      }
    }
    
    // 6. 檢查當前登入用戶
    const currentUserId = localStorage.getItem('auth_user_id');
    if (currentUserId === userId) {
      // 清除當前登入信息
      localStorage.removeItem('auth_user_id');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      
      console.log('已清除當前登入信息，因為登入用戶與被刪除用戶相同');
    }
    
    // 完成清理
    alert(`已成功清理用戶 ${email} 的所有數據`);
    cleanupEmail.value = ''; // 清空輸入框
    refreshDiagnostics();
  } catch (error) {
    console.error('清理用戶數據失敗:', error);
    alert('清理失敗: ' + error.message);
  }
}

// 頁面加載時刷新診斷
onMounted(() => {
  refreshDiagnostics();
});
</script>

<style scoped>
/* 可以添加一些額外的樣式，如果需要 */
</style> 