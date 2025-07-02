// 模擬用戶數據
// 執行這個腳本可以在localStorage中設置模擬用戶資料

// 用戶ID
const userId = 'user123456';

// 用戶資料
const userInfo = {
  id: userId,
  username: 'testuser',
  nickname: '張三',
  name: '張三豐',
  email: 'test@ailaborlaw.com',
  role: 'user'
};

// 將數據存入localStorage
localStorage.setItem('userId', userId);
localStorage.setItem('userInfo', JSON.stringify(userInfo));

console.log('模擬用戶數據已設置到localStorage:');
console.log('userId:', userId);
console.log('userInfo:', userInfo); 