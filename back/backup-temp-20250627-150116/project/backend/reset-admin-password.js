/**
 * 重置管理員密碼腳本
 * 這個腳本用於重置或創建超級管理員賬戶
 * 執行方式: node reset-admin-password.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from './src/models/admin.model.js';
import dotenv from 'dotenv';

// 加載環境變量
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function resetAdminPassword() {
  try {
    console.log(`嘗試連接到MongoDB: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB連接成功');

    // 🔧 修改：设置超级管理员密码为 Test1234
    const newPassword = 'Test1234';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 🔧 修正：更新password_hash字段而不是password字段
    const result = await Admin.updateOne(
      { email: 'test@ailaborlaw.com' },
      { password_hash: hashedPassword }
    );

    if (result.modifiedCount > 0) {
      console.log(`已更新超级管理員密碼: admin (test@ailaborlaw.com)`);
      console.log(`新密碼: ${newPassword}`);
      console.log(`密碼哈希: ${hashedPassword}`);
    } else {
      console.log('未找到需要更新的管理員');
    }

    console.log('操作完成，數據庫連接已關閉');
  } catch (error) {
    console.error('操作失敗:', error);
  } finally {
    await mongoose.disconnect();
  }
}

resetAdminPassword(); 