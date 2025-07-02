# 後端郵箱驗證API開發規劃文檔

## 📋 **文檔概述**

**項目名稱**：AI勞基法顧問 - 郵箱驗證API開發  
**文檔版本**：v1.0  
**創建日期**：2025年1月28日  
**負責角色**：規劃者+檢查者  
**開發工期**：5個工作日  
**總任務數**：31個子任務  

---

## 🎯 **項目背景與目標**

### **業務需求**
根據前端需求文檔，需要實現完整的郵箱驗證系統，包括：
- 用戶註冊時的郵箱驗證流程
- 密碼重置功能
- 邀請系統與郵箱驗證的集成
- 管理後台的郵件統計和監控

### **技術目標**
- 實現11個核心API端點
- 集成AokSend第三方郵件服務
- 建立完整的安全防護機制
- 提供管理後台統計功能

---

## 🔍 **現狀分析**

### ✅ **已具備的基礎設施**

#### **後端架構**
- **框架**：Express.js (ES模組)
- **數據庫**：MongoDB + Mongoose ODM
- **認證**：JWT認證系統完整
- **API基礎URL**：`https://wrrfvodsaofk.sealosgzg.site/api/v1`

#### **第三方服務**
- **AokSend郵件API**：已可用
- **API密鑰**：`bc61fddd2c7d2b32fc56b2aff720cb4a`
- **註冊驗證模版ID**：`E_120388785105`
- **密碼重置模版ID**：`E_120388235516`
- **邀請確認模版ID**：`E_120384795747`
- **API端點**：`https://www.aoksend.com/index/api/send_email`

#### **現有模型結構**
- **User模型**：基礎用戶管理完整
- **認證中間件**：protect、protectAdmin可用
- **路由結構**：完整的API路由架構

### ❌ **需要實現的功能**

#### **數據庫模型缺失**
- User模型缺少郵箱驗證相關字段
- 缺少EmailLog模型記錄郵件發送日志

#### **API功能缺失**
- 郵箱驗證發送、驗證、重發API
- 密碼重置API
- 郵件統計和管理API

#### **服務層缺失**
- AokSend郵件服務封裝
- 驗證碼生成和校驗邏輯
- 防刷機制實現

---

## 📊 **詳細開發規劃**

## **Phase 1: 數據庫模型擴展** 
**優先級**：P0 (系統上線必須)  
**預估時間**：1個工作日  
**依賴關係**：無

### **子任務1.1: 擴展User模型添加郵箱驗證字段** ⭐⭐⭐

#### **具體任務**
1. 修改 `backend/src/models/user.model.js`
2. 添加以下字段到userSchema：

```javascript
// 郵箱驗證相關字段
emailVerified: {
  type: Boolean,
  default: false
},
emailVerificationCode: {
  type: String,
  default: null
},
emailVerificationExpires: {
  type: Date,
  default: null
},
emailVerificationSentAt: {
  type: Date,
  default: null
},
emailVerificationSentCount: {
  type: Number,
  default: 0
},
passwordResetCode: {
  type: String,
  default: null
},
passwordResetExpires: {
  type: Date,
  default: null
},
lastEmailSentAt: {
  type: Date,
  default: null
}
```

3. 修改默認狀態：`default: 'pending'` (新用戶需驗證)
4. 添加相關索引：`emailVerificationCode`、`passwordResetCode`

#### **驗收標準**
- [ ] User模型包含所有郵箱驗證字段
- [ ] 新用戶創建時默認狀態為'pending'
- [ ] 數據庫索引創建成功
- [ ] 現有用戶數據不受影響

#### **測試要求**
- [ ] 創建測試用戶，確認字段存在
- [ ] 驗證索引查詢性能
- [ ] 確認現有API功能正常

---

### **子任務1.2: 創建EmailLog模型** ⭐⭐⭐

#### **具體任務**
1. 創建 `backend/src/models/email_log.model.js`
2. 實現完整的郵件日志模型：

```javascript
const emailLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['registration', 'password_reset', 'invite_confirmation'],
    required: true
  },
  templateId: String,
  verificationCode: String,
  sentAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'verified'],
    default: 'pending'
  },
  aoksendResponse: {
    code: Number,
    message: String
  },
  verifiedAt: Date,
  expiresAt: Date
}, {
  timestamps: true
});
```

