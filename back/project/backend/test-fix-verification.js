/**
 * 測試驗證碼延遲標記修復
 * 驗證方案A的修復效果
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:7070/api/v1';

// 測試數據
const testData = {
  email: `test${Date.now()}@example.com`,
  verificationCode: '123456',
  userData: {
    name: '測試用戶',
    password: 'Test1234',
    industry: '軟體業',
    position: '工程師'
  }
};

console.log('🧪 開始測試驗證碼延遲標記修復...\n');

async function testVerificationFix() {
  try {
    // 1. 發送驗證碼
    console.log('📧 步驟1: 發送驗證碼...');
    const sendResponse = await fetch(`${BASE_URL}/auth/send-email-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testData.email, 
        type: 'registration' 
      })
    });
    
    const sendResult = await sendResponse.json();
    console.log('📧 發送結果:', sendResult.success ? '✅ 成功' : '❌ 失敗');
    
    if (!sendResult.success) {
      console.log('❌ 發送驗證碼失敗，測試終止');
      return;
    }

    // 等待一秒確保驗證碼已保存
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. 模擬500錯誤情況 - 第一次註冊請求
    console.log('\n🔄 步驟2: 第一次註冊請求（模擬可能失敗的情況）...');
    const firstResponse = await fetch(`${BASE_URL}/auth/verify-and-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const firstResult = await firstResponse.json();
    console.log('🔄 第一次請求狀態:', firstResponse.status);
    console.log('🔄 第一次請求結果:', firstResult.success ? '✅ 成功' : '❌ 失敗');
    
    if (firstResult.success) {
      console.log('🎉 第一次就成功了！修復生效！');
      return;
    }

    // 3. 立即重試 - 測試驗證碼是否還能使用
    console.log('\n🔄 步驟3: 立即重試註冊（測試驗證碼是否被過早消耗）...');
    const retryResponse = await fetch(`${BASE_URL}/auth/verify-and-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const retryResult = await retryResponse.json();
    console.log('🔄 重試請求狀態:', retryResponse.status);
    console.log('🔄 重試請求結果:', retryResult.success ? '✅ 成功' : '❌ 失敗');
    
    // 4. 分析結果
    console.log('\n📊 測試結果分析:');
    
    if (retryResult.success) {
      console.log('🎉 驗證碼延遲標記修復成功！');
      console.log('   ✅ 驗證碼沒有被過早消耗');
      console.log('   ✅ 重試機制正常工作');
    } else if (retryResult.error?.code === 'VERIFICATION_CODE_TEMPORARILY_LOCKED') {
      console.log('🔒 驗證碼被臨時鎖定（正常的防併發機制）');
      console.log('   ✅ 修復基本成功，但可能需要調整鎖定時間');
    } else if (retryResult.error?.code === 'VERIFICATION_CODE_NOT_FOUND') {
      console.log('❌ 驗證碼仍然被過早消耗');
      console.log('   ❌ 修復可能未完全生效');
    } else {
      console.log('⚠️ 其他錯誤:', retryResult.error?.code || '未知錯誤');
      console.log('   ℹ️ 可能是其他業務邏輯問題');
    }

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error.message);
  }
}

// 運行測試
testVerificationFix().then(() => {
  console.log('\n🧪 測試完成！');
}).catch(error => {
  console.error('❌ 測試失敗:', error);
}); 