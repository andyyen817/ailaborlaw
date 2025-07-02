import fetch from 'node-fetch';

/**
 * 調試腳本：模擬前端發送的管理員登入請求
 * 這個腳本會嘗試以不同的方式登入超級管理員和普通管理員帳戶
 */
async function debugAdminLogin() {
  // 定義API端點
  const API_URL = 'http://localhost:7070/api/v1/admin/auth/login';
  
  // 測試帳戶
  const adminAccounts = [
    {
      name: '超級管理員（僅使用username）',
      data: { username: 'admin', password: 'Test1234' }
    },
    {
      name: '超級管理員（僅使用email）',
      data: { email: 'test@ailaborlaw.com', password: 'Test1234' }
    },
    {
      name: '超級管理員（同時使用username和email）',
      data: { username: 'admin', email: 'test@ailaborlaw.com', password: 'Test1234' }
    },
    {
      name: '普通管理員（僅使用username）',
      data: { username: 'newadmin', password: 'Admin1234' }
    },
    {
      name: '普通管理員（僅使用email）',
      data: { email: 'newadmin@ailaborlaw.com', password: 'Admin1234' }
    },
    {
      name: '普通管理員（同時使用username和email）',
      data: { username: 'newadmin', email: 'newadmin@ailaborlaw.com', password: 'Admin1234' }
    }
  ];
  
  // 測試每個帳戶
  console.log('===== 開始測試管理員登入請求 =====\n');
  
  for (const account of adminAccounts) {
    try {
      console.log(`正在測試: ${account.name}`);
      console.log(`請求數據: ${JSON.stringify(account.data)}`);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(account.data)
      });
      
      const result = await response.json();
      
      console.log(`響應狀態: ${response.status}`);
      console.log(`響應數據: ${JSON.stringify(result, null, 2)}`);
      console.log('-'.repeat(50) + '\n');
    } catch (error) {
      console.error(`請求出錯: ${error.message}`);
      console.log('-'.repeat(50) + '\n');
    }
  }
  
  console.log('===== 測試完成 =====');
}

// 執行測試
debugAdminLogin(); 