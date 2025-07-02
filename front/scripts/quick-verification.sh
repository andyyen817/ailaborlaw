#!/bin/bash
# 🚀 快速上线前验证脚本

echo "🔍 勞法通AI - 快速验证检查"
echo "================================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 计数器
total_checks=0
passed_checks=0

function check_endpoint() {
    local url=$1
    local name=$2
    total_checks=$((total_checks + 1))
    
    if curl -s "$url" | grep -q "<!DOCTYPE html>"; then
        echo -e "${GREEN}✅ $name${NC}"
        passed_checks=$((passed_checks + 1))
    else
        echo -e "${RED}❌ $name${NC}"
    fi
}

echo -e "${BLUE}1. 关键页面验证${NC}"
echo "--------------------------------"
check_endpoint "http://localhost:3032" "主页"
check_endpoint "http://localhost:3032/login" "用户登录"
check_endpoint "http://localhost:3032/register" "用户注册"
check_endpoint "http://localhost:3032/admin/login" "管理员登录"
check_endpoint "http://localhost:3032/test" "测试页面"
check_endpoint "http://localhost:3032/chat" "聊天页面"
check_endpoint "http://localhost:3032/invite" "邀请页面"

echo ""
echo -e "${BLUE}2. 服务状态验证${NC}"
echo "--------------------------------"
total_checks=$((total_checks + 1))
if pgrep -f "vite" > /dev/null; then
    echo -e "${GREEN}✅ Vite服务运行中${NC}"
    passed_checks=$((passed_checks + 1))
else
    echo -e "${RED}❌ Vite服务未运行${NC}"
fi

total_checks=$((total_checks + 1))
if ss -tlnp 2>/dev/null | grep :3032 > /dev/null || netstat -tlnp 2>/dev/null | grep :3032 > /dev/null; then
    echo -e "${GREEN}✅ 端口3032监听正常${NC}"
    passed_checks=$((passed_checks + 1))
else
    echo -e "${RED}❌ 端口3032未监听${NC}"
fi

echo ""
echo -e "${BLUE}3. 关键文件验证${NC}"
echo "--------------------------------"
critical_files=(
    "src/views/auth/LoginView.vue:用户登录页面"
    "src/views/admin/AdminLoginView.vue:管理员登录页面"
    "src/views/TestView.vue:测试页面"
    "src/router/routes.js:路由配置"
    "src/views/NotFoundView.vue:404页面"
)

for file_info in "${critical_files[@]}"; do
    IFS=":" read -r file desc <<< "$file_info"
    total_checks=$((total_checks + 1))
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $desc${NC}"
        passed_checks=$((passed_checks + 1))
    else
        echo -e "${RED}❌ $desc 缺失${NC}"
    fi
done

echo ""
echo "================================"
echo -e "${BLUE}验证结果汇总${NC}"
echo "================================"
echo "总检查项: $total_checks"
echo "通过项: $passed_checks"
echo "失败项: $((total_checks - passed_checks))"

pass_rate=$((passed_checks * 100 / total_checks))
echo "通过率: ${pass_rate}%"

if [ $pass_rate -ge 90 ]; then
    echo -e "${GREEN}🎉 验证通过！系统状态良好，可以开始测试${NC}"
    echo ""
    echo "下一步操作:"
    echo "1. 打开浏览器访问: http://localhost:3032"
    echo "2. 测试用户登录: http://localhost:3032/login"
    echo "3. 测试管理员登录: http://localhost:3032/admin/login (test@ailaborlaw.com / Test1234)"
    echo "4. 运行自动化测试: http://localhost:3032/test"
elif [ $pass_rate -ge 70 ]; then
    echo -e "${YELLOW}⚠️  验证部分通过，建议修复后再测试${NC}"
else
    echo -e "${RED}❌ 验证失败，需要修复关键问题${NC}"
fi

echo ""
echo "详细测试指南请参考: TESTING_GUIDE.md" 