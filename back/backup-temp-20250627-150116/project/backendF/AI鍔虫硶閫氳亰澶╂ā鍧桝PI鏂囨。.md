# AI劳法通聊天模块API文档 v1.0

## 📖 文档说明

本文档为前端开发提供完整的聊天模块API接口规范。前端可以基于此文档进行开发，使用Mock数据进行UI调试，后端完成后无缝对接。

**基础信息：**
- 基础URL: `https://wrrfvodsaofk.sealosgzg.site/api/v1/chat`
- 认证方式: JWT Bearer Token (已集成现有认证系统)
- 数据格式: JSON
- 字符编码: UTF-8

---

## 🔐 认证说明

所有接口都需要在Header中携带JWT Token：
```javascript
Authorization: Bearer <token>
```

**现有认证系统已集成：**
- 用户登录后获取token
- hasRemainingQueries中间件自动检查咨询次数
- 发送消息时自动扣减次数

---

## 📋 核心业务流程

### 用户聊天流程
1. **创建会话** → 2. **发送消息** → 3. **接收AI回复** → 4. **查看历史** → 5. **提供反馈**

### 管理员监控流程
1. **查看所有会话** → 2. **监控消息质量** → 3. **统计分析** → 4. **导出数据**

---

## 🚀 API接口详细规范

### 1. 会话管理 API

#### 1.1 创建新会话
```
POST /api/v1/chat/sessions
```

**请求参数：**
```json
{
  "title": "关于加班费的问题" // 可选，不传则自动生成
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "会话创建成功",
  "data": {
    "sessionId": "sess_1732373814567_k8m2n9p1q",
    "title": "关于加班费的问题",
    "status": "active",
    "messageCount": 0,
    "createdAt": "2024-05-24T10:30:00.000Z",
    "lastMessageAt": "2024-05-24T10:30:00.000Z"
  }
}
```

#### 1.2 获取用户会话列表
```
GET /api/v1/chat/sessions?page=1&limit=20&search=加班
```

**查询参数：**
- `page`: 页码(默认1)
- `limit`: 每页数量(默认20，最大50)
- `search`: 搜索关键词(可选)

**响应示例：**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "sess_1732373814567_k8m2n9p1q",
        "title": "关于加班费的问题",
        "status": "active",
        "messageCount": 5,
        "lastMessageAt": "2024-05-24T11:45:00.000Z",
        "createdAt": "2024-05-24T10:30:00.000Z",
        "duration": 4500 // 秒
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalSessions": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### 1.3 获取会话详情
```
GET /api/v1/chat/sessions/{sessionId}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "session": {
      "sessionId": "sess_1732373814567_k8m2n9p1q",
      "title": "关于加班费的问题",
      "status": "active",
      "messageCount": 5,
      "createdAt": "2024-05-24T10:30:00.000Z",
      "lastMessageAt": "2024-05-24T11:45:00.000Z",
      "duration": 4500
    },
    "messages": [
      {
        "messageId": "msg_1732373825123_a1b2c3d4e",
        "role": "user",
        "content": "请问加班费的计算方式？",
        "status": "sent",
        "createdAt": "2024-05-24T10:30:15.000Z"
      },
      {
        "messageId": "msg_1732373835456_f5g6h7i8j",
        "role": "ai",
        "content": "根据劳动基准法第24条规定，雇主延长劳工工作时间者，其延长工作时间之工资，依下列标准加给...",
        "status": "sent",
        "processingTime": 2340,
        "references": [
          {
            "law": "劳动基准法",
            "article": "第24条",
            "content": "雇主延长劳工工作时间者，其延长工作时间之工资，依下列标准加给：一、延长工作时间在二小时以内者，按平日每小时工资额加给三分之一以上。",
            "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=N0030001"
          }
        ],
        "feedback": null,
        "createdAt": "2024-05-24T10:30:18.340Z"
      }
    ]
  }
}
```

#### 1.4 更新会话标题
```
PUT /api/v1/chat/sessions/{sessionId}
```

**请求参数：**
```json
{
  "title": "新的会话标题"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "会话标题更新成功",
  "data": {
    "sessionId": "sess_1732373814567_k8m2n9p1q",
    "title": "新的会话标题"
  }
}
```