3. 建立適當的數據庫索引

#### **驗收標準**
- [ ] EmailLog模型創建完成
- [ ] 支持所有郵件類型記錄
- [ ] 數據庫索引建立完成
- [ ] 可記錄AokSend回應結果

---

## **Phase 2: AokSend郵件服務集成**
**優先級**：P0 (系統上線必須)  
**預估時間**：1個工作日  
**依賴關係**：Phase 1完成

### **子任務2.1: 創建EmailService服務類** ⭐⭐⭐

#### **具體任務**
1. 創建 `backend/src/services/email.service.js`
2. 實現EmailService類包含以下方法：

```javascript
class EmailService {
  // 生成6位數字驗證碼
  static generateVerificationCode()
  
  // 發送註冊驗證郵件
  static async sendRegistrationEmail(email, name, verificationCode)
  
  // 發送密碼重置郵件
  static async sendPasswordResetEmail(email, name, verificationCode)
  
  // 發送邀請確認郵件
  static async sendInviteConfirmationEmail(email, name, inviterName, bonusQueries)
  
  // 調用AokSend API
  static async callAokSendAPI(templateId, email, templateData)
  
  // 記錄郵件發送日志
  static async logEmailSent(userId, email, type, templateId, verificationCode, aoksendResponse)
}
```

#### **技術要求**
- 使用crypto.randomInt生成安全的6位數字驗證碼
- 實現AokSend API調用的錯誤處理和重試機制
- 支持異步郵件發送，避免阻塞主線程
- 完整的日志記錄功能

#### **驗收標準**
- [ ] EmailService類實現完成
- [ ] 可成功調用AokSend API
- [ ] 驗證碼生成安全可靠
- [ ] 錯誤處理機制完善

---

### **子任務2.2: 配置AokSend郵件模板** ⭐⭐⭐

#### **具體任務**
1. 在AokSend平台創建3個郵件模板
2. 配置環境變量
3. 設計繁體中文郵件內容

#### **模板1: 註冊驗證郵件**
```
主題: 【勞法通AI】郵箱驗證碼
模板ID: E_120388785105

內容:
親愛的用戶 {{name}} 您好，

歡迎註冊勞法通AI！您的郵箱驗證碼是：

{{verification_code}}

驗證碼有效期為15分鐘，請及時使用。

如果您沒有註冊勞法通AI，請忽略此郵件。

勞法通AI團隊 敬上
{{date}}
```

#### **模板2: 密碼重置郵件**
```
主題: 【勞法通AI】密碼重置驗證碼
模板ID: E_120388235516

內容:
親愛的 {{name}} 您好，

您申請重置勞法通AI的登錄密碼，驗證碼是：

{{verification_code}}

驗證碼有效期為15分鐘，請及時使用。

如果您沒有申請密碼重置，請忽略此郵件。

勞法通AI團隊 敬上
{{date}}
```

#### **模板3: 邀請確認郵件**
```
主題: 【勞法通AI】邀請註冊成功
模板ID: E_120384795747

內容:
親愛的 {{name}} 您好，

恭喜您通過 {{inviter_name}} 的邀請成功註冊勞法通AI！

您已獲得 {{bonus_queries}} 次額外免費諮詢次數。

立即開始使用：{{app_url}}

勞法通AI團隊 敬上
{{date}}
```

#### **環境變量配置**
```bash
# AokSend配置
AOKSEND_API_URL=https://www.aoksend.com/index/api/send_email
AOKSEND_APP_KEY=bc61fddd2c7d2b32fc56b2aff720cb4a
AOKSEND_ALIAS=勞法通AI
AOKSEND_REPLY_TO=noreply@your-domain.com

# 模板ID配置
TEMPLATE_REGISTRATION=E_120388785105
TEMPLATE_PASSWORD_RESET=E_120388235516
TEMPLATE_INVITE_CONFIRMATION=E_120384795747
```

#### **驗收標準**
- [x] 3個郵件模板在AokSend中創建完成 ✅
- [ ] 環境變量配置完成
- [ ] 郵件模板測試發送成功
- [ ] 繁體中文顯示正確

#### **模板確認狀態**
- [x] **註冊驗證模板** (E_120388785105) - 已創建 ✅
- [x] **密碼重置模板** (E_120388235516) - 已創建 ✅  
- [x] **邀請確認模板** (E_120384795747) - 已創建 ✅

