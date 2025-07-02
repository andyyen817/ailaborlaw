/**
 * 聊天服務
 * 提供與AI勞基法顧問的通信功能
 */

// AI聊天的webhook URL (基礎URL，不帶查詢參數)
const CHAT_WEBHOOK_BASE_URL = 'https://andyaiauto.zeabur.app/webhook/5cc76a7e-2e6a-4428-ba09-cbe8f8598f9b/chat';

/**
 * 檢測當前環境是否為移動設備
 * @returns {boolean} - 是否為移動設備
 */
function isMobile() {
  // 檢查當前窗口寬度是否小於768px（常見的移動設備斷點）
  const isMobileWidth = window.innerWidth < 768;
  
  // 檢查當前URL路徑是否包含移動版標記
  const isMobilePath = window.location.pathname.includes('/mobile') || 
                      window.location.pathname.includes('/m/');
  
  // 如果窗口尺寸是移動尺寸或URL路徑表明這是移動版，返回true
  return isMobileWidth || isMobilePath;
}

// 觸發內部同步事件，用於同步PC和移動端的對話歷史
function triggerSyncEvent(action, data) {
  try {
    const syncEvent = new CustomEvent('chat:sync', {
      detail: { action, data, timestamp: new Date().getTime() }
    });
    window.dispatchEvent(syncEvent);
    console.log('觸發同步事件:', action, data);
  } catch (error) {
    console.error('觸發同步事件失敗:', error);
  }
}

// 模擬回复（當API連接失敗時使用）
const FALLBACK_RESPONSES = [
  {
    response: '根據台灣《勞動基準法》第39條規定，雇主每7天應給勞工至少1天的例假。這是強制規定，即使勞工同意也不得取消。',
    reference: '《勞動基準法》第39條'
  },
  {
    response: '依據《勞動基準法》第36條，勞工每7日中應有2日之休息，其中1日為例假，1日為休息日。若由於天災、事變或突發事件需在休息日工作，雇主應加倍發給工資。',
    reference: '《勞動基準法》第36條'
  },
  {
    response: '根據《勞動基準法》第24條規定，延長工作時間在2小時以內者，加給1/3工資；超過2小時者，加給2/3工資。在休息日工作則有不同的加給標準。',
    reference: '《勞動基準法》第24條'
  },
  {
    response: '依照《勞動基準法》第38條規定，勞工在同一雇主或事業單位，繼續工作滿一定期間者，應依下列規定給予特別休假：六個月以上一年未滿者，三日；一年以上二年未滿者，七日；以此類推。',
    reference: '《勞動基準法》第38條'
  },
  {
    response: '《勞動基準法》第9條規定，勞動契約，分為定期契約及不定期契約。臨時性、短期性、季節性及特定性工作得為定期契約；有繼續性工作應為不定期契約。',
    reference: '《勞動基準法》第9條'
  }
];

// 獲取或生成會話ID
function getOrCreateSessionId() {
  // 首先嘗試從localStorage獲取
  let sessionId = localStorage.getItem('chatSessionId');
  
  if (!sessionId) {
    // 如果不存在，檢查是否有基於conversationId的sessionId映射
    const conversationId = getCurrentConversationIdFromUrl();
    if (conversationId) {
      // 如果URL中有conversationId，使用它作為sessionId
      sessionId = conversationId;
      localStorage.setItem('chatSessionId', sessionId);
      console.log('從URL獲取conversationId作為sessionId:', sessionId);
    } else {
      // 生成一個簡單的UUID
      sessionId = 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('chatSessionId', sessionId);
      console.log('生成新的sessionId:', sessionId);
    }
  }
  
  return sessionId;
}

// 從URL獲取當前會話ID
function getCurrentConversationIdFromUrl() {
  // 解析URL查詢參數
  const urlParams = new URLSearchParams(window.location.search);
  // 獲取'id'參數值作為conversationId
  const conversationId = urlParams.get('id');
  
  if (conversationId) {
    console.log('從URL獲取conversationId:', conversationId);
  }
  
  return conversationId;
}

