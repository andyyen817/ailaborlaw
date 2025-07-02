<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">系统性能监控</h1>
        <p class="text-gray-600">实时监控系统性能、缓存效率和用户体验指标</p>
      </div>

      <!-- 实时状态卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- 系统健康度 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">系统健康度</p>
              <p class="text-2xl font-bold" :class="healthStatusColor">{{ realTimeStatus.systemHealth?.status || 'LOADING' }}</p>
            </div>
            <div class="p-3 rounded-full" :class="healthIconBg">
              <svg class="w-6 h-6" :class="healthIconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4">
            <div class="text-xs text-gray-500">评分: {{ realTimeStatus.systemHealth?.score || '--' }}/100</div>
            <div v-if="realTimeStatus.systemHealth?.issues?.length" class="mt-2">
              <div v-for="issue in realTimeStatus.systemHealth.issues" :key="issue" 
                   class="text-xs text-red-600 bg-red-50 px-2 py-1 rounded mb-1">
                ⚠️ {{ issue }}
              </div>
            </div>
          </div>
        </div>

        <!-- 缓存命中率 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">缓存命中率</p>
              <p class="text-2xl font-bold text-blue-600">{{ cacheStats.hitRate || '0%' }}</p>
            </div>
            <div class="p-3 rounded-full bg-blue-100">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4 text-xs text-gray-500">
            命中: {{ cacheStats.hits || 0 }} | 未命中: {{ cacheStats.misses || 0 }}
          </div>
        </div>

        <!-- 活跃计时器 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">活跃监控</p>
              <p class="text-2xl font-bold text-green-600">{{ realTimeStatus.activeTimers || 0 }}</p>
            </div>
            <div class="p-3 rounded-full bg-green-100">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4 text-xs text-gray-500">
            实时性能监控进程
          </div>
        </div>

        <!-- 整体评分 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">性能评分</p>
              <p class="text-2xl font-bold" :class="overallScoreColor">{{ performanceReport.overallScore?.score || '--' }}</p>
            </div>
            <div class="p-3 rounded-full" :class="scoreIconBg">
              <svg class="w-6 h-6" :class="scoreIconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
              </svg>
            </div>
          </div>
          <div class="mt-4 text-xs text-gray-500">
            等级: {{ performanceReport.overallScore?.grade || '--' }}
          </div>
        </div>
      </div>

      <!-- 性能图表区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- API性能统计 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">API性能统计</h3>
          <div v-if="apiMetrics" class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600">总请求数</span>
              <span class="text-lg font-bold text-gray-900">{{ apiMetrics.total || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600">成功率</span>
              <span class="text-lg font-bold text-green-600">{{ apiMetrics.successRate || '0%' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600">平均响应时间</span>
              <span class="text-lg font-bold text-blue-600">{{ apiMetrics.avgDuration || 0 }}ms</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600">95分位响应时间</span>
              <span class="text-lg font-bold text-orange-600">{{ apiMetrics.p95Duration || 0 }}ms</span>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-8">
            暂无API性能数据
          </div>
        </div>

        <!-- 缓存统计 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">缓存使用统计</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600">内存缓存项</span>
              <span class="text-lg font-bold text-gray-900">{{ cacheStats.memoryEntries || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600">内存使用量</span>
              <span class="text-lg font-bold text-blue-600">{{ cacheStats.memoryUsage || '0 B' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600">存储使用量</span>
              <span class="text-lg font-bold text-purple-600">{{ cacheStats.storageUsage || '0 B' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-600">总缓存项</span>
              <span class="text-lg font-bold text-green-600">{{ cacheStats.totalEntries || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 性能等级分布 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">性能等级分布</h3>
        <div v-if="performanceGrades" class="grid grid-cols-5 gap-4">
          <div v-for="(count, grade) in performanceGrades" :key="grade" 
               class="text-center p-4 rounded-lg" :class="getGradeStyle(grade)">
            <div class="text-2xl font-bold">{{ count }}</div>
            <div class="text-sm font-medium mt-1">{{ getGradeLabel(grade) }}</div>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          暂无性能等级数据
        </div>
      </div>

      <!-- 近期指标趋势 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">近期指标趋势</h3>
          <div class="flex space-x-2">
            <button @click="refreshData" 
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    :disabled="isLoading">
              <span v-if="isLoading">🔄 刷新中...</span>
              <span v-else>🔄 刷新数据</span>
            </button>
            <button @click="clearCache" 
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              🗑️ 清除缓存
            </button>
          </div>
        </div>
        
        <!-- 最近的性能指标列表 -->
        <div v-if="recentMetrics.length" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">耗时</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">等级</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="metric in recentMetrics" :key="metric.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatTime(metric.timestamp) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getTypeStyle(metric.type)">
                    {{ getTypeLabel(metric.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ metric.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ metric.duration ? metric.duration.toFixed(2) + 'ms' : '--' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="metric.performance" 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getPerformanceStyle(metric.performance.grade)">
                    {{ metric.performance.grade }}
                  </span>
                  <span v-else class="text-gray-400">--</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="metric.metadata?.success !== false" 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    成功
                  </span>
                  <span v-else 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    失败
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          暂无近期性能数据
        </div>
      </div>

      <!-- 系统配置信息 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">系统配置信息</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h4 class="font-medium text-gray-900 mb-2">性能监控</h4>
            <div class="text-sm text-gray-600 space-y-1">
              <div>会话时长: {{ formatDuration(performanceReport.sessionDuration) }}</div>
              <div>报告时间: {{ formatTime(performanceReport.generatedAt) }}</div>
              <div>时间范围: {{ formatDuration(performanceReport.timeRange) }}</div>
            </div>
          </div>
          <div>
            <h4 class="font-medium text-gray-900 mb-2">缓存配置</h4>
            <div class="text-sm text-gray-600 space-y-1">
              <div>设置操作: {{ cacheStats.sets || 0 }}</div>
              <div>删除操作: {{ cacheStats.deletes || 0 }}</div>
              <div>清理操作: {{ cacheStats.evictions || 0 }}</div>
            </div>
          </div>
          <div>
            <h4 class="font-medium text-gray-900 mb-2">版本信息</h4>
            <div class="text-sm text-gray-600 space-y-1">
              <div>系统版本: v2.6.0</div>
              <div>性能监控: v1.0.0</div>
              <div>缓存服务: v1.0.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import performanceService from '@/services/performanceService.js';
import cacheService from '@/services/cacheService.js';

export default {
  name: 'SystemPerformanceView',
  setup() {
    // 响应式数据
    const isLoading = ref(false);
    const performanceReport = ref({});
    const realTimeStatus = ref({});
    const cacheStats = ref({});
    const refreshInterval = ref(null);

    // 计算属性
    const apiMetrics = computed(() => {
      return performanceReport.value.summary?.api_response;
    });

    const performanceGrades = computed(() => {
      return performanceReport.value.details?.api_response?.performanceGrades;
    });

    const recentMetrics = computed(() => {
      const allMetrics = [];
      if (realTimeStatus.value.recentMetrics) {
        Object.values(realTimeStatus.value.recentMetrics).forEach(metrics => {
          if (Array.isArray(metrics)) {
            allMetrics.push(...metrics);
          }
        });
      }
      return allMetrics.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
    });

    const healthStatusColor = computed(() => {
      const status = realTimeStatus.value.systemHealth?.status;
      switch (status) {
        case 'HEALTHY': return 'text-green-600';
        case 'WARNING': return 'text-yellow-600';
        case 'CRITICAL': return 'text-red-600';
        default: return 'text-gray-600';
      }
    });

    const healthIconBg = computed(() => {
      const status = realTimeStatus.value.systemHealth?.status;
      switch (status) {
        case 'HEALTHY': return 'bg-green-100';
        case 'WARNING': return 'bg-yellow-100';
        case 'CRITICAL': return 'bg-red-100';
        default: return 'bg-gray-100';
      }
    });

    const healthIconColor = computed(() => {
      const status = realTimeStatus.value.systemHealth?.status;
      switch (status) {
        case 'HEALTHY': return 'text-green-600';
        case 'WARNING': return 'text-yellow-600';
        case 'CRITICAL': return 'text-red-600';
        default: return 'text-gray-600';
      }
    });

    const overallScoreColor = computed(() => {
      const grade = performanceReport.value.overallScore?.grade;
      switch (grade) {
        case 'EXCELLENT': return 'text-green-600';
        case 'GOOD': return 'text-blue-600';
        case 'FAIR': return 'text-yellow-600';
        case 'POOR': return 'text-orange-600';
        case 'VERY_POOR': return 'text-red-600';
        default: return 'text-gray-600';
      }
    });

    const scoreIconBg = computed(() => {
      const grade = performanceReport.value.overallScore?.grade;
      switch (grade) {
        case 'EXCELLENT': return 'bg-green-100';
        case 'GOOD': return 'bg-blue-100';
        case 'FAIR': return 'bg-yellow-100';
        case 'POOR': return 'bg-orange-100';
        case 'VERY_POOR': return 'bg-red-100';
        default: return 'bg-gray-100';
      }
    });

    const scoreIconColor = computed(() => {
      const grade = performanceReport.value.overallScore?.grade;
      switch (grade) {
        case 'EXCELLENT': return 'text-green-600';
        case 'GOOD': return 'text-blue-600';
        case 'FAIR': return 'text-yellow-600';
        case 'POOR': return 'text-orange-600';
        case 'VERY_POOR': return 'text-red-600';
        default: return 'text-gray-600';
      }
    });

    // 方法
    const loadPerformanceData = async () => {
      try {
        // 获取性能报告
        const report = performanceService.getPerformanceReport(24 * 60 * 60 * 1000); // 24小时
        performanceReport.value = report;

        // 获取实时状态
        const status = performanceService.getRealTimeStatus();
        realTimeStatus.value = status;

        // 获取缓存统计
        const cache = cacheService.getStats();
        cacheStats.value = cache;

        console.log('📊 性能数据加载完成');
      } catch (error) {
        console.error('❌ 加载性能数据失败:', error);
      }
    };

    const refreshData = async () => {
      isLoading.value = true;
      try {
        await loadPerformanceData();
      } finally {
        isLoading.value = false;
      }
    };

    const clearCache = () => {
      if (confirm('确定要清除所有缓存吗？这可能会影响性能。')) {
        const cleared = cacheService.clearAll();
        alert(`已清除 ${cleared} 个缓存项目`);
        refreshData();
      }
    };

    const startAutoRefresh = () => {
      refreshInterval.value = setInterval(() => {
        loadPerformanceData();
      }, 30000); // 30秒自动刷新
    };

    const stopAutoRefresh = () => {
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value);
        refreshInterval.value = null;
      }
    };

    // 工具方法
    const formatTime = (timestamp) => {
      if (!timestamp) return '--';
      return new Date(timestamp).toLocaleString('zh-CN');
    };

    const formatDuration = (duration) => {
      if (!duration) return '--';
      const seconds = Math.floor(duration / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        return `${hours}小时${minutes % 60}分钟`;
      } else if (minutes > 0) {
        return `${minutes}分钟${seconds % 60}秒`;
      } else {
        return `${seconds}秒`;
      }
    };

    const getGradeStyle = (grade) => {
      switch (grade) {
        case 'EXCELLENT': return 'bg-green-100 text-green-800';
        case 'GOOD': return 'bg-blue-100 text-blue-800';
        case 'FAIR': return 'bg-yellow-100 text-yellow-800';
        case 'POOR': return 'bg-orange-100 text-orange-800';
        case 'VERY_POOR': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getGradeLabel = (grade) => {
      const labels = {
        'EXCELLENT': '优秀',
        'GOOD': '良好',
        'FAIR': '一般',
        'POOR': '较差',
        'VERY_POOR': '很差'
      };
      return labels[grade] || grade;
    };

    const getTypeStyle = (type) => {
      switch (type) {
        case 'api_response': return 'bg-blue-100 text-blue-800';
        case 'page_load': return 'bg-green-100 text-green-800';
        case 'component_render': return 'bg-purple-100 text-purple-800';
        case 'user_interaction': return 'bg-yellow-100 text-yellow-800';
        case 'error_occurrence': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getTypeLabel = (type) => {
      const labels = {
        'api_response': 'API响应',
        'page_load': '页面加载',
        'component_render': '组件渲染',
        'user_interaction': '用户交互',
        'error_occurrence': '错误事件'
      };
      return labels[type] || type;
    };

    const getPerformanceStyle = (grade) => {
      switch (grade) {
        case 'EXCELLENT': return 'bg-green-100 text-green-800';
        case 'GOOD': return 'bg-blue-100 text-blue-800';
        case 'FAIR': return 'bg-yellow-100 text-yellow-800';
        case 'POOR': return 'bg-orange-100 text-orange-800';
        case 'VERY_POOR': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    // 生命周期
    onMounted(() => {
      loadPerformanceData();
      startAutoRefresh();
    });

    onUnmounted(() => {
      stopAutoRefresh();
    });

    return {
      // 数据
      isLoading,
      performanceReport,
      realTimeStatus,
      cacheStats,
      
      // 计算属性
      apiMetrics,
      performanceGrades,
      recentMetrics,
      healthStatusColor,
      healthIconBg,
      healthIconColor,
      overallScoreColor,
      scoreIconBg,
      scoreIconColor,
      
      // 方法
      refreshData,
      clearCache,
      formatTime,
      formatDuration,
      getGradeStyle,
      getGradeLabel,
      getTypeStyle,
      getTypeLabel,
      getPerformanceStyle
    };
  }
};
</script> 