---

## **Phase 3: 核心API實現**
**優先級**：P0 (系統上線必須)  
**預估時間**：2個工作日  
**依賴關係**：Phase 1、2完成

### **子任務3.1: 發送註冊驗證郵件API** ⭐⭐⭐

#### **API規格**
```
POST /api/v1/auth/send-email-verification
Content-Type: application/json

請求參數:
{
  "email": "user@example.com",
  "type": "registration",
  "language": "zh-TW"
}

回應格式:
{
  "success": true,
  "message": "驗證郵件已發送",
  "data": {
    "email": "user@example.com",
    "expiresAt": "2025-06-02T15:30:00.000Z",
    "nextSendTime": "2025-06-02T14:20:00.000Z"
  }
}
```

#### **業務邏輯**
1. 檢查郵箱是否已註冊
2. 實施防刷機制（60秒內限制1次發送）
3. 生成6位數字驗證碼（有效期15分鐘）
4. 調用AokSend API發送郵件
5. 更新用戶驗證狀態為pending
6. 記錄郵件發送日志

#### **防刷機制**
- 同一郵箱60秒內只能發送1次
- 同一郵箱24小時內最多發送5次
- 同一IP地址每小時最多發送20次

#### **錯誤處理**
- 40001: 郵箱格式無效
- 40002: 郵箱已註冊且已驗證
- 40003: 發送頻率過快
- 40004: 24小時內發送次數超限
- 50001: AokSend API調用失敗

#### **實現要求**
1. 創建 `backend/src/controllers/auth.controller.js` 新方法
2. 添加 `backend/src/validations/email.validation.js` 驗證規則
3. 更新 `backend/src/routes/auth.routes.js` 路由

#### **驗收標準**
- [ ] API成功發送驗證郵件
- [ ] 防刷機制有效工作
- [ ] 郵件內容正確渲染
- [ ] 錯誤處理完整

---

### **子任務3.2: 驗證郵箱驗證碼API** ⭐⭐⭐

#### **API規格**
```
POST /api/v1/auth/verify-email
Content-Type: application/json

請求參數:
{
  "email": "user@example.com",
  "verificationCode": "123456",
  "type": "registration"
}

回應格式:
{
  "success": true,
  "message": "郵箱驗證成功",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "emailVerified": true,
      "status": "active"
    }
  }
}
```

#### **業務邏輯**
1. 驗證郵箱和驗證碼格式
2. 檢查驗證碼是否正確且未過期
3. 更新用戶`emailVerified: true`
4. 更新用戶狀態為`active`（如果是註冊驗證）
5. 清除驗證碼相關字段
6. 如果是邀請註冊，處理邀請獎勵邏輯
7. 記錄驗證成功日志

#### **安全要求**
- 驗證碼使用bcrypt加密比較
- 驗證碼使用後立即失效
- 防止暴力破解（5次錯誤後鎖定10分鐘）

#### **驗收標準**
- [ ] 正確驗證碼驗證成功
- [ ] 錯誤/過期驗證碼驗證失敗
- [ ] 用戶狀態正確更新
- [ ] 安全機制有效

---

### **子任務3.3: 重新發送驗證郵件API** ⭐⭐

#### **API規格**
```
POST /api/v1/auth/resend-verification
Content-Type: application/json

請求參數:
{
  "email": "user@example.com"
}

回應格式:
{
  "success": true,
  "message": "驗證郵件已重新發送",
  "data": {
    "email": "user@example.com",
    "nextSendTime": "2025-06-02T14:16:00.000Z"
  }
}
```

#### **業務邏輯**
1. 檢查用戶是否存在且未驗證
2. 檢查是否符合重發條件（60秒冷卻）
3. 生成新的驗證碼
4. 調用郵件發送服務
5. 更新發送計數和時間戳

#### **驗收標準**
- [ ] 重發功能正常工作
- [ ] 冷卻時間限制有效
- [ ] 發送計數正確更新

---

### **子任務3.4: 檢查郵箱驗證狀態API** ⭐⭐

