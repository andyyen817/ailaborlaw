/**
 * 📧 郵箱驗證服務模組
 * 專門處理郵箱驗證相關的API請求
 * 支援註冊驗證、密碼重置、邀請確認三種驗證模式
 */

import api from './api.js';

// 郵箱驗證類型常量
export const EMAIL_VERIFICATION_TYPES = {
  REGISTRATION: 'registration',
  PASSWORD_RESET: 'password_reset', 
  INVITE_CONFIRMATION: 'invite_confirmation'
};

// 錯誤代碼映射 - 將後端錯誤代碼轉換為用戶友好的繁體中文提示
const ERROR_CODE_MESSAGES = {
  'EMAIL_NOT_FOUND': '此郵箱地址尚未註冊',
  'EMAIL_ALREADY_EXISTS': '此郵箱地址已經註冊',
  'EMAIL_ALREADY_VERIFIED': '此郵箱已經驗證完成',
  'VERIFICATION_CODE_INVALID': '驗證碼不正確，請重新輸入',
  'INVALID_VERIFICATION_CODE': '驗證碼不正確，請重新輸入', // API文檔中的錯誤代碼
  'VERIFICATION_CODE_EXPIRED': '驗證碼已過期，請重新發送',
  'VERIFICATION_CODE_USED': '此驗證碼已經使用過，請重新發送',
  'SEND_FREQUENCY_EXCEEDED': '發送過於頻繁，請稍後再試',
  'RATE_LIMIT_EXCEEDED': '發送過於頻繁，請稍後再試', // API文檔中的標準錯誤代碼
  'DAILY_LIMIT_EXCEEDED': '今日發送次數已達上限，請明日再試',
  'EMAIL_SERVICE_ERROR': '郵件發送服務暫時不可用，請稍後再試',
  'INVALID_EMAIL_FORMAT': '郵箱地址格式不正確',
  'INVITE_CODE_INVALID': '邀請碼無效或已過期',
  'INVITE_CODE_USED': '此邀請碼已經使用過',
  'PASSWORD_TOO_WEAK': '密碼強度不足，請使用更複雜的密碼',
  'USER_NOT_FOUND': '用戶不存在',
  'NETWORK_ERROR': '網絡連接失敗，請檢查網絡設置',
  'SERVER_ERROR': '服務器暫時不可用，請稍後再試',
  'UNKNOWN_ERROR': '發生未知錯誤，請聯繫客服'
};

// 頻率限制狀態管理
let sendAttempts = new Map(); // 存儲發送嘗試記錄
const RATE_LIMIT_WINDOW = 60 * 1000; // 60秒窗口

/**
 * 獲取用戶友好的錯誤信息
 * @param {string} errorCode - 後端返回的錯誤代碼
 * @param {string} fallbackMessage - 備用錯誤信息
 * @returns {string} 用戶友好的錯誤信息
 */
function getFriendlyErrorMessage(errorCode, fallbackMessage = '') {
  return ERROR_CODE_MESSAGES[errorCode] || fallbackMessage || ERROR_CODE_MESSAGES['UNKNOWN_ERROR'];
}

/**
 * 檢查發送頻率限制
 * @param {string} email - 郵箱地址
 * @param {string} type - 驗證類型
 * @returns {Object} 檢查結果，包含是否可以發送和剩餘時間
 */
function checkRateLimit(email, type) {
  const key = `${email}-${type}`;
  const now = Date.now();
  const lastSent = sendAttempts.get(key);
  
  if (lastSent && (now - lastSent) < RATE_LIMIT_WINDOW) {
    const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastSent)) / 1000);
    return {
      canSend: false,
      remainingTime: remainingTime,
      nextSendTime: new Date(lastSent + RATE_LIMIT_WINDOW)
    };
  }
  
  return {
    canSend: true,
    remainingTime: 0,
    nextSendTime: null
  };
}

/**
 * 記錄發送時間
 * @param {string} email - 郵箱地址
 * @param {string} type - 驗證類型
 */
function recordSendAttempt(email, type) {
  const key = `${email}-${type}`;
  sendAttempts.set(key, Date.now());
  
  // 清理過期記錄，避免內存洩漏
  setTimeout(() => {
    sendAttempts.delete(key);
  }, RATE_LIMIT_WINDOW * 2);
}

