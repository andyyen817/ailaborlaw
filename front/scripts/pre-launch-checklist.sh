#!/bin/bash
# 🚀 MVP上线前检查脚本

echo "🚀 开始MVP上线前检查..."
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查函数
check_passed() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_failed() {
    echo -e "${RED}❌ $1${NC}"
}

check_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

check_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 计数器
total_checks=0
passed_checks=0

# 检查函数
run_check() {
    total_checks=$((total_checks + 1))
    if eval "$2"; then
        check_passed "$1"
        passed_checks=$((passed_checks + 1))
        return 0
    else
        check_failed "$1"
        return 1
    fi
}

echo -e "${BLUE}📋 1. 项目文件结构检查${NC}"
echo "================================"

# 检查关键文件是否存在
run_check "package.json存在" "[ -f package.json ]"
run_check "vite.config.js存在" "[ -f vite.config.js ]"
run_check "主应用文件存在" "[ -f src/main.js ]"
run_check "App.vue存在" "[ -f src/App.vue ]"

echo -e "\n${BLUE}📋 2. 核心服务文件检查${NC}"
echo "================================"

# 检查服务文件
run_check "邀请服务存在" "[ -f src/services/inviteService.js ]"
run_check "用户服务存在" "[ -f src/services/userService.js ]"
run_check "认证服务存在" "[ -f src/services/auth.js ]"
run_check "系统设置服务存在" "[ -f src/services/systemSettingsService.js ]"

echo -e "\n${BLUE}📋 3. 页面组件检查${NC}"
echo "================================"

# 检查页面文件
run_check "聊天页面存在" "[ -f src/views/ChatView.vue ]"
run_check "邀请页面存在" "[ -f src/views/InviteFriendsView.vue ]"
run_check "个人资料页面存在" "[ -f src/views/ProfileView.vue ]"
run_check "咨询记录页面存在" "[ -f src/views/QueryRecordsView.vue ]"
run_check "管理员仪表板存在" "[ -f src/views/admin/AdminDashboardView.vue ]"
run_check "邀请管理页面存在" "[ -f src/views/admin/InviteManagementView.vue ]"

echo -e "\n${BLUE}📋 4. 组件检查${NC}"
echo "================================"

# 检查组件文件
run_check "邀请成就组件存在" "[ -f src/components/invite/InviteAchievements.vue ]"
run_check "数据统计组件存在" "[ -f src/components/dashboard/DataStatistics.vue ]"
run_check "咨询次数不足弹窗存在" "[ -f src/components/modals/InsufficientQueriesModal.vue ]"

echo -e "\n${BLUE}📋 5. 路由配置检查${NC}"
echo "================================"

run_check "路由配置文件存在" "[ -f src/router/routes.js ]"
run_check "路由入口文件存在" "[ -f src/router/index.js ]"

echo -e "\n${BLUE}📋 6. 测试文件检查${NC}"
echo "================================"

run_check "集成测试清单存在" "[ -f src/tests/integration-test-checklist.md ]"
run_check "测试页面存在" "[ -f src/views/TestView.vue ]"
run_check "测试脚本存在" "[ -f src/tests/test-runner.js ]"

echo -e "\n${BLUE}📋 7. 依赖检查${NC}"
echo "================================"

# 检查依赖是否安装
if [ -d "node_modules" ]; then
    check_passed "node_modules文件夹存在"
    ((passed_checks++))
else
    check_failed "node_modules文件夹不存在"
fi
((total_checks++))

# 检查package-lock.json
run_check "package-lock.json存在" "[ -f package-lock.json ]"

echo -e "\n${BLUE}📋 8. 开发服务器检查${NC}"
echo "================================"

# 检查服务器是否运行
if curl -s http://localhost:3032 > /dev/null; then
    check_passed "开发服务器运行正常"
    ((passed_checks++))
else
    check_failed "开发服务器未运行或无法访问"
fi
((total_checks++))

# 检查测试页面
if curl -s http://localhost:3032/test > /dev/null; then
    check_passed "测试页面可访问"
    ((passed_checks++))
else
    check_failed "测试页面无法访问"
fi
((total_checks++))

echo -e "\n${BLUE}📋 9. 代码质量检查${NC}"
echo "================================"

# 简单的代码质量检查
if grep -r "console.log" src/ --include="*.vue" --include="*.js" > /dev/null; then
    check_warning "发现console.log语句，建议在生产环境移除"
else
    check_passed "未发现多余的console.log语句"
    ((passed_checks++))
fi
((total_checks++))

# 检查TODO注释
if grep -r "TODO\|FIXME\|XXX" src/ --include="*.vue" --include="*.js" > /dev/null; then
    check_warning "发现TODO/FIXME注释，建议处理完成"
else
    check_passed "未发现待处理的TODO注释"
    ((passed_checks++))
fi
((total_checks++))

echo -e "\n${BLUE}📋 10. 配置文件检查${NC}"
echo "================================"

# 检查vite配置
if grep -q "port.*3032" vite.config.js; then
    check_passed "Vite端口配置正确"
    ((passed_checks++))
else
    check_warning "Vite端口配置可能有问题"
fi
((total_checks++))

# 检查代理配置
if grep -q "proxy" vite.config.js; then
    check_passed "API代理配置存在"
    ((passed_checks++))
else
    check_failed "API代理配置不存在"
fi
((total_checks++))

echo -e "\n${GREEN}📊 检查结果汇总${NC}"
echo "================================"
echo -e "总检查项: ${BLUE}$total_checks${NC}"
echo -e "通过: ${GREEN}$passed_checks${NC}"
echo -e "失败: ${RED}$((total_checks - passed_checks))${NC}"

# 计算通过率
pass_rate=$(( passed_checks * 100 / total_checks ))
echo -e "通过率: ${GREEN}$pass_rate%${NC}"

if [ $pass_rate -ge 90 ]; then
    echo -e "\n${GREEN}🎉 检查结果良好，可以准备上线！${NC}"
    exit 0
elif [ $pass_rate -ge 80 ]; then
    echo -e "\n${YELLOW}⚠️  检查结果尚可，建议修复失败项后再上线${NC}"
    exit 1
else
    echo -e "\n${RED}❌ 检查结果不佳，请修复问题后重新检查${NC}"
    exit 2
fi 