#### 1.5 删除会话
```
DELETE /api/v1/chat/sessions/{sessionId}
```

**响应示例：**
```json
{
  "success": true,
  "message": "会话已删除",
  "data": {
    "deletedSessionId": "sess_1732373814567_k8m2n9p1q",
    "deletedMessages": 5
  }
}
```

### 2. 消息管理 API

#### 2.1 发送消息并获取AI回复 ⭐ 核心功能
```
POST /api/v1/chat/sessions/{sessionId}/messages
```

**请求参数：**
```json
{
  "content": "请问加班费的计算方式？",
  "messageType": "question" // question, follow-up, clarification
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "消息发送成功",
  "data": {
    "userMessage": {
      "messageId": "msg_1732373825123_a1b2c3d4e",
      "role": "user",
      "content": "请问加班费的计算方式？",
      "status": "sent",
      "createdAt": "2024-05-24T10:30:15.000Z"
    },
    "aiResponse": {
      "messageId": "msg_1732373835456_f5g6h7i8j",
      "role": "ai",
      "content": "根据劳动基准法第24条规定，雇主延长劳工工作时间者，其延长工作时间之工资，依下列标准加给：\n\n一、延长工作时间在二小时以内者，按平日每小时工资额加给三分之一以上。\n二、再延长工作时间在二小时以内者，按平日每小时工资额加给三分之二以上。\n三、依第三十二条第四项规定，延长工作时间者，按平日每小时工资额加倍发给。",
      "status": "sent",
      "processingTime": 2340,
      "references": [
        {
          "law": "劳动基准法",
          "article": "第24条",
          "content": "雇主延长劳工工作时间者，其延长工作时间之工资，依下列标准加给：一、延长工作时间在二小时以内者，按平日每小时工资额加给三分之一以上。",
          "url": "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=N0030001"
        }
      ],
      "createdAt": "2024-05-24T10:30:18.340Z"
    },
    "remainingQueries": 9, // 用户剩余咨询次数
    "sessionUpdated": {
      "messageCount": 2,
      "lastMessageAt": "2024-05-24T10:30:18.340Z"
    }
  }
}
```

#### 2.2 获取会话消息列表
```
GET /api/v1/chat/sessions/{sessionId}/messages?page=1&limit=50&before=2024-05-24T10:30:00.000Z
```

**查询参数：**
- `page`: 页码(默认1)
- `limit`: 每页数量(默认50)
- `before`: 获取指定时间之前的消息(可选，用于无限滚动)

**响应示例：**
```json
{
  "success": true,
  "data": {
    "messages": [
      // 消息数组，按时间正序排列
    ],
    "pagination": {
      "currentPage": 1,
      "totalMessages": 10,
      "hasMore": false
    }
  }
}
```

#### 2.3 为AI回复提供反馈
```
POST /api/v1/chat/sessions/{sessionId}/messages/{messageId}/feedback
```

**请求参数：**
```json
{
  "feedback": "helpful" // helpful, not_helpful
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "反馈提交成功",
  "data": {
    "messageId": "msg_1732373835456_f5g6h7i8j",
    "feedback": "helpful",
    "feedbackAt": "2024-05-24T10:35:00.000Z"
  }
}
```

### 3. 管理后台 API

#### 3.1 获取所有用户会话 (管理员权限)
```
GET /api/v1/chat/admin/sessions?page=1&limit=20&status=active&userId=用户ID&search=关键词
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "sess_1732373814567_k8m2n9p1q",
        "userId": "60d5f483e8b0d41234567890",
        "userName": "张三",
        "userEmail": "zhangsan@example.com",
        "title": "关于加班费的问题",
        "messageCount": 5,
        "status": "active",
        "createdAt": "2024-05-24T10:30:00.000Z",
        "lastMessageAt": "2024-05-24T11:45:00.000Z"
      }
    ],
    "stats": {
      "totalSessions": 156,
      "activeSessions": 89,
      "completedSessions": 67,
      "avgMessagesPerSession": 4.2
    }
  }
}
```

