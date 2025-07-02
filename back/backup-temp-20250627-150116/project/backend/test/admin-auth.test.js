/**
 * 管理员认证API测试脚本
 * 用于测试管理员登录和创建初始管理员账户
 */

const axios = require('axios');

// API基础URL
const BASE_URL = 'http://localhost:3000/api';
// 如果在开发箱内测试，使用内网地址
// const BASE_URL = 'http://ailabordevbox.ns-2rlrcc3k.svc.cluster.local:3000/api';

// 测试创建初始管理员账户
async function testCreateInitialAdmin() {
  try {
    console.log('测试创建初始管理员账户...');
    const response = await axios.post(`${BASE_URL}/admin/auth/init`);
    console.log('响应状态码:', response.status);
    console.log('响应数据:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误响应:', error.response.data);
    } else {
      console.error('请求错误:', error.message);
    }
    return null;
  }
}

// 测试管理员登录
async function testAdminLogin(username = 'admin', password = 'Admin@123') {
  try {
    console.log(`测试管理员登录 (${username})...`);
    const response = await axios.post(`${BASE_URL}/admin/auth/login`, {
      username,
      password
    });
    console.log('响应状态码:', response.status);
    console.log('响应数据:', response.data);
    
    // 保存令牌以供后续请求使用
    const { access_token } = response.data.data.tokens;
    console.log('访问令牌:', access_token);
    
    return access_token;
  } catch (error) {
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误响应:', error.response.data);
    } else {
      console.error('请求错误:', error.message);
    }
    return null;
  }
}

// 测试获取当前管理员信息
async function testGetCurrentAdmin(token) {
  try {
    console.log('测试获取当前管理员信息...');
    const response = await axios.get(`${BASE_URL}/admin/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('响应状态码:', response.status);
    console.log('响应数据:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误响应:', error.response.data);
    } else {
      console.error('请求错误:', error.message);
    }
    return null;
  }
}

// 运行测试
async function runTests() {
  console.log('开始测试管理员API...');
  
  // 创建初始管理员账户
  await testCreateInitialAdmin();
  
  // 测试管理员登录
  const token = await testAdminLogin();
  
  // 如果登录成功，测试获取当前管理员信息
  if (token) {
    await testGetCurrentAdmin(token);
  }
  
  console.log('测试完成!');
}

// 执行测试
runTests(); 