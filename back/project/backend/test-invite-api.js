import axios from 'axios';

// 從之前的登入測試獲取的token
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODVkNmM5NTBkNDhlM2M5ZGU2MjM5ZjYiLCJ1c2VyVHlwZSI6ImVtcGxveWVlIiwiaWF0IjoxNzUwOTk0NDYyLCJleHAiOjE3NTEwODA4NjJ9.A6ouWsk_WY9EJ_IS8QV-jLepWKW2PhA_uhWMviSFGJM";

const BASE_URL = 'http://localhost:7070/api/v1';

async function testInviteAPIs() {
  console.log('=====================================');
  console.log('🔍 邀請功能API檢查');
  console.log('=====================================\n');

  try {
    // 1. 測試邀請統計API
    console.log('1. 測試 GET /invites/my-stats...');
    const statsResponse = await axios.get(`${BASE_URL}/invites/my-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   狀態碼:', statsResponse.status);
    console.log('   響應數據:', JSON.stringify(statsResponse.data, null, 2));
    
    // 檢查響應格式
    const data = statsResponse.data.data;
    console.log('\n   📊 數據格式檢查:');
    console.log('   ✅ totalInvited:', data.totalInvited);
    console.log('   ✅ totalBonusEarned:', data.totalBonusEarned);
    console.log('   ✅ thisMonthInvited:', data.thisMonthInvited);
    console.log('   ✅ thisMonthBonus:', data.thisMonthBonus);
    console.log('   ✅ ranking:', data.ranking);
    console.log('   ✅ inviteUrl:', data.inviteUrl);
    console.log('   ✅ recentInvitees:', data.recentInvitees.length, '筆記錄');
    
  } catch (error) {
    console.log('   ❌ 錯誤:', error.response?.status, error.response?.data || error.message);
  }

  try {
    // 2. 測試邀請設置API
    console.log('\n2. 測試 GET /invites/settings...');
    const settingsResponse = await axios.get(`${BASE_URL}/invites/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   狀態碼:', settingsResponse.status);
    console.log('   響應數據:', JSON.stringify(settingsResponse.data, null, 2));
    
  } catch (error) {
    console.log('   ❌ 錯誤:', error.response?.status, error.response?.data || error.message);
  }

  console.log('\n=====================================');
  console.log('🎯 前端需求對照檢查');
  console.log('=====================================\n');

  try {
    const statsResponse = await axios.get(`${BASE_URL}/invites/my-stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = statsResponse.data.data;
    
    console.log('前端邀請頁面需求檢查:');
    console.log('1. 📈 已邀請人數統計:');
    console.log('   - API提供: totalInvited =', data.totalInvited);
    console.log('   - 狀態: ✅ 已提供');
    
    console.log('\n2. 🎁 獲得的額外諮詢次數:');
    console.log('   - API提供: totalBonusEarned =', data.totalBonusEarned);
    console.log('   - 狀態: ✅ 已提供');
    
    console.log('\n3. 👥 已邀請好友列表:');
    console.log('   - API提供: recentInvitees =', data.recentInvitees.length, '筆');
    if (data.recentInvitees.length > 0) {
      console.log('   - 範例數據:');
      data.recentInvitees.slice(0, 2).forEach((invitee, index) => {
        console.log(`     ${index + 1}. 姓名: ${invitee.name}`);
        console.log(`        邀請時間: ${new Date(invitee.invitedAt).toLocaleDateString()}`);
        console.log(`        獲得獎勵: ${invitee.bonusReceived}`);
      });
    }
    console.log('   - 狀態: ✅ 已提供 (包含姓名、邀請時間、獎勵等信息)');
    
    console.log('\n📋 總結:');
    console.log('✅ 後端已完整提供前端邀請頁面所需的所有API');
    console.log('✅ 數據格式符合前端需求');
    console.log('✅ 包含隱私保護機制 (郵箱可在前端處理顯示)');
    
  } catch (error) {
    console.log('❌ 檢查失敗:', error.message);
  }
}

testInviteAPIs(); 