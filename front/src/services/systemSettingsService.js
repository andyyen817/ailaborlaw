import api from './api';

export const systemSettingsService = {
  /**
   * 1. 初始化系统设置
   * POST /admin/system-settings/initialize
   */
  async initializeSystemSettings() {
    try {
      const response = await api.post('/admin/system-settings/initialize');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('初始化系统设置失败:', error);
      throw error;
    }
  },

  /**
   * 2. 获取所有设置
   * GET /admin/system-settings
   */
  async getAllSettings() {
    try {
      const response = await api.get('/admin/system-settings');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('获取系统设置失败:', error);
      throw error;
    }
  },

  /**
   * 3. 更新特定设置
   * PUT /admin/system-settings/:key
   */
  async updateSetting(key, value, description) {
    try {
      const response = await api.put(`/admin/system-settings/${key}`, {
        value,
        description
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('更新系统设置失败:', error);
      throw error;
    }
  },

  /**
   * 4. 邀请系统专项设置
   * GET /admin/system-settings/invite/settings
   * PUT /admin/system-settings/invite/settings
   */
  async getInviteSystemSettings() {
    try {
      const response = await api.get('/admin/system-settings/invite/settings');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('获取邀请系统设置失败:', error);
      throw error;
    }
  },

  async updateInviteSystemSettings(settings) {
    try {
      const response = await api.put('/admin/system-settings/invite/settings', settings);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('更新邀请系统设置失败:', error);
      throw error;
    }
  }
};

export default systemSettingsService; 