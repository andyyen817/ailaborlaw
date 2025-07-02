# AI勞基法顧問應用

## 概述
AI勞基法顧問是一個面向台灣用戶的勞動法規AI諮詢平台，旨在通過AI技術降低勞動法規諮詢門檻，提供專業易用的勞動法規咨詢服務。平台結合AI快速響應與真人專家深度解答，創新的邀請機制降低獲客成本，為用戶提供行業專業化諮詢服務。

## 目標平台
- Web (主平台)
- 響應式移動端Web
- LINE (通過二維碼接入)

## 📊 當前開發狀態

### ✅ 已完成功能

#### 後端開發 (v1.0 - 聊天模組完成)
- **基礎架構**：Express.js + MongoDB + JWT 認證系統
- **用戶管理模組**：註冊、登入、資料管理、權限控制
- **管理員系統**：超級管理員、普通管理員權限管理
- **AI聊天模組**：11個API全部實現並測試成功
  - 用戶端API：7個（會話管理5個 + 消息處理2個）
  - 管理員端API：4個（監控2個 + 統計2個）
- **專家諮詢模組**：9個API全部實現並完成重要調整 ✅ 新完成
  - 用戶端API：4個（提交申請、查看列表、獲取詳情、取消申請）
  - 管理員端API：5個（管理申請、更新狀態、刪除、統計數據、詳情查看）
  - **重要調整**：移除游客用戶支持，所有API都需要認證
- **N8N AI服務集成**：完整集成並返回真實AI回復
- **數據導出功能**：Excel格式聊天記錄導出
- **職業字段統一**：完成position字段標準化

#### 前端開發 (進行中)
- **原型設計**：所有高保真界面設計完成
- **管理後台界面**：完整的管理功能界面
- **API對接**：正在進行聊天模組前端開發（任務組4）

### 🔧 技術架構

#### 後端技術棧
```
API基礎URL: https://wrrfvodsaofk.sealosgzg.site/api/v1
框架: Express.js (ES模組)
數據庫: MongoDB + Mongoose ODM
認證: JWT (Bearer Token)
AI服務: N8N集成 (https://andyaiauto.zeabur.app)
日誌: Winston
測試: 真實環境測試
```

#### 前端技術棧
```
框架: Vue.js
樣式: Tailwind CSS
圖標: FontAwesome
服務器: ailaborlawuser (端口3003)
公網地址: https://wmdelchfajsi.sealosgzg.site
```

## 📚 AI聊天模組API

### 用戶端API（7個）
1. **會話管理**
   - `POST /chat/sessions` - 創建新會話
   - `GET /chat/sessions` - 獲取會話列表
   - `GET /chat/sessions/:id` - 會話詳情
   - `PUT /chat/sessions/:id` - 更新標題
   - `DELETE /chat/sessions/:id` - 刪除會話

2. **消息處理**
   - `POST /chat/sessions/:id/messages` - 發送消息並獲取AI回復 ⭐ 核心功能
   - `POST /chat/sessions/:sessionId/messages/:messageId/feedback` - 用戶反饋

### 管理員端API（4個）
1. **會話監控**
   - `GET /admin/chat/sessions` - 獲取所有用戶會話
   - `GET /admin/chat/sessions/:id/messages` - 會話詳情（管理員視角）

2. **統計數據**
   - `GET /admin/chat/stats` - 聊天統計數據
   - `POST /admin/chat/export` - 導出聊天記錄（Excel格式）

## 📋 劳资顾问管理API（11個）

### 顾问管理API（8個）
1. **CRUD操作**
   - `GET /labor-advisors` - 获取顾问列表（支持筛选、分页、搜索）
   - `GET /labor-advisors/:id` - 获取顾问详情
   - `POST /labor-advisors` - 创建新顾问
   - `PUT /labor-advisors/:id` - 更新顾问信息
   - `PUT /labor-advisors/:id/toggle-status` - 切换顾问状态
   - `DELETE /labor-advisors/:id` - 删除顾问

2. **查询与统计**
   - `GET /labor-advisors/search` - 搜索可用顾问（用于指派）
   - `GET /labor-advisors/statistics` - 获取顾问统计数据

### 案件指派API（3個）
1. **智能指派**
   - `PUT /labor-advisors/assign/:consultationId` - 手动指派顾问
   - `POST /labor-advisors/auto-assign/:consultationId` - 自动指派最佳顾问

## 📋 专家咨询API（9个）

### 用户端API（4个）
- `POST /expert-consultations` - 提交咨询申请 ⭐ 需要登录
- `GET /expert-consultations/user/:userId` - 获取用户咨询列表
- `GET /expert-consultations/:id` - 获取咨询详情
- `PUT /expert-consultations/:id/cancel` - 取消咨询申请

