# 前端邀請管理 API 接口文檔

## 📋 基本信息

- **項目名稱**: AI勞基法顧問 - 邀請管理系統
- **API版本**: v1.0
- **文檔更新時間**: 2024年12月
- **本地後端URL**: `http://localhost:7070`
- **API基礎路徑**: `/api/v1`
- **完整基礎URL**: `http://localhost:7070/api/v1`

## 🔐 認證說明

### 認證方式
所有需要認證的接口都需要在請求頭中添加JWT Token：

```http
Authorization: Bearer {your_jwt_token}
```

### 權限級別
- **公開接口**: 無需認證
- **用戶接口**: 需要登錄認證
- **管理員接口**: 需要管理員權限 (`admin` 角色)

---

## 📝 API 接口列表

### 1. 📋 獲取我的邀請碼

**接口地址**: `GET /invites/my-code`  
**完整URL**: `http://localhost:7070/api/v1/invites/my-code`  
**需要認證**: ✅ 是  
**權限要求**: 普通用戶  

#### 功能描述
獲取當前登錄用戶的邀請碼和邀請鏈接，用於分享給其他人註冊。

#### 請求參數
無

#### 響應示例
```json
{
  "success": true,
  "data": {
    "inviteCode": "ABC12345",
    "userName": "張三",
    "inviteUrl": "http://localhost:3000/register?invite=ABC12345"
  }
}
```

#### 前端使用示例
```javascript
async function getMyInviteCode() {
  try {
    const response = await fetch('http://localhost:7070/api/v1/invites/my-code', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('我的邀請碼:', data.data.inviteCode);
      console.log('邀請鏈接:', data.data.inviteUrl);
    }
  } catch (error) {
    console.error('獲取邀請碼失敗:', error);
  }
}
```

---

### 2. 🔄 重新生成邀請碼

**接口地址**: `POST /invites/regenerate-code`  
**完整URL**: `http://localhost:7070/api/v1/invites/regenerate-code`  
**需要認證**: ✅ 是  
**權限要求**: 普通用戶  

#### 功能描述
為當前用戶重新生成新的邀請碼，舊的邀請碼將失效。

#### 請求參數
```json
{}
```

#### 響應示例
```json
{
  "success": true,
  "message": "邀請碼重新生成成功",
  "data": {
    "newInviteCode": "XYZ98765",
    "inviteUrl": "http://localhost:3000/register?invite=XYZ98765"
  }
}
```

#### 前端使用示例
```javascript
async function regenerateInviteCode() {
  try {
    const response = await fetch('http://localhost:7070/api/v1/invites/regenerate-code', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('新邀請碼:', data.data.newInviteCode);
      // 更新UI顯示新的邀請碼
      updateInviteCodeDisplay(data.data.newInviteCode);
    }
  } catch (error) {
    console.error('重新生成邀請碼失敗:', error);
  }
}
```

---

### 3. ✅ 驗證邀請碼

**接口地址**: `POST /invites/validate`  
**完整URL**: `http://localhost:7070/api/v1/invites/validate`  
**需要認證**: ❌ 否（公開接口）  
**權限要求**: 無  

#### 功能描述
驗證邀請碼是否有效，通常在註冊頁面使用，用於實時驗證用戶輸入的邀請碼。

#### 請求參數
```json
{
  "inviteCode": "ABC12345"  // 必填，4-20位字符
}
```

#### 響應示例
**成功響應**:
```json
{
  "success": true,
  "message": "邀請碼有效",
  "data": {
    "inviter": {
      "id": "64f1234567890abcdef12345",
      "name": "張三",
      "email": "zhang@example.com"
    }
  }
}
```

**失敗響應**:
```json
{
  "success": false,
  "message": "邀請碼無效或已過期",
  "data": null
}
```

#### 前端使用示例
```javascript
async function validateInviteCode(inviteCode) {
  try {
    const response = await fetch('http://localhost:7070/api/v1/invites/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inviteCode })
    });
    
    const data = await response.json();
    if (data.success) {
      // 顯示邀請人信息
      showInviterInfo(data.data.inviter);
      return true;
    } else {
      // 顯示錯誤信息
      showError(data.message);
      return false;
    }
  } catch (error) {
    console.error('驗證邀請碼失敗:', error);
    return false;
  }
}

// 實時驗證邀請碼
document.getElementById('inviteCodeInput').addEventListener('blur', async (e) => {
  const inviteCode = e.target.value.trim();
  if (inviteCode) {
    await validateInviteCode(inviteCode);
  }
});
```

