# 勞法通 v1.0 後端系統 - 上線版本

## 📅 **版本信息**
- **版本號**：v1.0.0
- **發布日期**：2025年7月1日
- **開發狀態**：✅ 開發完成，準備上線

---

## 🎯 **項目概述**

勞法通是一個基於AI的勞動法律諮詢平台，為用戶提供專業的勞動法律問題解答和專家諮詢服務。本項目採用現代化的微服務架構，提供高效、安全、可擴展的後端服務。

### **核心價值**
- 🤖 **AI智能諮詢**：基於N8N工作流的智能法律問答系統
- 👨‍💼 **專家服務**：專業律師諮詢預約和管理
- 📊 **數據分析**：完整的用戶行為和諮詢數據統計
- 🔐 **安全可靠**：企業級安全認證和數據保護

---

## 🏗️ **技術架構**

### **核心技術棧**
- **運行環境**：Node.js 20.x
- **Web框架**：Express.js
- **數據庫**：MongoDB (Mongoose ODM)
- **認證系統**：JWT + bcrypt
- **日誌系統**：Winston
- **API文檔**：RESTful API
- **部署環境**：Sealos雲平台

### **架構特點**
- 🔄 **微服務設計**：模組化服務架構
- 📡 **RESTful API**：標準化API接口
- 🔒 **多層認證**：用戶+管理員雙重認證體系
- 📈 **高性能**：優化的數據庫查詢和緩存策略
- 🛡️ **安全防護**：CORS、驗證中間件、錯誤處理

---

## 🚀 **已完成功能模組**

### **1. 用戶認證系統** ✅
- **用戶註冊/登入**：郵箱驗證、密碼加密
- **管理員認證**：獨立的管理員認證體系
- **JWT令牌管理**：access_token + refresh_token機制
- **密碼安全**：bcrypt加密、密碼強度驗證

**API端點**：
```
POST /api/v1/auth/register          # 用戶註冊
POST /api/v1/auth/login            # 用戶登入
POST /api/v1/auth/refresh-token    # 令牌刷新
POST /api/v1/admin/auth/login      # 管理員登入
```

### **2. AI聊天諮詢系統** ✅
- **智能問答**：基於N8N工作流的AI諮詢
- **會話管理**：多輪對話上下文保持
- **諮詢記錄**：完整的諮詢歷史追蹤
- **分類標籤**：勞動法問題智能分類

**核心功能**：
- 🤖 N8N工作流集成
- �� 實時聊天響應
- 📝 會話歷史管理
- 🏷️ 問題分類系統
- ⭐ 用戶反饋評分

**API端點**：
```
POST /api/v1/chat/send             # 發送諮詢消息
GET  /api/v1/chat/sessions         # 獲取會話列表
GET  /api/v1/chat/sessions/:id     # 獲取會話詳情
POST /api/v1/chat/feedback         # 提交反饋評分
```

### **3. 專家諮詢預約系統** ✅
- **諮詢申請**：用戶提交專家諮詢需求
- **狀態管理**：待處理、進行中、已完成狀態流轉
- **專家分配**：管理員分配合適的專家
- **進度追蹤**：完整的諮詢進度管理

**業務流程**：
1. 用戶提交諮詢申請
2. 管理員審核並分配專家
3. 專家處理諮詢
4. 完成並記錄結果

**API端點**：
```
POST /api/v1/expert-consultations           # 提交諮詢申請
GET  /api/v1/expert-consultations/user/:id  # 用戶諮詢列表
GET  /api/v1/expert-consultations/admin/list # 管理員查看所有諮詢
PUT  /api/v1/expert-consultations/admin/:id  # 更新諮詢狀態
```

### **4. 邀請推薦系統** ✅
- **邀請碼生成**：唯一邀請碼自動生成
- **註冊獎勵**：邀請人和被邀請人雙重獎勵
- **統計分析**：邀請數據統計和排行榜
- **管理功能**：後台邀請數據管理

**獎勵機制**：
- 👥 邀請人獎勵：10次免費諮詢
- 🎁 被邀請人獎勵：10次免費諮詢
- 📊 實時統計更新
- 🏆 邀請排行榜

**API端點**：
```
POST /api/v1/invites/validate              # 驗證邀請碼
GET  /api/v1/invites/my-stats              # 個人邀請統計
GET  /api/v1/invites/admin/records         # 管理員查看邀請記錄
GET  /api/v1/invites/admin/system-stats    # 系統邀請統計
```