### 管理员端API（5个）
- `GET /expert-consultations/admin/list` - 获取所有咨询列表（支持筛选）
- `GET /expert-consultations/admin/:id` - 获取咨询详情（管理员视角）
- `PUT /expert-consultations/admin/:id` - 更新咨询状态（支持强制更新）
- `DELETE /expert-consultations/admin/:id` - 删除咨询申请
- `GET /expert-consultations/admin/statistics` - 获取统计数据

## 🏆 重要里程碑

### 2025年5月24日-25日：AI聊天模組完成
- ✅ N8N AI服務成功集成並返回真實法律建議
- ✅ 管理員認證問題解決（4個admin chat APIs工作正常）
- ✅ 超級管理員密碼重置為Test1234
- ✅ Excel導出功能正常（26KB文件正確下載）
- ✅ 職業字段統一修復（支持position和occupation向後兼容）
- ✅ 完整API文檔提供給前端團隊

### 2025年5月27日：專家諮詢模組重要調整 ✅ 新完成
- ✅ **認證系統統一**：修復管理員認證不兼容問題，所有管理員API使用protectAdmin中間件
- ✅ **移除游客用戶支持**：根據前端設計要求，所有用戶都必須登錄後才能使用專家諮詢功能
- ✅ **路由認證強化**：專家諮詢提交API從protectOptional改為protect，確保數據安全
- ✅ **控制器邏輯簡化**：移除游客用戶處理邏輯，簡化用戶ID獲取和權限驗證
- ✅ **API文檔更新**：更新專家諮詢API文檔，反映認證要求變更
- ✅ **測試驗證**：API返回正確的認證錯誤，確認調整成功

### 2025年5月27日：劳资顾问管理系统完成 ✅ 全新功能
- ✅ **劳资顾问管理模块**：完整的11个API端点实现，支持顾问的CRUD操作
- ✅ **智能指派系统**：自动/手动指派顾问到咨询案件，基于地区、专业和工作负载
- ✅ **工作负载管理**：实时跟踪顾问工作状态，智能分配案件负载
- ✅ **MVP字段扩展**：专家咨询模型新增地区、指派顾问、响应时间等6个字段
- ✅ **统计分析系统**：全面的顾问效率分析、工作负载分布和绩效排名
- ✅ **数据验证强化**：台湾地区枚举、专业领域验证、简化时间格式支持
- ✅ **路由系统整合**：劳资顾问路由完整注册到/api/v1/labor-advisors

### 2025年6月4日：邀請註冊功能修復完成 ✅ 重要修復
- ✅ **路由問題診斷**：發現並修復 `/api/v1/auth/register/with-invite` 路由缺失問題
- ✅ **控制器函數實現**：添加完整的 `registerWithInvite` 函數到auth控制器
- ✅ **邀請驗證邏輯**：集成邀請服務驗證、獎勵發放和用戶關係建立
- ✅ **數據模型理解**：修正邀請碼存儲機制（User模型myInviteCode字段）
- ✅ **測試驗證成功**：邀請註冊功能完全正常，返回JWT token和完整用戶信息
- ✅ **服務器重啟處理**：解決端口占用問題，確保代碼更新生效
- ✅ **公網地址使用**：確認使用正確的API地址 `https://wrrfvodsaofk.sealosgzg.site`

## ⚠️ **重要技術問題與解決方案記錄**

### 🔧 Node.js服務器進程管理問題
**問題**：服務器重啟失敗，端口7070被占用  
**診斷命令**：`ps aux | grep -E "node.*app\.js" | grep -v grep`  
**解決方案**：`kill -9 [PID列表]` 強制終止所有Node.js進程  
**預防措施**：代碼修改後主動檢查服務器重啟狀態  

### 🔧 API路由架構理解問題
**問題**：API路徑構成理解錯誤，使用 `/api/auth/` 而非 `/api/v1/auth/`  
**正確架構**：
```
/api (app.js掛載) 
  └── /v1 (mainRouter在routes/index.js)
      └── /auth (v1Router掛載authRoutes)
          └── /register/with-invite (具體端點)
```
**預防措施**：始終檢查 `routes/index.js` 確認完整路由掛載結構  

### 🔧 數據模型字段理解問題
**問題**：邀請碼存儲機制理解錯誤，以為在單獨Invite模型中  
**實際機制**：邀請碼存在User模型的 `myInviteCode` 字段中  
**驗證邏輯**：`User.findOne({ myInviteCode: trimmedCode })`  
**預防措施**：實現新功能前優先查看相關Service層代碼

### 🔧 控制器函數缺失問題
**問題**：路由指向不存在的控制器函數 `authController.registerWithInvite`  
**解決**：在 `auth.controller.js` 中實現完整函數包含邀請驗證和獎勵邏輯  
**預防措施**：添加路由時確保對應控制器函數已實現