/**
 * 統一的API錯誤處理
 * @param {Error} error - 捕獲的錯誤
 * @param {string} defaultMessage - 默認錯誤信息
 * @returns {Error} 處理後的錯誤對象
 */
function handleApiError(error, defaultMessage = '操作失敗') {
  let friendlyMessage = defaultMessage;
  let errorCode = 'UNKNOWN_ERROR';
  
  if (error.data?.error?.code) {
    errorCode = error.data.error.code;
    friendlyMessage = getFriendlyErrorMessage(errorCode, error.data.message);
  } else if (error.message) {
    friendlyMessage = error.message;
  }
  
  // 根據HTTP狀態碼提供更具體的錯誤信息
  if (error.status) {
    switch (error.status) {
      case 400:
        friendlyMessage = error.data?.message || '請求參數錯誤';
        break;
      case 401:
        friendlyMessage = '身份驗證失敗，請重新登入';
        break;
      case 403:
        friendlyMessage = '權限不足，無法執行此操作';
        break;
      case 404:
        friendlyMessage = '請求的資源不存在';
        break;
      case 409:
        friendlyMessage = error.data?.message || '資源衝突';
        break;
      case 429:
        friendlyMessage = '請求過於頻繁，請稍後再試';
        break;
      case 500:
        friendlyMessage = '服務器內部錯誤';
        break;
      case 502:
      case 503:
      case 504:
        friendlyMessage = '服務暫時不可用，請稍後再試';
        break;
      default:
        if (error.status >= 500) {
          friendlyMessage = '服務器錯誤，請稍後再試';
        }
    }
  }
  
  // 創建新的錯誤對象
  const processedError = new Error(friendlyMessage);
  processedError.code = errorCode;
  processedError.status = error.status;
  processedError.originalError = error;
  
  // 如果是頻率限制錯誤，提取下次發送時間信息
  if (errorCode === 'RATE_LIMIT_EXCEEDED' && error.data?.error) {
    processedError.nextSendTime = error.data.error.nextSendTime;
    processedError.limits = error.data.error.limits;
  }
  
  return processedError;
}

/**
 * 網絡重試邏輯
 * @param {Function} apiCall - API調用函數
 * @param {number} maxRetries - 最大重試次數
 * @param {number} retryDelay - 重試延遲(毫秒)
 * @returns {Promise} 重試後的結果
 */
async function retryApiCall(apiCall, maxRetries = 2, retryDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // 如果是客戶端錯誤(4xx)，不進行重試
      if (error.status && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // 最後一次嘗試失敗
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 等待後重試
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }
  
  throw lastError;
}

// ===== 導出的API方法 =====

/**
 * 發送郵箱驗證碼
 * @param {string} email - 郵箱地址
 * @param {string} type - 驗證類型 (registration/password_reset/invite_confirmation)
 * @param {string} language - 語言偏好，默認為zh-TW
 * @param {Object} userData - 用戶數據（註冊類型時需要）
 * @returns {Promise<Object>} 發送結果
 */
export async function sendEmailVerification(email, type = EMAIL_VERIFICATION_TYPES.REGISTRATION, language = 'zh-TW', userData = null) {
  try {
    // 檢查輸入參數
    if (!email || !email.includes('@')) {
      throw new Error('請輸入有效的郵箱地址');
    }
    
    if (!Object.values(EMAIL_VERIFICATION_TYPES).includes(type)) {
      throw new Error('驗證類型不正確');
    }
    
    // 檢查發送頻率限制
    const rateCheck = checkRateLimit(email, type);
    if (!rateCheck.canSend) {
      const error = new Error(`發送過於頻繁，請等待 ${rateCheck.remainingTime} 秒後再試`);
      error.code = 'RATE_LIMITED';
      error.remainingTime = rateCheck.remainingTime;
      error.nextSendTime = rateCheck.nextSendTime;
      throw error;
    }
    
    // 準備API請求數據
    const requestData = {
      email: email.trim().toLowerCase(),
      type,
      language
    };
    
    // 如果是註冊類型，包含用戶數據
    if (type === EMAIL_VERIFICATION_TYPES.REGISTRATION && userData) {
      requestData.userData = userData;
    }
    
    // 發送API請求，使用重試機制
    const result = await retryApiCall(async () => {
      return await api.post('/auth/send-email-verification', requestData);
    });
    
    // 記錄發送時間
    recordSendAttempt(email, type);
    
    // 返回成功結果
    return {
      success: true,
      message: '驗證碼已發送至您的郵箱',
      data: {
        email: email.trim().toLowerCase(),
        type,
        expiresAt: result.data?.expiresAt,
        nextSendTime: result.data?.nextSendTime
      }
    };
    
  } catch (error) {
    throw handleApiError(error, '發送驗證碼失敗');
  }
}

