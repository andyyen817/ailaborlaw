/**
 * 性能监控服务
 * 监控API响应时间、页面加载时间、缓存效率、用户体验指标
 * v1.0.0 - 第六阶段系统优化
 */

import cacheService from './cacheService.js';

// 性能指标类型
const METRICS_TYPES = {
  API_RESPONSE: 'api_response',
  PAGE_LOAD: 'page_load',
  COMPONENT_RENDER: 'component_render',
  CACHE_OPERATION: 'cache_operation',
  USER_INTERACTION: 'user_interaction',
  ERROR_OCCURRENCE: 'error_occurrence'
};

// 性能阈值配置
const PERFORMANCE_THRESHOLDS = {
  API_RESPONSE: {
    EXCELLENT: 500,    // < 500ms
    GOOD: 1000,        // < 1s
    FAIR: 2000,        // < 2s
    POOR: 5000         // > 5s
  },
  PAGE_LOAD: {
    EXCELLENT: 1000,   // < 1s
    GOOD: 2000,        // < 2s
    FAIR: 3000,        // < 3s
    POOR: 5000         // > 5s
  },
  COMPONENT_RENDER: {
    EXCELLENT: 16,     // < 16ms (60fps)
    GOOD: 33,          // < 33ms (30fps)
    FAIR: 100,         // < 100ms
    POOR: 300          // > 300ms
  }
};

/**
 * 性能监控服务类
 */
class PerformanceService {
  constructor() {
    this.metrics = new Map();
    this.activeTimers = new Map();
    this.sessionStart = Date.now();
    this.isEnabled = true;
    
    // 初始化性能观察器
    this.initPerformanceObservers();
    
    // 定期报告性能数据
    this.startReporting();
  }

