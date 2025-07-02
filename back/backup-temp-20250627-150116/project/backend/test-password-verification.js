import fetch from 'node-fetch';

/**
 * 專門測試密碼驗證問題的腳本
 */
async function testPasswordVerification() {
  try {
    console.log('🔍 密碼驗證問題診斷');
    console.log('=====================================');
    
    // 測試後端服務是否運行
    console.log('1. 檢查後端服務...');
    
    try {
      const healthResponse = await fetch('http://localhost:7070/api/health', {
        method: 'GET',
        timeout: 5000
      });
      
      if (healthResponse.ok) {
        console.log('✅ 後端服務正常運行');
      } else {
        console.log('❌ 後端服務異常');
        return;
      }
    } catch (error) {
      console.log('❌ 無法連接到後端服務');
      console.log('請先確保後端服務在運行：');
      console.log('  cd project/backend');
      console.log('  npm start');
      return;
    }
    
    // 測試用戶郵箱和密碼
    const testEmail = process.argv[2] || 'creatyen@gmail.com';
    const testPassword = process.argv[3] || 'A1234567';
    
    console.log(`\n2. 測試用戶登入: ${testEmail}`);
    console.log(`   密碼: ${testPassword}`);
    
    // 測試普通用戶登入
    console.log('\n3. 測試普通用戶登入API...');
    
    try {
      const userLoginResponse = await fetch('http://localhost:7070/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword
        }),
        timeout: 10000
      });
      
      const userLoginResult = await userLoginResponse.json();
      
      console.log(`   狀態碼: ${userLoginResponse.status}`);
      console.log(`   響應: ${JSON.stringify(userLoginResult, null, 2)}`);
      
      if (userLoginResponse.status === 401) {
        console.log('\n❌ 普通用戶登入失敗 - 401 Unauthorized');
        
        // 分析具體的錯誤代碼
        if (userLoginResult.error?.code === 'INVALID_CREDENTIALS') {
          console.log('   錯誤類型: INVALID_CREDENTIALS');
          console.log('   可能原因:');
          console.log('   - 用戶不存在（但你說管理後台能看到，所以不太可能）');
          console.log('   - 密碼不匹配（最可能）');
        }
      } else if (userLoginResponse.status === 200) {
        console.log('\n✅ 普通用戶登入成功！');
        return;
      }
      
    } catch (error) {
      console.log('❌ 普通用戶登入請求失敗:', error.message);
    }
    
    // 對比測試：管理員登入
    console.log('\n4. 對比測試：管理員登入...');
    
    try {
      const adminLoginResponse = await fetch('http://localhost:7070/api/v1/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'newadmin@ailaborlaw.com',
          password: 'Admin1234'
        }),
        timeout: 10000
      });
      
      const adminLoginResult = await adminLoginResponse.json();
      
      console.log(`   狀態碼: ${adminLoginResponse.status}`);
      
      if (adminLoginResponse.status === 200) {
        console.log('✅ 管理員登入成功');
        console.log('   這說明後端服務和數據庫連接都正常');
      } else {
        console.log('❌ 管理員登入也失敗');
        console.log(`   響應: ${JSON.stringify(adminLoginResult, null, 2)}`);
      }
      
    } catch (error) {
      console.log('❌ 管理員登入請求失敗:', error.message);
    }
    
    // 分析結論
    console.log('\n5. 問題分析結論:');
    console.log('=====================================');
    console.log('基於測試結果，最可能的問題是：');
    console.log('');
    console.log('🔍 密碼驗證邏輯問題:');
    console.log('   - 普通用戶和管理員使用不同的密碼處理方式');
    console.log('   - 普通用戶註冊時密碼加密方式與登入時驗證方式不匹配');
    console.log('   - User模型的comparePassword方法可能有問題');
    console.log('');
    console.log('🔧 建議檢查：');
    console.log('   1. User模型的密碼加密 pre-save hook');
    console.log('   2. User模型的comparePassword方法');
    console.log('   3. 註冊時的密碼處理邏輯');
    console.log('   4. 登入時的密碼驗證邏輯');
    console.log('');
    console.log('📋 下一步行動：');
    console.log('   1. 檢查數據庫中用戶的實際密碼哈希值');
    console.log('   2. 對比User模型和Admin模型的密碼處理差異');
    console.log('   3. 測試密碼加密和驗證的每個步驟');
    
  } catch (error) {
    console.error('❌ 測試過程中出錯:', error);
  }
}

// 運行測試
testPasswordVerification(); 