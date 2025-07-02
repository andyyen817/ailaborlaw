/**
 * 🚀 MVP集成测试脚本
 * 自动化验证关键功能点
 */

import inviteService from '@/services/inviteService';
import userService from '@/services/userService';
import authService from '@/services/auth';

class IntegrationTester {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  async runTest(testName, testFunction) {
    this.totalTests++;
    console.log(`🧪 运行测试: ${testName}`);
    
    try {
      await testFunction();
      this.passedTests++;
      this.testResults.push({ name: testName, status: 'PASS', error: null });
      console.log(`✅ ${testName} - 通过`);
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
      console.error(`❌ ${testName} - 失败: ${error.message}`);
    }
  }

  // 🔧 邀请系统API测试
  async testInviteAPIs() {
    await this.runTest('获取邀请码', async () => {
      const result = await inviteService.getMyInviteCode();
      if (!result.success) throw new Error('获取邀请码失败');
    });

    await this.runTest('获取邀请统计', async () => {
      const result = await inviteService.getMyInviteStats();
      if (!result.success) throw new Error('获取邀请统计失败');
    });

    await this.runTest('验证邀请码格式', async () => {
      const result = await inviteService.validateInviteCode('TEST001');
      // 测试函数应该能处理错误而不抛出异常
      if (typeof result !== 'object') throw new Error('邀请码验证返回格式错误');
    });

    await this.runTest('获取排行榜', async () => {
      const result = await inviteService.getInviteLeaderboard();
      if (!result.success) throw new Error('获取排行榜失败');
    });
  }

  // 🔧 咨询次数API测试
  async testQueryAPIs() {
    await this.runTest('获取咨询状态', async () => {
      const result = await userService.getMyQueryStatus();
      if (!result.success) throw new Error('获取咨询状态失败');
    });

    await this.runTest('获取今日使用次数', async () => {
      const result = await userService.getTodayUsageCount();
      if (!result.success) throw new Error('获取今日使用次数失败');
    });

    await this.runTest('获取咨询记录', async () => {
      const result = await userService.getMyQueryRecords();
      if (!result.success) throw new Error('获取咨询记录失败');
    });
  }

  // 🔧 管理员API测试
  async testAdminAPIs() {
    await this.runTest('获取系统查询统计', async () => {
      const result = await userService.getSystemQueryStats();
      if (!result.success) throw new Error('获取系统查询统计失败');
    });

    await this.runTest('获取系统邀请统计', async () => {
      const result = await inviteService.getSystemInviteStats();
      if (!result.success) throw new Error('获取系统邀请统计失败');
    });
  }

  // 🔧 本地存储测试
  async testLocalStorage() {
    await this.runTest('本地存储功能', () => {
      // 测试localStorage基本功能
      localStorage.setItem('test_key', 'test_value');
      const value = localStorage.getItem('test_key');
      localStorage.removeItem('test_key');
      
      if (value !== 'test_value') {
        throw new Error('localStorage功能异常');
      }
    });

    await this.runTest('认证状态检查', () => {
      // 测试认证服务
      const currentUser = authService.getCurrentUser();
      if (!currentUser && !authService.isAuthenticated()) {
        // 这是正常的未登录状态
        return;
      }
    });
  }

  // 🔧 数据格式验证测试
  async testDataFormats() {
    await this.runTest('日期格式处理', () => {
      const testDate = new Date();
      const formatted = testDate.toISOString();
      const parsed = new Date(formatted);
      
      if (isNaN(parsed.getTime())) {
        throw new Error('日期格式处理错误');
      }
    });

    await this.runTest('数字格式化', () => {
      const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
      };

      const tests = [
        [1500, '1.5K'],
        [1500000, '1.5M'],
        [999, '999']
      ];

      for (const [input, expected] of tests) {
        if (formatNumber(input) !== expected) {
          throw new Error(`数字格式化错误: ${input} -> ${formatNumber(input)}, 期望: ${expected}`);
        }
      }
    });
  }

  // 🔧 运行所有测试
  async runAllTests() {
    console.log('🚀 开始运行集成测试...\n');

    await this.testLocalStorage();
    await this.testDataFormats();
    await this.testInviteAPIs();
    await this.testQueryAPIs();
    await this.testAdminAPIs();

    this.generateReport();
  }

  // 🔧 生成测试报告
  generateReport() {
    console.log('\n📊 测试报告');
    console.log('='.repeat(50));
    console.log(`总测试数: ${this.totalTests}`);
    console.log(`通过: ${this.passedTests}`);
    console.log(`失败: ${this.totalTests - this.passedTests}`);
    console.log(`通过率: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n📋 详细结果:');
    this.testResults.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${result.name}`);
      if (result.error) {
        console.log(`   错误: ${result.error}`);
      }
    });

    console.log('\n🎯 测试完成');
    
    // 返回测试结果用于后续处理
    return {
      total: this.totalTests,
      passed: this.passedTests,
      failed: this.totalTests - this.passedTests,
      passRate: (this.passedTests / this.totalTests) * 100,
      results: this.testResults
    };
  }
}

// 导出测试器
export default IntegrationTester;

// 如果直接运行此文件
if (typeof window !== 'undefined') {
  window.IntegrationTester = IntegrationTester;
} 