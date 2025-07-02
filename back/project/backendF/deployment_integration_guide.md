# 勞法通AI後端部署與前端整合指南

## 1. 部署環境設置

### 1.1 環境變量配置

創建 `.env` 文件，包含以下環境變量：

```
# 服務器配置
PORT=3001
NODE_ENV=development

# 數據庫配置
MONGODB_URI=mongodb://root:8w2kv62n@aialabr-mongodb.ns-2rlrcc3k.svc:27017
MONGODB_URI_EXTERNAL=mongodb://root:8w2kv62n@dbconn.sealosgzg.site:46203/?directConnection=true

# JWT配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# 跨域配置
FRONTEND_URL=http://userai-laborlaw.ns-2rlrcc3k.svc.cluster.local:3000
FRONTEND_URL_EXTERNAL=https://iztxzvmtxzzc.sealosgzg.site

# AI聊天服務配置
AI_WEBHOOK_URL=https://andyaiauto.zeabur.app/webhook/5cc76a7e-2e6a-4428-ba09-cbe8f8598f9b/chat
```

### 1.2 Sealos雲服務器部署

1. **準備部署**

```bash
# 克隆代碼庫 (如果尚未完成)
git clone https://your-repo-url/ailaborlaw-backend.git
cd ailaborlaw-backend

# 安裝依賴
npm install

# 安裝PM2
npm install pm2 -g
```

2. **啟動服務**

```bash
# 使用PM2啟動服務
pm2 start src/server.js --name ailaborlaw-backend

# 設置開機自啟
pm2 startup
pm2 save
```

3. **配置持續集成部署腳本**

創建 `deploy.sh` 腳本：

```bash
#!/bin/bash

# 進入專案目錄
cd /home/devbox/ailaborlaw-backend

# 拉取最新代碼
git pull

# 安裝依賴
npm install

# 重啟服務
pm2 restart ailaborlaw-backend || pm2 start src/server.js --name ailaborlaw-backend

echo "部署完成！"
```

### 1.3 Docker部署（備選方案）

1. **創建Dockerfile**

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["node", "src/server.js"]
```

2. **使用Docker Compose**

```yaml
# docker-compose.yml
version: '3'

services:
  backend:
    build: .
    ports:
      - "3001:3001"
    env_file:
      - .env
    depends_on:
      - mongodb
    restart: always

  mongodb:
    image: mongo:4.4
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=root
      - MONGO_INITDB_ROOT_PASSWORD=8w2kv62n
    ports:
      - "27017:27017"
    restart: always

volumes:
  mongo_data:
```

## 2. 前端整合指南

### 2.1 API服務配置

在前端專案中創建或修改API服務文件：

```javascript
// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ailabordevbox.ns-2rlrcc3k.svc.cluster.local:3001/api/v1';

// 通用HTTP請求方法
const request = async (url, options = {}) => {
  try {
    // 準備請求頭
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // 添加認證令牌
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 發送請求
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers
    });
    
    // 解析JSON回應
    const data = await response.json();
    
    // 檢查回應狀態
    if (!response.ok) {
      throw new Error(data.message || '請求失敗');
    }
    
    return data;
  } catch (error) {
    console.error('API請求錯誤:', error);
    throw error;
  }
};

// 封裝常用請求方法
export default {
  get: (url) => request(url, { method: 'GET' }),
  post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (url, body) => request(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: 'DELETE' }),
};
```

### 2.2 整合認證服務

修改現有的 `auth.js` 文件：

```javascript
// src/services/auth.js
import api from './api';

// 用戶登入
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.success) {
      // 存儲認證信息
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('auth_user', JSON.stringify(response.data.user));
      localStorage.setItem('auth_user_id', response.data.user.id);
    }
    
    return response;
  } catch (error) {
    console.error('登入失敗:', error);
    throw error;
  }
};

// 用戶註冊
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    if (response.success) {
      // 存儲認證信息
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('auth_user', JSON.stringify(response.data.user));
      localStorage.setItem('auth_user_id', response.data.user.id);
    }
    
    return response;
  } catch (error) {
    console.error('註冊失敗:', error);
    throw error;
  }
};

// 用戶登出
export const logout = () => {
  // 清除本地存儲的認證信息
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_user_id');
  
  // 重定向到登入頁面
  window.location.href = '/login';
};

