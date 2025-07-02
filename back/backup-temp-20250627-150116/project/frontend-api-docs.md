# AI勞基法顧問前端API使用指南

## 前端開發人員需要知道的信息

### API基礎設定
- **後端公網地址**：https://wrrfvodsaofk.sealosgzg.site
- **API端點前綴**：/api/v1
- **完整API基礎URL**：https://wrrfvodsaofk.sealosgzg.site/api/v1
- **測試工具**：可通過訪問 https://wrrfvodsaofk.sealosgzg.site/test-api 使用API測試頁面

### 環境變量配置
請在前端項目的環境變量文件中設置：

```
# .env 文件
VITE_API_BASE_URL=https://wrrfvodsaofk.sealosgzg.site/api/v1
```

### 管理員賬戶信息
- **超級管理員賬戶**
  - 用戶名: admin
  - 郵箱: test@ailaborlaw.com
  - 密碼: Test1234
  - 角色: super_admin

- **普通管理員賬戶**
  - 用戶名: newadmin
  - 郵箱: newadmin@ailaborlaw.com
  - 密碼: Admin1234
  - 角色: admin

### 可用的API端點

#### 認證相關
- **用戶註冊**：POST /api/v1/auth/register
  - 請求體：`{ "name": "用戶名", "email": "郵箱", "password": "密碼", "userType": "用戶類型", "profile": { "industry": "行業", "position": "職業" }, "inviteCode": "邀請碼" }`
  - 必填欄位：name, email, password
  - 可選欄位：userType, profile, inviteCode

- **用戶登入**：POST /api/v1/auth/login
  - 請求體：`{ "email": "郵箱", "password": "密碼" }`

- **管理員登入**：POST /api/v1/admin/auth/login
  - 請求體：`{ "email": "郵箱", "password": "密碼" }`
  - 測試帳號：test@ailaborlaw.com / Test1234

#### 用戶資料相關（需要認證）
- **獲取個人資料**：GET /api/v1/users/me
- **更新個人資料**：PUT /api/v1/users/me
  - 請求體：`{ "name": "新用戶名", "phone": "手機號碼", "company": "公司名稱", "industry": "行業", "position": "職業" }`
- **更新密碼**：PUT /api/v1/users/me/password
  - 請求體：`{ "currentPassword": "當前密碼", "newPassword": "新密碼" }`

#### 諮詢次數管理
- **獲取剩餘諮詢次數**：GET /api/v1/users/me (包含在用戶資料中)
- **使用一次諮詢**：POST /api/v1/users/me/queries/decrease
- **增加諮詢次數(管理員功能)**：POST /api/v1/admin/users/:userId/queries/increase
  - 請求體：`{ "amount": 數量 }`

#### 管理員API (需要管理員權限)
- **獲取用戶列表**：GET /api/v1/admin/users
  - 查詢參數：search, userType, status, dateRange, page, limit
- **獲取用戶詳情**：GET /api/v1/admin/users/:userId
- **創建用戶**：POST /api/v1/admin/users
- **更新用戶**：PUT /api/v1/admin/users/:userId
- **禁用用戶**：PATCH /api/v1/admin/users/:userId/disable
- **啟用用戶**：PATCH /api/v1/admin/users/:userId/enable
- **導出用戶數據**：GET /api/v1/admin/users/export

### 認證方式
- 所有需要認證的API都需要在請求頭中提供有效的JWT令牌
- 格式：`Authorization: Bearer {token}`
- 登入或註冊成功後會返回token

### API響應格式
所有API響應遵循統一格式：
```json
{
  "success": true,  // 操作是否成功
  "message": "操作成功消息",  // 提示信息
  "data": {  // 返回的數據
    // 具體內容因API而異
  }
}
```

錯誤響應格式：
```json
{
  "success": false,
  "message": "錯誤消息",
  "error": {
    "code": "ERROR_CODE",  // 錯誤代碼
    "details": "錯誤詳情"   // 詳細錯誤信息
  }
}
```

### 前端API調用範例

```javascript
// 創建API服務
const API = {
  BASE_URL: 'https://wrrfvodsaofk.sealosgzg.site/api/v1',
  AUTH_TOKEN_KEY: 'auth_token',
  USER_KEY: 'user_info'
};

// 添加認證令牌到請求
const getAuthHeaders = () => {
  const token = localStorage.getItem(API.AUTH_TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// 登入示例
async function login(email, password) {
  try {
    const response = await fetch(`${API.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    
    if (result.success) {
      localStorage.setItem(API.AUTH_TOKEN_KEY, result.data.token);
      localStorage.setItem(API.USER_KEY, JSON.stringify(result.data.user));
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      message: '網絡錯誤',
      error: { code: 'NETWORK_ERROR', details: error.message }
    };
  }
}

// 獲取用戶資料示例
async function getUserProfile() {
  try {
    const response = await fetch(`${API.BASE_URL}/users/me`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: '網絡錯誤',
      error: { code: 'NETWORK_ERROR', details: error.message }
    };
  }
}
```

### 注意事項
1. 使用公網URL解決Kubernetes集群中的DNS解析問題
2. 所有API請求必須使用HTTPS協議
3. 請確保正確配置跨域(CORS)請求，後端已設置允許前端域名訪問
4. 在開發和生產環境中，請使用相應的環境變量配置API基礎URL

---

所有問題已全部修復，前端現在可以順利對接後端API，包括完整的權限管理功能。 