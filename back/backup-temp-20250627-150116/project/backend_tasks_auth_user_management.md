# 後端任務清單：使用者認證與管理

## 1. 简介与目标

本文档旨在为 AI 劳基法顾问项目的后端 Express.js 服务提供清晰的任务指引，涵盖用户认证（注册、登录）和后台用户管理功能。前端将通过 API 与后端进行交互，后端需确保数据处理的安全性、准确性和一致性。

**目标后端技术栈：**
*   框架: Express.js
*   数据库: MongoDB (使用 Mongoose ODM)
*   认证机制: JWT (JSON Web Tokens)

## 2. 通用约定

### 2.1. API Base URL
所有 API 端点均以 `/api/v1` 作为前缀。例如：`/api/v1/auth/login`。

### 2.2. 认证机制
*   需要认证的接口，客户端应在 HTTP 请求的 `Authorization` Header 中携带 JWT。格式: `Bearer <token>`。
*   后端需要一个中间件来验证 JWT 的有效性，并从中提取用户信息（特别是 `userId` 和 `userType`）附加到 `req` 对象上，供后续处理程序使用。

### 2.3. 统一响应格式
所有 API 响应应遵循统一格式：

*   **成功响应 (HTTP 状态码 200 或 201):**
    ```json
    {
      "success": true,
      "message": "操作成功的描述信息",
      "data": { /* 响应数据 */ }
    }
    ```
    对于列表数据，`data` 可以是：
    ```json
    {
      "success": true,
      "message": "获取列表成功",
      "data": {
        "items": [/* 列表项 */],
        "totalItems": 100,
        "currentPage": 1,
        "totalPages": 10
      }
    }
    ```

*   **错误响应 (HTTP 状态码 4xx 或 5xx):**
    ```json
    {
      "success": false,
      "message": "具体的错误信息",
      "error": { // 可选的错误详情
        "code": "ERROR_CODE_STRING", // 例如 "VALIDATION_ERROR", "UNAUTHORIZED"
        "details": { /* 更详细的错误信息，例如字段验证错误 */ }
      }
    }
    ```

### 2.4. 日期时间处理
*   所有存储到数据库和 API 响应中的日期时间，统一使用 ISO 8601 格式的 UTC 时间字符串 (e.g., `"2023-10-26T08:00:00.000Z"`)。

### 2.5. 输入验证
*   所有来自客户端的输入（请求体、查询参数、路径参数）都必须在后端进行严格验证。
*   使用如 `express-validator` 或类似库进行验证。
*   对于验证失败的情况，返回 HTTP 400 (Bad Request) 或 422 (Unprocessable Entity) 错误，并在响应中提供详细的字段错误信息。

## 3. 数据库模型 (MongoDB - User Schema)

核心用户模型 (`User`) 定义如下 (使用 Mongoose Schema 风格)：

```javascript
// /src/models/UserModel.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userProfileSchema = new mongoose.Schema({
  industry: { type: String, trim: true },
  position: { type: String, trim: true },
  // 可以根据 RegisterView.vue 的选填项添加更多 profile 字段
}, { _id: false }); // profile 作为内嵌文档

const userSchema = new mongoose.Schema({
  name: { // 昵称
    type: String,
    required: [true, '用户昵称不能为空'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, '电子邮箱不能为空'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, '请输入有效的电子邮箱地址'],
  },
  password: { // 存储哈希后的密码
    type: String,
    required: [true, '密码不能为空'],
    minlength: [8, '密码长度不能少于8位'],
  },
  userType: {
    type: String,
    enum: ['admin', 'hr', 'employer', 'employee'],
    required: [true, '用户类型不能为空'],
    default: 'employee',
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'disabled'],
    required: [true, '账户状态不能为空'],
    default: 'pending', // 新用户默认为待验证，除非管理员创建时指定
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  remainingQueries: { // 剩余咨询次数
    type: Number,
    default: 10, // 新用户默认10次，管理员可修改
    min: [0, '剩余次数不能为负'],
  },
  totalConsultations: { // 累计咨询次数
    type: Number,
    default: 0,
  },
  profile: userProfileSchema, // 嵌入式用户资料

  // 用于邮箱验证 (如果需要)
  // verificationToken: { type: String },
  // verificationTokenExpires: { type: Date },

  // 用于密码重置 (如果需要)
  // resetPasswordToken: { type: String },
  // resetPasswordExpires: { type: Date },
}, {
  timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
});

// 密码哈希中间件 (Mongoose pre-save hook)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

// 实例方法：比较密码
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
```

