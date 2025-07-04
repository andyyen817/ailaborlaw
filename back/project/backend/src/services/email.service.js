const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const EmailLog = require('../models/email_log.model.js');

class EmailService {
  static getConfig() {
    return {
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
  }

  static generateVerificationCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  static async hashVerificationCode(code) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(code, salt);
  }

  static async verifyCode(inputCode, hashedCode) {
    return bcrypt.compare(inputCode, hashedCode);
  }

  static async callAokSendAPI(templateId, email, templateData) {
    try {
      const config = this.getConfig();
      const requestData = {
        app_key: config.appKey,
        template_id: templateId,
        to: email,
        reply_to: config.replyTo,
        alias: config.alias,
        is_random: '1',
        data: JSON.stringify(templateData)
      };

      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(requestData)
      });

      const result = await response.json();

      if (result.code === 200) {
        return {
          success: true,
          code: result.code,
          message: result.message || '郵件發送成功'
        };
      } else {
        const errorMessage = this.getAokSendErrorMessage(result.code);
        return {
          success: false,
          code: result.code,
          message: errorMessage || result.message || '郵件發送失敗'
        };
      }
    } catch (error) {
      return {
        success: false,
        code: 50001,
        message: `網絡錯誤: ${error.message}`
      };
    }
  }

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

  static async sendRegistrationEmail(email, name, verificationCode, userId) {
    try {
      const config = this.getConfig();
      const templateData = {
        name: name || '用戶',
        verification_code: verificationCode,
        date: new Date().toLocaleDateString('zh-TW')
      };

      const result = await this.callAokSendAPI(
        config.templates.registration,
        email,
        templateData
      );

      return {
        success: result.success,
        message: result.success ? '註冊驗證郵件已發送' : result.message
      };
    } catch (error) {
      throw new Error(`發送註冊驗證郵件失敗: ${error.message}`);
    }
  }

  static async sendPasswordResetEmail(email, name, verificationCode, userId) {
    try {
      const config = this.getConfig();
      const templateData = {
        name: name || '用戶',
        verification_code: verificationCode,
        date: new Date().toLocaleDateString('zh-TW')
      };

      const result = await this.callAokSendAPI(
        config.templates.passwordReset,
        email,
        templateData
      );

      return {
        success: result.success,
        message: result.success ? '密碼重置郵件已發送' : result.message
      };
    } catch (error) {
      throw new Error(`發送密碼重置郵件失敗: ${error.message}`);
    }
  }
}

module.exports = EmailService; 