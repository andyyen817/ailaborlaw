/**
 * 管理員邀請API測試腳本
 * 測試新開發的管理員專用邀請管理API
 */

const API_BASE_URL = 'http://localhost:7070/api/v1';

// 管理員登錄憑證（需要先登錄獲取token）
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123'
};

let adminToken = '';

/**
 * 通用API請求函數
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }

  try {
    console.log(`\n🔍 請求: ${config.method} ${url}`);
    if (config.body) {
      console.log('📤 請求體:', JSON.parse(config.body));
    }

    const response = await fetch(url, config);
    const data = await response.json();

    console.log(`📊 響應狀態: ${response.status}`);
    console.log('📥 響應數據:', JSON.stringify(data, null, 2));

    return { response, data };
  } catch (error) {
    console.error(`❌ 請求失敗: ${error.message}`);
    return { error };
  }
}

/**
 * 管理員登錄
 */
async function adminLogin() {
  console.log('🔐 開始管理員登錄...');
  
  const { response, data, error } = await apiRequest('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify(ADMIN_CREDENTIALS)
  });

  if (error || !response.ok) {
    console.error('❌ 管理員登錄失敗');
    return false;
  }

  if (data.success && data.data && data.data.token) {
    adminToken = data.data.token;
    console.log('✅ 管理員登錄成功');
    return true;
  }

  console.error('❌ 管理員登錄響應格式錯誤');
  return false;
}

/**
 * 測試1：獲取邀請記錄
 */
async function testGetInviteRecords() {
  console.log('\n📋 === 測試1: 獲取邀請記錄 ===');
  
  // 測試基本查詢
  await apiRequest('/invites/admin/records');
  
  // 測試分頁查詢
  await apiRequest('/invites/admin/records?page=1&limit=5');
  
  // 測試狀態篩選
  await apiRequest('/invites/admin/records?status=completed');
  
  // 測試搜索功能
  await apiRequest('/invites/admin/records?search=test');
  
  // 測試複合查詢
  await apiRequest('/invites/admin/records?page=1&limit=10&status=completed&search=A');
}

/**
 * 測試2：獲取系統統計
 */
async function testGetSystemStats() {
  console.log('\n📊 === 測試2: 獲取系統統計 ===');
  
  // 測試基本統計
  await apiRequest('/invites/admin/system-stats');
  
  // 測試時間範圍統計
  const startDate = '2024-01-01T00:00:00.000Z';
  const endDate = '2024-12-31T23:59:59.999Z';
  await apiRequest(`/invites/admin/system-stats?startDate=${startDate}&endDate=${endDate}`);
}

/**
 * 測試3：獲取和更新設置
 */
async function testSettings() {
  console.log('\n⚙️ === 測試3: 設置管理 ===');
  
  // 測試獲取設置
  const { data: currentSettings } = await apiRequest('/invites/admin/settings');
  
  if (currentSettings && currentSettings.success) {
    console.log('✅ 當前設置獲取成功');
    
    // 測試更新設置
    const newSettings = {
      inviterBonus: 15,
      inviteeBonus: 12,
      registrationBonus: 8,
      isEnabled: true,
      maxInvitesPerUser: 50
    };
    
    await apiRequest('/invites/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(newSettings)
    });
    
    // 驗證設置是否更新成功
    console.log('\n🔍 驗證設置更新...');
    await apiRequest('/invites/admin/settings');
    
    // 恢復原始設置
    if (currentSettings.data) {
      console.log('\n🔄 恢復原始設置...');
      const originalSettings = {
        inviterBonus: currentSettings.data.inviterBonus,
        inviteeBonus: currentSettings.data.inviteeBonus,
        registrationBonus: currentSettings.data.registrationBonus,
        isEnabled: currentSettings.data.isEnabled,
        maxInvitesPerUser: currentSettings.data.maxInvitesPerUser
      };
      
      await apiRequest('/invites/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(originalSettings)
      });
    }
  }
}

/**
 * 測試4：錯誤處理
 */
async function testErrorHandling() {
  console.log('\n🚨 === 測試4: 錯誤處理 ===');
  
  // 測試無效分頁參數
  await apiRequest('/invites/admin/records?page=0&limit=200');
  
  // 測試無效狀態
  await apiRequest('/invites/admin/records?status=invalid');
  
  // 測試無效日期格式
  await apiRequest('/invites/admin/system-stats?startDate=invalid-date');
  
  // 測試無效設置值
  await apiRequest('/invites/admin/settings', {
    method: 'PUT',
    body: JSON.stringify({
      inviterBonus: -1,
      inviteeBonus: 200,
      isEnabled: 'not-boolean'
    })
  });
}

/**
 * 主測試函數
 */
async function runTests() {
  console.log('🚀 開始管理員邀請API測試');
  console.log('='.repeat(50));

  // 先登錄管理員
  const loginSuccess = await adminLogin();
  if (!loginSuccess) {
    console.error('❌ 無法登錄管理員，測試終止');
    return;
  }

  try {
    // 執行所有測試
    await testGetInviteRecords();
    await testGetSystemStats();
    await testSettings();
    await testErrorHandling();
    
    console.log('\n🎉 所有測試完成！');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
  }
}

// 檢查是否在Node.js環境中運行
if (typeof window === 'undefined') {
  // Node.js環境
  const fetch = require('node-fetch');
  runTests();
} else {
  // 瀏覽器環境
  console.log('請在Node.js環境中運行此測試腳本');
} 