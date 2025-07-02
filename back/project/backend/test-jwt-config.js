/**
 * 測試JWT配置
 * 這個腳本用於檢查JWT配置是否正確
 * 執行方式: node test-jwt-config.js
 */

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// 加載環境變量
dotenv.config();

// 設置默認的JWT密鑰（如果環境變量中沒有）
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'ailabor_super_secret_key_for_development_only';
  console.log('警告: 使用默認的JWT密鑰，生產環境中請設置強密鑰！');
} else {
  console.log('已設置JWT_SECRET環境變量。');
}

// 顯示JWT配置
console.log('JWT配置信息:');
console.log('- JWT_SECRET: ' + (process.env.JWT_SECRET ? '已設置' : '未設置'));
console.log('- JWT_EXPIRES_IN: ' + (process.env.JWT_EXPIRES_IN || '1d'));
console.log('- JWT_REFRESH_EXPIRES_IN: ' + (process.env.JWT_REFRESH_EXPIRES_IN || '7d'));

// 測試JWT令牌生成
try {
  const payload = {
    id: 'test-user-id',
    role: 'admin',
    type: 'test'
  };
  
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
  
  console.log('\nJWT令牌測試:');
  console.log('- 生成令牌: 成功');
  
  // 驗證令牌
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('- 驗證令牌: 成功');
  console.log('- 解碼payload:', decoded);
  
  console.log('\nJWT配置測試通過！');
} catch (error) {
  console.error('\nJWT令牌測試失敗:');
  console.error(error.message);
  console.error('請檢查JWT_SECRET設置。');
} 