### 測試賬號
```javascript
// 超級管理員
{
  username: "admin",
  email: "test@ailaborlaw.com",
  password: "Test1234"
}

// 普通管理員  
{
  username: "newadmin",
  email: "newadmin@ailaborlaw.com",
  password: "Admin1234"
}
```

## 🔄 開發進度概覽

### Phase 1: 基礎設施 ✅ 完成
- 後端API架構搭建
- 數據庫設計和模型
- 認證和權限系統
- 基礎中間件

### Phase 2: AI聊天模組 ✅ 完成  
- N8N AI服務集成
- 會話和消息管理
- 管理員監控功能
- 數據導出和統計

### Phase 3: 前端對接 🔄 進行中
- 前端開發團隊正在對接聊天模組API
- 使用真實環境數據進行開發測試
- 預計完成時間：開發中

### Phase 4: 專家諮詢模組 ✅ 後端完成
- ✅ 專家工單系統 (9個API實現)
- ✅ 劳资顾问管理系统 (11个API实现)
- ✅ 智能指派系统 (自动/手动分配)
- ✅ 認證系統整合 (移除游客支持)
- ⏸️ LINE Bot集成 (待開發)
- ⏸️ 專家評價系統 (待開發)

## 功能模塊

### 用戶端功能
1. **用戶賬戶管理**
   - 註冊/登入系統
   - 個人資料設置
   - 賬戶安全設置

2. **AI法律諮詢** ✅ 後端完成
   - 提問勞基法相關問題
   - 查看AI回答和法條引用
   - 會話管理和歷史記錄
   - 用戶反饋機制

3. **真人專家諮詢** ✅ 後端完成
   - 申請專家諮詢 ✅ API完成
   - 與專家互動 ⏸️ 待前端開發
   - 評價專家服務 ⏸️ 待開發

4. **個人資料管理**
   - 修改個人信息
   - 設置偏好
   - 管理隱私設置

5. **使用記錄與統計**
   - 查看歷史諮詢記錄
   - 管理剩餘次數
   - 查看使用統計

6. **推薦獎勵系統** ⏸️ 待開發
   - 邀請好友註冊
   - 獲取額外諮詢次數
   - 追蹤推薦狀態

### 管理後台功能
1. **仪表盘** ⏸️ 待開發
   - 系統概況
   - 關鍵指標展示
   - 數據趨勢圖表

2. **用戶管理** ✅ 完成
   - 用戶列表與搜索
   - 用戶詳情查看
   - 賬戶操作管理

3. **AI咨詢監控** ✅ 完成
   - 實時監控AI咨詢質量
   - 會話列表與搜索
   - 問答質量評估
   - 數據導出功能

4. **專家諮詢管理** ✅ 後端完成
   - 專家工單分配 ✅ API完成
   - 咨詢進度追蹤 ✅ API完成
   - 劳资顾问管理 ✅ API完成
   - 智能指派系统 ✅ API完成
   - 工作负载管理 ✅ API完成
   - 專家績效管理 ✅ 统计功能完成

5. **知識庫管理** ⏸️ 待開發
   - 法規庫管理
   - 答案模板管理
   - 內容審核與更新

6. **系統設置** ⏸️ 待開發
   - 系統參數配置
   - 用戶權限管理
   - AI設置調整

7. **統計報表** ✅ 部分完成
   - 聊天數據統計
   - 使用行為分析
   - 數據導出功能

## 使用方法

### 後端服務 (Backend Service)

本項目後端使用 Node.js 和 Express.js 框架，數據庫為 MongoDB。

**環境變量配置:**
在 `backend/` 目錄下，需要一個 `.env` 文件來配置必要的環境變量，例如：
```
NODE_ENV=development
PORT=7070 # 後端服務器運行端口
MONGODB_URI=mongodb://mongodb.mongodb.svc.cluster.local:27017/ai_labor_law_dev # MongoDB 連接字符串
JWT_SECRET=your_very_strong_jwt_secret_key # JWT 簽名密鑰
JWT_EXPIRES_IN=1d # JWT 過期時間 (例如 1天)
JWT_REFRESH_EXPIRES_IN=7d # JWT 刷新令牌過期時間 (例如 7天)
LOG_LEVEL=info

# N8N AI服務配置
N8N_BASE_URL=https://andyaiauto.zeabur.app/webhook/5cc76a7e-2e6a-4428-ba09-cbe8f8598f9b/chat
N8N_TIMEOUT=30000
N8N_MAX_RETRIES=3

# 初始管理員配置
# INITIAL_ADMIN_USERNAME=superadmin
# INITIAL_ADMIN_EMAIL=superadmin@example.com  
# INITIAL_ADMIN_PASSWORD=yourSuperSecurePassword
```

