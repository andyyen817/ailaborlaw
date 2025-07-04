# 🛠️ AI勞基法顧問後端 - CommonJS重構任務執行清單

## 📊 **專案概況**
- **目標**: 將整個後端項目從ES模塊統一重構為CommonJS
- **原因**: 解決Vercel Serverless部署中的模塊兼容性問題
- **範圍**: 83個檔案需要修改（不含backup目錄）
- **預計時間**: 2-3小時完成

---

## 🎯 **第一優先級：關鍵系統文件（必須先完成）**

### ✅ **已完成的文件**
- [x] `package.json` - 移除 "type": "module"
- [x] `src/app.js` - 主應用程式文件
- [x] `src/config/database.js` - 數據庫連接
- [x] `src/config/app.js` - 應用配置
- [x] `src/utils/logger.js` - 日誌系統
- [x] `src/utils/error.js` - 錯誤處理
- [x] `src/routes/index.js` - 主路由
- [x] `src/middlewares/request-logger.middleware.js` - 請求日誌
- [x] `src/middlewares/error-handlers.middleware.js` - 錯誤處理中間件

---

## 🔥 **第二優先級：核心業務邏輯（急需修復）**

### 📦 **依賴版本修改**
- [ ] **package.json 依賴降級**
  ```json
  "node-fetch": "^2.7.0"  // 從 ^3.3.2 降級
  ```

### 🔧 **服務層 (Services)**
- [ ] **src/services/n8n.service.js** ⭐ **最重要**
  - 修改: `import fetch from 'node-fetch'` → `const fetch = require('node-fetch')`
  - 修改: `import logger` → `const logger = require`
  - 修改: `export default n8nService` → `module.exports = n8nService`

- [ ] **src/services/query.service.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default QueryService` → `module.exports = QueryService`

- [ ] **src/services/system-setting.service.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default SystemSettingService` → `module.exports = SystemSettingService`

- [ ] **src/services/invite.service.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default InviteService` → `module.exports = InviteService`

- [ ] **src/services/email.service.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default EmailService` → `module.exports = EmailService`

### 🛡️ **中間件 (Middlewares)**
- [ ] **src/middlewares/auth.middleware.js**
  - 修改所有 `import` → `const ... = require`
  - 修改所有 `export const` → 直接導出對象

- [ ] **src/middlewares/admin-auth.middleware.js**
  - 修改所有 `import` → `const ... = require`
  - 修改所有 `export const` → 直接導出對象

- [ ] **src/middlewares/validation.middleware.js**
  - 修改: `import { validationResult }` → `const { validationResult } = require`
  - 修改: `export default` → `module.exports`

- [ ] **src/middlewares/async.middleware.js**
  - 修改: `export default asyncHandler` → `module.exports = asyncHandler`
  - 修改: `export const asyncHandler` → 同時導出

---

## 🗂️ **第三優先級：數據模型 (Models)**

### 📊 **核心模型**
- [ ] **src/models/user.model.js**
  - 修改: `import mongoose` → `const mongoose = require`
  - 修改: `import bcrypt` → `const bcrypt = require`
  - 修改: `export default User` → `module.exports = User`

- [ ] **src/models/admin.model.js**
  - 修改: `import mongoose` → `const mongoose = require`
  - 修改: `import bcrypt` → `const bcrypt = require`
  - 修改: `export default Admin` → `module.exports = Admin`

- [ ] **src/models/conversation.model.js**
  - 修改: `import mongoose` → `const mongoose = require`
  - 修改: `export default Conversation` → `module.exports = Conversation`

- [ ] **src/models/message.model.js**
  - 修改: `import mongoose` → `const mongoose = require`
  - 修改: `export default Message` → `module.exports = Message`

### 📋 **業務模型**
- [ ] **src/models/query-record.model.js**
  - 修改: `import mongoose` → `const mongoose = require`
  - 修改: `export default QueryRecord` → `module.exports = QueryRecord`

- [ ] **src/models/system-setting.model.js**
  - 修改: `import mongoose` → `const mongoose = require`
  - 修改: `export default SystemSetting` → `module.exports = SystemSetting`

- [ ] **src/models/invite-record.model.js**
  - 修改: `import mongoose` → `const mongoose = require`
  - 修改: `export default InviteRecord` → `module.exports = InviteRecord`

- [ ] **src/models/labor_advisor.model.js**
  - 修改: `import mongoose` → `const mongoose = require`
  - 修改: `export const SPECIALTIES` → 使用 `module.exports.SPECIALTIES`
  - 修改: `export const REGIONS` → 使用 `module.exports.REGIONS`
  - 修改: `export default` → `module.exports.default` 或重構為單一導出

