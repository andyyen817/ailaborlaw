# 後端管理後台邀請管理API開發需求文檔

## 🚨 **項目概述**

**項目**：AI勞基法顧問 - 管理後台邀請管理API  
**狀態**：🔥 緊急開發  
**影響範圍**：管理後台邀請管理頁面  
**發現時間**：2024年12月  
**優先級**：P1（高優先級）

### **背景說明**
- 用戶端邀請功能已正常運作，顯示真實數據
- 管理後台仍在使用模擬數據，無法查看真實的邀請記錄
- 前端調用的管理員API方法不存在，導致功能降級到模擬數據

### **前端錯誤日誌**
```javascript
InviteManagementView.vue:335 獲取邀請記錄失敗，降級到mock數據: 
TypeError: inviteService.getAllInviteRecords is not a function

InviteManagementView.vue:443 獲取系統統計失敗，使用本地計算: 
TypeError: inviteService.getSystemStats is not a function
```

---

## 🎯 **開發需求**

### **需求1：管理員邀請記錄查詢API**

#### **API基本信息**
- **端點**: `GET /api/v1/invites/admin/records`
- **權限**: 管理員權限
- **功能**: 獲取所有用戶的邀請記錄，支持分頁和篩選

#### **請求參數**
```javascript
// Query Parameters
{
  "page": 1,              // 頁碼，默認1
  "limit": 50,            // 每頁記錄數，默認50，最大100
  "status": "all",        // 篩選狀態：all, completed, pending
  "startDate": "2024-01-01",  // 開始日期（可選）
  "endDate": "2024-12-31",    // 結束日期（可選）
  "inviterName": "",      // 邀請者姓名搜索（可選）
  "inviteeName": "",      // 被邀請者姓名搜索（可選）
  "inviteCode": ""        // 邀請碼搜索（可選）
}
```

#### **響應格式**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "invite_record_id_1",
        "inviterId": "user_id_001",
        "inviterName": "李小明",
        "inviterEmail": "li@example.com",
        "inviteeId": "user_id_002",
        "inviteeName": "張小華",
        "inviteeEmail": "zhang@example.com",
        "inviteCode": "ABC123",
        "invitedAt": "2024-12-16T10:30:00.000Z",
        "registeredAt": "2024-12-16T14:20:00.000Z",
        "bonusAwarded": true,
        "bonusAmount": 10,
        "status": "completed"
      },
      {
        "id": "invite_record_id_2",
        "inviterId": "user_id_003",
        "inviterName": "王大明",
        "inviterEmail": "wang@example.com",
        "inviteeId": null,
        "inviteeName": "陳小美",
        "inviteeEmail": "chen@example.com",
        "inviteCode": "DEF456",
        "invitedAt": "2024-12-15T16:45:00.000Z",
        "registeredAt": null,
        "bonusAwarded": false,
        "bonusAmount": 0,
        "status": "pending"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 156,
      "totalPages": 4,
      "hasNext": true,
      "hasPrev": false
    },
    "summary": {
      "totalInvites": 156,
      "completedInvites": 124,
      "pendingInvites": 32,
      "totalBonusAwarded": 1240
    }
  }
}
```

#### **數據庫查詢邏輯**
```sql
-- 主查詢邏輯（示例，請根據實際表結構調整）
SELECT 
  ir.id,
  ir.inviter_id as inviterId,
  u1.name as inviterName,
  u1.email as inviterEmail,
  ir.invitee_id as inviteeId,
  u2.name as inviteeName,
  u2.email as inviteeEmail,
  ir.invite_code as inviteCode,
  ir.created_at as invitedAt,
  ir.completed_at as registeredAt,
  ir.bonus_awarded as bonusAwarded,
  ir.bonus_amount as bonusAmount,
  CASE 
    WHEN ir.completed_at IS NOT NULL THEN 'completed'
    ELSE 'pending'
  END as status