**啟動後端服務:**
1. 進入後端目錄: `cd backend`
2. 安裝依賴: `npm install`
3. 啟動開發服務器: `npm run dev` (使用nodemon)
   或者 `npm start` (用於生產環境)

後端服務默認運行在 `http://localhost:7070`。

**公網訪問:**
- 內網地址: http://ailabordevbox.ns-2rlrcc3k.svc.cluster.local:7070
- 公網地址: https://wrrfvodsaofk.sealosgzg.site

**API測試頁面:**
https://wrrfvodsaofk.sealosgzg.site/test-api

### 開發環境信息

**前端服務器**:
- 服務器名：ailaborlawuser
- 端口：3003
- 内網調試地址：http://ailaborlawuser.ns-2rlrcc3k.svc.cluster.local:3003
- 公網調試地址：https://wmdelchfajsi.sealosgzg.site

### 管理後台
管理後台提供了完整的系統管理功能，訪問路徑為：`admin.ai-labor-advisor.tw`

主要頁面包括：
- **admin-index.html**: 管理後台入口頁面，展示所有界面導航
- **admin-dashboard.html**: 儀表盤，顯示關鍵指標和統計數據
- **admin-users.html**: 用戶管理界面，包含用戶列表和篩選功能
- **admin-ai-monitor.html**: AI咨詢監控頁面，包含監控圖表和會話列表
- **admin-expert-consults.html**: 專家咨詢管理，包含工單分配功能
- **admin-knowledge.html**: 知識庫管理，包含法規庫和答案模板管理
- **admin-settings.html**: 系統設置頁面，包含通用設置和AI設置選項
- **admin-reports.html**: 統計報表頁面，包含各類數據統計與分析

### 用戶端
用戶端提供直觀的界面供用戶使用各項功能，訪問路徑為：`www.ai-labor-advisor.tw`

主要頁面包括：
- **index.html**: 網站首頁，介紹產品功能與價值
- **login.html/register.html**: 登入和註冊頁面
- **home.html**: 用戶登入後的首頁儀表盤
- **ai-chat.html**: AI諮詢聊天界面 ⭐ 正在前端開發
- **chat-history.html**: 歷史諮詢記錄頁面 ⭐ 正在前端開發
- **expert-consult.html**: 專家諮詢申請與互動界面
- **profile.html**: 個人資料管理頁面

移動端版本包括：
- **mobile-home.html**: 移動端首頁
- **mobile-ai-chat.html**: 移動端AI諮詢界面 ⭐ 正在前端開發
- **mobile-login.html/mobile-register.html**: 移動端登入和註冊界面
- **mobile-profile.html**: 移動端個人資料頁面
- **mobile-chat-history.html**: 移動端歷史記錄頁面

## 📝 重要文檔

- **API文檔**: `AI勞基法顧問聊天模組API文檔-前端對接版.md`
- **職業字段修復文檔**: `職業字段統一修復文檔.md`
- **開發計劃**: `scratchpad.md`
- **產品需求**: `PRD.md`
- **用戶故事地圖**: `User_Story_Map.md`

## 版本說明
當前版本：v1.0 (AI聊天模組完成，前端對接中)

### v1.0 - AI聊天模組完成 (2025-05-25)
- ✅ **AI聊天功能**：11個API全部實現並測試成功
- ✅ **N8N集成**：真實AI回復，包含法條引用和建議
- ✅ **管理員功能**：會話監控、統計數據、Excel導出
- ✅ **認證系統**：JWT認證、角色權限、安全中間件
- ✅ **數據管理**：MongoDB模型、數據驗證、錯誤處理
- ✅ **文檔完成**：完整API文檔提供給前端團隊
- 🔄 **前端開發**：聊天模組前端開發進行中

### v0.4 - 職業字段統一修復完成 (2025-05-24)
- 完成了所有高保真界面原型設計 (前端)
- 實現了完整的管理後台功能界面 (前端)
- **後端:**
    - 搭建了基於 Express.js 的後端服務框架 (ES 模塊)
    - 設計並實現了 MongoDB 的 `User` 模型 (包含嵌入式 `profile`)
    - 實現了用戶認證功能
    - 實現了管理員後台的用戶管理功能
    - 實現了 JWT 認證中間件增強功能
    - 職業字段統一修復，支持position和occupation向後兼容

## 📈 下一步計劃

### 短期目標 (1-2週)
- 完成聊天模組前端開發和測試
- 用戶註冊登入前端功能完成
- 整合前後端，進行端到端測試

### 中期目標 (1個月)
- 專家諮詢模組後端開發
- LINE Bot集成
- 完整的管理後台前端功能

### 長期目標 (2-3個月)
- 推薦獎勵系統
- 完整的統計報表功能
- 性能優化和安全加固
- 正式上線準備

---

**聯繫方式**: 開發團隊通過項目管理系統協作
**技術支援**: 詳見各模組API文檔和技術文檔