// 檢查用戶是否已登入
export const isAuthenticated = () => {
  return localStorage.getItem('auth_token') !== null;
};

// 獲取當前用戶信息
export const getCurrentUser = () => {
  const userJson = localStorage.getItem('auth_user');
  return userJson ? JSON.parse(userJson) : null;
};
```

### 2.3 整合用戶資料服務

修改 `userService.js` 文件：

```javascript
// src/services/userService.js
import api from './api';
import { getCurrentUser } from './auth';

// 獲取用戶資料
export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    
    if (response.success) {
      // 更新本地存儲的用戶信息
      localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    }
    
    return response.data.user;
  } catch (error) {
    console.error('獲取用戶資料失敗:', error);
    throw error;
  }
};

// 更新用戶資料
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/users/profile', userData);
    
    if (response.success) {
      // 更新本地存儲的用戶信息
      localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    }
    
    return response.data.user;
  } catch (error) {
    console.error('更新用戶資料失敗:', error);
    throw error;
  }
};

// 獲取剩餘諮詢次數
export const getRemainingQueries = async () => {
  try {
    const response = await api.get('/users/remaining-queries');
    
    if (response.success) {
      // 更新本地用戶對象中的諮詢次數
      const user = getCurrentUser();
      if (user) {
        user.remainingQueries = response.data.remainingQueries;
        user.totalConsultations = response.data.totalConsultations;
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
    }
    
    return {
      remainingQueries: response.data.remainingQueries,
      totalConsultations: response.data.totalConsultations
    };
  } catch (error) {
    console.error('獲取剩餘諮詢次數失敗:', error);
    throw error;
  }
};

// 扣減諮詢次數
export const decreaseQuery = async () => {
  try {
    const response = await api.post('/users/decrease-query');
    
    if (response.success) {
      // 更新本地用戶對象中的諮詢次數
      const user = getCurrentUser();
      if (user) {
        user.remainingQueries = response.data.remainingQueries;
        user.totalConsultations = response.data.totalConsultations;
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
    }
    
    return {
      remainingQueries: response.data.remainingQueries,
      totalConsultations: response.data.totalConsultations
    };
  } catch (error) {
    console.error('扣減諮詢次數失敗:', error);
    throw error;
  }
};
```

### 2.4 整合聊天服務

修改 `chatService.js` 文件：

```javascript
// src/services/chatService.js
import api from './api';

// 獲取會話列表
export const getConversations = async () => {
  try {
    const response = await api.get('/conversations');
    return response.data.conversations;
  } catch (error) {
    console.error('獲取會話列表失敗:', error);
    throw error;
  }
};

// 創建新會話
export const createConversation = async (title = '新的對話') => {
  try {
    const response = await api.post('/conversations', { title });
    return response.data.conversation;
  } catch (error) {
    console.error('創建會話失敗:', error);
    throw error;
  }
};

// 獲取會話詳情
export const getConversation = async (conversationId) => {
  try {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('獲取會話詳情失敗:', error);
    throw error;
  }
};

// 更新會話標題
export const updateConversationTitle = async (conversationId, title) => {
  try {
    const response = await api.put(`/conversations/${conversationId}`, { title });
    return response.data.conversation;
  } catch (error) {
    console.error('更新會話標題失敗:', error);
    throw error;
  }
};

// 删除會話
export const deleteConversation = async (conversationId) => {
  try {
    await api.delete(`/conversations/${conversationId}`);
    return true;
  } catch (error) {
    console.error('删除會話失敗:', error);
    throw error;
  }
};

// 發送消息
export const sendMessage = async (conversationId, content) => {
  try {
    const response = await api.post(`/conversations/${conversationId}/messages`, { content });
    return response.data;
  } catch (error) {
    console.error('發送消息失敗:', error);
    throw error;
  }
};

// 獲取消息列表
export const getMessages = async (conversationId, limit = 50, before = null) => {
  try {
    let url = `/conversations/${conversationId}/messages?limit=${limit}`;
    if (before) {
      url += `&before=${before}`;
    }
    
    const response = await api.get(url);
    return response.data.messages;
  } catch (error) {
    console.error('獲取消息列表失敗:', error);
    throw error;
  }
};

// 提供消息反饋
export const provideFeedback = async (conversationId, messageId, feedback) => {
  try {
    const response = await api.post(`/conversations/${conversationId}/messages/${messageId}/feedback`, { feedback });
    return response.data.message;
  } catch (error) {
    console.error('提供反饋失敗:', error);
    throw error;
  }
};
```

### 2.5 整合專家諮詢服務

創建 `consultationService.js` 文件：

```javascript
// src/services/consultationService.js
import api from './api';

// 提交專家諮詢請求
export const submitConsultation = async (consultationData) => {
  try {
    const response = await api.post('/consultations', consultationData);
    return response.data.consultation;
  } catch (error) {
    console.error('提交諮詢請求失敗:', error);
    throw error;
  }
};

// 獲取用戶諮詢列表
export const getUserConsultations = async () => {
  try {
    const response = await api.get('/consultations');
    return response.data.consultations;
  } catch (error) {
    console.error('獲取諮詢列表失敗:', error);
    throw error;
  }
};

// 獲取諮詢詳情
export const getConsultationDetails = async (consultationId) => {
  try {
    const response = await api.get(`/consultations/${consultationId}`);
    return response.data.consultation;
  } catch (error) {
    console.error('獲取諮詢詳情失敗:', error);
    throw error;
  }
};

// 取消諮詢請求
export const cancelConsultation = async (consultationId) => {
  try {
    const response = await api.patch(`/consultations/${consultationId}/cancel`);
    return response.data.consultation;
  } catch (error) {
    console.error('取消諮詢請求失敗:', error);
    throw error;
  }
};
```

## 3. 整合測試指南

### 3.1 後端API測試

使用 Postman 或類似工具測試後端API端點：

1. **設置環境變量**：
   - `BASE_URL`: http://ailabordevbox.ns-2rlrcc3k.svc.cluster.local:3001/api/v1
   - `TOKEN`: 用於存儲認證令牌

2. **測試流程**：
   - 註冊新用戶 → 獲取令牌
   - 使用令牌訪問需要認證的端點
   - 驗證響應格式和狀態碼

### 3.2 前端整合測試

1. **確保環境配置**：
   - 在前端專案中設置正確的API基礎URL
   - 在.env文件中添加 `VITE_API_BASE_URL=http://ailabordevbox.ns-2rlrcc3k.svc.cluster.local:3001/api/v1`

2. **測試步驟**：
   - 註冊和登入流程
   - 用戶資料獲取和更新
   - 會話創建和消息發送
   - 專家諮詢提交

## 4. 常見問題與解決方案

### 4.1 跨域問題

如果遇到跨域請求問題，請檢查：

1. **後端CORS配置**：
   - 確保已正確配置CORS中間件
   - 確保allowedOrigins包含前端域名

2. **前端請求頭**：
   - 不要手動添加`Origin`頭
   - 對於需要認證的請求，設置`credentials: 'include'`

### 4.2 認證問題

如果遇到認證問題：

1. **令牌存儲**：
   - 確保正確存儲JWT令牌
   - 檢查`localStorage`中的令牌格式

2. **令牌傳遞**：
   - 確保在請求頭中正確添加 `Authorization: Bearer <token>`
   - 檢查令牌是否過期

### 4.3 數據一致性問題

處理前端本地存儲與後端數據一致性：

1. **同步策略**：
   - 定期從後端刷新用戶數據
   - 使用樂觀更新策略

2. **錯誤處理**：
   - 實施透明的重試機制
   - 提供用戶友好的錯誤消息

## 5. 部署後檢查清單

確保後端服務正確部署的檢查清單：

- [ ] 數據庫連接成功
- [ ] API端點可訪問
- [ ] 認證流程正常工作
- [ ] CORS配置正確
- [ ] 日誌記錄正常
- [ ] 錯誤處理機制正常
- [ ] 環境變量正確配置
- [ ] 服務器安全措施已實施

## 6. 結論

本文檔提供了勞法通AI後端服務的部署指南和前端整合建議。按照這些步驟，開發團隊可以順利完成後端服務的部署和前端整合，確保系統的穩定運行。

建議按照以下順序進行整合：

1. 部署後端服務
2. 整合認證功能
3. 整合用戶資料管理
4. 整合聊天功能
5. 整合專家諮詢功能
6. 進行全面測試

隨著專案的發展，可能需要進一步擴展和優化API。建議定期檢查API設計，確保其滿足前端的需求，並在必要時進行適當的調整和擴展。 