FROM invite_records ir
LEFT JOIN users u1 ON ir.inviter_id = u1.id
LEFT JOIN users u2 ON ir.invitee_id = u2.id
WHERE 1=1
  AND (? IS NULL OR ir.status = ?)                    -- status篩選
  AND (? IS NULL OR ir.created_at >= ?)               -- startDate篩選
  AND (? IS NULL OR ir.created_at <= ?)               -- endDate篩選
  AND (? IS NULL OR u1.name LIKE CONCAT('%', ?, '%')) -- inviterName搜索
  AND (? IS NULL OR u2.name LIKE CONCAT('%', ?, '%')) -- inviteeName搜索
  AND (? IS NULL OR ir.invite_code = ?)               -- inviteCode搜索
ORDER BY ir.created_at DESC
LIMIT ? OFFSET ?;
```

---

### **需求2：管理員系統統計API**

#### **API基本信息**
- **端點**: `GET /api/v1/invites/admin/system-stats`
- **權限**: 管理員權限
- **功能**: 獲取邀請系統的整體統計數據

#### **請求參數**
```javascript
// Query Parameters
{
  "period": "all",        // 統計週期：all, today, week, month, year
  "startDate": "2024-01-01",  // 自定義開始日期（可選）
  "endDate": "2024-12-31"     // 自定義結束日期（可選）
}
```

#### **響應格式**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalInvitesSent": 156,
      "successfulRegistrations": 124,
      "pendingInvites": 32,
      "conversionRate": 79.5,
      "totalBonusAwarded": 1240,
      "totalRegisteredUsers": 124
    },
    "dailyStats": {
      "date": "2024-12-16",
      "invitesSent": 8,
      "successfulRegistrations": 5,
      "bonusAwarded": 50
    },
    "weeklyStats": {
      "weekStart": "2024-12-09",
      "weekEnd": "2024-12-15",
      "invitesSent": 35,
      "successfulRegistrations": 28,
      "bonusAwarded": 280
    },
    "monthlyStats": {
      "thisMonth": {
        "month": "2024-12",
        "invitesSent": 45,
        "successfulRegistrations": 38,
        "bonusAwarded": 380
      },
      "lastMonth": {
        "month": "2024-11",
        "invitesSent": 52,
        "successfulRegistrations": 41,
        "bonusAwarded": 410
      }
    },
    "topInviters": [
      {
        "userId": "user_id_001",
        "name": "李小明",
        "email": "li@example.com",
        "totalInvites": 15,
        "successfulInvites": 12,
        "bonusEarned": 120
      },
      {
        "userId": "user_id_002",
        "name": "張大華",
        "email": "zhang@example.com",
        "totalInvites": 12,
        "successfulInvites": 10,
        "bonusEarned": 100
      }
    ]
  }
}
```

#### **統計查詢邏輯**
```sql
-- 總體統計
SELECT 
  COUNT(*) as totalInvitesSent,
  COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as successfulRegistrations,
  COUNT(CASE WHEN completed_at IS NULL THEN 1 END) as pendingInvites,
  SUM(CASE WHEN bonus_awarded = true THEN bonus_amount ELSE 0 END) as totalBonusAwarded
FROM invite_records
WHERE created_at >= ? AND created_at <= ?;

-- 今日統計
SELECT 
  COUNT(*) as invitesSent,
  COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as successfulRegistrations,
  SUM(CASE WHEN bonus_awarded = true THEN bonus_amount ELSE 0 END) as bonusAwarded
FROM invite_records
WHERE DATE(created_at) = CURDATE();

-- 頂級邀請者統計
SELECT 
  ir.inviter_id as userId,
  u.name,
  u.email,
  COUNT(*) as totalInvites,
  COUNT(CASE WHEN ir.completed_at IS NOT NULL THEN 1 END) as successfulInvites,
  SUM(CASE WHEN ir.bonus_awarded = true THEN ir.bonus_amount ELSE 0 END) as bonusEarned
FROM invite_records ir
JOIN users u ON ir.inviter_id = u.id
WHERE ir.created_at >= ? AND ir.created_at <= ?
GROUP BY ir.inviter_id, u.name, u.email
ORDER BY successfulInvites DESC
LIMIT 10;
```

