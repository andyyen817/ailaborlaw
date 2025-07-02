/**
 * 劳工顾问管理服务
 * 提供劳工顾问的CRUD操作和数据管理
 * v2.5.0 - 完整API對接版本
 * v2.5.1 - 修正API路徑前綴，使用/admin路徑以符合管理後台認證規範
 */

import api from './api';

// API端点 - 使用admin路徑以符合管理後台認證規範
const ADVISOR_ENDPOINTS = {
  // 基礎CRUD操作
  GET_ALL: '/admin/labor-advisors',
  GET_BY_ID: '/admin/labor-advisors/:id',
  CREATE: '/admin/labor-advisors',
  UPDATE: '/admin/labor-advisors/:id',
  DELETE: '/admin/labor-advisors/:id',
  
  // 狀態管理
  TOGGLE_STATUS: '/admin/labor-advisors/:id/toggle-status',
  
  // 搜索和統計
  SEARCH_AVAILABLE: '/admin/labor-advisors/search',
  GET_STATISTICS: '/admin/labor-advisors/statistics',
  
  // 指派功能
  MANUAL_ASSIGN: '/admin/labor-advisors/assign/:consultationId',
  AUTO_ASSIGN: '/admin/labor-advisors/auto-assign/:consultationId',
  ASSIGNMENT_HISTORY: '/admin/labor-advisors/assignment-history/:consultationId'
};

// 🔧 修復：移除手動認證頭部處理，改用api.js的統一認證機制

/**
 * 劳工顾问服务对象
 */
