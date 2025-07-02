<template>
  <div class="data-statistics">
    <!-- 统计卡片网格 -->
    <div class="stats-grid">
      <!-- 总用户数 -->
      <div class="stat-card user-stats">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-trend" :class="userGrowth >= 0 ? 'positive' : 'negative'">
            <i :class="userGrowth >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
            <span>{{ Math.abs(userGrowth) }}%</span>
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(totalUsers) }}</div>
          <div class="stat-label">总用户数</div>
          <div class="stat-subtitle">较上月{{ userGrowth >= 0 ? '增长' : '下降' }} {{ Math.abs(userGrowth) }}%</div>
        </div>
      </div>

      <!-- 总咨询次数 -->
      <div class="stat-card query-stats">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-comments"></i>
          </div>
          <div class="stat-trend positive">
            <i class="fas fa-arrow-up"></i>
            <span>{{ queryGrowth }}%</span>
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(totalQueries) }}</div>
          <div class="stat-label">总咨询次数</div>
          <div class="stat-subtitle">今日新增 {{ todayQueries }} 次</div>
        </div>
      </div>

      <!-- 邀请统计 -->
      <div class="stat-card invite-stats">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-user-plus"></i>
          </div>
          <div class="stat-trend positive">
            <i class="fas fa-arrow-up"></i>
            <span>{{ inviteGrowth }}%</span>
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(totalInvites) }}</div>
          <div class="stat-label">成功邀请数</div>
          <div class="stat-subtitle">转化率 {{ inviteConversionRate }}%</div>
        </div>
      </div>

      <!-- 活跃用户 -->
      <div class="stat-card active-stats">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="stat-trend positive">
            <i class="fas fa-arrow-up"></i>
            <span>{{ activeGrowth }}%</span>
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(activeUsers) }}</div>
          <div class="stat-label">活跃用户</div>
          <div class="stat-subtitle">过去7天活跃</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <!-- 用户增长趋势 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>用户增长趋势</h3>
          <div class="chart-filters">
            <button 
              v-for="period in timePeriods" 
              :key="period.value"
              @click="selectedPeriod = period.value"
              :class="['filter-btn', { active: selectedPeriod === period.value }]"
            >
              {{ period.label }}
            </button>
          </div>
        </div>
        <div class="chart-container">
          <canvas ref="userGrowthChart" class="chart-canvas"></canvas>
        </div>
      </div>

      <!-- 咨询统计 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>咨询统计分析</h3>
        </div>
        <div class="chart-container">
          <canvas ref="queryStatsChart" class="chart-canvas"></canvas>
        </div>
      </div>
    </div>

    <!-- 详细统计表格 -->
    <div class="detailed-stats">
      <div class="stats-tabs">
        <button 
          v-for="tab in statsTabs" 
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="['tab-btn', { active: activeTab === tab.value }]"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>

      <div class="stats-content">
        <!-- 用户统计 -->
        <div v-show="activeTab === 'users'" class="stats-table">
          <h4>用户统计详情</h4>
          <div class="table-container">
            <table class="stats-data-table">
              <thead>
                <tr>
                  <th>指标</th>
                  <th>今日</th>
                  <th>本周</th>
                  <th>本月</th>
                  <th>总计</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>新用户注册</td>
                  <td>{{ userStats.today }}</td>
                  <td>{{ userStats.week }}</td>
                  <td>{{ userStats.month }}</td>
                  <td>{{ userStats.total }}</td>
                </tr>
                <tr>
                  <td>活跃用户</td>
                  <td>{{ activeStats.today }}</td>
                  <td>{{ activeStats.week }}</td>
                  <td>{{ activeStats.month }}</td>
                  <td>{{ activeStats.total }}</td>
                </tr>
                <tr>
                  <td>付费用户</td>
                  <td>{{ paidStats.today }}</td>
                  <td>{{ paidStats.week }}</td>
                  <td>{{ paidStats.month }}</td>
                  <td>{{ paidStats.total }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 咨询统计 -->
        <div v-show="activeTab === 'queries'" class="stats-table">
          <h4>咨询统计详情</h4>
          <div class="table-container">
            <table class="stats-data-table">
              <thead>
                <tr>
                  <th>指标</th>
                  <th>今日</th>
                  <th>本周</th>
                  <th>本月</th>
                  <th>总计</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>AI咨询次数</td>
                  <td>{{ queryDetailStats.aiToday }}</td>
                  <td>{{ queryDetailStats.aiWeek }}</td>
                  <td>{{ queryDetailStats.aiMonth }}</td>
                  <td>{{ queryDetailStats.aiTotal }}</td>
                </tr>
                <tr>
                  <td>人工咨询次数</td>
                  <td>{{ queryDetailStats.humanToday }}</td>
                  <td>{{ queryDetailStats.humanWeek }}</td>
                  <td>{{ queryDetailStats.humanMonth }}</td>
                  <td>{{ queryDetailStats.humanTotal }}</td>
                </tr>
                <tr>
                  <td>平均响应时间(秒)</td>
                  <td>{{ queryDetailStats.avgResponseToday }}</td>
                  <td>{{ queryDetailStats.avgResponseWeek }}</td>
                  <td>{{ queryDetailStats.avgResponseMonth }}</td>
                  <td>{{ queryDetailStats.avgResponseTotal }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 邀请统计 -->
        <div v-show="activeTab === 'invites'" class="stats-table">
          <h4>邀请统计详情</h4>
          <div class="table-container">
            <table class="stats-data-table">
              <thead>
                <tr>
                  <th>指标</th>
                  <th>今日</th>
                  <th>本周</th>
                  <th>本月</th>
                  <th>总计</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>发出邀请数</td>
                  <td>{{ inviteDetailStats.sentToday }}</td>
                  <td>{{ inviteDetailStats.sentWeek }}</td>
                  <td>{{ inviteDetailStats.sentMonth }}</td>
                  <td>{{ inviteDetailStats.sentTotal }}</td>
                </tr>
                <tr>
                  <td>成功注册数</td>
                  <td>{{ inviteDetailStats.successToday }}</td>
                  <td>{{ inviteDetailStats.successWeek }}</td>
                  <td>{{ inviteDetailStats.successMonth }}</td>
                  <td>{{ inviteDetailStats.successTotal }}</td>
                </tr>
                <tr>
                  <td>转化率(%)</td>
                  <td>{{ calculateConversionRate(inviteDetailStats.successToday, inviteDetailStats.sentToday) }}</td>
                  <td>{{ calculateConversionRate(inviteDetailStats.successWeek, inviteDetailStats.sentWeek) }}</td>
                  <td>{{ calculateConversionRate(inviteDetailStats.successMonth, inviteDetailStats.sentMonth) }}</td>
                  <td>{{ calculateConversionRate(inviteDetailStats.successTotal, inviteDetailStats.sentTotal) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import userService from '@/services/userService';
import inviteService from '@/services/inviteService';
import systemSettingsService from '@/services/systemSettingsService';

// 响应式数据
const loading = ref(true);
const selectedPeriod = ref('7d');
const activeTab = ref('users');

// 统计数据
const totalUsers = ref(0);
const totalQueries = ref(0);
const totalInvites = ref(0);
const activeUsers = ref(0);
const todayQueries = ref(0);

// 增长率数据
const userGrowth = ref(0);
const queryGrowth = ref(0);
const inviteGrowth = ref(0);
const activeGrowth = ref(0);
const inviteConversionRate = ref(0);

// 详细统计数据
const userStats = ref({
  today: 0,
  week: 0,
  month: 0,
  total: 0
});

const activeStats = ref({
  today: 0,
  week: 0,
  month: 0,
  total: 0
});

const paidStats = ref({
  today: 0,
  week: 0,
  month: 0,
  total: 0
});

const queryDetailStats = ref({
  aiToday: 0,
  aiWeek: 0,
  aiMonth: 0,
  aiTotal: 0,
  humanToday: 0,
  humanWeek: 0,
  humanMonth: 0,
  humanTotal: 0,
  avgResponseToday: 0,
  avgResponseWeek: 0,
  avgResponseMonth: 0,
  avgResponseTotal: 0
});

const inviteDetailStats = ref({
  sentToday: 0,
  sentWeek: 0,
  sentMonth: 0,
  sentTotal: 0,
  successToday: 0,
  successWeek: 0,
  successMonth: 0,
  successTotal: 0
});

// 配置数据
const timePeriods = [
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' },
  { label: '90天', value: '90d' },
  { label: '1年', value: '1y' }
];

const statsTabs = [
  { label: '用户统计', value: 'users', icon: 'fas fa-users' },
  { label: '咨询统计', value: 'queries', icon: 'fas fa-comments' },
  { label: '邀请统计', value: 'invites', icon: 'fas fa-user-plus' }
];

// 图表引用
const userGrowthChart = ref(null);
const queryStatsChart = ref(null);

// 方法
async function loadStatistics() {
  try {
    loading.value = true;

    // 获取系统查询统计
    const queryStatsResponse = await userService.getSystemQueryStats();
    if (queryStatsResponse.success && queryStatsResponse.data) {
      const data = queryStatsResponse.data;
      totalQueries.value = data.totalQueries || 0;
      todayQueries.value = data.todayQueries || 0;
      queryGrowth.value = data.growthRate || 0;
      
      // 更新详细查询统计
      queryDetailStats.value = {
        aiToday: data.aiToday || 0,
        aiWeek: data.aiWeek || 0,
        aiMonth: data.aiMonth || 0,
        aiTotal: data.aiTotal || 0,
        humanToday: data.humanToday || 0,
        humanWeek: data.humanWeek || 0,
        humanMonth: data.humanMonth || 0,
        humanTotal: data.humanTotal || 0,
        avgResponseToday: data.avgResponseToday || 0,
        avgResponseWeek: data.avgResponseWeek || 0,
        avgResponseMonth: data.avgResponseMonth || 0,
        avgResponseTotal: data.avgResponseTotal || 0
      };
    }

    // 获取邀请系统统计
    const inviteStatsResponse = await inviteService.getSystemInviteStats();
    if (inviteStatsResponse.success && inviteStatsResponse.data) {
      const data = inviteStatsResponse.data;
      totalInvites.value = data.totalInvites || 0;
      inviteGrowth.value = data.growthRate || 0;
      inviteConversionRate.value = data.conversionRate || 0;
      
      // 更新详细邀请统计
      inviteDetailStats.value = {
        sentToday: data.sentToday || 0,
        sentWeek: data.sentWeek || 0,
        sentMonth: data.sentMonth || 0,
        sentTotal: data.sentTotal || 0,
        successToday: data.successToday || 0,
        successWeek: data.successWeek || 0,
        successMonth: data.successMonth || 0,
        successTotal: data.successTotal || 0
      };
    }

    // 模拟用户统计数据（如果没有对应API）
    totalUsers.value = 1250;
    activeUsers.value = 320;
    userGrowth.value = 12.5;
    activeGrowth.value = 8.3;

    userStats.value = {
      today: 25,
      week: 148,
      month: 425,
      total: 1250
    };

    activeStats.value = {
      today: 89,
      week: 320,
      month: 987,
      total: 1250
    };

    paidStats.value = {
      today: 3,
      week: 18,
      month: 67,
      total: 245
    };

  } catch (error) {
    console.error('加载统计数据失败:', error);
  } finally {
    loading.value = false;
  }
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function calculateConversionRate(success, total) {
  if (total === 0) return '0.0';
  return ((success / total) * 100).toFixed(1);
}

async function initCharts() {
  await nextTick();
  
  // 这里可以集成 Chart.js 或其他图表库
  // 由于当前环境限制，这里只是占位符
  console.log('初始化图表组件');
  
  // 示例：如果使用 Chart.js
  // import Chart from 'chart.js/auto';
  // 
  // if (userGrowthChart.value) {
  //   new Chart(userGrowthChart.value, {
  //     type: 'line',
  //     data: {
  //       labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
  //       datasets: [{
  //         label: '用户增长',
  //         data: [100, 150, 200, 280, 320, 400],
  //         borderColor: '#3b82f6',
  //         tension: 0.4
  //       }]
  //     }
  //   });
  // }
}

// 监听时间周期变化
watch(selectedPeriod, () => {
  // 重新加载图表数据
  initCharts();
});

// 初始化
onMounted(async () => {
  await loadStatistics();
  await initCharts();
});
</script>

<style scoped>
.data-statistics {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.user-stats {
  border-left-color: #3b82f6;
}

.stat-card.query-stats {
  border-left-color: #10b981;
}

.stat-card.invite-stats {
  border-left-color: #f59e0b;
}

.stat-card.active-stats {
  border-left-color: #8b5cf6;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.user-stats .stat-icon {
  background: #3b82f6;
}

.query-stats .stat-icon {
  background: #10b981;
}

.invite-stats .stat-icon {
  background: #f59e0b;
}

.active-stats .stat-icon {
  background: #8b5cf6;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.stat-trend.positive {
  color: #10b981;
  background: #f0fdf4;
}

.stat-trend.negative {
  color: #ef4444;
  background: #fef2f2;
}

.stat-content {
  text-align: left;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-subtitle {
  font-size: 14px;
  color: #9ca3af;
}

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.chart-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.chart-filters {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px dashed #e5e7eb;
}

.chart-canvas {
  width: 100%;
  height: 100%;
}

.detailed-stats {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.stats-tabs {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  flex: 1;
  padding: 16px 24px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-btn.active {
  background: white;
  color: #3b82f6;
  border-bottom: 2px solid #3b82f6;
}

.stats-content {
  padding: 24px;
}

.stats-table h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
}

.table-container {
  overflow-x: auto;
}

.stats-data-table {
  width: 100%;
  border-collapse: collapse;
}

.stats-data-table th,
.stats-data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.stats-data-table th {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
  font-size: 14px;
}

.stats-data-table td {
  color: #6b7280;
  font-size: 14px;
}

.stats-data-table tbody tr:hover {
  background: #f9fafb;
}

@media (max-width: 1024px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .data-statistics {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stats-tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    justify-content: flex-start;
  }
}
</style> 