**数据库索引建议:**
*   `email`: unique index (Mongoose 会自动创建基于 `unique: true`)
*   `status`: index
*   `userType`: index
*   `registrationDate`: index

## 4. 后端 API 接口详述

### 4.1. 模块一：认证 (Auth) - 路由前缀: `/api/v1/auth`

#### 4.1.1. 用户注册
*   **端点:** `POST /register`
*   **描述:** 创建新用户账户。
*   **请求体 (JSON):**
    ```json
    {
      "name": "张三", // String, required
      "email": "zhangsan@example.com", // String, required, valid email
      "password": "password123", // String, required, min 8 chars
      "profile": { // Optional
        "industry": "tech",
        "position": "employee"
      }
      // "userType": "employee" // 可选, 如果前端允许选择，否则后端默认为 'employee'
    }
    ```
*   **主要逻辑:**
    1.  验证输入数据（`name`, `email` 格式，`password` 长度）。
    2.  检查 `email` 是否已存在，若存在则返回错误。
    3.  哈希密码。
    4.  创建新用户文档，默认 `status: 'pending'`, `userType` (若未提供则为 `'employee'`)，`remainingQueries` (例如10次)。
    5.  (可选) 发送邮箱验证邮件。
    6.  生成 JWT。
*   **成功响应 (201 Created):**
    ```json
    {
      "success": true,
      "message": "用户注册成功",
      "data": {
        "token": "jwt.token.string",
        "user": {
          "id": "mongodb_object_id",
          "name": "张三",
          "email": "zhangsan@example.com",
          "userType": "employee",
          "status": "pending",
          "remainingQueries": 10
        }
      }
    }
    ```
*   **错误响应:**
    *   400 Bad Request: 输入验证失败（字段缺失、格式错误）。
    *   409 Conflict: 邮箱已注册。
    *   500 Internal Server Error: 服务器内部错误。

#### 4.1.2. 用户登录
*   **端点:** `POST /login`
*   **描述:** 用户使用邮箱和密码登录。
*   **请求体 (JSON):**
    ```json
    {
      "email": "zhangsan@example.com", // String, required
      "password": "password123" // String, required
    }
    ```
*   **主要逻辑:**
    1.  验证输入数据。
    2.  通过 `email` 查找用户。
    3.  如果用户不存在，返回认证失败错误。
    4.  比较提交的密码与数据库中存储的哈希密码。
    5.  如果密码不匹配，返回认证失败错误。
    6.  检查用户状态：
        *   如果 `status` 是 `'pending'`，返回特定错误提示（例如“账户待验证”）。
        *   如果 `status` 是 `'disabled'`，返回特定错误提示（例如“账户已被禁用”）。
    7.  如果验证成功且状态为 `'active'`，更新用户的 `lastLogin` 字段。
    8.  生成 JWT。
*   **成功响应 (200 OK):**
    ```json
    {
      "success": true,
      "message": "登录成功",
      "data": {
        "token": "jwt.token.string",
        "user": { // 用户摘要信息
          "id": "mongodb_object_id",
          "name": "张三",
          "email": "zhangsan@example.com",
          "userType": "employee" // 或 'admin'
        }
      }
    }
    ```
*   **错误响应:**
    *   400 Bad Request: 输入验证失败。
    *   401 Unauthorized: 邮箱或密码错误，账户待验证，账户已禁用。
    *   500 Internal Server Error.

#### 4.1.3. 管理员登录
*   **说明:** 管理员登录与普通用户登录使用相同的 `POST /auth/login` 接口。通过登录后返回的 `user.userType === 'admin'` 来区分。前端 `AdminLoginView.vue` 调用的是 `authService.login`。

---

### 4.2. 模块二：用户管理 (Admin) - 路由前缀: `/api/v1/admin/users`
**注意: 所有 `/api/v1/admin/*` 路径下的接口都需要管理员权限验证 (JWT 中 `userType` 为 `admin`)。**

#### 4.2.1. 获取用户列表 (带筛选和分页)
*   **端点:** `GET /` (即 `/api/v1/admin/users`)
*   **描述:** 获取用户列表，支持筛选和分页。
*   **查询参数:**
    *   `page` (Number, optional, default: 1): 当前页码。
    *   `limit` (Number, optional, default: 10): 每页记录数。
    *   `searchTerm` (String, optional): 搜索关键词 (匹配姓名或邮箱，模糊搜索)。
    *   `status` (String, optional, enum: 'active', 'pending', 'disabled'): 按账户状态筛选。
    *   `userType` (String, optional, enum: 'admin', 'hr', 'employer', 'employee'): 按用户类型筛选。
    *   `dateRange` (String, optional, enum: 'today', 'week', 'month', 'year'): 按注册日期范围筛选。
    *   `sortBy` (String, optional, default: 'registrationDate'): 排序字段 (例如 `name`, `email`, `registrationDate`, `remainingQueries`)。
    *   `sortOrder` (String, optional, enum: 'asc', 'desc', default: 'desc'): 排序方向。
