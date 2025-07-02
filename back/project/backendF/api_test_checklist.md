# 勞法通AI後端API測試檢查清單

## 1. 環境準備

- [ ] 確認後端服務運行正常 (端口: 3001)
- [ ] 確認數據庫連接正常 (MongoDB)
- [ ] 準備API測試工具 (Postman、Insomnia或其他REST客戶端)
- [ ] 設置環境變量
  - `BASE_URL`: http://ailabordevbox.ns-2rlrcc3k.svc.cluster.local:3001/api/v1
  - `TOKEN`: 認證令牌存儲

## 2. 認證API測試

### 2.1 用戶註冊測試

- [ ] **發送請求**:
  - 端點: `POST /auth/register`
  - 請求體:
  ```json
  {
    "name": "測試用戶",
    "email": "test_user@example.com",
    "password": "Password123",
    "userType": "employee",
    "industry": "科技",
    "occupation": "工程師",
    "companyName": "測試公司"
  }
  ```

- [ ] **檢查響應**:
  - 狀態碼: 201 Created
  - 包含用戶資料和JWT令牌
  - 用戶ID格式正確

### 2.2 用戶登入測試

- [ ] **發送請求**:
  - 端點: `POST /auth/login`
  - 請求體:
  ```json
  {
    "email": "test_user@example.com",
    "password": "Password123"
  }
  ```

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 包含用戶資料和JWT令牌
  - 保存令牌用於後續請求

### 2.3 令牌刷新測試

- [ ] **發送請求**:
  - 端點: `POST /auth/refresh-token`
  - 請求頭: `Authorization: Bearer <token>`

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 包含新的JWT令牌

## 3. 用戶管理API測試

### 3.1 獲取用戶資料

- [ ] **發送請求**:
  - 端點: `GET /users/profile`
  - 請求頭: `Authorization: Bearer <token>`

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 包含用戶詳細資料

### 3.2 更新用戶資料

- [ ] **發送請求**:
  - 端點: `PUT /users/profile`
  - 請求頭: `Authorization: Bearer <token>`
  - 請求體:
  ```json
  {
    "name": "測試用戶(已更新)",
    "phoneNumber": "0912345678",
    "industry": "金融科技",
    "occupation": "專案經理"
  }
  ```

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 包含更新後的用戶資料

### 3.3 檢查剩餘諮詢次數

- [ ] **發送請求**:
  - 端點: `GET /users/remaining-queries`
  - 請求頭: `Authorization: Bearer <token>`

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 包含剩餘諮詢次數和總諮詢次數

### 3.4 扣減諮詢次數

- [ ] **發送請求**:
  - 端點: `POST /users/decrease-query`
  - 請求頭: `Authorization: Bearer <token>`

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 剩餘諮詢次數減少1
  - 總諮詢次數增加1

## 4. 聊天會話API測試

### 4.1 創建新會話

- [ ] **發送請求**:
  - 端點: `POST /conversations`
  - 請求頭: `Authorization: Bearer <token>`
  - 請求體:
  ```json
  {
    "title": "測試會話"
  }
  ```

- [ ] **檢查響應**:
  - 狀態碼: 201 Created
  - 包含新會話資料
  - 保存會話ID用於後續請求

### 4.2 獲取會話列表

- [ ] **發送請求**:
  - 端點: `GET /conversations`
  - 請求頭: `Authorization: Bearer <token>`

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 包含會話列表
  - 新創建的會話存在於列表中

### 4.3 發送用戶消息

- [ ] **發送請求**:
  - 端點: `POST /conversations/{conversationId}/messages`
  - 請求頭: `Authorization: Bearer <token>`
  - 請求體:
  ```json
  {
    "content": "請問特休假如何計算？"
  }
  ```

- [ ] **檢查響應**:
  - 狀態碼: 201 Created
  - 包含用戶消息和AI回复
  - AI回复內容與勞動法規相關

### 4.4 獲取會話詳情

- [ ] **發送請求**:
  - 端點: `GET /conversations/{conversationId}`
  - 請求頭: `Authorization: Bearer <token>`

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 包含會話詳情和消息列表
  - 剛才發送的消息存在於列表中

### 4.5 更新會話標題

- [ ] **發送請求**:
  - 端點: `PUT /conversations/{conversationId}`
  - 請求頭: `Authorization: Bearer <token>`
  - 請求體:
  ```json
  {
    "title": "特休假計算咨詢"
  }
  ```

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 標題已成功更新

### 4.6 提供消息反饋

- [ ] **發送請求**:
  - 端點: `POST /conversations/{conversationId}/messages/{messageId}/feedback`
  - 請求頭: `Authorization: Bearer <token>`
  - 請求體:
  ```json
  {
    "feedback": "helpful"
  }
  ```

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 反饋已成功記錄

### 4.7 删除會話

- [ ] **發送請求**:
  - 端點: `DELETE /conversations/{conversationId}`
  - 請求頭: `Authorization: Bearer <token>`

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 再次獲取會話列表時，該會話已不存在

## 5. 專家諮詢API測試

### 5.1 提交專家諮詢請求

- [ ] **發送請求**:
  - 端點: `POST /consultations`
  - 請求頭: `Authorization: Bearer <token>`
  - 請求體:
  ```json
  {
    "title": "勞資爭議諮詢",
    "description": "我在公司工作3年，最近被無故解雇，想了解能獲得哪些補償...",
    "serviceType": "法律諮詢",
    "preferredContactMethods": ["phone", "email"],
    "phoneNumber": "0912345678"
  }
  ```