/**
 * 驗證郵箱驗證碼
 * @param {string} email - 郵箱地址
 * @param {string} code - 6位驗證碼
 * @param {string} type - 驗證類型
 * @returns {Promise<Object>} 驗證結果
 */
export async function verifyEmail(email, code, type = EMAIL_VERIFICATION_TYPES.REGISTRATION) {
  try {
    // 檢查輸入參數
    if (!email || !email.includes('@')) {
      throw new Error('請輸入有效的郵箱地址');
    }
    
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      throw new Error('請輸入6位數字驗證碼');
    }
    
    if (!Object.values(EMAIL_VERIFICATION_TYPES).includes(type)) {
      throw new Error('驗證類型不正確');
    }
    
    // 發送驗證請求
    const result = await retryApiCall(async () => {
      return await api.post('/auth/verify-email', {
        email: email.trim().toLowerCase(),
        verificationCode: code.trim(),
        type
      });
    });
    
    return {
      success: true,
      message: '郵箱驗證成功',
      data: result.data
    };
    
  } catch (error) {
    throw handleApiError(error, '郵箱驗證失敗');
  }
}

/**
 * 驗證郵箱並完成註冊 (一步式註冊)
 * @param {string} email - 郵箱地址
 * @param {string} code - 6位驗證碼
 * @param {Object} userData - 用戶註冊數據
 * @returns {Promise<Object>} 驗證和註冊結果
 */
export async function verifyEmailAndRegister(email, code, userData) {
  try {
    // 檢查輸入參數
    if (!email || !email.includes('@')) {
      throw new Error('請輸入有效的郵箱地址');
    }
    
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      throw new Error('請輸入6位數字驗證碼');
    }
    
    if (!userData || !userData.name || !userData.password) {
      throw new Error('用戶數據不完整');
    }
    
    try {
      // 使用新的一步式API端點
      const result = await retryApiCall(async () => {
        return await api.post('/auth/verify-and-register', {
          email: email.trim().toLowerCase(),
          verificationCode: code.trim(),
          userData: {
            ...userData,
            email: email.trim().toLowerCase()
          }
        });
      });
      
      return {
        success: true,
        message: '註冊成功',
        data: result.data.data || result.data
      };
      
    } catch (apiError) {
      // 如果新API不存在，回退到舊API
      if (apiError.status === 404 || apiError.message.includes('not found')) {
        console.log('新API不存在，嘗試舊的一步式API');
        
        try {
          const result = await retryApiCall(async () => {
            return await api.post('/auth/verify-email-and-register', {
              email: email.trim().toLowerCase(),
              verificationCode: code.trim(),
              userData: {
                ...userData,
                email: email.trim().toLowerCase()
              }
            });
          });
          
          return {
            success: true,
            message: '註冊成功',
            data: result.data
          };
        } catch (oldApiError) {
          // 如果舊API也不存在，回退到兩步方案
          if (oldApiError.status === 404 || oldApiError.message.includes('not found')) {
            console.log('所有一步式API都不存在，使用兩步驗證方案');
            
            // 先驗證郵箱
            const verifyResult = await verifyEmail(email, code, EMAIL_VERIFICATION_TYPES.REGISTRATION);
            
            if (verifyResult.success) {
              // 然後創建用戶（使用外部API）
              const authService = await import('@/services/auth');
              const registerResult = await authService.default.register(userData);
              
              if (registerResult.success) {
                return {
                  success: true,
                  message: '註冊成功',
                  data: registerResult.data
                };
              } else {
                throw new Error('用戶創建失敗');
              }
            } else {
              throw new Error('郵箱驗證失敗');
            }
          } else {
            throw oldApiError;
          }
        }
      } else {
        throw apiError;
      }
    }
    
  } catch (error) {
    throw handleApiError(error, '註冊失敗');
  }
}

