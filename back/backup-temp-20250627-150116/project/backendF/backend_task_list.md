# 勞法通AI後端開發任務清單

## 1. 簡介與目標

本文檔旨在為勞法通AI顧問專案的後端服務提供完整的任務清單和開發指引。後端服務基於Express.js框架開發，使用MongoDB作為數據庫，提供API接口給前端Vue.js應用程式調用。

### 1.1 後端技術棧

- **框架**: Express.js
- **數據庫**: MongoDB (使用Mongoose ODM)
- **認證機制**: JWT (JSON Web Tokens)
- **環境配置**: dotenv
- **數據驗證**: express-validator
- **API文檔**: Swagger/OpenAPI

### 1.2 開發環境配置

- **後端服務器名稱**: ailabordevbox
- **後端API端口**: 3001
- **內網調試地址**: http://ailabordevbox.ns-2rlrcc3k.svc.cluster.local:3001
- **公網調試地址**: https://wrrfvodsaofk.sealosgzg.site

### 1.3 數據庫連接信息

- **數據庫名稱**: aialabr
- **數據庫類型**: MongoDB
- **用戶名/密碼**: root/8w2kv62n
- **內網連接字符串**: mongodb://root:8w2kv62n@aialabr-mongodb.ns-2rlrcc3k.svc:27017
- **外網連接字符串**: mongodb://root:8w2kv62n@dbconn.sealosgzg.site:46203/?directConnection=true

## 2. 系統架構概述

### 2.1 系統架構圖

```
Client <--> CDN <--> Frontend (Vue) <--> Backend API (Express) <--> MongoDB
                                        ^
                                        |
                                        v
                                  N8N <--> AI服務
```

### 2.2 核心模塊

1. **用戶認證模塊**
   - 用戶註冊 
   - 用戶登入
   - 密碼重置
   - JWT認證

2. **用戶管理模塊**
   - 用戶資料管理
   - 用戶列表查詢
   - 諮詢次數管理

3. **聊天會話模塊**
   - 會話建立與管理
   - 消息記錄存儲與查詢
   - AI聊天紀錄同步

4. **專家諮詢模塊**
   - 諮詢請求提交與管理
   - 聯繫方式處理
   - 工單狀態追蹤

5. **系統管理模塊**
   - 系統設置
   - 數據統計
   - 日誌記錄

### 2.3 通用約定

#### API基本路徑
所有API端點均以`/api/v1`作為前綴，例如：`/api/v1/auth/login`

#### 認證機制
- 需要認證的接口，客户端應在HTTP請求的`Authorization` Header中携帶JWT令牌
- 格式: `Bearer <token>`
- 使用中間件驗證JWT有效性並提取用戶信息

#### 統一響應格式

**成功響應** (HTTP狀態碼 200 或 201):
```json
{
  "success": true,
  "message": "操作成功的描述信息",
  "data": { /* 響應數據 */ }
}
```

**列表數據響應**:
```json
{
  "success": true,
  "message": "獲取列表成功",
  "data": {
    "items": [/* 列表項 */],
    "totalItems": 100,
    "currentPage": 1,
    "totalPages": 10
  }
}
```

**錯誤響應** (HTTP狀態碼 4xx 或 5xx):
```json
{
  "success": false,
  "message": "具體的錯誤信息",
  "error": {
    "code": "ERROR_CODE_STRING",
    "details": { /* 更詳細的錯誤信息 */ }
  }
}
```

## 3. 數據庫模型設計

以下是系統所需的主要數據庫模型（使用Mongoose Schema風格）：

### 3.1 用戶模型 (User)

```javascript
// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '用戶名稱不能為空'],
    trim: true
  },
  email: {
    type: String,
    required: [true, '電子郵箱不能為空'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, '請輸入有效的電子郵箱地址']
  },
  password: {
    type: String,
    required: [true, '密碼不能為空'],
    minlength: [8, '密碼長度不能少於8位']
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  userType: {
    type: String,
    enum: ['admin', 'hr', 'employer', 'employee'],
    default: 'employee'
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'disabled'],
    default: 'active'
  },
  industry: {
    type: String,
    trim: true
  },
  occupation: {  // 對應前端的position字段
    type: String,
    trim: true
  },
  companyName: {
    type: String,
    trim: true
  },
  remainingQueries: {
    type: Number,
    default: 10,
    min: 0
  },
  totalConsultations: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// 密碼加密中間件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 密碼比較方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
```

### 3.2 聊天會話模型 (Conversation)

```javascript
// src/models/Conversation.js
import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: '新的對話'
  },
  preview: {
    type: String,
    default: '開始一個新的對話...'
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  messagesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
```

### 3.3 聊天消息模型 (Message)

```javascript
// src/models/Message.js
import mongoose from 'mongoose';

const referenceSchema = new mongoose.Schema({
  source: String,
  text: String,
  link: String
}, { _id: false });

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  type: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  references: [referenceSchema],
  feedback: {
    type: String,
    enum: ['helpful', 'not_helpful', null],
    default: null
  }
}, {
  timestamps: true
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
```

### 3.4 專家諮詢模型 (ExpertConsultation)

