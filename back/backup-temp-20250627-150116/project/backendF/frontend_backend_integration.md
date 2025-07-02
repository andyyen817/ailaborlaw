# 勞法通AI前後端整合指南

## 1. 概述

本文檔提供前端與後端整合的具體步驟和建議，確保前端應用能夠順利地與後端 API 服務對接。勞法通AI系統使用基於 Express.js 的後端 API 和 Vue.js 前端應用，通過 RESTful API 進行通信。

## 2. API 基礎設置

### 2.1 API 基礎路徑

在前端創建統一的API調用服務：

```javascript
// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ailabordevbox.ns-2rlrcc3k.svc.cluster.local:3001/api/v1';

// 所有API請求都將使用這個基礎路徑
```

### 2.2 環境變量設置

在前端專案根目錄創建 `.env` 和 `.env.production` 文件：

```
# .env (開發環境)
VITE_API_BASE_URL=http://ailabordevbox.ns-2rlrcc3k.svc.cluster.local:3001/api/v1

# .env.production (生產環境)
VITE_API_BASE_URL=https://wrrfvodsaofk.sealosgzg.site/api/v1
```

## 3. 主要服務整合

### 3.1 認證服務 (auth.js)

```javascript
// 使用後端認證 API
import api from './api';

// 登入功能
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  
  if (response.success) {
    // 存儲認證信息
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    localStorage.setItem('auth_user_id', response.data.user.id);
  }
  
  return response;
};

// 註冊功能
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  
  if (response.success) {
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    localStorage.setItem('auth_user_id', response.data.user.id);
  }
  
  return response;
};

// 登出功能
export const logout = () => {
  // 標記登出過程中
  localStorage.setItem('logging_out', 'true');
  
  // 清除認證相關的localStorage數據
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_user_id');
  
  // 移除登出標記
  localStorage.removeItem('logging_out');
  
  // 重定向到登入頁面
  window.location.href = '/login?logout=true';
};
```

### 3.2 用戶服務 (userService.js)

```javascript
// 用戶資料管理
import api from './api';

// 獲取用戶資料
export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  
  if (response.success) {
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
  }
  
  return response.data.user;
};

// 更新用戶資料
export const updateUserProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  
  if (response.success) {
    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
  }
  
  return response.data.user;
};

// 扣減諮詢次數
export const decreaseRemainingQueries = async () => {
  const response = await api.post('/users/decrease-query');
  
  if (response.success) {
    // 更新本地用戶對象中的諮詢次數
    const user = JSON.parse(localStorage.getItem('auth_user'));
    if (user) {
      user.remaining_free_queries = response.data.remainingQueries;
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  }
  
  return response.success;
};
```

### 3.3 聊天服務 (chatService.js)

```javascript
// 聊天功能整合
import api from './api';

// 發送消息到後端
export const sendMessageToAI = async (message, conversationId) => {
  // 如果沒有提供會話ID，創建新會話
  if (!conversationId) {
    const newConversation = await api.post('/conversations', { title: message.substring(0, 30) });
    conversationId = newConversation.data.conversation.id;
  }
  
  // 發送消息
  const response = await api.post(`/conversations/${conversationId}/messages`, { content: message });
  
  return {
    conversationId,
    userMessage: response.data.userMessage,
    aiResponse: response.data.aiResponse
  };
};

// 獲取會話列表
export const getConversations = async () => {
  const response = await api.get('/conversations');
  return response.data.conversations;
};

// 獲取特定會話的消息
export const getConversationMessages = async (conversationId) => {
  const response = await api.get(`/conversations/${conversationId}`);
  return response.data.messages;
};

// 刪除會話
export const deleteConversation = async (conversationId) => {
  await api.delete(`/conversations/${conversationId}`);
  return true;
};
```

### 3.4 專家諮詢服務 (consultationService.js)

```javascript
// 專家諮詢功能整合
import api from './api';

// 提交專家諮詢請求
export const submitConsultation = async (consultationData) => {
  const response = await api.post('/consultations', consultationData);
  return response.data.consultation;
};

// 獲取用戶諮詢列表
export const getUserConsultations = async () => {
  const response = await api.get('/consultations');
  return response.data.consultations;
};

// 取消諮詢請求
export const cancelConsultation = async (consultationId) => {
  const response = await api.patch(`/consultations/${consultationId}/cancel`);
  return response.data.consultation;
};
```