const laborAdvisorService = {
  /**
   * 获取所有劳工顾问 (API #1)
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.limit - 每页数量
   * @param {string} params.region - 地区筛选
   * @param {string} params.specialty - 专业领域筛选
   * @param {boolean} params.is_active - 状态筛选
   * @param {string} params.search - 搜索关键词
   * @returns {Promise<Object>} 顾问列表和分页信息
   */
  async getAllAdvisors(params = {}) {
    try {
      console.log('📊 获取劳工顾问列表...', params);
      
      // 转换参数格式以匹配API
      const apiParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        region: params.region || undefined,
        specialty: params.specialty || undefined,
        is_active: params.status === 'active' ? true : params.status === 'inactive' ? false : undefined,
        search: params.search || undefined
      };
      
      // 🔧 修復：使用與adminChatService相同的調用方式，讓api.js自動處理認證
      const response = await api.get(ADVISOR_ENDPOINTS.GET_ALL, {
        params: apiParams
      });
      
      if (response.success) {
        console.log('✅ 获取劳工顾问列表成功 (API):', response.data);
        
        // 转换API响应格式为前端期望格式
        const advisors = response.data.advisors.map(advisor => ({
          id: advisor.id,
          name: advisor.name,
          phone: advisor.phone,
          email: advisor.email,
          lineId: advisor.line_id,
          region: advisor.region,
          specialties: advisor.specialties,
          serviceCount: advisor.total_completed || 0,
          rating: advisor.avg_rating || null,
          status: advisor.is_active ? 'active' : 'inactive',
          notes: advisor.notes,
          workloadStatus: advisor.workload_status,
          totalAssigned: advisor.total_assigned || 0,
          avgCompletionTime: advisor.avg_completion_time || 0,
          createdAt: advisor.created_at,
          updatedAt: advisor.updated_at
        }));
        
        return {
          success: true,
          data: {
            advisors,
            pagination: {
              current_page: response.data.pagination.currentPage,
              per_page: params.limit || 10,
              total: response.data.pagination.totalItems,
              total_pages: response.data.pagination.totalPages
            }
          }
        };
      } else {
        throw new Error(response.message || 'API响应失败');
      }
    } catch (error) {
      console.error('❌ 获取劳工顾问列表失败:', error.message);
      throw error; // 直接抛出错误，不再降级到本地存储
    }
  },

  /**
   * 获取单个顾问详情 (API #3)
   * @param {string} advisorId - 顾问ID
   * @returns {Promise<Object>} 顾问详情
   */
  async getAdvisorById(advisorId) {
    try {
      console.log('📊 获取顾问详情:', advisorId);
      
      const endpoint = ADVISOR_ENDPOINTS.GET_BY_ID.replace(':id', advisorId);
      // 🔧 修復：移除手動headers，讓api.js自動處理認證
      const response = await api.get(endpoint);
      
      if (response.success) {
        console.log('✅ 获取顾问详情成功 (API):', response.data);
        
        // 转换API响应格式
        const advisor = response.data.advisor;
        return {
          success: true,
          data: {
            id: advisor.id,
            name: advisor.name,
            phone: advisor.phone,
            email: advisor.email,
            lineId: advisor.line_id,
            region: advisor.region,
            specialties: advisor.specialties,
            serviceCount: advisor.total_completed || 0,
            rating: advisor.avg_rating || null,
            status: advisor.is_active ? 'active' : 'inactive',
            notes: advisor.notes,
            workloadStatus: advisor.workload_status,
            totalAssigned: advisor.total_assigned || 0,
            avgCompletionTime: advisor.avg_completion_time || 0,
            createdAt: advisor.created_at,
            updatedAt: advisor.updated_at,
            consultationStats: response.data.consultationStats || [],
            recentConsultations: response.data.recentConsultations || []
          }
        };
      } else {
        throw new Error(response.message || 'API响应失败');
      }
    } catch (error) {
      console.error('❌ 获取顾问详情失败:', error.message);
      throw error;
    }
  },

  /**
   * 创建新顾问 (API #2)
   * @param {Object} advisorData - 顾问数据
   * @returns {Promise<Object>} 创建结果
   */
  async createAdvisor(advisorData) {
    try {
      console.log('➕ 创建顾问:', advisorData);
      
      // 转换数据格式以匹配API
      const apiData = {
        name: advisorData.name,
        phone: advisorData.phone,
        email: advisorData.email,
        lineId: advisorData.lineId || undefined,
        region: advisorData.region,
        specialties: advisorData.specialties,
        notes: advisorData.notes || undefined
      };
      
      // 🔧 修復：移除手動headers，讓api.js自動處理認證
      const response = await api.post(ADVISOR_ENDPOINTS.CREATE, apiData);
      
      if (response.success) {
        console.log('✅ 创建顾问成功 (API):', response.data);
        
        // 转换API响应格式
        const advisor = response.data;
        return {
          success: true,
          data: {
            id: advisor.id,
            name: advisor.name,
            phone: advisor.phone,
            email: advisor.email,
            lineId: advisor.line_id,
            region: advisor.region,
            specialties: advisor.specialties,
            serviceCount: 0,
            rating: null,
            status: advisor.is_active ? 'active' : 'inactive',
            notes: advisor.notes,
            workloadStatus: advisor.workload_status,
            totalAssigned: 0,
            avgCompletionTime: 0,
            createdAt: advisor.created_at,
            updatedAt: advisor.updated_at
          }
        };
      } else {
        throw new Error(response.message || 'API响应失败');
      }
    } catch (error) {
      console.error('❌ 创建顾问失败:', error.message);
      throw error;
    }
  },

  /**
   * 更新顾问信息 (API #4)
   * @param {string} advisorId - 顾问ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateAdvisor(advisorId, updateData) {
    try {
      console.log('✏️ 更新顾问:', advisorId, updateData);
      
      // 转换数据格式以匹配API
      const apiData = {
        name: updateData.name,
        phone: updateData.phone,
        email: updateData.email,
        lineId: updateData.lineId || undefined,
        region: updateData.region,
        specialties: updateData.specialties,
        notes: updateData.notes || undefined
      };
      
      const endpoint = ADVISOR_ENDPOINTS.UPDATE.replace(':id', advisorId);
      // 🔧 修復：移除手動headers，讓api.js自動處理認證
      const response = await api.put(endpoint, apiData);
      
      if (response.success) {
        console.log('✅ 更新顾问成功 (API):', response.data);
        return response;
      } else {
        throw new Error(response.message || 'API响应失败');
      }
    } catch (error) {
      console.error('❌ 更新顾问失败:', error.message);
      throw error;
    }
  },

  /**
   * 切换顾问状态 (API #5)
   * @param {string} advisorId - 顾问ID
   * @returns {Promise<Object>} 更新结果
   */
  async toggleAdvisorStatus(advisorId) {
    try {
      console.log('🔄 切换顾问状态:', advisorId);
      
      const endpoint = ADVISOR_ENDPOINTS.TOGGLE_STATUS.replace(':id', advisorId);
      // 🔧 修復：移除手動headers，讓api.js自動處理認證
      const response = await api.put(endpoint, {});
      
      if (response.success) {
        console.log('✅ 切换顾问状态成功 (API):', response.data);
        return response;
      } else {
        throw new Error(response.message || 'API响应失败');
      }
    } catch (error) {
      console.error('❌ 切换顾问状态失败:', error.message);
      throw error;
    }
  },

  /**
   * 删除顾问 (API #6)
   * @param {string} advisorId - 顾问ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteAdvisor(advisorId) {
    try {
      console.log('🗑️ 删除顾问:', advisorId);
      
      const endpoint = ADVISOR_ENDPOINTS.DELETE.replace(':id', advisorId);
      // 🔧 修復：移除手動headers，讓api.js自動處理認證
      const response = await api.delete(endpoint);
      
      if (response.success) {
        console.log('✅ 删除顾问成功 (API)');
        return response;
      } else {
        throw new Error(response.message || 'API响应失败');
      }
    } catch (error) {
      console.error('❌ 删除顾问失败:', error.message);
      throw error;
    }
  },

  /**
   * 搜索可用顾问 (API #7)
   * @param {Object} criteria - 搜索条件
   * @param {string} criteria.region - 地区
   * @param {string} criteria.specialty - 专业领域
   * @returns {Promise<Object>} 搜索结果
   */
  async searchAvailableAdvisors(criteria = {}) {
    try {
      console.log('🔍 搜索可用顾问:', criteria);
      
      // 🔧 修復：移除手動headers，讓api.js自動處理認證
      const response = await api.get(ADVISOR_ENDPOINTS.SEARCH_AVAILABLE, {
        params: {
          region: criteria.region,
          specialty: criteria.specialty,
          available: true
        }
      });
      
      if (response.success) {
        console.log('✅ 搜索可用顾问成功 (API):', response.data);
        
        // 转换API响应格式
        const advisors = response.data.advisors.map(advisor => ({
          id: advisor.id,
          name: advisor.name,
          phone: advisor.phone,
          email: advisor.email,
          region: advisor.region,
          specialties: advisor.specialties,
          workloadStatus: advisor.workload_status,
          totalAssigned: advisor.total_assigned || 0
        }));
        
        return {
          success: true,
          data: {
            advisors,
            total: response.data.total,
            searchCriteria: response.data.searchCriteria
          }
        };
      } else {
        throw new Error(response.message || 'API响应失败');
      }
    } catch (error) {
      console.error('❌ 搜索可用顾问失败:', error.message);
      throw error;
    }
  },

  /**
   * 获取顾问统计数据 (API #8)
   * @returns {Promise<Object>} 统计数据
   */
  async getAdvisorStatistics() {
    try {
      console.log('📈 获取顾问统计...');
      
      // 🔧 修復：移除手動headers，讓api.js自動處理認證
      const response = await api.get(ADVISOR_ENDPOINTS.GET_STATISTICS);
      
      if (response.success) {
        console.log('✅ 获取顾问统计成功 (API):', response.data);
        return {
          success: true,
          data: response.data
        };
      } else {
        throw new Error(response.message || 'API响应失败');
      }
    } catch (error) {
      console.error('❌ 获取顾问统计失败:', error.message);
      throw error;
    }
  },

  /**
   * 手动指派顾问 (API #9)
   * @param {string} consultationId - 咨询申请ID
   * @param {string} advisorId - 顾问ID
   * @returns {Promise<Object>} 指派结果
   */
  async assignAdvisorManually(consultationId, advisorId) {
    try {
      console.log('👤 手动指派顾问:', { consultationId, advisorId });
      
      const endpoint = ADVISOR_ENDPOINTS.MANUAL_ASSIGN.replace(':consultationId', consultationId);
      // 🔧 修復：移除手動headers，讓api.js自動處理認證
      const response = await api.put(endpoint, {
        advisorId: advisorId  // 注意：API文档中字段名是 advisorId
      });
      
      if (response.success) {
        console.log('✅ 手动指派顾问成功 (API):', response.data);
        return response;
      } else {
        throw new Error(response.message || 'API响应失败');
      }
    } catch (error) {
      console.error('❌ 手动指派顾问失败:', error.message);
      throw error;
    }
  },

  /**
   * 自动指派最佳顾问 (API #10)
   * @param {string} consultationId - 咨询申请ID
   * @returns {Promise<Object>} 指派结果
   */
  async assignAdvisorAutomatically(consultationId) {
    try {
      console.log('🤖 自动指派顾问:', consultationId);
      
      const endpoint = ADVISOR_ENDPOINTS.AUTO_ASSIGN.replace(':consultationId', consultationId);
      // 🔧 修復：移除手動headers，讓api.js自動處理認證
      const response = await api.post(endpoint, {});
      
      if (response.success) {
        console.log('✅ 自动指派顾问成功 (API):', response.data);
        return response;
      } else {
        throw new Error(response.message || 'API响应失败');
      }
    } catch (error) {
      console.error('❌ 自动指派顾问失败:', error.message);
      throw error;
    }
  },

  /**
   * 获取指派历史 (API #11)
   * @param {string} consultationId - 咨询申请ID
   * @returns {Promise<Object>} 指派历史
   */
  async getAssignmentHistory(consultationId) {
    try {
      console.log('📋 获取指派历史:', consultationId);
      
      const endpoint = ADVISOR_ENDPOINTS.ASSIGNMENT_HISTORY.replace(':consultationId', consultationId);
      // 🔧 修復：移除手動headers，讓api.js自動處理認證
      const response = await api.get(endpoint);
      
      if (response.success) {
        console.log('✅ 获取指派历史成功 (API):', response.data);
        return response;
      } else {
        throw new Error(response.message || 'API响应失败');
      }
    } catch (error) {
      console.error('❌ 获取指派历史失败:', error.message);
      throw error;
    }
  }
};

export default laborAdvisorService; 