---

### 4. 🎯 處理邀請註冊

**接口地址**: `POST /invites/process-registration`  
**完整URL**: `http://localhost:7070/api/v1/invites/process-registration`  
**需要認證**: ✅ 是（新註冊用戶）  
**權限要求**: 普通用戶  

#### 功能描述
用戶註冊成功後調用此接口處理邀請碼，為邀請人和被邀請人發放獎勵。

#### 請求參數
```json
{
  "inviteCode": "ABC12345"  // 必填
}
```

#### 響應示例
```json
{
  "success": true,
  "message": "邀請註冊處理成功",
  "data": {
    "inviterBonus": 10,           // 邀請人獲得的獎勵次數
    "inviteeBonus": 10,           // 被邀請人獲得的獎勵次數
    "inviterName": "張三",        // 邀請人姓名
    "totalInvited": 5,            // 邀請人總邀請數
    "inviteRecord": {
      "id": "64f1234567890abcdef12345",
      "createdAt": "2024-12-01T10:30:00Z"
    }
  }
}
```

#### 前端使用示例
```javascript
async function processInviteRegistration(inviteCode) {
  try {
    const response = await fetch('http://localhost:7070/api/v1/invites/process-registration', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inviteCode })
    });
    
    const data = await response.json();
    if (data.success) {
      // 顯示邀請獎勵信息
      showInviteBonus(data.data);
    }
  } catch (error) {
    console.error('處理邀請註冊失敗:', error);
  }
}
```

---

### 5. 🎁 發放註冊獎勵

**接口地址**: `POST /invites/grant-registration-bonus`  
**完整URL**: `http://localhost:7070/api/v1/invites/grant-registration-bonus`  
**需要認證**: ✅ 是  
**權限要求**: 普通用戶  

#### 功能描述
為新註冊用戶發放註冊獎勵，通常在用戶註冊成功後自動調用。

#### 請求參數
```json
{}
```

#### 響應示例
```json
{
  "success": true,
  "message": "註冊獎勵發放成功",
  "data": {
    "bonusAmount": 10,        // 獲得的獎勵次數
    "newBalance": 20,         // 新的查詢次數餘額
    "grantedAt": "2024-12-01T10:30:00Z"
  }
}
```

---

### 6. 📊 獲取我的邀請統計

**接口地址**: `GET /invites/my-stats`  
**完整URL**: `http://localhost:7070/api/v1/invites/my-stats`  
**需要認證**: ✅ 是  
**權限要求**: 普通用戶  

#### 功能描述
獲取當前用戶的邀請統計信息，包括邀請人數、獲得獎勵、排名等。

#### 請求參數
無

#### 響應示例
```json
{
  "success": true,
  "data": {
    "totalInvited": 8,                    // 總邀請人數
    "totalBonusEarned": 80,               // 總獲得獎勵次數
    "thisMonthInvited": 3,                // 本月邀請人數
    "thisMonthBonus": 30,                 // 本月獲得獎勵
    "myInviteCode": "ABC12345",           // 我的邀請碼
    "ranking": 15,                        // 在排行榜中的排名
    "inviteUrl": "http://localhost:3000/register?invite=ABC12345",
    "recentInvitees": [                   // 最近邀請的用戶
      {
        "name": "李四",
        "invitedAt": "2024-01-15T10:30:00Z",
        "bonusReceived": 10,
        "status": "active"
      },
      {
        "name": "王五",
        "invitedAt": "2024-01-14T15:20:00Z",
        "bonusReceived": 10,
        "status": "active"
      }
    ],
    "monthlyStats": [                     // 月度統計
      {
        "month": "2024-01",
        "invitedCount": 5,
        "bonusEarned": 50
      }
    ]
  }
}
```

