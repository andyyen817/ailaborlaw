// API測試腳本
const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';
let registeredEmail = `test${Date.now()}@example.com`; // 生成唯一郵箱防止重複
let token = null;

// 測試用戶註冊API
async function testRegister() {
  console.log('\n===== 測試用戶註冊API =====');
  
  const testCases = [
    {
      name: '1. 正確數據註冊',
      data: {
        name: '測試用戶',
        email: registeredEmail,
        password: 'Password123',
        userType: 'employee'
      },
      expectedStatus: 201
    },
    {
      name: '2. 重複郵箱註冊',
      data: {
        name: '測試用戶2',
        email: registeredEmail, // 使用相同郵箱
        password: 'Password123',
        userType: 'employee'
      },
      expectedStatus: 409
    },
    {
      name: '3. 無效郵箱格式',
      data: {
        name: '測試用戶3',
        email: 'invalid-email',
        password: 'Password123',
        userType: 'employee'
      },
      expectedStatus: 400
    },
    {
      name: '4. 密碼格式不符',
      data: {
        name: '測試用戶4',
        email: 'test4@example.com',
        password: '123', // 密碼太短
        userType: 'employee'
      },
      expectedStatus: 400
    },
    {
      name: '5. 缺少必填字段',
      data: {
        name: '測試用戶5',
        // 缺少email
        password: 'Password123',
        userType: 'employee'
      },
      expectedStatus: 400
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n執行: ${testCase.name}`);
      const response = await axios.post(`${API_URL}/auth/register`, testCase.data);
      console.log(`✅ 響應狀態: ${response.status} (預期: ${testCase.expectedStatus})`);
      console.log(`響應數據: ${JSON.stringify(response.data, null, 2)}`);
      
      // 保存第一個成功註冊的token
      if (testCase.name === '1. 正確數據註冊' && response.data.success) {
        token = response.data.data.token;
      }
    } catch (error) {
      const status = error.response ? error.response.status : 'N/A';
      console.log(`❌ 響應狀態: ${status} (預期: ${testCase.expectedStatus})`);
      if (error.response) {
        console.log(`錯誤數據: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.log(`錯誤: ${error.message}`);
      }
    }
  }
}

// 測試用戶登入API
async function testLogin() {
  console.log('\n===== 測試用戶登入API =====');
  
  const testCases = [
    {
      name: '1. 正確郵箱和密碼',
      data: {
        email: registeredEmail,
        password: 'Password123'
      },
      expectedStatus: 200
    },
    {
      name: '2. 錯誤的郵箱',
      data: {
        email: 'nonexistent@example.com',
        password: 'Password123'
      },
      expectedStatus: 401
    },
    {
      name: '3. 錯誤的密碼',
      data: {
        email: registeredEmail,
        password: 'WrongPassword123'
      },
      expectedStatus: 401
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n執行: ${testCase.name}`);
      const response = await axios.post(`${API_URL}/auth/login`, testCase.data);
      console.log(`✅ 響應狀態: ${response.status} (預期: ${testCase.expectedStatus})`);
      console.log(`響應數據: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      const status = error.response ? error.response.status : 'N/A';
      console.log(`❌ 響應狀態: ${status} (預期: ${testCase.expectedStatus})`);
      if (error.response) {
        console.log(`錯誤數據: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.log(`錯誤: ${error.message}`);
      }
    }
  }
}

// 執行所有測試
async function runAllTests() {
  console.log('開始API測試...');
  await testRegister();
  await testLogin();
  console.log('\n測試完成!');
}

// 運行測試
runAllTests(); 