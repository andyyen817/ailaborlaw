# 前端 (Vue) 執行指南文檔

本文檔提供了詳細的步驟，以解決依賴管理問題並改進前端項目結構。請按順序執行以下步驟。

## 1. 修復package.json依賴分類（高優先級）

### 1.1 準備工作

```bash
# 切換到前端目錄
cd /home/devbox/project/frontend

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
- vue: Vue核心框架
- vue-router: 路由管理
- pinia: 狀態管理
- axios: HTTP請求客戶端
- element-plus: UI組件庫
- @element-plus/icons-vue: Element Plus圖標
- lodash: 實用工具函數庫

## devDependencies（僅開發階段需要）
- vite: 開發服務器和構建工具
- @vitejs/plugin-vue: Vue插件
- @vue/test-utils: Vue測試工具
- vitest: 測試框架
- eslint: 代碼檢查
- prettier: 代碼格式化
- sass: SCSS預處理器
- unplugin-auto-import: 自動導入API
- unplugin-vue-components: 自動導入組件
EOF
```

### 1.3 重新安裝所有依賴（確保正確分類）

```bash
# 完全刪除node_modules和package-lock.json
rm -rf node_modules package-lock.json

# 安裝核心運行時依賴到dependencies
npm install vue vue-router pinia axios element-plus @element-plus/icons-vue lodash --save

# 安裝開發工具到devDependencies
npm install vite @vitejs/plugin-vue @vue/test-utils vitest eslint prettier sass unplugin-auto-import unplugin-vue-components --save-dev

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
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest",
  "lint": "eslint --ext .js,.vue src",
  "format": "prettier --write \"src/**/*.{js,vue}\""
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

## 2. 測試前端是否正常工作

### 2.1 確保環境配置正確

```bash
# 創建或更新.env文件，設置API基礎URL
cat > .env << 'EOF'
VITE_API_BASE_URL=http://localhost:3001/api/v1
EOF

# 檢查vite.config.js，確保配置正確
cat vite.config.js
```

如果vite.config.js不存在或需要更新，請創建或更新：

```bash
cat > vite.config.js << 'EOF'
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { fileURLToPath, URL } from 'url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  
  return {
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: ['vue', 'vue-router', 'pinia']
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 8080,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  };
});
EOF
```

### 2.2 啟動前端服務

```bash
# 確保在前端目錄
cd /home/devbox/project/frontend

# 啟動開發服務
npm run dev
```

服務應該會在http://localhost:8080啟動。在瀏覽器中打開並測試基本功能（登錄、註冊等）。

## 3. 添加Docker配置

### 3.1 建立Dockerfile

```bash
# 確保在前端目錄
cd /home/devbox/project/frontend

# 創建Dockerfile
cat > Dockerfile << 'EOF'
# 構建階段
FROM node:20-alpine as build-stage

WORKDIR /app

# 複製package.json和package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm ci

# 複製項目文件
COPY . .

# 構建應用
RUN npm run build

# 生產階段
FROM nginx:stable-alpine as production-stage

# 從構建階段複製構建結果到nginx html目錄
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 複製nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 啟動nginx
CMD ["nginx", "-g", "daemon off;"]
EOF
```

### 3.2 創建nginx配置文件

```bash
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    
    # gzip配置
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # 根目錄配置
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API代理配置（實際部署時調整為後端服務的URL）
    location /api/v1 {
        proxy_pass http://backend:3001/api/v1;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

### 3.3 創建.dockerignore文件

```bash
cat > .dockerignore << 'EOF'
node_modules
dist
.git
.gitignore
README.md
.env.local
.env.*.local
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*
tests
.editorconfig
.eslintrc.js
.prettierrc
EOF
```

### 3.4 創建docker-compose.yml（僅前端服務部分）

```bash
cd /home/devbox/project

# 創建或更新docker-compose.yml（僅前端部分）
cat > docker-compose-frontend.yml << 'EOF'
version: '3.8'

services:
  frontend:
    build: ./frontend
    container_name: ai-labor-advisor-frontend
    restart: unless-stopped
    ports:
      - "8080:80"
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    external: true
EOF
```

### 3.5 測試Docker配置

```bash
# 在專案根目錄
cd /home/devbox/project

# 構建並啟動前端服務容器
docker-compose -f docker-compose-frontend.yml build
docker-compose -f docker-compose-frontend.yml up -d

# 檢查容器是否正常運行
docker ps

# 測試：在瀏覽器中打開http://localhost:8080

# 停止容器
docker-compose -f docker-compose-frontend.yml down
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
# 確保在前端目錄
cd /home/devbox/project/frontend

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
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest",
  "lint": "eslint --ext .js,.vue src",
  "format": "prettier --write \"src/**/*.{js,vue}\""
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

### 4.5 更新Dockerfile以使用pnpm

```bash
cat > Dockerfile.pnpm << 'EOF'
# 構建階段
FROM node:20-alpine as build-stage

# 安裝pnpm
RUN npm install -g pnpm

WORKDIR /app

# 複製package.json
COPY package.json pnpm-lock.yaml* ./

# 使用pnpm安裝依賴
RUN pnpm install

# 複製項目文件
COPY . .

# 構建應用
RUN pnpm run build

# 生產階段
FROM nginx:stable-alpine as production-stage

# 從構建階段複製構建結果到nginx html目錄
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 複製nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

# 如果對pnpm配置滿意，可以替換原來的Dockerfile
# mv Dockerfile.pnpm Dockerfile
```

## 5. 整合前後端 (完整的docker-compose配置)

在確認前後端的Docker配置都正常工作後，可以創建一個完整的docker-compose.yml，整合前後端服務和MongoDB：

```bash
cd /home/devbox/project

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  frontend:
    build: ./frontend
    container_name: ai-labor-advisor-frontend
    restart: unless-stopped
    ports:
      - "8080:80"
    depends_on:
      - backend
    networks:
      - app-network

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

## 完成後檢查清單

- [ ] package.json依賴正確分類到dependencies和devDependencies
- [ ] 前端服務能正常啟動並連接到後端API
- [ ] Docker配置能正確構建並運行容器
- [ ] (可選) pnpm能正確管理依賴並運行服務
- [ ] 完整的docker-compose.yml能夠啟動整個項目（前端、後端和MongoDB）

## 故障排除

如果在執行上述步驟時遇到問題，請參考以下故障排除指南：

### 依賴安裝失敗
```bash
# 清理npm緩存
npm cache clean --force

# 嘗試以verbose模式安裝以查看詳細錯誤
npm install --verbose
```

### 前端構建或運行失敗
```bash
# 檢查Node.js版本
node -v

# 確認vite配置
cat vite.config.js

# 檢查環境變數
cat .env
```

### Docker構建或運行失敗
```bash
# 檢查Docker日誌
docker logs ai-labor-advisor-frontend

# 檢查Docker構建過程
docker-compose -f docker-compose-frontend.yml build --no-cache
``` 