#### 前端使用示例
```javascript
async function loadMyInviteStats() {
  try {
    const response = await fetch('http://localhost:7070/api/v1/invites/my-stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    const data = await response.json();
    if (data.success) {
      const stats = data.data;
      
      // 更新統計顯示
      document.getElementById('totalInvited').textContent = stats.totalInvited;
      document.getElementById('totalBonus').textContent = stats.totalBonusEarned;
      document.getElementById('ranking').textContent = stats.ranking;
      
      // 顯示最近邀請的用戶
      displayRecentInvitees(stats.recentInvitees);
    }
  } catch (error) {
    console.error('載入邀請統計失敗:', error);
  }
}
```

---

### 7. 🏆 邀請排行榜

**接口地址**: `GET /invites/leaderboard`  
**完整URL**: `http://localhost:7070/api/v1/invites/leaderboard`  
**需要認證**: ✅ 是  
**權限要求**: 普通用戶  

#### 功能描述
獲取邀請排行榜，可以指定時間範圍和顯示數量。

#### 請求參數（查詢參數）
- `limit`: 限制數量（1-100，默認10）
- `startDate`: 開始日期（ISO8601格式，可選）
- `endDate`: 結束日期（ISO8601格式，可選）

#### 完整URL示例
```
http://localhost:7070/api/v1/invites/leaderboard?limit=10&startDate=2024-01-01&endDate=2024-01-31
```

#### 響應示例
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "64f1234567890abcdef12345",
        "userName": "王五",
        "totalInvited": 25,
        "totalBonus": 250,
        "inviteCode": "WANG123",
        "avatarUrl": null
      },
      {
        "rank": 2,
        "userId": "64f1234567890abcdef12346",
        "userName": "李六",
        "totalInvited": 20,
        "totalBonus": 200,
        "inviteCode": "LI456",
        "avatarUrl": null
      }
    ],
    "myRanking": {
      "rank": 15,
      "totalInvited": 8,
      "totalBonus": 80,
      "userName": "張三"
    },
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "totalParticipants": 150
  }
}
```

#### 前端使用示例
```javascript
async function loadLeaderboard(limit = 10, startDate = null, endDate = null) {
  try {
    let url = `http://localhost:7070/api/v1/invites/leaderboard?limit=${limit}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    const data = await response.json();
    if (data.success) {
      // 顯示排行榜
      displayLeaderboard(data.data.leaderboard);
      
      // 顯示我的排名
      displayMyRanking(data.data.myRanking);
    }
  } catch (error) {
    console.error('載入排行榜失敗:', error);
  }
}

// 顯示排行榜
function displayLeaderboard(leaderboard) {
  const container = document.getElementById('leaderboard-container');
  container.innerHTML = leaderboard.map(user => `
    <div class="leaderboard-item">
      <span class="rank">#${user.rank}</span>
      <span class="name">${user.userName}</span>
      <span class="stats">${user.totalInvited}人 / ${user.totalBonus}次</span>
    </div>
  `).join('');
}
```

---

## 🔧 管理員專用接口

### 8. 👤 獲取指定用戶邀請統計

**接口地址**: `GET /invites/user/{userId}/stats`  
**完整URL**: `http://localhost:7070/api/v1/invites/user/{userId}/stats`  
**需要認證**: ✅ 是  
**權限要求**: 管理員  

#### 功能描述
管理員查看指定用戶的邀請統計信息。

#### 請求參數
- `userId`: 用戶ID（路徑參數，MongoDB ObjectId格式）

#### URL示例
```
http://localhost:7070/api/v1/invites/user/64f1234567890abcdef12345/stats
```

#### 響應示例
響應格式與「獲取我的邀請統計」相同。

---

### 9. 📈 邀請系統統計

**接口地址**: `GET /invites/system-stats`  
**完整URL**: `http://localhost:7070/api/v1/invites/system-stats`  
**需要認證**: ✅ 是  
**權限要求**: 管理員  

#### 功能描述
獲取整個邀請系統的統計信息，用於管理後台的數據分析。

#### 請求參數（查詢參數）
- `startDate`: 開始日期（ISO8601格式，可選）
- `endDate`: 結束日期（ISO8601格式，可選）

#### 響應示例
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1250,                    // 總用戶數
      "totalInvitations": 320,               // 總邀請數
      "totalBonusDistributed": 3200,         // 總發放獎勵次數
      "invitationRate": 25.6,                // 邀請率 (%)
      "avgInvitesPerUser": 2.5,              // 平均每用戶邀請數
      "activeInviters": 128                  // 活躍邀請者數量
    },
    "topInviters": [                         // 頂級邀請者
      {
        "userId": "64f1234567890abcdef12345",
        "userName": "王五",
        "totalInvited": 25,
        "totalBonus": 250,
        "inviteCode": "WANG123"
      }
    ],
    "dailyStats": [                          // 每日統計
      {
        "date": "2024-01-01",
        "newInvitations": 5,
        "bonusDistributed": 50,
        "newUsers": 12
      }
    ],
    "monthlyTrends": [                       // 月度趨勢
      {
        "month": "2024-01",
        "totalInvitations": 85,
        "totalBonus": 850,
        "newUsers": 200
      }
    ],
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    }
  }
}
```

---

## 🛠️ 前端開發指南

### 1. 邀請碼管理組件

#### 基本邀請碼顯示組件
```javascript
class InviteCodeManager {
  constructor(containerId, userToken) {
    this.container = document.getElementById(containerId);
    this.userToken = userToken;
    this.init();
  }
  
