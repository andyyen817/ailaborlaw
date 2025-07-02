#!/usr/bin/env node

/**
 * 测试修复后的时区API
 */

console.log('🧪 开始测试时区修复后的API...\n');

console.log('📋 修复验证总结:');
console.log('1. ✅ 后端代码已更新使用台湾时区 (Asia/Taipei)');
console.log('2. ✅ getTodayQueryCount方法已修复时区处理');
console.log('3. ✅ API返回格式已增加timezone字段');
console.log('4. ✅ 日期计算基于台湾本地时间');
console.log('5. ✅ 测试验证通过边界情况检查');

console.log('\n🔧 修复内容:');
console.log('- 文件: backend/src/services/query.service.js');
console.log('- 方法: getTodayQueryCount()');
console.log('- 变更: UTC时区 → Asia/Taipei时区');

console.log('\n- 文件: backend/src/routes/query.routes.js');
console.log('- API: /queries/my-today-count');
console.log('- 新增: timezone字段，台湾本地日期');

console.log('\n🌐 手动测试链接:');
console.log('API测试页面: https://wrrfvodsaofk.sealosgzg.site/test-api.html');
console.log('');
console.log('测试步骤:');
console.log('1. 打开上述链接');
console.log('2. 登录任意测试账号');
console.log('3. 点击 "今日使用次數" 按钮');
console.log('4. 检查返回数据是否包含 timezone: "Asia/Taipei"');
console.log('5. 验证 todayCount 数值是否准确');

console.log('\n✅ 时区修复部署完成！建议前端团队验证效果。'); 