- [ ] **src/models/expert_consultation.model.js**
  - 修改: `import mongoose` → `const mongoose = require`
  - 修改: `import { v4 as uuidv4 }` → `const { v4: uuidv4 } = require`
  - 修改所有 `export const` → 使用 `module.exports.`
  - 修改: `export default` → `module.exports.default`

- [ ] **src/models/email_verification.model.js**
  - 修改: `import mongoose` → `const mongoose = require`
  - 修改: `export default EmailVerification` → `module.exports = EmailVerification`

- [ ] **src/models/email_log.model.js**
  - 修改: `import mongoose` → `const mongoose = require`
  - 修改: `export default EmailLog` → `module.exports = EmailLog`

---

## 🛣️ **第四優先級：路由系統 (Routes)**

### 🎯 **核心路由**
- [ ] **src/routes/auth.routes.js**
  - 修改: `import express` → `const express = require`
  - 修改: `import * as authController` → `const authController = require`
  - 修改: `export default router` → `module.exports = router`

- [ ] **src/routes/user.routes.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default router` → `module.exports = router`

- [ ] **src/routes/chat.routes.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default router` → `module.exports = router`

### 📊 **業務路由**
- [ ] **src/routes/query.routes.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default router` → `module.exports = router`

- [ ] **src/routes/invite.routes.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default router` → `module.exports = router`

- [ ] **src/routes/labor-advisor.routes.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default router` → `module.exports = router`

- [ ] **src/routes/expert-consultation.routes.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default router` → `module.exports = router`

- [ ] **src/routes/test.routes.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default router` → `module.exports = router`

### 🔧 **管理員路由**
- [ ] **src/routes/admin/index.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default router` → `module.exports = router`

- [ ] **src/routes/admin/auth.routes.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default router` → `module.exports = router`

- [ ] **src/routes/admin/user.routes.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default router` → `module.exports = router`

- [ ] **src/routes/admin/system-settings.routes.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default router` → `module.exports = router`

- [ ] **src/routes/admin/email.admin.routes.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default router` → `module.exports = router`

- [ ] **src/routes/admin/chat.admin.routes.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default router` → `module.exports = router`

- [ ] **src/routes/admin/admin-manager.routes.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default router` → `module.exports = router`

---

## 🎮 **第五優先級：控制器 (Controllers)**

### 🔐 **認證控制器**
- [ ] **src/controllers/auth.controller.js**
  - 修改所有 `import` → `const ... = require`
  - 修改所有 `export const` → 使用 `module.exports.functionName`

- [ ] **src/controllers/user.controller.js**
  - 修改所有 `import` → `const ... = require`
  - 修改所有 `export const` → 使用 `module.exports.functionName`

- [ ] **src/controllers/chat.controller.js**
  - 修改所有 `import` → `const ... = require`
  - 修改所有 `export const` → 使用 `module.exports.functionName`

