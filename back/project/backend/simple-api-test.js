import fetch from 'node-fetch';

const testAPI = async () => {
  console.log('🔍 測試勞法通v1.0 Vercel部署API...');
  
  try {
    // 測試API是否可達 - 使用新的Vercel地址
    const response = await fetch('https://ailaborlawbackv1.vercel.app/api/v1/invites/my-stats', {
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
    
    // 檢查Vercel服務是否運行
    try {
      const healthCheck = await fetch('https://ailaborlawbackv1.vercel.app/api/health');
      console.log('✅ Vercel服務運行中，健康檢查通過');
    } catch (healthError) {
      console.log('❌ Vercel服務未運行或無法連接');
    }
  }
};

testAPI(); 