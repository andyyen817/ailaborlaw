# AI 劳基法顾问 - 后端 API 用户注册/登入,后台管理登入/用户管理测试文档

## 1. 引言

本文档旨在为 AI 劳基法顾问项目的前端开发团队提供后端 API 的详细测试指南。后端已根据 `backend_tasks_auth_user_management.md` 规范实现了用户认证和管理员用户管理功能。

**后端 API 基础 URL**: `http://localhost:PORT/api/v1` (请将 `PORT` 替换为后端服务实际运行的端口，默认为 `3000` 或在 `backend/.env` 文件中配置的端口)

## 2. 环境准备与启动

### 2.1. 后端环境变量配置

在开始测试前，请确保后端项目 `backend/` 目录下存在一个 `.env` 文件，并已正确配置以下关键变量：

```env
NODE_ENV=development
PORT=3000                 # 后端服务运行端口
DATABASE_URL=mongodb://localhost:27017/ai_labor_law_dev # MongoDB 连接字符串
JWT_SECRET=your_very_strong_jwt_secret_key         # JWT 签名密钥 (必须与后端一致)
JWT_EXPIRES_IN=1d         # JWT 普通令牌过期时间
# JWT_REFRESH_EXPIRES_IN=7d # (如果实现了刷新令牌)
LOG_LEVEL=info
```
**重要**: `JWT_SECRET` 必须是一个强随机字符串，前端不需要知道此密钥。

### 2.2. 启动后端服务

1.  打开终端，进入后端项目目录: `cd path/to/your/project/backend`
2.  安装依赖 (如果首次运行): `npm install`
3.  启动开发服务器: `npm run dev` (推荐，通常使用 nodemon 自动重启) 或 `npm start`
4.  观察终端输出，确保看到数据库连接成功和服务器监听端口的日志。

### 2.3. 前端 API Client 配置

在你的 Vue.js 前端项目中，确保 API 服务配置 (例如 Axios 实例) 的 `baseURL` 指向后端服务地址。

例如，在 `src/services/api.js` 或类似文件中：
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1', // 确保端口与后端一致
  headers: {
    'Content-Type': 'application/json',
  }
});