  async init() {
    await this.loadInviteCode();
    this.bindEvents();
  }
  
  async loadInviteCode() {
    try {
      const response = await fetch('http://localhost:7070/api/v1/invites/my-code', {
        headers: {
          'Authorization': `Bearer ${this.userToken}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        this.renderInviteCode(data.data);
      }
    } catch (error) {
      console.error('載入邀請碼失敗:', error);
    }
  }
  
  renderInviteCode(data) {
    this.container.innerHTML = `
      <div class="invite-code-card">
        <h3>我的邀請碼</h3>
        <div class="invite-code-display">
          <span class="code">${data.inviteCode}</span>
          <button class="copy-btn" onclick="this.copyToClipboard('${data.inviteCode}')">
            複製
          </button>
        </div>
        <div class="invite-url">
          <input type="text" value="${data.inviteUrl}" readonly>
          <button class="copy-btn" onclick="this.copyToClipboard('${data.inviteUrl}')">
            複製鏈接
          </button>
        </div>
        <button class="regenerate-btn">重新生成</button>
      </div>
    `;
  }
  
  bindEvents() {
    this.container.querySelector('.regenerate-btn')?.addEventListener('click', () => {
      this.regenerateCode();
    });
  }
  
  async regenerateCode() {
    if (!confirm('確定要重新生成邀請碼嗎？舊的邀請碼將失效。')) return;
    
    try {
      const response = await fetch('http://localhost:7070/api/v1/invites/regenerate-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.userToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      if (data.success) {
        this.renderInviteCode(data.data);
        alert('邀請碼重新生成成功！');
      }
    } catch (error) {
      console.error('重新生成邀請碼失敗:', error);
    }
  }
  
  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert('已複製到剪貼板！');
    });
  }
}

// 使用示例
const inviteManager = new InviteCodeManager('invite-code-container', userToken);
```

### 2. 邀請統計儀表板

```javascript
class InviteStatsDashboard {
  constructor(containerId, userToken) {
    this.container = document.getElementById(containerId);
    this.userToken = userToken;
    this.init();
  }
  
  async init() {
    await this.loadStats();
  }
  
  async loadStats() {
    try {
      const response = await fetch('http://localhost:7070/api/v1/invites/my-stats', {
        headers: {
          'Authorization': `Bearer ${this.userToken}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        this.renderStats(data.data);
      }
    } catch (error) {
      console.error('載入統計失敗:', error);
    }
  }
  
  renderStats(stats) {
    this.container.innerHTML = `
      <div class="stats-dashboard">
        <div class="stats-grid">
          <div class="stat-card">
            <h4>總邀請人數</h4>
            <span class="stat-number">${stats.totalInvited}</span>
          </div>
          <div class="stat-card">
            <h4>總獲得獎勵</h4>
            <span class="stat-number">${stats.totalBonusEarned}</span>
          </div>
          <div class="stat-card">
            <h4>本月邀請</h4>
            <span class="stat-number">${stats.thisMonthInvited}</span>
          </div>
          <div class="stat-card">
            <h4>排行榜排名</h4>
            <span class="stat-number">#${stats.ranking}</span>
          </div>
        </div>
        
        <div class="recent-invitees">
          <h4>最近邀請的用戶</h4>
          <div class="invitee-list">
            ${stats.recentInvitees.map(invitee => `
              <div class="invitee-item">
                <span class="name">${invitee.name}</span>
                <span class="date">${new Date(invitee.invitedAt).toLocaleDateString()}</span>
                <span class="bonus">+${invitee.bonusReceived}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}
```

### 3. 註冊頁面邀請碼驗證

```javascript
class RegistrationInviteValidator {
  constructor(inputId, resultId) {
    this.input = document.getElementById(inputId);
    this.result = document.getElementById(resultId);
    this.bindEvents();
  }
  
  bindEvents() {
    this.input.addEventListener('blur', () => {
      this.validateInviteCode();
    });
    
    this.input.addEventListener('input', () => {
      // 清除之前的驗證結果
      this.clearValidationResult();
    });
  }
  
  async validateInviteCode() {
    const inviteCode = this.input.value.trim();
    if (!inviteCode) {
      this.clearValidationResult();
      return;
    }
    
    try {
      const response = await fetch('http://localhost:7070/api/v1/invites/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inviteCode })
      });
      
      const data = await response.json();
      if (data.success) {
        this.showValidationSuccess(data.data.inviter);
      } else {
        this.showValidationError(data.message);
      }
    } catch (error) {
      this.showValidationError('驗證邀請碼時發生錯誤');
    }
  }
  
  showValidationSuccess(inviter) {
    this.result.innerHTML = `
      <div class="validation-success">
        ✅ 邀請碼有效！
        <div class="inviter-info">
          邀請人: ${inviter.name}
        </div>
      </div>
    `;
    this.input.classList.add('valid');
    this.input.classList.remove('invalid');
  }
  
  showValidationError(message) {
    this.result.innerHTML = `
      <div class="validation-error">
        ❌ ${message}
      </div>
    `;
    this.input.classList.add('invalid');
    this.input.classList.remove('valid');
  }
  
  clearValidationResult() {
    this.result.innerHTML = '';
    this.input.classList.remove('valid', 'invalid');
  }
}

// 使用示例
const inviteValidator = new RegistrationInviteValidator('inviteCodeInput', 'validationResult');
```

---

## 🎨 CSS 樣式建議

```css
/* 邀請碼卡片樣式 */
.invite-code-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.invite-code-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
}

.invite-code-display .code {
  font-family: 'Courier New', monospace;
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  border: 2px dashed #3498db;
}

.copy-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.copy-btn:hover {
  background: #2980b9;
}

/* 統計儀表板樣式 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-number {
  display: block;
  font-size: 32px;
  font-weight: bold;
  color: #3498db;
  margin-top: 8px;
}

/* 排行榜樣式 */
.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  transition: background-color 0.3s;
}

