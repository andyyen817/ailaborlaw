import SystemSetting from '../models/system-setting.model.js';
import { AppError, errorUtils } from '../utils/error.js';
import logger from '../utils/logger.js';

/**
 * 系统设置服务类
 * 处理系统配置的所有业务逻辑
 */
class SystemSettingService {
  
  /**
   * 初始化系统默认设置
   * @returns {Promise<Object>} 初始化结果
   */
  static async initializeSystem() {
    try {
      const result = await SystemSetting.initializeDefaults();
      
      logger.info('系统设置初始化:', result);
      
      return {
        success: true,
        message: result.message,
        data: {
          count: result.count
        }
      };
      
    } catch (error) {
      logger.error('初始化系统设置时发生错误:', error);
      throw new AppError('初始化系统设置时发生内部错误', 500);
    }
  }
  
  /**
   * 获取所有系统设置
   * @param {string} category - 设置分类
   * @param {boolean} activeOnly - 只返回激活的设置
   * @returns {Promise<Object>} 设置列表
   */
  static async getAllSettings(category = null, activeOnly = true) {
    try {
      let settings;
      
      if (category) {
        settings = await SystemSetting.getByCategory(category, activeOnly);
      } else {
        const query = activeOnly ? { isActive: true } : {};
        settings = await SystemSetting.find(query)
          .sort({ category: 1, key: 1 })
          .populate('updatedBy', 'name email');
      }
      
      // 按分类分组
      const groupedSettings = {};
      settings.forEach(setting => {
        if (!groupedSettings[setting.category]) {
          groupedSettings[setting.category] = [];
        }
        groupedSettings[setting.category].push(setting);
      });
      
      return {
        success: true,
        data: {
          settings,
          groupedSettings,
          totalCount: settings.length
        }
      };
      
    } catch (error) {
      logger.error('获取系统设置时发生错误:', error);
      throw new AppError('获取系统设置时发生内部错误', 500);
    }
  }
  
  /**
   * 获取单个设置值
   * @param {string} key - 设置键名
   * @param {any} defaultValue - 默认值
   * @returns {Promise<Object>} 设置值
   */
  static async getSetting(key, defaultValue = null) {
    try {
      const value = await SystemSetting.getValue(key, defaultValue);
      const setting = await SystemSetting.findOne({ 
        key: key.toUpperCase(), 
        isActive: true 
      }).populate('updatedBy', 'name email');
      
      return {
        success: true,
        data: {
          key: key.toUpperCase(),
          value,
          setting: setting || null,
          usedDefault: !setting
        }
      };
      
    } catch (error) {
      logger.error('获取系统设置时发生错误:', error);
      throw new AppError('获取系统设置时发生内部错误', 500);
    }
  }
  
