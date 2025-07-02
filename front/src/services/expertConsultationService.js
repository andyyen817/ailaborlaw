// 專家諮詢服務 - API對接版本
class ExpertConsultationService {
  constructor() {
    // 🔧 修復：統一使用環境變數配置，與其他服務保持一致
    const isDevelopment = import.meta.env.DEV;
    if (isDevelopment) {
      // 開發環境：使用本地API
      this.baseURL = 'http://localhost:7070/api/v1';
      console.log('🔧 专家咨询服务使用本地API:', this.baseURL);
    } else {
      // 生產環境：使用環境變量或默認本地API（因為已遷移到本地開發）
      this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7070/api/v1';
    }
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  // 獲取認證Headers
  getAuthHeaders(token = null) {
    // 🔧 修复：统一token键名，优先使用传入的token，然后按正确的优先级查找
    let authToken = token;
    
    if (!authToken) {
      // 🔧 修复：按正确的优先级查找token
      // 1. 首先查找管理员token（正确的键名）
      authToken = localStorage.getItem('admin_access_token');
      
      // 2. 如果没有管理员token，查找普通用户token
      if (!authToken) {
        authToken = localStorage.getItem('auth_token');
      }
      
      // 3. 最后尝试备用键名（向后兼容）
      if (!authToken) {
        authToken = localStorage.getItem('admin_token');
      }
    }
    
    return {
      ...this.defaultHeaders,
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    };
  }

  // 通用API請求方法
  async apiRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(options.token),
      ...options
    };

