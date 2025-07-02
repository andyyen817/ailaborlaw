# 勞法通AI後端文檔索引

## 文檔概述

此目錄包含勞法通AI項目後端開發所需的各類文檔。這些文檔涵蓋了後端架構設計、API規範、數據模型以及部署指南等內容，為開發團隊提供完整的參考資料。

## 文檔索引

### 開發計劃文檔

1. [**後端任務清單**](./backend_task_list.md) - 完整的後端開發任務清單與技術規範
2. [**開發路線圖**](./development_roadmap.md) - 後端開發的階段性計劃與里程碑
3. [**實施小任務清單**](./implementation_tasks.md) - 拆分的小任務單元與具體執行步驟
4. [**優先執行計劃**](./implementation_priority.md) - 後端開發的優先順序和實施計劃
5. [**非技術人員指南**](./non_technical_guide.md) - 針對技術小白的後端開發管理指南

### 整合與部署文檔

1. [**部署與前端整合指南**](./deployment_integration_guide.md) - 後端服務部署與前端整合步驟
2. [**前後端整合指南**](./frontend_backend_integration.md) - 詳細的前後端對接方案
3. [**前後端匹配檢查表**](./frontend_backend_compatibility.md) - 確認後端API設計與前端需求的匹配情況

### 測試與驗證

1. [**API測試檢查清單**](./api_test_checklist.md) - API功能測試的詳細檢查清單

### 其他相關文檔

1. [**後端API測試指南**](../backend_api_test_guide.md) - API測試方法與工具
2. [**認證與用戶管理任務**](../backend_tasks_auth_user_management.md) - 認證模塊與用戶管理的詳細任務
3. [**管理後台任務**](../backend_tasks_admin_management.md) - 管理後台功能的詳細任務
4. [**登入註冊任務**](../backend_tasks_login_register.md) - 登入註冊功能的詳細任務
5. [**產品需求文檔**](../PRD.md) - 專案的產品需求文檔
6. [**指標框架**](../Metrics_Framework.md) - 專案的成功指標框架
7. [**專案路線圖**](../Roadmap.md) - 整體專案的路線圖
8. [**用戶故事地圖**](../User_Story_Map.md) - 用戶故事與功能地圖

## 文檔使用指南

### 對於技術小白的文檔閱讀順序

如果您是非技術人員，建議按照以下順序閱讀文檔：

1. 首先閱讀 [非技術人員指南](./non_technical_guide.md) 了解如何管理後端開發
2. 接著查看 [優先執行計劃](./implementation_priority.md) 了解開發的分批次執行計劃
3. 然後參考 [前後端匹配檢查表](./frontend_backend_compatibility.md) 確認前後端匹配情況
4. 最後查看 [實施小任務清單](./implementation_tasks.md) 了解具體的開發任務

### 對於後端開發人員的文檔閱讀順序

如果您是後端開發人員，建議按照以下順序閱讀文檔：

1. 首先閱讀 [後端任務清單](./backend_task_list.md) 了解整體架構和需求
2. 然後查看 [開發路線圖](./development_roadmap.md) 了解當前開發階段和任務優先級
3. 接著參考 [前後端整合指南](./frontend_backend_integration.md) 了解如何與前端對接
4. 最後閱讀 [API測試檢查清單](./api_test_checklist.md) 了解如何測試和驗證API功能

### 開發工作流程

1. 參考 [後端任務清單](./backend_task_list.md) 獲取待開發功能的詳細規格
2. 根據 [優先執行計劃](./implementation_priority.md) 確認當前優先任務
3. 完成 [實施小任務清單](./implementation_tasks.md) 中的具體任務
4. 開發完成後使用 [API測試檢查清單](./api_test_checklist.md) 驗證功能
5. 部署時參考 [部署與前端整合指南](./deployment_integration_guide.md)

### 文檔更新維護

- 所有文檔應保持最新狀態，與實際開發同步更新
- 發現文檔與實現不符時，應立即更新相關文檔
- 添加新功能時，應同時更新相關文檔

## 技術棧概覽

- **後端框架**: Express.js
- **數據庫**: MongoDB
- **認證方式**: JWT (JSON Web Tokens)
- **API風格**: RESTful
- **文檔格式**: OpenAPI/Swagger
- **測試框架**: Jest
- **部署方式**: Docker, PM2

## 聯繫與支持

如有文檔相關問題，請聯繫專案經理或技術負責人。 