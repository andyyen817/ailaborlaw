import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/admin.model.js';
import connectDatabase from '../config/database.js';

// 加載環境變量
dotenv.config();

/**
 * 創建管理員賬戶腳本
 * 用法: node src/scripts/create-admin.js
 */
async function createAdmin() {
  try {
    // 連接數據庫
    await connectDatabase();
    console.log('已連接數據庫');

    // 檢查是否已存在相同郵箱的管理員
    const existingAdmin = await Admin.findOne({ email: 'test@ailaborlaw.com' });
    if (existingAdmin) {
      console.log('管理員賬戶已存在:', existingAdmin.email);
      console.log('如需重置密碼，請使用更新腳本');
      await mongoose.disconnect();
      return;
    }

    // 創建新管理員
    const admin = new Admin({
      username: 'testadmin',
      email: 'test@ailaborlaw.com',
      password: 'Test1234',  // 虛擬屬性會處理密碼哈希
      role: 'admin',
      status: 'active'
    });

    await admin.save();
    console.log('管理員賬戶創建成功:');
    console.log('郵箱:', admin.email);
    console.log('用戶名:', admin.username);
    console.log('角色:', admin.role);

    // 斷開數據庫連接
    await mongoose.disconnect();
    console.log('已斷開數據庫連接');
  } catch (error) {
    console.error('創建管理員賬戶時出錯:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// 執行腳本
createAdmin(); 