/**
 * 一步式驗證並註冊 (使用後端最新API)
 * @param {string} email - 郵箱地址
 * @param {string} code - 6位驗證碼
 * @param {Object} userData - 用戶註冊數據
 * @returns {Promise<Object>} 驗證和註冊結果
 */
export async function verifyAndRegister(email, code, userData) {
  try {
    // 參數驗證
    if (!email || !email.includes('@')) {
      throw new Error('請輸入有效的郵箱地址');
    }
    
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      throw new Error('請輸入6位數字驗證碼');
    }
    
    if (!userData || !userData.name || !userData.password) {
      throw new Error('用戶數據不完整，姓名和密碼為必填項');
    }
    
    // 密碼強度驗證
    if (userData.password.length < 8) {
      throw new Error('密碼長度至少需要8位');
    }
    
    // 調用後端一步式API - 支持邀請碼和普通註冊
    const requestData = {
      email: email.trim().toLowerCase(),
      verificationCode: code.trim(),
      userData: {
        name: userData.name.trim(),
        password: userData.password,
        industry: userData.industry || '',
        position: userData.position || ''
      }
    };
    
    // 如果有邀請碼，添加到userData中
    if (userData.inviteCode && userData.inviteCode.trim()) {
      requestData.userData.inviteCode = userData.inviteCode.trim();
    }
    
    const result = await retryApiCall(async () => {
      return await api.post('/auth/verify-and-register', requestData);
    });

    // 📊 API響應日誌（開發環境）
    if (import.meta.env.DEV) {
      console.log('📊 註冊API響應:', {
        success: result.success,
        message: result.message,
        hasToken: !!result.data?.token,
        hasUser: !!result.data?.user,
        hasInviteInfo: !!result.data?.inviteInfo
      });
    }

    // 檢查後端響應格式（根據實際API返回格式）
    if (result.success) {
      // ✅ 標準格式：{ success: true, message: "...", data: {...} }
      console.log('✅ 註冊成功，返回數據:', result.data);
      return {
        success: true,
        message: result.message || '註冊成功',
        data: result.data
      };
    } else {
      console.error('❌ 後端返回失敗:', {
        success: result.success,
        message: result.message,
        hasData: !!result.data,
        status: result.status
      });
      throw new Error(result.message || '驗證並註冊失敗');
    }
    
  } catch (error) {
    console.error('一步式驗證並註冊錯誤:', error);
    throw handleApiError(error, '驗證並註冊失敗');
  }
}

/**
 * 重新發送驗證碼
 * @param {string} email - 郵箱地址
 * @param {string} type - 驗證類型
 * @returns {Promise<Object>} 重發結果
 */
export async function resendVerification(email, type = EMAIL_VERIFICATION_TYPES.REGISTRATION) {
  try {
    // 檢查輸入參數
    if (!email || !email.includes('@')) {
      throw new Error('請輸入有效的郵箱地址');
    }
    
    // 檢查發送頻率限制
    const rateCheck = checkRateLimit(email, type);
    if (!rateCheck.canSend) {
      const error = new Error(`請等待 ${rateCheck.remainingTime} 秒後再重新發送`);
      error.code = 'RATE_LIMITED';
      error.remainingTime = rateCheck.remainingTime;
      error.nextSendTime = rateCheck.nextSendTime;
      throw error;
    }
    
    // 發送重發請求 - 直接調用發送驗證碼API
    const result = await retryApiCall(async () => {
      return await api.post('/auth/send-email-verification', {
        email: email.trim().toLowerCase(),
        type
      });
    });
    
    // 記錄發送時間
    recordSendAttempt(email, type);
    
    return {
      success: true,
      message: '驗證碼已重新發送',
      data: result.data
    };
    
  } catch (error) {
    throw handleApiError(error, '重新發送驗證碼失敗');
  }
}

/**
 * 檢查郵箱驗證狀態
 * @param {string} email - 郵箱地址
 * @returns {Promise<Object>} 驗證狀態
 */
export async function checkVerificationStatus(email) {
  try {
    if (!email || !email.includes('@')) {
      throw new Error('請輸入有效的郵箱地址');
    }
    
    const result = await retryApiCall(async () => {
      return await api.get('/auth/email-verification-status', {
        params: { email: email.trim().toLowerCase() }
      });
    });
    
    return {
      success: true,
      data: result.data
    };
    
  } catch (error) {
    throw handleApiError(error, '檢查驗證狀態失敗');
  }
}

