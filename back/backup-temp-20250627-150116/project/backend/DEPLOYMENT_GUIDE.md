# 🚀 AI劳基法顾问项目部署指南

## 📋 环境变量配置

### 🔧 必须配置的环境变量

#### 1. 前端URL配置
```bash
# 开发环境
FRONTEND_URL=http://localhost:3000

# 生产环境 (请替换为实际的前端域名)
FRONTEND_URL=https://your-frontend-domain.com
```

**重要说明**：
- 邀请链接将使用此URL生成
- 上线前必须修改为实际的前端域名
- 影响功能：邀请码分享、注册链接

#### 2. 其他重要环境变量
```bash
# 数据库连接
MONGODB_URI=mongodb://localhost:27017/ailaborlaw

# 服务器端口
PORT=7070

# 环境类型
NODE_ENV=production
```

## 🛠️ 部署步骤

### Sealos DevBox 环境配置

1. **设置环境变量**：
   ```bash
   # 在Sealos DevBox中设置
   export FRONTEND_URL=https://your-actual-frontend-domain.com
   export NODE_ENV=production
   ```

2. **永久设置环境变量**：
   ```bash
   # 创建.env文件
   echo "FRONTEND_URL=https://your-actual-frontend-domain.com" > .env
   echo "NODE_ENV=production" >> .env
   ```

3. **重启服务器**：
   ```bash
   # 重启后新环境变量生效
   npm run start
   ```

## 🔍 验证配置

### 测试邀请URL是否正确
1. 登录API测试页面
2. 调用"获取我的邀请码"API
3. 检查返回的`inviteUrl`字段
4. 确认URL使用的是正确的前端域名

### 期望结果
```json
{
  "success": true,
  "data": {
    "inviteCode": "ABCD1234",
    "userName": "用户名",
    "inviteUrl": "https://your-actual-frontend-domain.com/register?invite=ABCD1234"
  }
}
```

## ⚠️ 注意事项

1. **安全性**：
   - 生产环境不要使用默认的JWT密钥
   - 确保CORS配置正确

2. **监控**：
   - 部署后验证所有邀请链接正常工作
   - 监控邀请注册流程

3. **备份**：
   - 确保有环境变量的备份
   - 记录所有配置更改

## 📞 问题排查

### 常见问题

**问题1：邀请链接还是显示localhost**
- 解决：检查FRONTEND_URL环境变量是否正确设置
- 验证：`echo $FRONTEND_URL`

**问题2：注册页面无法访问**
- 解决：确认前端域名正确且可访问
- 验证：在浏览器中访问前端域名

**问题3：CORS错误**
- 解决：确保前端域名也添加到CORS配置中
- 检查：`src/config/app.js`中的CORS设置 