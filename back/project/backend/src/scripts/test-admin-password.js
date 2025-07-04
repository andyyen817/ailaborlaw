const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/admin.model');

/**
 * 腳本用於測試管理員密碼比對功能
 */
async function testAdminPassword() {
  try {
    // 連接數據庫 - 使用內網連接字串
    const mongoURI = 'mongodb://root:8w2kv62n@aialabr-mongodb.ns-2rlrcc3k.svc:27017';
    
    console.log(`嘗試連接到MongoDB: ${mongoURI}`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('已連接數據庫');
    
    // 獲取管理員帳戶
    const adminUser = await Admin.findOne({ username: 'admin' });
    const newadminUser = await Admin.findOne({ username: 'newadmin' });
    
    if (!adminUser || !newadminUser) {
      console.log('找不到管理員帳戶');
      await mongoose.disconnect();
      return;
    }
    
    console.log('\n=== 超級管理員 (admin) ===');
    console.log(`ID: ${adminUser._id}`);
    console.log(`用戶名: ${adminUser.username}`);
    console.log(`郵箱: ${adminUser.email}`);
    console.log(`密碼哈希: ${adminUser.password_hash}`);
    
    // 使用模型的comparePassword方法測試密碼
    console.log('\n使用模型方法測試密碼:');
    const adminPasswordValid = await adminUser.comparePassword('Test1234');
    console.log(`- comparePassword('Test1234'): ${adminPasswordValid}`);
    
    // 直接使用bcrypt比較
    console.log('\n直接使用bcrypt測試密碼:');
    const adminBcryptValid = await bcrypt.compare('Test1234', adminUser.password_hash);
    console.log(`- bcrypt.compare('Test1234', passwordHash): ${adminBcryptValid}`);
    
    // 測試錯誤的密碼
    const adminWrongPassword = await bcrypt.compare('WrongPassword', adminUser.password_hash);
    console.log(`- bcrypt.compare('WrongPassword', passwordHash): ${adminWrongPassword}`);
    
    console.log('\n=== 普通管理員 (newadmin) ===');
    console.log(`ID: ${newadminUser._id}`);
    console.log(`用戶名: ${newadminUser.username}`);
    console.log(`郵箱: ${newadminUser.email}`);
    console.log(`密碼哈希: ${newadminUser.password_hash}`);
    
    // 使用模型的comparePassword方法測試密碼
    console.log('\n使用模型方法測試密碼:');
    const newadminPasswordValid = await newadminUser.comparePassword('Admin1234');
    console.log(`- comparePassword('Admin1234'): ${newadminPasswordValid}`);
    
    // 直接使用bcrypt比較
    console.log('\n直接使用bcrypt測試密碼:');
    const newadminBcryptValid = await bcrypt.compare('Admin1234', newadminUser.password_hash);
    console.log(`- bcrypt.compare('Admin1234', passwordHash): ${newadminBcryptValid}`);
    
    // 斷開數據庫連接
    await mongoose.disconnect();
    console.log('\n已斷開數據庫連接');
  } catch (error) {
    console.error('測試密碼時出錯:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

// 執行腳本
testAdminPassword(); 