#### **API規格**
```
GET /api/v1/auth/email-verification-status?email=user@example.com

回應格式:
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "isVerified": false,
    "verificationSent": true,
    "sentAt": "2025-06-02T14:15:00.000Z",
    "canResend": false,
    "nextResendTime": "2025-06-02T14:16:00.000Z"
  }
}
```

#### **業務邏輯**
1. 查詢用戶郵箱驗證狀態
2. 計算下次可重發時間
3. 返回完整的狀態信息

#### **驗收標準**
- [ ] 狀態查詢準確
- [ ] 時間計算正確
- [ ] 前端可根據此API控制UI狀態

---

## **Phase 4: 密碼重置功能**
**優先級**：P1 (高優先級)  
**預估時間**：0.5個工作日  
**依賴關係**：Phase 3完成

### **子任務4.1: 忘記密碼API** ⭐⭐⭐

#### **API規格**
```
POST /api/v1/auth/forgot-password

請求參數:
{
  "email": "user@example.com"
}
```

#### **業務邏輯**
1. 檢查用戶是否存在
2. 生成密碼重置驗證碼
3. 發送密碼重置郵件
4. 記錄發送日志

#### **驗收標準**
- [ ] 密碼重置郵件發送成功
- [ ] 只有存在的用戶才能收到郵件

---

### **子任務4.2: 驗證重置密碼API** ⭐⭐⭐

#### **API規格**
```
POST /api/v1/auth/reset-password

請求參數:
{
  "email": "user@example.com",
  "verificationCode": "123456",
  "newPassword": "newpassword123"
}
```

#### **業務邏輯**
1. 驗證重置驗證碼
2. 更新用戶密碼
3. 清除重置驗證碼
4. 記錄密碼更改日志

#### **驗收標準**
- [ ] 密碼重置流程完整
- [ ] 舊密碼無法繼續使用

---

## **Phase 5: 邀請系統集成**
**優先級**：P1 (高優先級)  
**預估時間**：0.5個工作日  
**依賴關係**：Phase 3完成

### **子任務5.1: 邀請註冊郵箱驗證** ⭐⭐

#### **API規格**
```
POST /api/v1/invites/verify-invite-registration

請求參數:
{
  "email": "invited@example.com",
  "verificationCode": "123456",
  "inviteCode": "ABC123"
}
```

#### **業務邏輯**
1. 驗證郵箱驗證碼
2. 確認邀請碼有效性
3. 給邀請人增加獎勵次數
4. 給被邀請人增加獎勵次數
5. 記錄邀請成功記錄

#### **驗收標準**
- [ ] 邀請驗證流程完整
- [ ] 邀請獎勵邏輯正確

---

## **Phase 6: 管理後台集成**
**優先級**：P2 (中等優先級)  
**預估時間**：1個工作日  
**依賴關係**：Phase 3完成

### **子任務6.1: 郵件發送統計API** ⭐

#### **API規格**
```
GET /api/v1/admin/email/statistics

回應格式:
{
  "success": true,
  "data": {
    "totalSent": 1250,
    "sentToday": 45,
    "successRate": 98.5,
    "verificationRate": 85.2,
    "topFailureReasons": [...]
  }
}
```

#### **統計指標**
- 郵件發送總數
- 今日發送數量
- 發送成功率
- 郵箱驗證完成率
- 平均驗證時間
- 失敗原因分析

---

### **子任務6.2: 郵件日志查詢API** ⭐

#### **API規格**
```
GET /api/v1/admin/email/logs?page=1&limit=20&type=registration&status=sent

回應格式:
{
  "success": true,
  "data": {
    "logs": [...],
    "pagination": {
      "total": 500,
      "page": 1,
      "limit": 20,
      "totalPages": 25
    }
  }
}
```

#### **查詢功能**
- 支持郵件類型篩選
- 支持狀態篩選
- 支持時間範圍篩選
- 支持分頁查詢

---

## 🔒 **安全設計規範**

### **驗證碼安全**
```javascript
// 生成安全驗證碼
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// 加密存儲
const hashedCode = await bcrypt.hash(verificationCode, 10);

// 安全比較
const isValid = await bcrypt.compare(inputCode, hashedCode);
```

### **防刷機制**
```javascript
// 時間限制檢查
const timeLimitCheck = {
  perMinute: 1,    // 每分鐘1次
  perHour: 5,      // 每小時5次
  perDay: 20       // 每天20次
};

// IP限制
const ipLimitCheck = {
  perHour: 100     // 每小時100次
};
```