```javascript
// src/models/ExpertConsultation.js
import mongoose from 'mongoose';

const expertConsultationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phoneNumber: String,
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  serviceType: String,
  preferredContactMethods: [{
    type: String,
    enum: ['phone', 'email', 'line']
  }],
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedExpert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  notes: String
}, {
  timestamps: true
});

const ExpertConsultation = mongoose.model('ExpertConsultation', expertConsultationSchema);
export default ExpertConsultation;
```

## 4. API端點設計與實現

以下是後端需要實現的API端點，按模塊劃分：

### 4.1 用戶認證模塊 (Auth) - 路由前綴: `/api/v1/auth`

#### 4.1.1 用戶註冊
- **端點**: `POST /register`
- **描述**: 創建新用戶帳戶
- **請求體**:
```json
{
  "name": "張三",
  "email": "zhangsan@example.com",
  "password": "Password123",
  "userType": "employee",
  "industry": "科技",
  "occupation": "工程師",
  "companyName": "台灣科技有限公司",
  "phoneNumber": "0912345678"
}
```
- **響應 (201 Created)**:
```json
{
  "success": true,
  "message": "註冊成功",
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "張三",
      "email": "zhangsan@example.com",
      "userType": "employee",
      "status": "active",
      "remainingQueries": 10
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 4.1.2 用戶登入
- **端點**: `POST /login`
- **描述**: 用戶登入並獲取認證令牌
- **請求體**:
```json
{
  "email": "zhangsan@example.com",
  "password": "Password123"
}
```
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "登入成功",
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "張三",
      "email": "zhangsan@example.com",
      "userType": "employee",
      "status": "active",
      "remainingQueries": 10,
      "phoneNumber": "0912345678",
      "industry": "科技",
      "occupation": "工程師",
      "companyName": "台灣科技有限公司"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 4.1.3 密碼重設請求
- **端點**: `POST /forgot-password`
- **描述**: 發送密碼重設連結到用戶郵箱
- **請求體**:
```json
{
  "email": "zhangsan@example.com"
}
```
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "密碼重設連結已發送到您的郵箱"
}
```

#### 4.1.4 密碼重設
- **端點**: `POST /reset-password`
- **描述**: 使用重設令牌更新密碼
- **請求體**:
```json
{
  "token": "reset-token-from-email",
  "password": "NewPassword123"
}
```
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "密碼已成功重設"
}
```

#### 4.1.5 令牌刷新
- **端點**: `POST /refresh-token`
- **描述**: 刷新JWT認證令牌
- **請求頭**: `Authorization: Bearer <expired_token>`
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "令牌已刷新",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4.2 用戶管理模塊 (User) - 路由前綴: `/api/v1/users`

#### 4.2.1 獲取當前用戶資料
- **端點**: `GET /profile`
- **描述**: 獲取當前登入用戶的詳細資料
- **請求頭**: `Authorization: Bearer <token>`
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "獲取用戶資料成功",
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "張三",
      "email": "zhangsan@example.com",
      "userType": "employee",
      "status": "active",
      "remainingQueries": 10,
      "phoneNumber": "0912345678",
      "industry": "科技",
      "occupation": "工程師",
      "companyName": "台灣科技有限公司",
      "totalConsultations": 5
    }
  }
}
```

#### 4.2.2 更新用戶資料
- **端點**: `PUT /profile`
- **描述**: 更新當前登入用戶的資料
- **請求頭**: `Authorization: Bearer <token>`
- **請求體**:
```json
{
  "name": "張三(更新)",
  "phoneNumber": "0987654321",
  "industry": "金融科技",
  "occupation": "專案經理",
  "companyName": "台灣金融科技有限公司"
}
```
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "用戶資料已更新",
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "張三(更新)",
      "email": "zhangsan@example.com",
      "phoneNumber": "0987654321",
      "industry": "金融科技",
      "occupation": "專案經理",
      "companyName": "台灣金融科技有限公司",
      "userType": "employee",
      "status": "active",
      "remainingQueries": 10
    }
  }
}
```

#### 4.2.3 檢查剩餘諮詢次數
- **端點**: `GET /remaining-queries`
- **描述**: 獲取當前用戶剩餘的AI諮詢次數
- **請求頭**: `Authorization: Bearer <token>`
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "獲取剩餘諮詢次數成功",
  "data": {
    "remainingQueries": 7,
    "totalConsultations": 3
  }
}
```

#### 4.2.4 扣減諮詢次數
- **端點**: `POST /decrease-query`
- **描述**: 扣減當前用戶的AI諮詢次數
- **請求頭**: `Authorization: Bearer <token>`
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "諮詢次數已扣減",
  "data": {
    "remainingQueries": 6,
    "totalConsultations": 4
  }
}
```

### 4.3 管理員用戶管理模塊 (Admin) - 路由前綴: `/api/v1/admin/users`

#### 4.3.1 獲取用戶列表
- **端點**: `GET /`
- **描述**: 管理員獲取所有用戶列表，支持分頁和篩選
- **請求頭**: `Authorization: Bearer <admin_token>`
- **查詢參數**:
  - `page`: 頁碼 (默認 1)
  - `limit`: 每頁條數 (默認 10)
  - `status`: 篩選狀態 (active/pending/disabled)
  - `userType`: 篩選用戶類型
  - `search`: 搜索關鍵詞 (用戶名/郵箱)
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "獲取用戶列表成功",
  "data": {
    "items": [
      {
        "id": "60d21b4667d0d8992e610c85",
        "name": "張三",
        "email": "zhangsan@example.com",
        "userType": "employee",
        "status": "active",
        "remainingQueries": 10,
        "totalConsultations": 5,
        "createdAt": "2023-06-22T10:00:00Z"
      },
      // 更多用戶...
    ],
    "totalItems": 100,
    "currentPage": 1,
    "totalPages": 10
  }
}
```