// 添加请求拦截器，用于在每个请求中附加 JWT Token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken'); // 或从 Vuex/Pinia store 获取
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default apiClient;
```

## 3. API 接口测试详情

### 3.1. 模块一：认证 (Auth)

#### 3.1.1. 用户注册

*   **端点**: `POST /auth/register`
*   **描述**: 创建新用户账户。
*   **请求头**: `Content-Type: application/json`
*   **请求体 (JSON)**:
    ```json
    {
      "name": "张三",                 // String, required
      "email": "zhangsan@example.com", // String, required, valid email
      "password": "password123",       // String, required, min 8 chars
      "profile": {                   // Object, optional
        "industry": "tech",
        "position": "employee"
      }
      // "userType": "employee" // 可选，如果前端允许选择，否则后端默认为 'employee'
    }
    ```
*   **成功响应 (201 Created)**:
    ```json
    {
      "success": true,
      "message": "用户注册成功",
      "data": {
        "token": "jwt.token.string", // 前端需保存此 token
        "user": {
          "id": "mongodb_object_id",
          "name": "张三",
          "email": "zhangsan@example.com",
          "userType": "employee",
          "status": "pending",         // 新用户默认为 'pending'
          "remainingQueries": 10     // 默认咨询次数
        }
      }
    }
    ```
*   **主要错误响应**:
    *   `400 Bad Request`: 输入验证失败 (字段缺失、格式错误、密码过短)。
        ```json
        {
          "success": false,
          "message": "输入验证失败", // 或更具体的字段错误信息
          "error": {
            "code": "VALIDATION_ERROR", // 或特定字段错误码
            "details": { /* 例如: "password": "密码长度不能少于8位" */ }
          }
        }
        ```
    *   `409 Conflict`: 邮箱已注册。
        ```json
        {
          "success": false,
          "message": "此电子邮箱已被注册",
          "error": { "code": "EMAIL_ALREADY_EXISTS" }
        }
        ```
*   **测试场景建议**:
    1.  ✅ 使用有效数据成功注册。
    2.  ❌ 使用已存在的邮箱注册。
    3.  ❌ 缺少 `name`, `email`, 或 `password` 字段。
    4.  ❌ `email` 格式无效。
    5.  ❌ `password` 长度小于8位。
    6.  ✅ 注册时包含 `profile` 信息。
    7.  ✅ 注册时不包含 `profile` 信息。

#### 3.1.2. 用户登录

*   **端点**: `POST /auth/login`
*   **描述**: 用户使用邮箱和密码登录 (普通用户和管理员均使用此接口)。
*   **请求头**: `Content-Type: application/json`
*   **请求体 (JSON)**:
    ```json
    {
      "email": "zhangsan@example.com", // String, required
      "password": "password123"        // String, required
    }
    ```
*   **成功响应 (200 OK)**:
    ```json
    {
      "success": true,
      "message": "登录成功",
      "data": {
        "token": "jwt.token.string", // 前端需保存此 token
        "user": {
          "id": "mongodb_object_id",
          "name": "张三",
          "email": "zhangsan@example.com",
          "userType": "employee" // 或 "admin"
        }
      }
    }
    ```
*   **主要错误响应**:
    *   `400 Bad Request`: 输入验证失败 (字段缺失)。
    *   `401 Unauthorized`:
        *   邮箱或密码错误: `{"success": false, "message": "邮箱或密码错误", "error": {"code": "INVALID_CREDENTIALS"}}`
        *   账户待验证 (`status: 'pending'`): `{"success": false, "message": "账户待验证，请检查您的邮箱或联系管理员", "error": {"code": "ACCOUNT_PENDING"}}`
        *   账户已禁用 (`status: 'disabled'`): `{"success": false, "message": "您的账户已被禁用，请联系管理员", "error": {"code": "ACCOUNT_DISABLED"}}`
*   **测试场景建议**:
    1.  ✅ 使用正确的邮箱和密码成功登录 (用户状态为 `active`)。
    2.  ✅ 使用管理员账户 (邮箱和密码，`userType: 'admin'`, 状态为 `active`) 成功登录，前端应能根据 `user.userType` 跳转到管理后台。
    3.  ❌ 使用错误的邮箱登录。
    4.  ❌ 使用正确的邮箱但错误的密码登录。
    5.  ❌ 尝试登录一个 `status: 'pending'` 的账户。
    6.  ❌ 尝试登录一个 `status: 'disabled'` 的账户。
    7.  ❌ 缺少 `email` 或 `password` 字段。

---

### 3.2. 模块二：用户管理 (Admin)

**重要**: 以下所有接口都需要管理员权限。前端在发送请求时，必须在 `Authorization` Header 中携带**管理员登录后获取的 JWT Token**。
格式: `Authorization: Bearer <admin_jwt_token>`

#### 3.2.1. 获取用户列表 (带筛选和分页)

*   **端点**: `GET /admin/users`
*   **描述**: 管理员获取用户列表，支持筛选和分页。
*   **请求头**: `Authorization: Bearer <admin_jwt_token>`
*   **查询参数 (Query Parameters)**:
    *   `page` (Number, optional, default: 1): 当前页码。
    *   `limit` (Number, optional, default: 10): 每页记录数。
    *   `searchTerm` (String, optional): 搜索关键词 (模糊匹配用户昵称或邮箱)。
    *   `status` (String, optional, enum: 'active', 'pending', 'disabled'): 按账户状态筛选。
    *   `userType` (String, optional, enum: 'admin', 'hr', 'employer', 'employee'): 按用户类型筛选。
    *   `dateRange` (String, optional, enum: 'today', 'week', 'month', 'year'): 按注册日期范围筛选。
    *   `sortBy` (String, optional, default: 'registrationDate'): 排序字段 (例如 `name`, `email`, `registrationDate`, `remainingQueries`)。
    *   `sortOrder` (String, optional, enum: 'asc', 'desc', default: 'desc'): 排序方向。
*   **成功响应 (200 OK)**:
    ```json
    {
      "success": true,
      "message": "用户列表获取成功",
      "data": {
        "items": [
          {
            "id": "mongodb_object_id",
            "name": "用户A",
            "email": "usera@example.com",
            "userType": "employee",
            "registrationDate": "2023-01-15T10:00:00.000Z",
            "remainingQueries": 5,
            "totalConsultations": 2,
            "status": "active"
          }
          // ... 其他用户
        ],
        "totalItems": 50,
        "currentPage": 1,
        "totalPages": 5
      }
    }
    ```
*   **主要错误响应**:
    *   `401 Unauthorized`: Token 无效或缺失。
    *   `403 Forbidden`: 用户非管理员。
*   **测试场景建议**:
    1.  ✅ 成功获取用户列表 (不带任何查询参数)。
    2.  ✅ 测试分页功能 (`page`, `limit`)。
    3.  ✅ 测试 `searchTerm` (分别搜索存在的和不存在的用户名/邮箱)。
    4.  ✅ 测试按 `status` 筛选。
    5.  ✅ 测试按 `userType` 筛选。
    6.  ✅ 测试按 `sortBy` 和 `sortOrder` 排序。
    7.  ✅ 测试 `dateRange` 筛选 (如果后端已完全实现)。
    8.  ✅ 组合多个筛选条件。
    9.  ❌ 非管理员 Token 尝试访问。

#### 3.2.2. 创建新用户 (管理员操作)

*   **端点**: `POST /admin/users`
*   **描述**: 管理员在后台创建新用户。
*   **请求头**: `Authorization: Bearer <admin_jwt_token>`, `Content-Type: application/json`
*   **请求体 (JSON)**:
    ```json
    {
      "name": "新用户B",                 // String, required
      "email": "userb_new@example.com", // String, required, valid email
      "password": "newpassword123",   // String, required, min 8 chars
      "userType": "hr",                 // String, required, enum
      "status": "active",               // String, required, enum
      "remainingQueries": 20            // Number, optional, default to User model default (e.g., 10)
    }
    ```
*   **成功响应 (201 Created)**:
    ```json
    {
      "success": true,
      "message": "用户创建成功",
      "data": {
        "id": "mongodb_object_id",
        "name": "新用户B",
        "email": "userb_new@example.com",
        "userType": "hr",
        "status": "active",
        "remainingQueries": 20
      }
    }
    ```
*   **主要错误响应**:
    *   `400 Bad Request`: 输入验证失败。
    *   `401 Unauthorized` / `403 Forbidden`.
    *   `409 Conflict`: 邮箱已存在。
*   **测试场景建议**:
    1.  ✅ 使用有效数据成功创建不同类型的用户。
    2.  ❌ 尝试使用已存在的邮箱创建用户。
    3.  ❌ 缺少必填字段。
    4.  ❌ `userType` 或 `status` 值无效 (不在枚举范围内)。

#### 3.2.3. 获取指定用户详情

*   **端点**: `GET /admin/users/:userId`
*   **描述**: 管理员获取单个用户的详细信息。
*   **请求头**: `Authorization: Bearer <admin_jwt_token>`
*   **路径参数 (Path Parameter)**: `userId` (String, MongoDB ObjectId)
*   **成功响应 (200 OK)**:
    ```json
    {
      "success": true,
      "message": "获取用户详情成功",
      "data": {
        "id": "mongodb_object_id",
        "name": "用户A",
        "email": "usera@example.com",
        "userType": "employee",
        "status": "active",
        "registrationDate": "2023-01-15T10:00:00.000Z",
        "lastLogin": "2023-10-20T10:00:00.000Z",
        "remainingQueries": 5,
        "totalConsultations": 2,
        "profile": {
          "industry": "tech",
          "position": "developer"
        },
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```
*   **主要错误响应**:
    *   `400 Bad Request`: `userId` 格式无效。
    *   `401 Unauthorized` / `403 Forbidden`.
    *   `404 Not Found`: 用户不存在。
*   **测试场景建议**:
    1.  ✅ 获取存在的用户详情。
    2.  ❌ 尝试获取不存在的 `userId`。
    3.  ❌ 使用无效的 `userId` 格式。

#### 3.2.4. 更新用户信息 (管理员操作)

*   **端点**: `PUT /admin/users/:userId`
*   **描述**: 管理员更新指定用户信息。
*   **请求头**: `Authorization: Bearer <admin_jwt_token>`, `Content-Type: application/json`
*   **路径参数**: `userId` (String, MongoDB ObjectId)
*   **请求体 (JSON)**: (可选择性更新以下字段)
    ```json
    {
      "name": "更新后的昵称",            // Optional
      "email": "updated_email@example.com", // Optional, if changed, backend checks uniqueness
      "password": "newSecurePassword123", // Optional, min 8 chars. If provided, updates password
      "userType": "employer",             // Optional
      "status": "disabled",               // Optional
      "remainingQueries": 15              // Optional
    }
    ```
*   **成功响应 (200 OK)**:
    ```json
    {
      "success": true,
      "message": "用户信息更新成功",
      "data": { // 返回更新后的用户部分信息 (不含密码)
        "id": "mongodb_object_id",
        "name": "更新后的昵称",
        "email": "updated_email@example.com",
        "userType": "employer",
        "status": "disabled",
        "remainingQueries": 15
      }
    }
    ```
*   **主要错误响应**:
    *   `400 Bad Request`: 输入验证失败 (例如 `remainingQueries` 为负数，密码过短)。
    *   `401 Unauthorized` / `403 Forbidden`.
    *   `404 Not Found`: 用户不存在。
    *   `409 Conflict`: 如果尝试修改 `email` 且新 `email` 已被其他用户使用。
*   **测试场景建议**:
    1.  ✅ 更新存在的用户的一个或多个字段 (例如 `name`, `remainingQueries`)。
    2.  ✅ 更新用户的密码。
    3.  ✅ 更新用户的 `email` 为一个新的、未被占用的邮箱。
    4.  ❌ 尝试将 `email` 更新为一个已被其他用户占用的邮箱。
    5.  ❌ 尝试更新不存在的 `userId`。
    6.  ❌ 提供无效的 `remainingQueries` (如负数) 或过短的密码。

#### 3.2.5. 切换用户状态 (管理员操作)

*   **端点**: `PATCH /admin/users/:userId/status`
*   **描述**: 管理员快速切换用户的账户状态。
*   **请求头**: `Authorization: Bearer <admin_jwt_token>`, `Content-Type: application/json`
*   **路径参数**: `userId` (String, MongoDB ObjectId)
*   **请求体 (JSON)**:
    ```json
    {
      "status": "disabled" // String, required, enum: 'active', 'pending', 'disabled'
    }
    ```
*   **成功响应 (200 OK)**:
    ```json
    {
      "success": true,
      "message": "用户状态更新成功",
      "data": {
        "id": "mongodb_object_id",
        "status": "disabled"
      }
    }
    ```
*   **主要错误响应**:
    *   `400 Bad Request`: `status` 值无效或缺失。
    *   `401 Unauthorized` / `403 Forbidden`.
    *   `404 Not Found`: 用户不存在。
*   **测试场景建议**:
    1.  ✅ 切换用户的状态 (例如从 `active` 到 `disabled`，再从 `disabled` 到 `active`)。
    2.  ❌ 提供无效的 `status` 值。
    3.  ❌ 尝试更新不存在的 `userId` 的状态。

#### 3.2.6. 删除用户 (管理员操作)

*   **端点**: `DELETE /admin/users/:userId`
*   **描述**: 管理员删除指定用户。
*   **请求头**: `Authorization: Bearer <admin_jwt_token>`
*   **路径参数**: `userId` (String, MongoDB ObjectId)
*   **成功响应 (200 OK 或 204 No Content)**:
    ```json
    {
      "success": true,
      "message": "用户删除成功",
      "data": null // 或无 data 字段
    }
    ```
*   **主要错误响应**:
    *   `401 Unauthorized` / `403 Forbidden`.
    *   `404 Not Found`: 用户不存在。
*   **测试场景建议**:
    1.  ✅ 删除一个存在的用户。
    2.  ❌ 尝试删除一个不存在的 `userId`。
    3.  验证：删除后，该用户无法登录，并且在用户列表中不再可见。

## 4. 通用注意事项

*   **Token 管理**:
    *   登录或注册成功后，前端应安全地存储 JWT Token (例如，在 `localStorage` 或 Vuex/Pinia store 中)。
    *   对于所有需要认证的请求，前端必须在 `Authorization` Header 中包含 `Bearer <token>`。
    *   考虑 Token 过期处理：如果 API 返回 401 Unauthorized (由于 Token 过期)，前端应引导用户重新登录或实现 Token 刷新逻辑 (如果后端支持)。
*   **错误处理**:
    *   前端应能优雅地处理后端返回的各种错误响应，并向用户显示友好的错误信息。
    *   可以根据 `error.code` 来区分不同类型的错误，以便进行特定的处理。
*   **数据一致性**:
    *   在执行更新或删除操作后，前端可能需要重新获取列表数据或更新本地状态以反映更改。

希望这份文档能帮助你的前端搭档顺利进行测试！