  /**
   * 开始测量性能
   * @param {string} name - 测量名称
   * @param {string} type - 测量类型
   * @param {Object} metadata - 额外元数据
   * @returns {string} 测量ID
   */
  startMeasure(name, type = METRICS_TYPES.API_RESPONSE, metadata = {}) {
    if (!this.isEnabled) return null;
    
    const measureId = `${type}_${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timer = {
      id: measureId,
      name,
      type,
      startTime: performance.now(),
      startTimestamp: Date.now(),
      metadata
    };
    
    this.activeTimers.set(measureId, timer);
    
    console.log(`⏱️ 开始测量: ${name} (${type})`);
    return measureId;
  }

  /**
   * 结束测量并记录性能数据
   * @param {string} measureId - 测量ID
   * @param {Object} additionalData - 额外数据
   * @returns {Object|null} 性能数据
   */
  endMeasure(measureId, additionalData = {}) {
    if (!this.isEnabled || !measureId) return null;
    
    const timer = this.activeTimers.get(measureId);
    if (!timer) {
      console.warn(`⚠️ 未找到测量计时器: ${measureId}`);
      return null;
    }
    
    const endTime = performance.now();
    const duration = endTime - timer.startTime;
    const metric = {
      id: measureId,
      name: timer.name,
      type: timer.type,
      duration,
      startTime: timer.startTime,
      endTime,
      timestamp: timer.startTimestamp,
      metadata: { ...timer.metadata, ...additionalData },
      performance: this.calculatePerformanceGrade(duration, timer.type)
    };
    
    // 存储性能数据
    this.storeMetric(metric);
    
    // 移除计时器
    this.activeTimers.delete(measureId);
    
    console.log(`✅ 完成测量: ${timer.name} - ${duration.toFixed(2)}ms (${metric.performance.grade})`);
    return metric;
  }

  /**
   * 测量API请求性能
   * @param {string} endpoint - API端点
   * @param {Function} apiCall - API调用函数
   * @param {Object} metadata - 元数据
   * @returns {Promise} API调用结果
   */
  async measureApiCall(endpoint, apiCall, metadata = {}) {
    const measureId = this.startMeasure(endpoint, METRICS_TYPES.API_RESPONSE, {
      endpoint,
      ...metadata
    });
    
    try {
      const startTime = Date.now();
      const result = await apiCall();
      const responseTime = Date.now() - startTime;
      
      this.endMeasure(measureId, {
        success: true,
        statusCode: result?.status || 200,
        responseSize: this.calculateResponseSize(result),
        networkTime: responseTime
      });
      
      return result;
    } catch (error) {
      this.endMeasure(measureId, {
        success: false,
        error: error.message,
        errorType: error.name
      });
      
      // 记录错误指标
      this.recordError(endpoint, error);
      throw error;
    }
  }

  /**
   * 测量组件渲染性能
   * @param {string} componentName - 组件名称
   * @param {Function} renderFunction - 渲染函数
   * @param {Object} metadata - 元数据
   * @returns {any} 渲染结果
   */
  async measureComponentRender(componentName, renderFunction, metadata = {}) {
    const measureId = this.startMeasure(componentName, METRICS_TYPES.COMPONENT_RENDER, {
      component: componentName,
      ...metadata
    });
    
    try {
      const result = await renderFunction();
      
      this.endMeasure(measureId, {
        success: true,
        renderType: 'component'
      });
      
      return result;
    } catch (error) {
      this.endMeasure(measureId, {
        success: false,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * 记录用户交互事件
   * @param {string} action - 交互动作
   * @param {Object} details - 交互详情
   */
  recordUserInteraction(action, details = {}) {
    if (!this.isEnabled) return;
    
    const metric = {
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: action,
      type: METRICS_TYPES.USER_INTERACTION,
      timestamp: Date.now(),
      metadata: {
        action,
        ...details
      }
    };
    
    this.storeMetric(metric);
    console.log(`👆 用户交互: ${action}`, details);
  }

  /**
   * 记录错误事件
   * @param {string} context - 错误上下文
   * @param {Error} error - 错误对象
   * @param {Object} metadata - 额外元数据
   */
  recordError(context, error, metadata = {}) {
    if (!this.isEnabled) return;
    
    const metric = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: context,
      type: METRICS_TYPES.ERROR_OCCURRENCE,
      timestamp: Date.now(),
      metadata: {
        context,
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack,
        ...metadata
      }
    };
    
    this.storeMetric(metric);
    console.error(`❌ 错误记录: ${context}`, error);
  }

  /**
   * 获取性能统计报告
   * @param {number} timeRange - 时间范围(毫秒)
   * @returns {Object} 性能报告
   */
  getPerformanceReport(timeRange = 24 * 60 * 60 * 1000) { // 默认24小时
    const cutoffTime = Date.now() - timeRange;
    const reportMetrics = new Map();
    
    // 收集指定时间范围内的数据
    for (const [type, metrics] of this.metrics) {
      const filteredMetrics = metrics.filter(m => m.timestamp >= cutoffTime);
      if (filteredMetrics.length > 0) {
        reportMetrics.set(type, filteredMetrics);
      }
    }
    
    const report = {
      timeRange,
      generatedAt: Date.now(),
      sessionDuration: Date.now() - this.sessionStart,
      cacheStats: cacheService.getStats(),
      summary: {},
      details: {}
    };
    
    // 生成各类型指标的统计
    for (const [type, metrics] of reportMetrics) {
      const stats = this.calculateTypeStats(metrics);
      report.summary[type] = stats.summary;
      report.details[type] = stats.details;
    }
    
    // 生成整体评分
    report.overallScore = this.calculateOverallScore(report.summary);
    
    return report;
  }

  /**
   * 获取实时性能状态
   * @returns {Object} 实时性能状态
   */
  getRealTimeStatus() {
    const now = Date.now();
    const recentTimeRange = 5 * 60 * 1000; // 最近5分钟
    const cutoffTime = now - recentTimeRange;
    
    const recentMetrics = new Map();
    for (const [type, metrics] of this.metrics) {
      const recent = metrics.filter(m => m.timestamp >= cutoffTime);
      if (recent.length > 0) {
        recentMetrics.set(type, recent);
      }
    }
    
    return {
      timestamp: now,
      activeTimers: this.activeTimers.size,
      cacheHitRate: cacheService.getStats().hitRate,
      recentMetrics: Object.fromEntries(recentMetrics),
      systemHealth: this.calculateSystemHealth(recentMetrics)
    };
  }

  /**
   * 清除性能数据
   * @param {number} olderThan - 清除多少毫秒之前的数据
   * @returns {number} 清除的条目数
   */
  clearOldMetrics(olderThan = 7 * 24 * 60 * 60 * 1000) { // 默认7天
    const cutoffTime = Date.now() - olderThan;
    let clearedCount = 0;
    
    for (const [type, metrics] of this.metrics) {
      const oldLength = metrics.length;
      const filteredMetrics = metrics.filter(m => m.timestamp >= cutoffTime);
      this.metrics.set(type, filteredMetrics);
      clearedCount += oldLength - filteredMetrics.length;
    }
    
    console.log(`🧹 清除旧性能数据: ${clearedCount} 条记录`);
    return clearedCount;
  }

  /**
   * 启用/禁用性能监控
   * @param {boolean} enabled - 是否启用
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(`📊 性能监控${enabled ? '启用' : '禁用'}`);
  }

  // === 私有方法 ===

  /**
   * 存储性能指标
   */
  storeMetric(metric) {
    if (!this.metrics.has(metric.type)) {
      this.metrics.set(metric.type, []);
    }
    
    this.metrics.get(metric.type).push(metric);
    
    // 限制每种类型最多存储1000条记录
    const typeMetrics = this.metrics.get(metric.type);
    if (typeMetrics.length > 1000) {
      typeMetrics.splice(0, typeMetrics.length - 1000);
    }
  }

  /**
   * 计算性能等级
   */
  calculatePerformanceGrade(duration, type) {
    const thresholds = PERFORMANCE_THRESHOLDS[type.toUpperCase()] || PERFORMANCE_THRESHOLDS.API_RESPONSE;
    
    let grade, score;
    if (duration < thresholds.EXCELLENT) {
      grade = 'EXCELLENT';
      score = 100;
    } else if (duration < thresholds.GOOD) {
      grade = 'GOOD';
      score = 80;
    } else if (duration < thresholds.FAIR) {
      grade = 'FAIR';
      score = 60;
    } else if (duration < thresholds.POOR) {
      grade = 'POOR';
      score = 40;
    } else {
      grade = 'VERY_POOR';
      score = 20;
    }
    
    return { grade, score, duration, thresholds };
  }

  /**
   * 计算响应大小
   */
  calculateResponseSize(response) {
    try {
      return new Blob([JSON.stringify(response)]).size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 计算类型统计
   */
  calculateTypeStats(metrics) {
    const durations = metrics
      .filter(m => m.duration !== undefined)
      .map(m => m.duration);
    
    const successCount = metrics.filter(m => m.metadata?.success !== false).length;
    const errorCount = metrics.length - successCount;
    
    const summary = {
      total: metrics.length,
      success: successCount,
      errors: errorCount,
      successRate: metrics.length > 0 ? (successCount / metrics.length * 100).toFixed(2) + '%' : '0%'
    };
    
    if (durations.length > 0) {
      durations.sort((a, b) => a - b);
      summary.avgDuration = (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2);
      summary.minDuration = durations[0].toFixed(2);
      summary.maxDuration = durations[durations.length - 1].toFixed(2);
      summary.medianDuration = durations[Math.floor(durations.length / 2)].toFixed(2);
      summary.p95Duration = durations[Math.floor(durations.length * 0.95)].toFixed(2);
    }
    
    return {
      summary,
      details: {
        recentMetrics: metrics.slice(-10), // 最近10条
        performanceGrades: this.calculateGradeDistribution(metrics)
      }
    };
  }

  /**
   * 计算等级分布
   */
  calculateGradeDistribution(metrics) {
    const distribution = {
      EXCELLENT: 0,
      GOOD: 0,
      FAIR: 0,
      POOR: 0,
      VERY_POOR: 0
    };
    
    metrics.forEach(metric => {
      if (metric.performance?.grade) {
        distribution[metric.performance.grade]++;
      }
    });
    
    return distribution;
  }

  /**
   * 计算整体评分
   */
  calculateOverallScore(summary) {
    let totalScore = 0;
    let weightedSum = 0;
    
    // API响应权重最高
    if (summary[METRICS_TYPES.API_RESPONSE]) {
      const apiMetrics = summary[METRICS_TYPES.API_RESPONSE];
      const apiScore = this.calculateTypeScore(apiMetrics);
      totalScore += apiScore * 0.4; // 40%权重
      weightedSum += 0.4;
    }
    
    // 页面加载权重次之
    if (summary[METRICS_TYPES.PAGE_LOAD]) {
      const pageMetrics = summary[METRICS_TYPES.PAGE_LOAD];
      const pageScore = this.calculateTypeScore(pageMetrics);
      totalScore += pageScore * 0.3; // 30%权重
      weightedSum += 0.3;
    }
    
    // 组件渲染权重较低
    if (summary[METRICS_TYPES.COMPONENT_RENDER]) {
      const renderMetrics = summary[METRICS_TYPES.COMPONENT_RENDER];
      const renderScore = this.calculateTypeScore(renderMetrics);
      totalScore += renderScore * 0.2; // 20%权重
      weightedSum += 0.2;
    }
    
    // 错误率影响最终评分
    if (summary[METRICS_TYPES.ERROR_OCCURRENCE]) {
      const errorMetrics = summary[METRICS_TYPES.ERROR_OCCURRENCE];
      const errorPenalty = errorMetrics.total * 5; // 每个错误扣5分
      totalScore -= errorPenalty;
    }
    
    const score = weightedSum > 0 ? Math.max(0, Math.min(100, totalScore / weightedSum)) : 0;
    
    let grade;
    if (score >= 90) grade = 'EXCELLENT';
    else if (score >= 80) grade = 'GOOD';
    else if (score >= 70) grade = 'FAIR';
    else if (score >= 60) grade = 'POOR';
    else grade = 'VERY_POOR';
    
    return {
      score: score.toFixed(2),
      grade,
      breakdown: {
        weightedSum,
        totalScore: totalScore.toFixed(2)
      }
    };
  }

  /**
   * 计算类型评分
   */
  calculateTypeScore(typeMetrics) {
    const successRate = parseFloat(typeMetrics.successRate) || 0;
    const avgDuration = parseFloat(typeMetrics.avgDuration) || 0;
    
    // 基础分数来自成功率
    let score = successRate;
    
    // 根据平均响应时间调整分数
    if (avgDuration < 500) score *= 1.2;      // 优秀性能加分
    else if (avgDuration < 1000) score *= 1.1; // 良好性能小幅加分
    else if (avgDuration > 2000) score *= 0.8; // 较慢性能扣分
    else if (avgDuration > 5000) score *= 0.6; // 很慢性能大幅扣分
    
    return Math.min(100, score);
  }

  /**
   * 计算系统健康度
   */
  calculateSystemHealth(recentMetrics) {
    const health = {
      status: 'HEALTHY',
      issues: [],
      score: 100
    };
    
    // 检查API响应时间
    if (recentMetrics.has(METRICS_TYPES.API_RESPONSE)) {
      const apiMetrics = recentMetrics.get(METRICS_TYPES.API_RESPONSE);
      const avgDuration = apiMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / apiMetrics.length;
      
      if (avgDuration > 2000) {
        health.issues.push('API响应时间过长');
        health.score -= 20;
      }
    }
    
    // 检查错误率
    if (recentMetrics.has(METRICS_TYPES.ERROR_OCCURRENCE)) {
      const errorMetrics = recentMetrics.get(METRICS_TYPES.ERROR_OCCURRENCE);
      if (errorMetrics.length > 5) {
        health.issues.push('错误频率较高');
        health.score -= 30;
      }
    }
    
    // 检查缓存效率
    const cacheStats = cacheService.getStats();
    const hitRate = parseFloat(cacheStats.hitRate) || 0;
    if (hitRate < 50) {
      health.issues.push('缓存命中率较低');
      health.score -= 15;
    }
    
    // 设置状态
    if (health.score >= 80) health.status = 'HEALTHY';
    else if (health.score >= 60) health.status = 'WARNING';
    else health.status = 'CRITICAL';
    
    return health;
  }

  /**
   * 初始化性能观察器
   */
  initPerformanceObservers() {
    if (typeof window === 'undefined') return;
    
    // 观察页面加载性能
    if (window.performance && window.performance.timing) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const timing = window.performance.timing;
          const loadTime = timing.loadEventEnd - timing.navigationStart;
          
          this.recordPageLoad('initial_load', loadTime);
        }, 0);
      });
    }
    
    // 观察资源加载性能
    if (window.PerformanceObserver && window.PerformanceEntry) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'navigation') {
              this.recordPageLoad('navigation', entry.duration);
            }
          });
        });
        
        observer.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        console.warn('性能观察器初始化失败:', error);
      }
    }
  }

  /**
   * 记录页面加载性能
   */
  recordPageLoad(type, duration) {
    const metric = {
      id: `page_load_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: type,
      type: METRICS_TYPES.PAGE_LOAD,
      duration,
      timestamp: Date.now(),
      metadata: {
        loadType: type
      },
      performance: this.calculatePerformanceGrade(duration, METRICS_TYPES.PAGE_LOAD)
    };
    
    this.storeMetric(metric);
    console.log(`📄 页面加载: ${type} - ${duration.toFixed(2)}ms`);
  }

  /**
   * 开始定期报告
   */
  startReporting() {
    // 每30分钟生成一次性能报告
    setInterval(() => {
      const report = this.getPerformanceReport(30 * 60 * 1000);
      console.log('📊 性能报告:', report);
      
      // 清理超过7天的旧数据
      this.clearOldMetrics();
    }, 30 * 60 * 1000);
  }
}

// 创建单例实例
const performanceService = new PerformanceService();

// 导出常量和服务实例
export { METRICS_TYPES, PERFORMANCE_THRESHOLDS };
export default performanceService; 