#### 4.3.2 獲取用戶詳情
- **端點**: `GET /:userId`
- **描述**: 管理員獲取特定用戶的詳細資料
- **請求頭**: `Authorization: Bearer <admin_token>`
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "獲取用戶詳情成功",
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "張三",
      "email": "zhangsan@example.com",
      "userType": "employee",
      "status": "active",
      "remainingQueries": 10,
      "phoneNumber": "0912345678",
      "industry": "科技",
      "occupation": "工程師",
      "companyName": "台灣科技有限公司",
      "totalConsultations": 5,
      "createdAt": "2023-06-22T10:00:00Z",
      "updatedAt": "2023-06-23T15:30:00Z",
      "lastLogin": "2023-06-23T15:00:00Z"
    }
  }
}
```

#### 4.3.3 創建用戶
- **端點**: `POST /`
- **描述**: 管理員創建新用戶
- **請求頭**: `Authorization: Bearer <admin_token>`
- **請求體**:
```json
{
  "name": "李四",
  "email": "lisi@example.com",
  "password": "Password123",
  "userType": "employee",
  "status": "active",
  "remainingQueries": 20,
  "industry": "教育",
  "occupation": "老師",
  "companyName": "台灣教育學院"
}
```
- **響應 (201 Created)**:
```json
{
  "success": true,
  "message": "用戶創建成功",
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c86",
      "name": "李四",
      "email": "lisi@example.com",
      "userType": "employee",
      "status": "active",
      "remainingQueries": 20
    }
  }
}
```

#### 4.3.4 更新用戶
- **端點**: `PUT /:userId`
- **描述**: 管理員更新特定用戶的資料
- **請求頭**: `Authorization: Bearer <admin_token>`
- **請求體**:
```json
{
  "name": "李四(更新)",
  "status": "active",
  "remainingQueries": 30,
  "userType": "hr"
}
```
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "用戶更新成功",
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c86",
      "name": "李四(更新)",
      "email": "lisi@example.com",
      "userType": "hr",
      "status": "active",
      "remainingQueries": 30
    }
  }
}
```

#### 4.3.5 切換用戶狀態
- **端點**: `PATCH /:userId/status`
- **描述**: 管理員啟用/停用特定用戶
- **請求頭**: `Authorization: Bearer <admin_token>`
- **請求體**:
```json
{
  "status": "disabled"
}
```
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "用戶狀態已更新",
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c86",
      "status": "disabled"
    }
  }
}
```

#### 4.3.6 删除用戶
- **端點**: `DELETE /:userId`
- **描述**: 管理員删除特定用戶
- **請求頭**: `Authorization: Bearer <admin_token>`
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "用戶已刪除"
}
```

### 4.4 聊天會話模塊 (Conversation) - 路由前綴: `/api/v1/conversations`

#### 4.4.1 獲取會話列表
- **端點**: `GET /`
- **描述**: 獲取當前用戶的所有會話列表
- **請求頭**: `Authorization: Bearer <token>`
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "獲取會話列表成功",
  "data": {
    "conversations": [
      {
        "id": "60d21b4667d0d8992e610c87",
        "title": "關於加班費計算問題",
        "preview": "AI: 根據勞基法第24條...",
        "lastMessageTime": "2023-06-22T14:30:00Z",
        "messagesCount": 10,
        "createdAt": "2023-06-22T10:00:00Z"
      },
      {
        "id": "60d21b4667d0d8992e610c88",
        "title": "特休假怎麼算",
        "preview": "您: 我想問特休假的計算方式",
        "lastMessageTime": "2023-06-21T09:15:00Z",
        "messagesCount": 6,
        "createdAt": "2023-06-21T09:00:00Z"
      }
      // 更多會話...
    ]
  }
}
```

#### 4.4.2 創建新會話
- **端點**: `POST /`
- **描述**: 創建新的聊天會話
- **請求頭**: `Authorization: Bearer <token>`
- **請求體**:
```json
{
  "title": "新的法律諮詢"
}
```
- **響應 (201 Created)**:
```json
{
  "success": true,
  "message": "會話創建成功",
  "data": {
    "conversation": {
      "id": "60d21b4667d0d8992e610c89",
      "title": "新的法律諮詢",
      "preview": "開始一個新的對話...",
      "lastMessageTime": "2023-06-23T10:00:00Z",
      "messagesCount": 0,
      "createdAt": "2023-06-23T10:00:00Z"
    }
  }
}
```

#### 4.4.3 獲取會話詳情
- **端點**: `GET /:conversationId`
- **描述**: 獲取特定會話的詳細資料和消息
- **請求頭**: `Authorization: Bearer <token>`
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "獲取會話詳情成功",
  "data": {
    "conversation": {
      "id": "60d21b4667d0d8992e610c87",
      "title": "關於加班費計算問題",
      "preview": "AI: 根據勞基法第24條...",
      "lastMessageTime": "2023-06-22T14:30:00Z",
      "messagesCount": 10,
      "createdAt": "2023-06-22T10:00:00Z"
    },
    "messages": [
      {
        "id": "60d21b4667d0d8992e610c90",
        "type": "user",
        "content": "我想了解加班費怎麼計算",
        "createdAt": "2023-06-22T10:00:00Z"
      },
      {
        "id": "60d21b4667d0d8992e610c91",
        "type": "ai",
        "content": "根據勞基法第24條，延長工作時間在2小時以內者，加給1/3工資；超過2小時者，再加給2/3工資。",
        "references": [
          {
            "source": "勞動基準法",
            "text": "第24條",
            "link": "https://laws.mol.gov.tw/FLAW/FLAWDOC01.aspx?id=FL014930&flno=24"
          }
        ],
        "createdAt": "2023-06-22T10:00:30Z"
      }
      // 更多消息...
    ]
  }
}
```