## 4. 數據模型映射

為保持前後端數據結構一致，應關注以下映射：

### 4.1 用戶數據

後端 User 模型映射到前端：

| 後端字段 | 前端字段 | 說明 |
|---------|---------|-----|
| _id     | id      | 用戶唯一標識 |
| email   | email   | 用戶郵箱 |
| name    | name    | 用戶名稱 |
| occupation | occupation/position | 前端可能使用position |
| phoneNumber | phoneNumber | 電話號碼 |
| remainingQueries | remaining_free_queries | 剩餘諮詢次數 |

### 4.2 聊天會話數據

會話數據映射：

| 後端字段 | 前端字段 | 說明 |
|---------|---------|-----|
| _id     | id      | 會話唯一標識 |
| title   | title   | 會話標題 |
| preview | preview | 預覽文本 |
| lastMessageTime | lastMessageTime | 最後消息時間 |

## 5. 權限控制

### 5.1 登入狀態檢查

```javascript
// 檢查用戶是否已登入
export const isAuthenticated = () => {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('auth_user');
  return token && user;
};

// 檢查是否為管理員
export const isAdmin = () => {
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return false;
  
  const user = JSON.parse(userStr);
  return user.userType === 'admin';
};
```

### 5.2 路由守衛

在Vue Router中實現：

```javascript
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  
  if (requiresAuth && !isAuthenticated()) {
    next('/login');
  } else if (requiresAdmin && !isAdmin()) {
    next('/forbidden');
  } else {
    next();
  }
});
```

## 6. 錯誤處理

### 6.1 API錯誤處理

```javascript
// 通用錯誤處理
const handleApiError = (error) => {
  if (error.response) {
    // 服務器返回的錯誤
    const { status, data } = error.response;
    
    if (status === 401) {
      // 未授權，清除認證信息並跳轉登入頁
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login?session_expired=true';
    }
    
    return {
      success: false,
      message: data.message || '請求失敗',
      error: data.error || { code: 'UNKNOWN' }
    };
  }
  
  return {
    success: false,
    message: error.message || '網絡錯誤',
    error: { code: 'NETWORK_ERROR' }
  };
};
```

### 6.2 全局錯誤處理

在Vue應用中設置：

```javascript
app.config.errorHandler = (err, instance, info) => {
  console.error('應用錯誤:', err);
  // 可以集成錯誤報告服務
};
```

## 7. 測試與驗證

### 7.1 API測試流程

1. 使用後端提供的測試帳號登入
   - 測試郵箱: test@ailaborlaw.com
   - 測試密碼: Test1234

2. 檢查認證流程並獲取令牌

3. 使用令牌測試各項功能:
   - 用戶資料獲取與更新
   - 聊天會話創建與消息發送
   - 專家諮詢提交

### 7.2 整合問題檢查清單

- [ ] 認證令牌正確傳遞
- [ ] 用戶數據結構匹配
- [ ] 會話數據正確保存與讀取
- [ ] 諮詢次數扣減機制正常
- [ ] 跨域請求配置正確

## 8. 常見問題解決

### 8.1 刷新令牌問題

如果令牌過期，使用刷新令牌API:

```javascript
// 刷新認證令牌
export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh-token');
    
    if (response.success) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data.token;
  } catch (error) {
    console.error('刷新令牌失敗:', error);
    // 重定向到登入頁
    window.location.href = '/login?session_expired=true';
  }
};
```

### 8.2 本地數據同步

確保多標籤頁之間的數據同步：

```javascript
// 在應用啟動時添加事件監聽
window.addEventListener('storage', (event) => {
  // 當另一個標籤頁更改了localStorage中的認證信息時
  if (event.key === 'auth_token' && !event.newValue) {
    // 用戶已在另一個標籤頁登出
    window.location.reload();
  }
});
```

## 9. 結論

按照本整合指南，前端開發團隊可以有效地將Vue.js應用與後端Express API服務整合。此指南涵蓋了認證、用戶管理、聊天和專家諮詢等核心功能的整合方法。在實際開發過程中，建議保持與後端團隊的密切溝通，確保API設計與前端需求保持一致。 