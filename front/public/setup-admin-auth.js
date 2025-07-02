// 快速設置管理員認證狀態
// 在瀏覽器控制台中執行此腳本，或將其加載到頁面中

(function() {
  console.log('開始設置管理員認證狀態...');
  
  // 管理員用戶數據
  const adminUser = {
    id: 'admin_001',
    name: '测试管理员',
    email: 'test@ailaborlaw.com',
    role: 'admin',
    userType: 'admin'
  };
  
  // 模擬管理員JWT令牌
  const adminToken = 'admin_mock_token_' + Date.now();
  
  // 設置管理員認證數據到localStorage
  localStorage.setItem('admin_token', adminToken);
  localStorage.setItem('admin_data', JSON.stringify(adminUser));
  localStorage.setItem('admin_token_expires', Date.now() + 24 * 60 * 60 * 1000); // 24小時後過期
  
  // 同時設置普通用戶認證（如果需要用戶頁面）
  const regularUser = {
    id: '682d367ce9d05b9a4d91401f',
    name: 'lee1234',
    email: 'lee1@gmail.com',
    userType: 'admin'
  };
  
  const userToken = 'user_mock_token_' + Date.now();
  
  localStorage.setItem('auth_token', userToken);
  localStorage.setItem('auth_user', JSON.stringify(regularUser));
  localStorage.setItem('auth_user_id', regularUser.id);
  
  console.log('管理員認證狀態已設置:');
  console.log('- 管理員用戶:', adminUser);
  console.log('- 管理員令牌:', adminToken);
  console.log('- 普通用戶:', regularUser);
  console.log('- 用戶令牌:', userToken);
  
  console.log('\n現在可以訪問以下頁面:');
  console.log('- 管理後台用戶管理: http://localhost:3029/admin/users');
  console.log('- 用戶頁面: http://localhost:3029/user/682d367ce9d05b9a4d91401f');
  
  console.log('\n請刷新頁面以應用認證狀態。');
  
  return {
    adminUser,
    adminToken,
    regularUser,
    userToken
  };
})(); 