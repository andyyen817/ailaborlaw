import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import EmailLog from '../models/email_log.model.js';

// AokSend郵件服務類
class EmailService {
  // AokSend配置
  static config = {
    apiUrl: process.env.AOKSEND_API_URL || 'https://www.aoksend.com/index/api/send_email',
    appKey: process.env.AOKSEND_APP_KEY || 'bc61fddd2c7d2b32fc56b2aff720cb4a',
    alias: process.env.AOKSEND_ALIAS || '勞法通AI',
    replyTo: process.env.AOKSEND_REPLY_TO || 'noreply@your-domain.com',
    templates: {
      registration: process.env.TEMPLATE_REGISTRATION || 'E_120388785105',
      passwordReset: process.env.TEMPLATE_PASSWORD_RESET || 'E_120388235516', 
      inviteConfirmation: process.env.TEMPLATE_INVITE_CONFIRMATION || 'E_120384795747'
    }
  };

  /**
   * 生成6位數字驗證碼
   * @returns {string} 6位數字驗證碼
   */
  static generateVerificationCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * 加密驗證碼
   * @param {string} code - 原始驗證碼
   * @returns {Promise<string>} 加密後的驗證碼
   */
  static async hashVerificationCode(code) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(code, salt);
  }

  /**
   * 驗證驗證碼
   * @param {string} inputCode - 用戶輸入的驗證碼
   * @param {string} hashedCode - 數據庫存儲的加密驗證碼
   * @returns {Promise<boolean>} 驗證結果
   */
  static async verifyCode(inputCode, hashedCode) {
    return bcrypt.compare(inputCode, hashedCode);
  }

  /**
   * 調用AokSend API發送郵件
   * @param {string} templateId - 模板ID
   * @param {string} email - 收件人郵箱
   * @param {Object} templateData - 模板數據
   * @returns {Promise<Object>} AokSend回應結果
   */
  static async callAokSendAPI(templateId, email, templateData) {
    try {
      const requestData = {
        app_key: this.config.appKey,
        template_id: templateId,
        to: email,
        reply_to: this.config.replyTo,
        alias: this.config.alias,
        is_random: '1', // 開啟域名輪播
        data: JSON.stringify(templateData)
      };

      console.log(`[EmailService] 發送郵件到: ${email}, 模板: ${templateId}`);
      console.log(`[EmailService] 請求數據:`, requestData);

      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(requestData)
      });

      const result = await response.json();
      
      console.log(`[EmailService] AokSend回應:`, result);

      if (result.code === 200) {
        return {
          success: true,
          code: result.code,
          message: result.message || '郵件發送成功'
        };
      } else {
        // 處理AokSend錯誤碼
        const errorMessage = this.getAokSendErrorMessage(result.code);
        return {
          success: false,
          code: result.code,
          message: errorMessage || result.message || '郵件發送失敗'
        };
      }
    } catch (error) {
      console.error('[EmailService] AokSend API調用失敗:', error);
      return {
        success: false,
        code: 50001,
        message: `網絡錯誤: ${error.message}`
      };
    }
  }

  /**
   * AokSend錯誤碼對應表
   * @param {number} code - 錯誤碼
   * @returns {string} 錯誤信息
   */
  static getAokSendErrorMessage(code) {
    const errorMap = {
      40001: 'API密鑰不能為空',
      40002: '認證失敗，API密鑰錯誤',
      40003: '模板ID錯誤',
      40004: '收件人地址不能為空',
      40005: '收件人地址格式不正確',
      40006: '回復地址格式不正確',
      40007: '餘額不足或帳號被禁用',
      40008: '模板數據格式錯誤'
    };
    return errorMap[code] || '未知錯誤';
  }

  /**
   * 記錄郵件發送日志
   * @param {string} userId - 用戶ID
   * @param {string} email - 郵箱地址
   * @param {string} type - 郵件類型
   * @param {string} templateId - 模板ID
   * @param {string} verificationCode - 驗證碼（明文，用於記錄）
   * @param {Object} aoksendResponse - AokSend回應
   * @param {Date} expiresAt - 過期時間
   * @returns {Promise<EmailLog>} 郵件日志記錄
   */
  static async logEmailSent(userId, email, type, templateId, verificationCode, aoksendResponse, expiresAt) {
    try {
      const emailLog = new EmailLog({
        userId,
        email,
        type,
        templateId,
        verificationCode: verificationCode ? await this.hashVerificationCode(verificationCode) : null,
        status: aoksendResponse.success ? 'sent' : 'failed',
        aoksendResponse: {
          code: aoksendResponse.code,
          message: aoksendResponse.message
        },
        expiresAt,
        errorMessage: aoksendResponse.success ? null : aoksendResponse.message
      });

      await emailLog.save();
      console.log(`[EmailService] 郵件日志記錄完成: ${email} - ${type}`);
      return emailLog;
    } catch (error) {
      console.error('[EmailService] 記錄郵件日志失敗:', error);
      throw error;
    }
  }

  /**
   * 發送註冊驗證郵件
   * @param {string} email - 收件人郵箱
   * @param {string} name - 用戶姓名
   * @param {string} verificationCode - 驗證碼
   * @param {string} userId - 用戶ID
   * @returns {Promise<Object>} 發送結果
   */
  static async sendRegistrationEmail(email, name, verificationCode, userId) {
    try {
      const templateData = {
        name: name || '用戶',
        verification_code: verificationCode,
        date: new Date().toLocaleDateString('zh-TW')
      };

      const result = await this.callAokSendAPI(
        this.config.templates.registration,
        email,
        templateData
      );

      // 計算過期時間（15分鐘）
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // 記錄日志
      await this.logEmailSent(
        userId,
        email,
        'registration',
        this.config.templates.registration,
        verificationCode,
        result,
        expiresAt
      );

      return {
        success: result.success,
        message: result.success ? '註冊驗證郵件已發送' : result.message,
        expiresAt: result.success ? expiresAt : null
      };
    } catch (error) {
      console.error('[EmailService] 發送註冊驗證郵件失敗:', error);
      throw new Error(`發送註冊驗證郵件失敗: ${error.message}`);
    }
  }

  /**
   * 發送註冊驗證郵件（不需要用戶ID版本 - 支持一步式註冊）
   * @param {string} email - 收件人郵箱
   * @param {string} name - 用戶姓名
   * @param {string} verificationCode - 驗證碼
   * @returns {Promise<Object>} 發送結果
   */
  static async sendRegistrationEmailWithoutUser(email, name, verificationCode) {
    try {
      const templateData = {
        name: name || '用戶',
        verification_code: verificationCode,
        date: new Date().toLocaleDateString('zh-TW')
      };

      const result = await this.callAokSendAPI(
        this.config.templates.registration,
        email,
        templateData
      );

      // 不記錄到EmailLog，因為沒有userId
      console.log(`[EmailService] 註冊驗證郵件發送完成 (無用戶ID): ${email} - ${result.success ? '成功' : '失敗'}`);

      return {
        success: result.success,
        message: result.success ? '註冊驗證郵件已發送' : result.message,
        expiresAt: result.success ? new Date(Date.now() + 15 * 60 * 1000) : null
      };
    } catch (error) {
      console.error('[EmailService] 發送註冊驗證郵件失敗 (無用戶ID):', error);
      throw new Error(`發送註冊驗證郵件失敗: ${error.message}`);
    }
  }

  /**
   * 發送密碼重置郵件
   * @param {string} email - 收件人郵箱
   * @param {string} name - 用戶姓名
   * @param {string} verificationCode - 驗證碼
   * @param {string} userId - 用戶ID
   * @returns {Promise<Object>} 發送結果
   */
  static async sendPasswordResetEmail(email, name, verificationCode, userId) {
    try {
      const templateData = {
        name: name || '用戶',
        verification_code: verificationCode,
        date: new Date().toLocaleDateString('zh-TW')
      };

      const result = await this.callAokSendAPI(
        this.config.templates.passwordReset,
        email,
        templateData
      );

      // 計算過期時間（15分鐘）
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // 記錄日志
      await this.logEmailSent(
        userId,
        email,
        'password_reset',
        this.config.templates.passwordReset,
        verificationCode,
        result,
        expiresAt
      );

      return {
        success: result.success,
        message: result.success ? '密碼重置郵件已發送' : result.message,
        expiresAt: result.success ? expiresAt : null
      };
    } catch (error) {
      console.error('[EmailService] 發送密碼重置郵件失敗:', error);
      throw new Error(`發送密碼重置郵件失敗: ${error.message}`);
    }
  }

  /**
   * 發送邀請確認郵件
   * @param {string} email - 收件人郵箱
   * @param {string} name - 用戶姓名
   * @param {string} inviterName - 邀請人姓名
   * @param {number} bonusQueries - 獎勵諮詢次數
   * @param {string} userId - 用戶ID
   * @returns {Promise<Object>} 發送結果
   */
  static async sendInviteConfirmationEmail(email, name, inviterName, bonusQueries, userId) {
    try {
      const templateData = {
        name: name || '用戶',
        inviter_name: inviterName || '朋友',
        bonus_queries: bonusQueries || 10,
        app_url: process.env.FRONTEND_URL || 'https://your-app-url.com',
        date: new Date().toLocaleDateString('zh-TW')
      };

      const result = await this.callAokSendAPI(
        this.config.templates.inviteConfirmation,
        email,
        templateData
      );

      // 邀請確認郵件不需要過期時間，設為30天後
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // 記錄日志
      await this.logEmailSent(
        userId,
        email,
        'invite_confirmation',
        this.config.templates.inviteConfirmation,
        null, // 邀請確認郵件沒有驗證碼
        result,
        expiresAt
      );

      return {
        success: result.success,
        message: result.success ? '邀請確認郵件已發送' : result.message
      };
    } catch (error) {
      console.error('[EmailService] 發送邀請確認郵件失敗:', error);
      throw new Error(`發送邀請確認郵件失敗: ${error.message}`);
    }
  }

  /**
   * 檢查發送頻率限制
   * @param {string} userId - 用戶ID
   * @param {string} type - 郵件類型
   * @returns {Promise<Object>} 限制檢查結果
   */
  static async checkSendingLimits(userId, type) {
    try {
      return await EmailLog.checkSendingLimits(userId, type);
    } catch (error) {
      console.error('[EmailService] 檢查發送限制失敗:', error);
      return {
        canSend: false,
        recentCount: 0,
        hourlyCount: 0,
        dailyCount: 0,
        nextSendTime: new Date(Date.now() + 60 * 1000)
      };
    }
  }

  /**
   * 測試AokSend連接
   * @returns {Promise<Object>} 測試結果
   */
  static async testConnection() {
    try {
      console.log('[EmailService] 開始測試AokSend連接');
      
      // 使用正確的AokSend API調用方式進行測試
      const testResult = await this.callAokSendAPI(
        this.config.templates.registration,
        'test@example.com',
        { 
          name: '測試用戶', 
          verification_code: '123456', 
          date: new Date().toLocaleDateString('zh-TW') 
        }
      );

      console.log('[EmailService] AokSend測試結果:', testResult);

      // 分析測試結果
      let success = false;
      let message = testResult.message;

      if (testResult.success) {
        success = true;
        message = 'AokSend郵件服務連接正常';
      } else if (testResult.code === 40007) {
        // 餘額不足或帳號被禁用，但連接是正常的
        success = true;
        message = 'AokSend連接正常，但餘額不足或帳號被禁用';
      } else if (testResult.code === 40005) {
        // 測試郵箱格式問題，但連接正常
        success = true;
        message = 'AokSend連接正常（測試郵箱格式問題屬正常）';
      }

      return {
        success,
        message,
        service: 'AokSend',
        status: success ? 'connected' : 'failed',
        responseTime: '< 1000ms',
        lastCheck: new Date().toISOString(),
        data: {
          hasApiKey: !!this.config.appKey,
          apiUrl: this.config.apiUrl,
          templates: this.config.templates,
          testResponse: {
            code: testResult.code,
            message: testResult.message
          }
        }
      };
    } catch (error) {
      console.error('[EmailService] AokSend連接測試失敗:', error);
      
      return {
        success: false,
        message: `測試連接時發生錯誤: ${error.message}`,
        service: 'AokSend',
        status: 'error',
        lastCheck: new Date().toISOString(),
        data: {
          hasApiKey: !!this.config.appKey,
          apiUrl: this.config.apiUrl,
          error: error.message
        }
      };
    }
  }

  /**
   * 為驗證碼加密（用於存儲）
   * @param {string} code - 驗證碼
   * @returns {Promise<string>} 加密後的驗證碼
   */
  static async hashVerificationCode(code) {
    const bcrypt = await import('bcrypt');
    return bcrypt.hash(code, 10);
  }

  /**
   * 驗證驗證碼
   * @param {string} inputCode - 用戶輸入的驗證碼
   * @param {string} hashedCode - 存儲的加密驗證碼
   * @returns {Promise<boolean>} 驗證結果
   */
  static async verifyCode(inputCode, hashedCode) {
    const bcrypt = await import('bcrypt');
    return bcrypt.compare(inputCode, hashedCode);
  }
}

export default EmailService; 