- [ ] **檢查響應**:
  - 狀態碼: 201 Created
  - 包含諮詢請求資料
  - 保存諮詢ID用於後續請求

### 5.2 獲取用戶諮詢列表

- [ ] **發送請求**:
  - 端點: `GET /consultations`
  - 請求頭: `Authorization: Bearer <token>`

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 包含諮詢請求列表
  - 剛才提交的諮詢請求存在於列表中

### 5.3 獲取諮詢詳情

- [ ] **發送請求**:
  - 端點: `GET /consultations/{consultationId}`
  - 請求頭: `Authorization: Bearer <token>`

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 包含諮詢請求詳情

### 5.4 取消諮詢請求

- [ ] **發送請求**:
  - 端點: `PATCH /consultations/{consultationId}/cancel`
  - 請求頭: `Authorization: Bearer <token>`

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 諮詢狀態已更新為 "cancelled"

## 6. 管理員功能測試

### 6.1 管理員登入

- [ ] **發送請求**:
  - 端點: `POST /auth/login`
  - 請求體:
  ```json
  {
    "email": "test@ailaborlaw.com",
    "password": "Test1234"
  }
  ```

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 包含管理員用戶資料和JWT令牌
  - 保存管理員令牌用於後續請求

### 6.2 獲取用戶列表

- [ ] **發送請求**:
  - 端點: `GET /admin/users`
  - 請求頭: `Authorization: Bearer <admin_token>`
  - 可選查詢參數: `page=1&limit=10&status=active&search=test`

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 包含用戶列表和分頁信息

### 6.3 獲取用戶詳情

- [ ] **發送請求**:
  - 端點: `GET /admin/users/{userId}`
  - 請求頭: `Authorization: Bearer <admin_token>`

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 包含用戶詳細資料

### 6.4 更新用戶資料(管理員權限)

- [ ] **發送請求**:
  - 端點: `PUT /admin/users/{userId}`
  - 請求頭: `Authorization: Bearer <admin_token>`
  - 請求體:
  ```json
  {
    "remainingQueries": 20,
    "status": "active"
  }
  ```

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 用戶資料已成功更新

### 6.5 獲取諮詢請求列表

- [ ] **發送請求**:
  - 端點: `GET /admin/consultations`
  - 請求頭: `Authorization: Bearer <admin_token>`
  - 可選查詢參數: `page=1&limit=10&status=pending`

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 包含諮詢請求列表和分頁信息

### 6.6 更新諮詢狀態

- [ ] **發送請求**:
  - 端點: `PATCH /admin/consultations/{consultationId}/status`
  - 請求頭: `Authorization: Bearer <admin_token>`
  - 請求體:
  ```json
  {
    "status": "in_progress"
  }
  ```

- [ ] **檢查響應**:
  - 狀態碼: 200 OK
  - 諮詢狀態已成功更新

## 7. 錯誤處理測試

### 7.1 認證錯誤

- [ ] **無令牌請求**:
  - 獲取需要認證的端點但不提供令牌
  - 期望狀態碼: 401 Unauthorized

- [ ] **無效令牌請求**:
  - 提供無效或過期的令牌
  - 期望狀態碼: 401 Unauthorized

### 7.2 權限錯誤

- [ ] **訪問管理員端點**:
  - 使用普通用戶令牌訪問管理員端點
  - 期望狀態碼: 403 Forbidden

### 7.3 輸入驗證錯誤

- [ ] **無效郵箱格式**:
  - 註冊時提供無效郵箱格式
  - 期望狀態碼: 400 Bad Request
  - 包含詳細錯誤信息

- [ ] **密碼太短**:
  - 註冊時提供短於8位的密碼
  - 期望狀態碼: 400 Bad Request
  - 包含詳細錯誤信息

### 7.4 資源不存在錯誤

- [ ] **訪問不存在的會話**:
  - 使用不存在的會話ID
  - 期望狀態碼: 404 Not Found

- [ ] **訪問不存在的用戶**:
  - 使用不存在的用戶ID
  - 期望狀態碼: 404 Not Found

## 8. 性能與安全測試

### 8.1 並發請求測試

- [ ] **多次並發登入**:
  - 使用同一帳號同時發送多個登入請求
  - 檢查系統穩定性

- [ ] **並發查詢請求**:
  - 同時發送多個會話列表請求
  - 檢查響應時間和系統負載

### 8.2 安全測試

- [ ] **SQL注入測試**:
  - 在查詢參數中嘗試SQL注入語法
  - 系統應能正確處理並防止攻擊

- [ ] **XSS攻擊測試**:
  - 在消息內容中嘗試包含JavaScript代碼
  - 系統應該正確處理並轉義這些內容

## 9. 系統整合測試

- [ ] **完整用戶流程測試**:
  - 註冊 → 登入 → 創建會話 → 發送消息 → 查看歷史 → 登出
  - 整個流程應該順暢完成

- [ ] **專家諮詢流程測試**:
  - 登入 → 提交諮詢 → 查看諮詢列表 → 取消諮詢
  - 整個流程應該順暢完成

## 10. 後續處理

- [ ] 記錄所有發現的問題
- [ ] 對關鍵API端點進行性能分析
- [ ] 生成測試報告並提交給開發團隊
- [ ] 確保所有測試數據都被清理 