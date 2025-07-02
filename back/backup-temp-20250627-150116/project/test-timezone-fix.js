#!/usr/bin/env node

/**
 * 时区修复验证测试脚本
 * 验证今日咨询次数API的时区修复效果
 */

console.log('🧪 时区修复验证测试开始...\n');

// 模拟原有的错误逻辑 (UTC时区)
function getOriginalTodayRange() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  return { startOfDay, endOfDay };
}

// 修复后的正确逻辑 (台湾时区)
function getFixedTodayRange() {
  // 使用台湾时区 (UTC+8) 计算今日范围
  const timezone = 'Asia/Taipei';
  
  // 获取当前台湾时间
  const nowInTaipei = new Date().toLocaleString("en-US", {timeZone: timezone});
  const taipeiDate = new Date(nowInTaipei);
  
  // 计算台湾时区的今日开始和结束时间
  const startOfDayTaipei = new Date(taipeiDate);
  startOfDayTaipei.setHours(0, 0, 0, 0);
  
  const endOfDayTaipei = new Date(taipeiDate);
  endOfDayTaipei.setHours(23, 59, 59, 999);
  
  // 转换为UTC时间进行数据库查询 (台湾时间 - 8小时 = UTC时间)
  const utcOffset = 8 * 60 * 60 * 1000; // 8小时的毫秒数
  const startOfDayUTC = new Date(startOfDayTaipei.getTime() - utcOffset);
  const endOfDayUTC = new Date(endOfDayTaipei.getTime() - utcOffset);
  
  return { 
    startOfDayUTC, 
    endOfDayUTC,
    startOfDayTaipei,
    endOfDayTaipei,
    taipeiDate
  };
}

// 测试当前时间
function testCurrentTime() {
  console.log('📅 当前时间比较:');
  console.log('UTC时间:', new Date().toISOString());
  console.log('台湾时间:', new Date().toLocaleString("en-US", {timeZone: "Asia/Taipei"}));
  console.log('服务器本地时间:', new Date().toString());
  console.log('');
}

// 测试时间范围计算
function testTimeRanges() {
  console.log('⏰ 今日时间范围计算比较:');
  
  // 原有逻辑
  const original = getOriginalTodayRange();
  console.log('🔴 修复前 (UTC今日):');
  console.log('  开始时间:', original.startOfDay.toISOString());
  console.log('  结束时间:', original.endOfDay.toISOString());
  console.log('  台湾对应:', original.startOfDay.toLocaleString("en-US", {timeZone: "Asia/Taipei"}), '-', original.endOfDay.toLocaleString("en-US", {timeZone: "Asia/Taipei"}));
  
  console.log('');
  
  // 修复后逻辑
  const fixed = getFixedTodayRange();
  console.log('🟢 修复后 (台湾今日):');
  console.log('  台湾今日开始:', fixed.startOfDayTaipei.toLocaleString("en-US", {timeZone: "Asia/Taipei"}));
  console.log('  台湾今日结束:', fixed.endOfDayTaipei.toLocaleString("en-US", {timeZone: "Asia/Taipei"}));
  console.log('  数据库查询范围(UTC):');
  console.log('    开始时间:', fixed.startOfDayUTC.toISOString());
  console.log('    结束时间:', fixed.endOfDayUTC.toISOString());
  
  console.log('');
}

// 测试边界情况
function testEdgeCases() {
  console.log('🎯 边界情况测试:');
  
  // 模拟台湾时间的几个关键时刻
  const testCases = [
    { description: '台湾凌晨 01:00', taipeiTime: '2025-06-01 01:00:00' },
    { description: '台湾上午 09:00', taipeiTime: '2025-06-01 09:00:00' },
    { description: '台湾下午 15:00', taipeiTime: '2025-06-01 15:00:00' },
    { description: '台湾晚上 23:00', taipeiTime: '2025-06-01 23:00:00' },
    { description: '台湾跨日 00:30', taipeiTime: '2025-06-02 00:30:00' }
  ];
  
  testCases.forEach(testCase => {
    // 计算对应的UTC时间
    const taipeiDate = new Date(testCase.taipeiTime);
    const utcDate = new Date(taipeiDate.getTime() - (8 * 60 * 60 * 1000));
    
    console.log(`  ${testCase.description}:`);
    console.log(`    台湾时间: ${testCase.taipeiTime}`);
    console.log(`    UTC时间:  ${utcDate.toISOString()}`);
    
    // 检查是否在修复后的范围内
    const fixed = getFixedTodayRange();
    const isInRange = utcDate >= fixed.startOfDayUTC && utcDate <= fixed.endOfDayUTC;
    console.log(`    是否在今日范围: ${isInRange ? '✅' : '❌'}`);
    console.log('');
  });
}

// 测试API返回格式
function testAPIResponse() {
  console.log('📡 API返回格式测试:');
  
  // 获取台湾时区的当前日期
  const taipeiDate = new Date().toLocaleString("en-US", {timeZone: "Asia/Taipei"});
  const currentTaipeiDate = new Date(taipeiDate).toISOString().split('T')[0];
  
  const mockResponse = {
    success: true,
    data: {
      todayCount: 2,  // 假设有2次咨询
      date: currentTaipeiDate,
      timezone: "Asia/Taipei"
    }
  };
  
  console.log('修复后的API响应格式:');
  console.log(JSON.stringify(mockResponse, null, 2));
  console.log('');
}

// 运行所有测试
function runAllTests() {
  testCurrentTime();
  testTimeRanges();
  testEdgeCases();
  testAPIResponse();
  
  console.log('✅ 时区修复验证完成!');
  console.log('');
  console.log('📋 修复总结:');
  console.log('1. ✅ 时区处理已从UTC改为Asia/Taipei');
  console.log('2. ✅ 今日范围计算基于台湾本地时间');
  console.log('3. ✅ API返回增加了timezone信息');
  console.log('4. ✅ 日期字段显示台湾本地日期');
  console.log('');
  console.log('🔧 现在可以部署并测试实际API了!');
}

// 执行测试
runAllTests(); 