// 統一獲取用戶ID的方法 - 與conversationService保持一致
function getUserId() {
  // 優先使用auth_user_id(新的標準方式)
  let userId = localStorage.getItem('auth_user_id');
  
  // 如果沒有auth_user_id，嘗試從auth_user獲取
  if (!userId) {
    try {
      const authUserStr = localStorage.getItem('auth_user');
      if (authUserStr) {
        const authUser = JSON.parse(authUserStr);
        if (authUser && authUser.id) {
          userId = authUser.id;
          // 存儲到標準位置
          localStorage.setItem('auth_user_id', userId);
          console.log('從auth_user獲取並設置userId:', userId);
        }
      }
    } catch (e) {
      console.error('解析auth_user時出錯:', e);
    }
  }
  
  // 最後嘗試使用舊的userId格式(作為後備)
  if (!userId) {
    userId = localStorage.getItem('userId');
    if (userId) {
      // 將舊格式的userId遷移到新格式
      localStorage.setItem('auth_user_id', userId);
      console.log('從舊格式遷移userId:', userId);
    }
  }
  
  // 如果以上都沒有，生成訪客ID
  if (!userId) {
    userId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('userId', userId); // 為兼容性保留舊格式
    console.log('設置臨時guest userId:', userId);
  }
  
  return userId;
}

// 修改getUserName方法使用統一的getUserId函數
function getUserName() {
  const userId = getUserId();
  
  // 嘗試從auth_user獲取用戶名稱
  try {
    const authUserStr = localStorage.getItem('auth_user');
    if (authUserStr) {
      const authUser = JSON.parse(authUserStr);
      if (authUser && authUser.name) {
        return authUser.name;
      }
    }
  } catch (e) {
    console.error('解析auth_user獲取用戶名失敗:', e);
  }
  
  // 如果沒有，則使用用戶ID的一部分作為顯示名稱
  return userId ? `用戶${userId.slice(-6)}` : '訪客';
}

// 添加getUserNickname作為getUserName的別名，以修復ChatView.vue中的調用
function getUserNickname() {
  return getUserName();
}

/**
 * 載入之前的聊天會話
 * @returns {Promise<Object>} - 含有之前會話的Promise
 */
async function loadPreviousSession() {
  // 獲取會話ID
  const sessionId = getOrCreateSessionId();
  
  // 獲取用戶暱稱
  const nickname = getUserName();
  
  try {
    // 構建完整URL，包含action參數
    const url = `${CHAT_WEBHOOK_BASE_URL}?action=loadPreviousSession`;
    
    console.log('載入之前會話，發送請求到:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: sessionId,
        metadata: {
          nickname: nickname
        }
      })
    });
    
    const data = await response.json();
    console.log('載入之前會話的回應:', data);
    
    return data;
  } catch (error) {
    console.error('載入之前會話時出錯:', error);
    return { error: '無法載入之前的會話' };
  }
}

/**
 * 發送用戶消息到AI並獲取回覆
 * @param {string} message - 用戶消息
 * @param {string} conversationId - 會話ID（可選）
 * @returns {Promise<Object>} - AI回覆
 */
async function sendMessageToAI(message, conversationId) {
  try {
    // 檢查當前設備類型
    const deviceType = isMobile() ? 'mobile' : 'desktop';
    
    console.log('發送請求到n8n webhook:', CHAT_WEBHOOK_BASE_URL, { 
      sessionId: getOrCreateSessionId(), 
      chatInput: message, 
      metadata: { 
        nickname: getUserName(), 
        platform: deviceType, 
        userAgent: navigator.userAgent, 
        timestamp: new Date().toISOString() 
      }
    });
    
    // 準備用戶元數據
    const metadata = {
      nickname: getUserName(),
      platform: deviceType,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
    
    // 使用會話ID或創建一個
    // 優先使用傳入的conversationId
    let sessionId = conversationId || localStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 20);
      localStorage.setItem('chat_session_id', sessionId);
    }
    
    // 構建請求體
    const requestBody = {
      sessionId,
      chatInput: message,
      metadata
    };
    
    console.log('请求体详情:', JSON.stringify(requestBody));
    
    // 發送請求到AI處理端點
    const webhookUrl = `${CHAT_WEBHOOK_BASE_URL}?action=sendMessage`;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    // 檢查響應狀態
    if (!response.ok) {
      throw new Error(`API請求失敗: ${response.status} ${response.statusText}`);
    }
    
    // 解析響應數據
    const data = await response.json();
    console.log('n8n webhook回應:', data);
    
    // 返回格式化的回覆
    return {
      response: data.text,
      reference: data.reference || null
    };
  } catch (error) {
    console.error('發送消息到AI服務失敗:', error);
    throw error;
  }
}

