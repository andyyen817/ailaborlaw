<template>
  <div class="test-container">
    <div class="test-header">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">🚀 MVP功能测试面板</h1>
      <p class="text-gray-600 mb-6">验证系统各项功能是否正常工作</p>
    </div>

    <!-- 测试状态概览 -->
    <div class="test-overview grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="stat-card bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div class="stat-icon text-blue-600 mb-3">
          <i class="fas fa-flask text-2xl"></i>
        </div>
        <div class="stat-value text-3xl font-bold text-blue-600">{{ testResults.total }}</div>
        <div class="stat-label text-blue-700">总测试数</div>
      </div>

      <div class="stat-card bg-green-50 border border-green-200 rounded-lg p-6">
        <div class="stat-icon text-green-600 mb-3">
          <i class="fas fa-check text-2xl"></i>
        </div>
        <div class="stat-value text-3xl font-bold text-green-600">{{ testResults.passed }}</div>
        <div class="stat-label text-green-700">通过</div>
      </div>

      <div class="stat-card bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="stat-icon text-red-600 mb-3">
          <i class="fas fa-times text-2xl"></i>
        </div>
        <div class="stat-value text-3xl font-bold text-red-600">{{ testResults.failed }}</div>
        <div class="stat-label text-red-700">失败</div>
      </div>

      <div class="stat-card bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div class="stat-icon text-purple-600 mb-3">
          <i class="fas fa-percentage text-2xl"></i>
        </div>
        <div class="stat-value text-3xl font-bold text-purple-600">{{ testResults.passRate.toFixed(1) }}%</div>
        <div class="stat-label text-purple-700">通过率</div>
      </div>
    </div>

    <!-- 功能测试区域 -->
    <div class="test-sections space-y-8">
      
      <!-- 邀请功能测试 -->
      <div class="test-section bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">
          <i class="fas fa-user-plus text-blue-600 mr-2"></i>
          邀请功能测试
        </h2>
        <div class="test-buttons space-x-4 mb-4">
          <button @click="testInviteCode" class="test-btn bg-blue-600 text-white">
            测试获取邀请码
          </button>
          <button @click="testInviteStats" class="test-btn bg-green-600 text-white">
            测试邀请统计
          </button>
          <button @click="testLeaderboard" class="test-btn bg-purple-600 text-white">
            测试排行榜
          </button>
        </div>
        <div class="test-result" v-if="inviteTestResult">
          <pre class="bg-gray-100 p-4 rounded-md text-sm">{{ JSON.stringify(inviteTestResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- 咨询功能测试 -->
      <div class="test-section bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">
          <i class="fas fa-comments text-green-600 mr-2"></i>
          咨询功能测试
        </h2>
        <div class="test-buttons space-x-4 mb-4">
          <button @click="testQueryStatus" class="test-btn bg-green-600 text-white">
            测试咨询状态
          </button>
          <button @click="testTodayUsage" class="test-btn bg-yellow-600 text-white">
            测试今日使用
          </button>
          <button @click="testQueryRecords" class="test-btn bg-red-600 text-white">
            测试咨询记录
          </button>
        </div>
        <div class="test-result" v-if="queryTestResult">
          <pre class="bg-gray-100 p-4 rounded-md text-sm">{{ JSON.stringify(queryTestResult, null, 2) }}</pre>
        </div>
      </div>

      <!-- 页面导航测试 -->
      <div class="test-section bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">
          <i class="fas fa-link text-purple-600 mr-2"></i>
          页面导航测试
        </h2>
        <div class="test-buttons grid grid-cols-2 md:grid-cols-4 gap-4">
          <router-link to="/chat" class="nav-test-btn">
            <i class="fas fa-comments mr-2"></i>
            聊天页面
          </router-link>
          <router-link to="/invite" class="nav-test-btn">
            <i class="fas fa-user-plus mr-2"></i>
            邀请页面
          </router-link>
          <router-link to="/profile" class="nav-test-btn">
            <i class="fas fa-user mr-2"></i>
            个人资料
          </router-link>
          <router-link to="/records" class="nav-test-btn">
            <i class="fas fa-history mr-2"></i>
            咨询记录
          </router-link>
        </div>
      </div>

      <!-- 自动化测试 -->
      <div class="test-section bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">
          <i class="fas fa-robot text-orange-600 mr-2"></i>
          自动化测试
        </h2>
        <div class="test-buttons space-x-4 mb-4">
          <button @click="runAllTests" class="test-btn bg-orange-600 text-white" :disabled="isRunningTests">
            <i class="fas fa-play mr-2"></i>
            {{ isRunningTests ? '测试中...' : '运行所有测试' }}
          </button>
          <button @click="clearResults" class="test-btn bg-gray-600 text-white">
            <i class="fas fa-trash mr-2"></i>
            清除结果
          </button>
        </div>
        
        <!-- 测试日志 -->
        <div v-if="testLogs.length > 0" class="test-logs bg-black text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
          <div v-for="(log, index) in testLogs" :key="index" class="log-line">
            {{ log }}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import inviteService from '@/services/inviteService';
import userService from '@/services/userService';
import authService from '@/services/auth';

// 响应式数据
const isRunningTests = ref(false);
const inviteTestResult = ref(null);
const queryTestResult = ref(null);
const testLogs = ref([]);

const testResults = reactive({
  total: 0,
  passed: 0,
  failed: 0,
  passRate: 0
});

// 日志函数
const addLog = (message) => {
  const timestamp = new Date().toLocaleTimeString();
  testLogs.value.push(`[${timestamp}] ${message}`);
  console.log(message);
};

// 🔧 单项测试函数
const testInviteCode = async () => {
  addLog('🧪 测试获取邀请码...');
  try {
    const result = await inviteService.getMyInviteCode();
    inviteTestResult.value = result;
    addLog(`✅ 邀请码测试完成: ${result.success ? '成功' : '失败'}`);
  } catch (error) {
    addLog(`❌ 邀请码测试失败: ${error.message}`);
    inviteTestResult.value = { error: error.message };
  }
};

const testInviteStats = async () => {
  addLog('🧪 测试邀请统计...');
  try {
    const result = await inviteService.getMyInviteStats();
    inviteTestResult.value = result;
    addLog(`✅ 邀请统计测试完成: ${result.success ? '成功' : '失败'}`);
  } catch (error) {
    addLog(`❌ 邀请统计测试失败: ${error.message}`);
    inviteTestResult.value = { error: error.message };
  }
};

const testLeaderboard = async () => {
  addLog('🧪 测试排行榜...');
  try {
    const result = await inviteService.getInviteLeaderboard();
    inviteTestResult.value = result;
    addLog(`✅ 排行榜测试完成: ${result.success ? '成功' : '失败'}`);
  } catch (error) {
    addLog(`❌ 排行榜测试失败: ${error.message}`);
    inviteTestResult.value = { error: error.message };
  }
};

const testQueryStatus = async () => {
  addLog('🧪 测试咨询状态...');
  try {
    const result = await userService.getMyQueryStatus();
    queryTestResult.value = result;
    addLog(`✅ 咨询状态测试完成: ${result.success ? '成功' : '失败'}`);
  } catch (error) {
    addLog(`❌ 咨询状态测试失败: ${error.message}`);
    queryTestResult.value = { error: error.message };
  }
};

const testTodayUsage = async () => {
  addLog('🧪 测试今日使用次数...');
  try {
    const result = await userService.getTodayUsageCount();
    queryTestResult.value = result;
    
    // 🔧 时区修复验证：检查API响应中的时区字段
    if (result.success && result.data) {
      if (result.data.timezone === 'Asia/Taipei') {
        addLog('✅ 时区验证通过: Asia/Taipei');
      } else if (result.data.timezone) {
        addLog(`⚠️ 时区异常: ${result.data.timezone} (期望: Asia/Taipei)`);
      } else {
        addLog('⚠️ API响应中缺少时区字段');
      }
      
      // 验证todayCount字段
      if (typeof result.data.todayCount === 'number') {
        addLog(`📊 今日使用次数: ${result.data.todayCount}`);
      } else {
        addLog('❌ todayCount字段类型异常');
      }
    }
    
    addLog(`✅ 今日使用测试完成: ${result.success ? '成功' : '失败'}`);
  } catch (error) {
    addLog(`❌ 今日使用测试失败: ${error.message}`);
    queryTestResult.value = { error: error.message };
  }
};

const testQueryRecords = async () => {
  addLog('🧪 测试咨询记录...');
  try {
    const result = await userService.getMyQueryRecords();
    queryTestResult.value = result;
    addLog(`✅ 咨询记录测试完成: ${result.success ? '成功' : '失败'}`);
  } catch (error) {
    addLog(`❌ 咨询记录测试失败: ${error.message}`);
    queryTestResult.value = { error: error.message };
  }
};

// 🔧 运行所有测试
const runAllTests = async () => {
  if (isRunningTests.value) return;
  
  isRunningTests.value = true;
  testLogs.value = [];
  
  addLog('🚀 开始运行自动化测试...');
  
  let totalTests = 0;
  let passedTests = 0;

  const tests = [
    { name: '获取邀请码', fn: testInviteCode },
    { name: '获取邀请统计', fn: testInviteStats },
    { name: '获取排行榜', fn: testLeaderboard },
    { name: '获取咨询状态', fn: testQueryStatus },
    { name: '获取今日使用', fn: testTodayUsage },
    { name: '获取咨询记录', fn: testQueryRecords }
  ];

  for (const test of tests) {
    totalTests++;
    try {
      await test.fn();
      passedTests++;
    } catch (error) {
      addLog(`❌ ${test.name} 失败: ${error.message}`);
    }
    
    // 短暂延迟，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 更新测试结果
  testResults.total = totalTests;
  testResults.passed = passedTests;
  testResults.failed = totalTests - passedTests;
  testResults.passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  addLog('🎯 自动化测试完成');
  addLog(`📊 结果: ${passedTests}/${totalTests} 通过 (${testResults.passRate.toFixed(1)}%)`);
  
  isRunningTests.value = false;
};

// 清除测试结果
const clearResults = () => {
  testLogs.value = [];
  inviteTestResult.value = null;
  queryTestResult.value = null;
  testResults.total = 0;
  testResults.passed = 0;
  testResults.failed = 0;
  testResults.passRate = 0;
  addLog('🧹 测试结果已清除');
};

// 页面加载时的初始化
onMounted(() => {
  addLog('🎯 测试面板已加载，可以开始测试');
});
</script>

<style scoped>
.test-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.test-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.test-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.nav-test-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background: #f3f4f6;
  color: #374151;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-test-btn:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.test-result {
  margin-top: 16px;
}

.test-logs {
  font-family: 'Courier New', monospace;
}

.log-line {
  margin-bottom: 4px;
}

.stat-card {
  text-align: center;
}

.stat-value {
  margin: 8px 0 4px 0;
}

.stat-label {
  font-size: 14px;
  font-weight: 500;
}
</style> 