#### 4.4.4 更新會話標題
- **端點**: `PUT /:conversationId`
- **描述**: 更新聊天會話的標題
- **請求頭**: `Authorization: Bearer <token>`
- **請求體**:
```json
{
  "title": "加班費計算諮詢"
}
```
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "會話標題已更新",
  "data": {
    "conversation": {
      "id": "60d21b4667d0d8992e610c87",
      "title": "加班費計算諮詢"
    }
  }
}
```

#### 4.4.5 删除會話
- **端點**: `DELETE /:conversationId`
- **描述**: 删除特定聊天會話及其所有消息
- **請求頭**: `Authorization: Bearer <token>`
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "會話已刪除"
}
```

### 4.5 聊天消息模塊 (Messages) - 路由前綴: `/api/v1/conversations/:conversationId/messages`

#### 4.5.1 獲取消息列表
- **端點**: `GET /`
- **描述**: 獲取特定會話的消息列表
- **請求頭**: `Authorization: Bearer <token>`
- **查詢參數**:
  - `limit`: 返回的消息數量 (默認 50)
  - `before`: 返回指定時間戳之前的消息
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "獲取消息列表成功",
  "data": {
    "messages": [
      {
        "id": "60d21b4667d0d8992e610c90",
        "type": "user",
        "content": "我想了解加班費怎麼計算",
        "createdAt": "2023-06-22T10:00:00Z"
      },
      {
        "id": "60d21b4667d0d8992e610c91",
        "type": "ai",
        "content": "根據勞基法第24條，延長工作時間在2小時以內者，加給1/3工資；超過2小時者，再加給2/3工資。",
        "references": [
          {
            "source": "勞動基準法",
            "text": "第24條",
            "link": "https://laws.mol.gov.tw/FLAW/FLAWDOC01.aspx?id=FL014930&flno=24"
          }
        ],
        "createdAt": "2023-06-22T10:00:30Z"
      }
      // 更多消息...
    ]
  }
}
```

#### 4.5.2 發送用戶消息
- **端點**: `POST /`
- **描述**: 發送新的用戶消息並獲取AI回复
- **請求頭**: `Authorization: Bearer <token>`
- **請求體**:
```json
{
  "content": "特休假怎麼計算？"
}
```
- **響應 (201 Created)**:
```json
{
  "success": true,
  "message": "消息發送成功",
  "data": {
    "userMessage": {
      "id": "60d21b4667d0d8992e610c92",
      "type": "user",
      "content": "特休假怎麼計算？",
      "createdAt": "2023-06-23T11:00:00Z"
    },
    "aiResponse": {
      "id": "60d21b4667d0d8992e610c93",
      "type": "ai",
      "content": "根據勞基法第38條，勞工在同一雇主或事業單位，繼續工作滿一定期間者，應依下列規定給予特別休假：\n1. 六個月以上一年未滿者，三日\n2. 一年以上二年未滿者，七日\n3. 二年以上三年未滿者，十日\n4. 三年以上五年未滿者，十四日\n5. 五年以上十年未滿者，十五日\n6. 十年以上者，每一年加給一日，加至三十日為止",
      "references": [
        {
          "source": "勞動基準法",
          "text": "第38條",
          "link": "https://laws.mol.gov.tw/FLAW/FLAWDOC01.aspx?id=FL014930&flno=38"
        }
      ],
      "createdAt": "2023-06-23T11:00:10Z"
    }
  }
}
```

#### 4.5.3 提供消息反饋
- **端點**: `POST /:messageId/feedback`
- **描述**: 為AI回复提供有用/無用的反饋
- **請求頭**: `Authorization: Bearer <token>`
- **請求體**:
```json
{
  "feedback": "helpful" // or "not_helpful"
}
```
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "反饋提交成功",
  "data": {
    "message": {
      "id": "60d21b4667d0d8992e610c91",
      "feedback": "helpful"
    }
  }
}
```

### 4.6 AI聊天集成 (Chat) - 路由前綴: `/api/v1/chat`