  /**
   * 更新单个设置
   * @param {string} key - 设置键名
   * @param {any} value - 设置值
   * @param {string} updatedBy - 更新人ID
   * @param {string} description - 描述
   * @returns {Promise<Object>} 更新结果
   */
  static async updateSetting(key, value, updatedBy = null, description = null) {
    try {
      // 验证设置值
      const tempSetting = new SystemSetting({
        key: key.toUpperCase(),
        value,
        description
      });
      
      if (!tempSetting.validateValue()) {
        throw new AppError(`设置值 ${value} 对于键 ${key} 无效`, 400);
      }
      
      const result = await SystemSetting.setValue(key, value, updatedBy, description);
      
      logger.info(`系统设置更新: ${key} = ${value}, 更新人: ${updatedBy}`);
      
      return {
        success: true,
        message: '系统设置更新成功',
        data: result
      };
      
    } catch (error) {
      logger.error('更新系统设置时发生错误:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('更新系统设置时发生内部错误', 500);
    }
  }
  
  /**
   * 批量更新设置
   * @param {Array} settings - 设置数组
   * @param {string} updatedBy - 更新人ID
   * @returns {Promise<Object>} 批量更新结果
   */
  static async batchUpdateSettings(settings, updatedBy = null) {
    try {
      // 验证所有设置
      for (const setting of settings) {
        const tempSetting = new SystemSetting({
          key: setting.key.toUpperCase(),
          value: setting.value,
          description: setting.description,
          category: setting.category
        });
        
        if (!tempSetting.validateValue()) {
          throw new AppError(`设置值 ${setting.value} 对于键 ${setting.key} 无效`, 400);
        }
      }
      
      const result = await SystemSetting.setBatch(settings, updatedBy);
      
      logger.info(`批量更新系统设置: ${settings.length} 个设置, 更新人: ${updatedBy}`);
      
      return {
        success: true,
        message: `成功更新 ${settings.length} 个系统设置`,
        data: {
          modifiedCount: result.modifiedCount,
          upsertedCount: result.upsertedCount,
          totalOperations: settings.length
        }
      };
      
    } catch (error) {
      logger.error('批量更新系统设置时发生错误:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('批量更新系统设置时发生内部错误', 500);
    }
  }
  
  /**
   * 删除设置（软删除）
   * @param {string} key - 设置键名
   * @param {string} updatedBy - 操作人ID
   * @returns {Promise<Object>} 删除结果
   */
  static async deleteSetting(key, updatedBy = null) {
    try {
      const result = await SystemSetting.findOneAndUpdate(
        { key: key.toUpperCase() },
        {
          isActive: false,
          updatedBy,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (!result) {
        throw new AppError('设置不存在', 404);
      }
      
      logger.info(`系统设置删除: ${key}, 操作人: ${updatedBy}`);
      
      return {
        success: true,
        message: '系统设置删除成功',
        data: result
      };
      
    } catch (error) {
      logger.error('删除系统设置时发生错误:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('删除系统设置时发生内部错误', 500);
    }
  }
  
  /**
   * 恢复设置
   * @param {string} key - 设置键名
   * @param {string} updatedBy - 操作人ID
   * @returns {Promise<Object>} 恢复结果
   */
  static async restoreSetting(key, updatedBy = null) {
    try {
      const result = await SystemSetting.findOneAndUpdate(
        { key: key.toUpperCase() },
        {
          isActive: true,
          updatedBy,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (!result) {
        throw new AppError('设置不存在', 404);
      }
      
      logger.info(`系统设置恢复: ${key}, 操作人: ${updatedBy}`);
      
      return {
        success: true,
        message: '系统设置恢复成功',
        data: result
      };
      
    } catch (error) {
      logger.error('恢复系统设置时发生错误:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('恢复系统设置时发生内部错误', 500);
    }
  }
  
  /**
   * 获取邀请系统设置
   * @returns {Promise<Object>} 邀请系统设置
   */
  static async getInviteSettings() {
    try {
      const settings = await SystemSetting.getInviteSettings();
      
      return {
        success: true,
        data: settings
      };
      
    } catch (error) {
      logger.error('获取邀请系统设置时发生错误:', error);
      throw new AppError('获取邀请系统设置时发生内部错误', 500);
    }
  }
  
  /**
   * 更新邀请系统设置
   * @param {Object} settings - 邀请设置对象
   * @param {string} updatedBy - 更新人ID
   * @returns {Promise<Object>} 更新结果
   */
  static async updateInviteSettings(settings, updatedBy = null) {
    try {
      // 验证邀请设置
      const validKeys = [
        'defaultFreeQueries',
        'bonusQueries', 
        'inviteeBonusQueries',
        'maxInvitesPerDay',
        'inviteCodeLength',
        'inviteCodeExpireDays',
        'enableInviteSystem'
      ];
      
      const invalidKeys = Object.keys(settings).filter(key => !validKeys.includes(key));
      if (invalidKeys.length > 0) {
        throw new AppError(`无效的邀请设置键: ${invalidKeys.join(', ')}`, 400);
      }
      
      // 验证数值范围
      if (settings.defaultFreeQueries !== undefined && (settings.defaultFreeQueries < 0 || settings.defaultFreeQueries > 1000)) {
        throw new AppError('默认免费次数必须在0-1000之间', 400);
      }
      
      if (settings.bonusQueries !== undefined && (settings.bonusQueries < 0 || settings.bonusQueries > 100)) {
        throw new AppError('邀请奖励次数必须在0-100之间', 400);
      }
      
      if (settings.inviteeBonusQueries !== undefined && (settings.inviteeBonusQueries < 0 || settings.inviteeBonusQueries > 100)) {
        throw new AppError('被邀请人奖励次数必须在0-100之间', 400);
      }
      
      if (settings.maxInvitesPerDay !== undefined && (settings.maxInvitesPerDay < 1 || settings.maxInvitesPerDay > 1000)) {
        throw new AppError('每日最大邀请次数必须在1-1000之间', 400);
      }
      
      if (settings.inviteCodeLength !== undefined && (settings.inviteCodeLength < 4 || settings.inviteCodeLength > 20)) {
        throw new AppError('邀请码长度必须在4-20之间', 400);
      }
      
      if (settings.inviteCodeExpireDays !== undefined && (settings.inviteCodeExpireDays < 1 || settings.inviteCodeExpireDays > 3650)) {
        throw new AppError('邀请码过期天数必须在1-3650之间', 400);
      }
      
      const result = await SystemSetting.updateInviteSettings(settings, updatedBy);
      
      logger.info(`邀请系统设置更新成功, 更新人: ${updatedBy}`);
      
      return {
        success: true,
        message: '邀请系统设置更新成功',
        data: {
          updatedSettings: settings,
          operationResult: result
        }
      };
      
    } catch (error) {
      logger.error('更新邀请系统设置时发生错误:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('更新邀请系统设置时发生内部错误', 500);
    }
  }
  
  /**
   * 获取设置历史变更记录
   * @param {string} key - 设置键名
   * @param {number} limit - 返回数量限制
   * @returns {Promise<Object>} 变更历史
   */
  static async getSettingHistory(key = null, limit = 50) {
    try {
      const query = {};
      if (key) {
        query.key = key.toUpperCase();
      }
      
      const history = await SystemSetting.find(query)
        .sort({ updatedAt: -1, version: -1 })
        .limit(limit)
        .populate('updatedBy', 'name email')
        .select('key value description category version updatedAt updatedBy');
      
      return {
        success: true,
        data: {
          history,
          totalCount: history.length
        }
      };
      
    } catch (error) {
      logger.error('获取设置历史时发生错误:', error);
      throw new AppError('获取设置历史时发生内部错误', 500);
    }
  }
  
  /**
   * 导出系统设置
   * @param {string} category - 设置分类
   * @returns {Promise<Object>} 导出数据
   */
  static async exportSettings(category = null) {
    try {
      const settings = await this.getAllSettings(category, true);
      
      // 转换为导出格式
      const exportData = {
        exportTime: new Date(),
        category: category || 'all',
        settings: settings.data.settings.map(setting => ({
          key: setting.key,
          value: setting.value,
          description: setting.description,
          category: setting.category,
          version: setting.version,
          updatedAt: setting.updatedAt
        }))
      };
      
      return {
        success: true,
        message: '系统设置导出成功',
        data: exportData
      };
      
    } catch (error) {
      logger.error('导出系统设置时发生错误:', error);
      throw new AppError('导出系统设置时发生内部错误', 500);
    }
  }
  
  /**
   * 导入系统设置
   * @param {Object} importData - 导入数据
   * @param {string} updatedBy - 操作人ID
   * @returns {Promise<Object>} 导入结果
   */
  static async importSettings(importData, updatedBy = null) {
    try {
      if (!importData.settings || !Array.isArray(importData.settings)) {
        throw new AppError('导入数据格式无效', 400);
      }
      
      const result = await this.batchUpdateSettings(importData.settings, updatedBy);
      
      logger.info(`系统设置导入成功: ${importData.settings.length} 个设置, 操作人: ${updatedBy}`);
      
      return {
        success: true,
        message: `成功导入 ${importData.settings.length} 个系统设置`,
        data: result.data
      };
      
    } catch (error) {
      logger.error('导入系统设置时发生错误:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('导入系统设置时发生内部错误', 500);
    }
  }
  
  /**
   * 重置设置为默认值
   * @param {string} category - 设置分类
   * @param {string} updatedBy - 操作人ID
   * @returns {Promise<Object>} 重置结果
   */
  static async resetToDefaults(category = null, updatedBy = null) {
    try {
      // 如果指定了分类，只重置该分类的设置
      if (category) {
        await SystemSetting.deleteMany({ category, isActive: true });
      } else {
        await SystemSetting.deleteMany({ isActive: true });
      }
      
      // 重新初始化默认设置
      const result = await SystemSetting.initializeDefaults();
      
      // 更新操作人信息
      if (updatedBy) {
        await SystemSetting.updateMany(
          { updatedBy: null },
          { updatedBy, updatedAt: new Date() }
        );
      }
      
      logger.info(`系统设置重置为默认值, 分类: ${category || 'all'}, 操作人: ${updatedBy}`);
      
      return {
        success: true,
        message: '系统设置已重置为默认值',
        data: {
          category: category || 'all',
          restoredCount: result.count
        }
      };
      
    } catch (error) {
      logger.error('重置系统设置时发生错误:', error);
      throw new AppError('重置系统设置时发生内部错误', 500);
    }
  }
}

export default SystemSettingService; 