/**
 * API連接測試腳本 (CommonJS格式)
 */

// 使用CommonJS格式引入
const fetch = require('node-fetch');

// 測試配置
const TEST_URLS = [
  'http://localhost:7070/api/v1/admin/auth/login',
  'http://ailabordevbox.ns-2rlrcc3k.svc.cluster.local:7070/api/v1/admin/auth/login'
];

const TEST_PAYLOAD = {
  email: 'test@ailaborlaw.com',
  password: 'Test1234'
};

// 測試單個URL
async function testUrl(url) {
  console.log(`測試URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_PAYLOAD)
    });
    
    const data = await response.json();
    
    console.log(`狀態碼: ${response.status}`);
    console.log('響應數據:', JSON.stringify(data).substring(0, 200));
    
    if (response.ok) {
      console.log('✅ 連接成功!');
      return true;
    } else {
      console.log('❌ API返回錯誤狀態碼');
      return false;
    }
  } catch (error) {
    console.log(`❌ 連接失敗: ${error.message}`);
    return false;
  }
}

// 主函數
async function main() {
  console.log('=== API連接測試 ===');
  
  let successCount = 0;
  
  for (const url of TEST_URLS) {
    console.log('\n----------------------------');
    const success = await testUrl(url);
    if (success) successCount++;
    console.log('----------------------------');
  }
  
  console.log(`\n測試結果: ${successCount}/${TEST_URLS.length} 成功`);
}

// 執行測試
main().catch(error => {
  console.error('測試執行出錯:', error);
}); 