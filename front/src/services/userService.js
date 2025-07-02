// src/services/userService.js
import api from './api';
import authService from './auth';
import eventService from './eventService';

export const userService = {
  /**
   * 获取用户列表 (管理员功能)
   * @param {Object} params - 可选参数，如 { page, limit, status, userType, searchKeyword }
   * @returns {Promise<Object>} - 包含用户列表和总数的对象 { users, total }
   */
  async getUsers(params = {}) {
    try {
      const response = await api.get('/admin/users', { params });
      console.log('獲取用戶列表API響應:', response);
      
      // 確保正確處理API返回的數據結構
      if (response.success && response.data) {
        return {
          users: response.data.users || [],
          total: response.data.total || 0,
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          totalPages: response.data.totalPages || 1
        };
      } else {
        // 如果API響應結構不符合預期，返回空結果
        console.warn('API響應結構不符合預期:', response);
        return { users: [], total: 0, page: 1, limit: 10, totalPages: 1 };
      }
    } catch (error) {
      console.error("获取用户列表失败:", error);
      throw error;
    }
  },

  /**
   * 获取当前用户信息
   * @returns {Promise<Object>} - 用户信息
   */
  async getCurrentUserInfo() {
    try {
      const response = await api.get('/users/me');
      console.log('獲取用戶信息API響應:', response);
      // 根據API響應結構提取用戶數據
      return response.data.user || response.data.data?.user || response.data;
    } catch (error) {
      console.error("获取当前用户信息失败:", error);
      throw error;
    }
  },

  /**
   * 根据ID获取用户信息 (管理员功能)
   * @param {string} userId - 用户ID
   * @param {boolean} forceRefresh - 是否強制從後端刷新數據
   * @returns {Promise<Object>} - 用户信息
   */
  async getUserById(userId, forceRefresh = true) {
    try {
      console.log(`獲取用戶(ID: ${userId})詳情，強制刷新: ${forceRefresh}`);
      
      // 如果強制刷新或本地存儲中沒有該用戶資料，則從API獲取
      if (forceRefresh) {
        // 發送請求獲取用戶詳情，添加防止緩存的參數和"no-cache"請求頭
        const timestamp = new Date().getTime();
        const response = await api.get(`/admin/users/${userId}?_t=${timestamp}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        console.log(`獲取用戶(ID: ${userId})原始響應:`, JSON.stringify(response.data));
        
        // 🔍 添加詳細的響應結構調試
        console.log(`🔍 管理API完整響應:`, JSON.stringify(response, null, 2));
        console.log(`🔍 管理API response.data:`, JSON.stringify(response.data, null, 2));
        
        // 處理API響應 - 優先嘗試不同的數據結構
        let responseData = response.data?.user || response.data?.data?.user || response.data?.data || response.data;
        console.log(`🔍 管理API提取的響應數據:`, JSON.stringify(responseData, null, 2));
        
        // 檢查手機號碼和公司名稱字段
        console.log(`🔍 管理API關鍵字段檢查:`);
        console.log(`  - responseData.phoneNumber:`, responseData?.phoneNumber);
        console.log(`  - responseData.phone:`, responseData?.phone);
        console.log(`  - responseData.companyName:`, responseData?.companyName);
        console.log(`  - responseData.company:`, responseData?.company);
        
        // 標準化用戶數據
        const userData = responseData ? {
          ...responseData,
          // 確保使用統一的字段名稱
          phoneNumber: responseData.phoneNumber || responseData.phone || '',
          companyName: responseData.companyName || responseData.company || '',
          // 增强职业字段的标准化处理
          occupation: responseData.occupation || responseData.position || (responseData.profile?.occupation) || (responseData.profile?.position) || '',
          position: responseData.position || responseData.occupation || (responseData.profile?.position) || (responseData.profile?.occupation) || '',
          industry: responseData.industry || (responseData.profile?.industry) || ''
        } : null;
        
        if (!userData) {
          console.warn(`API未返回有效的用戶(ID: ${userId})詳情`);
        } else {
          console.log(`🔍 管理API標準化後的用戶數據:`, JSON.stringify(userData, null, 2));
          console.log(`🔍 管理API最終的 phoneNumber:`, userData.phoneNumber);
          console.log(`🔍 管理API最終的 companyName:`, userData.companyName);
          
          // 同時更新本地存儲和觸發更新事件
          // 如果是當前登入用戶，更新本地存儲
          const currentUser = authService.getCurrentUser();
          if (currentUser && currentUser.id === userId) {
            authService.updateLocalUserData(userData);
            console.log(`已更新本地存儲的用戶資料`);
          }
          
          // 通知系統其他部分用戶資料已更新
          eventService.notifyUserProfileUpdated(userId, userData);
          console.log(`已觸發用戶(ID: ${userId})資料更新事件`);
          
          // 同時觸發資料同步事件
          eventService.notifyDataSyncNeeded('users', 'update', { userId, userData });
          console.log(`已觸發用戶數據同步事件`);
        }
        
        // 返回標準化後的用戶數據和原始響應
        return {
          ...response,
          data: {
            ...response.data,
            user: userData
          }
        };
      } else {
        // 如果不是強制刷新，嘗試從本地存儲獲取
        // (這裡可以實現本地緩存邏輯，但一般情況下都應該使用強制刷新)
        const mockResponse = await mockUserStore.getUserById(userId);
        if (mockResponse) {
          return mockResponse;
        }
        
        // 如果本地存儲中沒有，還是需要從API獲取
        return this.getUserById(userId, true);
      }
    } catch (error) {
      console.error(`獲取用戶(ID: ${userId})詳情失敗:`, error);
      throw error;
    }
  },

  /**
   * 更新当前用户信息
   * @param {Object} userData - 要更新的用户数据，可包含 name, email, profile: { industry, position }
   * @returns {Promise<Object>} - 更新后的用户信息
   */
  async updateUserProfile(userData) {
    try {
      // 預處理更新數據，確保字段名稱與後端一致
      const updateData = { ...userData };
      
      console.log('更新前的輸入數據:', JSON.stringify(userData));
      
      // 處理字段名稱映射 - 前端提交時使用 phone 和 company
      if (updateData.phoneNumber !== undefined) {
        console.log(`將字段 phoneNumber:${updateData.phoneNumber} 轉換為 phone 發送給後端`);
        updateData.phone = updateData.phoneNumber;
        delete updateData.phoneNumber;
      }
      
      if (updateData.companyName !== undefined) {
        console.log(`將字段 companyName:${updateData.companyName} 轉換為 company 發送給後端`);
        updateData.company = updateData.companyName;
        delete updateData.companyName;
      }
      
      // 處理profile嵌套結構
      if (updateData.profile) {
        console.log('處理profile嵌套結構:', JSON.stringify(updateData.profile));
        // 將profile中的字段提升到根級，因為後端可能不支持嵌套結構
        if (updateData.profile.position !== undefined) {
          console.log(`將profile.position:${updateData.profile.position} 提升為根級字段position`);
          updateData.position = updateData.profile.position;
          // 同时设置occupation字段以保持兼容性
          updateData.occupation = updateData.profile.position;
        }
        if (updateData.profile.industry !== undefined) {
          console.log(`將profile.industry:${updateData.profile.industry} 提升為根級字段industry`);
          updateData.industry = updateData.profile.industry;
        }
        if (updateData.profile.occupation !== undefined) {
          console.log(`將profile.occupation:${updateData.profile.occupation} 提升為根級字段occupation和position`);
          updateData.occupation = updateData.profile.occupation;
          updateData.position = updateData.profile.occupation;
        }
      }
      
      // 处理职业相关字段的映射 - 确保position和occupation字段同步
      if (updateData.occupation !== undefined) {
        console.log(`管理員更新：設置position字段為occupation值:${updateData.occupation}`);
        updateData.position = updateData.occupation;
      }
      if (updateData.position !== undefined && updateData.occupation === undefined) {
        console.log(`管理員更新：設置occupation字段為position值:${updateData.position}`);
        updateData.occupation = updateData.position;
      }
      
      console.log('準備發送更新用戶資料請求，完整數據:', JSON.stringify(updateData));
      const response = await api.put('/users/me', updateData);
      console.log('更新用戶資料API響應:', response);
      
      // 🔍 添加詳細的響應結構調試
      console.log('🔍 後端完整響應結構:', JSON.stringify(response, null, 2));
      console.log('🔍 response.data:', JSON.stringify(response.data, null, 2));
      console.log('🔍 response.data.data:', response.data.data);
      console.log('🔍 response.data.user:', response.data.user);
      console.log('🔍 response.data.data?.user:', response.data.data?.user);
      
      // 從API響應中提取用戶數據，並確保字段名稱統一
      // 按優先順序查找：response.data.user -> response.data.data?.user -> response.data
      const responseData = response.data.user || response.data.data?.user || response.data;
      console.log('🔍 提取的響應數據 (第一次提取):', JSON.stringify(responseData, null, 2));
      
      // 🚨 如果第一次提取失敗，嘗試其他可能的結構
      let finalResponseData = responseData;
      if (!responseData || (!responseData.phoneNumber && !responseData.phone)) {
        console.log('🚨 第一次提取失敗，嘗試 response.data.data 結構');
        finalResponseData = response.data.data || response.data;
        console.log('🔍 提取的響應數據 (第二次提取):', JSON.stringify(finalResponseData, null, 2));
      }
      
      // 檢查關鍵字段
      console.log('🔍 關鍵字段檢查:');
      console.log('  - finalResponseData.phoneNumber:', finalResponseData?.phoneNumber);
      console.log('  - finalResponseData.phone:', finalResponseData?.phone);
      console.log('  - finalResponseData.companyName:', finalResponseData?.companyName);
      console.log('  - finalResponseData.company:', finalResponseData?.company);
      
      // 創建標準化的用戶數據對象，確保字段名稱統一
      const updatedUserData = finalResponseData ? {
        ...finalResponseData,
        // 確保使用統一的字段名稱：前端內部使用 phoneNumber 和 companyName
        phoneNumber: finalResponseData.phoneNumber || finalResponseData.phone || '',
        companyName: finalResponseData.companyName || finalResponseData.company || '',
        // 增强职业字段的标准化处理
        occupation: finalResponseData.occupation || finalResponseData.position || (finalResponseData.profile?.occupation) || (finalResponseData.profile?.position) || '',
        position: finalResponseData.position || finalResponseData.occupation || (finalResponseData.profile?.position) || (finalResponseData.profile?.occupation) || '',
        industry: finalResponseData.industry || (finalResponseData.profile?.industry) || ''
      } : null;
      
      console.log('🔍 標準化後的用戶數據:', JSON.stringify(updatedUserData, null, 2));
      console.log('🔍 最終的 phoneNumber:', updatedUserData?.phoneNumber);
      console.log('🔍 最終的 companyName:', updatedUserData?.companyName);
      
      // 使用認證服務更新本地存儲的用戶數據
      if (updatedUserData) {
        console.log('同步更新本地用戶數據:', updatedUserData);
        console.log('phoneNumber值:', updatedUserData.phoneNumber);
        console.log('companyName值:', updatedUserData.companyName);
        authService.updateLocalUserData(updatedUserData);
        
        // 獲取當前用戶ID
        const currentUser = authService.getCurrentUser();
        const userId = currentUser?.id || updatedUserData.id;
        
        // 使用事件服務觸發資料更新事件
        if (userId) {
          console.log(`準備觸發用戶(ID: ${userId})資料更新事件，數據:`, JSON.stringify(updatedUserData));
          eventService.notifyUserProfileUpdated(userId, updatedUserData);
          console.log(`已觸發用戶(ID: ${userId})資料更新事件`);
          
          // 添加: 同時觸發資料同步事件，確保mockUserStore也能更新
          eventService.notifyDataSyncNeeded('users', 'update', { userId, userData: updatedUserData });
          console.log(`已觸發用戶數據同步事件`);
        }
      }
      
      return updatedUserData;
    } catch (error) {
      console.error("更新用户资料失败:", error);
      throw error;
    }
  },

  /**
   * 更新用户密码
   * @param {string} currentPassword - 当前密码
   * @param {string} newPassword - 新密码
   * @returns {Promise<Object>} - 操作结果
   */
  async updatePassword(currentPassword, newPassword) {
    try {
      const response = await api.put('/users/me/password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error("更新密码失败:", error);
      throw error;
    }
  },

  /**
   * 删除当前用户账号
   * @returns {Promise<Object>} - 操作结果
   */
  async deleteAccount() {
    try {
      const response = await api.delete('/users/me');
      return response.data;
    } catch (error) {
      console.error("删除账号失败:", error);
      throw error;
    }
  },

  /**
   * 更新用户状态 (管理员功能)
   * @param {string} userId - 用户ID
   * @param {string} status - 新状态
   * @returns {Promise<Object>} - 更新后的用户信息
   */
  async updateUserStatus(userId, status) {
    try {
      return await api.put(`/admin/users/${userId}/status`, { status });
    } catch (error) {
      console.error(`更新用户(ID: ${userId})状态失败:`, error);
      throw error;
    }
  },

  /**
   * 添加新用户 (管理员功能)
   * @param {Object} userData - 新用户的数据
   * @returns {Promise<Object>} - 创建的新用户对象
   */
  async addUser(userData) {
    try {
      return await api.post('/admin/users', userData);
    } catch (error) {
      console.error("添加用户失败:", error);
      throw error;
    }
  },

  /**
   * 获取用户剩余查询次数
   * @returns {Promise<Object>} - 包含剩余次数和总次数的对象
   */
  async getQueryCount() {
    try {
      const response = await api.get('/users/me/queries');
      console.log('獲取諮詢次數API響應:', response);
      // 根據API返回結構提取數據
      const data = response.data.data || response.data;
      return {
        remainingQueries: data.remainingQueries || 0,
        totalConsultations: data.totalConsultations || 0
      };
    } catch (error) {
      console.error("获取剩余查询次数失败:", error);
      throw error;
    }
  },

  /**
   * 扣减用户剩余查询次数
   * @returns {Promise<Object>} - 包含更新后剩余次数的对象
   */
  async decreaseQueryCount() {
    try {
      const response = await api.post('/users/me/queries/decrease');
      return response.data;
    } catch (error) {
      console.error("扣减查询次数失败:", error);
      throw error;
    }
  },
  
  /**
   * 增加用户查询次数 (管理员功能)
   * @param {string} userId - 用户ID
   * @param {number} amount - 要增加的次数
   * @returns {Promise<Object>} - 包含更新后剩余次数的对象
   */
  async increaseQueryCount(userId, amount) {
    try {
      const response = await api.post(`/admin/users/${userId}/queries/increase`, { amount });
      return response.data;
    } catch (error) {
      console.error(`增加用户(ID: ${userId})查询次数失败:`, error);
      throw error;
    }
  },

  /**
   * 同步用戶資料
   * 確保前端保存的用戶資料與後端一致
   * @returns {Promise<Object>} - 同步後的用戶資料
   */
  async syncUserData() {
    try {
      // 從認證服務獲取當前本地存儲的用戶資訊
      const localUser = authService.getCurrentUser();
      console.log('開始同步用戶資料，本地用戶數據:', localUser);
      
      // 從API獲取最新用戶資料
      const response = await api.get('/users/me');
      console.log('從API獲取的用戶數據:', response);
      
      // 🔍 添加詳細的響應結構調試
      console.log('🔍 同步API完整響應:', JSON.stringify(response, null, 2));
      console.log('🔍 同步API response.data:', JSON.stringify(response.data, null, 2));
      
      const apiUserData = response.data.user || response.data.data?.user || response.data.data || response.data;
      console.log('🔍 提取的API用戶數據:', JSON.stringify(apiUserData, null, 2));
      
      if (!apiUserData) {
        console.warn('API未返回有效的用戶資料');
        return localUser;
      }
      
      // 檢查關鍵字段
      console.log('🔍 同步時的關鍵字段檢查:');
      console.log('  - apiUserData.phoneNumber:', apiUserData.phoneNumber);
      console.log('  - apiUserData.phone:', apiUserData.phone);
      console.log('  - apiUserData.companyName:', apiUserData.companyName);
      console.log('  - apiUserData.company:', apiUserData.company);
      
      // 合併API返回的資料與本地資料，確保字段名稱一致性
      const mergedData = {
        ...localUser,
        ...apiUserData,
        // 確保以下字段存在且命名正確
        name: apiUserData.name || localUser?.name,
        email: apiUserData.email || localUser?.email,
        phoneNumber: apiUserData.phoneNumber || apiUserData.phone || localUser?.phoneNumber || localUser?.phone || '',
        companyName: apiUserData.companyName || apiUserData.company || localUser?.companyName || localUser?.company || '',
        // 確保profile字段存在並合併
        profile: {
          ...(localUser?.profile || {}),
          ...(apiUserData.profile || {}),
        }
      };
      
      console.log('🔍 合併後的數據:', JSON.stringify(mergedData, null, 2));
      console.log('🔍 合併後的 phoneNumber:', mergedData.phoneNumber);
      console.log('🔍 合併後的 companyName:', mergedData.companyName);
      
      // 使用認證服務更新本地用戶資料
      const updatedUser = authService.updateLocalUserData(mergedData);
      console.log('用戶資料已同步，更新後的數據:', updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('同步用戶資料失敗:', error);
      // 如果API失敗，返回本地資料
      return authService.getCurrentUser();
    }
  },

  /**
   * 更新用户信息 (管理员功能)
   * @param {string} userId - 用户ID
   * @param {Object} userData - 要更新的用户数据
   * @returns {Promise<Object>} - 更新后的用户信息
   */
  async updateUser(userId, userData) {
    try {
      // 預處理更新數據，確保字段名稱與後端一致
      const updateData = { ...userData };
      
      // 處理字段名稱映射 - 提交時使用 phone 和 company
      if (updateData.phoneNumber !== undefined) {
        updateData.phone = updateData.phoneNumber;
        delete updateData.phoneNumber;
      }
      
      if (updateData.companyName !== undefined) {
        updateData.company = updateData.companyName;
        delete updateData.companyName;
      }
      
      // 处理职业相关字段的映射 - 确保position和occupation字段同步
      if (updateData.occupation !== undefined) {
        console.log(`管理員更新：設置position字段為occupation值:${updateData.occupation}`);
        updateData.position = updateData.occupation;
      }
      if (updateData.position !== undefined && updateData.occupation === undefined) {
        console.log(`管理員更新：設置occupation字段為position值:${updateData.position}`);
        updateData.occupation = updateData.position;
      }
      
      console.log(`更新用戶(ID: ${userId})資料，數據:`, updateData);
      
      // 發送更新請求，無需再添加緩存控制頭
      const response = await api.put(`/admin/users/${userId}`, updateData);
      
      console.log(`更新用戶(ID: ${userId})資料響應:`, response);
      
      // 從響應中提取更新後的用戶數據
      const responseData = response.data?.user || response.data;
      
      // 標準化用戶數據
      const updatedUserData = responseData ? {
        ...responseData,
        // 確保使用統一的字段名稱
        phoneNumber: responseData.phoneNumber || responseData.phone,
        companyName: responseData.companyName || responseData.company
      } : null;
      
      // 使用事件服務觸發資料更新事件
      if (updatedUserData) {
        eventService.notifyUserProfileUpdated(userId, updatedUserData);
        console.log(`已觸發用戶(ID: ${userId})資料更新事件`);
        
        // 同時觸發資料同步事件
        eventService.notifyDataSyncNeeded('users', 'update', { userId, userData: updatedUserData });
        console.log(`已觸發用戶數據同步事件`);
      }
      
      return response;
    } catch (error) {
      console.error(`更新用戶(ID: ${userId})資料失敗:`, error);
      throw error;
    }
  },

  /**
   * 刪除用戶 (管理員功能)
   * @param {string} userId - 用戶ID
   * @returns {Promise<Object>} - 操作結果
   */
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      console.log(`刪除用戶(ID: ${userId})響應:`, response);
      return response;
    } catch (error) {
      console.error(`刪除用戶(ID: ${userId})失敗:`, error);
      throw error;
    }
  },

  /**
   * 切換用戶狀態 (管理員功能)
   * @param {string} userId - 用戶ID
   * @returns {Promise<Object>} - 更新後的用戶信息
   */
  async toggleUserStatus(userId) {
    try {
      const response = await api.patch(`/admin/users/${userId}/toggle-status`);
      console.log(`切換用戶(ID: ${userId})狀態響應:`, response);
      return response;
    } catch (error) {
      console.error(`切換用戶(ID: ${userId})狀態失敗:`, error);
      throw error;
    }
  },

  // ==================== 咨询次数管理API (新增9个方法) ====================

  /**
   * 获取我的咨询状态 ⭐ 核心功能
   * GET /queries/my-status
   */
  async getMyQueryStatus() {
    try {
      const response = await api.get('/queries/my-status');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('获取咨询状态失败:', error);
      throw error;
    }
  },

  /**
   * 今日使用次数
   * GET /queries/my-today-count
   */
  async getTodayUsageCount() {
    try {
      const response = await api.get('/queries/my-today-count');
      
      // 🔧 时区修复验证：检查API返回的时区是否正确
      if (response.data && response.data.timezone) {
        if (response.data.timezone !== 'Asia/Taipei') {
          console.warn('⚠️ API时区异常，可能影响今日使用次数准确性:', response.data.timezone);
          // 可以选择上报给监控系统
        } else {
          console.log('✅ 时区验证通过:', response.data.timezone);
        }
      }
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('获取今日使用次数失败:', error);
      throw error;
    }
  },

  /**
   * 咨询次数扣减
   * POST /queries/decrease
   */
  async decreaseQueryCount(reason = '', metadata = {}) {
    try {
      const response = await api.post('/queries/decrease', {
        reason,
        metadata
      });
      
      // 触发次数更新事件
      window.dispatchEvent(new CustomEvent('queryCountUpdated', {
        detail: { remainingQueries: response.data.remainingQueries }
      }));
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('扣减咨询次数失败:', error);
      throw error;
    }
  },

  /**
   * 获取咨询记录
   * GET /queries/my-records
   */
  async getMyQueryRecords(params = {}) {
    try {
      // 🔧 修复：确保参数正确传递给API
      console.log('📊 获取咨询记录，参数:', params);
      
      // 🔧 Task 2.1: 增强参数验证，确保API调用格式正确
      const apiParams = {
        limit: params.limit || 1000,
        page: params.page || 1
      };
      
      // 如果有action参数，也传递
      if (params.action) {
        apiParams.action = params.action;
      }
      
      console.log('📊 最终API参数:', apiParams);
      
      const response = await api.get('/queries/my-records', { 
        params: apiParams
      });
      
      console.log('📊 咨询记录API响应:', response);
      return {
        success: true,
        data: response.data || response // 兼容不同的响应格式
      };
    } catch (error) {
      console.error('📊 获取咨询记录失败:', error);
      
      // 🔧 Task 2.1: 增强错误处理，提供更好的降级方案
      if (error.status === 400) {
        console.warn('📊 咨询记录API参数验证失败，返回空记录');
        return {
          success: false,
          data: { 
            records: [],
            pagination: {
              currentPage: 1,
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: params.limit || 1000
            }
          },
          fallback: true,
          error: 'API参数验证失败'
        };
      } else if (error.status === 401) {
        console.warn('📊 咨询记录API认证失败，可能需要重新登录');
        return {
          success: false,
          data: { records: [] },
          fallback: true,
          error: '认证失败，请重新登录'
        };
      } else if (error.status === 404) {
        console.warn('📊 咨询记录API端点不存在，使用空记录');
        return {
          success: false,
          data: { records: [] },
          fallback: true,
          error: 'API端点不存在'
        };
      }
      
      // 🔧 Task 2.1: 对于其他错误，不再抛出异常，而是返回标准格式
      return {
        success: false,
        data: { records: [] },
        fallback: true,
        error: error.message || '获取咨询记录失败'
      };
    }
  },

  // ==================== 管理员咨询次数API ====================

  /**
   * 增加用户咨询次数（管理员）
   * POST /queries/increase
   */
  async increaseUserQueries(userId, amount, reason) {
    try {
      const response = await api.post('/queries/increase', {
        userId,
        amount,
        reason
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('增加用户咨询次数失败:', error);
      throw error;
    }
  },

  /**
   * 调整用户咨询次数（管理员）
   * POST /queries/admin/adjust
   */
  async adjustUserQueries(userId, operation, amount, reason) {
    try {
      const response = await api.post('/queries/admin/adjust', {
        userId,
        operation,
        amount,
        reason
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('调整用户咨询次数失败:', error);
      throw error;
    }
  },

  /**
   * 批量调整咨询次数（管理员）
   * POST /queries/admin/batch-adjust
   */
  async batchAdjustQueries(userIds, operation, amount, reason) {
    try {
      const response = await api.post('/queries/admin/batch-adjust', {
        userIds,
        operation,
        amount,
        reason
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('批量调整咨询次数失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户咨询状态（管理员）
   * GET /queries/user/:userId/status
   */
  async getUserQueryStatus(userId) {
    try {
      const response = await api.get(`/queries/user/${userId}/status`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('获取用户咨询状态失败:', error);
      throw error;
    }
  },

  /**
   * 系统咨询统计（管理员）
   * GET /queries/admin/system-stats
   */
  async getSystemQueryStats(params = {}) {
    try {
      const response = await api.get('/queries/admin/system-stats', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('获取系统咨询统计失败:', error);
      throw error;
    }
  }
};

export default userService;