---

### **需求3：管理員邀請設置管理API**

#### **獲取邀請設置**
- **端點**: `GET /api/v1/invites/admin/settings`
- **權限**: 管理員權限

#### **響應格式**
```json
{
  "success": true,
  "data": {
    "inviterBonus": 10,
    "inviteeBonus": 10,
    "isEnabled": true,
    "maxInvitesPerUser": 100,
    "inviteCodeExpireDays": 30,
    "description": "邀請好友註冊可獲得額外諮詢次數",
    "lastUpdated": "2024-12-16T10:30:00.000Z",
    "updatedBy": "admin_user_id"
  }
}
```

#### **更新邀請設置**
- **端點**: `PUT /api/v1/invites/admin/settings`
- **權限**: 管理員權限

#### **請求格式**
```json
{
  "inviterBonus": 15,
  "inviteeBonus": 10,
  "isEnabled": true,
  "maxInvitesPerUser": 200,
  "inviteCodeExpireDays": 60,
  "description": "更新的邀請描述"
}
```

---

## 🔧 **技術實現要求**

### **權限驗證**
```javascript
// 中間件示例
const requireAdminAuth = (req, res, next) => {
  // 1. 驗證用戶已登錄
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '請先登錄'
    });
  }
  
  // 2. 驗證管理員權限
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: '權限不足，需要管理員權限'
    });
  }
  
  next();
};
```

### **分頁處理**
```javascript
// 分頁邏輯示例
const getPaginationParams = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
};
```

### **數據驗證**
```javascript
// 請求參數驗證
const validateDateRange = (startDate, endDate) => {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      throw new Error('開始日期不能晚於結束日期');
    }
    
    // 限制查詢範圍不超過1年
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    if (end - start > oneYear) {
      throw new Error('查詢範圍不能超過1年');
    }
  }
};
```

---

## 🧪 **測試要求**

### **測試場景1：邀請記錄查詢API**

#### **基本功能測試**
```bash
# 測試1：獲取所有記錄
curl -X GET "http://localhost:7070/api/v1/invites/admin/records" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json"

# 測試2：分頁查詢
curl -X GET "http://localhost:7070/api/v1/invites/admin/records?page=2&limit=20" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json"

# 測試3：狀態篩選
curl -X GET "http://localhost:7070/api/v1/invites/admin/records?status=completed" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json"

# 測試4：日期範圍篩選
curl -X GET "http://localhost:7070/api/v1/invites/admin/records?startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json"
```

#### **權限測試**
```bash
# 測試1：無token訪問（應返回401）
curl -X GET "http://localhost:7070/api/v1/invites/admin/records"

# 測試2：普通用戶token訪問（應返回403）
curl -X GET "http://localhost:7070/api/v1/invites/admin/records" \
  -H "Authorization: Bearer {user_token}"
```

### **測試場景2：系統統計API**

#### **基本功能測試**
```bash
# 測試1：獲取全部統計
curl -X GET "http://localhost:7070/api/v1/invites/admin/system-stats" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json"

# 測試2：獲取今日統計
curl -X GET "http://localhost:7070/api/v1/invites/admin/system-stats?period=today" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json"

# 測試3：自定義時間範圍
curl -X GET "http://localhost:7070/api/v1/invites/admin/system-stats?startDate=2024-12-01&endDate=2024-12-16" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json"
```

### **測試場景3：數據一致性驗證**

#### **驗證標準**
1. **記錄數量一致性**：API返回的總記錄數應該與數據庫實際記錄數一致
2. **統計數據準確性**：統計API返回的數據應該與實際計算結果一致
3. **分頁邏輯正確性**：分頁參數應該正確影響返回結果