    try {
      console.log(`🚀 API請求: ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        // 🔍 详细记录API错误信息
        console.error('❌ API错误详情:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          method: config.method || 'GET',
          responseData: data,
          requestBody: config.body
        });
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      
      console.log(`✅ API響應成功:`, data);
      return data;
    } catch (error) {
      console.error(`❌ API請求失敗 ${url}:`, error);
      throw error;
    }
  }

  // === 用戶端API ===

  // 1. 提交專家諮詢申請（支援游客模式）
  async submitConsultation(consultationData, userToken = null) {
    try {
      // 🔧 修复：增强数据验证和格式适配
      console.log('🎯 準備提交專家諮詢申請，原始數據:', consultationData);
      
      // 🔧 修复：验证必填字段
      if (!consultationData.name || !consultationData.phone || !consultationData.service || !consultationData.details) {
        const missingFields = [];
        if (!consultationData.name) missingFields.push('姓名');
        if (!consultationData.phone) missingFields.push('電話');
        if (!consultationData.service) missingFields.push('服務類型');
        if (!consultationData.details) missingFields.push('問題詳情');
        
        throw new Error(`缺少必填字段: ${missingFields.join(', ')}`);
      }
      
      // 🔧 修复：验证联系方式数组
      if (!consultationData.preferredContact || 
          !Array.isArray(consultationData.preferredContact) || 
          consultationData.preferredContact.length === 0) {
        throw new Error('請至少選擇一種偏好聯絡方式');
      }
      
      // 🚨 關鍵修復：清理電話號碼格式，移除所有非數字字符
      const cleanPhone = consultationData.phone.replace(/\D/g, '');
      console.log(`📞 電話號碼格式化：原始 "${consultationData.phone}" → 清理後 "${cleanPhone}"`);
      
      // 🔧 修复：根据API文档请求参数示例，使用camelCase字段名格式
      const apiData = {
        name: consultationData.name.trim(),
        phone: cleanPhone, // 🚨 使用清理後的純數字電話號碼
        email: consultationData.email?.trim() || '',
        lineId: consultationData.lineId?.trim() || '', // 🚨 修复：使用camelCase格式
        service: consultationData.service, // 🚨 修复：使用camelCase格式
        details: consultationData.details.trim(),
        preferredContact: Array.isArray(consultationData.preferredContact) 
          ? consultationData.preferredContact 
          : [consultationData.preferredContact], // 🚨 修复：使用camelCase格式
        region: consultationData.region?.trim() || '',
        
        // 🔧 修复：根据API文档，使用camelCase格式的时间字段
        timeOfDay: consultationData.timeOfDay || 'afternoon', // 🚨 修复：使用下午作为默认值
        startTime: consultationData.startTime || '',   // 🚨 修复：使用camelCase
        endTime: consultationData.endTime || '',       // 🚨 修复：使用camelCase
        
        // 🔧 修复：simplifiedTime应该是HH:MM格式，:00或:30结尾
        simplifiedTime: consultationData.startTime || '14:30' // 🚨 修复：默认使用14:30（符合后端成功案例）
      };

      // 🚨 重要修复：生成consultationTime字段（后端测试成功数据中有此字段）
      if (consultationData.timeOfDay && consultationData.startTime && consultationData.endTime) {
        const timeOfDayMap = {
          'morning': '上午',
          'afternoon': '下午', 
          'evening': '晚上'
        };
        const timeOfDayText = timeOfDayMap[consultationData.timeOfDay] || '下午';
        apiData.consultationTime = `${timeOfDayText} ${consultationData.startTime}-${consultationData.endTime}`;
      } else if (consultationData.timeOfDay) {
        // 如果只有时间段，生成默认的consultationTime（匹配后端成功案例格式）
        const timeOfDayMap = {
          'morning': '上午 09:00-12:00',
          'afternoon': '下午 14:00-17:00', 
          'evening': '晚上 19:00-21:00'
        };
        apiData.consultationTime = timeOfDayMap[consultationData.timeOfDay] || '下午 14:00-17:00';
      } else {
        // 🚨 关键修复：如果没有选择时间段，设置默认的consultationTime
        apiData.consultationTime = '下午 14:00-17:00';
      }

      // 🔧 修复：只清理undefined和null值，保留空字符串和空数组
      Object.keys(apiData).forEach(key => {
        if (apiData[key] === undefined || apiData[key] === null) {
          delete apiData[key];
        }
      });
      
      // 🔧 修复：最终验证处理过的数据
      console.log('🔍 API提交數據格式（符合文档要求）:', apiData);
      console.log('🔍 详细字段检查（使用camelCase字段名）:');
      console.log('  - name:', apiData.name, '(类型:', typeof apiData.name, ')');
      console.log('  - phone:', apiData.phone, '(类型:', typeof apiData.phone, ')');
      console.log('  - email:', apiData.email, '(类型:', typeof apiData.email, ')');
      console.log('  - lineId:', apiData.lineId, '(类型:', typeof apiData.lineId, ')');
      console.log('  - service:', apiData.service, '(类型:', typeof apiData.service, ')');
      console.log('  - details:', apiData.details, '(类型:', typeof apiData.details, ', 长度:', apiData.details?.length, ')');
      console.log('  - preferredContact:', apiData.preferredContact, '(类型:', typeof apiData.preferredContact, ', 数组:', Array.isArray(apiData.preferredContact), ', 长度:', apiData.preferredContact?.length, ')');
      console.log('  - region:', apiData.region, '(类型:', typeof apiData.region, ')');
      console.log('  - timeOfDay:', apiData.timeOfDay, '(类型:', typeof apiData.timeOfDay, ')');
      console.log('  - startTime:', apiData.startTime, '(类型:', typeof apiData.startTime, ')');
      console.log('  - endTime:', apiData.endTime, '(类型:', typeof apiData.endTime, ')');
      console.log('  - simplifiedTime:', apiData.simplifiedTime, '(类型:', typeof apiData.simplifiedTime, ')');
      console.log('  - consultationTime:', apiData.consultationTime, '(类型:', typeof apiData.consultationTime, ')');
      
      // 🔧 修复：再次验证关键字段（使用正确的camelCase字段名）
      if (!apiData.preferredContact || apiData.preferredContact.length === 0) {
        throw new Error('聯絡方式數據處理錯誤');
      }

      return await this.apiRequest('/expert-consultations', {
        method: 'POST',
        body: JSON.stringify(apiData),
        token: userToken
      });
    } catch (error) {
      console.error('提交專家諮詢申請失敗:', error);
      throw error;
    }
  }

  // 2. 獲取用戶申請列表
  async getUserConsultations(userId, options = {}) {
    try {
      const params = new URLSearchParams({
        page: options.page || 1,
        limit: options.limit || 10,
        ...(options.status && { status: options.status })
      });

      return await this.apiRequest(`/expert-consultations/user/${userId}?${params}`, {
        method: 'GET',
        token: options.token
      });
    } catch (error) {
      console.error('獲取用戶申請列表失敗:', error);
      throw error;
    }
  }

  // 3. 獲取申請詳情
  async getConsultationDetails(consultationId, token = null) {
    try {
      return await this.apiRequest(`/expert-consultations/${consultationId}`, {
        method: 'GET',
        token
      });
    } catch (error) {
      console.error('獲取申請詳情失敗:', error);
      throw error;
    }
  }

  // 4. 取消申請
  async cancelConsultation(consultationId, reason = '', token = null) {
    try {
      const data = reason ? { reason } : {};
      return await this.apiRequest(`/expert-consultations/${consultationId}/cancel`, {
        method: 'PUT',
        body: JSON.stringify(data),
        token
      });
    } catch (error) {
      console.error('取消申請失敗:', error);
      throw error;
    }
  }

  // === 管理員端API ===

  // 5. 獲取所有申請列表（管理員）
  async getAllConsultations(options = {}) {
    try {
      const params = new URLSearchParams({
        page: options.page || 1,
        limit: options.limit || 10,
        ...(options.status && options.status !== 'all' && { status: options.status }),
        ...(options.service_type && options.service_type !== 'all' && { service_type: options.service_type }),
        ...(options.search && { search: options.search }),
        ...(options.region && options.region !== 'all' && { region: options.region })
      });

      // 🔧 修复：增强adminToken获取逻辑和日志记录
      const adminToken = options.adminToken || options.token || localStorage.getItem('admin_access_token');
      
      console.log('🔐 专家咨询API调用详情:');
      console.log('  - 传入的adminToken:', options.adminToken ? `长度${options.adminToken.length}` : '无');
      console.log('  - 传入的token:', options.token ? `长度${options.token.length}` : '无');
      console.log('  - localStorage admin_access_token:', localStorage.getItem('admin_access_token') ? `长度${localStorage.getItem('admin_access_token').length}` : '无');
      console.log('  - 最终使用的token长度:', adminToken ? adminToken.length : 0);

      return await this.apiRequest(`/expert-consultations/admin/list?${params}`, {
        method: 'GET',
        token: adminToken
      });
    } catch (error) {
      console.error('獲取所有申請列表失敗:', error);
      throw error;
    }
  }

  // 🔧 修复：为降级方案添加别名方法
  async getAdminConsultationList(options = {}) {
    return this.getAllConsultations(options);
  }

  // 6. 更新申請狀態（管理員）
  async updateConsultationStatus(consultationId, updateData, adminToken = null) {
    try {
      return await this.apiRequest(`/expert-consultations/admin/${consultationId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        token: adminToken
      });
    } catch (error) {
      console.error('更新申請狀態失敗:', error);
      throw error;
    }
  }

  // 7. 刪除申請（管理員）
  async deleteConsultation(consultationId, adminToken = null) {
    try {
      return await this.apiRequest(`/expert-consultations/admin/${consultationId}`, {
        method: 'DELETE',
        token: adminToken
      });
    } catch (error) {
      console.error('刪除申請失敗:', error);
      throw error;
    }
  }

  // 8. 獲取統計數據（管理員）
  async getConsultationStatistics(options = {}) {
    try {
      const params = new URLSearchParams({
        ...(options.startDate && { startDate: options.startDate }),
        ...(options.endDate && { endDate: options.endDate })
      });

      return await this.apiRequest(`/expert-consultations/admin/statistics?${params}`, {
        method: 'GET',
        token: options.adminToken
      });
    } catch (error) {
      console.error('獲取統計數據失敗:', error);
      throw error;
    }
  }

  // === 數據格式轉換工具 ===

  // 將API響應轉換為前端所需格式
  formatConsultationForFrontend(apiData) {
    if (!apiData) return null;

    return {
      id: apiData.id || apiData._id,
      customId: apiData.id,
      userId: apiData.user_id,
      name: apiData.name,
      phone: apiData.phone,
      email: apiData.email,
      lineId: apiData.line_id,
      region: apiData.region,
      service: apiData.service_type,
      details: apiData.details,
      preferredContact: apiData.preferred_contact || [],
      consultationTime: apiData.consultation_time,
      timeOfDay: apiData.time_of_day,
      startTime: apiData.start_time,
      endTime: apiData.end_time,
      status: apiData.status,
      adminNotes: apiData.admin_notes || '',
      processedBy: apiData.processed_by,
      processedAt: apiData.processed_at,
      assignedAdvisorId: apiData.assigned_advisor_id,
      createdAt: apiData.created_at,
      updatedAt: apiData.updated_at,
      source: 'api' // 標記數據來源
    };
  }

  // 批量格式轉換
  formatConsultationsForFrontend(apiConsultations) {
    return (apiConsultations || []).map(consultation => 
      this.formatConsultationForFrontend(consultation)
    );
  }

  // === localStorage備用方法（保留以防API失敗） ===

  // localStorage備用 - 提交申請
  async submitConsultationFallback(consultationData) {
    try {
      console.warn('🔄 使用localStorage備用方案提交申請');
      const requests = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
      
      const newRequest = {
        id: `consultation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: localStorage.getItem('auth_user_id') || 'guest',
        ...consultationData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        adminNotes: '',
        source: 'fallback'
      };
      
      requests.push(newRequest);
      localStorage.setItem('consultationRequests', JSON.stringify(requests));
      
      return {
        success: true,
        message: '申請提交成功（離線模式）',
        data: {
          id: newRequest.id,
          customId: newRequest.id,
          status: newRequest.status,
          createdAt: newRequest.createdAt
        }
      };
    } catch (error) {
      console.error('localStorage備用方案失敗:', error);
      throw error;
    }
  }

  // localStorage備用 - 獲取申請列表
  getConsultationsFallback(filters = {}) {
    try {
      console.warn('🔄 使用localStorage備用方案獲取申請列表');
      const requests = JSON.parse(localStorage.getItem('consultationRequests') || '[]');
      
      let filtered = requests;
      
      // 應用篩選
      if (filters.userId) {
        filtered = filtered.filter(req => req.userId === filters.userId);
      }
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(req => req.status === filters.status);
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(req => 
          req.name?.toLowerCase().includes(searchTerm) ||
          req.phone?.includes(searchTerm) ||
          req.email?.toLowerCase().includes(searchTerm)
        );
      }
      
      return {
        success: true,
        data: {
          consultations: filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: filtered.length,
            hasNext: false,
            hasPrev: false
          },
          statistics: this.calculateStatisticsFallback(requests)
        }
      };
    } catch (error) {
      console.error('localStorage備用方案失敗:', error);
      return {
        success: false,
        data: { consultations: [], pagination: {}, statistics: {} }
      };
    }
  }

  // 計算統計數據（備用）
  calculateStatisticsFallback(requests) {
    const stats = requests.reduce((acc, req) => {
      acc.total++;
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, { total: 0, pending: 0, processing: 0, completed: 0, cancelled: 0 });
    
    return stats;
  }

  // === 主要對外接口（帶備用機制） ===

  // 提交申請（主要接口，帶備用機制）
  async submitConsultationWithFallback(consultationData, userToken = null) {
    try {
      // 首先嘗試API
      return await this.submitConsultation(consultationData, userToken);
    } catch (error) {
      console.warn('API提交失敗，嘗試備用方案:', error);
      // API失敗時使用localStorage備用方案
      return await this.submitConsultationFallback(consultationData);
    }
  }

  // 獲取申請列表（主要接口，帶備用機制）
  async getConsultationsWithFallback(options = {}) {
    try {
      if (options.isAdmin) {
        // 管理員獲取所有申請
        return await this.getAllConsultations(options);
      } else {
        // 用戶獲取自己的申請
        return await this.getUserConsultations(options.userId, options);
      }
    } catch (error) {
      console.warn('API獲取失敗，嘗試備用方案:', error);
      // API失敗時使用localStorage備用方案
      return this.getConsultationsFallback(options);
    }
  }
}

// 創建單例實例
const expertConsultationService = new ExpertConsultationService();

export default expertConsultationService; 