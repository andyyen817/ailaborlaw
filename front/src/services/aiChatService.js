/**
 * AI 聊天服务
 * 提供用户端的AI聊天功能，集成智能缓存和性能监控
 * v2.0.0 - 集成第六阶段优化
 */

import api from './api.js';
import authService from './auth.js';
import cacheService from './cacheService.js';
import performanceService from './performanceService.js';

/**
 * AI 聊天服务
 */
class AiChatService {
  constructor() {
    this.baseURL = '/chat';
  }

    /**
   * 获取会话列表
   * @param {Object} params - 查询参数
   * @param {boolean} forceRefresh - 是否强制刷新，绕过缓存
   * @returns {Promise<Object>} 会话列表
   */
  async getSessionList(params = {}, forceRefresh = false) {
    // 🔧 修复：缓存由API層自動處理
    if (forceRefresh) {
      console.log('🔄 强制刷新会话列表，跳过缓存');
    }

    // API调用性能监控
    return await performanceService.measureApiCall('chat_sessions_list', async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          throw new Error('需要用户认证');
        }

        const response = await api.get(`${this.baseURL}/sessions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params
        });

        if (response.success) {
          const result = {
            success: true,
            data: {
              sessions: response.data.sessions || [],
              pagination: response.data.pagination || {},
              total: response.data.total || 0
            }
          };
          
          // 緩存由API層自動處理
          return result;
        } else {
          throw new Error(response.message || '获取会话列表失败');
        }
      } catch (error) {
        console.error('❌ 获取会话列表失败:', error);
        
        // 返回空列表作为降级处理
        return {
          success: false,
          error: error.message,
          data: {
            sessions: [],
            pagination: {},
            total: 0
          }
        };
      }
    }, { userId: authService.getCurrentUserId() });
  }

  /**
   * 创建新会话
   * @param {Object} sessionData - 会话数据
   * @returns {Promise<Object>} 创建结果
   */
  async createSession(sessionData = {}) {
    return await performanceService.measureApiCall('chat_session_create', async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          throw new Error('需要用户认证');
        }

        const response = await api.post(`${this.baseURL}/sessions`, sessionData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.success) {
          // 清除会话列表缓存
          cacheService.invalidatePattern('/chat/sessions');
          
          performanceService.recordUserInteraction('session_created', {
            sessionId: response.data.sessionId,
            userId: authService.getCurrentUserId()
          });

          return {
            success: true,
            data: response.data
          };
        } else {
          throw new Error(response.message || '创建会话失败');
        }
      } catch (error) {
        console.error('❌ 创建会话失败:', error);
        throw error;
      }
    }, { userId: authService.getCurrentUserId() });
  }

  /**
   * 获取会话详情
   * @param {string} sessionId - 会话ID
   * @returns {Promise<Object>} 会话详情
   */
  async getSessionDetails(sessionId) {
    // 🔧 修复：緩存由API層自動處理

    return await performanceService.measureApiCall('chat_session_details', async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          throw new Error('需要用户认证');
        }

        const response = await api.get(`${this.baseURL}/sessions/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.success) {
          const result = {
            success: true,
            data: response.data
          };
          
          // 緩存由API層自動處理
          return result;
        } else {
          throw new Error(response.message || '获取会话详情失败');
        }
      } catch (error) {
        console.error('❌ 获取会话详情失败:', error);
        throw error;
      }
    }, { sessionId, userId: authService.getCurrentUserId() });
  }

  /**
   * 更新会话标题
   * @param {string} sessionId - 会话ID
   * @param {string} title - 新标题
   * @returns {Promise<Object>} 更新结果
   */
  async updateSessionTitle(sessionId, title) {
    return await performanceService.measureApiCall('chat_session_update', async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          throw new Error('需要用户认证');
        }

        const response = await api.put(`${this.baseURL}/sessions/${sessionId}`, 
          { title },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.success) {
          // 🔧 修复：清除用户特定的缓存
          const userId = authService.getCurrentUserId();
          cacheService.invalidatePattern(`/chat/sessions`);
          
          performanceService.recordUserInteraction('session_updated', {
            sessionId,
            action: 'title_change',
            userId: authService.getCurrentUserId()
          });

          return {
            success: true,
            data: response.data
          };
        } else {
          throw new Error(response.message || '更新会话失败');
        }
      } catch (error) {
        console.error('❌ 更新会话失败:', error);
        throw error;
      }
    }, { sessionId, action: 'update_title' });
  }

  /**
   * 删除会话
   * @param {string} sessionId - 会话ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteSession(sessionId) {
    return await performanceService.measureApiCall('chat_session_delete', async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          throw new Error('需要用户认证');
        }

        const response = await api.delete(`${this.baseURL}/sessions/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.success) {
          // 🔧 修复：清除相关缓存
          cacheService.invalidatePattern(`/chat/sessions/${sessionId}`);
          
          performanceService.recordUserInteraction('session_deleted', {
            sessionId,
            userId: authService.getCurrentUserId()
          });

          return {
            success: true,
            data: response.data
          };
        } else {
          throw new Error(response.message || '删除会话失败');
        }
      } catch (error) {
        console.error('❌ 删除会话失败:', error);
        throw error;
      }
    }, { sessionId, action: 'delete' });
  }

  /**
   * 发送消息
   * @param {string} sessionId - 会话ID
   * @param {string} message - 消息内容
   * @param {string} messageType - 消息类型
   * @returns {Promise<Object>} 发送结果
   */
  async sendMessage(sessionId, message, messageType = 'question') {
    return await performanceService.measureApiCall('chat_message_send', async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          throw new Error('请先登录后再进行咨询');
        }

        // 🔧 P0 修复：获取用户ID，检查是否为访客用户
        const userId = authService.getCurrentUserId();
        if (!userId || userId.startsWith('guest_')) {
          throw new Error('请先登录后再进行咨询');
        }

        // 🔧 P0 修复：发送消息前检查剩余咨询次数
        let queryCount;
        try {
          // 动态导入userService以避免循环依赖
          const userServiceModule = await import('./userService.js');
          const userService = userServiceModule.default;
          
          // 检查剩余咨询次数
          queryCount = await userService.getQueryCount();
          console.log('🔍 检查用户咨询次数:', queryCount);
          
          if (queryCount.remainingQueries <= 0) {
            throw new Error('咨询次数已用完，请联系客服或邀请好友获取更多次数');
          }
          
          console.log(`✅ 用户还有 ${queryCount.remainingQueries} 次咨询机会`);
        } catch (error) {
          if (error.message.includes('咨询次数已用完')) {
            throw error; // 重新抛出次数不足的错误
          }
          console.error('❌ 检查咨询次数失败:', error);
          throw new Error('无法获取咨询次数信息，请稍后再试');
        }

        // 🔧 修复：扣减咨询次数（在发送AI请求前），统一参数格式
        try {
          const userServiceModule = await import('./userService.js');
          const userService = userServiceModule.default;
          
          console.log('⏳ 开始扣减咨询次数...');
          await userService.decreaseQueryCount('AI咨询', { 
            sessionId: sessionId,
            messageType: messageType,
            content: message.substring(0, 100) // 只记录前100个字符作为摘要
          });
          console.log('✅ 咨询次数扣减成功，剩余次数:', queryCount.remainingQueries - 1);
          
          // 🔧 修复：触发次数更新事件，通知前端更新显示
          window.dispatchEvent(new CustomEvent('queryCountUpdated', {
            detail: { 
              remainingQueries: queryCount.remainingQueries - 1,
              action: 'decreased'
            }
          }));
        } catch (error) {
          console.error('❌ 扣减咨询次数失败:', error);
          throw new Error('扣减咨询次数失败，请稍后再试');
        }

        const messageData = {
          content: message,
          messageType: messageType
        };

        const response = await api.post(`${this.baseURL}/sessions/${sessionId}/messages`, 
          messageData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.success) {
          // 🔧 修复：緩存由API層自動處理
          
          performanceService.recordUserInteraction('message_sent', {
            sessionId,
            messageType,
            messageLength: message.length,
            userId: authService.getCurrentUserId(),
            remainingQueries: queryCount.remainingQueries - 1
          });

          console.log('🎉 消息发送成功，咨询次数已扣减');

          return {
            success: true,
            data: response.data
          };
        } else {
          throw new Error(response.message || '发送消息失败');
        }
      } catch (error) {
        console.error('❌ 发送消息失败:', error);
        
        // 🔧 P0 修复：针对不同错误类型提供明确的用户提示
        if (error.message.includes('咨询次数已用完')) {
          // 咨询次数不足的错误，直接抛出
          throw error;
        } else if (error.message.includes('请先登录')) {
          // 认证失败的错误，直接抛出
          throw error;
        } else {
          // 其他错误也抛出，让上层处理
          throw new Error('发送消息失败：' + error.message);
        }
      }
    }, { 
      sessionId, 
      messageType, 
      messageLength: message.length,
      userId: authService.getCurrentUserId() 
    });
  }

  /**
   * 提交消息反馈
   * @param {string} sessionId - 会话ID
   * @param {string} messageId - 消息ID
   * @param {string} feedback - 反馈类型 (helpful/unhelpful)
   * @returns {Promise<Object>} 提交结果
   */
  async submitMessageFeedback(sessionId, messageId, feedback) {
    return await performanceService.measureApiCall('chat_feedback_submit', async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          throw new Error('需要用户认证');
        }

        const response = await api.post(
          `${this.baseURL}/sessions/${sessionId}/messages/${messageId}/feedback`,
          { feedback },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.success) {
          performanceService.recordUserInteraction('feedback_submitted', {
            sessionId,
            messageId,
            feedback,
            userId: authService.getCurrentUserId()
          });

          return {
            success: true,
            data: response.data
          };
        } else {
          throw new Error(response.message || '提交反馈失败');
        }
      } catch (error) {
        console.error('❌ 提交反馈失败:', error);
        throw error;
      }
    }, { sessionId, messageId, feedback });
  }

  // === 缓存管理方法 ===

  /**
   * 清除聊天相关缓存
   * @param {string} sessionId - 特定会话ID（可选）
   */
  clearChatCache(sessionId = null) {
    if (sessionId) {
      cacheService.invalidatePattern(`/chat/sessions/${sessionId}`);
      console.log(`🗑️ 清除会话缓存: ${sessionId}`);
    } else {
      cacheService.invalidatePattern('/chat/sessions');
      console.log('🗑️ 清除所有聊天缓存');
    }
  }

  /**
   * 预加载常用数据
   * @param {string} userId - 用户ID
   */
  async preloadData(userId) {
    try {
      console.log('📋 开始预加载聊天数据...');
      
      // 预加载最近的会话列表
      await this.getSessionList({ limit: 10, page: 1 });
      
      console.log('✅ 聊天数据预加载完成');
    } catch (error) {
      console.warn('⚠️ 聊天数据预加载失败:', error);
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return {
      service: 'aiChatService',
      globalStats: cacheService.getStats()
    };
  }

  /**
   * 格式化错误信息
   * @param {Error} error - 错误对象
   * @returns {string} 格式化后的错误信息
   */
  formatError(error) {
    if (!error) return '未知錯誤';
    
    // 如果是字符串，直接返回
    if (typeof error === 'string') {
      return error;
    }
    
    // 根据错误类型返回用户友好的消息
    if (error.message) {
      const message = error.message.toLowerCase();
      
      if (message.includes('network') || message.includes('網絡')) {
        return '網絡連接問題，請檢查您的網絡狀態';
      }
      
      if (message.includes('unauthorized') || message.includes('401')) {
        return '認證失效，請重新登錄';
      }
      
      if (message.includes('forbidden') || message.includes('403')) {
        return '沒有權限訪問此功能';
      }
      
      if (message.includes('not found') || message.includes('404') || message.includes('資源不存在')) {
        return '服務暫時不可用，請稍後再試';
      }
      
      if (message.includes('timeout') || message.includes('超時')) {
        return '請求超時，請稍後再試';
      }
      
      if (message.includes('server') || message.includes('500')) {
        return '服務器錯誤，請稍後再試';
      }
      
      // 返回原始错误信息（如果是中文或用户友好的信息）
      if (error.message.match(/[\u4e00-\u9fa5]/)) {
        return error.message;
      }
    }
    
    // 默认错误信息
    return '連接服務時出現問題，請稍後再試';
  }

  /**
   * 測試API連接
   * @returns {Promise<boolean>} 連接狀態
   */
  async testConnection() {
    try {
      const token = authService.getToken();
      if (!token) {
        console.warn('⚠️ 未找到認證令牌');
        return false;
      }

      // 測試簡單的獲取會話列表API
      const response = await api.get(`${this.baseURL}/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: { limit: 1 }
      });

      console.log('🔧 測試連接響應:', response.data);
      return response.data && response.data.success;
    } catch (error) {
      console.error('❌ API連接測試失敗:', error);
      return false;
    }
  }

  /**
   * 獲取API健康狀態
   * @returns {Promise<Object>} 健康狀態信息
   */
  async getHealthStatus() {
    try {
      const token = authService.getToken();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await api.get('/health', { headers });
      return {
        healthy: true,
        ...response.data
      };
    } catch (error) {
      console.error('❌ 獲取健康狀態失敗:', error);
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}

// 创建服务实例
const aiChatService = new AiChatService();

export default aiChatService; 