### **有效期控制**
```javascript
// 15分鐘有效期
const VERIFICATION_CODE_EXPIRY = 15 * 60 * 1000; // 15分鐘

// 過期檢查
const isExpired = new Date() > verificationExpires;
```

---

## 🧪 **測試計劃**

### **單元測試清單**
- [ ] EmailService.generateVerificationCode()
- [ ] EmailService.callAokSendAPI()
- [ ] 防刷機制邏輯測試
- [ ] 驗證碼生成和校驗測試
- [ ] 時間有效期檢查測試

### **集成測試清單**
- [ ] 完整的郵箱驗證流程
- [ ] AokSend API集成測試
- [ ] 密碼重置流程測試
- [ ] 邀請系統集成測試

### **端到端測試清單**
- [ ] 用戶註冊→收到郵件→驗證成功
- [ ] 忘記密碼→重置成功
- [ ] 邀請註冊→驗證→獎勵發放
- [ ] 防刷機制驗證
- [ ] 管理後台統計查詢

### **性能測試要求**
- [ ] 郵件發送響應時間 < 3秒
- [ ] 驗證碼驗證響應時間 < 1秒
- [ ] 並發100用戶同時驗證正常
- [ ] AokSend API調用成功率 > 99%

---

## ⚠️ **風險評估與應對策略**

### **高風險項**

#### **1. AokSend服務穩定性**
**風險描述**：第三方郵件服務不穩定影響業務
**影響等級**：高
**應對策略**：
- 實現重試機制（最多3次重試）
- 準備備用郵件服務方案
- 監控AokSend服務狀態
- 建立服務降級預案

#### **2. 郵件到達率問題**
**風險描述**：郵件被垃圾郵件過濾器攔截
**影響等級**：高
**應對策略**：
- 優化郵件內容和格式
- 配置SPF、DKIM記錄
- 監控郵件到達率
- 提供備用驗證方式

#### **3. 驗證碼安全性**
**風險描述**：驗證碼被破解或暴力攻擊
**影響等級**：高
**應對策略**：
- 使用crypto.randomInt生成隨機驗證碼
- 實施多重防刷機制
- 驗證碼加密存儲
- 失敗次數限制和鎖定機制

### **中風險項**

#### **1. 數據庫模型變更**
**風險描述**：模型變更影響現有功能
**影響等級**：中
**應對策略**：
- 準備數據遷移腳本
- 建立回滾方案
- 充分測試向後兼容性

#### **2. 性能影響**
**風險描述**：郵件發送影響系統性能
**影響等級**：中
**應對策略**：
- 郵件發送異步處理
- 實施緩存機制
- 優化數據庫查詢

---

## 📅 **詳細時間規劃**

### **第1天：基礎設施搭建**
**上午 (4小時)**
- 子任務1.1：擴展User模型 (2小時)
- 子任務1.2：創建EmailLog模型 (2小時)

**下午 (4小時)**
- 子任務2.1：創建EmailService服務類 (3小時)
- 測試和調試 (1小時)

### **第2天：郵件服務和核心API**
**上午 (4小時)**
- 子任務2.2：配置AokSend郵件模板 (2小時)
- 子任務3.1：發送註冊驗證郵件API (2小時)

**下午 (4小時)**
- 子任務3.2：驗證郵箱驗證碼API (3小時)
- 測試和調試 (1小時)

### **第3天：重發和重置功能**
**上午 (4小時)**
- 子任務3.3：重新發送驗證郵件API (2小時)
- 子任務3.4：檢查郵箱驗證狀態API (2小時)

**下午 (4小時)**
- 子任務4.1：忘記密碼API (2小時)
- 子任務4.2：驗證重置密碼API (2小時)

### **第4天：邀請系統和優化**
**上午 (4小時)**
- 子任務5.1：邀請註冊郵箱驗證 (3小時)
- 子任務5.2：邀請郵件通知 (1小時)

**下午 (4小時)**
- 性能優化和bug修復 (2小時)
- 安全機制強化 (2小時)

### **第5天：管理後台和測試**
**上午 (4小時)**
- 子任務6.1：郵件發送統計API (2小時)
- 子任務6.2：郵件日志查詢API (2小時)

