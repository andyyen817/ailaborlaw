/**
 * 管理员用户管理API测试脚本
 * 用于测试管理员用户管理相关功能
 */

const axios = require('axios');

// API基础URL
const BASE_URL = 'http://localhost:3000/api';
// 如果在开发箱内测试，使用内网地址
// const BASE_URL = 'http://ailabordevbox.ns-2rlrcc3k.svc.cluster.local:3000/api';

// 管理员访问令牌，登录后填入
let adminToken = '';

// 测试获取用户列表
async function testGetUsers() {
  try {
    console.log('测试获取用户列表...');
    const response = await axios.get(`${BASE_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      },
      params: {
        page: 1,
        limit: 10,
        sort: 'created_at',
        order: 'desc'
      }
    });
    console.log('响应状态码:', response.status);
    console.log('响应数据:', response.data);
    
    // 如果有用户，返回第一个用户的ID供后续测试使用
    if (response.data.data.users && response.data.data.users.length > 0) {
      return response.data.data.users[0].id;
    }
    
    return null;
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

// 测试获取用户详情
async function testGetUserDetail(userId) {
  try {
    console.log(`测试获取用户详情 (ID: ${userId})...`);
    const response = await axios.get(`${BASE_URL}/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
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

// 测试更新用户状态
async function testUpdateUserStatus(userId, status = 'active') {
  try {
    console.log(`测试更新用户状态 (ID: ${userId}, 状态: ${status})...`);
    const response = await axios.patch(`${BASE_URL}/admin/users/${userId}/status`, 
      { status },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );
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

// 测试更新用户免费查询次数
async function testUpdateUserQueries(userId, remaining_free_queries = 20) {
  try {
    console.log(`测试更新用户免费查询次数 (ID: ${userId}, 次数: ${remaining_free_queries})...`);
    const response = await axios.patch(`${BASE_URL}/admin/users/${userId}/queries`, 
      { remaining_free_queries },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );
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
  console.log('开始测试管理员用户管理API...');
  
  // 首先需要设置管理员令牌
  if (!adminToken) {
    console.error('请先获取管理员访问令牌并设置 adminToken 变量!');
    return;
  }
  
  // 获取用户列表，如果有用户，返回第一个用户的ID
  const userId = await testGetUsers();
  
  if (!userId) {
    console.log('没有找到可测试的用户，测试结束。');
    return;
  }
  
  // 获取用户详情
  await testGetUserDetail(userId);
  
  // 更新用户状态
  await testUpdateUserStatus(userId, 'active');
  
  // 更新用户免费查询次数
  await testUpdateUserQueries(userId, 20);
  
  console.log('测试完成!');
}

// 手动设置管理员令牌并执行测试
// adminToken = '这里填入管理员访问令牌';
// runTests(); 