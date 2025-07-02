import fetch from 'node-fetch';
import logger from '../utils/logger.js';

/**
 * N8N集成服务类
 * 负责与外部AI服务(N8N Webhook)的通信
 * 包含错误处理、重试机制和降级响应
 * 已根据前端成功实现调整格式
 */
class N8NService {
  constructor() {
    // N8N Webhook URL - 与前端保持完全一致的格式
    this.baseWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://andyaiauto.zeabur.app/webhook/5cc76a7e-2e6a-4428-ba09-cbe8f8598f9b/chat';
    this.webhookUrl = this.baseWebhookUrl + '?action=sendMessage';  // 添加前端使用的action参数
    
    // 重试配置
    this.maxRetries = 3;
    this.timeout = 30000; // 30秒超时
    this.baseDelay = 1000; // 基础延迟1秒
    
    // 服务状态监控
    this.stats = {
      totalCalls: 0,
      successCalls: 0,
      failedCalls: 0,
      avgResponseTime: 0
    };
    
    logger.info('N8N服务初始化完成', {
      baseUrl: this.baseWebhookUrl,
      fullUrl: this.webhookUrl,
      maxRetries: this.maxRetries,
      timeout: this.timeout
    });
  }
  
  /**
   * 发送消息到AI服务并获取回复
   * 使用与前端完全相同的格式
   * @param {string} userMessage - 用户消息内容
   * @param {Object} context - 会话上下文
   * @returns {Object} AI回复数据
   */
  async sendToAI(userMessage, context) {
    const startTime = Date.now();
    this.stats.totalCalls++;
    
    try {
      // 准备请求数据 - 完全按照前端成功的格式
      const requestBody = {
        sessionId: context.sessionId,
        chatInput: userMessage,  // 使用前端的字段名 chatInput 而不是 message
        metadata: {
          nickname: context.nickname || 'Backend User',
          platform: 'backend',
          userAgent: 'AI-Labor-Advisor-Backend/1.0',
          timestamp: new Date().toISOString()
        }
      };
      
      logger.info(`发送消息到N8N: ${userMessage.substring(0, 50)}...`, {
        sessionId: context.sessionId,
        userId: context.userId,
        messageLength: userMessage.length,
        requestFormat: 'frontend-compatible'
      });
      
      // 调用Webhook并处理重试
      const response = await this.callWebhookWithRetry(requestBody);
      const processingTime = Date.now() - startTime;
      
      // 更新成功统计
      this.stats.successCalls++;
      this.updateAvgResponseTime(processingTime);
      
      // 解析并返回标准化响应
      const standardizedResponse = this.standardizeResponse(response, processingTime);
      
      logger.info(`N8N调用成功`, {
        sessionId: context.sessionId,
        processingTime,
        hasReferences: standardizedResponse.references.length > 0,
        responseLength: standardizedResponse.content.length
      });
      
      return standardizedResponse;
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.stats.failedCalls++;
      
      logger.error(`N8N调用失败: ${error.message}`, {
        sessionId: context.sessionId,
        userId: context.userId,
        processingTime,
        attempts: this.maxRetries,
        error: error.stack
      });
      
      // 返回降级响应，确保用户体验
      return this.getFallbackResponse(processingTime, error.message);
    }
  }
  