#### 4.6.1 發送聊天消息到AI
- **端點**: `POST /message`
- **描述**: 將用戶消息發送到AI服務並獲取回复
- **請求頭**: `Authorization: Bearer <token>`
- **請求體**:
```json
{
  "message": "我的試用期滿，公司要求我簽新合同，這合法嗎？",
  "sessionId": "session_1234567890",
  "metadata": {
    "nickname": "張三",
    "userType": "employee"
  }
}
```
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "AI回复成功",
  "data": {
    "response": "根據勞基法規定，試用期滿後，應視為正式僱用，公司不得以試用期滿為由要求勞工重新簽訂勞動契約。試用期其實是正式勞動契約的一部分，試用期間仍受勞基法保障。",
    "references": [
      {
        "source": "勞動基準法",
        "text": "勞動契約",
        "link": "https://laws.mol.gov.tw/FLAW/FLAWDOC01.aspx?id=FL014930&flno=9"
      }
    ],
    "sessionId": "session_1234567890"
  }
}
```

#### 4.6.2 載入歷史會話
- **端點**: `POST /load-session`
- **描述**: 載入特定會話ID的歷史消息
- **請求頭**: `Authorization: Bearer <token>`
- **請求體**:
```json
{
  "sessionId": "session_1234567890",
  "metadata": {
    "nickname": "張三"
  }
}
```
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "歷史會話載入成功",
  "data": {
    "messages": [
      {
        "role": "user",
        "content": "我的試用期滿，公司要求我簽新合同，這合法嗎？",
        "timestamp": "2023-06-22T10:00:00Z"
      },
      {
        "role": "ai",
        "content": "根據勞基法規定，試用期滿後，應視為正式僱用，公司不得以試用期滿為由要求勞工重新簽訂勞動契約。試用期其實是正式勞動契約的一部分，試用期間仍受勞基法保障。",
        "references": [
          {
            "source": "勞動基準法",
            "text": "勞動契約",
            "link": "https://laws.mol.gov.tw/FLAW/FLAWDOC01.aspx?id=FL014930&flno=9"
          }
        ],
        "timestamp": "2023-06-22T10:00:30Z"
      }
      // 更多消息...
    ],
    "sessionId": "session_1234567890"
  }
}
```

### 4.7 專家諮詢模塊 (Consultation) - 路由前綴: `/api/v1/consultations`

#### 4.7.1 提交專家諮詢請求
- **端點**: `POST /`
- **描述**: 提交新的專家諮詢請求
- **請求頭**: `Authorization: Bearer <token>`
- **請求體**:
```json
{
  "title": "被不當解雇的補償問題",
  "description": "我在公司工作3年，最近被無故解雇，想了解能獲得哪些補償...",
  "serviceType": "法律諮詢",
  "preferredContactMethods": ["phone", "email", "line"],
  "phoneNumber": "0912345678"
}
```
- **響應 (201 Created)**:
```json
{
  "success": true,
  "message": "諮詢請求已提交，專家將盡快與您聯繫",
  "data": {
    "consultation": {
      "id": "60d21b4667d0d8992e610c94",
      "title": "被不當解雇的補償問題",
      "status": "pending",
      "createdAt": "2023-06-23T15:00:00Z"
    }
  }
}
```

#### 4.7.2 獲取用戶諮詢列表
- **端點**: `GET /`
- **描述**: 獲取當前用戶的所有專家諮詢請求
- **請求頭**: `Authorization: Bearer <token>`
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "獲取諮詢列表成功",
  "data": {
    "consultations": [
      {
        "id": "60d21b4667d0d8992e610c94",
        "title": "被不當解雇的補償問題",
        "status": "pending",
        "serviceType": "法律諮詢",
        "createdAt": "2023-06-23T15:00:00Z"
      },
      {
        "id": "60d21b4667d0d8992e610c95",
        "title": "勞資爭議調解程序",
        "status": "in_progress",
        "serviceType": "勞資爭議",
        "assignedExpert": {
          "id": "60d21b4667d0d8992e610c96",
          "name": "王律師"
        },
        "createdAt": "2023-06-20T09:30:00Z"
      }
      // 更多諮詢...
    ]
  }
}
```

#### 4.7.3 獲取諮詢詳情
- **端點**: `GET /:consultationId`
- **描述**: 獲取特定專家諮詢的詳細資料
- **請求頭**: `Authorization: Bearer <token>`
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "獲取諮詢詳情成功",
  "data": {
    "consultation": {
      "id": "60d21b4667d0d8992e610c94",
      "title": "被不當解雇的補償問題",
      "description": "我在公司工作3年，最近被無故解雇，想了解能獲得哪些補償...",
      "status": "pending",
      "serviceType": "法律諮詢",
      "preferredContactMethods": ["phone", "email", "line"],
      "phoneNumber": "0912345678",
      "createdAt": "2023-06-23T15:00:00Z",
      "updatedAt": "2023-06-23T15:00:00Z"
    }
  }
}
```

