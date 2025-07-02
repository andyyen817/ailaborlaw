import fetch from 'node-fetch';

const testAPI = async () => {
  console.log('🔍 測試邀請統計API...');
  
  try {
    // 測試API是否可達
    const response = await fetch('http://localhost:7070/api/v1/invites/my-stats', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzVkNmM5NTBkNDhlM2M5ZGU2MjM5ZjYiLCJlbWFpbCI6ImNyZWF0eWVuQGdtYWlsLmNvbSIsInVzZXJUeXBlIjoiZW1wbG95ZWUiLCJpYXQiOjE3MzUyODA3NjAsImV4cCI6MTczNTM2NzE2MH0.Mm5YIVhJqjFCvZLGONvgK_lCvdJBuJRb7nCqrQXJYe4',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API響應成功:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ API響應失敗:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('錯誤詳情:', errorText);
    }
    
  } catch (error) {
    console.log('❌ 連接失敗:', error.message);
    
    // 檢查服務是否運行
    try {
      const healthCheck = await fetch('http://localhost:7070/health');
      console.log('✅ 服務運行中，健康檢查通過');
    } catch (healthError) {
      console.log('❌ 服務未運行或無法連接');
    }
  }
};

testAPI(); 