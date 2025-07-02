# 勞法通AI API文檔

## 概述

本文檔提供勞法通AI後端API的詳細說明。所有API遵循RESTful設計原則，使用JSON格式進行數據交換。

## 基本信息

- **基礎URL**: `/api/v1`
- **響應格式**: 所有API響應都使用統一的JSON格式，包含`success`、`message`和`data`字段
- **錯誤響應**: 錯誤響應包含`error`字段，提供錯誤代碼和詳細信息
- **認證方式**: 使用JWT (JSON Web Token)進行認證，通過`Authorization: Bearer <token>`頭部提供

## 用戶認證 API

### 1. 用戶註冊 API

**端點:** `POST /api/v1/auth/register`

**請求參數:**
- **必填字段:**
  - `name`: 用戶名稱 (2-50個字符)
  - `email`: 有效的電子郵箱地址
  - `password`: 密碼 (至少8位，包含至少一個字母和一個數字)

- **選填字段:**
  - `userType`: 用戶類型 ('employee', 'employer', 'hr', 'admin')，預設為 'employee'
  - `industry`: 行業
  - `occupation`: 職位 (在後端會轉換為 profile.position)
  - `companyName`: 公司名稱
  - `profile`: 包含 industry 和 position 的對象

**響應格式:**
```json
{
  "success": true,
  "message": "用戶註冊成功",
  "data": {
    "token": "JWT令牌",
    "user": {
      "id": "用戶ID",
      "name": "用戶名稱",
      "email": "電子郵箱",
      "userType": "用戶類型",
      "status": "active",
      "remainingQueries": 10,
      "profile": {},
      "companyName": "公司名稱",
      "totalConsultations": 0
    }
  }
}
```

**錯誤響應:**
- `400`: 輸入驗證失敗
- `409`: 電子郵箱已被註冊

### 2. 用戶登入 API

**端點:** `POST /api/v1/auth/login`

**請求參數:**
- **必填字段:**
  - `email`: 電子郵箱地址
  - `password`: 密碼

**響應格式:**
```json
{
  "success": true,
  "message": "登入成功",
  "data": {
    "token": "JWT令牌",
    "user": {
      "id": "用戶ID",
      "name": "用戶名稱",
      "email": "電子郵箱",
      "userType": "用戶類型",
      "status": "active",
      "remainingQueries": 10,
      "totalConsultations": 0,
      "profile": {},
      "companyName": "公司名稱"
    }
  }
}
```

**錯誤響應:**
- `400`: 輸入驗證失敗
- `401`: 認證失敗 (郵箱或密碼錯誤，或賬戶狀態不是 active)

## 注意事項

1. 所有 API 回應都採用統一的 JSON 格式，包含 `success`、`message` 和 `data` 欄位
2. 錯誤回應包含 `error` 欄位，提供錯誤代碼和詳細資訊
3. 前端應儲存返回的令牌，並在後續請求中通過 `Authorization: Bearer <token>` 標頭提供
4. 所有用戶在註冊時狀態即設為 `active`，無需額外的驗證流程

## 實施狀態

目前已實現以下API：

- [x] 用戶註冊 (POST /api/v1/auth/register)
- [x] 用戶登入 (POST /api/v1/auth/login)

待實現的API：

- [ ] 獲取用戶資料 (GET /api/v1/users/profile)
- [ ] 更新用戶資料 (PUT /api/v1/users/profile)
- [ ] 查詢剩餘諮詢次數 (GET /api/v1/users/remaining-queries)
- [ ] 扣減諮詢次數 (POST /api/v1/users/decrease-query)
- [ ] 聊天會話相關API
- [ ] 專家諮詢相關API
- [ ] 管理後台相關API 