#### 4.7.4 取消諮詢請求
- **端點**: `PATCH /:consultationId/cancel`
- **描述**: 取消尚未開始處理的諮詢請求
- **請求頭**: `Authorization: Bearer <token>`
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "諮詢請求已取消",
  "data": {
    "consultation": {
      "id": "60d21b4667d0d8992e610c94",
      "status": "cancelled"
    }
  }
}
```

### 4.8 管理員專家諮詢管理 (Admin) - 路由前綴: `/api/v1/admin/consultations`

#### 4.8.1 獲取所有諮詢請求
- **端點**: `GET /`
- **描述**: 管理員獲取所有專家諮詢請求
- **請求頭**: `Authorization: Bearer <admin_token>`
- **查詢參數**:
  - `page`: 頁碼 (默認 1)
  - `limit`: 每頁條數 (默認 10)
  - `status`: 篩選狀態 (pending/assigned/in_progress/completed/cancelled)
  - `search`: 搜索關鍵詞
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "獲取諮詢列表成功",
  "data": {
    "items": [
      {
        "id": "60d21b4667d0d8992e610c94",
        "title": "被不當解雇的補償問題",
        "status": "pending",
        "serviceType": "法律諮詢",
        "user": {
          "id": "60d21b4667d0d8992e610c85",
          "name": "張三",
          "email": "zhangsan@example.com"
        },
        "createdAt": "2023-06-23T15:00:00Z"
      },
      // 更多諮詢...
    ],
    "totalItems": 50,
    "currentPage": 1,
    "totalPages": 5
  }
}
```

#### 4.8.2 獲取諮詢詳情
- **端點**: `GET /:consultationId`
- **描述**: 管理員獲取特定諮詢的詳細資料
- **請求頭**: `Authorization: Bearer <admin_token>`
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "獲取諮詢詳情成功",
  "data": {
    "consultation": {
      "id": "60d21b4667d0d8992e610c94",
      "title": "被不當解雇的補償問題",
      "description": "我在公司工作3年，最近被無故解雇，想了解能獲得哪些補償...",
      "status": "pending",
      "serviceType": "法律諮詢",
      "preferredContactMethods": ["phone", "email", "line"],
      "phoneNumber": "0912345678",
      "user": {
        "id": "60d21b4667d0d8992e610c85",
        "name": "張三",
        "email": "zhangsan@example.com",
        "phoneNumber": "0912345678"
      },
      "assignedExpert": null,
      "notes": "",
      "createdAt": "2023-06-23T15:00:00Z",
      "updatedAt": "2023-06-23T15:00:00Z"
    }
  }
}
```

#### 4.8.3 更新諮詢狀態
- **端點**: `PATCH /:consultationId/status`
- **描述**: 更新諮詢請求的狀態
- **請求頭**: `Authorization: Bearer <admin_token>`
- **請求體**:
```json
{
  "status": "in_progress"
}
```
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "諮詢狀態已更新",
  "data": {
    "consultation": {
      "id": "60d21b4667d0d8992e610c94",
      "status": "in_progress"
    }
  }
}
```

