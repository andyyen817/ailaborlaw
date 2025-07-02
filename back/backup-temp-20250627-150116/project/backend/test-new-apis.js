#!/usr/bin/env node

/**
 * 新API功能测试脚本
 * 测试邀请管理和咨询次数管理功能
 */

import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const BASE_URL = process.env.API_BASE_URL || 'https://wrrfvodsaofk.sealosgzg.site/api/v1';

console.log('🚀 开始测试新API功能...\n');

// 测试配置
const testConfig = {
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

let authTokenUser = null;
let authTokenAdmin = null;
let testUserId = null;

/**
 * 测试用户注册和登录
 */
async function testAuthFlow() {
  console.log('📝 测试用户认证流程...');
  
  try {
    // 注册测试用户
    const registerData = {
      name: 'Test User ' + Date.now(),
      email: `testuser${Date.now()}@example.com`,
      password: 'Test123456',
      userType: 'employee'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData, testConfig);
    console.log('✅ 用户注册成功:', registerResponse.data.message);
    
    // 登录获取token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: registerData.email,
      password: registerData.password
    }, testConfig);
    
    authTokenUser = loginResponse.data.data.token;
    testUserId = loginResponse.data.data.user.id;
    console.log('✅ 用户登录成功，获得Token');
    
    return true;
  } catch (error) {
    console.error('❌ 认证流程失败:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * 测试管理员登录
 */
async function testAdminLogin() {
  console.log('👨‍💼 测试管理员登录...');
  
  try {
    // 尝试使用默认管理员账户登录
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'Admin123456'
    }, testConfig);
    
    authTokenAdmin = adminLoginResponse.data.data.token;
    console.log('✅ 管理员登录成功');
    
    return true;
  } catch (error) {
    console.error('❌ 管理员登录失败:', error.response?.data?.message || error.message);
    console.log('ℹ️  将跳过需要管理员权限的测试');
    return false;
  }
}

/**
 * 测试系统设置初始化
 */
