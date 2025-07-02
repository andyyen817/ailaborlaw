# 🚀 勞法通AI - 部署指南

## 📋 部署前准备

### 1. 环境要求
- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **服务器**: 支持静态文件托管
- **域名**: 已配置SSL证书

### 2. 构建生产版本
```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 3. 环境变量配置
创建 `.env.production` 文件：
```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_TITLE=勞法通AI
VITE_APP_VERSION=1.0.0
```

## 🔧 部署步骤

### 方式一：静态文件部署
1. 将 `dist/` 目录上传到服务器
2. 配置Web服务器指向 `dist/` 目录
3. 配置单页应用路由重定向

### 方式二：Docker部署
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 方式三：CDN部署
1. 上传 `dist/` 到CDN存储
2. 配置CDN域名和缓存策略
3. 更新DNS解析

## ⚙️ 服务器配置

### Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # 单页应用路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass https://your-api-domain.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔍 部署验证

### 1. 功能测试
- [ ] 页面正常加载
- [ ] API接口连接正常
- [ ] 用户登录功能
- [ ] 邀请功能测试
- [ ] 咨询功能测试
- [ ] 管理员功能测试

### 2. 性能测试
- [ ] 页面加载速度 < 3秒
- [ ] API响应时间 < 1秒
- [ ] 移动端适配正常
- [ ] 浏览器兼容性测试

### 3. 安全检查
- [ ] HTTPS配置正确
- [ ] API安全验证
- [ ] 用户数据保护
- [ ] XSS/CSRF防护

## 📊 监控配置

### 1. 错误监控
```javascript
// 在main.js中添加
window.addEventListener('error', (event) => {
  // 发送错误信息到监控服务
  console.error('Global error:', event.error);
});
```

### 2. 性能监控
```javascript
// 页面性能监控
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart);
});
```

## 🔄 更新部署

### 1. 版本更新流程
```bash
# 1. 拉取最新代码
git pull origin main

# 2. 安装新依赖
npm install

# 3. 构建新版本
npm run build

# 4. 备份当前版本
cp -r dist/ dist-backup-$(date +%Y%m%d)

# 5. 部署新版本
# (根据部署方式执行相应命令)
```

### 2. 回滚方案
```bash
# 快速回滚到上一版本
mv dist/ dist-failed/
mv dist-backup-latest/ dist/
```

## 🛠 故障排除

### 常见问题
1. **页面空白**: 检查路由配置和构建路径
2. **API连接失败**: 验证代理配置和CORS设置
3. **资源加载失败**: 检查静态资源路径和CDN配置
4. **登录问题**: 验证认证服务和token存储

### 调试工具
- 浏览器开发者工具
- 网络请求监控
- 服务器日志分析
- 性能分析工具

## 📞 技术支持

如遇到部署问题，请检查：
1. 服务器日志
2. 浏览器控制台错误
3. 网络连接状态
4. API服务状态

---

*部署指南版本: v1.0*  
*最后更新: 2024年12月* 