### **5. 管理後台系統** ✅
- **用戶管理**：用戶信息查看、編輯、狀態管理
- **諮詢統計**：AI諮詢數據分析和報表
- **專家管理**：專家諮詢分配和進度監控
- **邀請管理**：邀請數據統計和用戶增長分析

**管理功能**：
- 📊 數據儀表板
- 👥 用戶信息管理
- 💬 聊天記錄管理
- 🎯 專家諮詢管理
- 📈 邀請數據分析

**API端點**：
```
GET /api/v1/admin/users                    # 用戶列表管理
GET /api/v1/admin/chat/stats               # 聊天統計數據
GET /api/v1/expert-consultations/admin/statistics # 專家諮詢統計
GET /api/v1/invites/admin/system-stats     # 邀請系統統計
```

### **6. 郵件通知系統** ✅
- **註冊驗證**：郵箱驗證碼發送
- **密碼重置**：安全的密碼重置流程
- **通知提醒**：重要事件郵件通知
- **模板管理**：多種郵件模板支持

**郵件類型**：
- ✉️ 註冊驗證郵件
- 🔑 密碼重置郵件
- 📧 系統通知郵件
- 🎯 專家諮詢通知

---

## 🔧 **系統配置**

### **環境變量**
```env
# 服務器配置
PORT=7070
NODE_ENV=production

# 數據庫配置
MONGODB_URI=mongodb://...

# JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# 郵件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# N8N工作流配置
N8N_WEBHOOK_URL=https://your-n8n-webhook-url
```

### **數據庫模型**
- **User**：用戶基本信息和認證
- **Admin**：管理員信息和權限
- **ChatSession**：聊天會話管理
- **ChatMessage**：聊天消息記錄
- **ExpertConsultation**：專家諮詢申請
- **InviteRecord**：邀請關係記錄
- **QueryRecord**：諮詢次數記錄
- **SystemSetting**：系統配置參數

---

## 📊 **性能指標**

### **已測試功能**
- ✅ 用戶註冊/登入流程
- ✅ AI聊天響應速度
- ✅ 專家諮詢申請流程
- ✅ 邀請獎勵機制
- ✅ 管理後台數據統計
- ✅ 郵件發送功能

### **性能表現**
- 🚀 **API響應時間**：< 200ms
- 💾 **數據庫查詢**：優化索引，快速響應
- 🔄 **併發處理**：支持多用戶同時使用
- 📈 **擴展性**：模組化設計，易於擴展

---

## 🛡️ **安全特性**

### **認證與授權**
- 🔐 JWT雙令牌機制
- 🔒 bcrypt密碼加密
- 👮‍♂️ 角色權限控制
- 🛡️ 中間件安全驗證

### **數據保護**
- 📊 敏感信息遮罩
- 🔍 輸入驗證和清理
- 🚫 SQL注入防護
- 🌐 CORS跨域保護

---

## 📱 **API文檔**

### **認證相關**
```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh-token
POST /api/v1/admin/auth/login
```

### **聊天諮詢**
```http
POST /api/v1/chat/send
GET  /api/v1/chat/sessions
GET  /api/v1/chat/sessions/:sessionId
POST /api/v1/chat/feedback
```

### **專家諮詢**
```http
POST /api/v1/expert-consultations
GET  /api/v1/expert-consultations/user/:userId
PUT  /api/v1/expert-consultations/:id/cancel
GET  /api/v1/expert-consultations/admin/list
```

### **邀請系統**
```http
POST /api/v1/invites/validate
GET  /api/v1/invites/my-stats
GET  /api/v1/invites/admin/records
GET  /api/v1/invites/admin/system-stats
```

---

## 🚀 **部署說明**

### **生產環境要求**
- Node.js 20.x 或更高版本
- MongoDB 5.0 或更高版本
- 2GB RAM 最低配置
- SSL證書配置

### **啟動命令**
```bash
# 安裝依賴
npm install

# 生產環境啟動
npm start

# 開發環境啟動
npm run dev
```

### **健康檢查**
```http
GET /api/v1/health
```

---

## 📞 **聯繫信息**

- **項目團隊**：勞法通開發團隊
- **技術支持**：backend-support@ailaborlaw.com
- **版本發布**：2025年7月1日

---

## 📝 **更新日誌**

### **v1.0.0 (2025-07-01)**
- ✅ 完成所有核心功能開發
- ✅ 通過全面測試驗證
- ✅ 完成安全性審查
- ✅ 準備生產環境部署

**勞法通v1.0 - 讓法律諮詢更簡單、更專業、更高效！** 🎉