  /**
   * 带重试机制的Webhook调用
   * @param {Object} requestBody - 请求体
   * @param {number} attempt - 当前尝试次数
   * @returns {Object} 响应数据
   */
  async callWebhookWithRetry(requestBody, attempt = 1) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Labor-Advisor/1.0',
          'Accept': 'application/json',
          'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // 检查HTTP状态码
      if (!response.ok) {
        const errorText = await response.text().catch(() => '无法读取错误响应');
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      // 解析JSON响应
      const data = await response.json();
      
      // 🔍 添加详细日志：记录N8N的原始响应
      logger.info('📥 收到N8N原始响应', {
        httpStatus: response.status,
        httpStatusText: response.statusText,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        dataType: Array.isArray(data) ? 'Array' : typeof data,
        dataLength: Array.isArray(data) ? data.length : 'N/A',
        dataKeys: typeof data === 'object' ? Object.keys(data || {}) : 'N/A',
        fullResponse: JSON.stringify(data),
        attempt
      });
      
      // 验证响应格式
      if (!data || typeof data !== 'object') {
        throw new Error('N8N返回的响应格式无效');
      }
      
      return data;
      
    } catch (error) {
      // 如果还有重试次数，进行指数回退重试
      if (attempt < this.maxRetries) {
        const delay = this.baseDelay * Math.pow(2, attempt - 1); // 指数回退: 1s, 2s, 4s
        
        logger.warn(`N8N调用失败，${delay}ms后重试 (${attempt}/${this.maxRetries})`, {
          error: error.message,
          attempt,
          nextDelay: delay
        });
        
        await this.sleep(delay);
        return this.callWebhookWithRetry(requestBody, attempt + 1);
      }
      
      // 所有重试都失败，抛出错误
      throw new Error(`N8N服务调用失败，已重试${this.maxRetries}次: ${error.message}`);
    }
  }
  
  /**
   * 格式化会话历史
   * @param {Array} messages - 消息数组
   * @returns {Array} 格式化的历史消息
   */
  formatHistory(messages) {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.createdAt || new Date().toISOString()
    })).slice(-10); // 只保留最近10条消息，避免上下文过长
  }
  
  /**
   * 标准化AI响应格式
   * 支持N8N返回的实际格式：[{"output": "content"}]
   * @param {Object|Array} rawResponse - N8N原始响应
   * @param {number} processingTime - 处理时间
   * @returns {Object} 标准化响应
   */
  standardizeResponse(rawResponse, processingTime) {
    // 🔍 添加详细日志：记录原始响应
    logger.info('📥 开始解析N8N响应', {
      rawResponseType: Array.isArray(rawResponse) ? 'Array' : typeof rawResponse,
      rawResponseLength: Array.isArray(rawResponse) ? rawResponse.length : 'N/A',
      rawResponseSample: JSON.stringify(rawResponse).substring(0, 200) + '...',
      processingTime
    });
    
    // 处理N8N返回的数组格式
    let responseData = rawResponse;
    if (Array.isArray(rawResponse) && rawResponse.length > 0) {
      responseData = rawResponse[0];
      logger.info('📋 检测到数组格式，提取第一个元素', {
        originalLength: rawResponse.length,
        firstElementType: typeof responseData,
        firstElementKeys: Object.keys(responseData || {})
      });
    } else {
      logger.info('📄 使用原始响应数据', {
        responseDataType: typeof responseData,
        responseDataKeys: Object.keys(responseData || {})
      });
    }
    
    // 记录字段检查过程
    const textField = responseData?.text;      // 🔧 N8N实际使用的字段
    const outputField = responseData?.output;
    const answerField = responseData?.answer;
    const messageField = responseData?.message;
    const contentField = responseData?.content;
    
    logger.info('🔎 检查各个可能的内容字段', {
      hasText: !!textField,                    // 🔧 N8N实际使用的字段
      textLength: textField ? textField.length : 0,
      textSample: textField ? textField.substring(0, 100) + '...' : 'N/A',
      hasOutput: !!outputField,
      outputLength: outputField ? outputField.length : 0,
      outputSample: outputField ? outputField.substring(0, 100) + '...' : 'N/A',
      hasAnswer: !!answerField,
      hasMessage: !!messageField,
      hasContent: !!contentField,
      allFields: Object.keys(responseData || {})
    });
    
    // 提取内容，支持N8N的output字段
    const content = responseData.text ||      // 🔧 N8N实际返回的字段
                   responseData.output || 
                   responseData.answer || 
                   responseData.message || 
                   responseData.content || 
                   '抱歉，我无法回答这个问题。';
    
    // 🔍 记录最终提取的内容
    logger.info('📝 内容提取完成', {
      finalContentLength: content.length,
      contentPreview: content.substring(0, 150) + '...',
      wasFromText: !!responseData.text,        // 🔧 N8N实际使用的字段
      wasFromOutput: !responseData.text && !!responseData.output,
      wasFromAnswer: !responseData.text && !responseData.output && !!responseData.answer,
      wasFromMessage: !responseData.text && !responseData.output && !responseData.answer && !!responseData.message,
      wasFromContent: !responseData.text && !responseData.output && !responseData.answer && !responseData.message && !!responseData.content,
      wasFallback: content === '抱歉，我无法回答这个问题。'
    });
    
    // 解析法条引用（从content中提取或使用独立字段）
    const references = this.parseReferences(responseData.references || responseData.法条引用 || []);
    
    // 如果没有独立的references，尝试从content中提取法条信息
    const extractedReferences = this.extractReferencesFromContent(content);
    const finalReferences = references.length > 0 ? references : extractedReferences;
    
    // 🔍 记录引用解析结果
    logger.info('📚 法条引用解析完成', {
      originalReferencesCount: references.length,
      extractedReferencesCount: extractedReferences.length,
      finalReferencesCount: finalReferences.length,
      referenceSources: finalReferences.map(ref => ref.law + ' ' + ref.article)
    });
    
    const qualityScore = this.calculateQualityScore({ content, references: finalReferences });
    
    // 🔍 记录最终结果
    logger.info('✅ 响应标准化完成', {
      finalContentLength: content.length,
      referencesCount: finalReferences.length,
      qualityScore,
      processingTime
    });
    
    return {
      content: content,
      references: finalReferences,
      processingTime,
      rawResponse: rawResponse, // 保留原始响应用于调试
      qualityScore: qualityScore
    };
  }
  
  /**
   * 解析法条引用
   * @param {Array|Object} references - 原始引用数据
   * @returns {Array} 标准化的引用数组
   */
  parseReferences(references) {
    if (!references) return [];
    
    // 如果references不是数组，尝试转换
    if (!Array.isArray(references)) {
      references = [references];
    }
    
    return references.filter(ref => ref && typeof ref === 'object').map(ref => ({
      law: ref.law || ref.法规名称 || ref.source || '',
      article: ref.article || ref.条款 || ref.section || '',
      content: ref.content || ref.内容 || ref.text || '',
      url: ref.url || ref.链接 || ref.link || ''
    })).filter(ref => ref.law || ref.content); // 过滤掉空引用
  }
  
  /**
   * 从内容文本中提取法条引用信息
   * @param {string} content - 内容文本
   * @returns {Array} 提取的法条引用数组
   */
  extractReferencesFromContent(content) {
    if (!content || typeof content !== 'string') return [];
    
    const references = [];
    
    // 匹配劳基法相关条文的正则表达式
    const lawPatterns = [
      /勞動基準法第(\d+)條/g,
      /勞基法第(\d+)條/g,
      /勞動法第(\d+)條/g
    ];
    
    lawPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const article = `第${match[1]}條`;
        
        // 避免重复添加相同条文
        const exists = references.some(ref => 
          ref.law.includes('勞動基準法') && ref.article === article
        );
        
        if (!exists) {
          references.push({
            law: '勞動基準法',
            article: article,
            content: '', // 具体内容可以后续补充
            url: `https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=N0030001`
          });
        }
      }
    });
    
    return references;
  }
  
  /**
   * 计算回复质量评分
   * @param {Object} response - AI响应
   * @returns {number} 质量评分 (0-1)
   */
  calculateQualityScore(response) {
    let score = 0.5; // 基础分数
    
    const content = response.answer || response.message || response.content || '';
    
    // 内容长度评分
    if (content.length > 50) score += 0.1;
    if (content.length > 200) score += 0.1;
    
    // 法条引用评分
    const references = response.references || response.法条引用 || [];
    if (Array.isArray(references) && references.length > 0) {
      score += 0.2;
    }
    
    // 专业词汇评分
    const professionalTerms = ['勞動基準法', '勞動', '雇主', '勞工', '工資', '加班', '休假'];
    const termCount = professionalTerms.filter(term => content.includes(term)).length;
    score += Math.min(termCount * 0.05, 0.1);
    
    return Math.min(score, 1.0);
  }
  
  /**
   * 获取降级响应
   * @param {number} processingTime - 处理时间
   * @param {string} errorMessage - 错误信息
   * @returns {Object} 降级响应
   */
  getFallbackResponse(processingTime, errorMessage) {
    return {
      content: '抱歉，AI服务暂时不可用。请稍后再试，或者您可以联系我们的专家进行人工咨询。如果问题紧急，建议直接咨询专业的劳动法律师。',
      references: [],
      processingTime,
      rawResponse: { 
        error: errorMessage,
        fallback: true,
        timestamp: new Date().toISOString()
      },
      qualityScore: 0.1 // 降级响应质量较低
    };
  }
  
  /**
   * 休眠函数
   * @param {number} ms - 毫秒数
   * @returns {Promise} Promise对象
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * 更新平均响应时间
   * @param {number} responseTime - 本次响应时间
   */
  updateAvgResponseTime(responseTime) {
    if (this.stats.successCalls === 1) {
      this.stats.avgResponseTime = responseTime;
    } else {
      this.stats.avgResponseTime = (this.stats.avgResponseTime * (this.stats.successCalls - 1) + responseTime) / this.stats.successCalls;
    }
  }
  
  /**
   * 获取服务统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalCalls > 0 ? (this.stats.successCalls / this.stats.totalCalls * 100).toFixed(2) + '%' : '0%',
      avgResponseTimeFormatted: Math.round(this.stats.avgResponseTime) + 'ms'
    };
  }
  
  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      totalCalls: 0,
      successCalls: 0,
      failedCalls: 0,
      avgResponseTime: 0
    };
    logger.info('N8N服务统计信息已重置');
  }
  
  /**
   * 健康检查
   * @returns {Promise<boolean>} 服务是否健康
   */
  async healthCheck() {
    try {
      const testMessage = '健康检查';
      const testContext = {
        sessionId: 'health_check',
        userId: 'system',
        recentMessages: []
      };
      
      const response = await this.sendToAI(testMessage, testContext);
      return !!response.content;
    } catch (error) {
      logger.error(`N8N健康检查失败: ${error.message}`);
      return false;
    }
  }
}

// 创建单例实例
const n8nService = new N8NService();

export default n8nService; 