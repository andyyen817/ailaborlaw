/**
 * 邀請碼功能調試腳本
 * 專門測試邀請碼註冊的問題
 */

import connectDatabase from './src/config/database.js';
import User from './src/models/user.model.js';
import InviteService from './src/services/invite.service.js';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:7070/api/v1';

async function debugInviteFunction() {
  console.log('🔍 開始邀請碼功能調試...\n');
  
  try {
    // 連接數據庫
    await connectDatabase();
    console.log('✅ 數據庫連接成功');
    
    // 1. 檢查現有用戶的邀請碼
    console.log('\n📋 檢查現有用戶邀請碼:');
    const usersWithCodes = await User.find({
      myInviteCode: { $exists: true, $ne: null }
    }).select('name email myInviteCode').limit(5);
    
    if (usersWithCodes.length > 0) {
      usersWithCodes.forEach(user => {
        console.log(`   👤 ${user.name}: ${user.myInviteCode}`);
      });
      
      // 使用第一個用戶的邀請碼進行測試
      const testInviteCode = usersWithCodes[0].myInviteCode;
      console.log(`\n🧪 使用邀請碼進行測試: ${testInviteCode}`);
      
      // 2. 直接測試邀請碼驗證服務
      console.log('\n🔍 測試 InviteService.validateInviteCode:');
      const validation = await InviteService.validateInviteCode(testInviteCode);
      console.log('   驗證結果:', validation.valid ? '✅ 有效' : '❌ 無效');
      console.log('   詳細信息:', validation);
      
      if (validation.valid) {
        // 3. 測試完整的邀請註冊API
        console.log('\n🚀 測試完整邀請註冊API:');
        
        const testData = {
          email: `invitetest${Date.now()}@example.com`,
          verificationCode: '123456', // 這會失敗，但我們可以看到錯誤信息
          userData: {
            name: '邀請測試用戶',
            password: 'Test1234',
            industry: '軟體業',
            position: '工程師',
            inviteCode: testInviteCode
          }
        };
        
        const response = await fetch(`${BASE_URL}/auth/verify-and-register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        console.log('   HTTP狀態:', response.status);
        console.log('   API響應:', result);
        
        // 分析錯誤
        if (!result.success) {
          console.log('\n📊 錯誤分析:');
          console.log(`   錯誤碼: ${result.error?.code}`);
          console.log(`   錯誤信息: ${result.message}`);
          
          if (result.error?.code === 'VERIFICATION_CODE_NOT_FOUND') {
            console.log('   🔍 這是驗證碼問題，不是邀請碼問題');
            console.log('   💡 建議: 先發送驗證碼再測試');
          } else {
            console.log('   ⚠️ 可能是邀請碼相關問題');
          }
        }
      }
      
    } else {
      console.log('   ❌ 沒有找到具有邀請碼的用戶');
      console.log('   💡 建議: 先創建一個用戶獲取邀請碼');
    }
    
  } catch (error) {
    console.error('❌ 調試過程中發生錯誤:', error.message);
    console.error('詳細錯誤:', error.stack);
  } finally {
    process.exit(0);
  }
}

// 運行調試
debugInviteFunction(); 