.leaderboard-item:hover {
  background-color: #f8f9fa;
}

.leaderboard-item.top-three {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  font-weight: bold;
}

.rank {
  font-size: 20px;
  margin-right: 16px;
  min-width: 40px;
}

/* 驗證樣式 */
.validation-success {
  color: #27ae60;
  padding: 8px;
  background: #d4edda;
  border-radius: 4px;
  margin-top: 8px;
}

.validation-error {
  color: #e74c3c;
  padding: 8px;
  background: #f8d7da;
  border-radius: 4px;
  margin-top: 8px;
}

input.valid {
  border-color: #27ae60;
}

input.invalid {
  border-color: #e74c3c;
}
```

---

## 🚨 錯誤處理

### 常見錯誤碼和處理方式

```javascript
class ApiErrorHandler {
  static handle(error, response) {
    switch (response?.status) {
      case 400:
        return this.handleBadRequest(error);
      case 401:
        return this.handleUnauthorized();
      case 403:
        return this.handleForbidden();
      case 404:
        return this.handleNotFound();
      case 429:
        return this.handleRateLimit();
      case 500:
        return this.handleServerError();
      default:
        return this.handleUnknownError(error);
    }
  }
  
  static handleBadRequest(error) {
    console.error('請求參數錯誤:', error);
    return '請求參數錯誤，請檢查輸入內容';
  }
  
  static handleUnauthorized() {
    console.error('未授權訪問');
    // 跳轉到登錄頁面
    window.location.href = '/login';
    return '請先登錄';
  }
  