/**
 * 發送消息並管理會話同步
 * @param {string} message - 用戶消息內容
 * @param {string} conversationId - 會話ID
 * @returns {Promise<Object>} - 包含AI回覆的Promise
 */
async function sendMessage(message, conversationId) {
  try {
    if (!conversationId) {
      console.warn('沒有提供 conversationId，將使用隨機生成的 SessionId');
      conversationId = 'conv_' + Math.random().toString(36).substr(2, 10) + Date.now().toString(36);
    }
    
    console.log(`發送消息到 AI 服務，conversationId: ${conversationId}`);
    
    // 確保獲取正確的用戶身份 - 最高優先級使用auth_user對象
    let userId = null;
    let userEmail = null;
    
    try {
      const authUser = JSON.parse(localStorage.getItem('auth_user'));
      if (authUser && authUser.id) {
        userId = authUser.id;
        userEmail = authUser.email || null;
        console.log(`從auth_user對象中獲取用戶信息 - ID: ${userId}, Email: ${userEmail}`);
      }
    } catch (e) {
      console.error('解析auth_user獲取userId時出錯:', e);
    }
    
    // 如果auth_user不存在或解析失敗，退回到auth_user_id
    if (!userId) {
      userId = localStorage.getItem('auth_user_id');
      console.log('使用localStorage.auth_user_id作為備用:', userId);
    }
    
    // 最後的備用選項是userId
    if (!userId) {
      userId = localStorage.getItem('userId');
      console.warn('找不到auth_user_id，使用localStorage.userId作為最後備用:', userId);
    }
    
    if (!userId) {
      console.warn('找不到任何用戶ID，無法準確關聯聊天記錄和扣減諮詢次數');
      userId = 'guest_' + Date.now(); // 生成臨時訪客ID以避免系統錯誤
    }
    
    // 嘗試扣減諮詢次數 - 僅對已登錄用戶
    if (userId && !userId.startsWith('guest_')) {
      try {
        // 動態導入userService以避免循環依賴
        const userServiceModule = await import('@/services/userService');
        const userService = userServiceModule.default;
        
        // 使用確認的userId扣減諮詢次數
        const deductionResult = await userService.decreaseRemainingQueries(userId);
        if (!deductionResult) {
          console.warn(`用戶(${userId})諮詢次數扣減失敗，可能剩餘次數不足`);
        } else {
          console.log(`用戶(${userId})諮詢次數扣減成功`);
        }
      } catch (deductError) {
        console.error('扣減諮詢次數時出錯:', deductError);
      }
    }
    
    // 發送消息到AI服務
    const response = await sendMessageToAI(message, conversationId);
    
    // 生成回應時間戳
    const responseTimestamp = new Date();
    
    // 設置間隔確保只觸發一次事件
    setTimeout(() => {
      console.log('延遲觸發同步事件，確保只觸發一次');
      // 觸發同步事件，通知其他界面更新
      triggerSyncEvent('new_message', {
        conversationId,
        message: {
          type: 'ai',
          content: response.response,
          timestamp: responseTimestamp.toISOString(),
          messageId: `ai_${Date.now()}`  // 添加唯一ID
        }
      });
    }, 100);
    
    // 格式化返回數據，讓界面能夠正確顯示
    return {
      text: response.response,
      reference: response.reference,
      isFallback: false,
      timestamp: responseTimestamp.toISOString()
    };
  } catch (error) {
    console.error('發送消息失敗:', error);
    
    // 觸發錯誤同步事件
    triggerSyncEvent('error', {
      conversationId,
      error: error.message || '發送消息失敗'
    });
    
    throw error;
  }
}

/**
 * 獲取webhook基礎URL
 * @returns {string} - webhook基礎URL
 */
function getWebhookBaseUrl() {
  return CHAT_WEBHOOK_BASE_URL;
}

export default {
  sendMessageToAI,
  sendMessage,
  loadPreviousSession,
  getUserName,
  getUserNickname,
  getWebhookBaseUrl,
  isMobile,
  getOrCreateSessionId,
  getCurrentConversationIdFromUrl
}; 