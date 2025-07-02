import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:7070/api/v1';

async function testInviteRegistration() {
  console.log('🧪 開始測試邀請碼註冊流程');
  console.log('=' .repeat(50));
  
  try {
    // 測試數據
    const testEmail = `test${Date.now()}@example.com`;
    const testData = {
      email: testEmail,
      verificationCode: '123456', // 假設的驗證碼
      userData: {
        name: '測試用戶',
        password: 'TestPass123',
        industry: '資訊科技',
        position: '工程師',
        inviteCode: 'ATMZ946Y' // 使用實際的邀請碼
      }
    };
    
    console.log('📧 步驟1: 發送驗證碼');
    const sendCodeResponse = await fetch(`${API_BASE}/auth/send-email-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testEmail, 
        type: 'registration' 
      })
    });
    
    const sendCodeResult = await sendCodeResponse.json();
    console.log('發送驗證碼結果:', sendCodeResult);
    
    if (!sendCodeResult.success) {
      console.log('❌ 發送驗證碼失敗，跳過註冊測試');
      return;
    }
    
    // 等待一下
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n🔐 步驟2: 嘗試邀請碼註冊');
    console.log('請求數據:', JSON.stringify(testData, null, 2));
    
    const registerResponse = await fetch(`${API_BASE}/auth/verify-and-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    console.log(`\n📊 響應狀態: ${registerResponse.status} ${registerResponse.statusText}`);
    
    const registerResult = await registerResponse.json();
    console.log('註冊響應:', JSON.stringify(registerResult, null, 2));
    
    if (registerResponse.status === 500) {
      console.log('\n🚨 發現500錯誤！');
      console.log('這就是我們要找的問題！');
      
      // 嘗試獲取更詳細的錯誤信息
      if (registerResult.error && registerResult.error.details) {
        console.log('\n🔍 錯誤詳情:');
        console.log(registerResult.error.details);
      }
    }
    
    // 測試無邀請碼註冊作為對比
    console.log('\n🆚 步驟3: 對比測試 - 無邀請碼註冊');
    const testEmailNoInvite = `testno${Date.now()}@example.com`;
    
    // 發送驗證碼
    const sendCodeResponse2 = await fetch(`${API_BASE}/auth/send-email-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testEmailNoInvite, 
        type: 'registration' 
      })
    });
    
    const sendCodeResult2 = await sendCodeResponse2.json();
    console.log('無邀請碼 - 發送驗證碼結果:', sendCodeResult2.success ? '✅ 成功' : '❌ 失敗');
    
    if (sendCodeResult2.success) {
      // 註冊（無邀請碼）
      const testDataNoInvite = {
        email: testEmailNoInvite,
        verificationCode: '123456',
        userData: {
          name: '測試用戶無邀請',
          password: 'TestPass123',
          industry: '資訊科技',
          position: '工程師'
          // 沒有 inviteCode
        }
      };
      
      const registerResponse2 = await fetch(`${API_BASE}/auth/verify-and-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testDataNoInvite)
      });
      
      console.log(`無邀請碼註冊狀態: ${registerResponse2.status} ${registerResponse2.statusText}`);
      const registerResult2 = await registerResponse2.json();
      console.log('無邀請碼註冊結果:', registerResult2.success ? '✅ 成功' : '❌ 失敗');
    }
    
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error.message);
    console.error('錯誤堆疊:', error.stack);
  }
}

// 執行測試
testInviteRegistration(); 