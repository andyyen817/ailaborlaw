# AI勞基法顧問應用 - 本地開發環境

## 📖 項目簡介

AI勞基法顧問是一個面向台灣用戶的勞動法規AI諮詢平台，旨在通過AI技術降低勞動法規諮詢門檻，提供專業易用的勞動法規諮詢服務。平台結合AI快速響應與真人專家深度解答，創新的邀請機制降低獲客成本，為用戶提供行業專業化諮詢服務。

## 🏗️ 技術架構

### 後端技術棧
- **框架**: Express.js (ES模組)
- **數據庫**: MongoDB + Mongoose ODM
- **認證**: JWT (Bearer Token)
- **AI服務**: N8N集成
- **日誌**: Winston
- **語言**: Node.js

### 前端技術棧
- **框架**: Vue.js 3
- **樣式**: Tailwind CSS
- **圖標**: FontAwesome
- **構建工具**: Vite
- **表單驗證**: VeeValidate

## 📁 項目結構

```
D:\123ailabortestdeepseek/
├── back/                          # 後端相關文件
│   └── project/
│       ├── backend/               # 後端核心代碼
│       │   ├── src/              # 源代碼目錄
│       │   │   ├── app.js        # 應用入口文件
│       │   │   ├── models/       # 數據模型
│       │   │   ├── controllers/  # 控制器
│       │   │   ├── routes/       # 路由配置
│       │   │   ├── services/     # 業務邏輯服務
│       │   │   ├── middlewares/  # 中間件
│       │   │   ├── config/       # 配置文件
│       │   │   └── utils/        # 工具函數
│       │   ├── package.json      # 後端依賴配置
│       │   └── package-lock.json # 後端依賴鎖定
│       └── README.md             # 後端詳細文檔
├── front/                        # 前端相關文件
│   ├── src/                      # 前端源代碼
│   │   ├── views/               # 頁面組件
│   │   ├── components/          # 通用組件
│   │   ├── services/            # API服務
│   │   ├── utils/               # 工具函數
│   │   └── router/              # 路由配置
│   ├── public/                  # 靜態資源
│   ├── package.json             # 前端依賴配置
│   ├── package-lock.json        # 前端依賴鎖定
│   ├── vite.config.js           # Vite配置
│   └── README.md                # 前端詳細文檔
└── README.md                    # 項目總文檔（本文件）
```

## 🚀 快速開始

### 環境要求

- **Node.js**: v16.0.0 或以上
- **npm**: v7.0.0 或以上
- **MongoDB**: v4.4 或以上
- **Git**: 最新版本

### 1. 確認安裝狀態

✅ **已完成步驟**：
- 後端代碼已解壓到 `back/project/backend/`
- 前端代碼已解壓到 `front/`
- 後端依賴已安裝 (573 packages)
- 前端依賴已安裝 (1096 packages)

### 2. 後端啟動

```bash
# 切換到後端目錄
cd back/project/backend

# 檢查依賴是否安裝完成
npm list --depth=0

# 開發模式啟動（端口 7070）
npm run dev

# 生產模式啟動
npm start
```

### 3. 前端啟動

```bash
# 切換到前端目錄
cd front

# 檢查依賴是否安裝完成
npm list --depth=0

# 開發模式啟動
npm run dev

# 生產模式預覽
npm run preview
```

### 4. 環境配置

#### 後端環境變量 (.env)
在 `back/project/backend/` 目錄下創建 `.env` 文件：

```env
# 數據庫配置
MONGODB_URI=mongodb://localhost:27017/ai-laborlaw

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# 服務器配置
PORT=7070
NODE_ENV=development

# AI服務配置
N8N_WEBHOOK_URL=https://andyaiauto.zeabur.app

# 郵件服務配置
EMAIL_SERVICE=your-email-service
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```

#### 前端環境變量 (.env)
在 `front/` 目錄下創建 `.env` 文件：

```env
# API基礎URL
VITE_API_BASE_URL=http://localhost:7070/api/v1

# 應用環境
VITE_APP_ENV=development

# 其他前端配置
VITE_APP_TITLE=AI勞基法顧問
```

## 🔧 功能模組詳解

### 1. AI聊天模組 ✅
- **用戶端功能**: 會話管理、消息發送、AI回復、反饋功能
- **管理員功能**: 會話監控、統計數據、聊天記錄導出
- **API數量**: 11個 (用戶端7個 + 管理員4個)

### 2. 專家諮詢模組 ✅
- **用戶端功能**: 提交諮詢、查看申請、取消申請
- **管理員功能**: 申請管理、狀態更新、統計分析
- **API數量**: 9個 (用戶端4個 + 管理員5個)

### 3. 勞資顧問管理 ✅
- **顧問管理**: CRUD操作、狀態切換、搜索篩選
- **案件指派**: 智能指派、手動指派、工作負載管理
- **API數量**: 11個 (管理8個 + 指派3個)

