# 🛠️ AI勞基法顧問後端 - CommonJS重構任務執行清單

## 🎉 **重大突破！項目狀態更新** 
**更新時間**: 2025-07-04 23:54  
**狀態**: ✅ **基礎系統部署成功！**

### 🏆 **當前成功指標**
- ✅ **Vercel部署完全正常**: https://ailaborlawbackv1.vercel.app
- ✅ **健康檢查API正常**: `/api/v1/health` 返回正確響應
- ✅ **基礎路由系統穩定**: 核心架構運作良好
- ✅ **服務器性能良好**: 記憶體和運行時間正常

### 🎯 **當前完成度**
- **關鍵系統**: **100%** ✅ (第一優先級完成)
- **核心業務邏輯**: **85%** ✅ (第二優先級大部分完成)
- **整體後端系統**: **約70%** 🔶

---

## 🚀 **方案二：漸進式完成重構 - 執行計劃**

### 🔥 **階段一：修復測試頁面 (立即執行)**
**目標**: 讓 `test-api.html` 能正常測試API和數據庫
**預計時間**: 30-60分鐘

#### 🚨 **當前發現的問題**
1. **CSP (Content Security Policy) 錯誤**
   ```
   script-src 'self' 違規：內聯腳本被阻止
   錯誤位置: test-api.html:2059
   ```

2. **缺少靜態文件** (次要問題)
   ```
   404錯誤: /favicon.ico, /favicon.png
   ```

#### 📋 **階段一任務清單**
- [ ] **修復CSP問題** ⭐ **最重要**
  - 選項A: 將內聯JavaScript提取到外部文件
  - 選項B: 配置Vercel允許內聯腳本 (在vercel.json中)
- [ ] **測試核心API端點**
  - [ ] `/api/v1/health` ✅ (已驗證正常)
  - [ ] `/api/v1/auth/register` (用戶註冊)
  - [ ] `/api/v1/auth/login` (用戶登入)
  - [ ] `/api/v1/chat/sessions` (創建對話)
- [ ] **驗證數據庫連接**
  - [ ] MongoDB連接測試
  - [ ] 基礎CRUD操作測試

### 🗂️ **階段二：完成數據模型重構**
**目標**: 完成所有Model文件的CommonJS轉換
**預計時間**: 60-90分鐘

#### 📊 **核心模型 (高優先級)**
- [ ] **src/models/user.model.js** ⭐
  - [ ] `import mongoose` → `const mongoose = require`
  - [ ] `import bcrypt` → `const bcrypt = require`
  - [ ] `export default User` → `module.exports = User`

- [ ] **src/models/conversation.model.js** ⭐
  - [ ] `import mongoose` → `const mongoose = require`
  - [ ] `export default Conversation` → `module.exports = Conversation`

- [ ] **src/models/message.model.js** ⭐
  - [ ] `import mongoose` → `const mongoose = require`
  - [ ] `export default Message` → `module.exports = Message`

#### 📋 **業務模型 (中等優先級)**
- [ ] **src/models/admin.model.js**
- [ ] **src/models/query-record.model.js**
- [ ] **src/models/system-setting.model.js**
- [ ] **src/models/invite-record.model.js**
- [ ] **src/models/email_verification.model.js**
- [ ] **src/models/email_log.model.js**

#### 🔧 **特殊處理模型 (需要細心處理)**
- [ ] **src/models/labor_advisor.model.js**
  ```js
  // 混合導出處理
  const SPECIALTIES = {...}
  const REGIONS = {...}
  const LaborAdvisor = mongoose.model('LaborAdvisor', laborAdvisorSchema);
  
  module.exports = LaborAdvisor;
  module.exports.SPECIALTIES = SPECIALTIES;
  module.exports.REGIONS = REGIONS;
  ```

- [ ] **src/models/expert_consultation.model.js**
  ```js
  // 處理 SERVICE_TYPES, STATUS_TYPES, CONTACT_METHODS, TIME_PERIODS
  ```

### 🎮 **階段三：完成控制器系統重構**
**目標**: 完成所有Controller文件的CommonJS轉換
**預計時間**: 90-120分鐘

#### 🔐 **認證控制器 (最高優先級)**
- [ ] **src/controllers/auth.controller.js** ⭐⭐⭐
  - [ ] 修改所有 `import` → `const ... = require`
  - [ ] 修改所有 `export const` → `module.exports.functionName`

- [ ] **src/controllers/user.controller.js** ⭐⭐
  - [ ] 修改所有 `import` → `const ... = require`
  - [ ] 修改所有 `export const` → `module.exports.functionName`

- [ ] **src/controllers/chat.controller.js** ⭐⭐
  - [ ] 修改所有 `import` → `const ... = require`
  - [ ] 修改所有 `export const` → `module.exports.functionName`

#### 📊 **業務控制器**
- [ ] **src/controllers/labor-advisor.controller.js**
- [ ] **src/controllers/expert-consultation.controller.js**

#### 🔧 **管理員控制器**
- [ ] **src/controllers/admin/auth.controller.js**
- [ ] **src/controllers/admin/user.controller.js**
- [ ] **src/controllers/admin/chat.admin.controller.js**
- [ ] **src/controllers/admin/email.admin.controller.js**
- [ ] **src/controllers/admin/admin-manager.controller.js**

### ✅ **階段四：驗證與測試**
**目標**: 確保所有功能正常，準備前端部署
**預計時間**: 60分鐘

#### 🧪 **全面API測試**
- [ ] **認證系統測試**
  - [ ] 用戶註冊
  - [ ] 用戶登入
  - [ ] JWT Token驗證
- [ ] **對話系統測試**
  - [ ] 創建對話
  - [ ] 發送訊息
  - [ ] AI回應
- [ ] **數據庫操作測試**
  - [ ] 創建記錄
  - [ ] 查詢記錄
  - [ ] 更新記錄

#### 📊 **性能與穩定性驗證**
- [ ] **錯誤日誌檢查**
- [ ] **記憶體使用監控**
- [ ] **響應時間測試**

---

## 📊 **專案概況**
- **目標**: 將整個後端項目從ES模塊統一重構為CommonJS
- **原因**: 解決Vercel Serverless部署中的模塊兼容性問題
- **範圍**: 83個檔案需要修改（不含backup目錄）
- **預計剩餘時間**: 3-4小時完成 