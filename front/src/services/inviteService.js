import api from './api';

export const inviteService = {
  // ==================== 用户端API ====================
  
  /**
   * 1. 获取我的邀请码 ⭐ 核心功能
   * GET /invites/my-code
   */
  async getMyInviteCode() {
    try {
      const response = await api.get('/invites/my-code');
      return {
        success: true,
        data: {
          inviteCode: response.data.inviteCode,
          userName: response.data.userName,
          inviteUrl: response.data.inviteUrl
        }
      };
    } catch (error) {
      console.error('获取邀请码失败:', error);
      return this.handleError(error, '获取邀请码失败');
    }
  },

  /**
   * ❌ 重新生成邀请码 (根据简化需求，此功能已被禁用)
   * POST /invites/regenerate-code
   * 注意：根据用户需求，邀请码应该是唯一且不可修改的，此方法已被禁用
   */
  async regenerateInviteCode() {
    console.warn('⚠️ regenerateInviteCode 功能已根据简化需求被禁用，邀请码不支持重新生成');
    return {
      success: false,
      data: null,
      message: '此功能已被禁用，邀请码是唯一且不可修改的'
    };
    
    // 原有API调用代码已注释（符合简化需求）
    // try {
    //   const response = await api.post('/invites/regenerate-code', {});
    //   return {
    //     success: true,
    //     data: {
    //       newInviteCode: response.data.newInviteCode,
    //       inviteUrl: response.data.inviteUrl
    //     },
    //     message: response.data.message || '邀请码重新生成成功'
    //   };
    // } catch (error) {
    //   console.error('重新生成邀请码失败:', error);
    //   return this.handleError(error, '重新生成邀请码失败');
    // }
  },

  /**
   * 3. 验证邀请码 ⭐ 核心功能
   * POST /invites/validate
   */
  async validateInviteCode(inviteCode) {
    try {
      if (!inviteCode || inviteCode.trim().length === 0) {
        throw new Error('邀请码不能为空');
      }
      
      const response = await api.post('/invites/validate', { inviteCode: inviteCode.trim() });
      return {
        success: true,
        data: {
          inviter: response.data.inviter
        }
      };
    } catch (error) {
      console.error('验证邀请码失败:', error);
      return this.handleError(error, '邀请码验证失败');
    }
  },

  /**
   * 4. 获取我的邀请统计 ⭐ 核心功能
   * GET /invites/my-stats
   */
  async getMyInviteStats() {
    try {
      const response = await api.get('/invites/my-stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('获取邀请统计失败:', error);
      return this.handleError(error, '获取邀请统计失败');
    }
  },

  /**
   * 5. 处理邀请注册 ⭐ 核心功能
   * POST /invites/process-registration
   */
  async processInviteRegistration(inviteCode) {
    try {
      if (!inviteCode || inviteCode.trim().length === 0) {
        throw new Error('邀请码不能为空');
      }
      
      const response = await api.post('/invites/process-registration', { inviteCode: inviteCode.trim() });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('处理邀请注册失败:', error);
      return this.handleError(error, '处理邀请注册失败');
    }
  },

  /**
   * 6. 发放注册奖励 ⭐ 新增功能
   * POST /invites/grant-registration-bonus
   */
  async grantRegistrationBonus() {
    try {
      const response = await api.post('/invites/grant-registration-bonus');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('发放注册奖励失败:', error);
      return this.handleError(error, '发放注册奖励失败');
    }
  },

  /**
   * 7. 获取邀请设置 ⭐ 新增功能
   * 获取当前的邀请奖励设置
   */
  async getInviteSettings() {
    try {
      const response = await api.get('/invites/settings');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('获取邀请设置失败:', error);
      return this.handleError(error, '获取邀请设置失败');
    }
  },

  /**
   * ❌ 获取邀请排行榜 (根据简化需求已被禁用)
   * GET /invites/leaderboard
   * 注意：此功能根据用户简化需求已被禁用，专注于核心邀请功能
   */
  async getInviteLeaderboard(limit = 10, startDate = null, endDate = null) {
    console.warn('⚠️ getInviteLeaderboard 功能已根据简化需求被禁用，不显示排行榜');
    return {
      success: false,
      data: null,
      message: '此功能已被禁用，专注于核心邀请功能而不显示排行榜'
    };
    
    // 原有API调用代码已注释（符合简化需求）
    // try {
    //   let endpoint = `/invites/leaderboard?limit=${limit}`;
    //   if (startDate) endpoint += `&startDate=${startDate}`;
    //   if (endDate) endpoint += `&endDate=${endDate}`;
    //   
    //   const response = await api.get(endpoint);
    //   return {
    //     success: true,
    //     data: response.data
    //   };
    // } catch (error) {
    //   console.error('获取邀请排行榜失败:', error);
    //   return this.handleError(error, '获取邀请排行榜失败');
    // }
  },

  // ==================== 管理员端API ====================

  /**
   * 8. 获取用户邀请统计（管理员）
   * GET /invites/user/:userId/stats
   */
  async getUserInviteStats(userId) {
    try {
      if (!userId) {
        throw new Error('用户ID不能为空');
      }
      
      const response = await api.get(`/invites/user/${userId}/stats`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('获取用户邀请统计失败:', error);
      return this.handleError(error, '获取用户邀请统计失败');
    }
  },

  /**
   * 9. 邀请系统统计（管理员）
   * GET /invites/system-stats
   */
  async getSystemInviteStats(params = {}) {
    try {
      const response = await api.get('/invites/system-stats', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('获取系统邀请统计失败:', error);
      return this.handleError(error, '获取系统邀请统计失败');
    }
  },

  /**
   * 10. 更新邀请设置（管理员）
   * PUT /invites/settings
   */
  async updateInviteSettings(settings) {
    try {
      if (!settings) {
        throw new Error('邀请设置不能为空');
      }
      
      const response = await api.put('/invites/settings', settings);
      return {
        success: true,
        data: response.data,
        message: '邀请设置更新成功'
      };
    } catch (error) {
      console.error('更新邀请设置失败:', error);
      return this.handleError(error, '更新邀请设置失败');
    }
  },

  /**
   * 11. 获取所有邀请记录（管理员）
   * GET /invites/admin/records
   */
  async getAllInviteRecords(params = {}) {
    try {
      const response = await api.get('/invites/admin/records', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('获取邀请记录失败:', error);
      return this.handleError(error, '获取邀请记录失败');
    }
  },

  /**
   * 12. 获取系统统计（管理员增强版）
   * GET /invites/admin/system-stats
   */
  async getSystemStats(params = {}) {
    try {
      const response = await api.get('/invites/admin/system-stats', { params });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('获取系统统计失败:', error);
      return this.handleError(error, '获取系统统计失败');
    }
  },

  /**
   * 13. 获取邀请设置（管理员）
   * GET /invites/admin/settings
   */
  async getInviteAdminSettings() {
    try {
      const response = await api.get('/invites/admin/settings');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('获取邀请设置失败:', error);
      return this.handleError(error, '获取邀请设置失败');
    }
  },

  /**
   * 14. 更新邀请设置（管理员）
   * PUT /invites/admin/settings
   */
  async updateInviteAdminSettings(settings) {
    try {
      if (!settings) {
        throw new Error('邀请设置不能为空');
      }
      
      const response = await api.put('/invites/admin/settings', settings);
      return {
        success: true,
        data: response.data,
        message: '邀请设置更新成功'
      };
    } catch (error) {
      console.error('更新邀请设置失败:', error);
      return this.handleError(error, '更新邀请设置失败');
    }
  },

  // ==================== 辅助方法 ====================

  /**
   * 生成邀请链接
   */
  generateInviteLink(inviteCode) {
    if (!inviteCode) {
      console.warn('邀请码为空，无法生成邀请链接');
      return '';
    }
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?invite=${inviteCode}`;
  },

  /**
   * 隐藏用户信息（保护隐私）
   */
  maskUserInfo(userInfo) {
    if (!userInfo) return null;
    
    return {
      ...userInfo,
      name: this.maskName(userInfo.name),
      email: this.maskEmail(userInfo.email)
    };
  },

  /**
   * 隐藏姓名：显示首字+星号
   */
  maskName(name) {
    if (!name || name.length === 0) return '';
    if (name.length === 1) return name;
    
    return name.charAt(0) + '*'.repeat(name.length - 1);
  },

  /**
   * 隐藏邮箱：部分隐藏
   */
  maskEmail(email) {
    if (!email || !email.includes('@')) return '';
    
    const [localPart, domain] = email.split('@');
    
    if (localPart.length <= 2) {
      return `${localPart}@${domain}`;
    }
    
    const firstChar = localPart.charAt(0);
    const lastChar = localPart.charAt(localPart.length - 1);
    const maskedPart = '*'.repeat(Math.max(localPart.length - 2, 1));
    
    return `${firstChar}${maskedPart}${lastChar}@${domain}`;
  },

  /**
   * 统一错误处理
   */
  handleError(error, defaultMessage = '操作失败') {
    let errorMessage = defaultMessage;
    
    if (error.response) {
      // 服务器响应错误
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          errorMessage = data.message || '请求参数错误';
          break;
        case 401:
          errorMessage = '请先登录';
          break;
        case 403:
          errorMessage = '权限不足';
          break;
        case 404:
          errorMessage = data.message || '邀请码不存在或已失效';
          break;
        case 429:
          errorMessage = '请求过于频繁，请稍后再试';
          break;
        case 500:
          errorMessage = '服务器错误，请稍后重试';
          break;
        default:
          errorMessage = data.message || defaultMessage;
      }
    } else if (error.request) {
      // 网络错误
      errorMessage = '网络连接失败，请检查网络设置';
    } else {
      // 其他错误
      errorMessage = error.message || defaultMessage;
    }
    
    return {
      success: false,
      message: errorMessage,
      error: error
    };
  },

  /**
   * 重试机制
   */
  async retryApiCall(apiCall, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error;
        }
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
};

export default inviteService; 