#### 3.2 获取聊天统计数据 (管理员权限)
```
GET /api/v1/chat/admin/stats?startDate=2024-05-01&endDate=2024-05-24
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalSessions": 156,
      "totalMessages": 658,
      "totalUsers": 89,
      "avgSessionDuration": 320, // 秒
      "avgResponseTime": 2.1 // 秒
    },
    "dailyStats": [
      {
        "date": "2024-05-24",
        "sessions": 12,
        "messages": 48,
        "avgResponseTime": 2.3
      }
    ],
    "feedbackStats": {
      "helpful": 142,
      "not_helpful": 28,
      "satisfaction": 83.5 // 百分比
    },
    "topCategories": [
      { "category": "加班费", "count": 34 },
      { "category": "休假", "count": 28 }
    ]
  }
}
```

#### 3.3 导出聊天记录 (管理员权限)
```
POST /api/v1/chat/admin/export
```

**请求参数：**
```json
{
  "startDate": "2024-05-01",
  "endDate": "2024-05-24",
  "format": "excel", // excel, csv
  "includeUserInfo": true,
  "sessionIds": ["sess_123", "sess_456"] // 可选，导出特定会话
}
```

---

## 🚨 错误码定义

### 通用错误码
| 错误码 | HTTP状态码 | 说明 | 解决方案 |
|--------|------------|------|----------|
| AUTH_001 | 401 | 未认证 | 重新登录获取token |
| AUTH_002 | 403 | 权限不足 | 检查用户权限 |
| QUOTA_001 | 429 | 咨询次数不足 | 引导用户购买套餐 |

### 聊天模块错误码
| 错误码 | HTTP状态码 | 说明 | 解决方案 |
|--------|------------|------|----------|
| CHAT_001 | 404 | 会话不存在 | 检查sessionId是否正确 |
| CHAT_002 | 403 | 无权访问此会话 | 验证会话所有权 |
| CHAT_003 | 400 | 消息内容为空或过长 | 检查content字段 |
| CHAT_004 | 500 | AI服务暂时不可用 | 显示降级提示，建议稍后重试 |
| CHAT_005 | 404 | 消息不存在 | 检查messageId是否正确 |
| CHAT_006 | 500 | 反馈提交失败 | 重试或联系客服 |

### 错误响应格式
```json
{
  "success": false,
  "error": {
    "code": "CHAT_001",
    "message": "会话不存在",
    "details": "Session with ID sess_123 not found"
  }
}
```

---

## 💡 前端开发建议

### 1. 状态管理
```javascript
// 建议的状态结构
const chatState = {
  currentSession: null,
  sessions: [],
  messages: {},
  loading: {
    sessions: false,
    messages: false,
    sending: false
  },
  pagination: {
    sessions: { page: 1, hasMore: true },
    messages: { hasMore: false }
  }
}
```

### 2. 实时体验优化
```javascript
// 消息发送流程
1. 立即在UI中显示用户消息 (status: 'sending')
2. 调用API发送消息
3. 显示"AI正在思考..."加载状态
4. 接收AI回复后更新UI
5. 处理错误情况并提供重试选项
```

### 3. Mock数据示例
```javascript
// 开发期间可以使用的Mock数据
const mockSessions = [
  {
    sessionId: "sess_mock_001",
    title: "关于加班费的问题",
    messageCount: 3,
    lastMessageAt: new Date().toISOString(),
    status: "active"
  }
];
```

### 4. 关键交互设计
- **创建会话**：点击"新对话"按钮
- **发送消息**：Enter发送，Shift+Enter换行
- **消息反馈**：AI回复下方显示👍👎按钮
- **会话切换**：侧边栏会话列表
- **错误处理**：网络错误时显示重试按钮

---

## 🔄 开发和测试计划

### 阶段1：基础功能 (第1-2天)
- [ ] 会话创建和列表
- [ ] 消息发送和显示
- [ ] AI回复展示

### 阶段2：完整功能 (第3天)
- [ ] 消息反馈
- [ ] 会话管理（删除、重命名）
- [ ] 错误处理

### 阶段3：管理后台 (第4天)
- [ ] 管理员监控界面
- [ ] 统计数据展示
- [ ] 数据导出

**前端可以立即开始开发，使用Mock数据测试UI，我们完成一个功能就立即提供真实API进行联调。**

---

## 📞 技术支持

如有任何接口疑问或需要调整，请随时沟通！我们会确保API的稳定性和易用性。 