**下午 (4小時)**
- 綜合測試 (2小時)
- 文檔整理和部署準備 (2小時)

---

## 📝 **開發檢查清單**

### **Phase 1 檢查清單**
- [ ] **子任務1.1**：User模型emailVerified等8個字段添加完成
- [ ] **子任務1.2**：EmailLog模型創建完成
- [ ] **數據庫**：相關索引建立完成
- [ ] **測試**：模型單元測試通過
- [ ] **兼容性**：現有API功能不受影響

### **Phase 2 檢查清單**
- [ ] **子任務2.1**：EmailService類6個方法實現完成
- [ ] **子任務2.2**：AokSend API調用測試成功
- [x] **模板**：3個郵件模板配置完成 ✅
- [ ] **環境**：相關環境變量配置完成
- [ ] **測試**：真實郵件發送測試成功

### **Phase 3 檢查清單**
- [ ] **子任務3.1**：發送驗證郵件API實現完成
- [ ] **子任務3.2**：驗證郵箱驗證碼API實現完成
- [ ] **子任務3.3**：重新發送驗證郵件API實現完成
- [ ] **子任務3.4**：檢查驗證狀態API實現完成
- [ ] **安全**：防刷機制驗證通過
- [ ] **測試**：Postman測試文檔編寫完成

### **Phase 4 檢查清單**
- [ ] **子任務4.1**：忘記密碼API實現完成
- [ ] **子任務4.2**：驗證重置密碼API實現完成
- [ ] **流程**：完整密碼重置流程測試通過
- [ ] **安全**：重置驗證碼安全性驗證通過

### **Phase 5 檢查清單**
- [ ] **子任務5.1**：邀請註冊郵箱驗證實現完成
- [ ] **子任務5.2**：邀請郵件通知實現完成
- [ ] **集成**：邀請註冊+郵箱驗證流程完整
- [ ] **獎勵**：邀請獎勵邏輯正確執行

### **Phase 6 檢查清單**
- [ ] **子任務6.1**：郵件發送統計API實現完成
- [ ] **子任務6.2**：郵件日志查詢API實現完成
- [ ] **管理**：管理後台可查看郵件統計數據
- [ ] **查詢**：郵件發送日志查詢功能正常

### **最終檢查清單**
- [ ] **API完整性**：11個API全部實現並測試通過
- [ ] **功能完整性**：註冊、重置、邀請3個流程完整
- [ ] **安全性**：所有安全機制驗證通過
- [ ] **性能**：響應時間符合要求
- [ ] **文檔**：API文檔和測試文檔完整
- [ ] **部署**：生產環境部署測試通過

---

## 📖 **相關文檔引用**

### **技術文檔**
- `README.md` - 項目總體架構
- `scratchpad.md` - 開發進度記錄
- `邮件aoksendapi描述.txt` - AokSend API文檔

### **前端需求文檔**
- 前端需求文檔中的11個核心API規格
- 郵件模板設計要求
- 用戶體驗流程要求

### **現有代碼參考**
- `backend/src/models/user.model.js` - 用戶模型結構
- `backend/src/controllers/auth.controller.js` - 認證控制器
- `backend/src/services/invite.service.js` - 邀請服務實現

---

## 🎯 **成功標準**

### **功能標準**
✅ 用戶可以成功註冊並收到驗證郵件  
✅ 驗證碼驗證流程完整無誤  
✅ 密碼重置功能正常工作  
✅ 邀請系統與郵箱驗證完美集成  
✅ 管理後台可查看完整統計數據  

### **技術標準**
✅ 所有API響應時間符合要求  
✅ AokSend API調用成功率 > 99%  
✅ 防刷機制有效防止濫用  
✅ 安全機制通過滲透測試  
✅ 代碼質量符合項目規範  

### **業務標準**
✅ 前端可以無縫集成所有API  
✅ 用戶體驗流暢友好  
✅ 系統穩定可靠  
✅ 滿足繁體中文本地化要求  
✅ 支持未來功能擴展  

---

**文檔狀態**：✅ 規劃完成，AokSend模板已就緒，等待開發執行  
**最後更新**：2025年1月28日  
**AokSend模板狀態**：✅ 三個模板已創建完成  
**下一步行動**：確認規劃後開始執行Phase 1 