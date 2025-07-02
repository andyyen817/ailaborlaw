// API認證頭部測試腳本
console.log('🔐 測試API認證頭部處理');
console.log('=====================================');

// 模擬getAuthHeader函數
const getAuthHeader = (url) => {
  console.log(`🔍 檢查URL路徑: "${url}"`);
  
  // 管理員API請求
  if (url.startsWith('/admin')) {
    console.log('  ✅ 識別為管理員API路徑');
    const adminToken = localStorage.getItem('admin_access_token');
    if (adminToken) {
      console.log(`  ✅ 找到管理員token (長度: ${adminToken.length})`);
      return `Bearer ${adminToken}`;
    } else {
      console.log('  ❌ 未找到管理員token');
      return null;
    }
  } else {
    console.log('  ⚠️  識別為普通用戶API路徑');
    const userToken = localStorage.getItem('auth_token');
    if (userToken) {
      console.log(`  ✅ 找到用戶token (長度: ${userToken.length})`);
      return `Bearer ${userToken}`;
    } else {
      console.log('  ❌ 未找到用戶token');
      return null;
    }
  }
};

// 測試不同的API路徑
const testPaths = [
  '/admin/chat/sessions',  // adminChatService 使用的路徑 (正常工作)
  '/labor-advisors',       // laborAdvisorService 使用的路徑 (有問題)
  '/admin/labor-advisors', // 如果改為這個路徑會如何
];

console.log('📋 測試結果:');
testPaths.forEach((path, index) => {
  console.log(`\n${index + 1}. 測試路徑: ${path}`);
  const authHeader = getAuthHeader(path);
  console.log(`   認證頭部: ${authHeader ? '✅ 有效' : '❌ 無效'}`);
});

console.log('\n🎯 關鍵發現:');
console.log('- adminChatService 使用 /admin/chat/* 路徑 → 獲得管理員認證');
console.log('- laborAdvisorService 使用 /labor-advisors 路徑 → 獲得普通用戶認證');
console.log('- 這解釋了為什麼會出現401錯誤！');

console.log('====================================='); 