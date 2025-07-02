// 管理後台AI聊天服務 - 對接後端管理員API
import api from './api';

class AdminChatService {
  constructor() {
    this.baseURL = '/admin/chat'; // 對應後端 /api/v1/admin/chat
  }

  /**
   * 獲取所有用戶會話（管理員視角）
   * @param {Object} params - 查詢參數
   * @returns {Promise<Object>}
   */
  async getAllSessions(params = {}) {
    try {
      const defaultParams = {
        page: 1,
        limit: 20,
        ...params
      };

      const response = await api.get(`${this.baseURL}/sessions`, { params: defaultParams });
      
      if (response.success) {
        console.log('✅ 管理員獲取會話列表成功:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || '獲取會話列表失敗');
      }
    } catch (error) {
      console.error('❌ 管理員獲取會話列表失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取會話詳情（管理員視角）
   * @param {string} sessionId - 會話ID
   * @returns {Promise<Object>}
   */
  async getSessionDetails(sessionId) {
    try {
      if (!sessionId) {
        throw new Error('會話ID不能為空');
      }

      const response = await api.get(`${this.baseURL}/sessions/${sessionId}/messages`);
      
      if (response.success) {
        console.log('✅ 管理員獲取會話詳情成功:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || '獲取會話詳情失敗');
      }
    } catch (error) {
      console.error('❌ 管理員獲取會話詳情失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取聊天統計數據
   * @param {Object} params - 查詢參數
   * @returns {Promise<Object>}
   */
  async getChatStats(params = {}) {
    try {
      // 如果沒有指定日期範圍，默認查詢今天
      const today = new Date().toISOString().split('T')[0];
      const defaultParams = {
        startDate: today,
        endDate: today,
        ...params
      };

      const response = await api.get(`${this.baseURL}/stats`, { params: defaultParams });
      
      if (response.success) {
        console.log('✅ 獲取聊天統計數據成功:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || '獲取統計數據失敗');
      }
    } catch (error) {
      console.error('❌ 獲取聊天統計數據失敗:', error);
      throw error;
    }
  }

  /**
   * 導出聊天記錄
   * @param {Object} exportData - 導出參數
   * @returns {Promise<Blob>}
   */
  async exportChatRecords(exportData = {}) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const defaultData = {
        startDate: today,
        endDate: today,
        format: 'excel',
        includeUserInfo: true,
        ...exportData
      };

      console.log('🚀 開始導出聊天記錄:', defaultData);

      const response = await api.post(`${this.baseURL}/export`, defaultData, {
        responseType: 'blob' // 重要：指定響應類型為blob
      });

      // 檢查響應類型
      if (response instanceof Blob) {
        console.log('✅ 聊天記錄導出成功');
        return response;
      } else if (response.success) {
        console.log('✅ 聊天記錄導出成功');
        return response;
      } else {
        throw new Error('導出響應格式錯誤');
      }
    } catch (error) {
      console.error('❌ 導出聊天記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 處理文件下載
   * @param {Blob} blob - 文件blob
   * @param {string} filename - 文件名
   */
  downloadFile(blob, filename = '聊天記錄導出.xlsx') {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('✅ 文件下載成功:', filename);
    } catch (error) {
      console.error('❌ 文件下載失敗:', error);
      throw error;
    }
  }

  /**
   * 格式化會話數據供前端顯示
   * @param {Array} sessions - 原始會話數據
   * @returns {Array}
   */
  formatSessionsForDisplay(sessions) {
    if (!Array.isArray(sessions)) {
      return [];
    }

    return sessions.map(session => ({
      id: session.sessionId,
      sessionId: session.sessionId,
      user: {
        id: session.userId,
        name: session.userName,
        email: session.userEmail,
        position: session.userPosition
      },
      title: session.title,
      messageCount: session.messageCount,
      status: session.status,
      duration: session.duration,
      categories: session.categories || [],
      createdAt: session.createdAt,
      lastMessageAt: session.lastMessageAt,
      updatedAt: session.lastMessageAt, // 兼容前端現有字段
      lastMessage: session.lastMessage || session.title || '無消息內容' // 添加lastMessage字段
    }));
  }

  /**
   * 格式化統計數據供前端顯示
   * @param {Object} stats - 原始統計數據
   * @returns {Object}
   */
  formatStatsForDisplay(stats) {
    if (!stats) {
      return {
        overview: {},
        dailyStats: [],
        feedbackStats: {},
        topCategories: [],
        n8nService: {}
      };
    }

    return {
      overview: stats.overview || {},
      dailyStats: stats.dailyStats || [],
      feedbackStats: stats.feedbackStats || {},
      topCategories: stats.topCategories || [],
      n8nService: stats.n8nService || {},
      dateRange: stats.dateRange || {}
    };
  }

  /**
   * 搜索會話
   * @param {string} searchTerm - 搜索關鍵詞
   * @param {Object} filters - 其他篩選條件
   * @returns {Promise<Object>}
   */
  async searchSessions(searchTerm, filters = {}) {
    try {
      const params = {
        search: searchTerm,
        page: 1,
        limit: 50,
        ...filters
      };

      return await this.getAllSessions(params);
    } catch (error) {
      console.error('❌ 搜索會話失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取特定用戶的會話
   * @param {string} userId - 用戶ID
   * @param {Object} params - 其他參數
   * @returns {Promise<Object>}
   */
  async getUserSessions(userId, params = {}) {
    try {
      if (!userId) {
        throw new Error('用戶ID不能為空');
      }

      const searchParams = {
        userId: userId,
        ...params
      };

      return await this.getAllSessions(searchParams);
    } catch (error) {
      console.error('❌ 獲取用戶會話失敗:', error);
      throw error;
    }
  }

  /**
   * 格式化日期為API需要的格式
   * @param {Date|string} date - 日期
   * @returns {string}
   */
  formatDateForAPI(date) {
    if (!date) return new Date().toISOString().split('T')[0];
    
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    
    return date.toISOString().split('T')[0];
  }

  /**
   * 批量操作會話（預留接口）
   * @param {Array} sessionIds - 會話ID列表
   * @param {string} action - 操作類型
   * @returns {Promise<Object>}
   */
  async batchOperations(sessionIds, action) {
    // TODO: 當後端支持批量操作時實現
    console.log('批量操作功能待實現:', { sessionIds, action });
    throw new Error('批量操作功能尚未實現');
  }
}

// 創建單例實例
const adminChatService = new AdminChatService();

export default adminChatService; 