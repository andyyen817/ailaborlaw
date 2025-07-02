/**
 * API連接測試腳本
 * 
 * 這個腳本用於測試前端到後端API的連接。它會嘗試使用新配置的公網URL來連接
 * 後端API，以確認連接問題是否已解決。
 */

// 引入Fetch API的polyfill，以便在Node環境中使用
import fetch from 'node-fetch';

// 測試的API端點
const TEST_ENDPOINT = '/admin/auth/login';
const TEST_PAYLOAD = {
  email: 'test@ailaborlaw.com',
  password: 'Test1234'
};

// API基礎URL
const API_BASE_URL = 'http://localhost:7070/api/v1';

/**
 * 測試API連接
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
async function testApiConnection() {
  const startTime = Date.now();
  try {
    console.log(`正在測試 API URL: ${API_BASE_URL}`);
    
    const response = await fetch(`${API_BASE_URL}${TEST_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_PAYLOAD),
      timeout: 10000 // 10秒超時
    });
    
    const responseTime = Date.now() - startTime;
    
    // 嘗試解析響應
    let data;
    try {
      data = await response.json();
    } catch (error) {
      return {
        success: false,
        message: `連接成功但響應不是有效的JSON：${error.message}`,
        statusCode: response.status,
        responseTime: `${responseTime}ms`
      };
    }
    
    // 檢查響應狀態
    if (response.ok) {
      return {
        success: true,
        message: `成功連接到API (${response.status} ${response.statusText})`,
        statusCode: response.status,
        responseTime: `${responseTime}ms`,
        data: data
      };
    } else {
      return {
        success: false,
        message: `API返回錯誤：${response.status} ${response.statusText}`,
        statusCode: response.status,
        responseTime: `${responseTime}ms`,
        data: data
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      success: false,
      message: `連接失敗：${error.message}`,
      responseTime: `${responseTime}ms`,
      error: error
    };
  }
}

/**
 * 主函數
 */
async function main() {
  console.log('=== API連接測試 ===');
  console.log(`測試端點: ${TEST_ENDPOINT}`);
  console.log(`測試時間: ${new Date().toISOString()}`);
  console.log('-------------------------------------------');
  
  try {
    const result = await testApiConnection();
    
    if (result.success) {
      console.log(`✅ 成功！響應時間: ${result.responseTime}`);
      console.log('響應數據:', JSON.stringify(result.data, null, 2).substring(0, 200) + '...');
    } else {
      console.log(`❌ 失敗！響應時間: ${result.responseTime}`);
      console.log(`錯誤信息: ${result.message}`);
      if (result.data) {
        console.log('錯誤詳情:', JSON.stringify(result.data, null, 2));
      }
    }
  } catch (error) {
    console.log('❌ 測試執行出錯:', error.message);
  }
  
  console.log('-------------------------------------------');
  console.log('\n=== 測試完成 ===');
}

// 執行主函數
main().catch(error => {
  console.error('測試腳本執行錯誤:', error);
  process.exit(1);
}); 