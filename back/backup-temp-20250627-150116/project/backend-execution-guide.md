# 後端 (Express) 執行指南文檔

本文檔提供了詳細的步驟，以解決依賴管理問題並改進後端項目結構。請按順序執行以下步驟。

## 1. 修復package.json依賴分類（高優先級）

### 1.1 準備工作

```bash
# 切換到後端目錄
cd /home/devbox/project/backend

# 備份當前的package.json（以防萬一）
cp package.json package.json.bak

# 檢查Node.js和npm版本
node -v
npm -v
```

### 1.2 建立依賴分類標準文檔

```bash
cat > dependency-standards.md << 'EOF'
# 依賴分類標準

## dependencies（運行時必要）
- express：Web框架
- mongoose：MongoDB連接和ODM
- bcryptjs：密碼加密
- jsonwebtoken：JWT認證
- cors：跨域資源共享
- dotenv：環境變數管理
- express-validator：請求驗證
- helmet：安全相關HTTP頭
- morgan：HTTP請求日誌
- winston：日誌系統

## devDependencies（僅開發階段需要）
- nodemon：開發時自動重啟服務
- jest：測試框架
- supertest：API測試工具
- eslint：代碼檢查
EOF
```

### 1.3 重新安裝所有依賴（確保正確分類）

```bash
# 完全刪除node_modules和package-lock.json
rm -rf node_modules package-lock.json

# 安裝核心運行時依賴到dependencies
npm install express mongoose bcryptjs jsonwebtoken cors dotenv express-validator helmet morgan winston --save

# 安裝開發工具到devDependencies
npm install nodemon jest supertest eslint --save-dev

# 檢查package.json是否正確更新
cat package.json
```

### 1.4 更新package.json中的scripts

```bash
cat > update-scripts.js << 'EOF'
const fs = require('fs');
const packageJson = require('./package.json');

// 更新scripts
packageJson.scripts = {
  ...packageJson.scripts,
  "start": "node src/app.js",
  "dev": "nodemon src/app.js",
  "test": "jest",
  "lint": "eslint src/**/*.js"
};

// 寫回package.json，格式化為美觀的JSON
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('Scripts updated successfully');
EOF

# 執行腳本更新package.json
node update-scripts.js

# 檢查結果
cat package.json
```

## 2. 測試後端是否正常工作

### 2.1 啟動後端服務

```bash
# 確保在後端目錄
cd /home/devbox/project/backend

# 啟動開發服務
npm run dev
```

### 2.2 測試關鍵API端點

在另一個終端窗口中：

```bash
# 打開新的終端，確保後端服務正在運行

# 測試用戶註冊API
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "測試用戶",
    "email": "test@example.com",
    "password": "Password123!",
    "profile": {
      "industry": "科技",
      "position": "工程師"
    }
  }'

# 測試用戶登錄API
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

如果上述測試成功，說明後端服務正常工作。記下返回的JWT令牌，用於後續測試。

## 3. 添加Docker配置

### 3.1 建立Dockerfile

```bash
# 確保在後端目錄
cd /home/devbox/project/backend

# 創建Dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

# 複製package.json和package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製源代碼
COPY . .

# 設置環境變數
ENV NODE_ENV=production
ENV PORT=3001

# 暴露端口
EXPOSE 3001

# 啟動命令
CMD ["node", "src/app.js"]
EOF
```

### 3.2 創建.dockerignore文件

```bash
cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.git
.env
.env.local
.env.development
.DS_Store
coverage
EOF
```

### 3.3 創建docker-compose.yml（僅後端服務部分）

```bash
cd /home/devbox/project

# 創建或更新docker-compose.yml（僅後端部分）
cat > docker-compose-backend.yml << 'EOF'
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: ai-labor-advisor-backend
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/ai_law_advisor
      - JWT_SECRET=Str0ngS3cr3tF0rJWT_@iL@wA4v!s0r_D3v
    depends_on:
      - mongodb
    networks:
      - app-network

  mongodb:
    image: mongo:6
    container_name: ai-labor-advisor-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mongodb_data:
    driver: local
EOF
```

### 3.4 測試Docker配置

```bash
# 在專案根目錄
cd /home/devbox/project

# 構建並啟動後端服務容器
docker-compose -f docker-compose-backend.yml build
docker-compose -f docker-compose-backend.yml up -d

# 檢查容器是否正常運行
docker ps

# 測試容器化的後端服務
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Docker測試用戶",
    "email": "docker-test@example.com",
    "password": "Password123!",
    "profile": {
      "industry": "科技",
      "position": "工程師"
    }
  }'

# 停止容器
docker-compose -f docker-compose-backend.yml down
```

## 4. 遷移到pnpm（可選）

### 4.1 安裝pnpm

```bash
# 安裝pnpm
npm install -g pnpm

# 確認安裝成功
pnpm --version
```

### 4.2 使用pnpm重新安裝依賴

```bash
# 確保在後端目錄
cd /home/devbox/project/backend

# 刪除現有node_modules和package-lock.json
rm -rf node_modules package-lock.json

# 使用pnpm安裝依賴
pnpm install

# 檢查依賴是否正確安裝
ls -la node_modules
```

### 4.3 更新package.json中的scripts以使用pnpm

```bash
cat > update-pnpm-scripts.js << 'EOF'
const fs = require('fs');
const packageJson = require('./package.json');

// 更新scripts以使用pnpm
packageJson.scripts = {
  ...packageJson.scripts,
  "dev": "pnpm exec nodemon src/app.js",
  "start": "node src/app.js",
  "test": "pnpm exec jest",
  "lint": "pnpm exec eslint src/**/*.js"
};

// 寫回package.json
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('Scripts updated for pnpm');
EOF

# 執行腳本更新package.json
node update-pnpm-scripts.js

# 檢查結果
cat package.json
```

### 4.4 測試pnpm是否正常工作

```bash
# 啟動開發服務
pnpm run dev
```

在另一個終端窗口中：

```bash
# 測試API
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### 4.5 更新Dockerfile以使用pnpm

```bash
cat > Dockerfile.pnpm << 'EOF'
FROM node:20-alpine

# 安裝pnpm
RUN npm install -g pnpm

WORKDIR /app

# 複製package.json
COPY package.json pnpm-lock.yaml* ./

# 使用pnpm安裝依賴
RUN pnpm install --prod

# 複製源代碼
COPY . .

# 設置環境變數
ENV NODE_ENV=production
ENV PORT=3001

# 暴露端口
EXPOSE 3001

# 啟動命令
CMD ["node", "src/app.js"]
EOF

# 如果對pnpm配置滿意，可以替換原來的Dockerfile
# mv Dockerfile.pnpm Dockerfile
```

## 完成後檢查清單

- [ ] package.json依賴正確分類到dependencies和devDependencies
- [ ] 後端服務能正常啟動並處理API請求
- [ ] Docker配置能正確構建並運行容器
- [ ] (可選) pnpm能正確管理依賴並運行服務

## 故障排除

如果在執行上述步驟時遇到問題，請參考以下故障排除指南：

### 依賴安裝失敗
```bash
# 清理npm緩存
npm cache clean --force

# 嘗試以verbose模式安裝以查看詳細錯誤
npm install --verbose
```

### Docker構建或運行失敗
```bash
# 檢查Docker日誌
docker logs ai-labor-advisor-backend

# 檢查Docker構建過程
docker-compose -f docker-compose-backend.yml build --no-cache
``` 