#### **測試步驟**
```sql
-- 手動驗證數據庫記錄數
SELECT COUNT(*) FROM invite_records;

-- 驗證已完成邀請數
SELECT COUNT(*) FROM invite_records WHERE completed_at IS NOT NULL;

-- 驗證待處理邀請數
SELECT COUNT(*) FROM invite_records WHERE completed_at IS NULL;

-- 驗證總獎勵金額
SELECT SUM(bonus_amount) FROM invite_records WHERE bonus_awarded = true;
```

---

## 📊 **數據庫表結構要求**

### **invite_records 表結構**
```sql
CREATE TABLE invite_records (
  id VARCHAR(50) PRIMARY KEY,
  inviter_id VARCHAR(50) NOT NULL,
  invitee_id VARCHAR(50),
  invite_code VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  bonus_awarded BOOLEAN DEFAULT false,
  bonus_amount INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_inviter (inviter_id),
  INDEX idx_invitee (invitee_id),
  INDEX idx_code (invite_code),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_completed_at (completed_at),
  
  FOREIGN KEY (inviter_id) REFERENCES users(id),
  FOREIGN KEY (invitee_id) REFERENCES users(id)
);
```

### **invite_settings 表結構**
```sql
CREATE TABLE invite_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  inviter_bonus INT DEFAULT 10,
  invitee_bonus INT DEFAULT 10,
  is_enabled BOOLEAN DEFAULT true,
  max_invites_per_user INT DEFAULT 100,
  invite_code_expire_days INT DEFAULT 30,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(50)
);
```

---

## ⚠️ **性能和安全要求**

### **性能要求**
1. **響應時間**: 所有API響應時間應小於1秒
2. **分頁限制**: 單次查詢最多返回100條記錄
3. **索引優化**: 確保所有查詢都有適當的數據庫索引
4. **緩存策略**: 統計數據可以考慮緩存5-10分鐘

### **安全要求**
1. **權限控制**: 嚴格驗證管理員權限
2. **參數驗證**: 驗證所有輸入參數
3. **SQL注入防護**: 使用參數化查詢
4. **日誌記錄**: 記錄所有管理員操作

### **錯誤處理**
```javascript
// 統一錯誤響應格式
{
  "success": false,
  "message": "具體錯誤信息",
  "code": "ERROR_CODE",
  "timestamp": "2024-12-16T10:30:00.000Z"
}
```

---

## 🎯 **驗收標準**

### **功能驗收**
- ✅ 管理後台可以正常獲取所有邀請記錄
- ✅ 支持分頁、篩選、搜索功能
- ✅ 統計數據準確且實時更新
- ✅ 權限控制正確，非管理員無法訪問
- ✅ 所有API響應格式符合文檔要求

### **性能驗收**
- ✅ API響應時間 < 1秒
- ✅ 支持並發請求不出現數據錯誤
- ✅ 大數據量查詢不會導致系統卡頓

### **安全驗收**
- ✅ 權限驗證正確
- ✅ 參數驗證完整
- ✅ 無SQL注入漏洞
- ✅ 敏感操作有日誌記錄

---

## 📞 **開發信息**

**需求提出人**: 前端開發團隊  
**緊急程度**: 🔥 P1 - 影響管理後台功能  
**期望完成時間**: 48小時內  
**開發環境**: `http://localhost:7070`  
**生產環境**: `https://wrrfvodsaofk.sealosgzg.site/`

### **開發順序建議**
1. **第一步**: 實現 `/invites/admin/records` API（核心功能）
2. **第二步**: 實現 `/invites/admin/system-stats` API（統計功能）
3. **第三步**: 實現 `/invites/admin/settings` API（設置功能）
4. **第四步**: 完善權限驗證和錯誤處理
5. **第五步**: 性能優化和測試

### **問題反饋**
如果在開發過程中遇到問題，請提供：
1. **具體錯誤信息**和堆棧跟踪
2. **數據庫查詢語句**和執行結果
3. **API測試請求**和響應數據
4. **開發環境配置**信息

---

**文檔版本**: v1.0  
**創建時間**: 2024年12月  
**最後更新**: 2024年12月  
**相關文檔**: 《後端邀請功能修復需求文檔-緊急.md》 