async function testSystemSettingsInit() {
  if (!authTokenAdmin) {
    console.log('⏭️  跳过系统设置测试（需要管理员权限）');
    return;
  }
  
  console.log('⚙️  测试系统设置初始化...');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/admin/system-settings/initialize`,
      {},
      {
        ...testConfig,
        headers: {
          ...testConfig.headers,
          'Authorization': `Bearer ${authTokenAdmin}`
        }
      }
    );
    
    console.log('✅ 系统设置初始化成功:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ 系统设置初始化失败:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * 测试邀请功能
 */
async function testInviteFeatures() {
  if (!authTokenUser) {
    console.log('⏭️  跳过邀请功能测试（需要用户认证）');
    return;
  }
  
  console.log('🎫 测试邀请功能...');
  
  try {
    // 获取用户邀请码
    const codeResponse = await axios.get(
      `${BASE_URL}/invites/my-code`,
      {
        ...testConfig,
        headers: {
          ...testConfig.headers,
          'Authorization': `Bearer ${authTokenUser}`
        }
      }
    );
    
    const inviteCode = codeResponse.data.data.inviteCode;
    console.log('✅ 获取邀请码成功:', inviteCode);
    
    // 验证邀请码
    const validateResponse = await axios.post(
      `${BASE_URL}/invites/validate`,
      { inviteCode },
      testConfig
    );
    
    console.log('✅ 邀请码验证成功:', validateResponse.data.message);
    
    // 获取邀请统计
    const statsResponse = await axios.get(
      `${BASE_URL}/invites/my-stats`,
      {
        ...testConfig,
        headers: {
          ...testConfig.headers,
          'Authorization': `Bearer ${authTokenUser}`
        }
      }
    );
    
    console.log('✅ 获取邀请统计成功:', statsResponse.data.data);
    
    // 发放注册奖励
    const bonusResponse = await axios.post(
      `${BASE_URL}/invites/grant-registration-bonus`,
      {},
      {
        ...testConfig,
        headers: {
          ...testConfig.headers,
          'Authorization': `Bearer ${authTokenUser}`
        }
      }
    );
    
    console.log('✅ 注册奖励发放成功:', bonusResponse.data.data);
    
    return true;
  } catch (error) {
    console.error('❌ 邀请功能测试失败:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * 测试咨询次数功能
 */
async function testQueryFeatures() {
  if (!authTokenUser) {
    console.log('⏭️  跳过咨询次数功能测试（需要用户认证）');
    return;
  }
  
  console.log('🔢 测试咨询次数功能...');
  
  try {
    // 获取用户状态
    const statusResponse = await axios.get(
      `${BASE_URL}/queries/my-status`,
      {
        ...testConfig,
        headers: {
          ...testConfig.headers,
          'Authorization': `Bearer ${authTokenUser}`
        }
      }
    );
    
    console.log('✅ 获取用户状态成功:', statusResponse.data.data);
    
    // 获取今日使用次数
    const todayResponse = await axios.get(
      `${BASE_URL}/queries/my-today-count`,
      {
        ...testConfig,
        headers: {
          ...testConfig.headers,
          'Authorization': `Bearer ${authTokenUser}`
        }
      }
    );
    
    console.log('✅ 获取今日使用次数成功:', todayResponse.data.data);
    
    // 测试扣减次数
    const decreaseResponse = await axios.post(
      `${BASE_URL}/queries/decrease`,
      {
        reason: 'API测试扣减',
        metadata: { testMode: true }
      },
      {
        ...testConfig,
        headers: {
          ...testConfig.headers,
          'Authorization': `Bearer ${authTokenUser}`
        }
      }
    );
    
    console.log('✅ 扣减咨询次数成功:', decreaseResponse.data.data);
    
    // 获取操作记录
    const recordsResponse = await axios.get(
      `${BASE_URL}/queries/my-records?page=1&limit=5`,
      {
        ...testConfig,
        headers: {
          ...testConfig.headers,
          'Authorization': `Bearer ${authTokenUser}`
        }
      }
    );
    
    console.log('✅ 获取操作记录成功:', recordsResponse.data.data.records.length, '条记录');
    
    return true;
  } catch (error) {
    console.error('❌ 咨询次数功能测试失败:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * 测试管理员功能
 */
async function testAdminFeatures() {
  if (!authTokenAdmin || !testUserId) {
    console.log('⏭️  跳过管理员功能测试（需要管理员权限和测试用户）');
    return;
  }
  
  console.log('👨‍💼 测试管理员功能...');
  
  try {
    // 管理员增加用户咨询次数
    const increaseResponse = await axios.post(
      `${BASE_URL}/queries/increase`,
      {
        userId: testUserId,
        amount: 5,
        reason: '管理员测试增加',
        metadata: { testMode: true }
      },
      {
        ...testConfig,
        headers: {
          ...testConfig.headers,
          'Authorization': `Bearer ${authTokenAdmin}`
        }
      }
    );
    
    console.log('✅ 管理员增加次数成功:', increaseResponse.data.data);
    
    // 获取系统设置
    const settingsResponse = await axios.get(
      `${BASE_URL}/admin/system-settings?category=invite`,
      {
        ...testConfig,
        headers: {
          ...testConfig.headers,
          'Authorization': `Bearer ${authTokenAdmin}`
        }
      }
    );
    
    console.log('✅ 获取系统设置成功:', settingsResponse.data.data.settings.length, '个设置');
    
    // 获取邀请系统统计
    const inviteStatsResponse = await axios.get(
      `${BASE_URL}/invites/system-stats`,
      {
        ...testConfig,
        headers: {
          ...testConfig.headers,
          'Authorization': `Bearer ${authTokenAdmin}`
        }
      }
    );
    
    console.log('✅ 获取邀请系统统计成功:', inviteStatsResponse.data.data.summary);
    
    return true;
  } catch (error) {
    console.error('❌ 管理员功能测试失败:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log(`📡 目标API地址: ${BASE_URL}\n`);
  
  let testResults = {
    auth: false,
    admin: false,
    systemSettings: false,
    invite: false,
    query: false,
    adminFeatures: false
  };
  
  // 按顺序执行测试
  testResults.auth = await testAuthFlow();
  console.log('');
  
  testResults.admin = await testAdminLogin();
  console.log('');
  
  testResults.systemSettings = await testSystemSettingsInit();
  console.log('');
  
  testResults.invite = await testInviteFeatures();
  console.log('');
  
  testResults.query = await testQueryFeatures();
  console.log('');
  
  testResults.adminFeatures = await testAdminFeatures();
  console.log('');
  
  // 输出测试结果摘要
  console.log('📊 测试结果摘要:');
  console.log('================');
  console.log(`🔐 用户认证: ${testResults.auth ? '✅ 通过' : '❌ 失败'}`);
  console.log(`👨‍💼 管理员登录: ${testResults.admin ? '✅ 通过' : '❌ 失败'}`);
  console.log(`⚙️  系统设置: ${testResults.systemSettings ? '✅ 通过' : '⏭️  跳过'}`);
  console.log(`🎫 邀请功能: ${testResults.invite ? '✅ 通过' : '❌ 失败'}`);
  console.log(`🔢 咨询次数: ${testResults.query ? '✅ 通过' : '❌ 失败'}`);
  console.log(`👨‍💼 管理员功能: ${testResults.adminFeatures ? '✅ 通过' : '⏭️  跳过'}`);
  
  const passedTests = Object.values(testResults).filter(result => result === true).length;
  const totalTests = Object.keys(testResults).length;
  
  console.log(`\n🎯 总体结果: ${passedTests}/${totalTests} 项测试通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试都通过了！新API功能正常工作！');
  } else if (passedTests >= totalTests * 0.5) {
    console.log('⚠️  大部分测试通过，有部分功能需要检查');
  } else {
    console.log('🚨 多个测试失败，需要检查API配置和实现');
  }
}

// 执行测试
runTests().catch(error => {
  console.error('💥 测试执行过程中发生错误:', error.message);
  process.exit(1);
}); 