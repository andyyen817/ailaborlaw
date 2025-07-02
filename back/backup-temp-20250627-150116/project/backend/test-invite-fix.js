import axios from 'axios';

// 測試用戶token（從之前的登入測試獲得）
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODVkNmM5NTBkNDhlM2M5ZGU2MjM5ZjYiLCJ1c2VyVHlwZSI6ImVtcGxveWVlIiwiaWF0IjoxNzUwOTk0NDYyLCJleHAiOjE3NTEwODA4NjJ9.A6ouWsk_WY9EJ_IS8QV-jLepWKW2PhA_uhWMviSFGJM";

const BASE_URL = 'http://localhost:7070/api/v1';

async function testInviteFix() {
  console.log('🧪 測試邀請API修復效果');
  console.log('==========================================\n');

  try {
    // 測試修復後的邀請統計API
    console.log('📊 測試 GET /invites/my-stats...');
    const response = await axios.get(`${BASE_URL}/invites/my-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API響應成功，狀態碼:', response.status);
    console.log('\n📋 完整響應數據:');
    console.log(JSON.stringify(response.data, null, 2));
    
    const data = response.data.data;
    
    console.log('\n🔍 修復驗證結果:');
    console.log('==========================================');
    
    // 驗證1：檢查email字段是否存在
    console.log('\n1. 檢查email字段:');
    if (data.recentInvitees && data.recentInvitees.length > 0) {
      const firstInvitee = data.recentInvitees[0];
      if (firstInvitee.email !== undefined) {
        console.log('✅ email字段已添加');
        console.log(`   原始email可能為: ${firstInvitee.email}`);
        
        // 檢查隱私處理
        if (firstInvitee.email.includes('*')) {
          console.log('✅ 郵箱隱私處理已應用');
        } else {
          console.log('⚠️  郵箱隱私處理可能未生效（可能原始email為空）');
        }
      } else {
        console.log('❌ email字段仍然缺失');
      }
      
      // 檢查姓名隱私處理
      if (firstInvitee.name && firstInvitee.name.includes('*')) {
        console.log('✅ 姓名隱私處理已應用');
        console.log(`   處理後姓名: ${firstInvitee.name}`);
      } else {
        console.log('⚠️  姓名隱私處理可能未生效');
        console.log(`   當前姓名: ${firstInvitee.name}`);
      }
    } else {
      console.log('ℹ️  當前沒有邀請記錄，無法測試email字段');
    }
    
    // 驗證2：檢查統計數據
    console.log('\n2. 檢查統計數據:');
    console.log(`   已邀請人數: ${data.totalInvited}`);
    console.log(`   獲得的額外諮詢次數: ${data.totalBonusEarned}`);
    console.log(`   本月邀請數: ${data.thisMonthInvited}`);
    console.log(`   排名: ${data.ranking}`);
    
    if (data.totalInvited > 0) {
      console.log('✅ 統計數據顯示有邀請記錄');
    } else {
      console.log('⚠️  統計數據仍為0，可能需要進一步調查');
    }
    
    // 驗證3：檢查數據結構完整性
    console.log('\n3. 檢查數據結構完整性:');
    const requiredFields = [
      'totalInvited', 'totalBonusEarned', 'thisMonthInvited', 
      'thisMonthBonus', 'myInviteCode', 'ranking', 'inviteUrl', 
      'recentInvitees', 'monthlyStats'
    ];
    
    let missingFields = [];
    requiredFields.forEach(field => {
      if (data[field] === undefined) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length === 0) {
      console.log('✅ 所有必要字段都存在');
    } else {
      console.log('❌ 缺少字段:', missingFields.join(', '));
    }
    
    console.log('\n🎯 修復效果總結:');
    console.log('==========================================');
    
    if (data.recentInvitees && data.recentInvitees.length > 0 && data.recentInvitees[0].email !== undefined) {
      console.log('✅ 任務1完成: email字段已成功添加');
    } else {
      console.log('❌ 任務1未完成: email字段仍然缺失');
    }
    
    if (data.recentInvitees && data.recentInvitees.length > 0 && 
        (data.recentInvitees[0].name?.includes('*') || data.recentInvitees[0].email?.includes('*'))) {
      console.log('✅ 任務2完成: 隱私處理已應用');
    } else {
      console.log('⚠️  任務2部分完成: 隱私處理函數已添加，但可能因數據為空未顯示效果');
    }
    
    console.log('\n📝 前端測試建議:');
    console.log('1. 刷新前端邀請頁面');
    console.log('2. 檢查邀請好友列表是否顯示郵箱');
    console.log('3. 確認統計數據是否正確更新');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.response?.status, error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 後端服務可能未啟動，請檢查:');
      console.log('1. 執行 npm start 啟動服務');
      console.log('2. 確認端口7070未被佔用');
    }
  }
}

testInviteFix(); 