### 📊 **業務控制器**
- [ ] **src/controllers/labor-advisor.controller.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default LaborAdvisorController` → `module.exports = LaborAdvisorController`

- [ ] **src/controllers/expert-consultation.controller.js**
  - 修改所有 `import` → `const ... = require`
  - 修改: `export default ExpertConsultationController` → `module.exports = ExpertConsultationController`

### 🔧 **管理員控制器**
- [ ] **src/controllers/admin/auth.controller.js**
  - 修改所有 `import` → `const ... = require`
  - 修改所有 `export const` → 使用 `module.exports.functionName`

- [ ] **src/controllers/admin/user.controller.js**
  - 修改所有 `import` → `const ... = require`
  - 修改所有 `export const` → 使用 `module.exports.functionName`

- [ ] **src/controllers/admin/chat.admin.controller.js**
  - 修改所有 `import` → `const ... = require`
  - 修改所有 `export const` → 使用 `module.exports.functionName`

- [ ] **src/controllers/admin/email.admin.controller.js**
  - 修改所有 `import` → `const ... = require`
  - 修改所有 `export const` → 使用 `module.exports.functionName`

- [ ] **src/controllers/admin/admin-manager.controller.js**
  - 修改所有 `import` → `const ... = require`
  - 修改所有 `export const` → 使用 `module.exports.functionName`

---

## ✅ **第六優先級：驗證與工具 (Validations & Utils)**

### 🔍 **驗證模組**
- [ ] **src/validations/auth.validation.js**
  - 修改: `import { body, validationResult }` → `const { body, validationResult } = require`
  - 修改: `export const handleValidationErrors` → `module.exports.handleValidationErrors`

- [ ] **src/validations/email.validation.js**
  - 修改: `import Joi` → `const Joi = require`
  - 修改所有 `export const` → 使用 `module.exports.`

- [ ] **src/validations/expert-consultation.validation.js**
  - 修改所有 `import` → `const ... = require`
  - 修改具名導入的常數

- [ ] **src/validations/labor-advisor.validation.js**
  - 修改所有 `import` → `const ... = require`
  - 修改具名導入的常數

### 🛠️ **工具模組**
- [ ] **src/utils/jwt.js**
  - 修改: `import jwt` → `const jwt = require`
  - 修改: `import logger` → `const logger = require`
  - 修改所有 `export const` → 使用 `module.exports.`
  - 取消註釋並修正 `module.exports` 導出

---

## 🧪 **第七優先級：腳本和調試文件**

### 📝 **管理腳本**
- [ ] **src/scripts/create-admin.js**
  - 修改所有 `import` → `const ... = require`

- [ ] **src/scripts/setup-admins.js**
  - 修改所有 `import` → `const ... = require`

- [ ] **src/scripts/check-admin-password.js**
  - 修改所有 `import` → `const ... = require`

- [ ] **src/scripts/test-admin-password.js**
  - 修改所有 `import` → `const ... = require`

- [ ] **src/scripts/show-admin-details.js**
  - 修改所有 `import` → `const ... = require`

### 🐛 **調試文件**
- [ ] **src/debug-admin-login.js**
  - 修改: `import fetch` → `const fetch = require`

---

## 🔧 **特殊處理項目**

### 📦 **混合導出模組**
這些文件同時使用 `export const` 和 `export default`，需要特殊處理：

- [ ] **src/models/labor_advisor.model.js**
  ```js
  // 修改前
  export const SPECIALTIES = {...}
  export const REGIONS = {...}
  export default mongoose.model('LaborAdvisor', laborAdvisorSchema);
  
  // 修改後
  const SPECIALTIES = {...}
  const REGIONS = {...}
  const LaborAdvisor = mongoose.model('LaborAdvisor', laborAdvisorSchema);
  
  module.exports = LaborAdvisor;
  module.exports.SPECIALTIES = SPECIALTIES;
  module.exports.REGIONS = REGIONS;
  ```

- [ ] **src/models/expert_consultation.model.js**
  ```js
  // 類似處理 SERVICE_TYPES, STATUS_TYPES, CONTACT_METHODS, TIME_PERIODS
  ```

- [ ] **src/utils/jwt.js**
  ```js
  // 修改所有具名導出為對象導出
  module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    getTokenFromHeader,
    extractUserIdFromToken
  };
  ```

### 🚀 **控制器模組統一處理**
所有控制器使用 `export const` 的需要改為：
```js
// 修改前
export const functionName = async (req, res) => {...}

// 修改後
const functionName = async (req, res) => {...}

module.exports = {
  functionName,
  anotherFunction,
  // ... 其他函數
};
```

---

## 🧼 **清理任務**

### 🗑️ **MongoDB重複索引警告修復**
- [ ] **檢查所有Model文件中的重複索引定義**
  - 搜索同時使用 `index: true` 和 `schema.index()` 的字段
  - 移除重複的索引定義

### 📋 **檢查清單**
- [ ] 確保所有 `import` 都已改為 `require`
- [ ] 確保所有 `export` 都已改為 `module.exports`
- [ ] 確保具名導出正確處理
- [ ] 測試所有API端點
- [ ] 檢查錯誤日誌

---

## ⚡ **執行順序建議**

### 🔥 **階段一：立即修復（30分鐘）**
1. 修改 `package.json` 降級 node-fetch
2. 修復 `src/services/n8n.service.js`
3. 修復相關的控制器文件
4. 測試部署

### 🛠️ **階段二：系統性重構（90分鐘）**
1. 按照優先級順序修改所有文件
2. 分批測試每個模組
3. 修復出現的錯誤

### ✅ **階段三：最終驗證（30分鐘）**
1. 全面測試所有API
2. 檢查錯誤日誌
3. 清理和優化

---

## 📊 **進度追踪**

### 📈 **統計**
- **總文件數**: 83個文件
- **已完成**: 9個文件 (11%)
- **剩餘**: 74個文件 (89%)

### 🎯 **關鍵里程碑**
- [ ] Phase 1: 核心服務可運行 (n8n.service.js修復)
- [ ] Phase 2: 所有API端點正常
- [ ] Phase 3: 無錯誤日誌
- [ ] Phase 4: 性能測試通過

---

## 🚨 **注意事項**

1. **備份**: 在開始前確保代碼已備份
2. **測試**: 每修改一個模組就進行測試
3. **依賴**: 先修改底層依賴，再修改使用者
4. **錯誤**: 記錄所有出現的錯誤，便於調試

**預計完成時間**: 2-3小時  
**最終目標**: 所有API正常運行，無模塊兼容性錯誤

---

*此清單將確保AI勞基法顧問後端系統能夠在Vercel Serverless環境中穩定運行，解決所有ES模塊兼容性問題。* 