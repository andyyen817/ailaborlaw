import fetch from 'node-fetch';

/**
 * 簡單的登入API測試
 */
async function testLoginAPI() {
  try {
    console.log('🔄 測試後端API連接...');
    
    // 測試健康檢查API
    try {
      const healthResponse = await fetch('http://localhost:7070/api/health', {
        method: 'GET',
        timeout: 5000
      });
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.text();
        console.log('✅ 後端服務正常運行');
        console.log('健康檢查響應:', healthData);
      } else {
        console.log(`❌ 健康檢查失敗: ${healthResponse.status}`);
      }
    } catch (healthError) {
      console.log('❌ 無法連接到後端服務:', healthError.message);
      console.log('請確認後端服務是否在 http://localhost:7070 上運行');
      return;
    }
    
    // 測試用戶登入API
    const testEmail = process.argv[2] || 'creatyen@gmail.com';
    const testPassword = process.argv[3] || 'A1234567';
    
    console.log(`\n🧪 測試用戶登入: ${testEmail}`);
    
    const loginData = {
      email: testEmail,
      password: testPassword
    };
    
    console.log('發送登入請求...');
    
    try {
      const loginResponse = await fetch('http://localhost:7070/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData),
        timeout: 10000
      });
      
      const loginResult = await loginResponse.json();
      
      console.log(`\n📊 登入API響應 (${loginResponse.status}):`);
      console.log(JSON.stringify(loginResult, null, 2));
      
      if (loginResponse.status === 401) {
        console.log('\n❌ 登入失敗 - 401 Unauthorized');
        console.log('可能的原因:');
        console.log('1. 用戶不存在（註冊時沒有成功保存）');
        console.log('2. 密碼錯誤');
        console.log('3. 用戶狀態不是 active');
        console.log('4. 數據庫連接問題');
      } else if (loginResponse.status === 200) {
        console.log('\n✅ 登入成功！');
      } else {
        console.log(`\n⚠️  未預期的響應狀態: ${loginResponse.status}`);
      }
      
    } catch (loginError) {
      console.log('❌ 登入請求失敗:', loginError.message);
    }
    
    // 測試管理員登入（對比）
    console.log('\n🔍 測試管理員登入（對比）...');
    
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
      
      console.log(`📊 管理員登入響應 (${adminLoginResponse.status}):`);
      if (adminLoginResponse.status === 200) {
        console.log('✅ 管理員登入成功');
      } else {
        console.log('❌ 管理員登入失敗');
        console.log(JSON.stringify(adminLoginResult, null, 2));
      }
      
    } catch (adminError) {
      console.log('❌ 管理員登入請求失敗:', adminError.message);
    }
    
  } catch (error) {
    console.error('❌ 測試過程中出錯:', error);
  }
}

// 運行測試
testLoginAPI(); 