  static handleForbidden() {
    console.error('權限不足');
    return '權限不足，請聯繫管理員';
  }
  
  static handleNotFound() {
    console.error('資源不存在');
    return '請求的資源不存在';
  }
  
  static handleRateLimit() {
    console.error('請求過於頻繁');
    return '請求過於頻繁，請稍後再試';
  }
  
  static handleServerError() {
    console.error('服務器錯誤');
    return '服務器錯誤，請稍後重試';
  }
  
  static handleUnknownError(error) {
    console.error('未知錯誤:', error);
    return '發生未知錯誤，請聯繫技術支持';
  }
}

// 使用示例
async function apiCall(url, options) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = ApiErrorHandler.handle(data, response);
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    console.error('API調用失敗:', error);
    throw error;
  }
}
```

---

## 📱 響應式設計建議

```css
/* 手機端適配 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .invite-code-display {
    flex-direction: column;
    align-items: stretch;
  }
  
  .invite-code-display .code {
    font-size: 18px;
    text-align: center;
  }
  
  .leaderboard-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .invite-url input {
    width: 100%;
    margin-bottom: 8px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .invite-code-card {
    padding: 16px;
  }
  
  .stat-number {
    font-size: 24px;
  }
}
```

---

## 🔧 開發環境配置

### 環境變量設置
```javascript
// config.js
const config = {
  development: {
    apiBaseUrl: 'http://localhost:7070/api/v1',
    frontendUrl: 'http://localhost:3000'
  },
  production: {
    apiBaseUrl: 'https://your-production-api.com/api/v1',
    frontendUrl: 'https://your-production-frontend.com'
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

### API 客戶端封裝
```javascript
// apiClient.js
import config from './config.js';

class ApiClient {
  constructor() {
    this.baseUrl = config.apiBaseUrl;
    this.token = localStorage.getItem('authToken');
  }
  
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '請求失敗');
      }
      
      return data;
    } catch (error) {
      console.error('API請求失敗:', error);
      throw error;
    }
  }
  
  // 邀請管理相關方法
  async getMyInviteCode() {
    return this.request('/invites/my-code');
  }
  
  async regenerateInviteCode() {
    return this.request('/invites/regenerate-code', { method: 'POST' });
  }
  
  async validateInviteCode(inviteCode) {
    return this.request('/invites/validate', {
      method: 'POST',
      body: JSON.stringify({ inviteCode })
    });
  }
  
  async getMyInviteStats() {
    return this.request('/invites/my-stats');
  }
  
  async getLeaderboard(limit = 10, startDate = null, endDate = null) {
    let endpoint = `/invites/leaderboard?limit=${limit}`;
    if (startDate) endpoint += `&startDate=${startDate}`;
    if (endDate) endpoint += `&endDate=${endDate}`;
    return this.request(endpoint);
  }
}

export default new ApiClient();
```

---

## 📋 測試建議

### 單元測試示例
```javascript
// inviteApi.test.js
import ApiClient from '../apiClient.js';

describe('邀請管理 API', () => {
  beforeEach(() => {
    // 設置測試token
    ApiClient.setToken('test-token');
  });
  
  test('獲取邀請碼', async () => {
    const result = await ApiClient.getMyInviteCode();
    expect(result.success).toBe(true);
    expect(result.data.inviteCode).toBeDefined();
  });
  
  test('驗證邀請碼', async () => {
    const result = await ApiClient.validateInviteCode('TEST123');
    expect(result.success).toBeDefined();
  });
  
  test('獲取邀請統計', async () => {
    const result = await ApiClient.getMyInviteStats();
    expect(result.success).toBe(true);
    expect(result.data.totalInvited).toBeGreaterThanOrEqual(0);
  });
});
```

---

## 📞 技術支持

如果在使用過程中遇到問題，請聯繫：

- **後端開發團隊**: [後端負責人聯繫方式]
- **技術文檔**: 本文檔將持續更新
- **API測試頁面**: `http://localhost:7070/test-api.html`

---

## 📝 更新日誌

### v1.0 (2024-12)
- 初始版本發布
- 包含所有邀請管理核心功能
- 提供完整的前端開發指南

---

**注意**: 本文檔基於當前後端API實現編寫，如有API變更請及時更新此文檔。 