/**
 * 發送密碼重置郵件
 * @param {string} email - 郵箱地址
 * @returns {Promise<Object>} 發送結果
 */
export async function sendPasswordReset(email) {
  try {
    if (!email || !email.includes('@')) {
      throw new Error('請輸入有效的郵箱地址');
    }
    
    // 檢查發送頻率限制
    const rateCheck = checkRateLimit(email, EMAIL_VERIFICATION_TYPES.PASSWORD_RESET);
    if (!rateCheck.canSend) {
      const error = new Error(`發送過於頻繁，請等待 ${rateCheck.remainingTime} 秒後再試`);
      error.code = 'RATE_LIMITED';
      error.remainingTime = rateCheck.remainingTime;
      error.nextSendTime = rateCheck.nextSendTime;
      throw error;
    }
    
    const result = await retryApiCall(async () => {
      return await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase()
      });
    });
    
    // 記錄發送時間
    recordSendAttempt(email, EMAIL_VERIFICATION_TYPES.PASSWORD_RESET);
    
    return {
      success: true,
      message: '密碼重置郵件已發送',
      data: result.data
    };
    
  } catch (error) {
    throw handleApiError(error, '發送密碼重置郵件失敗');
  }
}

/**
 * 重置密碼
 * @param {string} email - 郵箱地址
 * @param {string} code - 驗證碼
 * @param {string} newPassword - 新密碼
 * @returns {Promise<Object>} 重置結果
 */
export async function resetPassword(email, code, newPassword) {
  try {
    // 參數驗證
    if (!email || !email.includes('@')) {
      throw new Error('請輸入有效的郵箱地址');
    }
    
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      throw new Error('請輸入6位數字驗證碼');
    }
    
    if (!newPassword || newPassword.length < 8) {
      throw new Error('新密碼長度至少需要8位');
    }
    
    const result = await retryApiCall(async () => {
      return await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        verificationCode: code.trim(),
        newPassword
      });
    });
    
    return {
      success: true,
      message: '密碼重置成功',
      data: result.data
    };
    
  } catch (error) {
    throw handleApiError(error, '密碼重置失敗');
  }
}

/**
 * 邀請註冊驗證
 * @param {string} email - 郵箱地址
 * @param {string} code - 驗證碼
 * @param {string} inviteCode - 邀請碼
 * @returns {Promise<Object>} 驗證結果
 */
export async function verifyInviteRegistration(email, code, inviteCode) {
  try {
    // 參數驗證
    if (!email || !email.includes('@')) {
      throw new Error('請輸入有效的郵箱地址');
    }
    
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      throw new Error('請輸入6位數字驗證碼');
    }
    
    if (!inviteCode) {
      throw new Error('邀請碼不能為空');
    }
    
    const result = await retryApiCall(async () => {
      return await api.post('/auth/verify-invite-registration', {
        email: email.trim().toLowerCase(),
        verificationCode: code.trim(),
        inviteCode: inviteCode.trim()
      });
    });
    
    return {
      success: true,
      message: '邀請註冊驗證成功',
      data: result.data
    };
    
  } catch (error) {
    throw handleApiError(error, '邀請註冊驗證失敗');
  }
}

/**
 * 獲取剩餘發送冷卻時間
 * @param {string} email - 郵箱地址
 * @param {string} type - 驗證類型
 * @returns {Object} 冷卻時間信息
 */
export function getRemainingCooldown(email, type) {
  return checkRateLimit(email, type);
}

/**
 * 清理所有發送記錄 (用於測試或重置)
 */
export function clearSendAttempts() {
  sendAttempts.clear();
}

// 默認導出整個服務對象
export default {
  // API方法
  sendEmailVerification,
  verifyEmail,
  verifyEmailAndRegister,
  verifyAndRegister,
  resendVerification,
  checkVerificationStatus,
  sendPasswordReset,
  resetPassword,
  verifyInviteRegistration,
  
  // 工具方法
  getRemainingCooldown,
  clearSendAttempts,
  
  // 常量
  EMAIL_VERIFICATION_TYPES,
  ERROR_CODE_MESSAGES
}; 