*   **主要逻辑:**
    1.  管理员权限验证。
    2.  根据查询参数构建 MongoDB 查询条件和排序、分页选项。
    3.  执行查询，获取用户列表和总记录数。
*   **成功响应 (200 OK):**
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
            // ... 其他需要的字段，但不包括密码
          }
        ],
        "totalItems": 50,
        "currentPage": 1,
        "totalPages": 5
      }
    }
    ```
*   **错误响应:** 401 Unauthorized, 403 Forbidden, 500 Internal Server Error.

#### 4.2.2. 创建新用户 (管理员操作)
*   **端点:** `POST /` (即 `/api/v1/admin/users`)
*   **描述:** 管理员在后台创建新用户。
*   **请求体 (JSON):** (参考 `AddUserModal.vue`)
    ```json
    {
      "name": "新用户B", // String, required
      "email": "userb_new@example.com", // String, required, valid email
      "password": "newpassword123", // String, required, min 8 chars
      "userType": "hr", // String, required, enum
      "status": "active", // String, required, enum
      "remainingQueries": 20 // Number, optional, default to User model default
    }
    ```
*   **主要逻辑:**
    1.  管理员权限验证。
    2.  验证输入数据（同用户注册，但密码是必需的）。
    3.  检查 `email` 是否已存在。
    4.  哈希密码。
    5.  创建用户文档。
*   **成功响应 (201 Created):**
    ```json
    {
      "success": true,
      "message": "用户创建成功",
      "data": { // 返回创建的用户信息 (不含密码)
        "id": "mongodb_object_id",
        "name": "新用户B",
        "email": "userb_new@example.com",
        "userType": "hr",
        "status": "active",
        "remainingQueries": 20
      }
    }
    ```
*   **错误响应:** 400, 401, 403, 409, 500.

#### 4.2.3. 获取指定用户详情
*   **端点:** `GET /:userId`
*   **描述:** 获取单个用户的详细信息。
*   **路径参数:** `userId` (String, MongoDB ObjectId)
*   **主要逻辑:**
    1.  管理员权限验证。
    2.  验证 `userId` 格式。
    3.  通过 ID 查找用户。
*   **成功响应 (200 OK):**
    ```json
    {
      "success": true,
      "message": "获取用户详情成功",
      "data": { // 完整的用户信息 (不含密码)
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
*   **错误响应:** 400, 401, 403, 404 Not Found, 500.

#### 4.2.4. 更新用户信息 (管理员操作)
*   **端点:** `PUT /:userId`
*   **描述:** 管理员更新指定用户信息。主要用于修改密码和剩余咨询次数 (根据 `EditUserModal.vue`)。 如果需要支持修改其他字段，请求体可扩展。
*   **路径参数:** `userId` (String, MongoDB ObjectId)
*   **请求体 (JSON):**
    ```json
    {
      "remainingQueries": 15, // Number, optional
      "password": "newSecurePassword123" // String, optional, min 8 chars. 如果提供，则更新密码
      // 可以根据需求扩展其他可修改字段，例如 name, email, userType, status。
      // 但要注意，如果修改 email，需要检查唯一性。
      // 如果修改 status，需要确保值在 enum 范围内。
    }
    ```
*   **主要逻辑:**
    1.  管理员权限验证。
    2.  验证 `userId` 和请求体数据。
    3.  查找用户。
    4.  如果请求体中包含 `password`，则哈希新密码并更新。
    5.  更新其他允许修改的字段（如 `remainingQueries`）。
    6.  保存用户信息。
*   **成功响应 (200 OK):**
    ```json
    {
      "success": true,
      "message": "用户信息更新成功",
      "data": { // 返回更新后的用户信息 (不含密码)
        "id": "mongodb_object_id",
        "name": "用户A", // 假设 name 未被修改
        "email": "usera@example.com", // 假设 email 未被修改
        "userType": "employee",
        "status": "active",
        "remainingQueries": 15
      }
    }
    ```
*   **错误响应:** 400, 401, 403, 404, 500. (如果尝试修改 email 且新 email 已存在，返回 409).

#### 4.2.5. 切换用户状态 (管理员操作)
*   **端点:** `PATCH /:userId/status`
*   **描述:** 快速切换用户的账户状态（例如 active/disabled）。
*   **路径参数:** `userId` (String, MongoDB ObjectId)
*   **请求体 (JSON):**
    ```json
    {
      "status": "disabled" // String, required, enum: 'active', 'disabled' (或者 'pending' 如果允许)
    }
    ```
*   **主要逻辑:**
    1.  管理员权限验证。
    2.  验证 `userId` 和 `status` 值。
    3.  查找用户。
    4.  更新用户 `status` 字段。
    5.  保存。
*   **成功响应 (200 OK):**
    ```json
    {
      "success": true,
      "message": "用户状态更新成功",
      "data": { // 返回更新后的用户部分信息
        "id": "mongodb_object_id",
        "status": "disabled"
      }
    }
    ```
*   **错误响应:** 400, 401, 403, 404, 500.

#### 4.2.6. 删除用户 (管理员操作)
*   **端点:** `DELETE /:userId`
*   **描述:** 删除指定用户。考虑软删除（标记为 `deleted` 或类似状态）而非物理删除，以便数据恢复或审计。
*   **路径参数:** `userId` (String, MongoDB ObjectId)
*   **主要逻辑:**
    1.  管理员权限验证。
    2.  验证 `userId`。
    3.  查找用户。
    4.  执行删除操作（物理删除或软删除）。
*   **成功响应 (200 OK 或 204 No Content):**
    ```json
    {
      "success": true,
      "message": "用户删除成功",
      "data": null // 或者无 data 字段
    }
    ```
*   **错误响应:** 401, 403, 404, 500.

## 5. 关键业务逻辑与注意事项

### 5.1. 密码安全
*   **存储:** 绝不以明文存储密码。使用 `bcryptjs` (或类似强度的哈希算法) 对密码进行加盐哈希。盐值应为每个用户随机生成。
*   **比较:** 登录时，使用 `bcrypt.compare()` 比较用户提交的密码和数据库中存储的哈希值。
*   **传输:** 确保所有涉及密码传输的通信都通过 HTTPS 进行。
*   **策略:** 后端应能校验密码复杂度（例如，最小长度，包含字母、数字、特殊字符等），虽然前端已有提示。

### 5.2. JWT (JSON Web Tokens)
*   **生成:** 登录或注册成功后，生成 JWT。
*   **Payload:** 至少包含 `userId` 和 `userType`。可以考虑加入 `email` 或 `name`。
*   **Secret Key:** 使用足够强度且妥善保管的密钥进行签名。此密钥应存储在环境变量中，绝不硬编码。
*   **有效期 (Expiration):** 设置合理的有效期 (例如：1 小时，1 天)。考虑实现 Token 刷新机制。
*   **验证:** 在需要认证的接口处，编写中间件验证 Token 的签名、有效期，并提取用户信息。

### 5.3. 权限控制
*   使用中间件检查 JWT 中解码出的 `userType`。
*   对于 `/admin/*` 路径下的接口，确保只有 `userType === 'admin'` 的用户可以访问。
*   对于其他可能需要特定权限的操作（例如，用户只能修改自己的资料），也需要进行相应的权限检查。

### 5.4. 错误处理与日志
*   **统一错误处理中间件:** 捕获路由和控制器中未处理的错误，返回标准格式的错误响应。
*   **日志记录:** 使用如 `Winston` 或类似库记录关键操作、错误信息、请求详情等，便于调试和审计。
    *   记录请求 ID，方便追踪。
    *   不要在日志中记录明文密码或完整的敏感用户信息。

### 5.5. 学习 `scratchpad.md` 中的经验
*   **API 返回数据结构一致性:** 已在 "通用约定" 中强调。
*   **数据库操作异步:** 所有 Mongoose 操作都返回 Promise，务必使用 `async/await` 或 `.then().catch()` 正确处理。
*   **敏感操作日志审计:** 对于创建用户、修改密码、删除用户等操作，应有详细日志。

## 6. 与项目其他文档同步

*   **`README.md`:** 更新后端 API 端点列表，简要说明如何启动和配置后端服务。
*   **`scratchpad.md`:** 将本任务清单中总结的关键后端开发注意事项（如JWT策略、密码安全具体措施、权限控制实现思路等）添加到 `scratchpad.md`，供团队持续参考和改进。

## 7. 后续可能需要考虑的功能 (不在本次任务范围，但可预留设计)
*   邮箱验证流程 (发送验证邮件，验证 token)。
*   密码重置流程 (忘记密码 -> 发送重置邮件 -> 验证重置 token -> 设置新密码)。
*   Token 刷新机制。
*   更详细的用户 Profile 管理。
*   用户活动日志。
