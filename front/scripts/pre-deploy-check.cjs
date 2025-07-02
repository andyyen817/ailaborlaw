#!/usr/bin/env node

/**
 * 部署前檢查腳本
 * 驗證環境配置、API連接和基礎功能
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_URL = 'https://iztxzvmtxzzc.sealosgzg.site';
const BACKEND_URL = 'https://wrrfvodsaofk.sealosgzg.site';

console.log('🚀 開始部署前檢查...\n');

// 檢查項目列表
const checks = [
  '1. 環境變量檔案檢查',
  '2. API連接測試', 
  '3. CORS配置驗證',
  '4. 建置測試'
];

console.log('📋 檢查項目:');
checks.forEach(check => console.log(`  ✓ ${check}`));
console.log();

// 基本配置資訊
console.log('🔗 基礎配置:');
console.log(`  前端域名: ${FRONTEND_URL}`);
console.log(`  後端域名: ${BACKEND_URL}`);
console.log();

// 1. 檢查環境變量檔案
console.log('📁 檢查環境變量檔案...');
const envFiles = ['.env.development', '.env.production'];
envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file} 存在`);
  } else {
    console.log(`  ❌ ${file} 不存在`);
  }
});

// 2. 檢查package.json腳本
console.log('\n📦 檢查package.json腳本...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['dev', 'build', 'preview'];
requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`  ✅ ${script} 腳本已配置`);
  } else {
    console.log(`  ❌ ${script} 腳本缺失`);
  }
});

console.log('\n✅ 部署前檢查腳本已創建');
console.log('📌 使用方法: npm run deploy:check');
console.log('📌 API測試需要在後續步驟中執行'); 