### 4. 用戶認證系統 ✅
- **基礎功能**: 註冊、登入、權限管理
- **郵箱驗證**: 註冊驗證、密碼重置、邀請確認
- **管理員系統**: 超級管理員、普通管理員

### 5. 邀請註冊功能 ✅
- **邀請機制**: 邀請碼生成、註冊獎勵、關係建立
- **完整流程**: 邀請 → 註冊 → 驗證 → 激活

## 🌐 API 接口文檔

### 基礎URL
- **本地開發**: `http://localhost:7070/api/v1`
- **生產環境**: `https://wrrfvodsaofk.sealosgzg.site/api/v1`

### 認證方式
所有需要認證的API都使用 Bearer Token：
```
Authorization: Bearer <JWT_TOKEN>
```

### 核心API端點

#### 用戶認證
- `POST /auth/register` - 用戶註冊
- `POST /auth/register/with-invite` - 邀請註冊
- `POST /auth/login` - 用戶登入
- `POST /auth/verify-email` - 郵箱驗證
- `POST /auth/forgot-password` - 忘記密碼
- `POST /auth/reset-password` - 重置密碼

#### AI聊天功能
- `POST /chat/sessions` - 創建會話
- `GET /chat/sessions` - 獲取會話列表
- `POST /chat/sessions/:id/messages` - 發送消息
- `GET /admin/chat/stats` - 聊天統計

#### 專家諮詢
- `POST /expert-consultations` - 提交諮詢
- `GET /expert-consultations/user/:userId` - 用戶諮詢列表
- `PUT /expert-consultations/:id/cancel` - 取消諮詢

#### 勞資顧問管理
- `GET /labor-advisors` - 獲取顧問列表
- `POST /labor-advisors` - 創建顧問
- `PUT /labor-advisors/assign/:consultationId` - 指派顧問

## 🧪 測試指南

### 後端測試
```bash
# 切換到後端目錄
cd back/project/backend

# 運行單元測試
npm test

# API測試
# 使用項目中的 test-api.html 文件進行API測試
```

### 前端測試
```bash
# 切換到前端目錄
cd front

# 運行單元測試
npm run test

# 運行測試覆蓋率
npm run test:coverage

# 代碼檢查
npm run lint
```

### 測試賬號
```
# 超級管理員
用戶名: admin
郵箱: test@ailaborlaw.com
密碼: Test1234

# 普通管理員
用戶名: newadmin
郵箱: newadmin@ailaborlaw.com
密碼: Admin1234
```

## 📋 部署指南

### 本地部署步驟
1. **啟動MongoDB數據庫**
2. **配置環境變量** (.env文件)
3. **啟動後端服務** (`npm run dev`)
4. **啟動前端服務** (`npm run dev`)
5. **訪問應用** (http://localhost:3000)

### 生產部署準備
```bash
# 前端構建
cd front
npm run build

# 後端優化
cd back/project/backend
npm start
```

## 🔍 問題排除

### 常見問題

#### 1. 後端無法啟動
- 檢查 MongoDB 是否正在運行
- 確認 `.env` 文件配置正確
- 檢查端口 7070 是否被佔用

#### 2. 前端無法連接後端
- 確認後端服務正在運行
- 檢查 `VITE_API_BASE_URL` 配置
- 檢查 CORS 設置

#### 3. 依賴安裝失敗
- 清除 npm 快取：`npm cache clean --force`
- 刪除 node_modules 重新安裝：`rm -rf node_modules && npm install`
- 檢查 Node.js 版本是否符合要求

#### 4. 數據庫連接問題
- 確認 MongoDB 服務狀態
- 檢查數據庫 URI 配置
- 確認網絡連接正常

## 🔗 相關鏈接

- [後端詳細文檔](back/project/README.md)
- [前端詳細文檔](front/README.md)
- [API測試頁面](back/project/backend/test-api.html)
- [部署指南](back/project/backend/DEPLOYMENT_GUIDE.md)

## 📝 開發日誌

### 2025-01-28 - 本地環境搭建完成
- ✅ 成功解壓後端和前端代碼
- ✅ 安裝所有依賴包 (後端573個，前端1096個)
- ✅ 創建完整的本地開發環境說明文檔
- ✅ 配置項目結構和啟動指南

### 重要提醒
- 所有功能模組都已開發完成並經過測試
- 本地開發環境已配置完成，可以直接開始開發
- 記得先配置 `.env` 環境變量文件
- 建議使用 MongoDB Compass 管理數據庫

---

## 👨‍💻 開發團隊

**產品經理 + 全棧工程師**: 負責完整的產品設計和開發實現

**聯繫方式**: 如有問題請參考項目文檔或查看代碼註釋

---

*最後更新: 2025-01-28*
*版本: v2.6.1* 