#### 4.8.4 分配專家
- **端點**: `PATCH /:consultationId/assign`
- **描述**: 將諮詢請求分配給特定專家
- **請求頭**: `Authorization: Bearer <admin_token>`
- **請求體**:
```json
{
  "expertId": "60d21b4667d0d8992e610c96"
}
```
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "諮詢已分配給專家",
  "data": {
    "consultation": {
      "id": "60d21b4667d0d8992e610c94",
      "status": "assigned",
      "assignedExpert": {
        "id": "60d21b4667d0d8992e610c96",
        "name": "王律師"
      }
    }
  }
}
```

#### 4.8.5 添加管理備註
- **端點**: `PATCH /:consultationId/notes`
- **描述**: 添加或更新諮詢請求的管理備註
- **請求頭**: `Authorization: Bearer <admin_token>`
- **請求體**:
```json
{
  "notes": "客戶聯絡不上，已嘗試發送電子郵件通知"
}
```
- **響應 (200 OK)**:
```json
{
  "success": true,
  "message": "備註已更新",
  "data": {
    "consultation": {
      "id": "60d21b4667d0d8992e610c94",
      "notes": "客戶聯絡不上，已嘗試發送電子郵件通知"
    }
  }
}
```

## 5. 後端實現步驟

以下是逐步實現後端服務的建議步驟：

### 5.1 專案初始化

1. **建立專案結構**
   ```bash
   mkdir -p ailaborlaw-backend
   cd ailaborlaw-backend
   npm init -y
   ```

2. **安裝核心依賴**
   ```bash
   npm install express mongoose jsonwebtoken bcryptjs cors dotenv helmet express-validator morgan
   npm install --save-dev nodemon eslint jest supertest
   ```

3. **設置基本配置文件**
   - 創建 `.env` 文件，設置環境變量
   - 創建 `.gitignore`，排除敏感文件
   - 設置 `package.json` 的啟動腳本

4. **初始化目錄結構**
   ```
   src/
   ├── config/          # 配置文件
   ├── controllers/     # 控制器
   ├── middlewares/     # 中間件
   ├── models/          # 數據模型
   ├── routes/          # 路由定義
   ├── services/        # 業務邏輯
   ├── utils/           # 工具函數
   ├── app.js           # 應用入口
   └── server.js        # 服務器啟動
   ```

### 5.2 數據庫連接設置

1. **創建 MongoDB 連接配置**
   ```javascript
   // src/config/database.js
   import mongoose from 'mongoose';

   const connectDB = async () => {
     try {
       const conn = await mongoose.connect(process.env.MONGODB_URI, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
       });
       console.log(`MongoDB 連接成功: ${conn.connection.host}`);
     } catch (error) {
       console.error(`MongoDB 連接錯誤: ${error.message}`);
       process.exit(1);
     }
   };

   export default connectDB;
   ```

2. **創建數據模型**
   - 實現 `User` 模型 (參見第3.1節)
   - 實現 `Conversation` 模型 (參見第3.2節)
   - 實現 `Message` 模型 (參見第3.3節)
   - 實現 `ExpertConsultation` 模型 (參見第3.4節)

### 5.3 認證中間件

1. **JWT生成與驗證**
   ```javascript
   // src/utils/jwt.js
   import jwt from 'jsonwebtoken';

   export const generateToken = (userId, userType) => {
     return jwt.sign(
       { userId, userType },
       process.env.JWT_SECRET,
       { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
     );
   };

   export const verifyToken = (token) => {
     try {
       return jwt.verify(token, process.env.JWT_SECRET);
     } catch (error) {
       throw new Error('無效的令牌');
     }
   };
   ```

2. **認證中間件**
   ```javascript
   // src/middlewares/auth.js
   import { verifyToken } from '../utils/jwt.js';
   import User from '../models/User.js';

   export const authenticate = async (req, res, next) => {
     try {
       // 檢查請求頭是否包含Authorization
       const authHeader = req.headers.authorization;
       if (!authHeader || !authHeader.startsWith('Bearer ')) {
         return res.status(401).json({
           success: false,
           message: '未提供認證令牌',
           error: { code: 'UNAUTHORIZED' }
         });
       }

       // 獲取令牌
       const token = authHeader.split(' ')[1];
       if (!token) {
         return res.status(401).json({
           success: false,
           message: '未提供認證令牌',
           error: { code: 'UNAUTHORIZED' }
         });
       }

       // 驗證令牌
       const decoded = verifyToken(token);
       if (!decoded) {
         return res.status(401).json({
           success: false,
           message: '無效的認證令牌',
           error: { code: 'UNAUTHORIZED' }
         });
       }

       // 檢查用戶是否存在
       const user = await User.findById(decoded.userId);
       if (!user) {
         return res.status(401).json({
           success: false,
           message: '用戶不存在',
           error: { code: 'UNAUTHORIZED' }
         });
       }

       // 檢查用戶狀態
       if (user.status !== 'active') {
         return res.status(403).json({
           success: false,
           message: '用戶賬戶已停用',
           error: { code: 'FORBIDDEN' }
         });
       }

       // 將用戶信息添加到請求對象
       req.user = {
         id: user._id,
         email: user.email,
         name: user.name,
         userType: user.userType
       };

       next();
     } catch (error) {
       return res.status(401).json({
         success: false,
         message: error.message || '認證失敗',
         error: { code: 'UNAUTHORIZED' }
       });
     }
   };

   // 權限控制中間件
   export const authorizeAdmin = (req, res, next) => {
     if (req.user && req.user.userType === 'admin') {
       next();
     } else {
       return res.status(403).json({
         success: false,
         message: '權限不足',
         error: { code: 'FORBIDDEN' }
       });
     }
   };
   ```

### 5.4 路由實現

1. **認證路由**
   ```javascript
   // src/routes/auth.js
   import express from 'express';
   import { body } from 'express-validator';
   import * as authController from '../controllers/authController.js';
   import { validate } from '../middlewares/validate.js';

   const router = express.Router();

   // 註冊路由
   router.post(
     '/register',
     [
       body('name').notEmpty().withMessage('用戶名稱不能為空'),
       body('email').isEmail().withMessage('請提供有效的電子郵箱'),
       body('password').isLength({ min: 8 }).withMessage('密碼長度不能少於8位'),
       validate // 驗證中間件
     ],
     authController.register
   );

   // 登入路由
   router.post(
     '/login',
     [
       body('email').isEmail().withMessage('請提供有效的電子郵箱'),
       body('password').notEmpty().withMessage('密碼不能為空'),
       validate
     ],
     authController.login
   );

   // 密碼重設請求
   router.post(
     '/forgot-password',
     [
       body('email').isEmail().withMessage('請提供有效的電子郵箱'),
       validate
     ],
     authController.forgotPassword
   );

   // 密碼重設
   router.post(
     '/reset-password',
     [
       body('token').notEmpty().withMessage('令牌不能為空'),
       body('password').isLength({ min: 8 }).withMessage('密碼長度不能少於8位'),
       validate
     ],
     authController.resetPassword
   );

   // 令牌刷新
   router.post('/refresh-token', authController.refreshToken);

   export default router;
   ```

2. **依此模式完成其他路由**

### 5.5 控制器實現

1. **認證控制器**
   ```javascript
   // src/controllers/authController.js
   import User from '../models/User.js';
   import { generateToken } from '../utils/jwt.js';

   // 用戶註冊
   export const register = async (req, res) => {
     try {
       const { name, email, password, userType, industry, occupation, companyName, phoneNumber } = req.body;

       // 檢查郵箱是否已存在
       const existingUser = await User.findOne({ email });
       if (existingUser) {
         return res.status(400).json({
           success: false,
           message: '該郵箱已被註冊',
           error: { code: 'EMAIL_EXISTS' }
         });
       }

       // 創建新用戶
       const user = new User({
         name,
         email,
         password, // 密碼會在User模型的pre-save鉤子中自動加密
         userType: userType || 'employee',
         status: 'active', // 或'pending'，取決於是否需要郵箱驗證
         industry,
         occupation,
         companyName,
         phoneNumber
       });

       await user.save();

       // 生成JWT令牌
       const token = generateToken(user._id, user.userType);

       // 返回用戶信息和令牌
       return res.status(201).json({
         success: true,
         message: '註冊成功',
         data: {
           user: {
             id: user._id,
             name: user.name,
             email: user.email,
             userType: user.userType,
             status: user.status,
             remainingQueries: user.remainingQueries
           },
           token
         }
       });
     } catch (error) {
       console.error('註冊錯誤:', error);
       return res.status(500).json({
         success: false,
         message: '註冊過程中發生錯誤',
         error: { code: 'SERVER_ERROR' }
       });
     }
   };

   // 用戶登入
   export const login = async (req, res) => {
     try {
       const { email, password } = req.body;

       // 查找用戶
       const user = await User.findOne({ email });
       if (!user) {
         return res.status(401).json({
           success: false,
           message: '郵箱或密碼錯誤',
           error: { code: 'INVALID_CREDENTIALS' }
         });
       }

       // 檢查用戶狀態
       if (user.status === 'disabled') {
         return res.status(403).json({
           success: false,
           message: '用戶賬戶已被停用',
           error: { code: 'ACCOUNT_DISABLED' }
         });
       }

       // 檢查密碼
       const isPasswordValid = await user.comparePassword(password);
       if (!isPasswordValid) {
         return res.status(401).json({
           success: false,
           message: '郵箱或密碼錯誤',
           error: { code: 'INVALID_CREDENTIALS' }
         });
       }

       // 更新最後登入時間
       user.lastLogin = new Date();
       await user.save();

       // 生成JWT令牌
       const token = generateToken(user._id, user.userType);

       // 返回用戶信息和令牌
       return res.status(200).json({
         success: true,
         message: '登入成功',
         data: {
           user: {
             id: user._id,
             name: user.name,
             email: user.email,
             userType: user.userType,
             status: user.status,
             remainingQueries: user.remainingQueries,
             phoneNumber: user.phoneNumber,
             industry: user.industry,
             occupation: user.occupation,
             companyName: user.companyName
           },
           token
         }
       });
     } catch (error) {
       console.error('登入錯誤:', error);
       return res.status(500).json({
         success: false,
         message: '登入過程中發生錯誤',
         error: { code: 'SERVER_ERROR' }
       });
     }
   };

   // 其他認證控制器方法...
   ```

2. **依此模式完成其他控制器**

### 5.6 主應用設置

1. **應用入口**
   ```javascript
   // src/app.js
   import express from 'express';
   import cors from 'cors';
   import helmet from 'helmet';
   import morgan from 'morgan';
   import dotenv from 'dotenv';

   // 路由導入
   import authRoutes from './routes/auth.js';
   import userRoutes from './routes/users.js';
   import conversationRoutes from './routes/conversations.js';
   import chatRoutes from './routes/chat.js';
   import consultationRoutes from './routes/consultations.js';
   import adminUserRoutes from './routes/admin/users.js';
   import adminConsultationRoutes from './routes/admin/consultations.js';

   // 加載環境變量
   dotenv.config();

   const app = express();

   // 中間件
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));
   app.use(cors());
   app.use(helmet());
   app.use(morgan('dev'));

   // API路由
   app.use('/api/v1/auth', authRoutes);
   app.use('/api/v1/users', userRoutes);
   app.use('/api/v1/conversations', conversationRoutes);
   app.use('/api/v1/chat', chatRoutes);
   app.use('/api/v1/consultations', consultationRoutes);
   app.use('/api/v1/admin/users', adminUserRoutes);
   app.use('/api/v1/admin/consultations', adminConsultationRoutes);

   // 根路由
   app.get('/', (req, res) => {
     res.json({
       message: '勞法通AI後端API服務正在運行',
       version: '1.0.0'
     });
   });

   // 錯誤處理中間件
   app.use((req, res, next) => {
     const error = new Error('Not Found');
     error.status = 404;
     next(error);
   });

   app.use((error, req, res, next) => {
     res.status(error.status || 500);
     res.json({
       success: false,
       message: error.message,
       error: {
         code: error.status === 404 ? 'NOT_FOUND' : 'SERVER_ERROR'
       }
     });
   });

   export default app;
   ```

2. **服務器啟動**
   ```javascript
   // src/server.js
   import app from './app.js';
   import connectDB from './config/database.js';

   // 連接數據庫
   connectDB();

   // 設置端口
   const PORT = process.env.PORT || 3001;

   // 啟動服務器
   app.listen(PORT, () => {
     console.log(`服務器運行在 http://localhost:${PORT}`);
   });
   