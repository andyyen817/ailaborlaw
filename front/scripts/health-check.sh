#!/bin/bash
# 🔍 应用健康检查脚本

echo "🔍 开始应用健康检查..."
echo "================================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查服务器状态
echo -e "${BLUE}1. 检查开发服务器状态${NC}"
if curl -s http://localhost:3032 > /dev/null; then
    echo -e "${GREEN}✅ 开发服务器运行正常${NC}"
else
    echo -e "${RED}❌ 开发服务器无法访问${NC}"
    exit 1
fi

# 检查关键页面
echo -e "\n${BLUE}2. 检查关键页面访问${NC}"

pages=(
    "/chat"
    "/invite" 
    "/profile"
    "/records"
    "/admin/login"
    "/test"
)

for page in "${pages[@]}"; do
    if curl -s "http://localhost:3032$page" | grep -q "<!DOCTYPE html>"; then
        echo -e "${GREEN}✅ $page 可访问${NC}"
    else
        echo -e "${RED}❌ $page 无法访问${NC}"
    fi
done

# 检查进程状态
echo -e "\n${BLUE}3. 检查进程状态${NC}"
if pgrep -f "vite" > /dev/null; then
    echo -e "${GREEN}✅ Vite进程运行正常${NC}"
    echo "进程信息:"
    ps aux | grep vite | grep -v grep | head -3
else
    echo -e "${RED}❌ Vite进程未运行${NC}"
fi

# 检查端口占用
echo -e "\n${BLUE}4. 检查端口状态${NC}"
if ss -tlnp 2>/dev/null | grep :3032 > /dev/null || netstat -tlnp 2>/dev/null | grep :3032 > /dev/null; then
    echo -e "${GREEN}✅ 端口3032正在监听${NC}"
else
    echo -e "${YELLOW}⚠️  端口3032状态未知${NC}"
fi

# 检查项目文件
echo -e "\n${BLUE}5. 检查关键文件${NC}"
critical_files=(
    "src/views/ChatView.vue"
    "src/views/InviteFriendsView.vue"
    "src/views/ProfileView.vue"
    "src/views/TestView.vue"
    "src/router/routes.js"
    "package.json"
)

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file 存在${NC}"
    else
        echo -e "${RED}❌ $file 缺失${NC}"
    fi
done

echo -e "\n${GREEN}🎉 健康检查完成！${NC}"
echo "现在可以在浏览器中访问: http://localhost:3032"
echo "测试页面: http://localhost:3032/test" 